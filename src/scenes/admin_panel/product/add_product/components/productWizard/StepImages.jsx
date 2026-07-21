import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Chip,
  FormHelperText,
  Grid,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  Stack,
  Tooltip,
} from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CollectionsOutlinedIcon from "@mui/icons-material/CollectionsOutlined";
import StarIcon from "@mui/icons-material/Star";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import CloseIcon from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import AllMedia from "../../../../media/AllMedia";
import { image_file_url } from "../../../../../../api/config";
import {
  deleteProductImage,
  getProductImages,
} from "../../../../../../api/controller/admin_controller/product/product_setting_controller";

function StepImages({ value = [], onChange, onPrimary, error = "", productId, deleteProductImagesOnRemove = false }) {
  const fileInputRef = useRef(null);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loadingImages, setLoadingImages] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

  const ensurePrimary = (list) => {
    if (list.length === 0) return list;
    if (list.some((x) => x.is_primary)) return list;
    const next = [...list];
    next[0] = { ...next[0], is_primary: true };
    return next;
  };

  const updateImages = (next, options = {}) => {
    if (!onChange) return;
    const shouldEnsurePrimary = options.ensurePrimary !== false;
    onChange(shouldEnsurePrimary ? ensurePrimary(next) : next);
  };

  const removeAtIndex = (idx, options = {}) => {
    const removed = value[idx];
    const next = value.filter((_, i) => i !== idx);
    if (removed?.is_primary) {
      updateImages(next.map((img) => ({ ...img, is_primary: false })), { ensurePrimary: false });
      return;
    }
    updateImages(next, options);
  };

  const getProductImageId = (img) => img?.product_image_id ?? img?.productImageId ?? (img?.existing ? img?.id : null) ?? null;
  const getUploadId = (img) => img?.upload?.id ?? img?.upload_id ?? img?.media_id ?? null;
  const getImageKey = (img) => String(getProductImageId(img) ?? getUploadId(img) ?? img?.file_name ?? img?.filename ?? "");

  const getImageSrc = (img) => {
    if (img?.file) return URL.createObjectURL(img.file);
    const url = img?.url || "";
    if (url && /^https?:\/\//i.test(String(url))) return String(url);
    const fileName = img?.file_name || "";
    if (!fileName) return "";
    if (/^https?:\/\//i.test(String(fileName))) return String(fileName);
    return `${image_file_url}/${String(fileName).replace(/^\/+/, "")}`;
  };

  const mapServerImage = (img) => {
    const upload = img?.upload || null;
    const productImageId = img?.id ?? img?.product_image_id ?? null;
    const uploadId = upload?.id ?? img?.media_id ?? img?.upload_id ?? null;
    return {
      file: null,
      id: productImageId,
      product_image_id: productImageId,
      upload_id: uploadId,
      media_id: uploadId,
      file_name: upload?.file_name || img?.file_name || img?.image || "",
      filename:
        upload?.file_original_name ||
        upload?.file_name ||
        img?.file_original_name ||
        img?.file_name ||
        img?.image ||
        "",
      url: upload?.url || img?.url || null,
      is_primary: Boolean(img?.is_primary ?? img?.is_primary_image ?? img?.primary),
      existing: true,
    };
  };

  const normalizeList = (x) => {
    if (!x) return [];
    if (Array.isArray(x)) return x;
    if (Array.isArray(x?.data)) return x.data;
    if (Array.isArray(x?.data?.data)) return x.data.data;
    if (Array.isArray(x?.data?.data?.data)) return x.data.data.data;
    return [];
  };

  useEffect(() => {
    const loadImages = async () => {
      if (!productId || !onChange) return;
      setLoadingImages(true);
      try {
        const res = await getProductImages(productId);
        const list = normalizeList(res?.data ?? res);
        const serverImages = list.map(mapServerImage).filter((img) => img.product_image_id || img.media_id || img.file_name);
        const existingKeys = new Set(value.map(getImageKey));
        const merged = [...value];
        serverImages.forEach((img) => {
          const key = getImageKey(img);
          if (!key || existingKeys.has(key)) return;
          existingKeys.add(key);
          merged.push(img);
        });
        updateImages(merged);
      } catch (err) {
        console.error("Failed to load product images", err);
      } finally {
        setLoadingImages(false);
      }
    };

    loadImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const handleFileSelect = (event) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert(`${file.name} is not a valid image file`);
        return;
      }

      // Add file object with is_primary flag
        const next = [
          ...value,
          {
            file: file,
            filename: file.name,
            is_primary: value.length === 0, // first image is primary by default
          },
        ];
        updateImages(next);
    });

    // Reset input
    fileInputRef.current.value = "";
  };

  const handleMediaSelect = (itemOrItems) => {
    if (!itemOrItems) return;
    const items = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];
    items.forEach((it) => {
      const next = [
        ...value,
        {
          file: null,
          media_id: it.id,
          upload_id: it.id,
          filename: it.file_original_name || it.file_name,
          file_name: it.file_name || "",
          url: it.url || null,
          is_primary: value.length === 0 || !value.some((v) => v.is_primary),
          existing: false,
        },
      ];
      updateImages(next);
    });
  };

  const handleRemoveClick = (img, idx) => {
    if (!img || !onChange) return;
    const productImageId = getProductImageId(img);
    if (!deleteProductImagesOnRemove || !img?.existing || img?.file) {
      removeAtIndex(idx);
      return;
    }
    if (!productImageId) {
      setSnack({ open: true, msg: "Product image delete failed", severity: "error" });
      return;
    }
    setDeleteTarget({ img, idx, imageId: productImageId });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.imageId || deleteTarget.idx == null) return;

    try {
      setRemovingId(deleteTarget.imageId);
      const res = await deleteProductImage(deleteTarget.imageId);
      if (res?.status && res.status !== "success" && res?.success !== true) {
        throw new Error(res.message || "Product image delete failed");
      }
      removeAtIndex(deleteTarget.idx);
      setDeleteTarget(null);
      setSnack({ open: true, msg: "Product image deleted successfully", severity: "success" });
    } catch (err) {
      console.error("Failed to delete product image", err);
      setSnack({
        open: true,
        msg: err?.response?.data?.message || err?.message || "Product image delete failed",
        severity: "error",
      });
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <Stack spacing={3}>
      {/* ── Upload zone ── */}
      <Card variant="outlined" sx={{ borderRadius: 2.5, borderColor: "divider" }}>
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Box sx={{ width: 30, height: 30, borderRadius: 1.5, bgcolor: "#eef2ff", display: "grid", placeItems: "center", color: "#6366f1" }}>
              <CloudUploadOutlinedIcon sx={{ fontSize: 18 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Upload Images</Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>First image is primary by default</Typography>
            </Box>
          </Stack>

          {/* <Box
            onClick={() => fileInputRef.current?.click()}
            sx={{
              border: "2px dashed",
              borderColor: error ? "error.main" : "divider",
              borderRadius: 2.5,
              py: 4,
              textAlign: "center",
              cursor: "pointer",
              transition: "all 200ms",
              "&:hover": { borderColor: "#6366f1", bgcolor: "rgba(99,102,241,0.04)" },
            }}
          >
            <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileSelect} style={{ display: "none" }} />
            <CloudUploadOutlinedIcon sx={{ fontSize: 44, color: "text.disabled", mb: 1 }} />
            <Typography variant="body1" sx={{ fontWeight: 700, mb: 0.5 }}>Click to upload or drag and drop</Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>PNG, JPG, GIF up to 10MB</Typography>
          </Box> */}

          <Button
            variant="outlined"
            onClick={() => setMediaOpen(true)}
            startIcon={<CollectionsOutlinedIcon />}
            sx={{ mt: 2, borderRadius: 2, textTransform: "none", fontWeight: 700, borderColor: "divider", color: "text.secondary" }}
          >
            Choose From Library
          </Button>

          {error && <FormHelperText error sx={{ mt: 1 }}>{error}</FormHelperText>}
        </CardContent>
      </Card>

      {/* ── Image grid ── */}
      <Card variant="outlined" sx={{ borderRadius: 2.5, borderColor: "divider" }}>
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Box sx={{ width: 30, height: 30, borderRadius: 1.5, bgcolor: "#f0fdf4", display: "grid", placeItems: "center", color: "#16a34a" }}>
              <ImageOutlinedIcon sx={{ fontSize: 18 }} />
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Product Images
              {value.length > 0 && <Typography component="span" variant="caption" sx={{ ml: 1, color: "text.secondary" }}>({value.length})</Typography>}
            </Typography>
          </Stack>

          {loadingImages && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Loading images...</Typography>
          )}

          {value.length === 0 ? (
            <Box sx={{ py: 5, textAlign: "center", border: "2px dashed", borderColor: "divider", borderRadius: 2.5 }}>
              <ImageOutlinedIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
              <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600 }}>No images added yet</Typography>
              <Typography variant="caption" sx={{ color: "text.disabled" }}>Upload at least one image above</Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {value.map((img, idx) => {
                const productImageId = getProductImageId(img);
                const isRemoving = removingId != null && String(removingId) === String(productImageId);
                const src = getImageSrc(img);
                return (
                  <Grid item xs={6} sm={4} md={3} key={idx}>
                    <Box
                      sx={{
                        position: "relative",
                        borderRadius: 2.5,
                        overflow: "hidden",
                        border: img.is_primary ? "2px solid #6366f1" : "1px solid",
                        borderColor: img.is_primary ? "#6366f1" : "divider",
                        transition: "all 200ms",
                        "&:hover .img-overlay": { opacity: 1 },
                      }}
                    >
                      <Box
                        component="img"
                        src={src}
                        alt={img.filename}
                        sx={{ width: "100%", height: 140, objectFit: "cover", display: "block" }}
                      />

                      {/* Primary badge */}
                      {img.is_primary && (
                        <Chip
                          icon={<StarIcon sx={{ fontSize: 14, color: "#fff !important" }} />}
                          label="Primary"
                          size="small"
                          sx={{ position: "absolute", top: 8, left: 8, bgcolor: "#6366f1", color: "#fff", fontWeight: 700, fontSize: 11, height: 24 }}
                        />
                      )}

                      {/* Hover overlay */}
                      <Stack
                        className="img-overlay"
                        direction="row"
                        spacing={0.5}
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          opacity: 0,
                          transition: "opacity 200ms",
                        }}
                      >
                        {!img.is_primary && (
                          <Tooltip title="Set as primary">
                            <IconButton
                              size="small"
                              onClick={() => onPrimary(idx)}
                              disabled={isRemoving}
                              sx={{ bgcolor: "background.paper", border: "1px solid", borderColor: "divider", "&:hover": { bgcolor: "#eef2ff" } }}
                            >
                              <StarOutlineIcon sx={{ fontSize: 16, color: "#6366f1" }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Remove">
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveClick(img, idx)}
                            disabled={isRemoving}
                            sx={{ bgcolor: "background.paper", border: "1px solid", borderColor: "divider", "&:hover": { bgcolor: "#fef2f2", color: "#ef4444" } }}
                          >
                            {isRemoving ? <CircularProgress size={16} /> : <DeleteOutlineIcon sx={{ fontSize: 16 }} />}
                          </IconButton>
                        </Tooltip>
                      </Stack>

                      {/* Filename bar */}
                      <Box sx={{ px: 1.5, py: 1, borderTop: "1px solid", borderColor: "divider" }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, display: "block" }} noWrap title={img.filename}>
                          {img.filename}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.disabled", fontSize: 11 }}>
                          {img.file ? `${(img.file.size / 1024).toFixed(1)} KB` : "Library"}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* ── Media dialog ── */}
      <Dialog open={mediaOpen} onClose={() => setMediaOpen(false)} fullWidth maxWidth="lg" PaperProps={{ sx: { borderRadius: 2.5 } }}>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Select Media</Typography>
          <IconButton size="small" onClick={() => setMediaOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <AllMedia onSelect={(it) => { handleMediaSelect(it); setMediaOpen(false); }} single={false} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteTarget}
        onClose={() => {
          if (!removingId) setDeleteTarget(null);
        }}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2.5 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Delete this product image?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This will delete the image record from this product.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={!!removingId} sx={{ textTransform: "none", fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={!!removingId}
            startIcon={removingId ? <CircularProgress size={16} color="inherit" /> : <DeleteOutlineIcon />}
            sx={{ textTransform: "none", fontWeight: 800 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3500} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))} sx={{ borderRadius: 2, fontWeight: 600 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Stack>
  );
}

export default StepImages;

