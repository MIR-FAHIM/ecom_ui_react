import React, { useEffect, useState } from "react";
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
	IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getShopOrder } from "../../../api/controller/admin_controller/order/order_controller";

const safeArray = (x) => (Array.isArray(x) ? x : []);

const ACCENT = "#6366f1";
const STATUS_MAP = {
	pending:             { color: "#f59e0b", bg: "#fffbeb" },
	processing:          { color: "#3b82f6", bg: "#eff6ff" },
	completed:           { color: "#10b981", bg: "#ecfdf5" },
	delivered:           { color: "#10b981", bg: "#ecfdf5" },
	cancelled:           { color: "#ef4444", bg: "#fef2f2" },
	"new order":         { color: "#3b82f6", bg: "#eff6ff" },
	"order received":    { color: "#f59e0b", bg: "#fffbeb" },
	"on the way":        { color: "#0ea5e9", bg: "#f0f9ff" },
	"assigned deliveryman": { color: "#8b5cf6", bg: "#f5f3ff" },
};
const PAY_MAP = {
	paid:     { color: "#10b981", bg: "#ecfdf5" },
	unpaid:   { color: "#ef4444", bg: "#fef2f2" },
	pending:  { color: "#f59e0b", bg: "#fffbeb" },
	refunded: { color: "#6366f1", bg: "#eef2ff" },
};

const headSx = { fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: "text.secondary", py: 1.5, borderBottom: "2px solid", borderColor: "divider" };

