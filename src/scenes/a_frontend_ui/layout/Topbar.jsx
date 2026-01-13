import React, { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, Box, IconButton, Badge, TextField, Button } from "@mui/material";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate } from 'react-router-dom';

const Topbar = () => {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const update = () => {
      try {
        const raw = localStorage.getItem('cart');
        const parsed = raw ? JSON.parse(raw) : 0;
        if (Array.isArray(parsed)) setCartCount(parsed.length);
        else if (typeof parsed === 'number') setCartCount(parsed);
      } catch (e) {
        setCartCount(0);
      }
    };

    update();
    window.addEventListener('cart-updated', update);
    return () => window.removeEventListener('cart-updated', update);
  }, []);

  const handleSearch = () => {
    if (!query || !query.trim()) {
      navigate('/ecom');
      window.dispatchEvent(new CustomEvent('search', { detail: '' }));
      return;
    }
    navigate('/ecom');
    window.dispatchEvent(new CustomEvent('search', { detail: query.trim() }));
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <AppBar position="sticky" color="default" elevation={1} sx={{ mb: 2 }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" sx={{ cursor: 'pointer', fontWeight: 800 }} onClick={() => navigate('/ecom')}>
            ShopLogo
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, maxWidth: 720 }}>
          <TextField
            size="small"
            placeholder="Search products by name or SKU"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            fullWidth
          />
          <Button variant="contained" size="small" onClick={handleSearch}>Search</Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button variant="text" onClick={() => navigate('/ecom/seller/add')}>Become Seller</Button>
          <Button variant="text" onClick={() => navigate('/ecom/about')}>About</Button>
          <Button variant="text" onClick={() => navigate('/login')}>Login</Button>

          <IconButton color="inherit" onClick={() => navigate('/ecom/cart')}>
            <Badge badgeContent={cartCount} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
