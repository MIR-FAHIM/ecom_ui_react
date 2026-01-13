import React, { useEffect, useState } from "react";
import { Box, Button, Card, CardMedia, Container, Grid, IconButton, TextField, Typography } from "@mui/material";

import { image_file_url } from "../../../api/config";
import { useParams, useNavigate } from "react-router-dom";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
      
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

  const mainImagePath = product.primary_image?.image || (product.images && product.images.length > 0 && ((product.images.find(i => i.is_primary) || product.images[0]).image));
  const mainImage = mainImagePath ? `${image_file_url}/${mainImagePath}` : '/assets/images/placeholder.png';

  return (
    <Container sx={{ py: 4 }}>
      <Button onClick={() => navigate(-1)} sx={{ mb: 2 }}>Back</Button>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardMedia component="img" image={mainImage} alt={product.name} sx={{ maxHeight: 520, objectFit: 'cover' }} />
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>{product.name}</Typography>
          <Typography variant="h6" color="text.secondary" sx={{ my: 1 }}>${product.sale_price || product.price || '—'}</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>{product.short_description}</Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
            <TextField type="number" size="small" label="Quantity" value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value)))} sx={{ width: 120 }} />
            <Button variant="contained" onClick={() => alert(`Added ${qty} x ${product.name} to cart (demo)`)}>Add to cart</Button>
            <Button variant="outlined" onClick={() => alert('Buy now (demo)')}>Buy now</Button>
          </Box>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2 }}>Description</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{product.description || 'No detailed description available.'}</Typography>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetail;
