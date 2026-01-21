import React, { useEffect, useMemo, useState, useCallback } from "react";
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

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
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
import ProductDescription from "./components/ProductDescription";
import ProductDetailImage from "./components/ProductDetailImage";
import RelatedProduct from "./related_product/RelatedProduct";
import ProductReview from "./review_product/ProductReview";
import { tokens } from "../../../theme";

const safeJsonParse = (value, fallback) => {
  try {
    if (value == null) return fallback;
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      const s = value.trim();
      if (!s) return fallback;
      return JSON.parse(s);
    }
    return fallback;
  } catch {
    return fallback;
  }
};


const buildImageUrl = (fileOrUrl) => {
  if (!fileOrUrl) return null;
  const raw = String(fileOrUrl);

  // If backend sends escaped slashes like all\/file.png, normalize
  const cleaned = raw.replaceAll("\\/", "/");

  if (/^https?:\/\//i.test(cleaned)) return cleaned;

  const base = String(image_file_url || "").replace(/\/+$/, "");
  const path = cleaned.replace(/^\/+/, "");
  return `${base}/${path}`;
};

const ProductDetail = () => {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();

  const colors = tokens(theme.palette.mode);
  const divider = theme.palette.divider || colors.primary[200];
  const surface = colors.primary[400];
  const surface2 = colors.primary[300];
  const ink = colors.gray[100];
  const subInk = colors.gray[300];

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
  const [selectedAttributeId, setSelectedAttributeId] = useState(null);

  const [wishIds, setWishIds] = useState(() => {
    return [];
  });

  const inWish = useMemo(() => {
    const pid = product?.id;
    return pid ? wishIds.includes(pid) : false;
  }, [wishIds, product?.id]);

  const money = useCallback(
    (n) => new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(Number(n || 0)),
    []
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getProductDetails(id);

        // Your API: { status, message, data: {...product} }
        const p = res?.data?.data ?? res?.data ?? res;
        setProduct(p || null);

        // Your API: primary_image.file_name = "all/xxx.png"
        const main = p?.primary_image?.file_name || null;
        setSelectedImage(main);
        setZoom(1);
        setQty(Math.max(1, Number(p?.min_qty || 1)));
      } catch (e) {
        console.error(e);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // Images for thumbnails:
  // Your details response currently: images: [] and primary_image has file_name
  // If you later add images[] with same shape, this will work.
  const images = useMemo(() => {
    const list = Array.isArray(product?.images) ? product.images : [];
    // If item shape includes file_name, we can use it; otherwise ignore safely
    const normalized = list
      .map((x) => ({
        id: x?.id ?? `${x?.file_name ?? x?.image ?? Math.random()}`,
        file_name: x?.file_name ?? x?.image ?? null,
        is_primary: Boolean(x?.is_primary),
      }))
      .filter((x) => !!x.file_name);

    // Ensure primary first
    return normalized.sort((a, b) => Number(b.is_primary) - Number(a.is_primary));
  }, [product?.images]);

  const mainImagePath = useMemo(() => {
    return (
      selectedImage ||
      product?.primary_image?.file_name ||
      (images.length ? images[0]?.file_name : null) ||
      null
    );
  }, [selectedImage, product?.primary_image?.file_name, images]);

  const mainImage = useMemo(() => buildImageUrl(mainImagePath) || "/assets/images/placeholder.png", [mainImagePath]);

  // Pricing: your API uses unit_price, and discount fields
  const price = useMemo(() => Number(product?.unit_price ?? 0), [product?.unit_price]);

  // If later you introduce sale_price, it will automatically work
  const sale = useMemo(() => {
    const s = Number(product?.sale_price ?? 0);
    return s > 0 ? s : 0;
  }, [product?.sale_price]);

  const hasSale = useMemo(() => sale > 0 && price > 0 && sale < price, [sale, price]);

  const discountPct = useMemo(() => {
    if (hasSale) return Math.round(((price - sale) / price) * 100);

    const d = Number(product?.discount ?? 0);
    const t = String(product?.discount_type ?? "").toLowerCase();
    if (d > 0 && t === "percent") return Math.round(d);

    return 0;
  }, [hasSale, price, sale, product?.discount, product?.discount_type]);

  const displayPrice = useMemo(() => (hasSale ? sale : price), [hasSale, sale, price]);

  const inStock = useMemo(() => {
    // Your API: current_stock
    if (typeof product?.current_stock === "number") return product.current_stock > 0;
    // fallback
    if (product?.in_stock === false) return false;
    if (typeof product?.stock_qty === "number") return product.stock_qty > 0;
    return true;
  }, [product?.current_stock, product?.in_stock, product?.stock_qty]);

  const productAttributeOptions = useMemo(() => {
    const list = Array.isArray(product?.product_attributes) ? product.product_attributes : [];
    const map = new Map();

    list.forEach((item) => {
      const attrName =
        item?.attribute?.name ||
        item?.attribute_name ||
        item?.attribute?.title ||
        item?.attribute?.label ||
        "Attribute";
      const attrId = item?.attribute?.id ?? attrName;
      const rawValue = item?.value?.value ?? item?.value?.name ?? item?.attribute_value;
      const optionId = item?.id ?? item?.attribute_value_id ?? item?.value?.id;

      if (rawValue == null || rawValue === "" || optionId == null) return;

      const key = String(attrId);
      if (!map.has(key)) {
        map.set(key, { name: attrName, options: [] });
      }

      const group = map.get(key);
      if (!group.options.some((opt) => String(opt.id) === String(optionId))) {
        group.options.push({ id: optionId, label: String(rawValue) });
      }
    });

    return Array.from(map.values());
  }, [product?.product_attributes]);

  useEffect(() => {
    setSelectedAttributeId(null);
  }, [product?.id]);



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
      const payload = {
        user_id: userId,
        product_id: product.id,
        qty: Number(qty || 1),
        attribute_id: selectedAttributeId ?? null,
      };
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
        background: theme.palette.background?.default || colors.primary[500],
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
              sx={{
                borderRadius: 3,
                border: `1px solid ${divider}`,
                background: surface,
                "&:hover": { background: surface2 },
              }}
            >
              <ArrowBackIcon />
            </IconButton>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 950,
                  letterSpacing: -0.6,
                  color: theme.palette.secondary.main,
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
            {discountPct > 0 ? (
              <Chip
                label={`${discountPct}% OFF`}
                sx={{
                  borderRadius: 999,
                  fontWeight: 950,
                  background: theme.palette.secondary.main,
                  color: colors.gray[900],
                  boxShadow: "none",
                }}
              />
            ) : null}
          </Stack>
        </Box>

        <Grid container spacing={2.4}>
          {/* Left: Media */}
          <Grid item xs={12} md={6}>
            <ProductDetailImage
              mainImage={mainImage}
              mainImagePath={mainImagePath}
              productName={product?.name}
              zoom={zoom}
              setZoom={setZoom}
              images={images}
              onSelectImage={(fileName) => setSelectedImage(fileName)}
              buildImageUrl={buildImageUrl}
              divider={divider}
              surface={surface}
              surface2={surface2}
              brandGradient={theme.palette.secondary.main}
              brandGlow={"none"}
            />
          </Grid>

          {/* Right: Info */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: 4,
                border: `1px solid ${divider}`,
                background: surface,
                backdropFilter: "blur(12px)",
                p: 2.4,
                height: "100%",
              }}
            >
              <Stack spacing={2}>
                <Typography variant="h5" sx={{ fontWeight: 950, color: ink, lineHeight: 1.15 }}>
                  {product?.name}
                </Typography>

                <Stack direction="row" spacing={1.2} alignItems="center" flexWrap="wrap" sx={{ rowGap: 1 }}>
                  <Rating value={Number(product?.average_review?.average_rating || 0)} precision={0.1} readOnly />
                  <Typography variant="body2" sx={{ color: subInk, fontWeight: 800 }}>
                    Reviews {product?.average_review?.review_count ?? 0}
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

                {/* Color chips (your API: colors JSON string) */}
                {Array.isArray(colors) && colors.length > 0 ? (
                  <Stack direction="row" spacing={1.2} alignItems="center" flexWrap="wrap" sx={{ rowGap: 1 }}>
                    <Typography variant="body2" sx={{ color: subInk, fontWeight: 900 }}>
                      Colors:
                    </Typography>
                    {colors.map((c) => (
                      <Box
                        key={c}
                        title={c}
                        sx={{
                          width: 18,
                          height: 18,
                          borderRadius: 999,
                          background: c,
                          border: `1px solid ${divider}`,
                          boxShadow: theme.palette.mode === "dark" ? "0 0 0 1px rgba(255,255,255,0.10)" : "none",
                        }}
                      />
                    ))}
                  </Stack>
                ) : null}

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

                      <Typography variant="caption" sx={{ color: subInk, fontWeight: 800, display: "block", mt: 0.4 }}>
                        Unit: {product?.unit || "pc"}
                      </Typography>
                    </Box>

                    {discountPct > 0 ? (
                      <Chip
                        label={`${discountPct}% OFF`}
                        sx={{
                          borderRadius: 999,
                          fontWeight: 950,
                          background: theme.palette.secondary.main,
                          color: colors.gray[900],
                          boxShadow: "none",
                        }}
                      />
                    ) : null}
                  </Stack>
                </Box>

                {productAttributeOptions.length > 0 ? (
                  <Box
                    sx={{
                      p: 1.4,
                      borderRadius: 3,
                      border: `1px solid ${divider}`,
                      background: surface,
                    }}
                  >
                    <Typography sx={{ fontWeight: 900, color: ink, mb: 1 }}>
                      Attributes
                    </Typography>
                    <Stack spacing={1.2}>
                      {productAttributeOptions.map((attr) => (
                        <Stack
                          key={attr.name}
                          direction="row"
                          spacing={1.2}
                          alignItems="center"
                          flexWrap="wrap"
                          useFlexGap
                          sx={{ rowGap: 1 }}
                        >
                          <Typography variant="body2" sx={{ color: subInk, fontWeight: 800 }}>
                            {attr.name}:
                          </Typography>
                          <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap sx={{ rowGap: 0.8 }}>
                            {attr.options.map((opt) => {
                              const selected = String(selectedAttributeId) === String(opt.id);
                              return (
                              <Chip
                                key={`${attr.name}-${opt.id}`}
                                size="small"
                                label={opt.label}
                                onClick={() => setSelectedAttributeId(opt.id)}
                                sx={{
                                  borderRadius: 999,
                                  fontWeight: 900,
                                  background: selected ? theme.palette.secondary.main : surface2,
                                  border: `1px solid ${divider}`,
                                  color: selected ? colors.gray[900] : ink,
                                  cursor: "pointer",
                                }}
                              />
                              );
                            })}
                          </Stack>
                        </Stack>
                      ))}
                    </Stack>
                  </Box>
                ) : null}

                <Divider sx={{ opacity: 0.12 }} />

                {/* Quantity + Actions */}
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.6} alignItems={{ sm: "center" }}>
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
                    <IconButton
                      size="small"
                      onClick={() => setQty((q) => Math.max(Number(product?.min_qty || 1), q - 1))}
                    >
                      <RemoveCircleOutlineIcon fontSize="small" />
                    </IconButton>

                    <TextField
                      size="small"
                      value={qty}
                      onChange={(e) => {
                        const v = Number(e.target.value || product?.min_qty || 1);
                        const min = Number(product?.min_qty || 1);
                        setQty(Number.isFinite(v) ? Math.max(min, v) : min);
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

                  <Stack direction="row" spacing={1.2} sx={{ ml: { sm: "auto" } }}>
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
                            background: theme.palette.secondary.main,
                            color: colors.gray[900],
                            boxShadow: "none",
                            "&:hover": { opacity: 0.92, boxShadow: "none" },
                            "&.Mui-disabled": { opacity: 0.55 },
                          }}
                        >
                          {busyCart ? <CircularProgress size={18} /> : <ShoppingCartOutlinedIcon />}
                        </IconButton>
                      </span>
                    </Tooltip>

                    <Button
                      variant="contained"
                      disabled={!inStock}
                      onClick={() => {
                        if (!userId) return setMsg("Please login to buy now.");
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

                {/* Meta / shipping quick facts based on your response */}
                <Stack direction="row" spacing={1.2} flexWrap="wrap" useFlexGap sx={{ rowGap: 1 }}>
                  <Chip
                    icon={<VerifiedIcon />}
                    label={`Stock: ${typeof product?.current_stock === "number" ? product.current_stock : "-"}`}
                    sx={{ borderRadius: 999, fontWeight: 900, background: surface2, border: `1px solid ${divider}`, color: ink }}
                  />
                  <Chip
                    label={`COD: ${product?.cash_on_delivery ? "Yes" : "No"}`}
                    sx={{ borderRadius: 999, fontWeight: 900, background: surface2, border: `1px solid ${divider}`, color: ink }}
                  />
                  <Chip
                    label={`Shipping: ${product?.shipping_type || "flat_rate"}`}
                    sx={{ borderRadius: 999, fontWeight: 900, background: surface2, border: `1px solid ${divider}`, color: ink }}
                  />
                  {product?.est_shipping_days != null ? (
                    <Chip
                      label={`Est: ${product.est_shipping_days} day(s)`}
                      sx={{ borderRadius: 999, fontWeight: 900, background: surface2, border: `1px solid ${divider}`, color: ink }}
                    />
                  ) : null}
                </Stack>

              </Stack>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <RelatedProduct productId={product?.id} />
          </Grid>
          <Grid item xs={12} md={8}>
            <ProductReview productId={product?.id} />
            <ProductDescription description={product?.description} ink={ink} subInk={subInk} />
          </Grid>
        </Grid>

        <Snackbar open={!!msg} autoHideDuration={2500} onClose={() => setMsg("")} message={msg} />
      </Container>
    </Box>
  );
};

export default ProductDetail;
