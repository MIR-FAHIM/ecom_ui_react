import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
	Box,
	Button,
	CircularProgress,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	TextField,
	Typography,
} from "@mui/material";
import {
	addRelatedProducts,
	getProductVa,
} from "../../../../../api/controller/admin_controller/product/product_varient_controller";

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

const RelatedProductAdd = ({ productId, onAdded }) => {
	const [searchParams] = useSearchParams();
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [message, setMessage] = useState("");
	const [query, setQuery] = useState("");
	const [relatedId, setRelatedId] = useState("");
	const resolvedProductId =
		productId ?? searchParams.get("product_id") ?? searchParams.get("productId") ?? "";

	useEffect(() => {
		const loadProducts = async () => {
			setLoading(true);
			setError("");
			try {
				const res = await getProductVa();
				const list = normalizeList(res?.data ?? res);
				setProducts(list);
			} catch (err) {
				console.error("Failed to load products", err);
				setProducts([]);
				setError("Failed to load products.");
			} finally {
				setLoading(false);
			}
		};

		loadProducts();
	}, []);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return products;
		return products.filter((p) => {
			const name = String(p?.name ?? "").toLowerCase();
			const sku = String(p?.sku ?? "").toLowerCase();
			const id = String(p?.id ?? "").toLowerCase();
			return name.includes(q) || sku.includes(q) || id.includes(q);
		});
	}, [products, query]);

	const handleAdd = async () => {
		if (!resolvedProductId || !relatedId) return;
		setSubmitting(true);
		setError("");
		setMessage("");
		try {
			const payload = {
				product_id: Number(resolvedProductId),
				related_product_id: Number(relatedId),
			};
			const res = await addRelatedProducts(payload);
			if (res?.status === "success") {
				setMessage(res?.message || "Related product added.");
				setRelatedId("");
				if (onAdded) onAdded(res);
			} else {
				setError(res?.message || "Failed to add related product.");
			}
		} catch (err) {
			console.error("Failed to add related product", err);
			setError(err?.message || "Failed to add related product.");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Box>
			<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
				Add a related product to this item.
			</Typography>

			<TextField
				fullWidth
				size="small"
				label="Search products"
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				sx={{ mb: 2 }}
			/>

			<FormControl fullWidth size="small" sx={{ mb: 2 }}>
				<InputLabel id="related-product-label">Related product</InputLabel>
				<Select
					labelId="related-product-label"
					value={relatedId}
					label="Related product"
					onChange={(e) => setRelatedId(e.target.value)}
					disabled={loading}
				>
					<MenuItem value="">
						<em>Select a product</em>
					</MenuItem>
					{filtered.map((p) => (
						<MenuItem key={p?.id} value={p?.id}>
							{p?.name || p?.title || `Product #${p?.id}`}
						</MenuItem>
					))}
				</Select>
			</FormControl>

			{loading ? (
				<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
					<CircularProgress size={18} />
					<Typography variant="body2">Loading products...</Typography>
				</Box>
			) : null}

			{error ? (
				<Typography variant="body2" color="error" sx={{ mb: 1 }}>
					{error}
				</Typography>
			) : null}

			{message ? (
				<Typography variant="body2" color="success.main" sx={{ mb: 1 }}>
					{message}
				</Typography>
			) : null}

			<Button
				variant="contained"
				onClick={handleAdd}
				disabled={!resolvedProductId || !relatedId || submitting}
				sx={{ textTransform: "none", fontWeight: 700 }}
			>
				{submitting ? "Adding..." : "Add Related Product"}
			</Button>
			{!resolvedProductId ? (
				<Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
					Save the product first to enable related products.
				</Typography>
			) : null}
		</Box>
	);
};

export default RelatedProductAdd;
