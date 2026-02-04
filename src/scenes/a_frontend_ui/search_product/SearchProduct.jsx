import React, { useEffect, useMemo, useState } from "react";
import {
	Box,
	TextField,
	InputAdornment,
	Button,
	IconButton,
	Paper,
	Typography,
	CircularProgress,
	Stack,
	useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";

import { getProduct } from "../../../api/controller/admin_controller/product/product_controller";
import { image_file_url } from "../../../api/config";
import { tokens } from "../../../theme";

const safeArray = (x) => (Array.isArray(x) ? x : []);

const SearchProduct = ({
	placeholder = "Search products...",
	size = "small",
	isMobile = false,
	fullWidth = true,
	maxResults = 6,
}) => {
	const theme = useTheme();
	const navigate = useNavigate();

	const colors = tokens(theme.palette.mode);
	const border = colors.gray[600];
	const glass = theme.palette.mode === "dark" ? colors.primary[400] : colors.primary[300];
	const glass2 = theme.palette.mode === "dark" ? colors.primary[300] : colors.primary[200];

	const [query, setQuery] = useState("");
	const [loading, setLoading] = useState(false);
	const [results, setResults] = useState([]);
	const [open, setOpen] = useState(false);

	const handleSearch = () => {
		const q = (query || "").trim();
		navigate("/");
		window.dispatchEvent(new CustomEvent("search", { detail: q }));
		setOpen(false);
	};

	const onKeyDown = (e) => {
		if (e.key === "Enter") handleSearch();
	};

	useEffect(() => {
		const q = (query || "").trim();
		if (q.length < 2) {
			setResults([]);
			setOpen(false);
			return;
		}

		let alive = true;
		setLoading(true);

		const t = setTimeout(async () => {
			try {
				const res = await getProduct({ search: q, page: 1, per_page: maxResults });
				const list = res?.data?.data ?? res?.data ?? [];
				if (!alive) return;
				setResults(safeArray(list));
				setOpen(true);
			} catch (e) {
				console.error("SearchProduct error:", e);
				if (!alive) return;
				setResults([]);
				setOpen(true);
			} finally {
				if (alive) setLoading(false);
			}
		}, 250);

		return () => {
			alive = false;
			clearTimeout(t);
		};
	}, [query, maxResults]);

	const renderImage = (product) => {
		const file = product?.primary_image?.file_name || product?.image || product?.file_name;
		if (!file) return "https://via.placeholder.com/80x80?text=No+Image";
		const safeFile = String(file).replaceAll("\\/", "/").replace(/^\/+/, "");
		const base = String(image_file_url || "").replace(/\/+$/, "");
		return `${base}/${safeFile}`;
	};

	const money = useMemo(
		() => (n) => new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(Number(n || 0)),
		[]
	);

	return (
		<Box sx={{ position: "relative", width: fullWidth ? "100%" : "auto" }}>
			<TextField
				size={size}
				placeholder={placeholder}
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				onKeyDown={onKeyDown}
				fullWidth={fullWidth}
				InputProps={{
					startAdornment: (
						<InputAdornment position="start">
							<SearchIcon sx={{ opacity: 0.75 }} />
						</InputAdornment>
					),
					endAdornment: (
						<InputAdornment position="end">
							{isMobile ? (
								<IconButton
									onClick={handleSearch}
									sx={{
										borderRadius: 3,
										border: `1px solid ${border}`,
										background: theme.palette.secondary.main,
										color: colors.gray[900],
									}}
								>
									<SearchIcon />
								</IconButton>
							) : (
								<Button
									onClick={handleSearch}
									size="small"
									variant="contained"
									sx={{
										borderRadius: 999,
										textTransform: "none",
										fontWeight: 900,
										px: 2,
										boxShadow: "none",
										background: theme.palette.primary.main,
										"&:hover": { opacity: 0.92, boxShadow: "none" },
									}}
								>
									Search
								</Button>
							)}
						</InputAdornment>
					),
				}}
				sx={{
					"& .MuiOutlinedInput-root": {
						borderRadius: 999,
						background: glass,
						border: `1px solid ${border}`,
						"& fieldset": { borderColor: "transparent" },
						"&:hover": { background: glass2 },
						"&.Mui-focused": {
							background: glass2,
							borderColor: theme.palette.primary.main,
						},
					},
				}}
			/>

			{open ? (
				<Paper
					elevation={0}
					sx={{
						position: "absolute",
						top: "calc(100% + 8px)",
						left: 0,
						right: 0,
						zIndex: 10,
						borderRadius: 3,
						border: `1px solid ${border}`,
						background: glass,
						backdropFilter: "blur(10px)",
						p: 1,
						maxHeight: 360,
						overflow: "auto",
					}}
				>
					{loading ? (
						<Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
							<CircularProgress size={20} />
						</Box>
					) : results.length === 0 ? (
						<Typography variant="body2" sx={{ color: "text.secondary", px: 1, py: 1.2 }}>
							No products found.
						</Typography>
					) : (
						<Stack spacing={1}>
							{results.map((product) => (
								<Box
									key={product?.id}
									onMouseDown={(e) => e.preventDefault()}
									onClick={() => {
										setOpen(false);
										navigate(`/product/${product?.id}`);
									}}
									sx={{
										display: "flex",
										gap: 1.2,
										alignItems: "center",
										p: 1,
										borderRadius: 2,
										border: `1px solid ${border}`,
										background: glass2,
										cursor: "pointer",
										"&:hover": { background: glass },
									}}
								>
									<Box
										component="img"
										src={renderImage(product)}
										alt={product?.name || "product"}
										sx={{ width: 56, height: 56, borderRadius: 2, objectFit: "cover" }}
										onError={(e) => {
											e.currentTarget.onerror = null;
											e.currentTarget.src = "https://via.placeholder.com/80x80?text=No+Image";
										}}
									/>
									<Box sx={{ minWidth: 0 }}>
										<Typography
											sx={{
												fontWeight: 900,
												lineHeight: 1.2,
												display: "-webkit-box",
												WebkitLineClamp: 1,
												WebkitBoxOrient: "vertical",
												overflow: "hidden",
											}}
										>
											{product?.name || "Unnamed product"}
										</Typography>
										<Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
											{money(product?.unit_price ?? product?.price ?? 0)}
										</Typography>
									</Box>
								</Box>
							))}
						</Stack>
					)}
				</Paper>
			) : null}
		</Box>
	);
};

export default SearchProduct;
