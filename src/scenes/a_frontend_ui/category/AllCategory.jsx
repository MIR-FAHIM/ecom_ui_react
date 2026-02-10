import React, { useEffect, useState } from "react";
import {
	Box,
	Card,
	CardContent,
	CircularProgress,
	Container,
	Grid,
	Stack,
	Typography,
	useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../../theme";
import { image_file_url } from "../../../api/config/index.jsx";
import { getCategoryWithAllChildren } from "../../../api/controller/admin_controller/category/category_controller";

const safeArray = (value) => (Array.isArray(value) ? value : []);

const buildImageUrl = (media) => {
	if (!media) return "";
	const base = String(image_file_url || "").replace(/\/+$/, "");

	if (typeof media === "object") {
		const direct = media?.url || media?.external_link;
		if (direct && /^https?:\/\//i.test(String(direct))) return String(direct);
		const fileName = media?.file_name || media?.file_original_name;
		if (fileName) {
			const path = String(fileName).replace(/^\/+/, "");
			return `${base}/${path}`;
		}
	}

	const raw = String(media);
	if (/^https?:\/\//i.test(raw)) return raw;
	if (!base) return "";
	const path = raw.replace(/^\/+/, "");
	return `${base}/${path}`;
};

const AllCategory = () => {
	const theme = useTheme();
	const colors = tokens(theme.palette.mode);
	const navigate = useNavigate();

	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			setError("");
			try {
				const res = await getCategoryWithAllChildren();
				const payload = res?.data ?? res;
				const list = safeArray(payload?.data ?? payload);
				setCategories(list);
			} catch (e) {
				console.error("Failed to load categories", e);
				setError("Failed to load categories.");
				setCategories([]);
			} finally {
				setLoading(false);
			}
		};

		load();
	}, []);

	return (
		<Box
			sx={{
				minHeight: "100vh",
				py: 4,
				background: theme.palette.background?.default || colors.primary[500],
			}}
		>
			<Container maxWidth="xl">
				<Box sx={{ mb: 3 }}>
					<Typography variant="h4" sx={{ fontWeight: 900, color: colors.gray[100] }}>
						All Categories
					</Typography>
					<Typography variant="body2" sx={{ color: colors.gray[300], mt: 0.5 }}>
						Browse every category and its children.
					</Typography>
				</Box>

				<Card sx={{ background: colors.primary[400], borderRadius: 3, border: `1px solid ${colors.primary[300]}` }}>
					<CardContent>
						{loading ? (
							<Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
								<CircularProgress size={24} />
							</Box>
						) : error ? (
							<Typography variant="body2" color="error">
								{error}
							</Typography>
						) : categories.length === 0 ? (
							<Typography variant="body2" sx={{ color: colors.gray[300] }}>
								No categories found.
							</Typography>
						) : (
							<Grid container spacing={2}>
								{categories.map((category) => {
									const banner = buildImageUrl(category?.banner || category?.icon || category?.cover_image);
									const children = safeArray(category?.children);

									return (
										<Grid item xs={12} md={6} lg={4} key={category?.id ?? category?.name}>
											<Box
												sx={{
													borderRadius: 3,
													border: `1px solid ${colors.primary[300]}`,
													background: colors.primary[500],
													p: 2,
													display: "flex",
													flexDirection: "column",
													gap: 2,
												}}
											>
												<Stack direction="row" spacing={2} alignItems="center">
													<Box
														component="img"
														src={banner || "https://via.placeholder.com/80x80?text=Cat"}
														alt={category?.name || "category"}
														sx={{
															width: 64,
															height: 64,
															borderRadius: 2,
															objectFit: "cover",
															background: colors.primary[400],
															border: `1px solid ${colors.primary[300]}`,
														}}
														onError={(e) => {
															e.currentTarget.onerror = null;
															e.currentTarget.src = "https://via.placeholder.com/80x80?text=Cat";
														}}
													/>
													<Box sx={{ minWidth: 0 }}>
														<Typography
															variant="h6"
															sx={{
																color: colors.gray[100],
																fontWeight: 900,
																letterSpacing: -0.2,
																cursor: "pointer",
															}}
															onClick={() => category?.id && navigate(`/category/${category.id}`)}
														>
															{category?.name || "Category"}
														</Typography>
														<Typography variant="caption" sx={{ color: colors.gray[300] }}>
															{children.length ? `${children.length} subcategories` : "No subcategories"}
														</Typography>
													</Box>
												</Stack>

												{children.length > 0 ? (
													<Grid container spacing={1}>
														{children.slice(0, 8).map((child) => (
															<Grid item xs={6} key={child?.id ?? child?.name}>
																<Box
																	onClick={() => child?.id && navigate(`/category/${child.id}`)}
																	sx={{
																		p: 1,
																		borderRadius: 2,
																		border: `1px solid ${colors.primary[300]}`,
																		background: colors.primary[400],
																		cursor: "pointer",
																		"&:hover": { background: colors.primary[300] },
																	}}
																>
																	<Typography
																		variant="body2"
																		sx={{
																			color: colors.gray[100],
																			fontWeight: 700,
																			display: "-webkit-box",
																			WebkitLineClamp: 1,
																			WebkitBoxOrient: "vertical",
																			overflow: "hidden",
																		}}
																	>
																		{child?.name || "Subcategory"}
																	</Typography>
																</Box>
															</Grid>
														))}
													</Grid>
												) : null}
											</Box>
										</Grid>
									);
								})}
							</Grid>
						)}
					</CardContent>
				</Card>
			</Container>
		</Box>
	);
};

export default AllCategory;
