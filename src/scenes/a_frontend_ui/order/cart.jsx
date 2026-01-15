import React, { useEffect, useState } from "react";
import { Container, Box, Typography, CircularProgress, List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider, Button, Paper, IconButton, Snackbar } from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { getCartByUser, updateQuantity, deleteItem } from "../../../api/controller/admin_controller/order/cart_controller";
import { image_file_url } from "../../../api/config";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState(null);
  const navigate = useNavigate();

  const [processing, setProcessing] = useState({});
  const [msg, setMsg] = useState('');

  const loadCart = async () => {
    const userId = localStorage.getItem('userId') || 1;
    setLoading(true);
    try {
      const res = await getCartByUser(userId);
      if (res?.status === 'success') {
        setCart(res.data);
        // keep topbar badge in sync
        const total = res.data?.total_items ?? (Array.isArray(res.data?.items) ? res.data.items.length : 0);
        localStorage.setItem('cart', JSON.stringify(total));
        window.dispatchEvent(new Event('cart-updated'));
      } else {
        setCart(null);
        localStorage.setItem('cart', JSON.stringify(0));
      }
    } catch (e) {
      console.error('Error loading cart:', e);
      setCart(null);
      localStorage.setItem('cart', JSON.stringify(0));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQty = async (item, newQty) => {
    if (newQty < 1) return;
    setProcessing(prev => ({ ...prev, [item.id]: true }));
    try {
      const res = await updateQuantity(item.id, newQty);
      if (res?.status === 'success') {
        setMsg(res.message || 'Updated quantity');
        await loadCart();
      } else {
        setMsg(res?.message || 'Failed to update quantity');
      }
    } catch (e) {
      console.error('Update qty error', e);
      setMsg('Error updating quantity');
    } finally {
      setProcessing(prev => ({ ...prev, [item.id]: false }));
    }
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm('Remove this item from cart?')) return;
    setProcessing(prev => ({ ...prev, [item.id]: true }));
    try {
      const res = await deleteItem(item.id);
      if (res?.status === 'success') {
        setMsg(res.message || 'Item removed');
        await loadCart();
      } else {
        setMsg(res?.message || 'Failed to remove item');
      }
    } catch (e) {
      console.error('Delete item error', e);
      setMsg('Error removing item');
    } finally {
      setProcessing(prev => ({ ...prev, [item.id]: false }));
    }
  };

  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPrimaryImage = (product) => {
    const imgPath = product?.primary_image?.image || (product?.images && product.images.length > 0 && ((product.images.find((i) => i.is_primary) || product.images[0]).image));
    if (imgPath) return `${image_file_url}/${imgPath}`;
    return "/assets/images/placeholder.png";
  };

  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>
        Your Cart
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : !cart || (Array.isArray(cart.items) && cart.items.length === 0) ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6">Your cart is empty.</Typography>
          <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate('/')}>Continue Shopping</Button>
        </Paper>
      ) : (
        <Box>
          <List>
            {cart.items.map((it) => (
              <React.Fragment key={it.id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar variant="square" src={getPrimaryImage(it.product)} sx={{ width: 80, height: 80, mr: 2 }} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography sx={{ fontWeight: 700 }}>{it.product?.name}</Typography>}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">Shop: {it.shop?.name}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <IconButton size="small" onClick={() => handleUpdateQty(it, it.qty - 1)} disabled={processing[it.id] || it.qty <= 1}>
                            <RemoveCircleOutlineIcon />
                          </IconButton>
                          <Typography>Qty: {it.qty}</Typography>
                          <IconButton size="small" onClick={() => handleUpdateQty(it, it.qty + 1)} disabled={processing[it.id]}>
                            <AddCircleOutlineIcon />
                          </IconButton>

                          <Typography sx={{ ml: 2 }}>Unit: ৳{it.unit_price} &nbsp; | &nbsp; Line: ৳{it.line_total}</Typography>
                          <IconButton size="small" color="error" onClick={() => handleDeleteItem(it)} disabled={processing[it.id]} sx={{ ml: 1 }}>
                            <DeleteOutlineIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>

          <Paper sx={{ p: 2, mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1">Total items: {cart.total_items}</Typography>
            <Typography variant="h6">Subtotal: ৳{cart.subtotal}</Typography>
            <Box>
              <Button variant="outlined" sx={{ mr: 1 }} onClick={loadCart}>Refresh</Button>
              <Button variant="contained" onClick={() => navigate('/checkout')}>Checkout</Button>
            </Box>
          </Paper>
        </Box>
      )}
      <Snackbar open={!!msg} autoHideDuration={3000} onClose={() => setMsg('')} message={msg} />
    </Container>
  );
};

export default Cart;
