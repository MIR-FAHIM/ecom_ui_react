import React, { useEffect, useMemo, useState } from "react";
import {
	Box,
	Button,
	Card,
	CardContent,
	CircularProgress,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TablePagination,
	TableRow,
	Typography,
	useTheme,
	Chip,
	Stack,
	Paper,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { tokens } from "../../../theme";
import { getShopOrder } from "../../../api/controller/admin_controller/order/order_controller";


const safeArray = (x) => (Array.isArray(x) ? x : []);

const OrderShop = () => {
	const theme = useTheme();
	const colors = tokens(theme.palette.mode);
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	const userId = localStorage.getItem("userId");

	const [rows, setRows] = useState([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(20);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const fetchOrders = async (pageZero = page, perPage = rowsPerPage) => {
		if (!userId) {
			setError("User id not found.");
			setRows([]);
			setTotal(0);
			return;
		}

		setLoading(true);
		setError("");
		try {
			const apiPage = pageZero + 1;
			const response = await getShopOrder(userId, { page: apiPage, per_page: perPage });

			if (response?.status === "success") {
				const paginator = response?.data ?? {};
				const list = safeArray(paginator?.data);
				setRows(list);
				setTotal(Number(paginator?.total ?? list.length));
				setRowsPerPage(Number(paginator?.per_page ?? perPage));
				setPage(Number(paginator?.current_page ?? apiPage) - 1);
			} else {
				setRows([]);
				setTotal(0);
				setError(response?.message || "Failed to load orders.");
			}
		} catch (err) {
			setRows([]);
			setTotal(0);
			setError(err?.message || "Failed to load orders.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchOrders(0, rowsPerPage);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userId]);

	const handleChangePage = (_, newPage) => {
		setPage(newPage);
		fetchOrders(newPage, rowsPerPage);
	};

	const handleChangeRowsPerPage = (event) => {
		const next = parseInt(event.target.value, 10);
		setRowsPerPage(next);
		setPage(0);
		fetchOrders(0, next);
	};

	const handleViewDetails = (orderId) => {
		if (!orderId) return;
		navigate(`/seller/orders/${orderId}`);
	};

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

	const formatCurrency = (amount) =>
		new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(amount || 0);

	const formatDate = (dateString) =>
		new Date(dateString).toLocaleDateString("en-BD", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});

	const renderProducts = (order) => {
		const items = safeArray(order?.items);
		if (!items.length) return "-";
		const first = items[0]?.product_name || "Product";
		const extra = items.length - 1;
		return (
			<Box>
				<Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
					{first}
				</Typography>
				{extra > 0 ? (
					<Typography variant="caption" sx={{ color: colors.gray[300] }}>
						+{extra} more
					</Typography>
				) : null}
			</Box>
		);
	};

	return (
		<Box sx={{ p: { xs: 2, md: 3 } }}>
			<Stack spacing={1} sx={{ mb: 2 }} direction={{ xs: "column", md: "row" }} alignItems={{ md: "center" }}>
				<Box sx={{ flex: 1 }}>
					<Typography variant="h4" sx={{ fontWeight: 900 }}>
						Shop Orders
					</Typography>
					<Typography variant="body2" sx={{ color: colors.gray[300] }}>
						{total ? `${total} orders in this shop` : "Review your shop orders"}
					</Typography>
				</Box>
				<Button
					variant="outlined"
					onClick={() => navigate(-1)}
					sx={{ borderRadius: 999, textTransform: "none", fontWeight: 700 }}
				>
					Back
				</Button>
			</Stack>

			<Card sx={{ background: colors.primary[400], borderRadius: 2, border: `1px solid ${colors.primary[500]}` }}>
				<CardContent>
					{loading ? (
						<Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
							<CircularProgress size={24} />
						</Box>
					) : error ? (
						<Typography variant="body2" color="error">
							{error}
						</Typography>
					) : (
						<TableContainer component={Paper} sx={{ background: colors.primary[400], boxShadow: "none" }}>
							<Table stickyHeader>
								<TableHead>
									<TableRow>
										{[
											"Order #",
											"Products",
											"Quantity",
											"Customer",
								
											"Status",
											"Payment",
											"Total",
											"Date",
											"Actions",
										].map((header) => (
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
									{rows.map((row) => (
										<TableRow key={row?.id ?? Math.random()} hover>
											<TableCell>
												<Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
													{row?.order?.order_number || row?.id || "-"}
												</Typography>
											</TableCell>
											<TableCell>{row?.product_name || "-"}</TableCell>
											<TableCell>{row?.qty || "-"}</TableCell>
											<TableCell>{row?.order?.customer_name || "-"}</TableCell>
										
											<TableCell>
												<Chip label={row?.status || "N/A"} size="small" color={getStatusColor(row?.status)} />
											</TableCell>
											<TableCell>
												<Chip
													label={row?.order?.payment_status || "N/A"}
													size="small"
													variant="outlined"
													color={getPaymentStatusColor(row?.order?.payment_status)}
												/>
											</TableCell>
											<TableCell>{formatCurrency(row?.line_total)}</TableCell>
											<TableCell>{row?.created_at ? formatDate(row.created_at) : "-"}</TableCell>
											<TableCell>
												<Button
													variant="outlined"
													size="small"
													sx={{ textTransform: "none", fontWeight: 700, color: colors.blueAccent[500], borderColor: colors.primary[500] }}
													onClick={() =>
														handleViewDetails(row?.order?.id ?? row?.order_id ?? row?.id)
													}
													disabled={!row?.order?.id && !row?.order_id && !row?.id}
												>
													View Details
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
					)}

					<TablePagination
						component="div"
						count={total}
						page={page}
						onPageChange={handleChangePage}
						rowsPerPage={rowsPerPage}
						onRowsPerPageChange={handleChangeRowsPerPage}
						rowsPerPageOptions={[10, 20, 50]}
						sx={{
							mt: 1,
							"& .MuiTablePagination-toolbar": { color: colors.gray[100] },
							"& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
								color: colors.gray[300],
							},
						}}
					/>
				</CardContent>
			</Card>
		</Box>
	);
};

export default OrderShop;
