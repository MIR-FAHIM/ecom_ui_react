import React, { useEffect, useState } from 'react';
import { Box, Container, Grid, Paper, List, ListItemButton, ListItemText, Typography, Divider, Button } from '@mui/material';
import { getUserDetail } from '../../../api/controller/admin_controller/user_controller.jsx';
import { useNavigate } from 'react-router-dom';

const MENU = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'orders', label: 'Purchase History' },
  { key: 'addresses', label: 'Addresses' },
  { key: 'reviews', label: 'Reviews' },
  { key: 'wishlist', label: 'Wish List' },
  { key: 'support', label: 'Support Tickets' },
  { key: 'delete', label: 'Delete My Account' },
  { key: 'logout', label: 'Logout' },
];

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState('dashboard');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const storedId = localStorage.getItem('userId');
        if (!storedId) {
          setUser(null);
          setLoading(false);
          return;
        }
        const res = await getUserDetail(storedId);
        // response shape: { status, message, data }
        const u = res?.data ?? res?.data?.data ?? res?.data ?? null;
        setUser(u || res?.data || null);
      } catch (e) {
        console.error('Failed to load user detail', e);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    window.dispatchEvent(new Event('auth-changed'));
    navigate('/');
  };

  const renderContent = () => {
    if (!user) return <Typography>Please login to see your profile.</Typography>;

    switch (selected) {
      case 'dashboard':
        return (
          <Box>
            <Typography variant="h6">Welcome, {user.name}</Typography>
            <Typography variant="body2" color="text.secondary">Email: {user.email}</Typography>
            <Typography variant="body2" color="text.secondary">Phone: {user.phone}</Typography>
          </Box>
        );

      case 'orders':
        return <Typography>Purchase history will appear here.</Typography>;
      case 'addresses':
        return <Typography>Manage your saved addresses here.</Typography>;
      case 'reviews':
        return <Typography>Your reviews will appear here.</Typography>;
      case 'wishlist':
        return <Typography>Your wish list items will appear here.</Typography>;
      case 'support':
        return <Typography>Open support tickets and create new ones here.</Typography>;
      case 'delete':
        return (
          <Box>
            <Typography color="error" sx={{ mb: 2 }}>Delete your account permanently.</Typography>
            <Button color="error" variant="contained" onClick={() => alert('Send delete request (demo)')}>Delete My Account</Button>
          </Box>
        );
      case 'logout':
        return (
          <Box>
            <Typography sx={{ mb: 2 }}>You will be logged out of your account.</Typography>
            <Button variant="contained" onClick={handleLogout}>Logout</Button>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>My Profile</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 1 }}>
            <List>
              {MENU.map((m) => (
                <ListItemButton key={m.key} selected={selected === m.key} onClick={() => setSelected(m.key)}>
                  <ListItemText primary={m.label} />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 3, minHeight: 320 }}>
            {loading ? <Typography>Loading…</Typography> : renderContent()}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;
