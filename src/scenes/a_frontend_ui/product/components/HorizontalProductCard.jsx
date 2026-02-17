import React, { useMemo } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { image_file_url } from "../../../../api/config/index.jsx";

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

export default function HorizontalProductCard({ product, onView }) {
  const theme = useTheme();

  const price = useMemo(
    () => Number(product?.unit_price ?? product?.price ?? 0),
    [product?.unit_price, product?.price]
  );
  const salePrice = useMemo(() => Number(product?.sale_price ?? 0), [product?.sale_price]);
  const hasSale = salePrice > 0 && salePrice < price;
  const displayPrice = hasSale ? salePrice : price;

  const imageUrl = useMemo(() => resolveImage(product), [product]);

  return (
    <Box
      onClick={() => onView?.(product)}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        p: 1,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: "background.paper",
        width: 300,
        height: 88,
        cursor: "pointer",
        transition: "transform 140ms ease, box-shadow 200ms ease, border-color 200ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 10px 22px rgba(0,0,0,0.08)",
          borderColor: theme.palette.primary.main,
        },
      }}
    >
      <Box
        component="img"
        src={imageUrl}
        alt={product?.name || "product"}
        loading="lazy"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = "https://via.placeholder.com/600x400?text=No+Image";
        }}
        sx={{
          width: 64,
          height: 64,
          borderRadius: 1.5,
          objectFit: "cover",
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: "rgba(0,0,0,0.04)",
          flexShrink: 0,
        }}
      />
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: 30,
          }}
         
        >
          {product?.name || "Untitled product"}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.8 }}>
          <Typography variant="body2" sx={{ fontWeight: 800 }}>
            {formatMoney(displayPrice)}
          </Typography>
          {hasSale ? (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textDecoration: "line-through" }}
            >
              {formatMoney(price)}
            </Typography>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}
