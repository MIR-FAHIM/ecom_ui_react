import React, { useMemo } from "react";
import { Box, Typography, useTheme } from "@mui/material";

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
		<Box sx={{ mt: 3 }}>
			<Typography sx={{ fontWeight: 950, color: titleColor }}>Description</Typography>
			<Typography variant="body2" sx={{ color: bodyColor, fontWeight: 700, whiteSpace: "pre-line", mt: 0.5 }}>
				{descriptionText || "No detailed description available."}
			</Typography>
		</Box>
	);
};

export default ProductDescription;
