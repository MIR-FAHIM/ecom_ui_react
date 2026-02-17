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
import { useNavigate } from "react-router-dom";
import { tokens } from "../../../theme";
import { getAllShops } from "../../../api/controller/admin_controller/shop/shop_controller.jsx";

const safeArray = (x) => (Array.isArray(x) ? x : []);

const SellerShopList = () => {
	const theme = useTheme();
	const colors = tokens(theme.palette.mode);
	const navigate = useNavigate();
	const userId = useMemo(() => localStorage.getItem("userId") || "", []);

	const [rows, setRows] = useState([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(20);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const fetchShops = async (pageZero = page, perPage = rowsPerPage) => {
		if (!userId) {
			setError("User id not found.");
			return;
		}

		setLoading(true);
		setError("");
		try {
			const apiPage = pageZero + 1;
			const response = await getAllShops({
				page: apiPage,
				per_page: perPage,
				user_id: userId,
			});

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
				setError(response?.message || "Failed to load shops.");
			}
		} catch (err) {
			setRows([]);
			setTotal(0);
			setError(err?.message || "Failed to load shops.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchShops(0, rowsPerPage);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userId]);

	const handleChangePage = (_, newPage) => {
		setPage(newPage);
		fetchShops(newPage, rowsPerPage);
	};

	const handleChangeRowsPerPage = (event) => {
		const next = parseInt(event.target.value, 10);
		setRowsPerPage(next);
		setPage(0);
		fetchShops(0, next);
	};

	const renderStatus = (statusRaw) => {
		const status = String(statusRaw ?? "").toLowerCase();
		if (!status) return <Chip label="N/A" size="small" variant="outlined" />;
		if (status === "active") return <Chip label="Active" size="small" color="success" variant="outlined" />;
		if (status === "inactive") return <Chip label="Inactive" size="small" color="warning" variant="outlined" />;
		return <Chip label={status} size="small" variant="outlined" />;
	};

	const handleAddShop = () => {
		navigate("/seller/shops/add");
	};

	const handleViewProducts = (shopId) => {
		if (!shopId) return;
		navigate(`/seller/shops/products?shop_id=${shopId}`);
	};

	return (
		<Box sx={{ p: { xs: 2, md: 3 } }}>
			<Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 2 }}>
				<Stack spacing={0.6}>
					<Typography variant="h4" sx={{ fontWeight: 900 }}>
						My Shops
					</Typography>
					<Typography variant="body2" sx={{ color: colors.gray[300] }}>
						{total ? `${total} shops linked to your account` : "Review your storefronts"}
					</Typography>
				</Stack>
				<Button
					variant="contained"
					onClick={handleAddShop}
					sx={{ textTransform: "none", fontWeight: 700, borderRadius: 999 }}
				>
					Add Shop
				</Button>
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
					) : (
						<TableContainer component={Paper} sx={{ background: colors.primary[400], boxShadow: "none" }}>
							<Table stickyHeader>
								<TableHead>
									<TableRow>
										{["ID", "Shop", "Slug", "Contact", "Status", "Created", "Actions"].map((header) => (
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
											<TableCell>{row?.id ?? "-"}</TableCell>
											<TableCell>
												<Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
													{row?.name || "Shop"}
												</Typography>
												<Typography variant="caption" sx={{ color: colors.gray[300] }}>
													{row?.address || row?.area || ""}
												</Typography>
											</TableCell>
											<TableCell>{row?.slug || "-"}</TableCell>
											<TableCell>{row?.phone || row?.email || "-"}</TableCell>
											<TableCell>{renderStatus(row?.status)}</TableCell>
											<TableCell>{row?.created_at ? String(row.created_at).slice(0, 10) : "-"}</TableCell>
											<TableCell>
												<Button
													variant="contained"
													size="small"
													onClick={() => handleViewProducts(row?.id)}
													sx={{ borderRadius: 999, textTransform: "none", fontWeight: 700 , }}
												>
													View Products
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

export default SellerShopList;
