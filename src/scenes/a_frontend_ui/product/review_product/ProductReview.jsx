import React, { useEffect, useMemo, useState } from "react";
import {
	Box,
	Card,
	CardContent,
	Typography,
	CircularProgress,
	Stack,
	Rating,
	Avatar,
	Divider,
	useTheme,
} from "@mui/material";

import { getProductReviews } from "../../../../api/controller/admin_controller/product/product_controller";
import { tokens } from "../../../../theme";

const safeArray = (x) => (Array.isArray(x) ? x : []);

const ProductReview = ({ productId }) => {
	const theme = useTheme();
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
				const res = await getProductReviews(productId);
				const payload = res?.data ?? res ?? {};
				const list = safeArray(payload?.items);
				if (mounted) setItems(list);
			} catch (e) {
				console.error("ProductReview error:", e);
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

	const formatDate = useMemo(
		() => (d) => {
			if (!d) return "";
			const dt = new Date(d);
			if (Number.isNaN(dt.getTime())) return "";
			return dt.toLocaleDateString("en-BD", { year: "numeric", month: "short", day: "numeric" });
		},
		[]
	);

	const initials = (name) => {
		const parts = (name || "").trim().split(/\s+/).filter(Boolean);
		if (!parts.length) return "U";
		return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
	};

	return (
		<Card
			sx={{
				borderRadius: 4,
				border: `1px solid ${border}`,
				background: surface,
				mb: 2,
			}}
		>
			<CardContent sx={{ p: 2 }}>
				<Typography sx={{ fontWeight: 950, color: ink, mb: 1 }}>Reviews</Typography>

				{loading ? (
					<Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
						<CircularProgress size={20} />
					</Box>
				) : items.length === 0 ? (
					<Typography variant="body2" sx={{ color: subInk, fontWeight: 700 }}>
						No reviews yet.
					</Typography>
				) : (
					<Stack spacing={1.5}>
						{items.map((r, idx) => (
							<Box key={r?.id ?? idx}>
								<Stack direction="row" spacing={1.2} alignItems="center">
									<Avatar
										sx={{
											width: 34,
											height: 34,
											borderRadius: 2,
											background: theme.palette.secondary.main,
											color: colors.gray[900],
											fontWeight: 900,
											border: `1px solid ${border}`,
										}}
									>
										{initials(r?.user?.name)}
									</Avatar>
									<Box sx={{ minWidth: 0 }}>
										<Typography sx={{ fontWeight: 900, color: ink, lineHeight: 1.1 }}>
											{r?.user?.name || "Anonymous"}
										</Typography>
										<Typography variant="caption" sx={{ color: subInk, fontWeight: 700 }}>
											{formatDate(r?.created_at)}
										</Typography>
									</Box>
									<Box sx={{ ml: "auto" }}>
										<Rating value={Number(r?.star_count || 0)} size="small" readOnly />
									</Box>
								</Stack>
								{r?.comment ? (
									<Typography variant="body2" sx={{ color: subInk, fontWeight: 700, mt: 0.8 }}>
										{r.comment}
									</Typography>
								) : null}
								{idx < items.length - 1 ? <Divider sx={{ my: 1.4, opacity: 0.12 }} /> : null}
							</Box>
						))}
					</Stack>
				)}
			</CardContent>
		</Card>
	);
};

export default ProductReview;
