import React from "react";
import { Box, Card, IconButton, Tooltip, useTheme } from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RefreshIcon from "@mui/icons-material/Refresh";

const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

const ProductDetailImage = ({
	mainImage,
	mainImagePath,
	productName,
	zoom,
	setZoom,
	images,
	onSelectImage,
	buildImageUrl,
	divider,
	surface,
	surface2,
	brandGradient,
	brandGlow,
}) => {
	const theme = useTheme();

	return (
		<Card
			sx={{
				borderRadius: 4,
				border: `1px solid ${divider}`,
				background: surface,
				overflow: "hidden",
				backdropFilter: "blur(12px)",
			}}
		>
			<Box
				sx={{
					position: "relative",
					height: { xs: 360, md: 520 },
					background:
						theme.palette.mode === "dark"
							? "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))"
							: "linear-gradient(135deg, rgba(0,0,0,0.03), rgba(0,0,0,0.01))",
					display: "grid",
					placeItems: "center",
					overflow: "hidden",
				}}
			>
				<Box
					component="img"
					src={mainImage}
					alt={productName || "product"}
					loading="lazy"
					onError={(e) => {
						e.currentTarget.onerror = null;
						e.currentTarget.src = "/assets/images/placeholder.png";
					}}
					sx={{
						width: "100%",
						height: "100%",
						objectFit: "contain",
						transform: `scale(${zoom})`,
						transformOrigin: "center",
						transition: "transform 180ms ease",
						filter: "saturate(1.06)",
						p: 2,
					}}
				/>

				<Box
					sx={{
						position: "absolute",
						top: 12,
						right: 12,
						display: "flex",
						gap: 0.8,
						p: 0.7,
						borderRadius: 999,
						border: `1px solid ${divider}`,
						background: surface,
						backdropFilter: "blur(12px)",
					}}
				>
					<Tooltip title="Zoom out">
						<IconButton
							size="small"
							onClick={() => setZoom((z) => clamp(Number((z - 0.25).toFixed(2)), 0.75, 2.5))}
							sx={{ borderRadius: 999 }}
						>
							<ZoomOutIcon fontSize="small" />
						</IconButton>
					</Tooltip>

					<Tooltip title="Zoom in">
						<IconButton
							size="small"
							onClick={() => setZoom((z) => clamp(Number((z + 0.25).toFixed(2)), 0.75, 2.5))}
							sx={{ borderRadius: 999 }}
						>
							<ZoomInIcon fontSize="small" />
						</IconButton>
					</Tooltip>

					<Tooltip title="Reset">
						<IconButton size="small" onClick={() => setZoom(1)} sx={{ borderRadius: 999 }}>
							<RefreshIcon fontSize="small" />
						</IconButton>
					</Tooltip>
				</Box>
			</Box>

			{images.length > 0 ? (
				<Box
					sx={{
						p: 1.2,
						display: "flex",
						gap: 1,
						overflowX: "auto",
						borderTop: `1px solid ${divider}`,
						background: surface2,
						scrollSnapType: "x mandatory",
					}}
				>
					{images.map((img) => {
						const src = buildImageUrl(img.file_name);
						const selected = img.file_name === mainImagePath;

						return (
							<Box
								key={img.id}
								onClick={() => {
									onSelectImage(img.file_name);
									setZoom(1);
								}}
								sx={{
									cursor: "pointer",
									borderRadius: 2,
									border: `1px solid ${selected ? "transparent" : divider}`,
									background: selected ? brandGradient : surface,
									p: 0.6,
									scrollSnapAlign: "start",
									boxShadow: selected ? `0 12px 24px ${brandGlow}` : "none",
									transition: "transform 120ms ease",
									"&:hover": { transform: "translateY(-1px)" },
								}}
							>
								<Box
									component="img"
									src={src || "/assets/images/placeholder.png"}
									alt=""
									sx={{
										width: 72,
										height: 72,
										objectFit: "cover",
										borderRadius: 1.6,
										display: "block",
										filter: "saturate(1.05)",
									}}
								/>
							</Box>
						);
					})}
				</Box>
			) : null}
		</Card>
	);
};

export default ProductDetailImage;
