
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
	Grid,
	IconButton,
	Stack,
	TextField,
	Tooltip,
	Typography,
	useTheme,
} from "@mui/material";

import LanguageIcon from "@mui/icons-material/Language";
import PhotoLibraryOutlinedIcon from "@mui/icons-material/PhotoLibraryOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import PanoramaOutlinedIcon from "@mui/icons-material/PanoramaOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";

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

/* ── Dropzone-style media picker ── */
const MediaPicker = ({ label, icon, preview, onPick, onClear, height = 160 }) => {
	const theme = useTheme();
	return (
		<Box>
			<Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>{label}</Typography>
			{preview ? (
				<Box sx={{ position: "relative", borderRadius: 2.5, overflow: "hidden", border: "1px solid", borderColor: "divider", bgcolor: "action.hover" }}>
					<Box
						component="img"
						src={preview}
						alt={label}
						sx={{ width: "100%", height, objectFit: "contain", display: "block", p: 1 }}
					/>
					<Stack direction="row" spacing={0.5} sx={{ position: "absolute", top: 8, right: 8 }}>
						<Tooltip title="Change">
							<IconButton size="small" onClick={onPick} sx={{ bgcolor: "background.paper", border: "1px solid", borderColor: "divider", "&:hover": { bgcolor: "action.hover" } }}>
								<CloudUploadOutlinedIcon sx={{ fontSize: 16 }} />
							</IconButton>
						</Tooltip>
						<Tooltip title="Remove">
							<IconButton size="small" onClick={onClear} sx={{ bgcolor: "background.paper", border: "1px solid", borderColor: "divider", "&:hover": { bgcolor: "error.main", color: "#fff" } }}>
								<CloseIcon sx={{ fontSize: 16 }} />
							</IconButton>
						</Tooltip>
					</Stack>
				</Box>
			) : (
				<Box
					onClick={onPick}
					sx={{
						height,
						borderRadius: 2.5,
						border: "2px dashed",
						borderColor: "divider",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						gap: 1,
						cursor: "pointer",
						transition: "all 200ms",
						"&:hover": { borderColor: "primary.main", bgcolor: theme.palette.mode === "dark" ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.04)" },
					}}
				>
					{icon}
					<Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
						Click to select {label.toLowerCase()}
					</Typography>
				</Box>
			)}
		</Box>
	);
};

