import React, { useMemo } from "react";
import { Box, Card, CardContent, Typography, useTheme } from "@mui/material";

const sanitizeHtml = (html) => {
	if (!html) return "";
	if (typeof window === "undefined" || typeof DOMParser === "undefined") {
		return String(html);
	}

	const parser = new DOMParser();
	const doc = parser.parseFromString(String(html), "text/html");

	doc.querySelectorAll("script, iframe, object, embed, link, meta").forEach((node) => node.remove());
	doc.body.querySelectorAll("*").forEach((node) => {
		Array.from(node.attributes).forEach((attr) => {
			const name = attr.name.toLowerCase();
			const value = attr.value || "";

			if (name.startsWith("on")) {
				node.removeAttribute(attr.name);
				return;
			}

			if ((name === "href" || name === "src") && /^\s*javascript:/i.test(value)) {
				node.removeAttribute(attr.name);
				return;
			}

			if (name === "style" && /expression\s*\(|javascript:/i.test(value)) {
				node.removeAttribute(attr.name);
			}
		});
	});

	return doc.body.innerHTML.trim();
};

const ProductDescription = ({ description, ink, subInk }) => {
	const theme = useTheme();
	const semantic = theme.palette.semantic || {};

	const titleColor = ink || semantic.ink || (theme.palette.mode === "dark" ? "rgba(255,255,255,0.92)" : "rgba(0,0,0,0.88)");
	const bodyColor = subInk || semantic.subInk || (theme.palette.mode === "dark" ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.72)");

	const html = useMemo(() => sanitizeHtml(description), [description]);
	const hasDescription = html.replace(/<[^>]*>/g, "").trim().length > 0;

	return (
		<Card sx={{ borderRadius: 1, border: "1px solid", borderColor: "divider" }}>
			<CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
				<Typography variant="subtitle1" sx={{ fontWeight: 700, color: titleColor, mb: 1.5 }}>
					Description
				</Typography>

				{hasDescription ? (
					<Box
						className="product-description-content"
						dangerouslySetInnerHTML={{ __html: html }}
						sx={{
							color: bodyColor,
							fontSize: 14,
							fontWeight: 500,
							lineHeight: 1.8,
							wordBreak: "break-word",
							"& *": {
								maxWidth: "100%",
							},
							"& p": {
								m: 0,
								mb: 1.25,
							},
							"& p:last-child": {
								mb: 0,
							},
							"& h1, & h2, & h3, & h4, & h5, & h6": {
								color: titleColor,
								fontWeight: 800,
								lineHeight: 1.3,
								mt: 2,
								mb: 1,
								letterSpacing: 0,
							},
							"& h1": { fontSize: 26 },
							"& h2": { fontSize: 22 },
							"& h3": { fontSize: 19 },
							"& h4": { fontSize: 17 },
							"& h5, & h6": { fontSize: 15 },
							"& strong, & b": {
								color: titleColor,
								fontWeight: 800,
							},
							"& ul, & ol": {
								mt: 0.75,
								mb: 1.5,
								pl: 3,
							},
							"& li": {
								mb: 0.5,
							},
							"& a": {
								color: theme.palette.primary.main,
								fontWeight: 700,
								textDecoration: "underline",
								textUnderlineOffset: 3,
							},
							"& img": {
								display: "block",
								height: "auto",
								borderRadius: 1,
								my: 1.5,
							},
							"& table": {
								width: "100%",
								borderCollapse: "collapse",
								my: 1.5,
								overflow: "hidden",
							},
							"& th, & td": {
								border: "1px solid",
								borderColor: "divider",
								p: 1,
								textAlign: "left",
								verticalAlign: "top",
							},
							"& th": {
								color: titleColor,
								fontWeight: 800,
								backgroundColor: theme.palette.action.hover,
							},
							"& blockquote": {
								m: 0,
								my: 1.5,
								pl: 2,
								borderLeft: "3px solid",
								borderColor: theme.palette.primary.main,
								color: bodyColor,
							},
							"& pre": {
								overflowX: "auto",
								p: 1.5,
								borderRadius: 1,
								backgroundColor: theme.palette.action.hover,
							},
							"& code": {
								fontFamily: "monospace",
								fontSize: 13,
							},
							"& .ql-align-center": { textAlign: "center" },
							"& .ql-align-right": { textAlign: "right" },
							"& .ql-align-justify": { textAlign: "justify" },
							"& .ql-size-small": { fontSize: 12 },
							"& .ql-size-large": { fontSize: 18 },
							"& .ql-size-huge": { fontSize: 24 },
						}}
					/>
				) : (
					<Typography variant="body2" sx={{ color: bodyColor, fontWeight: 500, lineHeight: 1.8 }}>
						No detailed description available.
					</Typography>
				)}
			</CardContent>
		</Card>
	);
};

export default ProductDescription;
