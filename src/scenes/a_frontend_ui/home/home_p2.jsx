import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Card, CardActions, CardContent, CardMedia, CircularProgress, Container, Grid, InputAdornment, MenuItem, Select, TextField, Typography } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { getProduct } from "../../../api/controller/admin_controller/product/product_controller";
import { getCategory } from "../../../api/controller/admin_controller/product/setting_controller";
import { image_file_url } from "../../../api/config";
import { useNavigate } from "react-router-dom";
import { addCart, getCartByUser } from "../../../api/controller/admin_controller/order/cart_controller"; 

const HomeP2 = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const p = await getProduct({ page: 0, per_page: 24 });
        // product API returns a pagination object: p.data.data => array
        setProducts(p.data?.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    const loadCategories = async () => {
      try {
        const c = await getCategory();
        if (Array.isArray(c)) {
          setCategories(c);
        } else {
          setCategories(c?.data?.data || []);
        }
      } catch (e) {
        console.error(e);
      }
    };

    loadCategories();
    loadData();
  }, []);

  const filtered = useMemo(() => {
    let list = products;
    if (category) list = list.filter((p) => String(p.category_id) === String(category));
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((p) => (p.name || '').toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q));
    }
    return list;
  }, [products, query, category]);

  const handleAddToCart = async (product) => {
    const userId = localStorage.getItem('userId') || 1;
    try {
      const payload = { user_id: userId, product_id: product.id, qty: 1 };
      const res = await addCart(payload);
      if (res?.status === 'success') {
        const cartRes = await getCartByUser(userId);
        const total = cartRes?.data?.total_items ?? (Array.isArray(cartRes?.data?.items) ? cartRes.data.items.length : 0);
        localStorage.setItem('cart', JSON.stringify(total));
        window.dispatchEvent(new Event('cart-updated'));
        alert(res?.message || 'Added to cart');
      } else {
        alert(res?.message || 'Failed to add to cart');
      }
    } catch (e) {
      console.error('Error adding to cart:', e);
      alert('Error adding to cart');
    }
  }; 

  const getPrimaryImage = (product) => {
    const imgPath = product.primary_image?.image ||
      (product.images && product.images.length > 0 && ((product.images.find((i) => i.is_primary) || product.images[0]).image));
    if (imgPath) return `${image_file_url}/${imgPath}`;
    // fallback placeholder
    return "/assets/images/placeholder.png";
  };

  // price helper for display
  const getDisplayPrice = (product) => {
    return product.sale_price || product.price || '—';
  };

  return (
    <Container sx={{ py: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Shop the best products
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Browse by category, search products, and view details.
          </Typography>
        </Box>

        <TextField
          size="small"
          placeholder="Search products by name or SKU"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 320 }}
        />

        <Select
          size="small"
          displayEmpty
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">All categories</MenuItem>
          {categories.map((c) => (
            <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
          ))}
        </Select>

        <Button variant="outlined" onClick={() => { setQuery(''); setCategory(''); }}>Clear</Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filtered.length === 0 ? (
            <Grid item xs={12}>
              <Typography variant="h6" align="center" sx={{ py: 6 }}>
                No products found.
              </Typography>
            </Grid>
          ) : (
            filtered.map((product) => (
              <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="180"
                    image={getPrimaryImage(product)}
                    alt={product.name}
                    sx={{ cursor: 'pointer', objectFit: 'cover' }}
                    onClick={() => navigate(`/ecom/product/${product.id}`)}
                  />
                  <CardContent sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate(`/ecom/product/${product.id}`)}>{product.name}</Typography>
                    <Typography variant="body2" color="text.secondary">SKU: {product.sku}</Typography>
                    <Typography variant="h6" sx={{ mt: 1 }}>${getDisplayPrice(product)}</Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => navigate(`/ecom/product/${product.id}`)}>View</Button>
                    <Button size="small" variant="contained" onClick={() => handleAddToCart(product)}>Add to cart</Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}
    </Container>
  );
};

export default HomeP2;
