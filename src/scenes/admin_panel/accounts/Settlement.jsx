import React, { useEffect, useMemo, useState } from "react";
import {
	Alert,
	Autocomplete,
	Box,
	Button,
	Card,
	CardContent,
	Checkbox,
	CircularProgress,
	Divider,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	Tab,
	Tabs,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Typography,
	useTheme,
	Paper,
	Stack,
} from "@mui/material";
import { tokens } from "../../../theme";
import { getAllShops } from "../../../api/controller/admin_controller/shop/shop_controller.jsx";
import { getShopOrder } from "../../../api/controller/admin_controller/order/order_controller.jsx";
import { getBankAccount, settleAmountToSeller } from "../../../api/controller/admin_controller/transaction/transaction_controller.jsx";

const safeArray = (x) => (Array.isArray(x) ? x : []);

const normalizeList = (x) => {
	if (!x) return [];
	if (Array.isArray(x)) return x;
	if (Array.isArray(x?.data)) return x.data;
	if (Array.isArray(x?.data?.data)) return x.data.data;
	if (Array.isArray(x?.data?.data?.data)) return x.data.data.data;
	const inner = x?.data ?? x;
	if (inner && typeof inner === "object") return [inner];
	return [];
};

const getRowId = (row, idx) =>
	String(row?.id ?? row?.order_item_id ?? row?.order_id ?? row?.order?.id ?? idx);

