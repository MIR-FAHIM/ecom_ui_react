import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { tokens } from "../../../../theme";
import { addCart, getCartByUser } from "../../../../api/controller/admin_controller/order/cart_controller";
import { getUserWish, addWish, deleteWish } from "../../../../api/controller/admin_controller/wishlist/wish_controller";

const safeArray = (x) => (Array.isArray(x) ? x : []);

let lastWishSync = 0;
let lastCartSync = 0;
let wishSyncPromise = null;
let cartSyncPromise = null;
const SYNC_TTL = 30 * 1000;

const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : fallback;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
};

const syncWishlist = async (userId) => {
  if (!userId) return;
  const now = Date.now();
  if (now - lastWishSync < SYNC_TTL) return;
  if (wishSyncPromise) return wishSyncPromise;

  lastWishSync = now;
  wishSyncPromise = (async () => {
    const res = await getUserWish(userId);
    const list = res?.data?.data ?? res?.data ?? res ?? [];
    const arr = safeArray(list);

    const ids = [];
    const map = {};

    arr.forEach((item) => {
      const pid = item?.product_id ?? item?.product?.id;
      const wid = item?.id;
      if (pid) ids.push(Number(pid));
      if (pid && wid) map[String(pid)] = wid;
    });

    const unique = Array.from(new Set(ids));
    writeJson("wishlist", unique);
    writeJson("wishlistMap", map);
    window.dispatchEvent(new Event("wishlist-updated"));
  })().finally(() => {
    wishSyncPromise = null;
  });

  return wishSyncPromise;
};

const syncCart = async (userId, force = false) => {
  if (!userId) return;
  const now = Date.now();
  if (!force && now - lastCartSync < SYNC_TTL) return;
  if (cartSyncPromise) return cartSyncPromise;

  lastCartSync = now;
  cartSyncPromise = (async () => {
    const res = await getCartByUser(userId);
    const items = res?.data?.items ?? res?.data?.data?.items ?? res?.data?.data ?? res?.data ?? [];
    const arr = safeArray(items);
    const ids = arr
      .map((x) => x?.product_id ?? x?.product?.id)
      .filter((v) => v !== undefined && v !== null)
      .map((v) => Number(v))
      .filter((v) => Number.isFinite(v));

    writeJson("cartItems", ids);
    const total = res?.data?.total_items ?? arr.length;
    writeJson("cart", Number(total || 0));
    window.dispatchEvent(new Event("cart-updated"));
  })().finally(() => {
    cartSyncPromise = null;
  });

  return cartSyncPromise;
};

