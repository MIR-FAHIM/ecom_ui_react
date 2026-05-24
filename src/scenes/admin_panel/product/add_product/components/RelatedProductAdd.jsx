import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
	Avatar,
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	CircularProgress,
	Divider,
	FormControl,
	InputAdornment,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";
import {
	addRelatedProducts,
	getProductVa,
	getRelatedProducts,
} from "../../../../../api/controller/admin_controller/product/product_varient_controller";
import { image_file_url } from "../../../../../api/config/index.jsx";

/* ─── helpers ─────────────────────────────────────────── */
const normalizeList = (x) => {
	if (!x) return [];
	if (Array.isArray(x)) return x;
	if (Array.isArray(x?.data)) return x.data;
	if (Array.isArray(x?.data?.data)) return x.data.data;
	if (Array.isArray(x?.data?.data?.data)) return x.data.data.data;
	if (Array.isArray(x?.data?.items)) return x.data.items;
	const inner = x?.data ?? x;
	if (inner && typeof inner === "object") {
		for (const k of Object.keys(inner)) {
			if (Array.isArray(inner[k])) return inner[k];
		}
	}
	return [];
};

const getThumb = (p) => {
	if (p?.thumbnail_img) return `${image_file_url}/${p.thumbnail_img}`;
	if (p?.primary_image?.file_name) return `${image_file_url}/${p.primary_image.file_name}`;
	return null;
};

/* ─── ProductAvatar ────────────────────────────────────── */
function ProductAvatar({ product, size = 32 }) {
	const [err, setErr] = useState(false);
	const src = getThumb(product);
	if (!src || err) {
		return (
			<Avatar variant="rounded" sx={{ width: size, height: size, bgcolor: "#f1f5f9" }}>
				<ImageNotSupportedOutlinedIcon sx={{ fontSize: size * 0.45, color: "#94a3b8" }} />
			</Avatar>
		);
	}
	return (
		<Avatar
			variant="rounded"
			src={src}
			alt={product?.name}
			onError={() => setErr(true)}
			sx={{ width: size, height: size, flexShrink: 0 }}
		/>
	);
}

/* ─── SectionHeader ────────────────────────────────────── */
const SectionHeader = ({ icon, title, color = "#6366f1", bg = "#eef2ff" }) => (
	<Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
		<Box sx={{ width: 30, height: 30, borderRadius: 1.5, bgcolor: bg, display: "grid", placeItems: "center", color }}>
			{icon}
		</Box>
		<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{title}</Typography>
	</Stack>
);

const fieldSx = {
	"& .MuiOutlinedInput-root": {
		borderRadius: 2,
		"&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#6366f1" },
	},
	"& .MuiInputLabel-root.Mui-focused": { color: "#6366f1" },
};

