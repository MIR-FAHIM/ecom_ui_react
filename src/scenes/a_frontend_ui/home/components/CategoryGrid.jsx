import React from "react";
import { Grid, Card, CardActionArea, CardMedia, CardContent, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { image_file_url } from "../../../../api/config";

function CategoryCard({ cat }) {
  const navigate = useNavigate();

  const img =
    cat?.banner?.url || (cat?.banner?.file_name ? `${image_file_url}/${cat.banner.file_name}` : null) ||
    (cat?.cover_image ? `${image_file_url}/${cat.cover_image}` : null) ||
    "/assets/images/placeholder.png";

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
      <CardActionArea onClick={() => navigate(`/category/${cat.id}`)}>
        <CardMedia component="img" image={img} alt={cat.name} sx={{ height: 120, objectFit: "cover" }} />
        <CardContent sx={{ py: 1.2, px: 1.5 }}>
          <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
            {cat.name}
          </Typography>
          {typeof cat.featured !== 'undefined' && (
            <Box sx={{ mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary">{cat.children?.length ? `${cat.children.length} sub` : ''}</Typography>
            </Box>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default function CategoryGrid({ categories = [] }) {
  // categories: expected array of top-level categories (may include banner and children)
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {categories.map((c) => (
        <Grid key={c.id} item xs={6} sm={4} md={2}>
          <CategoryCard cat={c} />
        </Grid>
      ))}
    </Grid>
  );
}
