import React from "react";
import { Box, Button, useTheme } from "@mui/material";

export default function CategoryQuickFilter({ categories = [], category, setCategory }) {
  const theme = useTheme();

  const outlinedSx = {
    borderColor: theme.palette.divider,
    background: theme.palette.semantic?.surface2 || (theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"),
    color: theme.palette.semantic?.ink || theme.palette.text.primary,
  };

  return (
    <Box sx={{ display: "flex", gap: 1, mb: 4, overflowX: "auto" }}>
      {(() => {
        const v = !category ? "contained" : "outlined";
        return (
          <Button
            variant={v}
            onClick={() => setCategory("")}
            sx={v === "outlined" ? outlinedSx : undefined}
          >
            All
          </Button>
        );
      })()}
      {categories.map((c) => (
        (() => {
          const isActive = String(category) === String(c.id);
          const v = isActive ? "contained" : "outlined";
          return (
            <Button key={c.id} variant={v} onClick={() => setCategory(c.id)} sx={v === "outlined" ? outlinedSx : undefined}>
              {c.name}
            </Button>
          );
        })()
      ))}
    </Box>
  );
}
