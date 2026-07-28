import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import AllMedia from "../media/AllMedia";
import { image_file_url } from "../../../api/config";
import {
  createBrand,
  deleteBrand,
  getBrand,
  getBrandDetails,
  updateBrand,
} from "../../../api/controller/admin_controller/brand/brand_controller";

const initialForm = {
  name: "",
  slug: "",
  logo: "",
  status: "active",
};

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const buildImageUrl = (media) => {
  if (!media) return "";
  if (typeof media === "string") {
    if (/^https?:\/\//i.test(media)) return media;
    return `${String(image_file_url || "").replace(/\/+$/, "")}/${media.replace(/^\/+/, "")}`;
  }

  const direct = media?.url || media?.external_link || media?.path;
  if (direct && /^https?:\/\//i.test(String(direct))) return String(direct);

  const nested = media?.logo || media?.upload;
  if (nested) return buildImageUrl(nested);

  const fileName = media?.file_name || media?.file_original_name || media?.image || media?.thumbnail;
  if (fileName) {
    return `${String(image_file_url || "").replace(/\/+$/, "")}/${String(fileName).replace(/^\/+/, "")}`;
  }

  return "";
};

const getValidationErrors = (error) => {
  const payload = error?.response?.data || error;
  return {
    message: payload?.message || "Brand save failed",
    errors: payload?.errors || {},
  };
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const BrandManagement = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [slugEdited, setSlugEdited] = useState(false);
  const [errors, setErrors] = useState({});
  const [logoMedia, setLogoMedia] = useState(null);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState("create");
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(initialForm);
  const [editErrors, setEditErrors] = useState({});
  const [editLogoMedia, setEditLogoMedia] = useState(null);
  const [editingBrand, setEditingBrand] = useState(null);
  const [editSlugEdited, setEditSlugEdited] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [updateSubmitting, setUpdateSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
  });
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const logoPreview = useMemo(() => buildImageUrl(logoMedia), [logoMedia]);
  const editLogoPreview = useMemo(() => buildImageUrl(editLogoMedia), [editLogoMedia]);

  const loadBrands = async (targetPage = page) => {
    setLoading(true);
    try {
      const response = await getBrand({ per_page: 20, page: targetPage });
      const payload = response?.data || {};
      const list = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(response?.data)
          ? response.data
          : [];

      setBrands(list);
      setPagination({
        current_page: Number(payload?.current_page || targetPage),
        last_page: Number(payload?.last_page || 1),
        per_page: Number(payload?.per_page || 20),
        total: Number(payload?.total || list.length),
      });
    } catch (error) {
      setBrands([]);
      setSnack({
        open: true,
        message: error?.response?.data?.message || "Brand list fetch failed",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands(page);
  }, [page]);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const setEditField = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
    setEditErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleNameChange = (event) => {
    const name = event.target.value;
    setForm((prev) => ({
      ...prev,
      name,
      slug: slugEdited ? prev.slug : slugify(name),
    }));
    setErrors((prev) => ({ ...prev, name: undefined, slug: undefined }));
  };

  const handleSlugChange = (event) => {
    setSlugEdited(true);
    setField("slug", slugify(event.target.value));
  };

  const handleEditNameChange = (event) => {
    const name = event.target.value;
    setEditForm((prev) => ({
      ...prev,
      name,
      slug: editSlugEdited ? prev.slug : slugify(name),
    }));
    setEditErrors((prev) => ({ ...prev, name: undefined, slug: undefined }));
  };

  const handleEditSlugChange = (event) => {
    setEditSlugEdited(true);
    setEditField("slug", slugify(event.target.value));
  };

  const handleMediaSelect = (item) => {
    if (mediaTarget === "edit") {
      setEditLogoMedia(item);
      setEditField("logo", item?.id || "");
    } else {
      setLogoMedia(item);
      setField("logo", item?.id || "");
    }
    setMediaOpen(false);
  };

  const openMediaPicker = (target = "create") => {
    setMediaTarget(target);
    setMediaOpen(true);
  };

  const resetForm = () => {
    setForm(initialForm);
    setLogoMedia(null);
    setSlugEdited(false);
    setErrors({});
  };

  const normalizeBrandDetails = (response, fallback) => {
    const data = response?.data?.brand || response?.data || response?.brand || response;
    return data?.id ? data : fallback;
  };

  const prepareEditForm = (brand) => {
    const logoValue = brand?.logo_id || brand?.logo?.id || brand?.logo || "";
    setEditingBrand(brand);
    setEditForm({
      name: brand?.name || "",
      slug: brand?.slug || "",
      logo: typeof logoValue === "object" ? logoValue?.id || "" : logoValue || "",
      status: brand?.status || "active",
    });
    setEditLogoMedia(brand?.logo || null);
    setEditSlugEdited(false);
    setEditErrors({});
  };

  const handleEditClick = async (brand) => {
    setEditOpen(true);
    prepareEditForm(brand);
    setEditLoading(true);
    try {
      const response = await getBrandDetails(brand.id);
      prepareEditForm(normalizeBrandDetails(response, brand));
    } catch (error) {
      setSnack({
        open: true,
        message: error?.response?.data?.message || "Brand details fetch failed",
        severity: "error",
      });
    } finally {
      setEditLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setErrors({});

    const payload = {
      name: form.name.trim(),
      slug: slugify(form.slug),
      logo: form.logo ? Number(form.logo) : "",
      status: form.status,
    };

    try {
      const response = await createBrand(payload);
      if (response?.status === "failed") {
        setErrors(response?.errors || {});
        setSnack({
          open: true,
          message: response?.message || "Brand create failed",
          severity: "error",
        });
        return;
      }

      setSnack({
        open: true,
        message: "Brand created successfully",
        severity: "success",
      });
      resetForm();
      setPage(1);
      await loadBrands(1);
    } catch (error) {
      const validation = getValidationErrors(error);
      setErrors(validation.errors);
      setSnack({
        open: true,
        message: validation.message,
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSubmit = async (event) => {
    event.preventDefault();
    if (!editingBrand?.id) return;

    setUpdateSubmitting(true);
    setEditErrors({});

    const payload = {
      name: editForm.name.trim(),
      slug: slugify(editForm.slug),
      logo: editForm.logo ? Number(editForm.logo) : "",
      status: editForm.status,
    };

    try {
      const response = await updateBrand(editingBrand.id, payload);
      if (response?.status === "failed") {
        setEditErrors(response?.errors || {});
        setSnack({
          open: true,
          message: response?.message || "Brand update failed",
          severity: "error",
        });
        return;
      }

      setSnack({
        open: true,
        message: "Brand updated successfully",
        severity: "success",
      });
      setEditOpen(false);
      setEditingBrand(null);
      await loadBrands(page);
    } catch (error) {
      const validation = getValidationErrors(error);
      setEditErrors(validation.errors);
      setSnack({
        open: true,
        message: validation.message || "Brand update failed",
        severity: "error",
      });
    } finally {
      setUpdateSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget?.id) return;

    setDeleteLoadingId(deleteTarget.id);
    try {
      const response = await deleteBrand(deleteTarget.id);
      if (response?.status === "failed") {
        setSnack({
          open: true,
          message: response?.message || "Brand delete failed",
          severity: "error",
        });
        return;
      }

      setSnack({
        open: true,
        message: "Brand deleted successfully",
        severity: "success",
      });
      setDeleteTarget(null);
      await loadBrands(page);
    } catch (error) {
      setSnack({
        open: true,
        message: error?.response?.data?.message || "Brand delete failed",
        severity: "error",
      });
    } finally {
      setDeleteLoadingId(null);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "text.primary" }}>
            Brand Management
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            Create brands and manage the storefront brand catalogue.
          </Typography>
        </Box>
        <Chip
          icon={<LocalOfferOutlinedIcon />}
          label={`${pagination.total || 0} brands`}
          color="primary"
          variant="outlined"
          sx={{ alignSelf: { xs: "flex-start", md: "center" }, fontWeight: 700 }}
        />
      </Stack>

      <Grid container spacing={3} alignItems="flex-start">
        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider", boxShadow: "none" }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Create Brand
                </Typography>
                <Tooltip title="Reset form">
                  <IconButton onClick={resetForm} size="small">
                    <RestartAltOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Divider sx={{ mb: 2 }} />

              <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={2}>
                  <TextField
                    label="Brand Name"
                    value={form.name}
                    onChange={handleNameChange}
                    error={Boolean(errors?.name)}
                    helperText={errors?.name?.[0] || ""}
                    fullWidth
                    required
                  />

                  <TextField
                    label="Slug"
                    value={form.slug}
                    onChange={handleSlugChange}
                    error={Boolean(errors?.slug)}
                    helperText={errors?.slug?.[0] || "Lowercase and hyphen-separated"}
                    fullWidth
                    required
                  />

                  <FormControl fullWidth error={Boolean(errors?.status)}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      label="Status"
                      value={form.status}
                      onChange={(event) => setField("status", event.target.value)}
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                    {errors?.status?.[0] && <FormHelperText>{errors.status[0]}</FormHelperText>}
                  </FormControl>

                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                      Logo image
                    </Typography>
                    <Box
                      onClick={() => openMediaPicker("create")}
                      sx={{
                        minHeight: 150,
                        borderRadius: 2,
                        border: "1px dashed",
                        borderColor: errors?.logo ? "error.main" : "divider",
                        bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "#fafafa",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      {logoPreview ? (
                        <Box
                          component="img"
                          src={logoPreview}
                          alt="Selected brand logo"
                          sx={{ width: "100%", height: 150, objectFit: "contain", p: 1.5 }}
                        />
                      ) : (
                        <Stack alignItems="center" spacing={1}>
                          <AddPhotoAlternateOutlinedIcon color="primary" />
                          <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 700 }}>
                            Select logo
                          </Typography>
                        </Stack>
                      )}
                    </Box>
                    {errors?.logo?.[0] && (
                      <FormHelperText error sx={{ ml: 1.75 }}>
                        {errors.logo[0]}
                      </FormHelperText>
                    )}
                    {logoMedia?.id && (
                      <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.75, display: "block" }}>
                        Upload ID: {logoMedia.id}
                      </Typography>
                    )}
                  </Box>

                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <SaveOutlinedIcon />}
                    disabled={submitting}
                    sx={{ py: 1.2, fontWeight: 800 }}
                  >
                    {submitting ? "Creating..." : "Create Brand"}
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider", boxShadow: "none" }}>
            <CardContent>
              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1.5} sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Brand List
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Page {pagination.current_page} of {pagination.last_page}
                  </Typography>
                </Box>
                <Button variant="outlined" onClick={() => loadBrands(page)} disabled={loading}>
                  Refresh
                </Button>
              </Stack>
              <Divider sx={{ mb: 2 }} />

              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "#f8fafc" }}>
                      <TableCell sx={{ fontWeight: 800 }}>Logo</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Slug</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Created At</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                          <CircularProgress size={28} />
                        </TableCell>
                      </TableRow>
                    ) : brands.length ? (
                      brands.map((brand) => {
                        const imageUrl = buildImageUrl(brand?.logo);
                        return (
                          <TableRow key={brand.id} hover>
                            <TableCell>
                              <Avatar
                                src={imageUrl}
                                variant="rounded"
                                sx={{ width: 46, height: 46, bgcolor: "action.hover" }}
                              >
                                <LocalOfferOutlinedIcon fontSize="small" />
                              </Avatar>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>{brand?.name || "-"}</TableCell>
                            <TableCell sx={{ color: "text.secondary" }}>{brand?.slug || "-"}</TableCell>
                            <TableCell>
                              <Chip
                                label={brand?.status || "-"}
                                size="small"
                                color={brand?.status === "active" ? "success" : "default"}
                                variant={brand?.status === "active" ? "filled" : "outlined"}
                                sx={{ textTransform: "capitalize", fontWeight: 700 }}
                              />
                            </TableCell>
                            <TableCell sx={{ color: "text.secondary" }}>{formatDate(brand?.created_at)}</TableCell>
                            <TableCell align="right">
                              <Tooltip title="View brand products">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => navigate(`/brands/${brand.id}/products`)}
                                  disabled={!brand?.id}
                                >
                                  <Inventory2OutlinedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit brand">
                                <IconButton size="small" onClick={() => handleEditClick(brand)}>
                                  <EditOutlinedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete brand">
                                <span>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => setDeleteTarget(brand)}
                                    disabled={deleteLoadingId === brand.id}
                                  >
                                    {deleteLoadingId === brand.id ? (
                                      <CircularProgress size={18} color="inherit" />
                                    ) : (
                                      <DeleteOutlineOutlinedIcon fontSize="small" />
                                    )}
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 7 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                            No brands found
                          </Typography>
                          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                            Create a brand to see it listed here.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {pagination.last_page > 1 && (
                <Stack alignItems="center" sx={{ mt: 2 }}>
                  <Pagination
                    page={pagination.current_page}
                    count={pagination.last_page}
                    color="primary"
                    onChange={(_, value) => setPage(value)}
                    disabled={loading}
                  />
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Edit Brand
          <IconButton onClick={() => setEditOpen(false)} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <Box component="form" onSubmit={handleUpdateSubmit}>
          <DialogContent dividers>
            {editLoading ? (
              <Stack alignItems="center" sx={{ py: 5 }}>
                <CircularProgress size={28} />
              </Stack>
            ) : (
              <Stack spacing={2}>
                <TextField
                  label="Brand Name"
                  value={editForm.name}
                  onChange={handleEditNameChange}
                  error={Boolean(editErrors?.name)}
                  helperText={editErrors?.name?.[0] || ""}
                  fullWidth
                  required
                />

                <TextField
                  label="Slug"
                  value={editForm.slug}
                  onChange={handleEditSlugChange}
                  error={Boolean(editErrors?.slug)}
                  helperText={editErrors?.slug?.[0] || "Lowercase and hyphen-separated"}
                  fullWidth
                  required
                />

                <FormControl fullWidth error={Boolean(editErrors?.status)}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    label="Status"
                    value={editForm.status}
                    onChange={(event) => setEditField("status", event.target.value)}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                  {editErrors?.status?.[0] && <FormHelperText>{editErrors.status[0]}</FormHelperText>}
                </FormControl>

                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                    Logo image
                  </Typography>
                  <Box
                    onClick={() => openMediaPicker("edit")}
                    sx={{
                      minHeight: 150,
                      borderRadius: 2,
                      border: "1px dashed",
                      borderColor: editErrors?.logo ? "error.main" : "divider",
                      bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "#fafafa",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    {editLogoPreview ? (
                      <Box
                        component="img"
                        src={editLogoPreview}
                        alt="Selected brand logo"
                        sx={{ width: "100%", height: 150, objectFit: "contain", p: 1.5 }}
                      />
                    ) : (
                      <Stack alignItems="center" spacing={1}>
                        <AddPhotoAlternateOutlinedIcon color="primary" />
                        <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 700 }}>
                          Select logo
                        </Typography>
                      </Stack>
                    )}
                  </Box>
                  {editErrors?.logo?.[0] && (
                    <FormHelperText error sx={{ ml: 1.75 }}>
                      {editErrors.logo[0]}
                    </FormHelperText>
                  )}
                  {editForm.logo && (
                    <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.75, display: "block" }}>
                      Upload ID: {editForm.logo}
                    </Typography>
                  )}
                </Box>
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setEditOpen(false)} disabled={updateSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={editLoading || updateSubmitting}
              startIcon={updateSubmitting ? <CircularProgress size={16} color="inherit" /> : <SaveOutlinedIcon />}
            >
              {updateSubmitting ? "Updating..." : "Update Brand"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} fullWidth maxWidth="xs">
        <DialogTitle>Delete Brand</DialogTitle>
        <DialogContent dividers>
          <Typography>Are you sure you want to delete this brand?</Typography>
          {deleteTarget?.name && (
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
              {deleteTarget.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={Boolean(deleteLoadingId)}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDeleteConfirm}
            disabled={Boolean(deleteLoadingId)}
            startIcon={deleteLoadingId ? <CircularProgress size={16} color="inherit" /> : <DeleteOutlineOutlinedIcon />}
          >
            {deleteLoadingId ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={mediaOpen} onClose={() => setMediaOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Select Brand Logo
          <IconButton onClick={() => setMediaOpen(false)} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <AllMedia onSelect={handleMediaSelect} single />
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack((prev) => ({ ...prev, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BrandManagement;