const Settlement = () => {
	const theme = useTheme();
	const colors = tokens(theme.palette.mode);

	const [shops, setShops] = useState([]);
	const [shopLoading, setShopLoading] = useState(false);
	const [shopQuery, setShopQuery] = useState("");
	const [selectedShop, setSelectedShop] = useState(null);

	const [orders, setOrders] = useState([]);
	const [ordersLoading, setOrdersLoading] = useState(false);
	const [ordersError, setOrdersError] = useState("");

	const [selectedIds, setSelectedIds] = useState([]);

	const [accounts, setAccounts] = useState([]);
	const [accountLoading, setAccountLoading] = useState(false);
	const [selectedAccountId, setSelectedAccountId] = useState("");
	const [settleLoading, setSettleLoading] = useState(false);
	const [settleError, setSettleError] = useState("");
	const [settleSuccess, setSettleSuccess] = useState("");
	const [tabIndex, setTabIndex] = useState(0);

	const [message, setMessage] = useState("");

	const formatCurrency = (amount) =>
		new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(Number(amount || 0));

	const formatDate = (dateString) =>
		dateString
			? new Date(dateString).toLocaleDateString("en-BD", {
					year: "numeric",
					month: "short",
					day: "numeric",
				})
			: "-";

	const getStatusColor = (status) => {
		const value = String(status || "").toLowerCase();
		if (value === "pending") return "warning";
		if (value === "completed" || value === "delivered") return "success";
		if (value === "cancelled") return "error";
		if (value === "on the way") return "info";
		return "default";
	};

	const getPaymentStatusColor = (status) => {
		const value = String(status || "").toLowerCase();
		if (value === "paid") return "success";
		if (value === "unpaid") return "error";
		if (value === "pending") return "warning";
		if (value === "refunded") return "info";
		return "default";
	};

	const getRowAmount = (row) =>
		Number(row?.line_total ?? row?.order?.total ?? row?.total ?? 0);

	const isSettled = (row) => {
		const raw = row?.is_settle_with_seller ?? row?.is_settled ?? row?.is_settle ?? 0;
		const value = String(raw).toLowerCase();
		return value === "1" || value === "true";
	};

	const loadShops = async (query = "") => {
		setShopLoading(true);
		try {
			const res = await getAllShops({ page: 1, per_page: 50, search: query });
			const list = normalizeList(res?.data ?? res);
			setShops(list);
		} catch (e) {
			console.error("Failed to load shops", e);
			setShops([]);
		} finally {
			setShopLoading(false);
		}
	};

	const loadOrders = async (shopId) => {
		if (!shopId) {
			setOrders([]);
			return;
		}

		setOrdersLoading(true);
		setOrdersError("");
		try {
			const res = await getShopOrder(shopId, { page: 1, per_page: 200 });
			const payload = res?.data ?? {};
			const list = safeArray(payload?.data ?? payload);
			setOrders(list);
		} catch (e) {
			console.error("Failed to load shop orders", e);
			setOrders([]);
			setOrdersError("Failed to load shop orders.");
		} finally {
			setOrdersLoading(false);
		}
	};

	const loadAccounts = async (shop) => {
		const ownerId = shop?.user_id ?? shop?.user?.id ?? shop?.owner_id ?? "";
		if (!ownerId) {
			setAccounts([]);
			return;
		}

		setAccountLoading(true);
		try {
			const res = await getBankAccount(ownerId);
			const list = normalizeList(res);
			setAccounts(list);
		} catch (e) {
			console.error("Failed to load bank accounts", e);
			setAccounts([]);
		} finally {
			setAccountLoading(false);
		}
	};

	useEffect(() => {
		loadShops("");
	}, []);

	useEffect(() => {
		if (!selectedShop) {
			setOrders([]);
			setSelectedIds([]);
			setAccounts([]);
			setSelectedAccountId("");
			return;
		}

		setSelectedIds([]);
		setSelectedAccountId("");
		loadOrders(selectedShop?.user_id ?? "");
		loadAccounts(selectedShop);
	}, [selectedShop]);

	useEffect(() => {
		if (tabIndex !== 0) setSelectedIds([]);
	}, [tabIndex]);

	const unsettledOrders = useMemo(() => orders.filter((row) => !isSettled(row)), [orders]);
	const settledOrders = useMemo(() => orders.filter((row) => isSettled(row)), [orders]);

	const allSelected = unsettledOrders.length > 0 && selectedIds.length === unsettledOrders.length;
	const someSelected = selectedIds.length > 0 && !allSelected;

	const toggleAll = () => {
		if (allSelected) {
			setSelectedIds([]);
		} else {
			setSelectedIds(unsettledOrders.map((row, idx) => getRowId(row, idx)));
		}
	};

	const toggleOne = (row, idx) => {
		const id = getRowId(row, idx);
		setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
	};

	const selectedTotal = useMemo(() => {
		if (!selectedIds.length) return 0;
		return unsettledOrders.reduce((sum, row, idx) => {
			const id = getRowId(row, idx);
			if (!selectedIds.includes(id)) return sum;
			return sum + getRowAmount(row);
		}, 0);
	}, [unsettledOrders, selectedIds]);

	const handleSettle = async () => {
		const sellerId = selectedShop?.user_id ?? selectedShop?.user?.id ?? selectedShop?.owner_id ?? selectedShop?.id ?? "";
		if (!sellerId) {
			setSettleError("Seller id not found for settlement.");
			return;
		}

		const selectedAccount = accounts.find(
			(acc) => String(acc?.id ?? acc?.account_no) === String(selectedAccountId)
		);
		if (!selectedAccount) {
			setSettleError("Select a bank account first.");
			return;
		}

		const selectedRows = unsettledOrders.filter((row, idx) => selectedIds.includes(getRowId(row, idx)));
		if (selectedRows.length === 0) {
			setSettleError("Select at least one order to settle.");
			return;
		}

		const groups = selectedRows.reduce((acc, row) => {
			const orderId = row?.order?.id ?? row?.order_id ?? "";
			if (!orderId) return acc;
			const itemId = row?.order_item_id ?? row?.id;
			if (!acc[orderId]) {
				acc[orderId] = { amount: 0, itemIds: [] };
			}
			acc[orderId].amount += getRowAmount(row);
			if (itemId != null) acc[orderId].itemIds.push(itemId);
			return acc;
		}, {});

		const groupEntries = Object.entries(groups);
		if (groupEntries.length === 0) {
			setSettleError("Selected rows are missing order information.");
			return;
		}

		setSettleLoading(true);
		setSettleError("");
		setSettleSuccess("");

		try {
			for (const [orderId, group] of groupEntries) {
				const amount = group.amount;
				const fd = new FormData();
				fd.append("amount", amount);
				fd.append("note", selectedAccount?.bank_name || selectedAccount?.account_name || "settlement");
				fd.append("ref_id", selectedAccount?.id ?? selectedAccount?.account_no ?? "");
				fd.append("trx_id", selectedAccount?.account_no ?? selectedAccount?.route ?? "");
				fd.append("order_id", orderId);
				fd.append("source", "wallet");
				fd.append("type", "settlement");
				group.itemIds.forEach((id) => fd.append("order_item_ids[]", id));

				const res = await settleAmountToSeller(sellerId, fd);
				if (res?.status !== "success") {
					throw new Error(res?.message || "Settlement failed");
				}
			}

			setSettleSuccess("Settlement completed successfully.");
			setMessage("Settlement prepared. Review and confirm with finance.");
			setSelectedIds([]);
		} catch (e) {
			console.error("Settlement error", e);
			setSettleError(e?.message || "Failed to settle amount.");
		} finally {
			setSettleLoading(false);
		}
	};

	return (
		<Box sx={{ p: 3 }}>
			<Box sx={{ mb: 2 }}>
				<Typography variant="h4" fontWeight={800}>
					Settlements
				</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
					Select a shop, review orders, and settle payouts.
				</Typography>
			</Box>

			<Card sx={{ background: colors.primary[400], borderRadius: 2, mb: 2 }}>
				<CardContent>
					<Typography variant="h6" fontWeight={800}>
						Shop Selection
					</Typography>
					<Divider sx={{ my: 2, opacity: 0.2 }} />

					<Autocomplete
						options={shops}
						loading={shopLoading}
						value={selectedShop}
						onChange={(_, value) => setSelectedShop(value)}
						onInputChange={(_, value) => {
							setShopQuery(value);
							loadShops(value || "");
						}}
						isOptionEqualToValue={(option, value) => String(option?.id) === String(value?.id)}
						getOptionLabel={(option) => option?.name || option?.shop_name || `Shop ${option?.id || ""}`}
						renderInput={(params) => (
							<TextField
								{...params}
								label="Select shop"
								placeholder="Search shop by name"
								InputProps={{
									...params.InputProps,
									endAdornment: (
										<>
											{shopLoading ? <CircularProgress color="inherit" size={18} /> : null}
											{params.InputProps.endAdornment}
										</>
									),
								}}
							/>
						)}
					/>
				</CardContent>
			</Card>

			<Card sx={{ background: colors.primary[400], borderRadius: 2 }}>
				<CardContent>
					<Tabs
						value={tabIndex}
						onChange={(_, value) => setTabIndex(value)}
						textColor="secondary"
						indicatorColor="secondary"
						sx={{ mb: 2 }}
					>
						<Tab label="Settle Amount" />
						<Tab label="Settlement History" />
					</Tabs>

					<Divider sx={{ my: 2, opacity: 0.2 }} />

					{ordersError ? (
						<Alert severity="error" sx={{ mb: 2 }}>
							{ordersError}
						</Alert>
					) : null}

					{ordersLoading ? (
						<Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
							<CircularProgress size={24} />
						</Box>
					) : (tabIndex === 0 ? unsettledOrders : settledOrders).length === 0 ? (
						<Typography variant="body2" sx={{ color: colors.gray[300] }}>
							{selectedShop
								? tabIndex === 0
									? "No unsettled orders for this shop."
									: "No settlement history for this shop."
								: "Select a shop to view orders."}
						</Typography>
					) : (
						<TableContainer component={Paper} sx={{ background: colors.primary[400], boxShadow: "none" }}>
							<Table stickyHeader>
								<TableHead>
									<TableRow>
										{tabIndex === 0 ? (
											<TableCell
												sx={{
													background: colors.primary[500],
													color: colors.gray[100],
													fontWeight: 800,
													width: 48,
												}}
											>
												<Checkbox
													checked={allSelected}
													indeterminate={someSelected}
													onChange={toggleAll}
													sx={{ color: colors.gray[300], "&.Mui-checked": { color: colors.blueAccent[500] } }}
												/>
											</TableCell>
										) : null}
										{["Order #", "Product", "Qty", "Customer", "Status", "Payment", "Seller Settled", "Amount", "Date"].map((header) => (
											<TableCell
												key={header}
												sx={{
													background: colors.primary[500],
													color: colors.gray[100],
													fontWeight: 800,
												}}
											>
												{header}
											</TableCell>
										))}
									</TableRow>
								</TableHead>
									<TableBody>
										{(tabIndex === 0 ? unsettledOrders : settledOrders).map((row, idx) => {
										const id = getRowId(row, idx);
										const checked = selectedIds.includes(id);
										return (
											<TableRow key={id} hover>
													{tabIndex === 0 ? (
														<TableCell>
															<Checkbox
																checked={checked}
																onChange={() => toggleOne(row, idx)}
																sx={{ color: colors.gray[300], "&.Mui-checked": { color: colors.blueAccent[500] } }}
															/>
														</TableCell>
													) : null}
												<TableCell>
													<Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
														{row?.order?.order_number || row?.order_id || row?.id || "-"}
													</Typography>
												</TableCell>
												<TableCell>{row?.product_name || "-"}</TableCell>
												<TableCell>{row?.qty || "-"}</TableCell>
												<TableCell>{row?.order?.customer_name || "-"}</TableCell>
													<TableCell>
														<Typography variant="caption" sx={{ fontWeight: 700 }}>
															{row?.status || "N/A"}
														</Typography>
													</TableCell>
													<TableCell>
														<Typography variant="caption" sx={{ fontWeight: 700 }}>
															{row?.order?.payment_status || "N/A"}
														</Typography>
													</TableCell>
													<TableCell>
														<Typography
															variant="caption"
															sx={{ fontWeight: 800, color: isSettled(row) ? "success.main" : "warning.main" }}
														>
															{isSettled(row) ? "Yes" : "No"}
														</Typography>
													</TableCell>
												<TableCell>{formatCurrency(getRowAmount(row))}</TableCell>
												<TableCell>{row?.created_at ? formatDate(row.created_at) : "-"}</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</TableContainer>
					)}

					<Divider sx={{ my: 2, opacity: 0.2 }} />

					{tabIndex === 0 ? (
						<Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
						<Box sx={{ flex: 1 }}>
							<Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
								Selected Settlement Amount
							</Typography>
							<Typography variant="h6" sx={{ fontWeight: 900, color: colors.greenAccent[400] }}>
								{formatCurrency(selectedTotal)}
							</Typography>
							<Typography variant="caption" sx={{ color: colors.gray[300] }}>
								{selectedIds.length} item{selectedIds.length === 1 ? "" : "s"} selected
							</Typography>
						</Box>

						<Box sx={{ minWidth: 240 }}>
							<FormControl fullWidth size="small">
								<InputLabel id="bank-account-label">Bank Account</InputLabel>
								<Select
									labelId="bank-account-label"
									label="Bank Account"
									value={selectedAccountId}
									onChange={(e) => setSelectedAccountId(e.target.value)}
									disabled={accountLoading || accounts.length === 0}
								>
									{accounts.map((acc) => (
										<MenuItem key={acc?.id ?? acc?.account_no} value={acc?.id ?? acc?.account_no}>
											{acc?.bank_name || "Bank"} - {acc?.account_no || acc?.account_name || "Account"}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Box>

						<Button
							variant="contained"
							disabled={!selectedShop || selectedIds.length === 0 || !selectedAccountId || settleLoading}
							onClick={handleSettle}
							sx={{ textTransform: "none", fontWeight: 800, borderRadius: 999, px: 3 }}
						>
							{settleLoading ? "Settling..." : "Settle Now"}
						</Button>
					</Stack>
					) : null}

					{tabIndex === 0 && settleError ? (
						<Alert severity="error" sx={{ mt: 2 }}>
							{settleError}
						</Alert>
					) : null}
					{tabIndex === 0 && settleSuccess ? (
						<Alert severity="success" sx={{ mt: 2 }}>
							{settleSuccess}
						</Alert>
					) : null}
					{tabIndex === 0 && message ? (
						<Alert severity="info" sx={{ mt: 2 }}>
							{message}
						</Alert>
					) : null}
				</CardContent>
			</Card>
		</Box>
	);
};

export default Settlement;
