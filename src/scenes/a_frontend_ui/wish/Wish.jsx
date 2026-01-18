import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Box, Container, Grid, Typography, CircularProgress, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";

import SmartProductCard from "../home/components/ProductCard";
import { getUserWish, addWish, deleteWish } from "../../../api/controller/admin_controller/wishlist/wish_controller";
import { getProductDetails } from "../../../api/controller/admin_controller/product/product_controller";
import { addCart, getCartByUser } from "../../../api/controller/admin_controller/order/cart_controller";
import { image_file_url } from "../../../api/config";

const Wish = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [rawEntries, setRawEntries] = useState([]);
  const [wishIds, setWishIds] = useState([]);

  const userId = useMemo(() => {
    const id = localStorage.getItem("userId");
    return id ? String(id) : null;
  }, []);

  const getPrimaryImage = useCallback((product) => {
    const imgPath = product?.image || product?.primary_image?.image || (product?.images?.length ? (product.images.find((i) => i.is_primary) || product.images[0])?.image : null);
    if (imgPath) return `${image_file_url}/${imgPath}`;
    return "/assets/images/placeholder.png";
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

      // normalize possible response shapes:
      // - direct array
      // - { items: [...] }
      // - { data: { data: [...] } } (common API wrapper)
      let payloadArray = [];
      if (Array.isArray(res)) payloadArray = res;
      else if (Array.isArray(res?.items)) payloadArray = res.items;
      else if (Array.isArray(res?.data?.data)) payloadArray = res.data.data;
      else if (Array.isArray(res?.data)) payloadArray = res.data;
      else payloadArray = [];

      // map entries to product objects (entry may contain `product` or be the product itself)
      let items = payloadArray.map((entry) => entry?.product ?? entry).filter(Boolean);
      setRawEntries(Array.isArray(payloadArray) ? payloadArray : []);
      // if items are IDs (numbers), fetch product details
      const needsFetch = items.length > 0 && typeof items[0] === "number";
      if (needsFetch) {
        const details = await Promise.all(items.map((id) => getProductDetails(id).catch(() => null)));
        items = details.filter(Boolean).map((p) => p?.data?.data ?? p?.data ?? p);
      }

      setProducts(items);
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
        // keep in-memory wishIds in sync; no localStorage for wishlist
        setWishIds((prev) => Array.isArray(prev) ? prev : []);
        loadWishlistForUser();
    };

    window.addEventListener("wishlist-updated", onWish);
    return () => window.removeEventListener("wishlist-updated", onWish);
  }, [loadWishlistForUser]);

  const refreshCartCount = useCallback(async () => {
    try {
      if (userId) {
        const cartRes = await getCartByUser(userId);
        const total = cartRes?.data?.total_items ?? (Array.isArray(cartRes?.data?.items) ? cartRes.data.items.length : 0);
        localStorage.setItem("cart", JSON.stringify(total));
        window.dispatchEvent(new Event("cart-updated"));
        return;
      }
    } catch (e) {
      // ignore
    }
    try {
      const raw = localStorage.getItem("cart");
      const parsed = raw ? JSON.parse(raw) : 0;
      localStorage.setItem("cart", JSON.stringify(Array.isArray(parsed) ? parsed.length : Number(parsed || 0)));
      window.dispatchEvent(new Event("cart-updated"));
    } catch {}
  }, [userId]);

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
      console.error(e);
      alert("Error adding to cart");
    }
  };

  const toggleWishlist = async (product) => {
    const id = product?.id;
    if (!id) return;

    if (userId) {
      try {
        // check if already wished on server (rawEntries contains wishlist entries)
        const existing = rawEntries.find((e) => (e?.product?.id ?? e?.product_id) === id || (e?.product_id ?? e?.product?.id) === id);
        if (existing && existing?.id) {
          await deleteWish(existing.id);
        } else {
          await addWish({ user_id: userId, product_id: id });
        }
      } catch (e) {
        console.error("addWish/deleteWish error", e);
      }
      // refresh server wishlist
      await loadWishlistForUser();
      window.dispatchEvent(new Event("wishlist-updated"));
      return;
    }

    // client-only toggle (in-memory only, do not persist to localStorage)
    setWishIds((prev) => {
      const has = prev.includes(id);
      const next = has ? prev.filter((x) => x !== id) : [...prev, id];
      window.dispatchEvent(new Event("wishlist-updated"));
      return next;
    });
  };

  const inWishCheck = (id) => {
    try {
      if (userId) return products.some((p) => Number(p?.id) === Number(id));
      return wishIds.includes(id);
    } catch {
      return false;
    }
  };

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
                  product={{
                    id: product.id,
                    name: product.name,
                    image: getPrimaryImage(product),
                    price: product.price,
                    sale_price: product.sale_price,
                    discount_percent: product.discount_percent,
                    in_stock: product.in_stock ?? ((product.stock_qty || 0) > 0),
                    rating: product.rating ?? 4.5,
                    reviews_count: product.reviews_count ?? 12,
                    sku: product.sku,
                    category: product.category?.name,
                    variant: product.variant_label,
                  }}
                  inCart={false}
                  inWish={inWishCheck(product.id)}
                  onToggleCart={() => handleAddToCart(product)}
                  onToggleWish={() => toggleWishlist(product)}
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
