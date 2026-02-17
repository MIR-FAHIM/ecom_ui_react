import React from "react";
import { Box, Card, CardActionArea, CardContent, Typography, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { image_file_url } from "../../../../api/config";

function CategoryCard({ cat }) {
  const navigate = useNavigate();
  const theme = useTheme();

  const img =
    cat?.banner?.url || (cat?.banner?.file_name ? `${image_file_url}/${cat.banner.file_name}` : null) ||
    (cat?.cover_image ? `${image_file_url}/${cat.cover_image}` : null) ||
    "/assets/images/placeholder.png";

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: "0 10px 20px rgba(0,0,0,0.06)",
        border: `1px solid ${theme.palette.divider}`,
        height: "100%",
      }}
    >
      <CardActionArea
        onClick={() => navigate(`/category/${cat.id}`)}
        sx={{ height: "100%", p: 1.25, display: "flex", flexDirection: "column", gap: 1 }}
      >
        <Box
          sx={{
            width: "100%",
            aspectRatio: "1 / 1",
            borderRadius: 2,
            overflow: "hidden",
            backgroundImage: `url("${img}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            bgcolor: "rgba(0,0,0,0.04)",
          }}
        />
        <CardContent sx={{ p: 0, width: "100%" }}>
          <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
            {cat.name}
          </Typography>
          {cat.children?.length ? (
            <Typography variant="caption" color="text.secondary">
              {cat.children.length} sub
            </Typography>
          ) : null}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default function CategoryGrid({ categories = [] }) {
  return (
    <Box
      sx={{
        borderRadius: 3,
        p: { xs: 1.25, sm: 2 },
        bgcolor: "background.paper",
        boxShadow: { xs: "0 10px 24px rgba(0,0,0,0.06)", md: "0 16px 32px rgba(0,0,0,0.06)" },
        width: "100%",
        minWidth: 0,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 0.5, sm: 1 },
          mb: { xs: 1, sm: 1.5 },
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs: 18, sm: 20 } }}>
          Hot Categories
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Scroll
        </Typography>
      </Box>
      <Box
        sx={{
          flex: 1,
          display: "grid",
          gridAutoFlow: "column",
          gridTemplateRows: { xs: "repeat(1, minmax(0, 1fr))", sm: "repeat(2, minmax(0, 1fr))" },
          gridAutoColumns: { xs: 120, sm: 150, md: 160, lg: 180 },
          gap: { xs: 1, sm: 1.5 },
          overflowX: "auto",
          pb: 1,
          pr: 1,
          scrollSnapType: "x mandatory",
          "& > *": { scrollSnapAlign: "start" },
        }}
      >
        {categories.map((c) => (
          <Box key={c.id} sx={{ minWidth: 0 }}>
            <CategoryCard cat={c} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
