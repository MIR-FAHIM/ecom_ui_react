
import React, { useMemo, useState } from "react";
import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	CircularProgress,
	Dialog,
	DialogContent,
	DialogTitle,
	Divider,
	Grid,
	Stack,
	TextField,
	Typography,
	useTheme,
} from "@mui/material";

import { tokens } from "../../../theme";
import AllMedia from "../media/AllMedia";
import { image_file_url } from "../../../api/config/index.jsx";
import { addWebsite, addWebsiteLogo } from "../../../api/controller/admin_controller/website_setting/website_setting_controller";

const buildImageUrl = (media) => {
	if (!media) return "";
	const direct = media?.url || media?.external_link;
	if (direct && /^https?:\/\//i.test(String(direct))) return String(direct);
	const fileName = media?.file_name || media?.file_original_name;
	if (fileName) return `${String(image_file_url || "").replace(/\/+$/, "")}/${String(fileName).replace(/^\/+/, "")}`;
	return "";
};

const WebsiteLogoSetting = () => {
	const theme = useTheme();
	const colors = tokens(theme.palette.mode);

	const [form, setForm] = useState({
		logo_id: "",
		banner_id: "",
		website_name: "",
		slogan: "",
		description: "",
		short_details: "",
		photo_id: "",
		type: "",
	});

	const [logoMedia, setLogoMedia] = useState(null);
	const [bannerMedia, setBannerMedia] = useState(null);
	const [photoMedia, setPhotoMedia] = useState(null);

	const [mediaOpen, setMediaOpen] = useState(false);
	const [mediaTarget, setMediaTarget] = useState("logo");

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const cardSx = {
		background: colors.primary[400],
		borderRadius: 3,
		border: `1px solid ${theme.palette.divider}`,
		boxShadow: theme.palette.mode === "dark" ? "0 10px 24px rgba(0,0,0,0.35)" : "0 12px 28px rgba(0,0,0,0.08)",
	};
	const actionButtonSx = {
		textTransform: "none",
		fontWeight: 800,
		backgroundColor: colors.blueAccent[200],
		color: colors.gray[100],
		"&:hover": {
			backgroundColor: colors.blueAccent[600],
		},
	};
	const secondaryButtonSx = {
		textTransform: "none",
		fontWeight: 800,
		backgroundColor: colors.greenAccent[500],
		color: colors.gray[900],
		"&:hover": {
			backgroundColor: colors.greenAccent[600],
		},
	};

	const previewLogo = useMemo(() => buildImageUrl(logoMedia), [logoMedia]);
	const previewBanner = useMemo(() => buildImageUrl(bannerMedia), [bannerMedia]);
	const previewPhoto = useMemo(() => buildImageUrl(photoMedia), [photoMedia]);

	const update = (patch) => setForm((prev) => ({ ...prev, ...patch }));

	const openMedia = (target) => {
		setMediaTarget(target);
		setMediaOpen(true);
	};

	const handleMediaSelect = (item) => {
		if (!item) return;
		const id = item?.id ? String(item.id) : "";
		if (mediaTarget === "logo") {
			setLogoMedia(item);
			update({ logo_id: id });
		}
		if (mediaTarget === "banner") {
			setBannerMedia(item);
			update({ banner_id: id });
		}
		if (mediaTarget === "photo") {
			setPhotoMedia(item);
			update({ photo_id: id });
		}
		setMediaOpen(false);
	};

	const buildFormData = () => {
		const fd = new FormData();
		fd.append("logo_id", form.logo_id || "");
		fd.append("banner_id", form.banner_id || "");
		fd.append("website_name", form.website_name || "");
		fd.append("slogan", form.slogan || "");
		fd.append("description", form.description || "");
		fd.append("short_details", form.short_details || "");
		fd.append("photo_id", form.photo_id || "");
		fd.append("type", form.type || "");
		return fd;
	};

	const handleSubmit = async (mode) => {
		setLoading(true);
		setError("");
		setSuccess("");
		try {
			const fd = buildFormData();
			const res = mode === "logo" ? await addWebsiteLogo(fd) : await addWebsite(fd);
			if (res?.status === "success") {
				setSuccess(res?.message || "Website settings saved.");
			} else {
				setError(res?.message || "Failed to save website settings.");
			}
		} catch (err) {
			setError(err?.message || "Failed to save website settings.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box
			sx={{
				minHeight: "100vh",
				background: theme.palette.background?.default || colors.primary[500],
				py: 3,
			}}
		>
			<Box sx={{ px: { xs: 2, md: 3 } }}>
				<Card sx={{ ...cardSx, mb: 2 }}>
					<CardContent sx={{ py: 2.5 }}>
						<Typography variant="h4" sx={{ fontWeight: 900 }}>
							Website Settings
						</Typography>
						<Typography variant="body2" sx={{ color: colors.gray[300], mt: 0.6 }}>
							Manage website name, slogan, and brand visuals from the photo library.
						</Typography>
					</CardContent>
				</Card>

				{success ? (
					<Alert severity="success" sx={{ mb: 2 }}>
						{success}
					</Alert>
				) : null}
				{error ? (
					<Alert severity="error" sx={{ mb: 2 }}>
						{error}
					</Alert>
				) : null}

				<Grid container spacing={2}>
					<Grid item xs={12} lg={7}>
						<Card sx={cardSx}>
							<CardContent>
								<Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
									Website Info
								</Typography>
								<Divider sx={{ mb: 2, opacity: 0.2 }} />
								<Grid container spacing={2}>
									<Grid item xs={12} md={6}>
										<TextField
											label="Website Name"
											fullWidth
											size="small"
											value={form.website_name}
											onChange={(e) => update({ website_name: e.target.value })}
										/>
									</Grid>
									<Grid item xs={12} md={6}>
										<TextField
											label="Slogan"
											fullWidth
											size="small"
											value={form.slogan}
											onChange={(e) => update({ slogan: e.target.value })}
										/>
									</Grid>
									<Grid item xs={12}>
										<TextField
											label="Description"
											fullWidth
											multiline
											minRows={3}
											size="small"
											value={form.description}
											onChange={(e) => update({ description: e.target.value })}
										/>
									</Grid>
									<Grid item xs={12}>
										<TextField
											label="Short Details"
											fullWidth
											multiline
											minRows={2}
											size="small"
											value={form.short_details}
											onChange={(e) => update({ short_details: e.target.value })}
										/>
									</Grid>
									<Grid item xs={12} md={6}>
										<TextField
											label="Type"
											fullWidth
											size="small"
											value={form.type}
											onChange={(e) => update({ type: e.target.value })}
										/>
									</Grid>
									<Grid item xs={12} md={6}>
										<Stack spacing={1}>
											<Button variant="contained" onClick={() => openMedia("photo")} sx={actionButtonSx}>
												Choose Photo
											</Button>
											{previewPhoto ? (
												<Box
													component="img"
													src={previewPhoto}
													alt="photo"
													sx={{ width: "100%", maxHeight: 140, objectFit: "cover", borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}
												/>
											) : (
												<Typography variant="caption" sx={{ color: colors.gray[300] }}>
													No photo selected
												</Typography>
											)}
										</Stack>
									</Grid>
								</Grid>
							</CardContent>
						</Card>
					</Grid>

					<Grid item xs={12} lg={5}>
						<Card sx={cardSx}>
							<CardContent>
								<Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
									Logo & Banner
								</Typography>
								<Divider sx={{ mb: 2, opacity: 0.2 }} />
								<Stack spacing={2}>
									<Stack spacing={1}>
										<Button variant="contained" onClick={() => openMedia("logo")} sx={actionButtonSx}>
											Choose Logo
										</Button>
										{previewLogo ? (
											<Box
												component="img"
												src={previewLogo}
												alt="logo"
												sx={{ width: "100%", maxHeight: 140, objectFit: "contain", borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}
											/>
										) : (
											<Typography variant="caption" sx={{ color: colors.gray[300] }}>
												No logo selected
											</Typography>
										)}
									</Stack>

									<Stack spacing={1}>
										<Button variant="contained" onClick={() => openMedia("banner")} sx={actionButtonSx}>
											Choose Banner
										</Button>
										{previewBanner ? (
											<Box
												component="img"
												src={previewBanner}
												alt="banner"
												sx={{ width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}
											/>
										) : (
											<Typography variant="caption" sx={{ color: colors.gray[300] }}>
												No banner selected
											</Typography>
										)}
									</Stack>
								</Stack>
							</CardContent>
						</Card>

						<Card sx={{ ...cardSx, mt: 2 }}>
							<CardContent>
								<Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1 }}>
									Save Settings
								</Typography>
								<Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
									<Button
										variant="contained"
										onClick={() => handleSubmit("website")}
										disabled={loading}
										sx={secondaryButtonSx}
									>
										{loading ? <CircularProgress size={18} /> : "Save Website"}
									</Button>
									<Button
										variant="contained"
										onClick={() => handleSubmit("logo")}
										disabled={loading}
										sx={actionButtonSx}
									>
										{loading ? <CircularProgress size={18} /> : "Save Logo/Banner"}
									</Button>
								</Stack>
							</CardContent>
						</Card>
					</Grid>
				</Grid>
			</Box>

			<Dialog open={mediaOpen} onClose={() => setMediaOpen(false)} fullWidth maxWidth="lg">
				<DialogTitle>Select media</DialogTitle>
				<DialogContent>
					<AllMedia onSelect={(it) => handleMediaSelect(it)} single />
				</DialogContent>
			</Dialog>
		</Box>
	);
};

export default WebsiteLogoSetting;
