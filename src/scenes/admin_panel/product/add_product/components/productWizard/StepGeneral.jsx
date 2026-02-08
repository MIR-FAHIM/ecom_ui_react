import React, { useMemo } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Grid, TextField, FormControlLabel, Switch, FormControl, InputLabel, Select, MenuItem, Box, Typography } from "@mui/material";

function StepGeneral({ value, onChange, errors = {}, categories = [], brands = [], shops = [], onOpenDropdown }) {
	const localUserId = useMemo(() => localStorage.getItem("userId") || "", []);
	const shopOptions = Array.isArray(shops) ? shops : [];
  const quillModules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["link", "image"],
        ["clean"],
      ],
    }),
    []
  );

  return (
    <Grid container spacing={2}>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          size="small"
          label="Product Name"
          value={value.name}
          error={!!errors.name}
          helperText={errors.name}
          onChange={(e) => onChange({ name: e.target.value })}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          size="small"
          label="Slug"
          value={value.slug}
          error={!!errors.slug}
          helperText={errors.slug}
          onChange={(e) => onChange({ slug: e.target.value })}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth size="small" error={!!errors.category_id}>
          <InputLabel>Category</InputLabel>
          <Select
            value={value.category_id}
            label="Category"
            onChange={(e) => onChange({ category_id: e.target.value })}
          >
            {categories.map((cat) => (
              <MenuItem key={cat.id || cat._id} value={cat.id ?? cat._id}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth size="small" error={!!errors.user_id}>
          <InputLabel>Shop</InputLabel>
          <Select
            value={value.user_id || ""}
            label="Shop"
            onOpen={onOpenDropdown}
            onChange={(e) => {
              const next = e.target.value;
              onChange({ user_id: next || localUserId });
            }}
          >
            <MenuItem value={localUserId}>My account</MenuItem>
            {shopOptions.map((shop) => (
              <MenuItem key={shop.id} value={shop.user_id ?? shop.id}>
                {shop.name || `Shop #${shop.id}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>



      <Grid item xs={12} md={3}>
        <TextField
          fullWidth
          size="small"
          label="Unit Price"
          type="number"
          value={value.unit_price}
          onChange={(e) => onChange({ unit_price: e.target.value })}
        />
      </Grid>

      <Grid item xs={12} md={3}>
        <TextField
          fullWidth
          size="small"
          label="Purchase Price"
          type="number"
          value={value.purchase_price}
          onChange={(e) => onChange({ purchase_price: e.target.value })}
        />
      </Grid>

      <Grid item xs={12} md={3}>
        <TextField
          fullWidth
          size="small"
          label="Current Stock"
          type="number"
          value={value.current_stock}
          onChange={(e) => onChange({ current_stock: e.target.value })}
        />
      </Grid>

      <Grid item xs={12} md={3}>
        <TextField
          fullWidth
          size="small"
          label="Unit"
          value={value.unit}
          onChange={(e) => onChange({ unit: e.target.value })}
        />
      </Grid>

      <Grid item xs={12} md={3}>
        <TextField
          fullWidth
          size="small"
          label="Weight"
          value={value.weight}
          onChange={(e) => onChange({ weight: e.target.value })}
        />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Description
        </Typography>
        <Box
          sx={{
            "& .ql-container": { minHeight: 140 },
            border: "1px solid",
            borderColor: errors.description ? "error.main" : "divider",
            borderRadius: 1,
            overflow: "hidden",
          }}
        >
          <ReactQuill
            theme="snow"
            modules={quillModules}
            value={value.description || ""}
            onChange={(html) => onChange({ description: html })}
          />
        </Box>
        {errors.description && (
          <Typography variant="caption" color="error">
            {errors.description}
          </Typography>
        )}
      </Grid>

      <Grid item xs={12}>
        <FormControlLabel
          control={<Switch checked={!!value.variant_product} onChange={(e) => onChange({ variant_product: e.target.checked ? 1 : 0 })} />}
          label="Variant Product"
        />
        <FormControlLabel
          control={<Switch checked={!!value.todays_deal} onChange={(e) => onChange({ todays_deal: e.target.checked ? 1 : 0 })} />}
          label="Today's Deal"
        />
        <FormControlLabel
          control={<Switch checked={!!value.published} onChange={(e) => onChange({ published: e.target.checked ? 1 : 0 })} />}
          label="Published"
        />
        <FormControlLabel
          control={<Switch checked={!!value.approved} onChange={(e) => onChange({ approved: e.target.checked ? 1 : 0 })} />}
          label="Approved"
        />
        <FormControlLabel
          control={<Switch checked={!!value.featured} onChange={(e) => onChange({ featured: e.target.checked ? 1 : 0 })} />}
          label="Featured"
        />
        <FormControlLabel
          control={<Switch checked={!!value.refundable} onChange={(e) => onChange({ refundable: e.target.checked ? 1 : 0 })} />}
          label="Refundable"
        />
        <FormControlLabel
          control={<Switch checked={!!value.cash_on_delivery} onChange={(e) => onChange({ cash_on_delivery: e.target.checked ? 1 : 0 })} />}
          label="Cash On Delivery"
        />
        <FormControlLabel
          control={<Switch checked={!!value.stock_visibility_state} onChange={(e) => onChange({ stock_visibility_state: e.target.checked ? 1 : 0 })} />}
          label="Stock Visibility"
        />
      </Grid>

    </Grid>
  );
}

export default StepGeneral;
