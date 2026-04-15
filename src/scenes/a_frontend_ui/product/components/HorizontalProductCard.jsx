import React, { useMemo } from "react";
import { Box, Chip, Link, Typography, useTheme } from "@mui/material";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
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

export default function HorizontalProductCard({ product, onView }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const colors = tokens(theme.palette.mode);
  const subInk = colors.gray[300];
  const accent = theme.palette.mode === "dark" ? colors.blueAccent[400] : colors.blueAccent[100];

  const price = useMemo(
    () => Number(product?.unit_price ?? product?.price ?? 0),
    [product?.unit_price, product?.price]
  );
  const discountInfo = useMemo(() => {
    const now = Date.now() / 1000;

    // 1. Try product_discount relation
    const pd = product?.product_discount;
    if (pd) {
      const d = Number(pd.discount ?? 0);
      if (d > 0) {
        const start = Number(pd.start_date || pd.discount_start_date || 0);
        const end = Number(pd.end_date || pd.discount_end_date || 0);
        if (start && start > now) { /* not started */ }
        else if (end && end < now) { /* expired */ }
        else return { amount: d, type: String(pd.discount_type ?? "").toLowerCase() };
      }
    }

    // 2. Fallback: direct product fields
    const d = Number(product?.discount ?? 0);
    if (d <= 0) return null;
    const type = String(product?.discount_type ?? "").toLowerCase();
    const start = Number(product?.discount_start_date || 0);
    const end = Number(product?.discount_end_date || 0);
    if (start && start > now) return null;
    if (end && end < now) return null;
    return { amount: d, type };
  }, [product?.product_discount, product?.discount, product?.discount_type, product?.discount_start_date, product?.discount_end_date]);

  const salePrice = useMemo(() => {
    const s = Number(product?.sale_price ?? 0);
    if (s > 0) return s;
    if (discountInfo && price > 0) {
      if (discountInfo.type === "percent") return Math.round(price - (price * discountInfo.amount) / 100);
      const flat = price - discountInfo.amount;
      return flat > 0 ? flat : 0;
    }
    return 0;
  }, [product?.sale_price, discountInfo, price]);

  const hasSale = salePrice > 0 && salePrice < price;
  const displayPrice = hasSale ? salePrice : price;

  const discountLabel = useMemo(() => {
    if (discountInfo) {
      if (discountInfo.type === "percent") return `${discountInfo.amount}% OFF`;
      return `${formatMoney(discountInfo.amount)} OFF`;
    }
    if (hasSale && price > 0) {
      const pct = Math.round(((price - salePrice) / price) * 100);
      return pct > 0 ? `${pct}% OFF` : null;
    }
    return null;
  }, [discountInfo, hasSale, price, salePrice]);

  const imageUrl = useMemo(() => resolveImage(product), [product]);

  return (
    <Box
      onClick={() => onView?.(product)}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        p: 1.25,
        borderRadius: 1,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: "background.paper",
        width: 200,
        flexShrink: 0,
        height: 88,
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
          borderColor: theme.palette.primary.main,
        },
      }}
    >
      <Box
        sx={{ position: "relative", flexShrink: 0 }}
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
            borderRadius: 1,
            objectFit: "cover",
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: "rgba(0,0,0,0.04)",
          }}
        />
      </Box>
      <Box sx={{ minWidth: 0, overflow: "hidden", flex: 1 }}>
        <Typography
          variant="body2"
          noWrap
          sx={{
            fontWeight: 600,
            fontSize: 12,
            lineHeight: 1.2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
         
        >
          {product?.name || "Untitled product"}
        </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0 }}>
 
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
                  textAlign: "left",
                  display: "inline-block",
                  maxWidth: 170,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                {product.shop?.name || "View shop"}
              </Link>
            ) : (
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: subInk,
                  fontSize: 11,
                  display: "inline-block",
                  maxWidth: 170,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {product.shop?.name || " "}
              </Typography>
            )}
          </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap", mt: 0.8 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 13, color: accent }}>
            {formatMoney(displayPrice)}
          </Typography>
          {hasSale && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textDecoration: "line-through", fontSize: 10 }}
            >
              {formatMoney(price)}
            </Typography>
          )}
          {discountLabel && (
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, fontSize: 9, color: theme.palette.error.main }}
            >
              {discountLabel}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
