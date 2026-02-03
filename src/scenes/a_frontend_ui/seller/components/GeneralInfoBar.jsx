import React, { useMemo } from "react";
import {
	Avatar,
	Box,
	Card,
	CardContent,
	Chip,
	CircularProgress,
	Divider,
	Stack,
	Typography,
	useTheme,
} from "@mui/material";

import { tokens } from "../../../../theme";
import { image_file_url } from "../../../../api/config/index.jsx";

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

const GeneralInfoBar = ({ shop, loading, error }) => {
	const theme = useTheme();
	const colors = tokens(theme.palette.mode);

	const bannerUrl = useMemo(() => buildImageUrl(shop?.banner), [shop?.banner]);
	const logoUrl = useMemo(() => buildImageUrl(shop?.logo), [shop?.logo]);

	return (
		<Card
			sx={{
				background: colors.primary[400],
				borderRadius: 3,
				border: `1px solid ${theme.palette.divider}`,
				overflow: "hidden",
				height: "100%",
			}}
		>
			<Box
				sx={{
					height: 160,
					background: bannerUrl
						? `url(${bannerUrl}) center/cover no-repeat`
						: `linear-gradient(120deg, ${colors.blueAccent[700]}, ${colors.blueAccent[400]})`,
				}}
			/>
			<CardContent>
				<Stack direction="row" spacing={2} alignItems="center" sx={{ mt: -6 }}>
					<Avatar
						src={logoUrl || undefined}
						sx={{
							width: 80,
							height: 80,
							border: `3px solid ${colors.primary[400]}`,
							background: colors.primary[300],
							fontWeight: 800,
							fontSize: 28,
						}}
					>
						{initialsFromName(shop?.name)}
					</Avatar>
					<Box>
						<Typography variant="h6" sx={{ fontWeight: 900 }}>
							{shop?.name || "Shop"}
						</Typography>
						<Typography variant="body2" sx={{ color: colors.gray[300], fontWeight: 600 }}>
							{shop?.slug ? `@${shop.slug}` : ""}
						</Typography>
					</Box>
				</Stack>

				<Divider sx={{ my: 2, opacity: 0.2 }} />

				{loading ? (
					<Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
						<CircularProgress size={18} />
						<Typography variant="body2">Loading shop details...</Typography>
					</Box>
				) : error ? (
					<Typography variant="body2" color="error">
						{error}
					</Typography>
				) : (
					<Stack spacing={1.2}>
						{shop?.description ? (
							<Typography variant="body2" sx={{ color: colors.gray[200] }}>
								{shop.description}
							</Typography>
						) : null}

						{shop?.address ? (
							<Typography variant="body2" sx={{ color: colors.gray[300] }}>
								{shop.address}
							</Typography>
						) : null}

						{(shop?.phone || shop?.email) ? (
							<Stack spacing={0.5}>
								{shop?.phone ? (
									<Typography variant="body2" sx={{ color: colors.gray[300] }}>
										Phone: {shop.phone}
									</Typography>
								) : null}
								{shop?.email ? (
									<Typography variant="body2" sx={{ color: colors.gray[300] }}>
										Email: {shop.email}
									</Typography>
								) : null}
							</Stack>
						) : null}

						<Stack direction="row" spacing={1} flexWrap="wrap">
							{shop?.zone ? <Chip size="small" label={shop.zone} /> : null}
							{shop?.district ? <Chip size="small" label={shop.district} /> : null}
							{shop?.area ? <Chip size="small" label={shop.area} /> : null}
						</Stack>
					</Stack>
				)}
			</CardContent>
		</Card>
	);
};

export default GeneralInfoBar;