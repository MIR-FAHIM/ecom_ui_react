import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Box, Container, Grid, Typography, CircularProgress, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";

import SmartProductCard from "../home/components/ProductCard";
import { getUserWish } from "../../../api/controller/admin_controller/wishlist/wish_controller";
import { getProductDetails } from "../../../api/controller/admin_controller/product/product_controller";

const Wish = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [wishIds, setWishIds] = useState([]);

  const userId = useMemo(() => {
    const id = localStorage.getItem("userId");
    return id ? String(id) : null;
  }, []);

  const loadWishlistForUser = useCallback(async () => {
    setLoading(true);
    try {
      if (!userId) {
        // use local ids
        const ids = Array.isArray(wishIds) ? wishIds : [];
        const details = await Promise.all(ids.map((id) => getProductDetails(id).catch(() => null)));
        const list = details.filter(Boolean).map((p) => p?.data?.data ?? p?.data ?? p);
        setProducts(list);
        return;
      }

      // logged in: fetch wishlist from API
      const res = await getUserWish(userId);

      // response shape: { count, items: [{... , product: {...}}] }
      const payload = res?.data ?? res ?? {};
      const payloadArray = Array.isArray(payload?.items) ? payload.items : [];

      // map entries to product objects and build wishlist map
      const map = {};
      payloadArray.forEach((entry) => {
        const pid = entry?.product_id ?? entry?.product?.id;
        const wid = entry?.id;
        if (pid && wid) map[String(pid)] = wid;
      });

      let items = payloadArray.map((entry) => entry?.product ?? entry).filter(Boolean);
      // if items are IDs (numbers), fetch product details
      const needsFetch = items.length > 0 && typeof items[0] === "number";
      if (needsFetch) {
        const details = await Promise.all(items.map((id) => getProductDetails(id).catch(() => null)));
        items = details.filter(Boolean).map((p) => p?.data?.data ?? p?.data ?? p);
      }

      setProducts(items);

      // sync localStorage for SmartProductCard actions
      const ids = items.map((p) => Number(p?.id)).filter(Boolean);
      localStorage.setItem("wishlist", JSON.stringify(ids));
      localStorage.setItem("wishlistMap", JSON.stringify(map));
      window.dispatchEvent(new Event("wishlist-updated"));
    } catch (e) {
      console.error("Failed to load wishlist", e);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [userId, wishIds]);

  useEffect(() => {
    loadWishlistForUser();
    const onWish = () => {
      setWishIds((prev) => (Array.isArray(prev) ? prev : []));
      loadWishlistForUser();
    };

    const onAuth = () => loadWishlistForUser();

    window.addEventListener("wishlist-updated", onWish);
    window.addEventListener("auth-changed", onAuth);
    return () => {
      window.removeEventListener("wishlist-updated", onWish);
      window.removeEventListener("auth-changed", onAuth);
    };
  }, [loadWishlistForUser]);

  return (
    <Box sx={{ minHeight: "100vh", background: theme.palette.background?.default || "#fff" }}>
      <Container sx={{ py: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>
          Your Wishlist
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : products.length === 0 ? (
          <Typography variant="h6" align="center" sx={{ py: 6, fontWeight: 900, color: "text.secondary" }}>
            No items in your wishlist.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {products.map((product) => (
              <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
                <SmartProductCard
                  product={product}
                  onView={() => navigate(`/product/${product.id}`)}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default Wish;
