import React, { useEffect, useMemo, useState } from "react";
import {
	Box,
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
	Paper,
} from "@mui/material";
import { tokens } from "../../../theme";
import { getShopOrder } from "../../../api/controller/admin_controller/order/order_controller";

const safeArray = (x) => (Array.isArray(x) ? x : []);

const SettledAmountHistory = () => {
	const theme = useTheme();
	const colors = tokens(theme.palette.mode);
	const userId = localStorage.getItem("userId");

	const [rows, setRows] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);

	const isSettled = (row) => {
		const raw = row?.is_settle_with_seller ?? row?.is_settled ?? row?.is_settle ?? 0;
		const value = String(raw).toLowerCase();
		return value === "1" || value === "true";
	};

	const getRowAmount = (row) =>
		Number(row?.settled_amount ?? row?.line_total ?? row?.order?.total ?? row?.total ?? 0);

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

	const loadHistory = async () => {
		if (!userId) {
			setRows([]);
			setError("User id not found.");
			return;
		}

		setLoading(true);
		setError("");
		try {
			const res = await getShopOrder(userId, { page: 1, per_page: 200 });
			const payload = res?.data ?? {};
			const list = safeArray(payload?.data ?? payload);
			setRows(list);
		} catch (e) {
			console.error("Failed to load settled amount history", e);
			setRows([]);
			setError(e?.message || "Failed to load settled amount history.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadHistory();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userId]);

	const settledRows = useMemo(() => rows.filter((row) => isSettled(row)), [rows]);
	const pagedRows = useMemo(() => {
		const start = page * rowsPerPage;
		return settledRows.slice(start, start + rowsPerPage);
	}, [settledRows, page, rowsPerPage]);

	const handleChangePage = (_, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		const next = parseInt(event.target.value, 10);
		setRowsPerPage(next);
		setPage(0);
	};

	return (
		<Box sx={{ p: { xs: 2, md: 3 } }}>
			<Box sx={{ mb: 2 }}>
				<Typography variant="h4" sx={{ fontWeight: 900 }}>
					Settled Amount History
				</Typography>
				<Typography variant="body2" sx={{ color: colors.gray[300] }}>
					{settledRows.length ? `${settledRows.length} settled entries` : "Review your settlement history"}
				</Typography>
			</Box>

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
					) : settledRows.length === 0 ? (
						<Typography variant="body2" sx={{ color: colors.gray[300] }}>
							No settled history found.
						</Typography>
					) : (
						<TableContainer component={Paper} sx={{ background: colors.primary[400], boxShadow: "none" }}>
							<Table stickyHeader>
								<TableHead>
									<TableRow>
										{["Order #", "Customer", "Status", "Payment", "Amount", "Settled Date"].map((header) => (
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
									{pagedRows.map((row, idx) => (
										<TableRow key={row?.id ?? row?.order_item_id ?? idx} hover>
											<TableCell>
												<Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
													{row?.order?.order_number || row?.order_id || row?.order?.id || row?.id || "-"}
												</Typography>
											</TableCell>
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
											<TableCell>{formatCurrency(getRowAmount(row))}</TableCell>
											<TableCell>
												{formatDate(row?.settled_at ?? row?.updated_at ?? row?.created_at)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
					)}

					<TablePagination
						component="div"
						count={settledRows.length}
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

export default SettledAmountHistory;
