import React, { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { getTodayDealProduct } from "../../../../api/controller/admin_controller/product/product_controller";
import FeaturedTitle from "./FeaturedTitle";
import SmartProductCard from "./ProductCard";

const safeArray = (x) => (Array.isArray(x) ? x : []);

export default function TodayDealProduct({ wishIds = [], onToggleWish, onToggleCart, onView }) {
	const [loading, setLoading] = useState(false);
	const [items, setItems] = useState([]);

	useEffect(() => {
		let mounted = true;
		const load = async () => {
			setLoading(true);
			try {
				const res = await getTodayDealProduct({ page: 1, per_page: 12 });
				const list = res?.data?.data ?? res?.data ?? res ?? [];
				if (mounted) setItems(safeArray(list));
			} catch (e) {
				console.error("loadTodayDealProducts error:", e);
				if (mounted) setItems([]);
			} finally {
				if (mounted) setLoading(false);
			}
		};

		load();
		return () => {
			mounted = false;
		};
	}, []);

	const content = useMemo(() => {
		if (loading) {
			return (
				<Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
					<CircularProgress />
				</Box>
			);
		}

		if (!items.length) {
			return (
				<Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
					No today deal products yet.
				</Typography>
			);
		}

		return (
			<Box sx={{ display: "flex", gap: 2, overflowX: "auto", pb: 1 }}>
				{items.map((product) => {
					const inWish = wishIds.includes(product.id);
					return (
						<Box key={product.id} sx={{ minWidth: 260, flex: "0 0 260px" }}>
							<SmartProductCard
								product={product}
								inCart={false}
								inWish={inWish}
								onToggleCart={() => onToggleCart?.(product)}
								onToggleWish={() => onToggleWish?.(product)}
								onView={() => onView?.(product)}
							/>
						</Box>
					);
				})}
			</Box>
		);
	}, [items, loading, onToggleCart, onToggleWish, onView, wishIds]);

	return (
		<Box sx={{ mt: 3 }}>
			<FeaturedTitle>Today Deals</FeaturedTitle>
			{content}
		</Box>
	);
}
