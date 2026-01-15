import React, { useEffect, useState } from "react";
import { Box, Button, Card, CardMedia, Container, Grid, IconButton, TextField, Typography, Stack, Rating, Divider } from "@mui/material";
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RefreshIcon from '@mui/icons-material/Refresh';

import { image_file_url } from "../../../api/config";
import { useParams, useNavigate } from "react-router-dom";
import { addCart, getCartByUser } from "../../../api/controller/admin_controller/order/cart_controller";
import { getProductDetails } from "../../../api/controller/admin_controller/product/product_controller";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getProductDetails(id);
        // getProductDetails returns response.data => { status, message, data }
        const p = res?.data ?? res;
        setProduct(p || null);
        const mainPath = p?.primary_image?.image || (p?.images && p.images.length > 0 && ((p.images.find(i => i.is_primary) || p.images[0]).image));
        setSelectedImage(mainPath || null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <Container sx={{ py: 8 }}>Loading…</Container>;
  if (!product) return <Container sx={{ py: 8 }}>Product not found</Container>;

  const mainImagePath = selectedImage || product.primary_image?.image || (product.images && product.images.length > 0 && ((product.images.find(i => i.is_primary) || product.images[0]).image));
  const mainImage = mainImagePath ? `${image_file_url}/${mainImagePath}` : '/assets/images/placeholder.png';

  return (
    <Container sx={{ py: 4 }}>
     
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ position: 'relative' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
              <CardMedia
                component="img"
                image={mainImage}
                alt={product.name}
                sx={{
                  maxHeight: 520,
                  objectFit: 'contain',
                  transform: `scale(${zoom})`,
                  transition: 'transform 200ms ease',
                  width: '100%',
                }}
              />
            </Box>

            <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
              <IconButton size="small" onClick={() => setZoom((z) => Math.max(0.25, Number((z - 0.25).toFixed(2))))} sx={{ bgcolor: 'rgba(255,255,255,0.85)' }}>
                <ZoomOutIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => setZoom((z) => Number((z + 0.25).toFixed(2)))} sx={{ bgcolor: 'rgba(255,255,255,0.85)' }}>
                <ZoomInIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => setZoom(1)} sx={{ bgcolor: 'rgba(255,255,255,0.85)' }}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* Thumbnails */}
            {product.images && product.images.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, p: 1, overflowX: 'auto' }}>
                {product.images.map((img) => {
                  const src = `${image_file_url}/${img.image}`;
                  const selected = img.image === (selectedImage || product.primary_image?.image);
                  return (
                    <Box key={img.id} onClick={() => { setSelectedImage(img.image); setZoom(1); }} sx={{ cursor: 'pointer', border: selected ? '2px solid' : '1px solid', borderColor: selected ? 'primary.main' : 'divider', borderRadius: 1 }}>
                      <img src={src} alt={img.alt_text || ''} style={{ width: 80, height: 80, objectFit: 'cover', display: 'block' }} />
                    </Box>
                  );
                })}
              </Box>
            )}
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Stack spacing={1}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>{product.name}</Typography>

            <Stack direction="row" alignItems="center" spacing={2}>
              <Rating value={4.2} precision={0.1} readOnly />
              <Typography variant="body2" color="text.secondary">Ratings 515</Typography>
            </Stack>

            <Typography variant="body2" color="text.secondary">Brand: {product.brand ? `${product.brand.name}` : 'No Brand'}</Typography>

            {/* Price block */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                ৳ {product.sale_price ?? product.price ?? '—'}
              </Typography>
              {product.sale_price && product.price && product.price > product.sale_price && (
                <Box>
                  <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>৳ {product.price}</Typography>
                  <Typography variant="body2" sx={{ color: 'success.main' }}>
                    {Math.round(((product.price - product.sale_price) / product.price) * 100)}% off
                  </Typography>
                </Box>
              )}
            </Box>

            <Typography variant="body1" sx={{ mb: 1 }}>{product.short_description}</Typography>

            {/* Variants / Color family */}
            {product.product_attributes?.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Attributes</Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
                  {product.product_attributes.map((pa) => (
                    <Button key={pa.id} variant="outlined" size="small">{pa.value?.value}</Button>
                  ))}
                </Box>
              </Box>
            )}

            {/* Quantity + Actions */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton size="small" onClick={() => setQty((q) => Math.max(1, q - 1))}>-</IconButton>
                <TextField size="small" value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value || 1)))} sx={{ width: 80 }} />
                <IconButton size="small" onClick={() => setQty((q) => q + 1)}>+</IconButton>
              </Box>

              <Button variant="contained" onClick={async () => {
                try {
                  const userId = localStorage.getItem('userId') || 1;
                  const payload = { user_id: userId, product_id: product.id, qty };
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
                  console.error(e);
                  alert('Failed to add to cart');
                }
              }}>Add to cart</Button>

              <Button variant="outlined" onClick={() => alert('Buy now (demo)')}>Buy now</Button>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Description</Typography>
            <Typography variant="body2" color="text.secondary">{product.description || 'No detailed description available.'}</Typography>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetail;
