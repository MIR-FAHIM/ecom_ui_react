import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
	Box,
	CircularProgress,
	Container,
	Grid,
	Typography,
	Button,
	List,
	ListItemButton,
	ListItemText,
	Divider,
	Pagination,
	Stack,
	useTheme,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

import { getCategoryWiseProduct } from "../../../../api/controller/admin_controller/product/product_controller";
import { getProductCategoryDetails, getCategoryChildren,  } from "../../../../api/controller/admin_controller/product/product_setting_controller";
import SmartProductCard from "../../home/components/ProductCard";
import { tokens } from "../../../../theme";

const safeArray = (x) => (Array.isArray(x) ? x : []);

const CategoryWiseProduct = () => {
	const theme = useTheme();
	const navigate = useNavigate();
	const { id } = useParams();

	const colors = tokens(theme.palette.mode);
	const pageBg = theme.palette.background?.default || colors.primary[500];

	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [category, setCategory] = useState(null);
	const [children, setChildren] = useState([]);
	const [selectedSubId, setSelectedSubId] = useState("");
	const [page, setPage] = useState(1);
	const [pagination, setPagination] = useState({
		current_page: 1,
		last_page: 1,
		total: 0,
		per_page: 24,
	});

	const loadProducts = useCallback(async () => {
		if (!id) return;
		setLoading(true);
		setError("");
		try {
			const categoryId = selectedSubId || id;
			const res = await getCategoryWiseProduct({
				category_id: categoryId,
				page,
				per_page: pagination.per_page,
			});
			const pageData = res?.data ?? res ?? {};
			const list = safeArray(pageData?.data ?? pageData?.items ?? pageData);
			setProducts(list);
			setPagination((prev) => ({
				...prev,
				current_page: pageData?.current_page || prev.current_page,
				last_page: pageData?.last_page || prev.last_page,
				total: pageData?.total ?? prev.total,
				per_page: pageData?.per_page ?? prev.per_page,
			}));
			if (pageData?.current_page && pageData.current_page !== page) {
				setPage(pageData.current_page);
			}
		} catch (e) {
			console.error("CategoryWiseProduct load error:", e);
			setProducts([]);
			setError("Failed to load products.");
		} finally {
			setLoading(false);
		}
	}, [id, selectedSubId, page, pagination.per_page]);

	useEffect(() => {
		loadProducts();
	}, [loadProducts]);

	useEffect(() => {
		const loadCategory = async () => {
			if (!id) return;
			try {
				const res = await getProductCategoryDetails(id);
				setCategory(res?.data ?? null);
			} catch (e) {
				console.error("Category details error:", e);
				setCategory(null);
			}
		};

		const loadChildren = async () => {
			if (!id) return;
			try {
				const res = await getCategoryChildren(id);
				setChildren(safeArray(res?.data));
			} catch (e) {
				console.error("Category children error:", e);
				setChildren([]);
			}
		};

		setSelectedSubId("");
		setPage(1);
		loadCategory();
		loadChildren();
	}, [id]);

	const handleSelectSubCategory = (value) => {
		setSelectedSubId(value);
		setPage(1);
	};

	const handlePageChange = (_, value) => {
		setPage(value);
	};

	const title = useMemo(() => category?.name || `Category: ${id || ""}`, [category?.name, id]);

	return (
		<Box
			sx={{
				minHeight: "100vh",
				background: pageBg,
				py: 4,
			}}
		>
			<Container maxWidth="xl">
				<Box sx={{ mb: 3 }}>
					<Typography variant="h4" sx={{ fontWeight: 900 }}>
						{title}
					</Typography>
					<Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
						Browse products from this category.
					</Typography>
				</Box>

				<Grid container spacing={3}>
					<Grid item xs={12} md={3}>
						<Box
							sx={{
								p: 2,
								borderRadius: 3,
								border: `1px solid ${theme.palette.divider || colors.primary[200]}`,
								background: colors.primary[400],
							}}
						>
							<Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
								{category?.name || "Category"}
							</Typography>
							<Typography variant="body2" sx={{ color: "text.secondary", mb: 1.5 }}>
								Subcategories
							</Typography>
							<Divider sx={{ mb: 1 }} />
							<List dense disablePadding>
								<ListItemButton
									selected={!selectedSubId}
									onClick={() => handleSelectSubCategory("")}
									sx={{ borderRadius: 2, mb: 0.5 }}
								>
									<ListItemText primary="All" />
								</ListItemButton>

								{children.map((child) => (
									<ListItemButton
										key={child?.id}
										selected={String(selectedSubId) === String(child?.id)}
										onClick={() => handleSelectSubCategory(String(child?.id))}
										sx={{ borderRadius: 2, mb: 0.5 }}
									>
										<ListItemText primary={child?.name || "Unnamed"} />
									</ListItemButton>
								))}
							</List>
						</Box>
					</Grid>

					<Grid item xs={12} md={9}>
						{loading ? (
							<Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
								<CircularProgress />
							</Box>
						) : products.length === 0 ? (
							<Box sx={{ textAlign: "center", py: 8 }}>
								<Typography variant="h6" sx={{ mb: 1.5 }}>
									{error || "No products found."}
								</Typography>
								<Button
									variant="contained"
									onClick={() => navigate("/")}
									sx={{ textTransform: "none", fontWeight: 800 }}
								>
									Back to home
								</Button>
							</Box>
						) : (
							<>
								<Grid container spacing={2.5}>
									{products.map((product, index) => (
										<Grid key={product?.id ?? product?.product_id ?? index} item xs={12} sm={6} md={4} lg={3}>
											<SmartProductCard
												product={product}
												onView={(p) => navigate(`/product/${p?.id}`)}
											/>
										</Grid>
									))}
								</Grid>

								{pagination.last_page > 1 ? (
									<Stack alignItems="center" sx={{ mt: 3 }}>
										<Pagination
											count={pagination.last_page}
											page={page}
											onChange={handlePageChange}
											color="primary"
										/>
									</Stack>
								) : null}
							</>
						)}
					</Grid>
				</Grid>
			</Container>
		</Box>
	);
};

export default CategoryWiseProduct;
