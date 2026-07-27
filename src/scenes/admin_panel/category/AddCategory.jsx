import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CloseIcon from "@mui/icons-material/Close";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import AllMedia from "../media/AllMedia";
import { image_file_url } from "../../../api/config";
import { createCategory, getCategoryWithAllChildren } from "../../../api/controller/admin_controller/category/category_controller";

const initialForm = {
  name: "",
  parent_id: "0",
  icon: "",
  cover_image: "",
  banner: "",
  featured: false,
  slug: "",
  meta_title: "",
  meta_description: "",
};

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeList = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.data?.data)) return value.data.data;
  return [];
};

const buildImageUrl = (media) => {
  if (!media) return "";
  const direct = media?.url || media?.external_link;
  if (direct && /^https?:\/\//i.test(String(direct))) return String(direct);
  const fileName = media?.file_name || media?.file_original_name;
  if (fileName) return `${String(image_file_url || "").replace(/\/+$/, "")}/${String(fileName).replace(/^\/+/, "")}`;
  return "";
};

const flattenCategories = (categories, depth = 0, output = []) => {
  categories.forEach((category) => {
    if (!category?.id) return;
    output.push({
      ...category,
      depth,
      level: Number(category?.level ?? depth),
      label: `${depth > 0 ? `${"  ".repeat(depth)}${"- ".repeat(1)}` : ""}${category?.name || "Unnamed category"}`,
    });
    const children = Array.isArray(category?.children) ? category.children : [];
    if (children.length) flattenCategories(children, depth + 1, output);
  });
  return output;
};

const MediaField = ({ label, helper, media, error, onPick, onClear }) => {
  const theme = useTheme();
  const preview = buildImageUrl(media);

  return (
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
        {label}
      </Typography>
      <Box
        onClick={onPick}
        sx={{
          minHeight: 150,
          borderRadius: 2,
          border: "1px dashed",
          borderColor: error ? "error.main" : "divider",
          bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "#fafafa",
          cursor: "pointer",
          overflow: "hidden",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "border-color 160ms ease, background 160ms ease",
          "&:hover": {
            borderColor: "primary.main",
            bgcolor: theme.palette.mode === "dark" ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.05)",
          },
        }}
      >
        {preview ? (
          <>
            <Box
              component="img"
              src={preview}
              alt={label}
              sx={{ width: "100%", height: 150, objectFit: "contain", p: 1 }}
            />
            <Stack direction="row" spacing={0.5} sx={{ position: "absolute", top: 8, right: 8 }}>
              <Tooltip title="Change">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPick();
                  }}
                  sx={{ bgcolor: "background.paper", border: "1px solid", borderColor: "divider" }}
                >
                  <CloudUploadOutlinedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Remove">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClear();
                  }}
                  sx={{ bgcolor: "background.paper", border: "1px solid", borderColor: "divider" }}
                >
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </>
        ) : (
          <Stack spacing={1} alignItems="center" sx={{ color: "text.secondary", px: 2, textAlign: "center" }}>
            <ImageOutlinedIcon sx={{ fontSize: 34, color: "primary.main" }} />
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              Select {label}
            </Typography>
            <Typography variant="caption">{helper}</Typography>
          </Stack>
        )}
      </Box>
      {error ? (
        <FormHelperText error>{error}</FormHelperText>
      ) : helper ? (
        <FormHelperText>{helper}</FormHelperText>
      ) : null}
    </Box>
  );
};

