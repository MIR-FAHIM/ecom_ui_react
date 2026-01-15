import React from "react";
import { Grid, TextField, FormControlLabel, Switch, FormControl, InputLabel, Select, MenuItem, Divider, Typography } from "@mui/material";

function StepGeneral({ value, onChange, errors = {}, categories = [], brands = [], shops = [], onOpenDropdown }) {
  return (
    <Grid container spacing={2}>
      {/* Shop Selection */}
      <Grid item xs={12} md={6}>
        <FormControl fullWidth size="small" error={Boolean(errors.shop_id)}>
          <InputLabel>Shop</InputLabel>
          <Select
            value={value.shop_id || ""}
            onOpen={() => onOpenDropdown && onOpenDropdown()}
            onMouseDown={() => onOpenDropdown && onOpenDropdown()}
            onChange={(e) => onChange({ shop_id: e.target.value })}
            label="Shop"
          >
            <MenuItem value="">-- Select Shop --</MenuItem>
            {shops.map((shop) => (
              <MenuItem key={shop.id} value={shop.id}>
                {shop.business_name || shop.name || "Shop"}
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
            onOpen={() => onOpenDropdown && onOpenDropdown()}
            onMouseDown={() => onOpenDropdown && onOpenDropdown()}
            onChange={(e) => onChange({ category_id: e.target.value })}
            label="Category"
          >
            <MenuItem value="">-- Select Category --</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name || cat.title || 'Category'}
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
            onOpen={() => onOpenDropdown && onOpenDropdown()}
            onMouseDown={() => onOpenDropdown && onOpenDropdown()}
            onChange={(e) => onChange({ brand_id: e.target.value })}
            label="Brand"
          >
            <MenuItem value="">-- Select Brand --</MenuItem>
            {brands.map((brand) => (
              <MenuItem key={brand.id} value={brand.id}>
                {brand.name || brand.title || 'Brand'}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Separate Pricing / Discount Section */}
      <Grid item xs={12}>
        <Divider sx={{ my: 1 }} />
        <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>
          Pricing
        </Typography>
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          size="small"
          label="Price"
          type="number"
          value={value.price || ''}
          onChange={(e) => onChange({ price: e.target.value })}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          size="small"
          label="Stock"
          type="number"
          value={value.stock || ''}
          onChange={(e) => onChange({ stock: e.target.value })}
        />
      </Grid>

      <Grid item xs={12}>
        <Divider sx={{ my: 1 }} />
        <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>
          Discount
        </Typography>
      </Grid>

      <Grid item xs={12} md={4}>
        <FormControl fullWidth size="small">
          <InputLabel>Discount Type</InputLabel>
          <Select
            value={value.discount_type || 'flat'}
            label="Discount Type"
            onChange={(e) => onChange({ discount_type: e.target.value })}
          >
            <MenuItem value="flat">Flat (৳)</MenuItem>
            <MenuItem value="percentage">Percentage (%)</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          size="small"
          label="Discount Value"
          type="number"
          value={value.discount_value || ''}
          onChange={(e) => onChange({ discount_value: e.target.value })}
          helperText="Enter flat amount or percent depending on type"
        />
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