/* ─── RelatedProductAdd ────────────────────────────────── */
const RelatedProductAdd = ({ productId, onAdded }) => {
	const [searchParams] = useSearchParams();
	const [products, setProducts] = useState([]);
	const [existing, setExisting] = useState([]);
	const [loading, setLoading] = useState(false);
	const [existingLoading, setExistingLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [message, setMessage] = useState("");
	const [query, setQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");
	const [relatedId, setRelatedId] = useState("");
	const debounceRef = useRef(null);

	const resolvedProductId =
		productId ?? searchParams.get("product_id") ?? searchParams.get("productId") ?? "";

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			try {
				const res = await getProductVa();
				setProducts(normalizeList(res?.data ?? res));
			} catch {
				setProducts([]);
			} finally {
				setLoading(false);
			}
		};
		load();
	}, []);

	const loadExisting = async () => {
		if (!resolvedProductId) return;
		setExistingLoading(true);
		try {
			const res = await getRelatedProducts(resolvedProductId);
			setExisting(normalizeList(res?.data ?? res));
		} catch {
			setExisting([]);
		} finally {
			setExistingLoading(false);
		}
	};

	useEffect(() => {
		loadExisting();
	}, [resolvedProductId]);

	useEffect(() => {
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => setDebouncedQuery(query), 300);
		return () => clearTimeout(debounceRef.current);
	}, [query]);

	const existingIds = useMemo(
		() => new Set(existing.map((r) => String(r?.related_product_id ?? r?.id))),
		[existing]
	);

	const filtered = useMemo(() => {
		let list = products.filter((p) => String(p?.id) !== String(resolvedProductId));
		const q = debouncedQuery.trim().toLowerCase();
		if (!q) return list;
		return list.filter((p) => {
			const name = String(p?.name ?? "").toLowerCase();
			const sku = String(p?.sku ?? "").toLowerCase();
			const id = String(p?.id ?? "");
			return name.includes(q) || sku.includes(q) || id.includes(q);
		});
	}, [products, debouncedQuery, resolvedProductId]);

	const selectedProduct = useMemo(
		() => products.find((p) => String(p?.id) === String(relatedId)) || null,
		[products, relatedId]
	);

	const isAlreadyAdded = relatedId ? existingIds.has(String(relatedId)) : false;

	const handleAdd = async () => {
		if (!resolvedProductId || !relatedId || isAlreadyAdded) return;
		setSubmitting(true);
		setError("");
		setMessage("");
		try {
			const res = await addRelatedProducts({
				product_id: Number(resolvedProductId),
				related_product_id: Number(relatedId),
			});
			if (res?.status === "success") {
				setMessage(res?.message || "Related product added successfully.");
				setRelatedId("");
				setQuery("");
				await loadExisting();
				if (onAdded) onAdded(res);
			} else {
				setError(res?.message || "Failed to add related product.");
			}
		} catch (err) {
			setError(err?.message || "Failed to add related product.");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

			{/* ── Currently Related ── */}
			{resolvedProductId && (
				<Card variant="outlined" sx={{ borderRadius: 2, borderColor: "divider" }}>
					<CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
						<SectionHeader
							icon={<LinkOutlinedIcon sx={{ fontSize: 16 }} />}
							title={`Currently Related (${existingLoading ? "…" : existing.length})`}
							color="#6366f1"
							bg="#eef2ff"
						/>

						{existingLoading ? (
							<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1 }}>
								<CircularProgress size={16} sx={{ color: "#6366f1" }} />
								<Typography variant="body2" color="text.secondary">Loading related products…</Typography>
							</Box>
						) : existing.length === 0 ? (
							<Box sx={{
								py: 3, display: "flex", flexDirection: "column", alignItems: "center",
								gap: 1, bgcolor: "#f8fafc", borderRadius: 2, border: "1px dashed #e2e8f0",
							}}>
								<LinkOutlinedIcon sx={{ fontSize: 28, color: "#cbd5e1" }} />
								<Typography variant="body2" color="text.secondary">
									No related products added yet.
								</Typography>
							</Box>
						) : (
							<Stack direction="row" flexWrap="wrap" gap={1}>
								{existing.map((r) => {
									const rp =
										r?.related_product ??
										products.find((p) => String(p?.id) === String(r?.related_product_id));
									const label = rp?.name || r?.related_product?.name || `#${r?.related_product_id}`;
									return (
										<Chip
											key={r?.id ?? r?.related_product_id}
											avatar={
												<Avatar src={getThumb(rp)} variant="rounded"
													sx={{ width: "20px !important", height: "20px !important", borderRadius: "4px !important" }}
												/>
											}
											label={label}
											size="small"
											sx={{
												bgcolor: "#eef2ff",
												color: "#4338ca",
												fontWeight: 600,
												fontSize: 12,
												border: "1px solid #c7d2fe",
												"& .MuiChip-avatar": { ml: "4px" },
											}}
										/>
									);
								})}
							</Stack>
						)}
					</CardContent>
				</Card>
			)}

			{/* ── Add Related Product ── */}
			<Card variant="outlined" sx={{ borderRadius: 2, borderColor: "divider" }}>
				<CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
					<SectionHeader
						icon={<InventoryOutlinedIcon sx={{ fontSize: 16 }} />}
						title="Add Related Product"
						color="#0891b2"
						bg="#ecfeff"
					/>

					{/* Search */}
					<TextField
						fullWidth
						size="small"
						placeholder="Search by name, SKU or ID…"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						sx={{ mb: 2, ...fieldSx }}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<SearchIcon sx={{ fontSize: 18, color: "text.disabled" }} />
								</InputAdornment>
							),
						}}
					/>

					{/* Dropdown */}
					<FormControl fullWidth size="small" sx={{ mb: 2, ...fieldSx }}>
						<InputLabel id="related-product-label">Select product</InputLabel>
						<Select
							labelId="related-product-label"
							value={relatedId}
							label="Select product"
							onChange={(e) => setRelatedId(e.target.value)}
							disabled={loading}
							MenuProps={{ PaperProps: { sx: { borderRadius: 2, maxHeight: 320 } } }}
							renderValue={() =>
								selectedProduct ? (
									<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
										<ProductAvatar product={selectedProduct} size={22} />
										<Typography variant="body2" fontWeight={600} noWrap>
											{selectedProduct.name}
										</Typography>
									</Box>
								) : (
									<Typography variant="body2" color="text.disabled" component="span">
										Select a product
									</Typography>
								)
							}
						>
							{loading && (
								<MenuItem disabled sx={{ justifyContent: "center", py: 2 }}>
									<CircularProgress size={18} sx={{ color: "#6366f1" }} />
								</MenuItem>
							)}

							{!loading && filtered.length === 0 && (
								<MenuItem disabled sx={{ justifyContent: "center", py: 2 }}>
									<Typography variant="body2" color="text.secondary">
										No products match your search.
									</Typography>
								</MenuItem>
							)}

							{filtered.map((p) => {
								const already = existingIds.has(String(p?.id));
								return (
									<MenuItem
										key={p?.id}
										value={p?.id}
										disabled={already}
										sx={{
											borderRadius: 1,
											mx: 0.5,
											"&.Mui-selected": { bgcolor: "#eef2ff" },
											"&:hover": { bgcolor: "#f8fafc" },
										}}
									>
										<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, width: "100%", py: 0.25 }}>
											<ProductAvatar product={p} size={36} />
											<Box sx={{ flex: 1, minWidth: 0 }}>
												<Typography variant="body2" fontWeight={600} noWrap>
													{p?.name || p?.title || `Product #${p?.id}`}
												</Typography>
												{p?.sku && (
													<Typography variant="caption" color="text.secondary" noWrap>
														SKU: {p.sku}
													</Typography>
												)}
											</Box>
											{already && (
												<Chip
													label="Added"
													size="small"
													sx={{ fontSize: 10, height: 18, bgcolor: "#dcfce7", color: "#16a34a", fontWeight: 700 }}
												/>
											)}
										</Box>
									</MenuItem>
								);
							})}
						</Select>
					</FormControl>

					{/* Selected preview card */}
					{selectedProduct && !isAlreadyAdded && (
						<Box sx={{
							display: "flex", alignItems: "center", gap: 1.5,
							p: 1.5, mb: 2, bgcolor: "#f0fdf4", borderRadius: 2,
							border: "1px solid #bbf7d0",
						}}>
							<ProductAvatar product={selectedProduct} size={44} />
							<Box sx={{ flex: 1, minWidth: 0 }}>
								<Typography variant="body2" fontWeight={700} noWrap>
									{selectedProduct.name}
								</Typography>
								{selectedProduct.sku && (
									<Typography variant="caption" color="text.secondary">
										SKU: {selectedProduct.sku}
									</Typography>
								)}
							</Box>
							<CheckCircleOutlineIcon sx={{ color: "#16a34a", fontSize: 20, flexShrink: 0 }} />
						</Box>
					)}

					{/* Inline feedback */}
					{isAlreadyAdded && (
						<Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1.5, mb: 2, bgcolor: "#fffbeb", borderRadius: 2, border: "1px solid #fde68a" }}>
							<Typography variant="body2" color="#b45309" fontWeight={500}>
								This product is already in the related list.
							</Typography>
						</Box>
					)}

					{error && (
						<Box sx={{ p: 1.5, mb: 2, bgcolor: "#fef2f2", borderRadius: 2, border: "1px solid #fecaca" }}>
							<Typography variant="body2" color="error" fontWeight={500}>{error}</Typography>
						</Box>
					)}

					{message && (
						<Box sx={{ p: 1.5, mb: 2, bgcolor: "#f0fdf4", borderRadius: 2, border: "1px solid #bbf7d0" }}>
							<Typography variant="body2" color="success.main" fontWeight={500}>{message}</Typography>
						</Box>
					)}

					<Divider sx={{ mb: 2 }} />

					<Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
						<Button
							variant="contained"
							startIcon={
								submitting
									? <CircularProgress size={14} color="inherit" />
									: <AddCircleOutlineIcon />
							}
							onClick={handleAdd}
							disabled={!resolvedProductId || !relatedId || submitting || isAlreadyAdded}
							sx={{
								textTransform: "none",
								fontWeight: 700,
								borderRadius: 2,
								px: 3,
								bgcolor: "#6366f1",
								"&:hover": { bgcolor: "#4f46e5" },
								"&.Mui-disabled": { bgcolor: "#e0e7ff", color: "#a5b4fc" },
							}}
						>
							{submitting ? "Adding…" : "Add Related Product"}
						</Button>

						{!resolvedProductId && (
							<Typography variant="caption" color="text.secondary">
								Save the product first to enable this.
							</Typography>
						)}
					</Box>
				</CardContent>
			</Card>
		</Box>
	);
};

export default RelatedProductAdd;
