import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, CircularProgress, Container, InputAdornment, MenuItem, Select, TextField, Typography } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { getProduct } from "../../../api/controller/admin_controller/product/product_controller";
import { getCategory } from "../../../api/controller/admin_controller/product/setting_controller";
import { useNavigate } from "react-router-dom";
import SmartProductCard from "./components/ProductCard";

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
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(5, 1fr)",
            },
          }}
        >
          {filtered.length === 0 ? (
            <Box sx={{ gridColumn: "1 / -1" }}>
              <Typography variant="h6" align="center" sx={{ py: 6 }}>
                No products found.
              </Typography>
            </Box>
          ) : (
            filtered.map((product) => (
              <SmartProductCard
                key={product.id}
                product={product}
                onView={() => navigate(`/ecom/product/${product.id}`)}
              />
            ))
          )}
        </Box>
      )}
    </Container>
  );
};

export default HomeP2;