const OrderShop = () => {
	const theme = useTheme();
	const isDark = theme.palette.mode === "dark";
	const navigate = useNavigate();
	const userId = localStorage.getItem("userId");

	const [rows, setRows] = useState([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(20);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const fetchOrders = async (pageZero = page, perPage = rowsPerPage) => {
		if (!userId) { setError("User id not found."); setRows([]); setTotal(0); return; }
		setLoading(true); setError("");
		try {
			const response = await getShopOrder(userId, { page: pageZero + 1, per_page: perPage });
			if (response?.status === "success") {
				const paginator = response?.data ?? {};
				const list = safeArray(paginator?.data);
				setRows(list);
				setTotal(Number(paginator?.total ?? list.length));
				setRowsPerPage(Number(paginator?.per_page ?? perPage));
				setPage(Number(paginator?.current_page ?? pageZero + 1) - 1);
			} else { setRows([]); setTotal(0); setError(response?.message || "Failed to load orders."); }
		} catch (err) { setRows([]); setTotal(0); setError(err?.message || "Failed to load orders."); }
		finally { setLoading(false); }
	};

	useEffect(() => { fetchOrders(0, rowsPerPage); }, [userId]);

	const handleChangePage = (_, newPage) => { setPage(newPage); fetchOrders(newPage, rowsPerPage); };
	const handleChangeRowsPerPage = (e) => { const n = parseInt(e.target.value, 10); setRowsPerPage(n); setPage(0); fetchOrders(0, n); };

	const formatCurrency = (amount) => new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(amount || 0);
	const formatDate = (d) => new Date(d).toLocaleDateString("en-BD", { year: "numeric", month: "short", day: "numeric" });

	const StatusChip = ({ status, map }) => {
		const s = String(status || "").toLowerCase();
		const cfg = map[s] || { color: "#64748b", bg: "#f1f5f9" };
		return <Chip label={status || "N/A"} size="small" sx={{ height: 24, fontWeight: 700, fontSize: 11, bgcolor: isDark ? `${cfg.color}18` : cfg.bg, color: cfg.color, border: "1px solid", borderColor: `${cfg.color}30` }} />;
	};

	return (
		<Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: "auto" }}>

			{/* Header */}
			<Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
				<Stack direction="row" alignItems="center" spacing={2}>
					<IconButton onClick={() => navigate(-1)} sx={{ bgcolor: isDark ? "#1e2030" : "#f1f5f9", "&:hover": { bgcolor: isDark ? "#262940" : "#e2e8f0" } }}>
						<ArrowBackIcon fontSize="small" />
					</IconButton>
					<Box>
						<Typography variant="h5" fontWeight={800}>Shop Orders</Typography>
						<Typography variant="body2" color="text.disabled">{total ? `${total} orders total` : "Manage your orders"}</Typography>
					</Box>
				</Stack>
			</Stack>

			{/* Table card */}
			<Card variant="outlined" sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", bgcolor: isDark ? "#161822" : "#fff" }}>
				<CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
					{loading ? (
						<Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress size={28} sx={{ color: ACCENT }} /></Box>
					) : error ? (
						<Box sx={{ p: 3 }}><Typography color="error">{error}</Typography></Box>
					) : rows.length === 0 ? (
						<Box sx={{ py: 8, textAlign: "center" }}>
							<ShoppingBagOutlinedIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
							<Typography color="text.disabled">No orders yet</Typography>
						</Box>
					) : (
						<TableContainer>
							<Table>
								<TableHead>
									<TableRow sx={{ bgcolor: "action.hover" }}>
										<TableCell sx={headSx}>Order #</TableCell>
										<TableCell sx={headSx}>Product</TableCell>
										<TableCell sx={{ ...headSx, textAlign: "center" }}>Qty</TableCell>
										<TableCell sx={headSx}>Customer</TableCell>
										<TableCell sx={{ ...headSx, textAlign: "center" }}>Status</TableCell>
										<TableCell sx={{ ...headSx, textAlign: "center" }}>Payment</TableCell>
										<TableCell sx={{ ...headSx, textAlign: "right" }}>Total</TableCell>
										<TableCell sx={headSx}>Date</TableCell>
										<TableCell sx={{ ...headSx, textAlign: "center" }}>Action</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{rows.map((row) => (
										<TableRow
											key={row?.id}
											hover
											onClick={() => navigate(`/seller/orders/${row?.order?.id ?? row?.order_id ?? row?.id}`)}
											sx={{ cursor: "pointer", "&:hover": { bgcolor: isDark ? "rgba(99,102,241,.04)" : "#fafafe" }, transition: "background .15s" }}
										>
											<TableCell sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
												<Typography variant="body2" fontWeight={700}>{row?.order?.order_number || `#${row?.id || "-"}`}</Typography>
											</TableCell>
											<TableCell sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
												<Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 180 }}>{row?.product_name || "-"}</Typography>
											</TableCell>
											<TableCell sx={{ borderBottom: "1px solid", borderColor: "divider", textAlign: "center" }}>
												<Chip label={row?.qty || 0} size="small" sx={{ fontWeight: 700, minWidth: 28, bgcolor: isDark ? "#1e2030" : "#f1f5f9" }} />
											</TableCell>
											<TableCell sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
												<Typography variant="body2" color="text.secondary">{row?.order?.customer_name || "-"}</Typography>
											</TableCell>
											<TableCell sx={{ borderBottom: "1px solid", borderColor: "divider", textAlign: "center" }}>
												<StatusChip status={row?.status} map={STATUS_MAP} />
											</TableCell>
											<TableCell sx={{ borderBottom: "1px solid", borderColor: "divider", textAlign: "center" }}>
												<StatusChip status={row?.order?.payment_status} map={PAY_MAP} />
											</TableCell>
											<TableCell sx={{ borderBottom: "1px solid", borderColor: "divider", textAlign: "right" }}>
												<Typography variant="body2" fontWeight={700}>{formatCurrency(row?.line_total)}</Typography>
											</TableCell>
											<TableCell sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
												<Typography variant="caption" color="text.secondary">{row?.created_at ? formatDate(row.created_at) : "-"}</Typography>
											</TableCell>
											<TableCell sx={{ borderBottom: "1px solid", borderColor: "divider", textAlign: "center" }}>
												<IconButton size="small" sx={{ color: ACCENT }}>
													<VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
												</IconButton>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
					)}

					{!loading && !error && rows.length > 0 && (
						<TablePagination
							component="div"
							count={total}
							page={page}
							onPageChange={handleChangePage}
							rowsPerPage={rowsPerPage}
							onRowsPerPageChange={handleChangeRowsPerPage}
							rowsPerPageOptions={[10, 20, 50]}
							sx={{ borderTop: "1px solid", borderColor: "divider" }}
						/>
					)}
				</CardContent>
			</Card>
		</Box>
	);
};

export default OrderShop;