const WebsiteLogoSetting = () => {
	const theme = useTheme();

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

	const fieldSx = {
		"& .MuiOutlinedInput-root": {
			borderRadius: 2,
			"&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#6366f1" },
		},
		"& .MuiInputLabel-root.Mui-focused": { color: "#6366f1" },
	};

	return (
		<Box sx={{ minHeight: "100vh", bgcolor: "background.default", p: { xs: 2, md: 3 } }}>
			{/* ── Page header ── */}
			<Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
				<Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: "#eef2ff", display: "grid", placeItems: "center", color: "#6366f1" }}>
					<LanguageIcon />
				</Box>
				<Box>
					<Typography variant="h5" sx={{ fontWeight: 800 }}>Website Settings</Typography>
					<Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600 }}>
						Manage your website name, branding, and visual assets.
					</Typography>
				</Box>
			</Stack>

			{/* ── Alerts ── */}
			{success && <Alert severity="success" onClose={() => setSuccess("")} sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}
			{error && <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

			<Grid container spacing={3}>
				{/* ────── LEFT: Website Info ────── */}
				<Grid item xs={12} lg={7}>
					<Card sx={{ borderRadius: 2.5, border: "1px solid", borderColor: "divider" }}>
						<CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
							<Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2.5 }}>
								<Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: "#f0fdf4", display: "grid", placeItems: "center", color: "#16a34a" }}>
									<LanguageIcon sx={{ fontSize: 18 }} />
								</Box>
								<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>General Information</Typography>
							</Stack>

							<Grid container spacing={2.5}>
								<Grid item xs={12} sm={6}>
									<TextField
										label="Website Name"
										fullWidth
										size="small"
										value={form.website_name}
										onChange={(e) => update({ website_name: e.target.value })}
										sx={fieldSx}
									/>
								</Grid>
								<Grid item xs={12} sm={6}>
									<TextField
										label="Slogan"
										fullWidth
										size="small"
										value={form.slogan}
										onChange={(e) => update({ slogan: e.target.value })}
										placeholder="Your catchy tagline..."
										sx={fieldSx}
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
										placeholder="Tell your customers about your store..."
										sx={fieldSx}
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
										sx={fieldSx}
									/>
								</Grid>
								<Grid item xs={12} sm={6}>
									<TextField
										label="Type"
										fullWidth
										size="small"
										value={form.type}
										onChange={(e) => update({ type: e.target.value })}
										sx={fieldSx}
									/>
								</Grid>
								<Grid item xs={12} sm={6}>
									<MediaPicker
										label="Site Photo"
										icon={<PhotoLibraryOutlinedIcon sx={{ fontSize: 28, color: "text.disabled" }} />}
										preview={previewPhoto}
										onPick={() => openMedia("photo")}
										onClear={() => { setPhotoMedia(null); update({ photo_id: "" }); }}
										height={120}
									/>
								</Grid>
							</Grid>
						</CardContent>
					</Card>
				</Grid>

				{/* ────── RIGHT: Logo, Banner & Save ────── */}
				<Grid item xs={12} lg={5}>
					<Stack spacing={3}>
						{/* Logo & Banner card */}
						<Card sx={{ borderRadius: 2.5, border: "1px solid", borderColor: "divider" }}>
							<CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
								<Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2.5 }}>
									<Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: "#eef2ff", display: "grid", placeItems: "center", color: "#6366f1" }}>
										<ImageOutlinedIcon sx={{ fontSize: 18 }} />
									</Box>
									<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Logo & Banner</Typography>
								</Stack>

								<Stack spacing={2.5}>
									<MediaPicker
										label="Logo"
										icon={<ImageOutlinedIcon sx={{ fontSize: 28, color: "text.disabled" }} />}
										preview={previewLogo}
										onPick={() => openMedia("logo")}
										onClear={() => { setLogoMedia(null); update({ logo_id: "" }); }}
										height={120}
									/>
									<MediaPicker
										label="Banner"
										icon={<PanoramaOutlinedIcon sx={{ fontSize: 28, color: "text.disabled" }} />}
										preview={previewBanner}
										onPick={() => openMedia("banner")}
										onClear={() => { setBannerMedia(null); update({ banner_id: "" }); }}
										height={160}
									/>
								</Stack>
							</CardContent>
						</Card>

						{/* Save card */}
						<Card sx={{ borderRadius: 2.5, border: "1px solid", borderColor: "divider" }}>
							<CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
								<Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: "text.secondary" }}>
									Save your changes
								</Typography>
								<Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
									<Button
										fullWidth
										variant="contained"
										onClick={() => handleSubmit("website")}
										disabled={loading}
										startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SaveOutlinedIcon />}
										sx={{
											borderRadius: 2,
											py: 1.2,
											textTransform: "none",
											fontWeight: 700,
											bgcolor: "#10b981",
											color: "#fff",
											boxShadow: "0 4px 14px rgba(16,185,129,0.25)",
											"&:hover": { bgcolor: "#059669" },
										}}
									>
										Save Website Info
									</Button>
									<Button
										fullWidth
										variant="contained"
										onClick={() => handleSubmit("logo")}
										disabled={loading}
										startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ImageOutlinedIcon />}
										sx={{
											borderRadius: 2,
											py: 1.2,
											textTransform: "none",
											fontWeight: 700,
											bgcolor: "#6366f1",
											color: "#fff",
											boxShadow: "0 4px 14px rgba(99,102,241,0.25)",
											"&:hover": { bgcolor: "#4f46e5" },
										}}
									>
										Save Logo/Banner
									</Button>
								</Stack>
							</CardContent>
						</Card>
					</Stack>
				</Grid>
			</Grid>

			{/* ── Media Dialog ── */}
			<Dialog open={mediaOpen} onClose={() => setMediaOpen(false)} fullWidth maxWidth="lg" PaperProps={{ sx: { borderRadius: 2.5 } }}>
				<DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
					<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Select Media</Typography>
					<IconButton size="small" onClick={() => setMediaOpen(false)}><CloseIcon /></IconButton>
				</DialogTitle>
				<DialogContent>
					<AllMedia onSelect={(it) => handleMediaSelect(it)} single />
				</DialogContent>
			</Dialog>
		</Box>
	);
};

export default WebsiteLogoSetting;
