import React, { useEffect, useMemo, useState } from "react";
import { Box, Grid, Card, CardActionArea, CardMedia, CardContent, Typography, Button, CircularProgress, Checkbox, Pagination, TextField, Alert } from "@mui/material";

import { getAllMedia , addMedia} from "../../../api/controller/admin_controller/media/media_controller";
import { image_file_url } from "../../../api/config/index.jsx";

// Admin media browser + selector
// Props:
// - endpoint: API endpoint to fetch media (default: '/api/files/list')
// - onSelect: function(imageId) called when user confirms selection
// - single: boolean, whether only single selection allowed (default true)
export default function AllMedia({ endpoint = "/api/files/list", onSelect, single = true }) {
	const [loading, setLoading] = useState(false);
	const [items, setItems] = useState([]);
	const [selected, setSelected] = useState(single ? null : []);
	const [page, setPage] = useState(1);
	const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 20 });
	const [uploading, setUploading] = useState(false);
	const [uploadError, setUploadError] = useState("");
	const [uploadSuccess, setUploadSuccess] = useState("");
	const [uploadUserId, setUploadUserId] = useState(() => {
		return (
			localStorage.getItem("userId") 
		);
	});
	const [uploadFile, setUploadFile] = useState(null);
	const [reload, setReload] = useState(0);

	const pageCount = useMemo(() => {
		const last = Number(meta?.last_page ?? 1);
		return Number.isFinite(last) && last > 0 ? last : 1;
	}, [meta]);

	useEffect(() => {
		let mounted = true;
		const load = async () => {
			setLoading(true);
			try {
				const resp = await getAllMedia({ page });
				// Response shapes vary; support common shapes:
				// { success: true, data: { current_page, data: [ ... ] } }
				// or { data: [ ... ] } or [ ... ]
				const body = resp ?? {};
				const payload = body?.data ?? body;
				const list = payload?.data ?? payload ?? [];
				if (mounted) {
					setItems(Array.isArray(list) ? list : []);
					if (payload && typeof payload === "object") {
						setMeta({
							current_page: payload.current_page ?? 1,
							last_page: payload.last_page ?? 1,
							total: payload.total ?? 0,
							per_page: payload.per_page ?? 20,
						});
					} else {
						setMeta({ current_page: 1, last_page: 1, total: Array.isArray(list) ? list.length : 0, per_page: 20 });
					}
				}
			} catch (err) {
				console.error("Failed to load media:", err);
				if (mounted) {
					setItems([]);
					setMeta({ current_page: 1, last_page: 1, total: 0, per_page: 20 });
				}
			} finally {
				if (mounted) setLoading(false);
			}
		};

		load();
		return () => (mounted = false);
	}, [endpoint, page, reload]);

	useEffect(() => {
		setSelected(single ? null : []);
	}, [page, single]);

	const toggle = (id) => {
		if (single) {
			const next = (String(selected) === String(id)) ? null : id;
			setSelected(next);
			if (onSelect) {
				const item = items.find((it) => String(it.id) === String(id));
				onSelect(item ?? null);
			}
			return;
		}

		setSelected((arr) => {
			const set = Array.isArray(arr) ? [...arr] : [];
			const idx = set.findIndex((x) => String(x) === String(id));
			if (idx >= 0) set.splice(idx, 1);
			else set.push(id);
			return set;
		});
	};

	const confirm = () => {
		if (!onSelect) return;

		if (single) {
			const item = items.find((it) => String(it.id) === String(selected));
			onSelect(item ?? null);
			return;
		}

		const selectedItems = Array.isArray(selected)
			? items.filter((it) => selected.find((id) => String(id) === String(it.id)))
			: [];
		onSelect(selectedItems);
	};

	const handleUpload = async () => {
		setUploadError("");
		setUploadSuccess("");
		if (!uploadFile) {
			setUploadError("Please choose an image file.");
			return;
		}
		if (!uploadUserId) {
			setUploadError("User ID is required.");
			return;
		}

		try {
			setUploading(true);
			const fd = new FormData();
			fd.append("file", uploadFile);
			fd.append("user_id", uploadUserId);
			await addMedia(fd);
			setUploadSuccess("Image uploaded successfully.");
			setUploadFile(null);
			setUploadUserId("");
			setPage(1);
			setReload((n) => n + 1);
		} catch (err) {
			console.error("Upload failed:", err);
			setUploadError(err?.response?.data?.message || err.message || "Upload failed");
		} finally {
			setUploading(false);
		}
	};

	return (
		<Box>
			<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
				<Typography variant="h6">Media Library</Typography>
				<Box>
					<Button variant="outlined" onClick={() => { setSelected(single ? null : []); }}>Clear</Button>
					<Button sx={{ ml: 1 }} variant="contained" onClick={confirm} disabled={single ? !selected : !(selected && selected.length)}>
						Use Selected
					</Button>
				</Box>
			</Box>

			<Box sx={{ mb: 2, p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
				<Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>
					Add Image
				</Typography>
				<Grid container spacing={2} alignItems="center">
	
					<Grid item xs={12} md={5}>
						<Button variant="contained" component="label" fullWidth>
							{uploadFile ? uploadFile.name : "Choose Image"}
							<input
								hidden
								type="file"
								accept="image/*"
								onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
							/>
						</Button>
					</Grid>
					<Grid item xs={12} md={3}>
						<Button variant="contained" fullWidth onClick={handleUpload} disabled={uploading}>
							{uploading ? "Uploading..." : "Upload"}
						</Button>
					</Grid>
				</Grid>
				{uploadError && (
					<Alert severity="error" sx={{ mt: 2 }}>
						{uploadError}
					</Alert>
				)}
				{uploadSuccess && (
					<Alert severity="success" sx={{ mt: 2 }}>
						{uploadSuccess}
					</Alert>
				)}
			</Box>

			{loading ? (
				<Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
					<CircularProgress />
				</Box>
			) : (
				<Grid container spacing={2}>
					{items.map((it) => {
						const img = it?.url || (it?.file_name ? `${image_file_url}/${it.file_name}` : null) || "/assets/images/placeholder.png";
						const isChecked = single ? String(selected) === String(it.id) : (Array.isArray(selected) && selected.find((x) => String(x) === String(it.id)));

						return (
							<Grid key={it.id} item xs={6} sm={4} md={2}>
								<Card>
									<CardActionArea onClick={() => toggle(it.id)}>
										<CardMedia component="img" height="120" image={img} alt={it.file_original_name || it.file_name} sx={{ objectFit: "cover" }} />
										<CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 1 }}>
											<Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>{it.file_original_name || it.file_name}</Typography>
											<Checkbox checked={Boolean(isChecked)} onChange={() => toggle(it.id)} />
										</CardContent>
									</CardActionArea>
								</Card>
							</Grid>
						);
					})}
				</Grid>
			)}

			<Box sx={{ mt: 3, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
				<Typography variant="body2" color="text.secondary">
					Page {meta.current_page ?? page} of {pageCount} • Total {meta.total ?? 0}
				</Typography>
				<Pagination
					count={pageCount}
					page={page}
					onChange={(e, value) => setPage(value)}
					color="primary"
					size="small"
					showFirstButton
					showLastButton
				/>
			</Box>
		</Box>
	);
}