export default function SmartProductCard({
  product,
  inCart: inCartProp,
  inWish: inWishProp,
  onView,
}) {
  const theme = useTheme();

  const [userId, setUserId] = useState(() => {
    const id = localStorage.getItem("userId");
    return id ? String(id) : null;
  });
  const [inCart, setInCart] = useState(Boolean(inCartProp));
  const [inWish, setInWish] = useState(Boolean(inWishProp));

  const colors = tokens(theme.palette.mode);
  const divider = theme.palette.divider || colors.primary[200];

  const surface = colors.primary[400];
  const surface2 = colors.primary[300];
  const ink = colors.gray[100];
  const subInk = colors.gray[300];

  const accent = theme.palette.mode === "dark" ? colors.blueAccent[400] : colors.blueAccent[100];
  const accentSoft = theme.palette.mode === "dark" ? colors.blueAccent[700] : colors.blueAccent[900];

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

  const refreshLocalStates = useCallback(() => {
    const ids = readJson("wishlist", []);
    setInWish(Array.isArray(ids) && ids.map(String).includes(String(product?.id)));

    const cartIds = readJson("cartItems", []);
    setInCart(Array.isArray(cartIds) && cartIds.map(String).includes(String(product?.id)));
  }, [product?.id]);

  useEffect(() => {
    refreshLocalStates();
  }, [refreshLocalStates]);

  useEffect(() => {
    if (typeof inWishProp === "boolean") setInWish(inWishProp);
  }, [inWishProp]);

  useEffect(() => {
    if (typeof inCartProp === "boolean") setInCart(inCartProp);
  }, [inCartProp]);

  useEffect(() => {
    const onAuth = () => {
      const id = localStorage.getItem("userId");
      setUserId(id ? String(id) : null);
    };
    const onWish = () => refreshLocalStates();
    const onCart = () => refreshLocalStates();

    window.addEventListener("auth-changed", onAuth);
    window.addEventListener("wishlist-updated", onWish);
    window.addEventListener("cart-updated", onCart);

    return () => {
      window.removeEventListener("auth-changed", onAuth);
      window.removeEventListener("wishlist-updated", onWish);
      window.removeEventListener("cart-updated", onCart);
    };
  }, [refreshLocalStates]);

  useEffect(() => {
    if (!userId) return;
    syncWishlist(userId).catch(() => null);
    syncCart(userId).catch(() => null);
  }, [userId]);

  const handleToggleWish = useCallback(async (e) => {
    e.stopPropagation();
    const pid = product?.id;
    if (!pid) return;

    const currentIds = readJson("wishlist", []);
    const has = currentIds.map(String).includes(String(pid));
    const next = has ? currentIds.filter((x) => String(x) !== String(pid)) : [...currentIds, pid];
    const unique = Array.from(new Set(next));
    writeJson("wishlist", unique);
    setInWish(!has);
    window.dispatchEvent(new Event("wishlist-updated"));

    if (!userId) return;

    try {
      if (has) {
        const map = readJson("wishlistMap", {});
        const wid = map?.[String(pid)] ?? pid;
        await deleteWish(wid);
        const nextMap = { ...map };
        delete nextMap[String(pid)];
        writeJson("wishlistMap", nextMap);
      } else {
        const res = await addWish({ user_id: userId, product_id: pid });
        const wid = res?.data?.id ?? res?.id ?? null;
        if (wid) {
          const map = readJson("wishlistMap", {});
          writeJson("wishlistMap", { ...map, [String(pid)]: wid });
        }
      }
      syncWishlist(userId).catch(() => null);
    } catch (err) {
      console.error("toggle wishlist error:", err);
      refreshLocalStates();
    }
  }, [product?.id, refreshLocalStates, userId]);

  const handleAddToCart = useCallback(async (e) => {
    e.stopPropagation();
    const pid = product?.id;
    if (!pid) return;
    if (!userId) {
      alert("Please login to add to cart.");
      return;
    }

    try {
      const res = await addCart({ user_id: userId, product_id: pid, qty: 1 });
      if (res?.status === "success") {
        const current = readJson("cartItems", []);
        const next = Array.isArray(current) ? [...current, pid] : [pid];
        const unique = Array.from(new Set(next.map(String))).map((v) => (Number.isFinite(Number(v)) ? Number(v) : v));
        writeJson("cartItems", unique);
        writeJson("cart", unique.length);
        setInCart(true);
        window.dispatchEvent(new Event("cart-updated"));
        await syncCart(userId, true);
      } else {
        alert(res?.message || "Failed to add to cart");
      }
    } catch (err) {
      console.error("add to cart error:", err);
      alert("Error adding to cart");
    }
  }, [product?.id, userId]);

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
          background: surface,
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
                    background: accent,
                    color: "#fff",
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
                onClick={handleToggleWish}
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
                  onClick={handleAddToCart}
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: 4,
                    border: `1px solid ${divider}`,
                    background: surface,
                    
                    boxShadow: `0 10px 22px ${accentSoft}`,
                    transition: "transform 120ms ease, box-shadow 180ms ease, filter 180ms ease",
                    "&:hover": {
                      transform: "translateY(-1px) scale(1.03)",
                      filter: "saturate(1.05)",
                      boxShadow: `0 14px 28px ${accentSoft}`,
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
          {/* Row 1: Name */}
          <Typography
            fontWeight={950}
            sx={{
              color: ink,
              letterSpacing: -0.2,
              lineHeight: 1.15,
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {product?.name || "Unnamed product"}
          </Typography>

          {/* Row 2: Price */}
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography
              fontWeight={950}
              sx={{
                fontSize: 18,
                color: accent,
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

          {/* Row 3: Other */}
          <Stack direction="row" spacing={1} alignItems="center">
          

            <Rating value={ratingValue} precision={0.5} size="small" readOnly />
            <Typography variant="caption" sx={{ fontWeight: 800, color: subInk }}>
              ({reviewsCount})
            </Typography>

            <Chip
              size="small"
              label={"Sold: " + (product?.total_sales ?? product?.sales_count ?? 0)}
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