const AddCategory = () => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [categoryTree, setCategoryTree] = useState([]);
  const [loadingTree, setLoadingTree] = useState(false);
  const [saving, setSaving] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState("");
  const [mediaItems, setMediaItems] = useState({ icon: null, cover_image: null, banner: null });
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

  const categoryOptions = useMemo(() => flattenCategories(categoryTree), [categoryTree]);
  const selectedParent = useMemo(
    () => categoryOptions.find((category) => String(category.id) === String(form.parent_id)),
    [categoryOptions, form.parent_id]
  );
  const levelPreview = selectedParent ? Number(selectedParent.level || 0) + 1 : 0;

  const loadCategories = async () => {
    setLoadingTree(true);
    try {
      const res = await getCategoryWithAllChildren();
      setCategoryTree(normalizeList(res?.data ?? res));
    } catch (error) {
      setCategoryTree([]);
    } finally {
      setLoadingTree(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const update = (patch) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(patch).forEach((key) => delete next[key]);
      return next;
    });
  };

  const handleNameChange = (value) => {
    const patch = { name: value };
    if (!slugEdited) patch.slug = slugify(value);
    update(patch);
  };

  const handleSlugChange = (value) => {
    setSlugEdited(true);
    update({ slug: slugify(value) });
  };

  const openMedia = (target) => {
    setMediaTarget(target);
    setMediaOpen(true);
  };

  const handleMediaSelect = (item) => {
    if (!item) return;
    const id = item?.id ? String(item.id) : "";
    setMediaItems((prev) => ({ ...prev, [mediaTarget]: item }));
    update({ [mediaTarget]: id });
    setMediaOpen(false);
  };

  const clearMedia = (target) => {
    setMediaItems((prev) => ({ ...prev, [target]: null }));
    update({ [target]: "" });
  };

  const resetForm = () => {
    setForm(initialForm);
    setErrors({});
    setSlugEdited(false);
    setMediaItems({ icon: null, cover_image: null, banner: null });
  };

  const buildPayload = () => ({
    name: form.name.trim(),
    parent_id: Number(form.parent_id || 0),
    icon: form.icon ? Number(form.icon) : "",
    cover_image: form.cover_image ? Number(form.cover_image) : "",
    banner: form.banner ? Number(form.banner) : "",
    featured: form.featured ? 1 : 0,
    order_level: 0,
    is_active: 1,
    slug: form.slug.trim(),
    meta_title: form.meta_title.trim(),
    meta_description: form.meta_description.trim(),
  });

  const mapBackendErrors = (backendErrors = {}) => {
    const nextErrors = {};
    Object.entries(backendErrors || {}).forEach(([key, value]) => {
      nextErrors[key] = Array.isArray(value) ? value[0] : String(value || "");
    });
    setErrors(nextErrors);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const res = await createCategory(buildPayload());
      if (res?.status === "failed") {
        mapBackendErrors(res?.errors);
        setSnack({ open: true, msg: res?.message || "Category create failed", severity: "error" });
        return;
      }
      setSnack({ open: true, msg: "Category created successfully", severity: "success" });
      resetForm();
      loadCategories();
    } catch (error) {
      const payload = error?.response?.data;
      if (payload?.errors) mapBackendErrors(payload.errors);
      setSnack({ open: true, msg: payload?.message || "Category create failed", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} gap={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
            Create Category
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Add a new parent or child category with SEO and media.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<RestartAltOutlinedIcon />} onClick={resetForm} disabled={saving}>
            Reset
          </Button>
          <Button type="submit" variant="contained" startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveOutlinedIcon />} disabled={saving}>
            {saving ? "Saving..." : "Create Category"}
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <CategoryOutlinedIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Category Information
                </Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Category Name"
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    error={!!errors.name}
                    helperText={errors.name}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Slug"
                    value={form.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    error={!!errors.slug}
                    helperText={errors.slug || "Auto-generated from name. You can edit it."}
                  />
                </Grid>

                <Grid item xs={12} md={8}>
                  <FormControl fullWidth error={!!errors.parent_id}>
                    <InputLabel>Parent Category</InputLabel>
                    <Select
                      label="Parent Category"
                      value={form.parent_id}
                      onChange={(e) => update({ parent_id: String(e.target.value || "0") })}
                      disabled={loadingTree}
                    >
                      <MenuItem value="0">Parent Category / No Parent</MenuItem>
                      {categoryOptions.map((category) => (
                        <MenuItem key={category.id} value={String(category.id)}>
                          <Box component="span" sx={{ whiteSpace: "pre", color: category.depth ? "text.secondary" : "text.primary", fontWeight: category.depth ? 500 : 700 }}>
                            {category.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{errors.parent_id || (loadingTree ? "Loading categories..." : "Choose where this category belongs.")}</FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Level"
                    value={levelPreview}
                    disabled
                    helperText={errors.level || "Backend saves the final level."}
                    error={!!errors.level}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={<Switch checked={!!form.featured} onChange={(e) => update({ featured: e.target.checked })} />}
                    label="Featured"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2, mt: 2.5 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                SEO
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Meta Title"
                    value={form.meta_title}
                    onChange={(e) => update({ meta_title: e.target.value })}
                    error={!!errors.meta_title}
                    helperText={errors.meta_title}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    label="Meta Description"
                    value={form.meta_description}
                    onChange={(e) => update({ meta_description: e.target.value })}
                    error={!!errors.meta_description}
                    helperText={errors.meta_description}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                Category Media
              </Typography>
              <Stack spacing={2}>
                <MediaField
                  label="Icon Image"
                  helper="Upload or select an icon image."
                  media={mediaItems.icon}
                  error={errors.icon}
                  onPick={() => openMedia("icon")}
                  onClear={() => clearMedia("icon")}
                />
                <MediaField
                  label="Cover Image"
                  helper="Used in category cards and visual sections."
                  media={mediaItems.cover_image}
                  error={errors.cover_image}
                  onPick={() => openMedia("cover_image")}
                  onClear={() => clearMedia("cover_image")}
                />
                <MediaField
                  label="Banner Image"
                  helper="Used for category banner/hero surfaces."
                  media={mediaItems.banner}
                  error={errors.banner}
                  onPick={() => openMedia("banner")}
                  onClear={() => clearMedia("banner")}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={mediaOpen} onClose={() => setMediaOpen(false)} fullWidth maxWidth="lg" PaperProps={{ sx: { borderRadius: 2.5 } }}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            Select Media
          </Typography>
          <IconButton size="small" onClick={() => setMediaOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <AllMedia onSelect={(item) => handleMediaSelect(item)} single />
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack((prev) => ({ ...prev, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddCategory;
