import React from "react";
import { Box, Button } from "@mui/material";

export default function CategoryItem({ item, selectedId, onSelect, depth = 0 }) {
  const isActive = String(selectedId) === String(item?.id);

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Button
        variant={isActive ? "contained" : "outlined"}
        onClick={() => onSelect && onSelect(item?.id)}
        sx={{
          textTransform: "none",
          justifyContent: "flex-start",
          pl: 1 + depth * 1.5,
          pr: 2,
          py: 0.6,
        }}
      >
        {item?.name}
      </Button>

      {Array.isArray(item?.children) && item.children.length > 0 && (
        <Box sx={{ mt: 0.5 }}>
          {item.children.map((ch) => (
            <CategoryItem
              key={ch.id}
              item={ch}
              selectedId={selectedId}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
