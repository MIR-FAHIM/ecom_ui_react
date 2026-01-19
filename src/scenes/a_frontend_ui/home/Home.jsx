import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  MenuItem,
  Select,
  Typography,
  IconButton,
  Badge,
  Tooltip,
  useTheme,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import Favorite from "@mui/icons-material/Favorite";
import { useNavigate } from "react-router-dom";

import { getProduct } from "../../../api/controller/admin_controller/product/product_controller";
import { getUserWish, addWish, deleteWish } from "../../../api/controller/admin_controller/wishlist/wish_controller";
import { getCategory } from "../../../api/controller/admin_controller/product/setting_controller";
import { addCart, getCartByUser } from "../../../api/controller/admin_controller/order/cart_controller";

import Hero from "./components/Hero";
import CategoryQuickFilter from "./components/CategoryQuickFilter";
import CategoryGrid from "./components/CategoryGrid";
import FeaturedTitle from "./components/FeaturedTitle";
import FeaturedProduct from "./components/FeaturedProduct";
import SmartProductCard from "./components/ProductCard";
import TodayDealProduct from "./components/TodayDealProduct";

const safeArray = (x) => (Array.isArray(x) ? x : []);

const HomeP1 = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const brand = theme.palette.brand || {};
  const semantic = theme.palette.semantic || {};
  const border = theme.palette.divider || "rgba(0,0,0,0.08)";
  const glass = semantic.surface || (theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)");
  const glass2 = semantic.surface2 || (theme.palette.mode === "dark" ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.05)");
  const pageBg = theme.palette.background?.default || "#fff";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");

  const [cartCount, setCartCount] = useState(0);

  // We store WISH as array of productIds
  const [wishIds, setWishIds] = useState(() => {
    try {
      const raw = localStorage.getItem("wishlist");
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [query, setQuery] = useState("");

  const userId = useMemo(() => {
    const id = localStorage.getItem("userId");
    return id ? String(id) : null;
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const c = await getCategory();
      const list = Array.isArray(c) ? c : c?.data?.data || [];

      // Keep nested structure (top-level categories with `children` array)
      setCategories(safeArray(list));
    } catch (e) {
      console.error("loadCategories error:", e);
      setCategories([]);
    }
  }, []);

  const loadProducts = useCallback(async ({ search = "", categoryId = "", page = 1, per_page = 24 } = {}) => {
    setLoading(true);
    try {
      const p = await getProduct({ page, per_page, search, category_id: categoryId });
      const list = p?.data?.data ?? p?.data ?? [];
      setProducts(safeArray(list));
    } catch (e) {
      console.error("loadProducts error:", e);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshCartCount = useCallback(async () => {
    try {
      if (userId) {
        const cartRes = await getCartByUser(userId);
        const total =
          cartRes?.data?.total_items ??
          (Array.isArray(cartRes?.data?.items) ? cartRes.data.items.length : 0);

        localStorage.setItem("cart", JSON.stringify(total));
        setCartCount(Number(total || 0));
        return;
      }
    } catch (e) {
      console.error("refreshCartCount error:", e);
    }

    try {
      const raw = localStorage.getItem("cart");
      const parsed = raw ? JSON.parse(raw) : 0;
      setCartCount(Array.isArray(parsed) ? parsed.length : Number(parsed || 0));
    } catch {
      setCartCount(0);
    }
  }, [userId]);

  const syncWishlistFromServer = useCallback(async () => {
    // If user not logged in, keep local wishlist only
    if (!userId) return;

    try {
      const res = await getUserWish(userId);

      // Guessing common shapes:
      // res.data.data: [{ id, product_id, product: {...} }, ...]
      // or res.data: [...]
      const list = res?.data?.data ?? res?.data ?? res ?? [];
      const arr = safeArray(list);

      const ids = arr
        .map((x) => x?.product_id ?? x?.product?.id ?? x?.id)
        .filter((v) => v !== undefined && v !== null)
        .map((v) => Number(v))
        .filter((v) => Number.isFinite(v));

      const unique = Array.from(new Set(ids));
      setWishIds(unique);
      localStorage.setItem("wishlist", JSON.stringify(unique));
      window.dispatchEvent(new Event("wishlist-updated"));
    } catch (e) {
      console.error("syncWishlistFromServer error:", e);
    }
  }, [userId]);

  useEffect(() => {
    loadCategories();
    refreshCartCount();
    syncWishlistFromServer();
  }, [loadCategories, refreshCartCount, syncWishlistFromServer]);

  useEffect(() => {
    const handler = (e) => {
      const detail = (e?.detail || "").toString();
      setQuery(detail);
      loadProducts({ page: 1, per_page: 24, search: detail, categoryId: category || "" });
    };
    window.addEventListener("search", handler);
    return () => window.removeEventListener("search", handler);
  }, [loadProducts, category]);

  useEffect(() => {
    loadProducts({ page: 1, per_page: 24, search: query, categoryId: category || "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const filtered = useMemo(() => {
    let list = products;
    if (category) list = list.filter((p) => String(p.category_id) === String(category));
    return list;
  }, [products, category]);

  const handleAddToCart = useCallback(
    async (product) => {
      if (!userId) {
        alert("Please login to add to cart.");
        return;
      }

      try {
        const payload = { user_id: userId, product_id: product.id, qty: 1 };
        const res = await addCart(payload);

        if (res?.status === "success") {
          await refreshCartCount();
          window.dispatchEvent(new Event("cart-updated"));
        } else {
          alert(res?.message || "Failed to add to cart");
        }
      } catch (e) {
        console.error("Error adding to cart:", e);
        alert("Error adding to cart");
      }
    },
    [userId, refreshCartCount]
  );

  // Toggle wishlist: if logged in, do server + local. if not, local only.
  const toggleWishlist = useCallback(
    async (product) => {
      const pid = product?.id;
      if (!pid) return;

      const has = wishIds.includes(pid);

      // optimistic update (feels fast)
      const next = has ? wishIds.filter((x) => x !== pid) : [...wishIds, pid];
      const unique = Array.from(new Set(next));
      setWishIds(unique);
      localStorage.setItem("wishlist", JSON.stringify(unique));
      window.dispatchEvent(new Event("wishlist-updated"));

      if (!userId) return;

      try {
        if (has) {
          // delete by product id (common), but your API might require wish id.
          // If your deleteWish expects (userId, productId), this works.
          // If it expects wish row id, you must change controller to accept product_id.
          await deleteWish({ user_id: userId, product_id: pid });
        } else {
          await addWish({ user_id: userId, product_id: pid });
        }
      } catch (e) {
        console.error("toggleWishlist server error:", e);

        // rollback if server fails
        const rollback = has ? [...wishIds, pid] : wishIds.filter((x) => x !== pid);
        const rb = Array.from(new Set(rollback));
        setWishIds(rb);
        localStorage.setItem("wishlist", JSON.stringify(rb));
        window.dispatchEvent(new Event("wishlist-updated"));
      }
    },
    [userId, wishIds]
  );

  const clearFilters = useCallback(() => {
    setQuery("");
    setCategory("");
    loadProducts({ page: 1, per_page: 24, search: "", categoryId: "" });
  }, [loadProducts]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: pageBg,
        backgroundImage:
          theme.palette.mode === "dark"
            ? `radial-gradient(1200px 700px at 10% 0%, rgba(251,239,118,0.10), transparent 55%),
               radial-gradient(1200px 700px at 90% 5%, rgba(250,92,92,0.10), transparent 55%),
               radial-gradient(1200px 700px at 50% 95%, rgba(254,194,136,0.08), transparent 55%)`
            : `radial-gradient(1200px 700px at 10% 0%, rgba(251,239,118,0.22), transparent 55%),
               radial-gradient(1200px 700px at 90% 5%, rgba(250,92,92,0.18), transparent 55%),
               radial-gradient(1200px 700px at 50% 95%, rgba(254,194,136,0.14), transparent 55%)`,
      }}
    >
      <Container sx={{ py: 3 }}>
        <Hero />

      

      
        <CategoryGrid categories={categories} />

        <FeaturedProduct
          wishIds={wishIds}
          onToggleWish={(product) => toggleWishlist(product)}
          onToggleCart={(product) => handleAddToCart(product)}
          onView={(product) => navigate(`/product/${product.id}`)}
        />

        <TodayDealProduct
          wishIds={wishIds}
          onToggleWish={(product) => toggleWishlist(product)}
          onToggleCart={(product) => handleAddToCart(product)}
          onView={(product) => navigate(`/product/${product.id}`)}
        />

        <FeaturedTitle>All Products</FeaturedTitle>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {filtered.length === 0 ? (
              <Grid item xs={12}>
                <Typography variant="h6" align="center" sx={{ py: 6, fontWeight: 900, color: "text.secondary" }}>
                  No products found.
                </Typography>
              </Grid>
            ) : (
              filtered.map((product) => {
                const inWish = wishIds.includes(product.id);

                return (
                  <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
                    <SmartProductCard
                      product={product}
                      inCart={false}
                      inWish={inWish}
                      onToggleCart={() => handleAddToCart(product)}
                      onToggleWish={() => toggleWishlist(product)}
                      onView={() => navigate(`/product/${product.id}`)}
                    />
                  </Grid>
                );
              })
            )}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default HomeP1;
