import React, { useState } from "react";
import { Box, Grid, TextField, Button, Typography, Divider, Chip } from "@mui/material";

function StepAttributes({ value = [], onAdd, onRemove }) {
  const [keyName, setKeyName] = useState("");
  const [keyValue, setKeyValue] = useState("");

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Add attribute pairs like Color: Red, Size: XL, Material: Cotton.
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            label="Attribute Name"
            placeholder="Color"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            label="Attribute Value"
            placeholder="Red"
            value={keyValue}
            onChange={(e) => setKeyValue(e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Button
            fullWidth
            variant="contained"
            sx={{ height: 40 }}
            onClick={() => {
              const k = keyName.trim();
              const v = keyValue.trim();
              if (!k || !v) return;
              onAdd({ name: k, value: v });
              setKeyName("");
              setKeyValue("");
            }}
          >
            Add Attribute
          </Button>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2, opacity: 0.2 }} />

      {value.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No attributes added yet.
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {value.map((a, idx) => (
            <Chip
              key={`${a.name}-${a.value}-${idx}`}
              label={`${a.name}: ${a.value}`}
              onDelete={() => onRemove(idx)}
              variant="outlined"
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

export default StepAttributes;
