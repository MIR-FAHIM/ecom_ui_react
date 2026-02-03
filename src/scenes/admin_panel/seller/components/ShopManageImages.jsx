import React, { useMemo, useState } from "react";
import {
	Avatar,
	Box,
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	Grid,
	Stack,
	Typography,
	useTheme,
} from "@mui/material";

import { tokens } from "../../../../theme";
import { image_file_url } from "../../../../api/config/index.jsx";
import AllMedia from "../../media/AllMedia";

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

const ShopManageImages = ({ logo, banner, onSelectLogo, onSelectBanner }) => {
	const theme = useTheme();
	const colors = tokens(theme.palette.mode);
	const [openLogo, setOpenLogo] = useState(false);
	const [openBanner, setOpenBanner] = useState(false);

	const logoUrl = useMemo(() => buildImageUrl(logo), [logo]);
	const bannerUrl = useMemo(() => buildImageUrl(banner), [banner]);

	const handlePickLogo = (item) => {
		if (!item?.id) return;
		onSelectLogo?.(item);
		setOpenLogo(false);
	};

	const handlePickBanner = (item) => {
		if (!item?.id) return;
		onSelectBanner?.(item);
		setOpenBanner(false);
	};

	return (
		<Box>
			<Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
				Images
			</Typography>

			<Grid container spacing={3}>
				<Grid item xs={12} md={6}>
					<Stack spacing={1.5}>
						<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
							Logo
						</Typography>
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								gap: 2,
								p: 2,
								borderRadius: 2,
								border: `1px dashed ${theme.palette.divider}`,
							}}
						>
							<Avatar
								src={logoUrl || undefined}
								sx={{
									width: 72,
									height: 72,
									background: colors.primary[300],
									fontWeight: 800,
								}}
							/>
							<Stack>
								<Typography variant="body2" color="text.secondary">
									{logo?.id ? `Selected ID: ${logo.id}` : "No logo selected"}
								</Typography>
								<Button variant="outlined" onClick={() => setOpenLogo(true)}>
									Select Logo
								</Button>
							</Stack>
						</Box>
					</Stack>
				</Grid>

				<Grid item xs={12} md={6}>
					<Stack spacing={1.5}>
						<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
							Banner
						</Typography>
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								gap: 2,
								p: 2,
								borderRadius: 2,
								border: `1px dashed ${theme.palette.divider}`,
							}}
						>
							<Box
								sx={{
									width: 120,
									height: 72,
									borderRadius: 1,
									overflow: "hidden",
									background: bannerUrl
										? `url(${bannerUrl}) center/cover no-repeat`
										: colors.primary[300],
								}}
							/>
							<Stack>
								<Typography variant="body2" color="text.secondary">
									{banner?.id ? `Selected ID: ${banner.id}` : "No banner selected"}
								</Typography>
								<Button variant="outlined" onClick={() => setOpenBanner(true)}>
									Select Banner
								</Button>
							</Stack>
						</Box>
					</Stack>
				</Grid>
			</Grid>

			<Dialog open={openLogo} onClose={() => setOpenLogo(false)} fullWidth maxWidth="lg">
				<DialogTitle>Select Logo</DialogTitle>
				<DialogContent>
					<AllMedia onSelect={handlePickLogo} single />
				</DialogContent>
			</Dialog>

			<Dialog open={openBanner} onClose={() => setOpenBanner(false)} fullWidth maxWidth="lg">
				<DialogTitle>Select Banner</DialogTitle>
				<DialogContent>
					<AllMedia onSelect={handlePickBanner} single />
				</DialogContent>
			</Dialog>
		</Box>
	);
};

export default ShopManageImages;