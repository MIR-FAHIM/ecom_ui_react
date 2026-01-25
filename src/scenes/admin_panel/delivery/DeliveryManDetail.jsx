import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "@mui/material";
import {
	Box,
	Card,
	CardContent,
	Typography,
	Tabs,
	Tab,
	Divider,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TablePagination,
	Paper,
	Chip,
	IconButton,
	Tooltip,
	CircularProgress,
	Alert,
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import { tokens } from "../../../theme";
import {
	getAllDeliveries,
	getAssignedDeliveries,
	getCompletedDeliveries,
} from "../../../api/controller/admin_controller/delivery/delivery_controller.jsx";

const DeliveryManDetail = () => {
	const theme = useTheme();
	const colors = tokens(theme.palette.mode);
	const { id } = useParams();
	const navigate = useNavigate();

	const [activeTab, setActiveTab] = useState(0);
	const [rows, setRows] = useState([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(20);
	const [loading, setLoading] = useState(false);
	const [errMsg, setErrMsg] = useState("");

	const tabs = useMemo(
		() => [
			{ key: "all", label: "All Orders", fetcher: getAllDeliveries },
			{ key: "pending", label: "Pending Orders", fetcher: getAssignedDeliveries },
			{ key: "completed", label: "Completed Orders", fetcher: getCompletedDeliveries },
		],
		[]
	);

	const formatDate = (dateString) => {
		if (!dateString) return "N/A";
		return new Date(dateString).toLocaleDateString("en-BD", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getStatusColor = (status) => {
		const map = {
			pending: "warning",
			assigned: "info",
			delivered: "success",
			completed: "success",
			cancelled: "error",
		};
		return map[String(status ?? "").toLowerCase()] || "default";
	};

	const fetchDeliveries = async (pageZeroBased = page, perPage = rowsPerPage) => {
		if (!id) return;
		setLoading(true);
		setErrMsg("");
		try {
			const apiPage = pageZeroBased + 1;
			const fetcher = tabs[activeTab]?.fetcher;
			const response = await fetcher?.(id, { page: apiPage, per_page: perPage });

			if (response?.status === "success") {
				const paginator = response?.data;
				const list = Array.isArray(paginator?.data) ? paginator.data : [];
				setRows(list);
				setTotal(Number(paginator?.total ?? list.length));
				setRowsPerPage(Number(paginator?.per_page ?? perPage));
				setPage(Number(paginator?.current_page ?? apiPage) - 1);
			} else {
				setRows([]);
				setTotal(0);
				setErrMsg(response?.message || "Failed to fetch deliveries");
			}
		} catch (error) {
			console.error("Error fetching deliveries:", error);
			setRows([]);
			setTotal(0);
			setErrMsg(error?.response?.data?.message || "Failed to fetch deliveries");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (id) {
			fetchDeliveries(0, rowsPerPage);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id, activeTab]);

	const handleChangePage = (_, newPage) => {
		setPage(newPage);
		fetchDeliveries(newPage, rowsPerPage);
	};

	const handleChangeRowsPerPage = (event) => {
		const next = parseInt(event.target.value, 10);
		setRowsPerPage(next);
		setPage(0);
		fetchDeliveries(0, next);
	};

	if (!id) {
		return (
			<Box sx={{ p: 3 }}>
				<Alert severity="error">Delivery man ID is missing.</Alert>
			</Box>
		);
	}

	return (
		<Box sx={{ p: 3 }}>
			<Box sx={{ mb: 2 }}>
				<Typography variant="h4" fontWeight={800}>
					Delivery Man Order History
				</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
					Tab-based history for delivery man ID: {id}
				</Typography>
			</Box>

			<Card sx={{ background: colors.primary[400], borderRadius: 2 }}>
				<CardContent>
					<Tabs
						value={activeTab}
						onChange={(_, next) => {
							setActiveTab(next);
							setPage(0);
						}}
						textColor="inherit"
						indicatorColor="primary"
						sx={{
							mb: 2,
							".MuiTab-root": { textTransform: "none", fontWeight: 700 },
						}}
					>
						{tabs.map((t) => (
							<Tab key={t.key} label={t.label} />
						))}
					</Tabs>

					{errMsg && (
						<Alert severity="error" sx={{ mb: 2 }}>
							{errMsg}
						</Alert>
					)}

					<Divider sx={{ my: 2, opacity: 0.2 }} />

					<TableContainer
						component={Paper}
						sx={{
							background: colors.primary[400],
							borderRadius: 2,
							overflow: "hidden",
							border: `1px solid ${colors.primary[500]}`,
						}}
					>
						<Table stickyHeader>
							<TableHead>
								<TableRow>
									{[
										"Delivery ID",
										"Order #",
										"Order Status",
										"Payment",
										"Customer",
										"Phone",
										"Address",
										"Delivery Status",
										"Note",
										"Created",
										"Actions",
									].map((h) => (
										<TableCell
											key={h}
											sx={{
												fontWeight: 800,
												backgroundColor: colors.primary[500],
												borderBottom: `1px solid ${colors.primary[300]}`,
											}}
											align={h === "Actions" ? "center" : "left"}
										>
											{h}
										</TableCell>
									))}
								</TableRow>
							</TableHead>

							<TableBody>
								{loading && (
									<TableRow>
										<TableCell colSpan={11} align="center" sx={{ py: 4 }}>
											<CircularProgress size={24} />
										</TableCell>
									</TableRow>
								)}

								{!loading && rows.length === 0 && (
									<TableRow>
										<TableCell colSpan={11} align="center" sx={{ py: 4 }}>
											<Typography color="text.secondary">No deliveries found</Typography>
										</TableCell>
									</TableRow>
								)}

								{!loading &&
									rows.map((d, idx) => (
										<TableRow
											key={d?.id ?? idx}
											hover
											sx={{
												"& td": { borderBottom: `1px solid ${colors.primary[300]}` },
												backgroundColor: idx % 2 === 0 ? "transparent" : colors.primary[300],
											}}
										>
											<TableCell sx={{ fontWeight: 700 }}>{d?.id ?? "N/A"}</TableCell>
											<TableCell sx={{ fontWeight: 600 }}>{d?.order?.order_number ?? "N/A"}</TableCell>
											<TableCell>
												<Chip label={d?.order?.status ?? "N/A"} size="small" color={getStatusColor(d?.order?.status)} />
											</TableCell>
											<TableCell>
												<Chip label={d?.order?.payment_status ?? "N/A"} size="small" variant="outlined" />
											</TableCell>
											<TableCell>{d?.order?.customer_name ?? "N/A"}</TableCell>
											<TableCell>{d?.order?.customer_phone ?? "N/A"}</TableCell>
											<TableCell>{d?.order?.shipping_address ?? "N/A"}</TableCell>
											<TableCell>
												<Chip label={d?.status ?? "N/A"} size="small" color={getStatusColor(d?.status)} />
											</TableCell>
											<TableCell>{d?.note ?? "N/A"}</TableCell>
											<TableCell>{formatDate(d?.created_at)}</TableCell>
											<TableCell align="center">
												<Tooltip title="View Order">
													<IconButton
														size="small"
														onClick={() => d?.order?.id && navigate(`/admin/order/${d.order.id}`)}
														sx={{ color: colors.blueAccent[500] }}
													>
														<Visibility fontSize="small" />
													</IconButton>
												</Tooltip>
											</TableCell>
										</TableRow>
									))}
							</TableBody>
						</Table>
					</TableContainer>

					<TablePagination
						rowsPerPageOptions={[10, 20, 50, 100]}
						component="div"
						count={total}
						rowsPerPage={rowsPerPage}
						page={page}
						onPageChange={handleChangePage}
						onRowsPerPageChange={handleChangeRowsPerPage}
						sx={{
							mt: 1,
							".MuiTablePagination-toolbar": { px: 0 },
							".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
								color: "text.secondary",
							},
						}}
					/>
				</CardContent>
			</Card>
		</Box>
	);
};

export default DeliveryManDetail;
