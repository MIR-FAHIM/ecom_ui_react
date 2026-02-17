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
	Stack,
	Paper,
	Button,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { tokens } from "../../../theme";
import { getShopProduct } from "../../../api/controller/admin_controller/shop/shop_controller.jsx";

const safeArray = (x) => (Array.isArray(x) ? x : []);

const SellerShopProduct = () => {
	const theme = useTheme();
	const colors = tokens(theme.palette.mode);
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	const shopId = useMemo(
		() => searchParams.get("shop_id") || searchParams.get("id") || "",
		[searchParams]
	);

	const [rows, setRows] = useState([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(20);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const fetchProducts = async (pageZero = page, perPage = rowsPerPage) => {
		if (!shopId) {
			setError("Shop id not found.");
			return;
		}

		setLoading(true);
		setError("");
		try {
			const apiPage = pageZero + 1;
			const response = await getShopProduct(shopId, {
				page: apiPage,
				per_page: perPage,
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
				setError(response?.message || "Failed to load products.");
			}
		} catch (err) {
			setRows([]);
			setTotal(0);
			setError(err?.message || "Failed to load products.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchProducts(0, rowsPerPage);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [shopId]);

	const handleChangePage = (_, newPage) => {
		setPage(newPage);
		fetchProducts(newPage, rowsPerPage);
	};

	const handleChangeRowsPerPage = (event) => {
		const next = parseInt(event.target.value, 10);
		setRowsPerPage(next);
		setPage(0);
		fetchProducts(0, next);
	};

	const renderStatus = (row) => {
		const published = row?.published ?? row?.status;
		if (published === 1 || published === true || String(published).toLowerCase() === "published") {
			return <Chip label="Published" size="small" color="success" variant="outlined" />;
		}
		if (published === 0 || published === false || String(published).toLowerCase() === "draft") {
			return <Chip label="Draft" size="small" color="warning" variant="outlined" />;
		}
		return <Chip label="N/A" size="small" variant="outlined" />;
	};

	const renderPrice = (row) => {
		const value = row?.unit_price ?? row?.price ?? row?.sale_price;
		if (value === undefined || value === null || value === "") return "-";
		return Number(value).toLocaleString();
	};

	const handleAddProduct = () => {
		const target = shopId ? `/seller/add/product?shop_id=${shopId}` : "/seller/add/product";
		navigate(target);
	};

	return (
		<Box sx={{ p: { xs: 2, md: 3 } }}>
			<Stack spacing={1} sx={{ mb: 2 }} direction={{ xs: "column", md: "row" }} alignItems={{ md: "center" }}>
				<Box sx={{ flex: 1 }}>
					<Typography variant="h4" sx={{ fontWeight: 900 }}>
						Shop Products
					</Typography>
					<Typography variant="body2" sx={{ color: colors.gray[300] }}>
						{total ? `${total} items in this shop` : "Review your shop catalog"}
					</Typography>
				</Box>
				<Box sx={{ display: "flex", gap: 1, alignItems: "center", justifyContent: { xs: "flex-start", md: "flex-end" } }}>
					<Button
						variant="contained"
						onClick={handleAddProduct}
						sx={{ borderRadius: 999, textTransform: "none", fontWeight: 700 }}
					>
						Add Product
					</Button>
					<Button
						variant="outlined"
						onClick={() => navigate(-1)}
						sx={{ borderRadius: 999, textTransform: "none", fontWeight: 700 }}
					>
						Back
					</Button>
				</Box>
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
										{["ID", "Product", "SKU", "Price", "Stock", "Status", "Updated", "Actions"].map((header) => (
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
													{row?.name || row?.title || "Product"}
												</Typography>
												<Typography variant="caption" sx={{ color: colors.gray[300] }}>
													{row?.category?.name || row?.category_name || ""}
												</Typography>
											</TableCell>
											<TableCell>{row?.sku || row?.slug || "-"}</TableCell>
											<TableCell>{renderPrice(row)}</TableCell>
											<TableCell>{row?.current_stock ?? row?.stock ?? "-"}</TableCell>
											<TableCell>{renderStatus(row)}</TableCell>
											<TableCell>{row?.updated_at ? String(row.updated_at).slice(0, 10) : "-"}</TableCell>
											<TableCell>
												<Button
													variant="contained"
													size="small"
													onClick={() => row?.id && navigate(`/seller/edit/product/${row.id}`)}
													sx={{ borderRadius: 999, textTransform: "none", fontWeight: 700 }}
												>
													Edit
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

export default SellerShopProduct;
