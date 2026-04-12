import React, { useMemo } from "react";
import { Box, Card, CardContent, Typography, useTheme } from "@mui/material";

const htmlToText = (html) => {
	if (!html) return "";
	const tmp = document.createElement("div");
	tmp.innerHTML = String(html);
	return (tmp.textContent || tmp.innerText || "").replace(/\n{3,}/g, "\n\n").trim();
};

const ProductDescription = ({ description, ink, subInk }) => {
	const theme = useTheme();
	const semantic = theme.palette.semantic || {};

	const titleColor = ink || semantic.ink || (theme.palette.mode === "dark" ? "rgba(255,255,255,0.92)" : "rgba(0,0,0,0.88)");
	const bodyColor = subInk || semantic.subInk || (theme.palette.mode === "dark" ? "rgba(255,255,255,0.68)" : "rgba(0,0,0,0.58)");

	const descriptionText = useMemo(() => htmlToText(description), [description]);

	return (
		<Card sx={{ borderRadius: 2.5, border: "1px solid", borderColor: "divider" }}>
			<CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
				<Typography variant="subtitle1" sx={{ fontWeight: 700, color: titleColor, mb: 1.5 }}>
					Description
				</Typography>
				<Typography variant="body2" sx={{ color: bodyColor, fontWeight: 500, whiteSpace: "pre-line", lineHeight: 1.8 }}>
					{descriptionText || "No detailed description available."}
				</Typography>
			</CardContent>
		</Card>
	);
};

export default ProductDescription;
