import React from "react";
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Stack,
  Typography,
  InputAdornment,
  Alert,
  Chip,
} from "@mui/material";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import PercentIcon from "@mui/icons-material/Percent";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import TipsAndUpdatesOutlinedIcon from "@mui/icons-material/TipsAndUpdatesOutlined";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#6366f1" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#6366f1" },
};
const selectSx = {
  borderRadius: 2,
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#6366f1" },
};

const SectionHeader = ({ icon, title, subtitle, color = "#6366f1", bg = "#eef2ff" }) => (
  <Stack direction="row" alignItems="flex-start" spacing={1.5} sx={{ mb: 2.5 }}>
    <Box
      sx={{
        width: 34,
        height: 34,
        borderRadius: 1.5,
        bgcolor: bg,
        display: "grid",
        placeItems: "center",
        color,
        flexShrink: 0,
        mt: 0.25,
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  </Stack>
);

function StepDiscountSeo({ value, onChange, errors = {} }) {
  const discountType = value.discount_type || "flat";
  const isPercent = discountType === "percent";
  const unitPrice = parseFloat(value.unit_price) || 0;
  const discountVal = parseFloat(value.discount_value) || 0;

  let finalPrice = unitPrice;
  if (discountVal > 0 && unitPrice > 0) {
    finalPrice = isPercent
      ? unitPrice - (unitPrice * discountVal) / 100
      : unitPrice - discountVal;
    finalPrice = Math.max(0, finalPrice);
  }
  const savedAmount = unitPrice - finalPrice;
  const hasDiscount = discountVal > 0 && unitPrice > 0 && finalPrice >= 0 && finalPrice < unitPrice;

  const isPercentOver100 = isPercent && discountVal > 100;
  const isFlatOverPrice =
    !isPercent && discountVal > 0 && unitPrice > 0 && discountVal >= unitPrice;

  return (
    <Stack spacing={3}>
      {/* ── Discount ── */}
      <Card variant="outlined" sx={{ borderRadius: 2.5, borderColor: "divider" }}>
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          <SectionHeader
            icon={<LocalOfferOutlinedIcon sx={{ fontSize: 18 }} />}
            title="Discount"
            subtitle="Set a promotional discount for this product (optional)"
            color="#ea580c"
            bg="#fff7ed"
          />

          <Grid container spacing={2}>
            {/* Discount Type */}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Discount Type</InputLabel>
                <Select
                  value={discountType}
                  label="Discount Type"
                  onChange={(e) => onChange({ discount_type: e.target.value })}
                  sx={selectSx}
                >
                  <MenuItem value="flat">Flat — fixed amount off</MenuItem>
                  <MenuItem value="percent">Percentage — % off</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Discount Value */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label={isPercent ? "Discount (%)" : "Discount Amount"}
                type="number"
                value={value.discount_value || ""}
                onChange={(e) => onChange({ discount_value: e.target.value })}
                error={!!errors.discount_value}
                helperText={errors.discount_value || (isPercent ? "Enter 1–100" : "Enter fixed amount")}
                inputProps={{ min: 0, max: isPercent ? 100 : undefined, step: isPercent ? 1 : 0.01 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {isPercent ? (
                        <PercentIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                      ) : (
                        <AttachMoneyIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                      )}
                    </InputAdornment>
                  ),
                }}
                sx={fieldSx}
              />
            </Grid>

            {/* Min Qty */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Min. Qty for Discount"
                type="number"
                value={value.discount_min_qty || ""}
                onChange={(e) => onChange({ discount_min_qty: e.target.value })}
                inputProps={{ min: 1 }}
                helperText="Leave blank for no minimum"
                sx={fieldSx}
              />
            </Grid>

            {/* Start Date */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Discount Start Date"
                type="date"
                value={value.discount_start_date || ""}
                onChange={(e) => onChange({ discount_start_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EventOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
                sx={fieldSx}
              />
            </Grid>

            {/* End Date */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Discount End Date"
                type="date"
                value={value.discount_end_date || ""}
                onChange={(e) => onChange({ discount_end_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                error={!!errors.discount_end_date}
                helperText={errors.discount_end_date}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EventOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
                sx={fieldSx}
              />
            </Grid>

            {/* Validation alerts */}
            {isPercentOver100 && (
              <Grid item xs={12}>
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  Percentage discount cannot exceed 100%.
                </Alert>
              </Grid>
            )}
            {isFlatOverPrice && (
              <Grid item xs={12}>
                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                  Flat discount amount equals or exceeds the unit price (৳{unitPrice.toFixed(2)}).
                </Alert>
              </Grid>
            )}

            {/* Price preview */}
            {hasDiscount && !isPercentOver100 && !isFlatOverPrice && (
              <Grid item xs={12}>
                <Box
                  sx={{
                    bgcolor: "#f0fdf4",
                    border: "1px solid #86efac",
                    borderRadius: 2,
                    px: 2,
                    py: 1.5,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", fontWeight: 600, display: "block", mb: 0.75 }}
                  >
                    Price Preview
                  </Typography>
                  <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
                    <Box>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>Original</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, textDecoration: "line-through", color: "text.secondary" }}>
                        ৳{unitPrice.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: "#16a34a" }}>After Discount</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#16a34a" }}>
                        ৳{finalPrice.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: "#ea580c" }}>Customer Saves</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#ea580c" }}>
                        ৳{savedAmount.toFixed(2)}{isPercent ? ` (${discountVal}%)` : ""}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${isPercent ? discountVal + "% OFF" : "৳" + discountVal + " OFF"}`}
                      size="small"
                      sx={{ bgcolor: "#fef2f2", color: "#dc2626", fontWeight: 700, fontSize: 11, border: "1px solid #fca5a5", alignSelf: "center" }}
                    />
                  </Stack>
                </Box>
              </Grid>
            )}

            {/* No unit price hint */}
            {!unitPrice && value.discount_value && (
              <Grid item xs={12}>
                <Alert severity="info" icon={<TipsAndUpdatesOutlinedIcon />} sx={{ borderRadius: 2 }}>
                  Set a unit price in Step 1 to see the discount preview.
                </Alert>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* ── SEO & Short Description ── */}
      <Card variant="outlined" sx={{ borderRadius: 2.5, borderColor: "divider" }}>
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          <SectionHeader
            icon={<SearchOutlinedIcon sx={{ fontSize: 18 }} />}
            title="SEO & Short Description"
            subtitle="Improve search engine visibility and product listing summaries"
            color="#7c3aed"
            bg="#f5f3ff"
          />

          <Grid container spacing={2}>
            {/* Short Description */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Short Description"
                value={value.short_description || ""}
                onChange={(e) => onChange({ short_description: e.target.value })}
                placeholder="Brief summary shown on category & search pages"
                inputProps={{ maxLength: 250 }}
                helperText={`${(value.short_description || "").length}/250 characters`}
                sx={fieldSx}
              />
            </Grid>

            {/* Meta Title */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Meta Title"
                value={value.meta_title || ""}
                onChange={(e) => onChange({ meta_title: e.target.value })}
                placeholder="Leave blank to use product name"
                inputProps={{ maxLength: 160 }}
                helperText={
                  <Box component="span" sx={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Shown in browser tab &amp; search results</span>
                    <span style={{ color: (value.meta_title || "").length > 140 ? "#dc2626" : "inherit" }}>
                      {(value.meta_title || "").length}/160
                    </span>
                  </Box>
                }
                sx={fieldSx}
              />
            </Grid>

            {/* Meta Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={3}
                label="Meta Description"
                value={value.meta_description || ""}
                onChange={(e) => onChange({ meta_description: e.target.value })}
                placeholder="Shown in Google search results. Aim for 150–160 characters."
                inputProps={{ maxLength: 320 }}
                helperText={
                  <Box component="span" sx={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Recommended: 150–160 characters for best SEO</span>
                    <span
                      style={{
                        color:
                          (value.meta_description || "").length > 160
                            ? "#ea580c"
                            : (value.meta_description || "").length >= 150
                            ? "#16a34a"
                            : "inherit",
                      }}
                    >
                      {(value.meta_description || "").length}/320
                    </span>
                  </Box>
                }
                sx={fieldSx}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Stack>
  );
}

export default StepDiscountSeo;
