import React, { useEffect, useMemo, useState } from "react";
import {
	Box,
	Button,
	Card,
	CardContent,
	CircularProgress,
	Container,
	Grid,
	Pagination,
	Stack,
	Typography,
	useTheme,
} from "@mui/material";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { tokens } from "../../../theme";
import { getShopDetails, getShopProduct } from "../../../api/controller/admin_controller/shop/shop_controller.jsx";
import ProductCard from "../home/components/ProductCard";
import GeneralInfoBar from "./components/GeneralInfoBar";

const safeArray = (x) => (Array.isArray(x) ? x : []);


const ShopProducts = () => {
	const theme = useTheme();
	const colors = tokens(theme.palette.mode);
	const navigate = useNavigate();
	const { id } = useParams();
	const [searchParams] = useSearchParams();

	const shopId = useMemo(
		() => id || searchParams.get("shop_id") || searchParams.get("id"),
		[id, searchParams]
	);

	const [shop, setShop] = useState(null);
	const [products, setProducts] = useState([]);
	const [loadingShop, setLoadingShop] = useState(false);
	const [loadingProducts, setLoadingProducts] = useState(false);
	const [errorShop, setErrorShop] = useState("");
	const [errorProducts, setErrorProducts] = useState("");
	const [pagination, setPagination] = useState({
		current_page: 1,
		last_page: 1,
		total: 0,
		per_page: 20,
	});

	useEffect(() => {
		if (!shopId) {
			setErrorShop("Shop id not found.");
			return;
		}

		const load = async () => {
			setLoadingShop(true);
			setErrorShop("");
			try {
				const res = await getShopDetails(shopId);
				if (res?.status === "success") {
					setShop(res?.data || null);
				} else {
					setErrorShop(res?.message || "Failed to load shop details.");
				}
			} catch (err) {
				setErrorShop(err?.message || "Failed to load shop details.");
			} finally {
				setLoadingShop(false);
			}
		};

		load();
	}, [shopId]);

	useEffect(() => {
		if (!shopId) return;

		const load = async () => {
			setLoadingProducts(true);
			setErrorProducts("");
			try {
				const res = await getShopProduct(shopId, {
					page: pagination.current_page,
					per_page: pagination.per_page,
				});
				if (res?.status === "success") {
					const pageData = res?.data ?? {};
					const list = safeArray(pageData?.data);
					setProducts(list);
					setPagination((prev) => ({
						...prev,
						current_page: pageData?.current_page || prev.current_page,
						last_page: pageData?.last_page || prev.last_page,
						total: pageData?.total ?? prev.total,
						per_page: pageData?.per_page ?? prev.per_page,
					}));
				} else {
					setErrorProducts(res?.message || "Failed to load products.");
				}
			} catch (err) {
				setErrorProducts(err?.message || "Failed to load products.");
			} finally {
				setLoadingProducts(false);
			}
		};

		load();
	}, [shopId, pagination.current_page]);

	const handlePageChange = (_, value) => {
		setPagination((prev) => ({
			...prev,
			current_page: value,
		}));
	};

	return (
		<Box
			sx={{
				minHeight: "100vh",
				background: theme.palette.background?.default || colors.primary[500],
				py: 3,
			}}
		>
			<Container maxWidth="xl">
				<Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
					<Typography variant="h4" sx={{ fontWeight: 900 }}>
						Shop Products
					</Typography>
					<Button variant="outlined" onClick={() => navigate(-1)}>
						Back
					</Button>
				</Box>

				<Grid container spacing={3}>
					<Grid item xs={12} md={4} lg={3}>
						<GeneralInfoBar shop={shop} loading={loadingShop} error={errorShop} />
					</Grid>

					<Grid item xs={12} md={8} lg={9}>
						<Card
							sx={{
								background: colors.primary[400],
								borderRadius: 3,
								border: `1px solid ${theme.palette.divider}`,
							}}
						>
							<CardContent>
								<Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
									<Box>
										<Typography variant="h5" sx={{ fontWeight: 900 }}>
											Products
										</Typography>
										<Typography variant="body2" sx={{ color: colors.gray[300] }}>
											{pagination.total ? `${pagination.total} items` : "Browse shop products"}
										</Typography>
									</Box>
									{loadingProducts ? <CircularProgress size={20} /> : null}
								</Box>

								{errorProducts ? (
									<Typography variant="body2" color="error" sx={{ mb: 2 }}>
										{errorProducts}
									</Typography>
								) : null}

								{!loadingProducts && products.length === 0 ? (
									<Typography variant="body2" sx={{ color: colors.gray[300] }}>
										No products found.
									</Typography>
								) : null}

								<Grid container spacing={2}>
									{products.map((product) => (
										<Grid item xs={12} sm={6} md={4} lg={3} key={product?.id ?? Math.random()}>
											<ProductCard
												product={product}
												onView={(p) => {
													if (p?.id) navigate(`/product/${p.id}`);
												}}
											/>
										</Grid>
									))}
								</Grid>

								{pagination.last_page > 1 ? (
									<Stack alignItems="center" sx={{ mt: 3 }}>
										<Pagination
											count={pagination.last_page}
											page={pagination.current_page}
											onChange={handlePageChange}
											color="primary"
										/>
									</Stack>
								) : null}
							</CardContent>
						</Card>
					</Grid>
				</Grid>
			</Container>
		</Box>
	);
};

export default ShopProducts;
