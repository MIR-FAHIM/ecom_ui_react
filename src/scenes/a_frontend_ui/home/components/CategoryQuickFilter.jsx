import React from "react";
import { Box, Button, useTheme } from "@mui/material";
import CategoryItem from "./CategoryItem";

export default function CategoryQuickFilter({ categories = [], category, setCategory }) {
  const theme = useTheme();

  const outlinedSx = {
    borderColor: theme.palette.divider,
    background: theme.palette.semantic?.surface2 || (theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"),
    color: theme.palette.semantic?.ink || theme.palette.text.primary,
  };

  return (
    <Box sx={{ display: "flex", gap: 1, mb: 4, overflowX: "auto", alignItems: "center" }}>
      <Button
        variant={!category ? "contained" : "outlined"}
        onClick={() => setCategory("")}
        sx={!category ? undefined : outlinedSx}
      >
        All
      </Button>

      {categories.map((c) => (
        <CategoryItem key={c.id} item={c} selectedId={category} onSelect={setCategory} />
      ))}
    </Box>
  );
}
