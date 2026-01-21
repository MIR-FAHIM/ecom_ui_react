import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, Grid, Pagination, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { getProduct } from "../../../../api/controller/admin_controller/product/product_controller";
import FeaturedTitle from "./FeaturedTitle";
import SmartProductCard from "./ProductCard";

const safeArray = (x) => (Array.isArray(x) ? x : []);

const AllProduct = ({ categoryId = "" }) => {
	const navigate = useNavigate();

	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(false);
	const [query, setQuery] = useState("");
	const [page, setPage] = useState(1);
	const [lastPage, setLastPage] = useState(1);
	const [perPage, setPerPage] = useState(20);

	const loadProducts = useCallback(async ({ search = "", category = "", page = 1, per_page = 20 } = {}) => {
		setLoading(true);
		try {
			const res = await getProduct({ page, per_page, search, category_id: category });
			const payload = res?.data ?? res ?? {};
			const list = payload?.data ?? payload ?? [];
			setProducts(safeArray(list));
			setLastPage(Number(payload?.last_page || 1));
			setPerPage(Number(payload?.per_page || per_page));
			setPage(Number(payload?.current_page || page));
		} catch (e) {
			console.error("AllProduct load error:", e);
			setProducts([]);
			setLastPage(1);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		const handler = (e) => {
			const detail = (e?.detail || "").toString();
			setQuery(detail);
			setPage(1);
			loadProducts({ page: 1, per_page: perPage, search: detail, category: categoryId || "" });
		};
		window.addEventListener("search", handler);
		return () => window.removeEventListener("search", handler);
	}, [loadProducts, categoryId, perPage]);

	useEffect(() => {
		loadProducts({ page, per_page: perPage, search: query, category: categoryId || "" });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [categoryId, page]);

	const handlePageChange = (_e, value) => {
		setPage(value);
		loadProducts({ page: value, per_page: perPage, search: query, category: categoryId || "" });
	};

	const list = useMemo(() => products, [products]);

	return (
		<Box sx={{ my: 4 }}>
			<Box id="all-products">
				<FeaturedTitle>All Products</FeaturedTitle>
			</Box>

			{loading ? (
				<Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
					<CircularProgress />
				</Box>
			) : (
				<>
					<Grid container spacing={2}>
						{list.length === 0 ? (
							<Grid item xs={12}>
								<Typography variant="h6" align="center" sx={{ py: 6, fontWeight: 900, color: "text.secondary" }}>
									No products found.
								</Typography>
							</Grid>
						) : (
							list.map((product) => (
								<Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
									<SmartProductCard
										product={product}
										onView={() => navigate(`/product/${product.id}`)}
									/>
								</Grid>
							))
						)}
					</Grid>

					{lastPage > 1 ? (
						<Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
							<Pagination
								count={lastPage}
								page={page}
								onChange={handlePageChange}
								color="primary"
								shape="rounded"
							/>
						</Stack>
					) : null}
				</>
			)}
		</Box>
	);
};

export default AllProduct;
