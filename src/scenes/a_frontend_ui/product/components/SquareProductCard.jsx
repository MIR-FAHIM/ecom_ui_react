import React, { useMemo } from "react";
import { Box, Link, Typography, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { image_file_url } from "../../../../api/config/index.jsx";
import { tokens } from "../../../../theme.js";
const formatMoney = (n) =>
  new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(Number(n || 0));

const resolveImage = (product) => {
  const primary = product?.primary_image ?? product?.primaryImage ?? null;
  const direct = primary?.url;
  if (direct && /^https?:\/\//i.test(String(direct))) return String(direct);

  const file = primary?.file_name;
  if (file) {
    const safeFile = String(file).replaceAll("\\/", "/").replace(/^\/+/, "");
    const base = String(image_file_url || "").replace(/\/+$/, "");
    return `${base}/${safeFile}`;
  }

  const maybeUrl = product?.image || product?.file_name;
  if (maybeUrl && /^https?:\/\//i.test(String(maybeUrl))) return String(maybeUrl);

  return "https://via.placeholder.com/600x400?text=No+Image";
};

export default function SquareProductCard({ product, onView, size = 140 }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const colors = tokens(theme.palette.mode);
  const price = useMemo(
    () => Number(product?.unit_price ?? product?.price ?? 0),
    [product?.unit_price, product?.price]
  );
  const salePrice = useMemo(() => Number(product?.sale_price ?? 0), [product?.sale_price]);
  const hasSale = salePrice > 0 && salePrice < price;
  const displayPrice = hasSale ? salePrice : price;
  const accent = theme.palette.mode === "dark" ? colors.blueAccent[400] : colors.blueAccent[100];
  const imageUrl = useMemo(() => resolveImage(product), [product]);

  return (
    <Box
      onClick={() => onView?.(product)}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
        cursor: "pointer",
      }}
    >
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: 3,
          backgroundImage: `url("${imageUrl}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "#fff",
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": { transform: "scale(1.03)", boxShadow: "0 8px 20px rgba(0,0,0,0.1)" },
        }}
      />
      <Box sx={{ width: size, textAlign: "center" }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            fontSize: 12,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: 48,
          }}
        >
          {product?.name || "Untitled product"}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5, mt: 0.25 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, fontSize: 11, color: accent }}>
            Shop:
          </Typography>
          {product?.shop?.id ? (
            <Link
              component="button"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/shop/${product.shop.id}`);
              }}
              sx={{
                fontSize: 12,
                fontWeight: 700,
                 color: accent,
                textDecoration: "none",
                lineHeight: 1.2,
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {product.shop?.name || "View shop"}
            </Link>
          ) : (
            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: 11, color: accent }}>
              {product?.shop?.name || "Unknown"}
            </Typography>
          )}
        </Box>
        <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.25, fontSize: 13 }}>
          {formatMoney(displayPrice)}
        </Typography>
        {hasSale ? (
          <Typography variant="caption" color="text.secondary" sx={{ textDecoration: "line-through" }}>
            {formatMoney(price)}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}
