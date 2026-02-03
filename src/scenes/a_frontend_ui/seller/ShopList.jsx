import React, { useEffect, useMemo, useState } from "react";
import {
	Avatar,
	Box,
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
import { useNavigate } from "react-router-dom";

import { tokens } from "../../../theme";
import { image_file_url } from "../../../api/config/index.jsx";
import { getAllShops } from "../../../api/controller/admin_controller/shop/shop_controller.jsx";

const safeArray = (x) => (Array.isArray(x) ? x : []);

const buildImageUrl = (file) => {
	if (!file) return null;
	if (typeof file === "object") {
		const direct = file?.url || file?.external_link;
		if (direct && /^https?:\/\//i.test(String(direct))) return String(direct);
		const named = file?.file_name || file?.file_original_name;
		if (named) return buildImageUrl(named);
	}
	if (/^https?:\/\//i.test(String(file))) return String(file);
	const base = String(image_file_url || "").replace(/\/+$/, "");
	const safeFile = String(file).replaceAll("\\/", "/").replace(/^\/+/, "");
	return `${base}/${safeFile}`;
};

const initialsFromName = (name) => {
	if (!name) return "S";
	const parts = String(name)
		.trim()
		.split(/\s+/)
		.filter(Boolean);
	const initials = parts.map((p) => p[0]).join("").slice(0, 2).toUpperCase();
	return initials || "S";
};

const ShopCard = ({ shop, onView }) => {
	const theme = useTheme();
	const colors = tokens(theme.palette.mode);
	const logoUrl = useMemo(() => buildImageUrl(shop?.logo), [shop?.logo]);

	return (
		<Card
			onClick={() => onView?.(shop)}
			sx={{
				borderRadius: 3,
				border: `1px solid ${theme.palette.divider}`,
				background: colors.primary[400],
				cursor: "pointer",
				height: "100%",
				transition: "transform 140ms ease, box-shadow 220ms ease, border-color 220ms ease",
				"&:hover": {
					transform: "translateY(-3px)",
					borderColor: theme.palette.primary.main,
					boxShadow:
						theme.palette.mode === "dark"
							? "0 16px 34px rgba(0,0,0,0.35)"
							: "0 16px 34px rgba(0,0,0,0.12)",
				},
			}}
		>
			<CardContent>
				<Stack direction="row" spacing={1.5} alignItems="center">
					<Avatar
						src={logoUrl || undefined}
						sx={{
							width: 56,
							height: 56,
							background: colors.primary[300],
							fontWeight: 800,
						}}
					>
						{initialsFromName(shop?.name)}
					</Avatar>
					<Box sx={{ minWidth: 0 }}>
						<Typography variant="subtitle1" sx={{ fontWeight: 800 }} noWrap>
							{shop?.name || "Shop"}
						</Typography>
						<Typography variant="body2" sx={{ color: colors.gray[300] }} noWrap>
							{shop?.phone || shop?.email || ""}
						</Typography>
					</Box>
				</Stack>

				{shop?.status ? (
					<Typography variant="caption" sx={{ color: colors.greenAccent?.[400] || colors.gray[300] }}>
						{String(shop.status).toUpperCase()}
					</Typography>
				) : null}
			</CardContent>
		</Card>
	);
};

const ShopList = () => {
	const theme = useTheme();
	const colors = tokens(theme.palette.mode);
	const navigate = useNavigate();

	const [loading, setLoading] = useState(false);
	const [items, setItems] = useState([]);
	const [error, setError] = useState("");
	const [page, setPage] = useState(1);
	const [pagination, setPagination] = useState({
		current_page: 1,
		last_page: 1,
		total: 0,
		per_page: 20,
	});

	useEffect(() => {
		let mounted = true;
		const load = async () => {
			setLoading(true);
			setError("");
			try {
				const res = await getAllShops({ page, per_page: pagination.per_page });
				const pageData = res?.data ?? {};
				const list = safeArray(pageData?.data);
				if (mounted) {
					setItems(list);
					setPagination((prev) => ({
						...prev,
						current_page: pageData?.current_page || prev.current_page,
						last_page: pageData?.last_page || prev.last_page,
						total: pageData?.total ?? prev.total,
						per_page: pageData?.per_page ?? prev.per_page,
					}));
				}
			} catch (e) {
				console.error("load shops error:", e);
				if (mounted) {
					setItems([]);
					setError("Failed to load shops.");
				}
			} finally {
				if (mounted) setLoading(false);
			}
		};

		load();
		return () => {
			mounted = false;
		};
	}, [page, pagination.per_page]);

	const handlePageChange = (_, value) => {
		setPage(value);
	};

	const handleViewShop = (shop) => {
		if (!shop?.id) return;
		navigate(`/shop/${shop.id}`);
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
				<Stack spacing={2} sx={{ mb: 2 }}>
					<Typography variant="h4" sx={{ fontWeight: 900 }}>
						All Shops
					</Typography>
					<Typography variant="body2" sx={{ color: colors.gray[300] }}>
						{pagination.total ? `${pagination.total} shops` : "Browse all shops"}
					</Typography>
				</Stack>

				{loading ? (
					<Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
						<CircularProgress />
					</Box>
				) : error ? (
					<Typography variant="body2" color="error">
						{error}
					</Typography>
				) : !items.length ? (
					<Typography variant="body2" sx={{ color: colors.gray[300] }}>
						No shops found.
					</Typography>
				) : (
					<Grid container spacing={2}>
						{items.map((shop) => (
							<Grid item xs={12} sm={6} md={4} lg={3} key={shop?.id ?? Math.random()}>
								<ShopCard shop={shop} onView={handleViewShop} />
							</Grid>
						))}
					</Grid>
				)}

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
			</Container>
		</Box>
	);
};

export default ShopList;
