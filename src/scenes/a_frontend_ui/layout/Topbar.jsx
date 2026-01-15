import React, { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, Box, IconButton, Badge, TextField, Button, Menu, MenuItem, ListItemIcon } from "@mui/material";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate } from 'react-router-dom';
import { getUserDetail } from '../../../api/controller/admin_controller/user_controller.jsx';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import HistoryIcon from '@mui/icons-material/History';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PersonIcon from '@mui/icons-material/Person';

const Topbar = () => {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [query, setQuery] = useState('');
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedId = localStorage.getItem('userId');
        if (!storedId) return setUser(null);
        const res = await getUserDetail(storedId);
        // res shape: { status, message, data }
        const u = res?.data ?? res?.data?.data ?? res?.data ?? null;
        setUser(u || res?.data || null);
      } catch (e) {
        console.error('Failed to load user detail', e);
        setUser(null);
      }
    };

    loadUser();

    const onAuth = () => loadUser();
    window.addEventListener('auth-changed', onAuth);
    return () => window.removeEventListener('auth-changed', onAuth);
  }, []);

  const handleUserClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    // clear auth and notify
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    setUser(null);
    handleMenuClose();
    window.dispatchEvent(new Event('auth-changed'));
    navigate('/');
  };

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
      navigate('/');
      window.dispatchEvent(new CustomEvent('search', { detail: '' }));
      return;
    }
    navigate('/');
    window.dispatchEvent(new CustomEvent('search', { detail: query.trim() }));
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <AppBar position="sticky" color="default" elevation={1} sx={{ mb: 2 }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" sx={{ cursor: 'pointer', fontWeight: 800 }} onClick={() => navigate('/')}>
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
          <Button variant="text" onClick={() => navigate('/seller/add')}>Become Seller</Button>
          <Button variant="text" onClick={() => navigate('/about')}>About</Button>
          {user ? (
            <>
              <Button
                variant="text"
                startIcon={<AccountCircleIcon />}
                onClick={handleUserClick}
                aria-controls={menuOpen ? 'user-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={menuOpen ? 'true' : undefined}
              >
                {user.name || 'Profile'}
              </Button>

              <Menu
                id="user-menu"
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem onClick={() => { handleMenuClose(); navigate('/orders'); }}>
                  <ListItemIcon><HistoryIcon fontSize="small" /></ListItemIcon>
                  Order history
                </MenuItem>
                <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
                  <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                  Profile
                </MenuItem>
                <MenuItem onClick={() => { handleMenuClose(); navigate('/wishlist'); }}>
                  <ListItemIcon><FavoriteIcon fontSize="small" /></ListItemIcon>
                  Wish list
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button variant="text" onClick={() => navigate('/login')}>Login</Button>
          )}

          <IconButton color="inherit" onClick={() => navigate('/cart')}>
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
