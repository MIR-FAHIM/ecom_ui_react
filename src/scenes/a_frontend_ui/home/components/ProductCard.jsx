import React from "react";
import { Card, Box, CardMedia, CardContent, Typography, CardActions, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function ProductCard({ product, getPrimaryImage, getDisplayPrice, handleAddToCart }) {
  const navigate = useNavigate();

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 2,
        transition: "0.3s",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: 6,
        },
      }}
    >
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          height="200"
          image={getPrimaryImage(product)}
          alt={product.name}
          sx={{ cursor: "pointer" }}
          onClick={() => navigate(`/ecom/product/${product.id}`)}        />

        {product.discount && (
          <Box
            sx={{
              position: "absolute",              top: 10,
              left: 10,
              bgcolor: "error.main",
              color: "#fff",
              px: 1,
              borderRadius: 1,
              fontSize: 12,
            }}
          >
            -{product.discount}%
          </Box>
        )}
      </Box>

      <CardContent>
        <Typography fontWeight={600} noWrap>
          {product.name}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {product.vendor_name || "Verified Seller"}
        </Typography>

        <Typography variant="h6" color="primary" mt={1}>
          ৳ {getDisplayPrice(product)}
        </Typography>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button fullWidth variant="contained" onClick={() => handleAddToCart(product)}>
          Add to Cart
        </Button>
      </CardActions>
    </Card>
  );
}
