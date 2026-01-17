import React from "react";
import { Box, Button } from "@mui/material";

export default function CategoryQuickFilter({ categories = [], category, setCategory }) {
  return (
    <Box sx={{ display: "flex", gap: 1, mb: 4, overflowX: "auto" }}>
      <Button variant={!category ? "contained" : "outlined"} onClick={() => setCategory("")}>All</Button>
      {categories.map((c) => (
        <Button
          key={c.id}
          variant={String(category) === String(c.id) ? "contained" : "outlined"}
          onClick={() => setCategory(c.id)}
        >
          {c.name}
        </Button>
      ))}
    </Box>
  );
}
