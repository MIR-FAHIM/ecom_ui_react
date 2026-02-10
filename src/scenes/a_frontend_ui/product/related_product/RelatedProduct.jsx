import React, { useEffect, useMemo, useState } from "react";
import {
	Box,
	Card,
	CardContent,
	Typography,
	CircularProgress,
	Stack,
	useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import { getRelatedProducts } from "../../../../api/controller/admin_controller/product/product_varient_controller";
import { image_file_url } from "../../../../api/config";
import { tokens } from "../../../../theme";

const safeArray = (x) => (Array.isArray(x) ? x : []);

  const getPrimaryImage = (product) => {
	const imgPath =
	  product?.primary_image?.file_name ;

	if (imgPath) return `${image_file_url}/${imgPath}`;
	return "https://placehold.co/600x400";
  };

const RelatedProduct = ({ productId }) => {
	const theme = useTheme();
	const navigate = useNavigate();

	const colors = tokens(theme.palette.mode);
	const border = theme.palette.divider || colors.primary[200];
	const surface = colors.primary[400];
	const surface2 = colors.primary[300];
	const ink = colors.gray[100];
	const subInk = colors.gray[300];

	const [loading, setLoading] = useState(false);
	const [items, setItems] = useState([]);

	useEffect(() => {
		if (!productId) return;
		let mounted = true;

		const load = async () => {
			setLoading(true);
			try {
				const res = await getRelatedProducts(productId);
				const payload = res?.data ?? res ?? {};
				const list = safeArray(payload?.items);
				const products = list.map((x) => x?.related_product).filter(Boolean);
				if (mounted) setItems(products);
			} catch (e) {
				console.error("RelatedProduct error:", e);
				if (mounted) setItems([]);
			} finally {
				if (mounted) setLoading(false);
			}
		};

		load();
		return () => {
			mounted = false;
		};
	}, [productId]);

	const money = useMemo(
		() => (n) => new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(Number(n || 0)),
		[]
	);

	return (
		<Card
			sx={{
				borderRadius: 4,
				border: `1px solid ${border}`,
				background: surface,
			}}
		>
			<CardContent sx={{ p: 2 }}>
				<Typography sx={{ fontWeight: 950, color: ink, mb: 1 }}>Related Products</Typography>

				{loading ? (
					<Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
						<CircularProgress size={20} />
					</Box>
				) : items.length === 0 ? (
					<Typography variant="body2" sx={{ color: subInk, fontWeight: 700 }}>
						No related products.
					</Typography>
				) : (
					<Stack spacing={1}>
						{items.map((p) => {
							
							return (
								<Box
									key={p?.id}
									onClick={() => navigate(`/product/${p?.id}`)}
									sx={{
										display: "flex",
										gap: 1,
										alignItems: "center",
										p: 1,
										borderRadius: 2,
										border: `1px solid ${border}`,
										background: surface2,
										cursor: "pointer",
										"&:hover": { background: surface },
									}}
								>
									<Box
										component="img"
										src={getPrimaryImage(p)}
										alt={p?.name || "product"}
										sx={{ width: 56, height: 56, borderRadius: 2, objectFit: "cover" }}
										onError={(e) => {
											e.currentTarget.onerror = null;
											e.currentTarget.src = "https://placehold.co/600x400";
										}}
									/>
									<Box sx={{ minWidth: 0 }}>
										<Typography
											sx={{
												fontWeight: 700,
												color: ink,
												fontSize: 12,
												display: "-webkit-box",
												WebkitLineClamp: 1,
												WebkitBoxOrient: "vertical",
												overflow: "hidden",
											}}
										>
											{p?.name || "Unnamed product"}
										</Typography>
										<Typography variant="caption" sx={{ color: subInk, fontWeight: 800 }}>
											{money(p?.unit_price ?? p?.price ?? 0)}
										</Typography>
									</Box>
								</Box>
							);
						})}
					</Stack>
				)}
			</CardContent>
		</Card>
	);
};

export default RelatedProduct;
