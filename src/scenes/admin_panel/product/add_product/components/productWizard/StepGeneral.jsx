import React, { useMemo } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  Grid,
  TextField,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  FormHelperText,
  Stack,
  Card,
  CardContent,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ToggleOnOutlinedIcon from "@mui/icons-material/ToggleOnOutlined";

/* ── Section header helper ── */
const SectionHeader = ({ icon, title, color = "#6366f1", bg = "#eef2ff" }) => (
  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
    <Box sx={{ width: 30, height: 30, borderRadius: 1.5, bgcolor: bg, display: "grid", placeItems: "center", color }}>
      {icon}
    </Box>
    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{title}</Typography>
  </Stack>
);

const fieldSx = {
  "& .MuiOutlinedInput-root": { borderRadius: 2, "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#6366f1" } },
  "& .MuiInputLabel-root.Mui-focused": { color: "#6366f1" },
};

const selectSx = {
  borderRadius: 2,
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#6366f1" },
};

function StepGeneral({
  value,
  onChange,
  errors = {},
  categories = [],
  brands = [],
  shops = [],
  onOpenDropdown,
  parentCategoryId = "",
  subCategories = [],
  loadingSubCategories = false,
  onParentCategoryChange,
  onSubCategoryChange,
}) {
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

  const toggles = [
    { key: "variant_product", label: "Variant Product" },
    { key: "todays_deal", label: "Today's Deal" },
    { key: "published", label: "Published" },
    { key: "approved", label: "Approved" },
    { key: "featured", label: "Featured" },
    { key: "refundable", label: "Refundable" },
    { key: "cash_on_delivery", label: "Cash On Delivery" },
    { key: "stock_visibility_state", label: "Stock Visibility" },
  ];

  return (
    <Stack spacing={3}>
      {/* ── Basic Info ── */}
      <Card variant="outlined" sx={{ borderRadius: 2.5, borderColor: "divider" }}>
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          <SectionHeader icon={<InfoOutlinedIcon sx={{ fontSize: 18 }} />} title="Basic Information" />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Product Name" value={value.name} error={!!errors.name} helperText={errors.name} onChange={(e) => onChange({ name: e.target.value })} sx={fieldSx} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Slug" value={value.slug} error={!!errors.slug} helperText={errors.slug} onChange={(e) => onChange({ slug: e.target.value })} placeholder="auto-generated-slug" sx={fieldSx} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ── Category & Brand ── */}
      <Card variant="outlined" sx={{ borderRadius: 2.5, borderColor: "divider" }}>
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          <SectionHeader icon={<CategoryOutlinedIcon sx={{ fontSize: 18 }} />} title="Category & Brand" color="#16a34a" bg="#f0fdf4" />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" error={!!errors.category_id}>
                <InputLabel>Category</InputLabel>
                <Select value={parentCategoryId} label="Category" onChange={(e) => onParentCategoryChange?.(e.target.value)} sx={selectSx}>
                  <MenuItem value=""><em>Select category</em></MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id || cat._id} value={cat.id ?? cat._id}>{cat.name}</MenuItem>
                  ))}
                </Select>
                {errors.category_id ? <FormHelperText>{errors.category_id}</FormHelperText> : null}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" error={!!errors.category_id}>
                <InputLabel>Sub Category</InputLabel>
                <Select value={subCategories.length > 0 ? (value.category_id || "") : ""} label="Sub Category" onChange={(e) => onSubCategoryChange?.(e.target.value)} disabled={!parentCategoryId || loadingSubCategories || subCategories.length === 0} sx={selectSx}>
                  <MenuItem value="">{loadingSubCategories ? "Loading..." : "Select sub category"}</MenuItem>
                  {subCategories.map((cat) => (
                    <MenuItem key={cat.id || cat._id} value={cat.id ?? cat._id}>{cat.name}</MenuItem>
                  ))}
                </Select>
                {parentCategoryId && !loadingSubCategories && subCategories.length === 0 ? (
                  <FormHelperText>No sub categories found. Parent category will be used.</FormHelperText>
                ) : null}
                {subCategories.length > 0 && errors.category_id ? (
                  <FormHelperText>{errors.category_id}</FormHelperText>
                ) : null}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Brand</InputLabel>
                <Select value={value.brand_id || ""} label="Brand" onChange={(e) => onChange({ brand_id: e.target.value })} sx={selectSx}>
                  <MenuItem value=""><em>None</em></MenuItem>
                  {brands.map((brand) => (
                    <MenuItem key={brand.id || brand._id} value={brand.id ?? brand._id}>{brand.name || brand.title || "Brand"}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" error={!!errors.user_id}>
                <InputLabel>Shop</InputLabel>
                <Select value={value.user_id || ""} label="Shop" onOpen={onOpenDropdown} onChange={(e) => { const next = e.target.value; onChange({ user_id: next || localUserId }); }} sx={selectSx}>
                  <MenuItem value={localUserId}>My account</MenuItem>
                  {shopOptions.map((shop) => (
                    <MenuItem key={shop.id} value={shop.user_id ?? shop.id}>{shop.name || `Shop #${shop.id}`}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ── Pricing & Inventory ── */}
      <Card variant="outlined" sx={{ borderRadius: 2.5, borderColor: "divider" }}>
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          <SectionHeader icon={<AttachMoneyIcon sx={{ fontSize: 18 }} />} title="Pricing & Inventory" color="#ea580c" bg="#fff7ed" />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth size="small" label="Unit Price" type="number" value={value.unit_price} onChange={(e) => onChange({ unit_price: e.target.value })} sx={fieldSx} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth size="small" label="Discount" type="number" value={value.discount} onChange={(e) => onChange({ discount: e.target.value })} sx={fieldSx} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth size="small" label="Purchase Price" type="number" value={value.purchase_price} onChange={(e) => onChange({ purchase_price: e.target.value })} sx={fieldSx} />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField fullWidth size="small" label="Current Stock" type="number" value={value.current_stock} onChange={(e) => onChange({ current_stock: e.target.value })} sx={fieldSx} />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField fullWidth size="small" label="Unit" value={value.unit} onChange={(e) => onChange({ unit: e.target.value })} placeholder="e.g. pcs" sx={fieldSx} />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField fullWidth size="small" label="Weight" value={value.weight} onChange={(e) => onChange({ weight: e.target.value })} placeholder="e.g. 0.5 kg" sx={fieldSx} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ── Description ── */}
      <Card variant="outlined" sx={{ borderRadius: 2.5, borderColor: "divider" }}>
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          <SectionHeader icon={<DescriptionOutlinedIcon sx={{ fontSize: 18 }} />} title="Description" color="#7c3aed" bg="#f5f3ff" />
          <Box
            sx={{
              "& .ql-container": { minHeight: 160, fontFamily: "inherit", fontSize: 14 },
              "& .ql-toolbar": { borderTopLeftRadius: 10, borderTopRightRadius: 10, borderColor: "divider" },
              "& .ql-container.ql-snow": { borderBottomLeftRadius: 10, borderBottomRightRadius: 10, borderColor: "divider" },
              border: "1px solid",
              borderColor: errors.description ? "error.main" : "transparent",
              borderRadius: 2.5,
              overflow: "hidden",
            }}
          >
            <ReactQuill theme="snow" modules={quillModules} value={value.description || ""} onChange={(html) => onChange({ description: html })} />
          </Box>
          {errors.description && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>{errors.description}</Typography>
          )}
        </CardContent>
      </Card>

      {/* ── Toggles ── */}
      <Card variant="outlined" sx={{ borderRadius: 2.5, borderColor: "divider" }}>
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          <SectionHeader icon={<ToggleOnOutlinedIcon sx={{ fontSize: 18 }} />} title="Product Options" color="#0284c7" bg="#f0f9ff" />
          <Grid container spacing={1}>
            {toggles.map((t) => (
              <Grid item xs={6} sm={4} md={3} key={t.key}>
                <Box
                  sx={{
                    border: "1px solid",
                    borderColor: value[t.key] ? "#6366f1" : "divider",
                    borderRadius: 2,
                    px: 1.5,
                    py: 0.75,
                    transition: "all 200ms",
                    bgcolor: value[t.key] ? "rgba(99,102,241,0.06)" : "transparent",
                  }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={!!value[t.key]}
                        onChange={(e) => onChange({ [t.key]: e.target.checked ? 1 : 0 })}
                        sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#6366f1" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#6366f1" } }}
                      />
                    }
                    label={<Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13 }}>{t.label}</Typography>}
                    sx={{ m: 0 }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Stack>
  );
}

export default StepGeneral;
