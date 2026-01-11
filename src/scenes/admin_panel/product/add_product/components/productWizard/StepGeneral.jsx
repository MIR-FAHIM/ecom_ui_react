import React from "react";
import { Grid, TextField, FormControlLabel, Switch, FormControl, InputLabel, Select, MenuItem } from "@mui/material";

function StepGeneral({ value, onChange, errors = {}, categories = [], brands = [], shops = [] }) {
  return (
    <Grid container spacing={2}>
      {/* Shop Selection */}
      <Grid item xs={12} md={6}>
        <FormControl fullWidth size="small" error={Boolean(errors.shop_id)}>
          <InputLabel>Shop</InputLabel>
          <Select
            value={value.shop_id || ""}
            onChange={(e) => onChange({ shop_id: e.target.value })}
            label="Shop"
          >
            <MenuItem value="">-- Select Shop --</MenuItem>
            {shops.map((shop) => (
              <MenuItem key={shop.id} value={shop.id}>
                {shop.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Category Selection */}
      <Grid item xs={12} md={6}>
        <FormControl fullWidth size="small" error={Boolean(errors.category_id)}>
          <InputLabel>Category</InputLabel>
          <Select
            value={value.category_id || ""}
            onChange={(e) => onChange({ category_id: e.target.value })}
            label="Category"
          >
            <MenuItem value="">-- Select Category --</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Brand Selection */}
      <Grid item xs={12} md={6}>
        <FormControl fullWidth size="small" error={Boolean(errors.brand_id)}>
          <InputLabel>Brand</InputLabel>
          <Select
            value={value.brand_id || ""}
            onChange={(e) => onChange({ brand_id: e.target.value })}
            label="Brand"
          >
            <MenuItem value="">-- Select Brand --</MenuItem>
            {brands.map((brand) => (
              <MenuItem key={brand.id} value={brand.id}>
                {brand.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Product Name */}
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          size="small"
          label="Product Name"
          value={value.name || ""}
          onChange={(e) => onChange({ name: e.target.value })}
          error={Boolean(errors.name)}
          helperText={errors.name || ""}
        />
      </Grid>

      {/* Slug */}
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          size="small"
          label="Slug (URL friendly)"
          placeholder="product-name-slug"
          value={value.slug || ""}
          onChange={(e) => onChange({ slug: e.target.value })}
          error={Boolean(errors.slug)}
          helperText={errors.slug || ""}
        />
      </Grid>

      {/* SKU */}
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          size="small"
          label="SKU (Stock Keeping Unit)"
          value={value.sku || ""}
          onChange={(e) => onChange({ sku: e.target.value })}
          error={Boolean(errors.sku)}
          helperText={errors.sku || ""}
        />
      </Grid>

      {/* Short Description */}
      <Grid item xs={12}>
        <TextField
          fullWidth
          size="small"
          label="Short Description"
          multiline
          minRows={2}
          maxRows={4}
          placeholder="Brief overview of the product"
          value={value.short_description || ""}
          onChange={(e) => onChange({ short_description: e.target.value })}
          error={Boolean(errors.short_description)}
          helperText={errors.short_description || ""}
        />
      </Grid>

      {/* Full Description */}
      <Grid item xs={12}>
        <TextField
          fullWidth
          size="small"
          label="Full Description"
          multiline
          minRows={4}
          maxRows={8}
          placeholder="Detailed product description"
          value={value.description || ""}
          onChange={(e) => onChange({ description: e.target.value })}
          error={Boolean(errors.description)}
          helperText={errors.description || ""}
        />
      </Grid>

      {/* Active Status */}
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={Boolean(value.is_active)}
              onChange={(e) => onChange({ is_active: e.target.checked })}
            />
          }
          label="Active (visible in store)"
        />
      </Grid>
    </Grid>
  );
}

export default StepGeneral;
