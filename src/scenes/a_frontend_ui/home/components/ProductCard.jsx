import React, { useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Stack,
  Tooltip,
  Avatar,
  Rating,
  useTheme,
} from "@mui/material";
import {
  FavoriteBorder,
  Favorite,
  ShoppingCartOutlined,
  ShoppingCart,
  LocalOffer,
  VisibilityOutlined,
} from "@mui/icons-material";

import { image_file_url } from "../../../../api/config/index.jsx";

export default function SmartProductCard({
  product,
  inCart = false,
  inWish = false,
  onToggleCart,
  onToggleWish,
  onView,
}) {
  const theme = useTheme();

  const brand = theme.palette.brand || {};
  const semantic = theme.palette.semantic || {};
  const divider = theme.palette.divider || "rgba(0,0,0,0.08)";

  const surface =
    semantic.surface || (theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)");
  const surface2 =
    semantic.surface2 || (theme.palette.mode === "dark" ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.06)");
  const ink =
    semantic.ink || (theme.palette.mode === "dark" ? "rgba(255,255,255,0.92)" : "rgba(0,0,0,0.88)");
  const subInk =
    semantic.subInk || (theme.palette.mode === "dark" ? "rgba(255,255,255,0.68)" : "rgba(0,0,0,0.58)");

  const brandGradient = brand.gradient || "linear-gradient(90deg, #FA5C5C, #FD8A6B, #FEC288, #FBEF76)";
  const brandGlow = brand.glow || (theme.palette.mode === "dark" ? "rgba(250,92,92,0.18)" : "rgba(250,92,92,0.12)");

  const money = (n) =>
    new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(Number(n || 0));

  // Your API uses unit_price + discount info; keep fallbacks for older shapes
  const price = useMemo(() => Number(product?.unit_price ?? product?.price ?? 0), [product?.unit_price, product?.price]);

  const salePrice = useMemo(() => {
    // If you later introduce sale_price in API, it will work automatically
    const s = Number(product?.sale_price ?? 0);
    return s > 0 ? s : 0;
  }, [product?.sale_price]);

  const hasSale = useMemo(() => salePrice > 0 && salePrice < price, [salePrice, price]);

  const displayPrice = useMemo(() => (hasSale ? money(salePrice) : money(price)), [hasSale, salePrice, price]);

  const discountLabel = useMemo(() => {
    // Supports both: discount_percent OR computed from sale price
    if (product?.discount_percent) return `${product.discount_percent}% OFF`;

    if (hasSale && price > 0) {
      const pct = Math.round(((price - salePrice) / price) * 100);
      return pct > 0 ? `${pct}% OFF` : null;
    }

    // Supports your API fields: discount + discount_type
    const d = Number(product?.discount ?? 0);
    const t = String(product?.discount_type ?? "").toLowerCase();
    if (d > 0 && t === "percent") return `${d}% OFF`;

    return null;
  }, [product?.discount_percent, hasSale, price, salePrice, product?.discount, product?.discount_type]);

  const ratingValue = useMemo(() => {
    const r = Number(product?.rating);
    if (Number.isFinite(r) && r >= 0) return Math.min(5, r);
    return 4.5;
  }, [product?.rating]);

  const reviewsCount = useMemo(() => {
    const n = Number(product?.reviews_count);
    if (Number.isFinite(n) && n >= 0) return n;
    return 0;
  }, [product?.reviews_count]);

  // IMPORTANT: your API image is product.primary_image.file_name = "all/....png"
  const imageUrl = useMemo(() => {
    const primary = product?.primary_image ?? product?.primaryImage ?? null;

    // Prefer url if you add it later
    const direct = primary?.url;
    if (direct && /^https?:\/\//i.test(String(direct))) return String(direct);

    const file = primary?.file_name;
    if (file) {
      const safeFile = String(file).replaceAll("\\/", "/").replace(/^\/+/, "");
      const base = String(image_file_url || "").replace(/\/+$/, "");
      return `${base}/${safeFile}`;
    }

    // If someday you change API to provide full URL in other fields
    const maybeUrl = product?.image || product?.file_name;
    if (maybeUrl && /^https?:\/\//i.test(String(maybeUrl))) return String(maybeUrl);

    return "https://via.placeholder.com/600x400?text=No+Image";
  }, [product?.primary_image, product?.primaryImage, product?.image, product?.file_name]);

  // Your API uses current_stock
  const outOfStock = useMemo(() => {
    if (typeof product?.current_stock === "number") return product.current_stock <= 0;
    if (typeof product?.stock_qty === "number") return product.stock_qty <= 0;
    if (typeof product?.stock === "number") return product.stock <= 0;
    return false;
  }, [product?.current_stock, product?.stock_qty, product?.stock]);

  const categoryLabel = useMemo(() => {
    // Your list response often has category = null, so keep it safe
    const name = product?.category?.name ?? product?.category?.title ?? null;
    if (name) return String(name);
    if (product?.sku) return `SKU: ${product.sku}`;
    return " ";
  }, [product?.category, product?.sku]);

  return (
    <Card
      sx={{
        borderRadius: 4,
        overflow: "hidden",
        border: `1px solid ${divider}`,
        background: surface,
        backdropFilter: "blur(12px)",
        transition: "transform 140ms ease, box-shadow 220ms ease, border-color 220ms ease",
        position: "relative",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 18px 40px ${theme.palette.mode === "dark" ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.12)"}`,
          borderColor: theme.palette.primary.main,
        },
      }}
    >
      <Box
        sx={{
          p: 1.25,
          background:
            theme.palette.mode === "dark"
              ? `radial-gradient(800px 260px at 20% 10%, rgba(251,239,118,0.10), transparent 55%),
                 radial-gradient(800px 260px at 90% 0%, rgba(250,92,92,0.10), transparent 55%)`
              : `radial-gradient(800px 260px at 20% 10%, rgba(251,239,118,0.18), transparent 55%),
                 radial-gradient(800px 260px at 90% 0%, rgba(250,92,92,0.14), transparent 55%)`,
        }}
      >
        <Box
          onClick={() => onView?.(product)}
          sx={{
            height: 220,
            borderRadius: 3,
            overflow: "hidden",
            border: `1px solid ${divider}`,
            background: surface2,
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            position: "relative",
          }}
        >
          {/* Always render image; fallback via onError */}
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
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 240ms ease",
              filter: theme.palette.mode === "dark" ? "saturate(1.08) contrast(1.02)" : "saturate(1.02)",
              ".MuiCard-root:hover &": { transform: "scale(1.05)" },
            }}
          />

          {/* If you still want a letter avatar for missing images, keep it hidden and show only when placeholder triggers.
              For simplicity we rely on placeholder image. */}

          <Stack direction="row" spacing={1} sx={{ position: "absolute", left: 10, top: 10, alignItems: "center" }}>
            {discountLabel ? (
              <Chip
                icon={<LocalOffer fontSize="small" />}
                label={discountLabel}
                size="small"
                sx={{
                  borderRadius: 999,
                  fontWeight: 900,
                  background: brandGradient,
                  color: "#141414",
                  border: `1px solid ${divider}`,
                }}
              />
            ) : null}

            {outOfStock ? (
              <Chip label="Out of stock" size="small" color="error" sx={{ borderRadius: 999, fontWeight: 900 }} />
            ) : (
              <Chip
                label="In stock"
                size="small"
                variant="outlined"
                sx={{
                  borderRadius: 999,
                  fontWeight: 900,
                  color: subInk,
                  borderColor: divider,
                  background: surface,
                }}
              />
            )}
          </Stack>

          <Stack spacing={1} sx={{ position: "absolute", right: 10, top: 10 }}>
            <Tooltip title={inWish ? "Remove from wishlist" : "Add to wishlist"}>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWish?.(product);
                }}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${divider}`,
                  background: surface,
                  backdropFilter: "blur(10px)",
                  "&:hover": { background: surface2 },
                }}
              >
                {inWish ? <Favorite color="error" /> : <FavoriteBorder />}
              </IconButton>
            </Tooltip>

            <Tooltip title={outOfStock ? "Out of stock" : inCart ? "Remove from cart" : "Add to cart"}>
              <span>
                <IconButton
                  disabled={outOfStock}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCart?.(product);
                  }}
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: 4,
                    border: `1px solid ${divider}`,
                    background: brandGradient,
                    color: "#141414",
                    boxShadow: `0 14px 28px ${brandGlow}`,
                    transition: "transform 120ms ease, box-shadow 180ms ease, filter 180ms ease",
                    "&:hover": {
                      transform: "translateY(-1px) scale(1.03)",
                      filter: "saturate(1.15)",
                      boxShadow: `0 18px 34px ${brandGlow}`,
                    },
                    "&.Mui-disabled": { opacity: 0.5 },
                    position: "relative",
                    "&:after": {
                      content: '""',
                      position: "absolute",
                      inset: -4,
                      borderRadius: 18,
                      border: `1px solid ${divider}`,
                      opacity: theme.palette.mode === "dark" ? 0.9 : 0.7,
                    },
                  }}
                >
                  {inCart ? <ShoppingCart /> : <ShoppingCartOutlined />}
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Quick view">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onView?.(product);
                }}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${divider}`,
                  background: surface,
                  backdropFilter: "blur(10px)",
                  "&:hover": { background: surface2 },
                }}
              >
                <VisibilityOutlined />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </Box>

      <CardContent sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, alignItems: "start" }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                fontWeight={950}
                sx={{
                  color: ink,
                  letterSpacing: -0.2,
                  lineHeight: 1.15,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {product?.name || "Unnamed product"}
              </Typography>

              <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: 0.6, color: subInk }}>
                {categoryLabel}
              </Typography>
            </Box>

            <Box sx={{ textAlign: "right", flexShrink: 0 }}>
              <Typography
                fontWeight={950}
                sx={{
                  fontSize: 18,
                  background: brandGradient,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {displayPrice}
              </Typography>

              {hasSale ? (
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 800,
                    color: subInk,
                    textDecoration: "line-through",
                  }}
                >
                  {money(price)}
                </Typography>
              ) : null}
            </Box>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <Rating value={ratingValue} precision={0.5} size="small" readOnly />
            <Typography variant="caption" sx={{ fontWeight: 800, color: subInk }}>
              ({reviewsCount})
            </Typography>

            <Chip
              size="small"
              label={ "Sold: " + (product?.total_sales ?? product?.sales_count ?? 0) }
              sx={{
                ml: "auto",
                borderRadius: 999,
                fontWeight: 900,
                background: surface,
                border: `1px solid ${divider}`,
                color: subInk,
              }}
            />
          </Stack>

        
        </Stack>
      </CardContent>
    </Card>
  );
}
