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
import { getCategory } from "../../../api/controller/admin_controller/product/setting_controller";
import { image_file_url } from "../../../api/config";
import { addCart, getCartByUser } from "../../../api/controller/admin_controller/order/cart_controller";

import Hero from "./components/Hero";
import CategoryQuickFilter from "./components/CategoryQuickFilter";
import FeaturedTitle from "./components/FeaturedTitle";

// Smart card you already made
import SmartProductCard from "./components/ProductCard";

const HomeP1 = () => {
  const theme = useTheme();

  // theme helpers (works with the improved theme I gave you)
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
  const navigate = useNavigate();

  const userId = useMemo(() => {
    const id = localStorage.getItem("userId");
    return id ? String(id) : null;
  }, []);

  const getPrimaryImage = useCallback((product) => {
    const imgPath =
      product?.primary_image?.image ||
      (product?.images?.length
        ? (product.images.find((i) => i.is_primary) || product.images[0])?.image
        : null);

    if (imgPath) return `${image_file_url}/${imgPath}`;
    return "/assets/images/placeholder.png";
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const c = await getCategory();
      const list = Array.isArray(c) ? c : c?.data?.data || [];
      setCategories(list);
    } catch (e) {
      console.error(e);
      setCategories([]);
    }
  }, []);

  const loadProducts = useCallback(async ({ search = "", categoryId = "", page = 1, per_page = 24 } = {}) => {
    setLoading(true);
    try {
      const p = await getProduct({ page, per_page, search, category_id: categoryId });
      const list = p?.data?.data ?? p?.data ?? [];
      setProducts(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error(e);
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

  useEffect(() => {
    loadCategories();
    loadProducts({ page: 1, per_page: 24 });
    refreshCartCount();
  }, [loadCategories, loadProducts, refreshCartCount]);

  useEffect(() => {
    const handler = () => refreshCartCount();
    window.addEventListener("cart-updated", handler);
    return () => window.removeEventListener("cart-updated", handler);
  }, [refreshCartCount]);

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

  const handleAddToCart = async (product) => {
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
  };

  const toggleWishlist = (product) => {
    const id = product?.id;
    if (!id) return;

    setWishIds((prev) => {
      const has = prev.includes(id);
      const next = has ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem("wishlist", JSON.stringify(next));
      window.dispatchEvent(new Event("wishlist-updated"));
      return next;
    });
  };

  const clearFilters = () => {
    setQuery("");
    setCategory("");
    loadProducts({ page: 1, per_page: 24, search: "", categoryId: "" });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: pageBg,
        // Theme-based glow (no hardcoded teal/purple/pink)
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

        {/* Header row (theme-driven) */}
        <Box
          sx={{
            mb: 2,
            display: "flex",
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
            p: 2,
            borderRadius: 4,
            border: `1px solid ${border}`,
            background: glass,
            backdropFilter: "blur(10px)",
          }}
        >
          <Box sx={{ flex: 1, minWidth: 240 }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 950,
                letterSpacing: -0.7,
                background: brand.gradient || `linear-gradient(90deg, #FA5C5C, #FD8A6B, #FEC288, #FBEF76)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Shop the best products
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 700 }}>
              Browse by category, search from the topbar, tap product for details.
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1.2, alignItems: "center", flexWrap: "wrap" }}>
            <Select
              size="small"
              displayEmpty
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              sx={{
                minWidth: 200,
                borderRadius: 999,
                background: glass,
                border: `1px solid ${border}`,
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "transparent" },
                "&:hover": { background: glass2 },
              }}
            >
              <MenuItem value="">All categories</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>

            <Button
              variant="outlined"
              onClick={clearFilters}
              sx={{
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 900,
                borderColor: border,
                background: glass,
                "&:hover": { background: glass2, borderColor: theme.palette.primary.main },
              }}
            >
              Clear
            </Button>

            <Tooltip title="Cart">
              <IconButton
                onClick={() => navigate("/cart")}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${border}`,
                  background: glass,
                  "&:hover": { background: glass2 },
                }}
              >
                <Badge badgeContent={cartCount} color="secondary">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Wishlist">
              <IconButton
                onClick={() => navigate("/wishlist")}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${border}`,
                  background: glass,
                  "&:hover": { background: glass2 },
                }}
              >
                <Badge badgeContent={wishIds.length} color="secondary">
                  {wishIds.length ? <Favorite /> : <FavoriteBorder />}
                </Badge>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <CategoryQuickFilter categories={categories} category={category} setCategory={setCategory} />

        <FeaturedTitle>Featured Products</FeaturedTitle>

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
                      product={{
                        id: product.id,
                        name: product.name,
                        image: getPrimaryImage(product),
                        price: product.price,
                        sale_price: product.sale_price,
                        discount_percent: product.discount_percent,
                        in_stock: product.in_stock ?? ((product.stock_qty || 0) > 0),
                        rating: product.rating ?? 4.5,          // UI filler if API missing
                        reviews_count: product.reviews_count ?? 12, // UI filler if API missing
                        sku: product.sku,
                        category: product.category?.name,
                        variant: product.variant_label,
                      }}
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
