import React, { useEffect, useMemo, useRef, useState } from "react";
import {
	Avatar,
	Box,
	Button,
	Card,
	CardContent,
	CircularProgress,
	IconButton,
	Stack,
	Typography,
	useTheme,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import { tokens } from "../../../../theme";
import { image_file_url } from "../../../../api/config/index.jsx";
import { getAllShops } from "../../../../api/controller/admin_controller/shop/shop_controller.jsx";

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
	const bannerUrl = useMemo(() => buildImageUrl(shop?.banner), [shop?.banner]);

	return (
		<Card
			onClick={() => onView?.(shop)}
			sx={{
				minWidth: 260,
				maxWidth: 300,
				borderRadius: 3,
				border: `1px solid ${theme.palette.divider}`,
				background: colors.primary[400],
				cursor: "pointer",
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
			<Box
				sx={{
					height: 90,
					borderRadius: "12px 12px 0 0",
					background: bannerUrl
						? `url(${bannerUrl}) center/cover no-repeat`
						: `linear-gradient(120deg, ${colors.blueAccent[700]}, ${colors.blueAccent[400]})`,
				}}
			/>
			<CardContent sx={{ pt: 0 }}>
				<Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: -4 }}>
					<Avatar
						src={logoUrl || undefined}
						sx={{
							width: 56,
							height: 56,
							border: `2px solid ${colors.primary[400]}`,
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

const HomeShopList = () => {
	const theme = useTheme();
	const colors = tokens(theme.palette.mode);
	const navigate = useNavigate();
	const rowRef = useRef(null);

	const [loading, setLoading] = useState(false);
	const [items, setItems] = useState([]);
	const [error, setError] = useState("");

	useEffect(() => {
		let mounted = true;
		const load = async () => {
			setLoading(true);
			setError("");
			try {
				const res = await getAllShops({ page: 1, per_page: 20 });
				const list = res?.data?.data ?? res?.data ?? res ?? [];
				if (mounted) setItems(safeArray(list));
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
	}, []);

	const handleScroll = (dir) => {
		const el = rowRef.current;
		if (!el) return;
		const amount = Math.max(260, el.clientWidth * 0.8);
		el.scrollBy({ left: dir * amount, behavior: "smooth" });
	};

	const handleSeeAll = () => {
		navigate("/shops");
	};

	const handleViewShop = (shop) => {
		if (!shop?.id) return;
		navigate(`/shop/${shop.id}`);
	};

	return (
		<Box sx={{ mt: 3 }}>
			<Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 1 }}>
				<Typography variant="h5" sx={{ fontWeight: 900 }}>
					Shops
				</Typography>
				<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
					<Button size="small" variant="text" onClick={handleSeeAll} sx={{ fontWeight: 700 ,color: colors.blueAccent[400]}}>
						See all shops
					</Button>
					<IconButton size="small" onClick={() => handleScroll(-1)}>
						<ChevronLeft fontSize="small" />
					</IconButton>
					<IconButton size="small" onClick={() => handleScroll(1)}>
						<ChevronRight fontSize="small" />
					</IconButton>
				</Box>
			</Box>

			{loading ? (
				<Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
					<CircularProgress size={24} />
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
				<Box
					ref={rowRef}
					sx={{
						display: "flex",
						gap: 2,
						overflowX: "auto",
						pb: 1,
						scrollBehavior: "smooth",
						"&::-webkit-scrollbar": { height: 8 },
						"&::-webkit-scrollbar-thumb": {
							background: theme.palette.mode === "dark" ? colors.primary[200] : colors.primary[300],
							borderRadius: 999,
						},
					}}
				>
					{items.map((shop) => (
						<Box key={shop?.id ?? Math.random()} sx={{ flex: "0 0 auto" }}>
							<ShopCard shop={shop} onView={handleViewShop} />
						</Box>
					))}
				</Box>
			)}
		</Box>
	);
};

export default HomeShopList;
