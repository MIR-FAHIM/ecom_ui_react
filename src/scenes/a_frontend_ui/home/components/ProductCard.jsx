import React from "react";
import { Card, Box, CardMedia, CardContent, Typography, CardActions, Button, Rating, Stack, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function ProductCard({ product, getPrimaryImage, getDisplayPrice, handleAddToCart }) {
  const navigate = useNavigate();

  const price = getDisplayPrice(product);
  const original = product.price;
  const sale = product.sale_price ?? null;
  const discount = sale && original ? Math.round(((original - sale) / original) * 100) : product.discount;
  const discountObj = product.product_discount ?? null;

  let discountedPrice = null;
  let discountLabel = null;
  if (discountObj) {
    const base = (original ?? sale ?? price) || 0;
    const val = parseFloat(discountObj.value) || 0;
    if (discountObj.type === "flat") {
      discountedPrice = Math.max(0, base - val);
      discountLabel = `-৳${val}`;
    } else {
      discountedPrice = Math.max(0, base - (base * val) / 100);
      discountLabel = `-${val}%`;
    }
  }
  const rating = product.rating ?? 4.2;
  const reviews = product.reviews_count ?? product.review_count ?? 0;

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 2,
        transition: "0.3s",
        display: 'flex',
        flexDirection: 'column',
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: 6,
        },
      }}
    >
      <Box sx={{ position: "relative" }} onClick={() => navigate(`/product/${product.id}`)}>
        <CardMedia
          component="img"
          height="200"
          image={getPrimaryImage(product)}
          alt={product.name}
          sx={{ cursor: "pointer", objectFit: 'contain', p: 1, bgcolor: 'background.paper' }}
        />

        {discountObj ? (
          <Chip label={discountLabel} color="error" size="small" sx={{ position: 'absolute', top: 10, left: 10 }} />
        ) : discount ? (
          <Chip label={`-${discount}%`} color="error" size="small" sx={{ position: 'absolute', top: 10, left: 10 }} />
        ) : null}
      </Box>

      <CardContent sx={{ flex: 1 }}>
        <Typography fontWeight={600} noWrap title={product.name}>
          {product.name}
        </Typography>

        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
          <Rating value={Number(rating)} precision={0.1} size="small" readOnly />
          <Typography variant="caption" color="text.secondary">{reviews ? `${reviews} reviews` : 'No reviews'}</Typography>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }} noWrap>
          {product.vendor_name || "Verified Seller"}
        </Typography>

        <Box sx={{ mt: 1, display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography variant="h6" color="primary">৳ {discountedPrice !== null ? discountedPrice : price}</Typography>
          {discountedPrice !== null ? (
            <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
              ৳ {original ?? sale ?? price}
            </Typography>
          ) : (sale && original && (
            <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>৳ {original}</Typography>
          ))}
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button fullWidth variant="contained" onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}>
          Add to Cart
        </Button>
      </CardActions>
    </Card>
  );
}
