import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Grid, RadioGroup, FormControlLabel, Radio, List, ListItem, ListItemText, Button, TextField, CircularProgress, Snackbar, Divider, IconButton } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useNavigate } from 'react-router-dom';
import { getUserAddresses, addUserAddress } from '../../../api/controller/admin_controller/order/user_address_controller';
import { checkOutOrder } from '../../../api/controller/admin_controller/order/order_controller';
import { getCartByUser, updateQuantity, deleteItem } from '../../../api/controller/admin_controller/order/cart_controller';

const ProceedOrder = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId') || 1;

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState('');

  const [newName, setNewName] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newDistrict, setNewDistrict] = useState('');
  const [newArea, setNewArea] = useState('');
  const [newAddress, setNewAddress] = useState('');

  const [cart, setCart] = useState(null);
  const [note, setNote] = useState('');

  const loadAddresses = async () => {
    try {
      const res = await getUserAddresses(userId);
      if (res?.status === 'success') {
        setAddresses(res.data || []);
        if (res.data && res.data.length > 0) {
          setSelectedAddress(res.data[0].id);
        }
      } else {
        setAddresses([]);
      }
    } catch (e) {
      console.error('Error loading addresses', e);
      setAddresses([]);
    }
  };

  const [processing, setProcessing] = useState({});

  const loadCart = async () => {
    try {
      const res = await getCartByUser(userId);
      if (res?.status === 'success') {
        setCart(res.data);
        // sync topbar badge
        const total = res.data?.total_items ?? (Array.isArray(res.data?.items) ? res.data.items.length : 0);
        localStorage.setItem('cart', JSON.stringify(total));
        window.dispatchEvent(new Event('cart-updated'));
      } else setCart(null);
    } catch (e) {
      console.error('Error loading cart', e);
      setCart(null);
    }
  };

  useEffect(() => {
    loadAddresses();
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddAddress = async () => {
    if (!newName || !newMobile || !newAddress) {
      setMsg('Please fill name, mobile and address');
      return;
    }
    setAdding(true);
    try {
      const form = new FormData();
      form.append('user_id', userId);
      form.append('name', newName);
      form.append('mobile', newMobile);
      form.append('district', newDistrict);
      form.append('area', newArea);
      form.append('address', newAddress);
      const res = await addUserAddress(form);
      if (res?.data?.status === 'success' || res?.status === 200) {
        setMsg('Address added');
        setNewName(''); setNewMobile(''); setNewDistrict(''); setNewArea(''); setNewAddress('');
        await loadAddresses();
      } else {
        setMsg(res?.data?.message || 'Failed to add address');
      }
    } catch (e) {
      console.error('Add address error', e);
      setMsg('Error adding address');
    } finally {
      setAdding(false);
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

  const handleCheckout = async () => {
    if (!cart) { setMsg('Cart is empty'); return; }
    // prefer selected address
    let addrObj = null;
    if (selectedAddress) addrObj = addresses.find(a => String(a.id) === String(selectedAddress));

    if (!addrObj) {
      setMsg('Select or add a shipping address');
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append('user_id', userId);
      form.append('customer_name', addrObj.name || '');
      form.append('customer_phone', addrObj.mobile || '');
      form.append('shipping_address', `${addrObj.address}, ${addrObj.area || ''}, ${addrObj.district || ''}`);
      form.append('zone', addrObj.district || '');
      form.append('note', note || '');

      const res = await checkOutOrder(form);
      // checkOutOrder returns axios response
      if (res?.data?.status === 'success' || res?.status === 200) {
        setMsg(res?.data?.message || 'Order placed');
        // clear local cart count and notify
        localStorage.setItem('cart', JSON.stringify(0));
        window.dispatchEvent(new Event('cart-updated'));
        setTimeout(() => navigate('/ecom'), 900);
      } else {
        setMsg(res?.data?.message || 'Failed to place order');
      }
    } catch (e) {
      console.error('Checkout error', e);
      setMsg('Error placing order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>Checkout</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Select Shipping Address</Typography>
            <RadioGroup value={selectedAddress} onChange={(e) => setSelectedAddress(e.target.value)}>
              <List>
                {addresses.length === 0 && (
                  <ListItem>
                    <ListItemText primary="No saved addresses" secondary="Add a new address below" />
                  </ListItem>
                )}
                {addresses.map((a) => (
                  <ListItem key={a.id} divider>
                    <FormControlLabel value={String(a.id)} control={<Radio />} label={(
                      <Box>
                        <Typography sx={{ fontWeight: 700 }}>{a.name} &nbsp; <small>{a.mobile}</small></Typography>
                        <Typography variant="body2" color="text.secondary">{a.address} {a.area ? ', ' + a.area : ''} {a.district ? ', ' + a.district : ''}</Typography>
                      </Box>
                    )} />
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Add New Address</Typography>
              <Box sx={{ display: 'grid', gap: 1 }}>
                <TextField label="Name" value={newName} onChange={(e) => setNewName(e.target.value)} size="small" />
                <TextField label="Mobile" value={newMobile} onChange={(e) => setNewMobile(e.target.value)} size="small" />
                <TextField label="District" value={newDistrict} onChange={(e) => setNewDistrict(e.target.value)} size="small" />
                <TextField label="Area" value={newArea} onChange={(e) => setNewArea(e.target.value)} size="small" />
                <TextField label="Address" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} size="small" multiline minRows={2} />
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button variant="outlined" onClick={() => { setNewName(''); setNewMobile(''); setNewDistrict(''); setNewArea(''); setNewAddress(''); }}>Clear</Button>
                  <Button variant="contained" onClick={handleAddAddress} disabled={adding}>{adding ? <CircularProgress size={18} /> : 'Add Address'}</Button>
                </Box>
              </Box>

            </RadioGroup>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Order Summary</Typography>
            {!cart ? (
              <Typography sx={{ mt: 2 }}>Loading cart…</Typography>
            ) : (cart.items && cart.items.length === 0) ? (
              <Typography sx={{ mt: 2 }}>Your cart is empty.</Typography>
            ) : (
              <Box>
                {cart.items.map(it => (
                  <Box key={it.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton size="small" onClick={() => handleUpdateQty(it, it.qty - 1)} disabled={processing[it.id] || it.qty <= 1}>
                        <RemoveCircleOutlineIcon />
                      </IconButton>
                      <Typography>{it.product?.name} x {it.qty}</Typography>
                      <IconButton size="small" onClick={() => handleUpdateQty(it, it.qty + 1)} disabled={processing[it.id]}>
                        <AddCircleOutlineIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteItem(it)} disabled={processing[it.id]} sx={{ ml: 1 }}>
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Box>

                    <Typography>৳{it.line_total}</Typography>
                  </Box>
                ))}
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2">Subtotal</Typography>
                  <Typography variant="subtitle2">৳{cart.subtotal}</Typography>
                </Box>

                <TextField label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} size="small" fullWidth sx={{ mt: 2 }} />

                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
                  <Button variant="contained" onClick={handleCheckout} disabled={loading}>{loading ? <CircularProgress size={18} /> : 'Place Order'}</Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Snackbar open={!!msg} autoHideDuration={3000} onClose={() => setMsg('')} message={msg} />
    </Box>
  );
};

export default ProceedOrder;
