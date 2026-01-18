import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  Container,
  Grid,
  IconButton,
  TextField,
  Typography,
  Stack,
  Rating,
  Divider,
  Chip,
  Snackbar,
  Tooltip,
  CircularProgress,
  useTheme,
} from "@mui/material";

import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import VerifiedIcon from "@mui/icons-material/Verified";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

import { image_file_url } from "../../../api/config";
import { useParams, useNavigate } from "react-router-dom";
import { addCart, getCartByUser } from "../../../api/controller/admin_controller/order/cart_controller";
import { addWish, getUserWish, deleteWish } from "../../../api/controller/admin_controller/wishlist/wish_controller";
import { getProductDetails } from "../../../api/controller/admin_controller/product/product_controller";

const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

const ProductDetail = () => {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();

  // Theme helpers (matches your other pages)
  const brand = theme.palette.brand || {};
  const semantic = theme.palette.semantic || {};
  const divider = theme.palette.divider || "rgba(0,0,0,0.08)";
  const surface =
    semantic.surface || (theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)");
  const surface2 =
    semantic.surface2 || (theme.palette.mode === "dark" ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.06)");
  const ink = semantic.ink || (theme.palette.mode === "dark" ? "rgba(255,255,255,0.92)" : "rgba(0,0,0,0.88)");
  const subInk =
    semantic.subInk || (theme.palette.mode === "dark" ? "rgba(255,255,255,0.68)" : "rgba(0,0,0,0.58)");
  const brandGradient = brand.gradient || "linear-gradient(90deg, #FA5C5C, #FD8A6B, #FEC288, #FBEF76)";
  const brandGlow = brand.glow || (theme.palette.mode === "dark" ? "rgba(250,92,92,0.18)" : "rgba(250,92,92,0.12)");

  const userId = useMemo(() => {
    const u = localStorage.getItem("userId");
    return u ? String(u) : null;
  }, []);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoom, setZoom] = useState(1);

  const [busyCart, setBusyCart] = useState(false);
  const [msg, setMsg] = useState("");

  // local wishlist (same style as your Home page)
  const [wishIds, setWishIds] = useState(() => {
    return [];
  });

  const inWish = useMemo(() => {
    const pid = product?.id;
    return pid ? wishIds.includes(pid) : false;
  }, [wishIds, product?.id]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getProductDetails(id);
        const p = res?.data ?? res;

        setProduct(p || null);

        const mainPath =
          p?.primary_image?.image ||
          (Array.isArray(p?.images) && p.images.length > 0
            ? (p.images.find((i) => i.is_primary) || p.images[0])?.image
            : null);

        setSelectedImage(mainPath || null);
        setZoom(1);
      } catch (e) {
        console.error(e);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const money = (n) =>
    new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(Number(n || 0));

  const images = useMemo(() => {
    const list = Array.isArray(product?.images) ? product.images : [];
    // ensure primary first (smart)
    const sorted = [...list].sort((a, b) => Number(b?.is_primary) - Number(a?.is_primary));
    return sorted;
  }, [product?.images]);

  const mainImagePath =
    selectedImage ||
    product?.primary_image?.image ||
    (images.length ? images[0]?.image : null);

  const mainImage = mainImagePath ? `${image_file_url}/${mainImagePath}` : "/assets/images/placeholder.png";

  const price = Number(product?.price || 0);
  const sale = Number(product?.sale_price || 0);
  const hasSale = sale > 0 && price > 0 && sale < price;
  const discountPct = hasSale ? Math.round(((price - sale) / price) * 100) : 0;

  const displayPrice = hasSale ? sale : price;

  const inStock = useMemo(() => {
    // your backend looks inconsistent; keep safe logic
    if (product?.in_stock === false) return false;
    if (typeof product?.stock_qty === "number") return product.stock_qty > 0;
    return true;
  }, [product?.in_stock, product?.stock_qty]);

  const toggleWishlist = () => {
    const pid = product?.id;
    if (!pid) return;
    (async () => {
      if (userId) {
        try {
          const res = await getUserWish(userId);
          const payload = res?.data?.data ?? res?.data ?? res ?? [];
          const entries = Array.isArray(payload) ? payload : [];
          const existing = entries.find((e) => (e?.product?.id ?? e?.product_id) === pid || (e?.product_id ?? e?.product?.id) === pid);
          if (existing && existing?.id) {
            await deleteWish(existing.id);
          } else {
            await addWish({ user_id: userId, product_id: pid });
          }

          // sync server wishlist -> local storage
          const res2 = await getUserWish(userId);
          const payload2 = res2?.data?.data ?? res2?.data ?? res2 ?? [];
          let items = [];
          if (Array.isArray(payload2)) items = payload2.map((e) => e?.product ?? e).filter(Boolean);
          const ids = items.map((p) => Number(p?.id)).filter(Boolean);
          setWishIds(ids);
          localStorage.setItem("wishlist", JSON.stringify(ids));
          window.dispatchEvent(new Event("wishlist-updated"));
        } catch (e) {
          console.error("Failed to update wishlist", e);
        }
        return;
      }

      setWishIds((prev) => {
        const has = prev.includes(pid);
        localStorage.setItem("wishlist", JSON.stringify(next));
        window.dispatchEvent(new Event("wishlist-updated"));
        return next;
      });
    })();
  };

  const handleAddToCart = async () => {
    if (!product?.id) return;

    if (!userId) {
      setMsg("Please login to add to cart.");
      return;
    }
    if (!inStock) {
      setMsg("This product is out of stock.");
      return;
    }

    setBusyCart(true);
    try {
      const payload = { user_id: userId, product_id: product.id, qty: Number(qty || 1) };
      const res = await addCart(payload);

      if (res?.status === "success") {
        const cartRes = await getCartByUser(userId);
        const total =
          cartRes?.data?.total_items ??
          (Array.isArray(cartRes?.data?.items) ? cartRes.data.items.length : 0);

        localStorage.setItem("cart", JSON.stringify(total));
        window.dispatchEvent(new Event("cart-updated"));
        setMsg(res?.message || "Added to cart");
      } else {
        setMsg(res?.message || "Failed to add to cart");
      }
    } catch (e) {
      console.error(e);
      setMsg("Failed to add to cart");
    } finally {
      setBusyCart(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 8 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <CircularProgress size={18} />
          <Typography sx={{ color: subInk, fontWeight: 800 }}>Loading product...</Typography>
        </Box>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container sx={{ py: 8 }}>
        <Typography sx={{ fontWeight: 900, color: ink }}>Product not found</Typography>
        <Button onClick={() => navigate("/")} sx={{ mt: 2, borderRadius: 999, textTransform: "none", fontWeight: 900 }}>
          Back to home
        </Button>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: theme.palette.background?.default,
        backgroundImage:
          theme.palette.mode === "dark"
            ? `radial-gradient(1200px 700px at 10% 0%, rgba(251,239,118,0.10), transparent 55%),
               radial-gradient(1200px 700px at 90% 5%, rgba(250,92,92,0.10), transparent 55%),
               radial-gradient(1200px 700px at 50% 95%, rgba(254,194,136,0.08), transparent 55%)`
            : `radial-gradient(1200px 700px at 10% 0%, rgba(251,239,118,0.22), transparent 55%),
               radial-gradient(1200px 700px at 90% 5%, rgba(250,92,92,0.18), transparent 55%),
               radial-gradient(1200px 700px at 50% 95%, rgba(254,194,136,0.14), transparent 55%)`,
        py: 3,
      }}
    >
      <Container>
        {/* Header */}
        <Box
          sx={{
            mb: 2,
            p: 2,
            borderRadius: 4,
            border: `1px solid ${divider}`,
            background: surface,
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Stack direction="row" spacing={1.2} alignItems="center">
            <IconButton
              onClick={() => navigate(-1)}
              sx={{ borderRadius: 3, border: `1px solid ${divider}`, background: surface, "&:hover": { background: surface2 } }}
            >
              <ArrowBackIcon />
            </IconButton>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 950,
                  letterSpacing: -0.6,
                  background: brandGradient,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  lineHeight: 1.1,
                }}
              >
                Product details
              </Typography>
              <Typography variant="body2" sx={{ color: subInk, fontWeight: 700 }}>
                Tap thumbnails to switch image, zoom if needed.
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              icon={<VerifiedIcon />}
              label={inStock ? "In stock" : "Out of stock"}
              sx={{
                borderRadius: 999,
                fontWeight: 900,
                background: surface2,
                border: `1px solid ${divider}`,
                color: ink,
              }}
            />
            {hasSale ? (
              <Chip
                label={`${discountPct}% OFF`}
                sx={{
                  borderRadius: 999,
                  fontWeight: 950,
                  background: brandGradient,
                  color: "#141414",
                  boxShadow: `0 12px 26px ${brandGlow}`,
                }}
              />
            ) : null}
          </Stack>
        </Box>

        <Grid container spacing={2.4}>
          {/* Left: Media */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: 4,
                border: `1px solid ${divider}`,
                background: surface,
                overflow: "hidden",
                backdropFilter: "blur(12px)",
              }}
            >
              {/* Defined image box */}
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
                  alt={product.name}
                  loading="lazy"
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

                {/* Zoom controls (smart pill) */}
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

              {/* Thumbnails */}
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
                    const src = `${image_file_url}/${img.image}`;
                    const selected = img.image === mainImagePath;

                    return (
                      <Box
                        key={img.id}
                        onClick={() => {
                          setSelectedImage(img.image);
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
                          src={src}
                          alt={img.alt_text || ""}
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
          </Grid>

          {/* Right: Info */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: 4,
                border: `1px solid ${divider}`,
                background: surface,
                backdropFilter: "blur(12px)",
                p: 2,
              }}
            >
              <Stack spacing={1.2}>
                <Typography variant="h5" sx={{ fontWeight: 950, color: ink, lineHeight: 1.15 }}>
                  {product.name}
                </Typography>

                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Rating value={Number(product?.rating || 4.2)} precision={0.1} readOnly />
                  <Typography variant="body2" sx={{ color: subInk, fontWeight: 800 }}>
                    Ratings {product?.reviews_count ?? 515}
                  </Typography>
                  <Chip
                    size="small"
                    label={product?.brand?.name ? `Brand: ${product.brand.name}` : "No brand"}
                    sx={{
                      borderRadius: 999,
                      fontWeight: 900,
                      background: surface2,
                      border: `1px solid ${divider}`,
                      color: ink,
                      ml: "auto",
                    }}
                  />
                </Stack>

                {/* Price block */}
                <Box
                  sx={{
                    p: 1.4,
                    borderRadius: 3,
                    border: `1px solid ${divider}`,
                    background: surface2,
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-end" spacing={1}>
                    <Box>
                      <Typography sx={{ fontWeight: 950, color: ink, fontSize: 22, lineHeight: 1.1 }}>
                        {money(displayPrice)}
                      </Typography>

                      {hasSale ? (
                        <Typography variant="body2" sx={{ color: subInk, textDecoration: "line-through", fontWeight: 800 }}>
                          {money(price)}
                        </Typography>
                      ) : null}
                    </Box>

                    {hasSale ? (
                      <Chip
                        label={`${discountPct}% OFF`}
                        sx={{
                          borderRadius: 999,
                          fontWeight: 950,
                          background: brandGradient,
                          color: "#141414",
                          boxShadow: `0 12px 26px ${brandGlow}`,
                        }}
                      />
                    ) : null}
                  </Stack>
                </Box>

                {product.short_description ? (
                  <Typography sx={{ color: ink, fontWeight: 700 }}>
                    {product.short_description}
                  </Typography>
                ) : null}

                {/* Attributes */}
                {Array.isArray(product?.product_attributes) && product.product_attributes.length > 0 ? (
                  <Box>
                    <Typography sx={{ fontWeight: 950, color: ink, mb: 1 }}>Attributes</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {product.product_attributes.map((pa) => (
                        <Chip
                          key={pa.id}
                          label={pa?.value?.value || "Value"}
                          sx={{
                            borderRadius: 999,
                            fontWeight: 900,
                            background: surface,
                            border: `1px solid ${divider}`,
                            color: ink,
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                ) : null}

                <Divider sx={{ opacity: 0.12 }} />

                {/* Quantity + Actions */}
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems={{ sm: "center" }}>
                  {/* Qty */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.8,
                      p: 0.8,
                      borderRadius: 999,
                      border: `1px solid ${divider}`,
                      background: surface2,
                      width: "fit-content",
                    }}
                  >
                    <IconButton size="small" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                      <RemoveCircleOutlineIcon fontSize="small" />
                    </IconButton>

                    <TextField
                      size="small"
                      value={qty}
                      onChange={(e) => {
                        const v = Number(e.target.value || 1);
                        setQty(Number.isFinite(v) ? Math.max(1, v) : 1);
                      }}
                      sx={{
                        width: 86,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 999,
                          background: surface,
                          "& fieldset": { borderColor: "transparent" },
                        },
                        input: { textAlign: "center", fontWeight: 900, color: ink },
                      }}
                    />

                    <IconButton size="small" onClick={() => setQty((q) => q + 1)}>
                      <AddCircleOutlineIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  {/* Actions */}
                  <Stack direction="row" spacing={1} sx={{ ml: { sm: "auto" } }}>
                    <Tooltip title={inWish ? "Remove from wishlist" : "Add to wishlist"}>
                      <IconButton
                        onClick={toggleWishlist}
                        sx={{
                          borderRadius: 3,
                          border: `1px solid ${divider}`,
                          background: surface2,
                          "&:hover": { background: surface },
                        }}
                      >
                        {inWish ? <FavoriteIcon sx={{ color: theme.palette.error.main }} /> : <FavoriteBorderIcon />}
                      </IconButton>
                    </Tooltip>

                    <Tooltip title={inStock ? "Add to cart" : "Out of stock"}>
                      <span>
                        <IconButton
                          disabled={!inStock || busyCart}
                          onClick={handleAddToCart}
                          sx={{
                            borderRadius: 3,
                            border: `1px solid ${divider}`,
                            background: brandGradient,
                            color: "#141414",
                            boxShadow: `0 14px 30px ${brandGlow}`,
                            "&:hover": { filter: "saturate(1.1)", boxShadow: `0 18px 36px ${brandGlow}` },
                            "&.Mui-disabled": { opacity: 0.55 },
                          }}
                        >
                          {busyCart ? (
                            <CircularProgress size={18} />
                          ) : (
                            <ShoppingCartOutlinedIcon />
                          )}
                        </IconButton>
                      </span>
                    </Tooltip>

                    <Button
                      variant="contained"
                      disabled={!inStock}
                      onClick={() => {
                        if (!userId) return setMsg("Please login to buy now.");
                        // You can implement your direct checkout flow here.
                        navigate("/cart");
                      }}
                      sx={{
                        borderRadius: 999,
                        textTransform: "none",
                        fontWeight: 950,
                        px: 2.2,
                        background: surface,
                        border: `1px solid ${divider}`,
                        color: ink,
                        boxShadow: "none",
                        "&:hover": { background: surface2 },
                      }}
                    >
                      Buy now
                    </Button>
                  </Stack>
                </Stack>

                <Divider sx={{ opacity: 0.12 }} />

                {/* Description */}
                <Typography sx={{ fontWeight: 950, color: ink }}>Description</Typography>
                <Typography variant="body2" sx={{ color: subInk, fontWeight: 700, whiteSpace: "pre-line" }}>
                  {product.description || "No detailed description available."}
                </Typography>
              </Stack>
            </Card>
          </Grid>
        </Grid>

        <Snackbar open={!!msg} autoHideDuration={2500} onClose={() => setMsg("")} message={msg} />
      </Container>
    </Box>
  );
};

export default ProductDetail;
