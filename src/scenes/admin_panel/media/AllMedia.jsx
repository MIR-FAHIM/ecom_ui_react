import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  CircularProgress,
  Grid,
  Pagination,
  Skeleton,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import CheckCircleIcon      from "@mui/icons-material/CheckCircle";
import CloudUploadOutlined  from "@mui/icons-material/CloudUploadOutlined";
import CollectionsOutlined  from "@mui/icons-material/CollectionsOutlined";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import ImageNotSupportedOutlined from "@mui/icons-material/ImageNotSupportedOutlined";
import InsertDriveFileOutlined   from "@mui/icons-material/InsertDriveFileOutlined";

import { getAllMedia, addMedia } from "../../../api/controller/admin_controller/media/media_controller";
import { image_file_url } from "../../../api/config/index.jsx";

const PLACEHOLDER = null; // no external URL needed — we render a fallback UI

// ─── Broken-image fallback card ────────────────────────────────────────────
function ImgWithFallback({ src, alt, height = 130 }) {
  const [err, setErr] = useState(false);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  if (err || !src) {
    return (
      <Box
        sx={{
          height,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0.5,
          background: isDark ? "#1e293b" : "#f8fafc",
          borderBottom: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
        }}
      >
        <ImageNotSupportedOutlined sx={{ fontSize: 28, color: "text.disabled" }} />
        <Typography variant="caption" sx={{ color: "text.disabled", px: 1, textAlign: "center" }} noWrap>
          No preview
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      onError={() => setErr(true)}
      sx={{
        width: "100%",
        height,
        objectFit: "cover",
        display: "block",
        transition: "transform 0.3s ease",
      }}
    />
  );
}

// ─── Upload zone ────────────────────────────────────────────────────────────
function UploadZone({ onUploadDone }) {
  const theme   = useTheme();
  const isDark  = theme.palette.mode === "dark";
  const inputRef = useRef(null);

  const [file,      setFile]      = useState(null);
  const [dragging,  setDragging]  = useState(false);
  const [uploading, setUploading] = useState(false);
  const [snack,     setSnack]     = useState({ open: false, msg: "", severity: "success" });

  const userId = useMemo(() => localStorage.getItem("userId"), []);

  const handleFile = (f) => {
    if (f && f.type.startsWith("image/")) setFile(f);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }, []);

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (userId) fd.append("user_id", userId);
      await addMedia(fd);
      setSnack({ open: true, msg: "Image uploaded successfully.", severity: "success" });
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      onUploadDone?.();
    } catch (err) {
      setSnack({ open: true, msg: err?.response?.data?.message || "Upload failed.", severity: "error" });
    } finally {
      setUploading(false);
    }
  };

  const previewUrl = file ? URL.createObjectURL(file) : null;

  return (
    <>
      <Box
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !file && inputRef.current?.click()}
        sx={{
          border: `2px dashed ${dragging ? "#6366f1" : isDark ? "#334155" : "#e2e8f0"}`,
          borderRadius: "12px",
          p: 3,
          display: "flex",
          alignItems: "center",
          gap: 2,
          cursor: file ? "default" : "pointer",
          background: dragging
            ? "rgba(99,102,241,0.06)"
            : isDark ? "rgba(255,255,255,0.02)" : "#fafafa",
          transition: "all 0.2s ease",
          "&:hover": !file ? {
            borderColor: "#6366f1",
            background: "rgba(99,102,241,0.04)",
          } : {},
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => handleFile(e.target.files?.[0] || null)}
        />

        {file ? (
          <>
            {/* Preview */}
            <Box
              component="img"
              src={previewUrl}
              sx={{ width: 72, height: 72, objectFit: "cover", borderRadius: "8px", flexShrink: 0 }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={600} noWrap>{file.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {(file.size / 1024).toFixed(1)} KB • {file.type}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<DeleteOutlineOutlined fontSize="small" />}
                onClick={(e) => { e.stopPropagation(); setFile(null); if (inputRef.current) inputRef.current.value = ""; }}
              >
                Remove
              </Button>
              <Button
                size="small"
                variant="contained"
                startIcon={uploading ? <CircularProgress size={14} color="inherit" /> : <CloudUploadOutlined fontSize="small" />}
                onClick={(e) => { e.stopPropagation(); upload(); }}
                disabled={uploading}
              >
                {uploading ? "Uploading…" : "Upload"}
              </Button>
            </Stack>
          </>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
            <Box
              sx={{
                width: 48, height: 48, borderRadius: "12px",
                background: "rgba(99,102,241,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}
            >
              <CloudUploadOutlined sx={{ color: "#6366f1", fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={600} color="text.primary">
                Drop image here or <Box component="span" sx={{ color: "#6366f1" }}>browse</Box>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                PNG, JPG, WEBP — any size
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snack.severity} variant="filled" sx={{ borderRadius: "10px" }} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </>
  );
}

// ─── Skeleton loader ────────────────────────────────────────────────────────
function MediaSkeleton() {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: 12 }).map((_, i) => (
        <Grid key={i} item xs={6} sm={4} md={3} lg={2}>
          <Card sx={{ overflow: "hidden" }}>
            <Skeleton variant="rectangular" height={130} animation="wave" />
            <Box sx={{ p: 1 }}>
              <Skeleton variant="text" width="80%" height={16} animation="wave" />
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

// ─── Empty state ────────────────────────────────────────────────────────────
function EmptyState() {
  const theme = useTheme();
  return (
    <Box sx={{ py: 10, textAlign: "center" }}>
      <Box
        sx={{
          width: 72, height: 72, borderRadius: "18px",
          background: theme.palette.mode === "dark" ? "#1e293b" : "#f1f5f9",
          display: "flex", alignItems: "center", justifyContent: "center",
          mx: "auto", mb: 2,
        }}
      >
        <CollectionsOutlined sx={{ fontSize: 32, color: "text.disabled" }} />
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}>
        No media found
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Upload your first image using the panel above.
      </Typography>
    </Box>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────
export default function AllMedia({ endpoint = "/api/files/list", onSelect, single = true }) {
  const theme  = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [loading,  setLoading]  = useState(false);
  const [items,    setItems]    = useState([]);
  const [selected, setSelected] = useState(single ? null : []);
  const [page,     setPage]     = useState(1);
  const [meta,     setMeta]     = useState({ current_page: 1, last_page: 1, total: 0, per_page: 20 });
  const [reload,   setReload]   = useState(0);

  const pageCount = useMemo(() => {
    const last = Number(meta?.last_page ?? 1);
    return Number.isFinite(last) && last > 0 ? last : 1;
  }, [meta]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const resp    = await getAllMedia({ page });
        const body    = resp ?? {};
        const payload = body?.data ?? body;
        const list    = payload?.data ?? payload ?? [];
        if (mounted) {
          setItems(Array.isArray(list) ? list : []);
          if (payload && typeof payload === "object") {
            setMeta({
              current_page: payload.current_page ?? 1,
              last_page:    payload.last_page    ?? 1,
              total:        payload.total        ?? 0,
              per_page:     payload.per_page     ?? 20,
            });
          } else {
            setMeta({ current_page: 1, last_page: 1, total: Array.isArray(list) ? list.length : 0, per_page: 20 });
          }
        }
      } catch (err) {
        console.error("Failed to load media:", err);
        if (mounted) {
          setItems([]);
          setMeta({ current_page: 1, last_page: 1, total: 0, per_page: 20 });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [endpoint, page, reload]);

  useEffect(() => {
    setSelected(single ? null : []);
  }, [page, single]);

  const isChecked = (id) =>
    single
      ? String(selected) === String(id)
      : Array.isArray(selected) && selected.some((x) => String(x) === String(id));

  const toggle = (id) => {
    if (single) {
      const next = isChecked(id) ? null : id;
      setSelected(next);
      if (onSelect) {
        const item = items.find((it) => String(it.id) === String(id));
        onSelect(next ? item ?? null : null);
      }
      return;
    }
    setSelected((arr) => {
      const set = Array.isArray(arr) ? [...arr] : [];
      const idx = set.findIndex((x) => String(x) === String(id));
      if (idx >= 0) set.splice(idx, 1);
      else set.push(id);
      return set;
    });
  };

  const confirm = () => {
    if (!onSelect) return;
    if (single) {
      onSelect(items.find((it) => String(it.id) === String(selected)) ?? null);
      return;
    }
    const selectedItems = Array.isArray(selected)
      ? items.filter((it) => selected.some((id) => String(id) === String(it.id)))
      : [];
    onSelect(selectedItems);
  };

  const selectionCount = single
    ? (selected ? 1 : 0)
    : (Array.isArray(selected) ? selected.length : 0);

  const border = isDark ? "#334155" : "#e2e8f0";

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* ── Page header */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Media Library</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
            {meta.total ?? 0} files stored
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          {selectionCount > 0 && (
            <Chip
              label={`${selectionCount} selected`}
              size="small"
              sx={{ fontWeight: 600, background: "rgba(99,102,241,0.12)", color: "#6366f1" }}
              onDelete={() => setSelected(single ? null : [])}
            />
          )}
          <Button
            size="small"
            variant="outlined"
            onClick={() => setSelected(single ? null : [])}
            disabled={selectionCount === 0}
          >
            Clear
          </Button>
          {onSelect && (
            <Button
              size="small"
              variant="contained"
              onClick={confirm}
              disabled={selectionCount === 0}
            >
              Use Selected
            </Button>
          )}
        </Stack>
      </Stack>

      {/* ── Upload zone */}
      <Box
        sx={{
          mb: 3,
          p: 2.5,
          borderRadius: "14px",
          background: isDark ? "#1e293b" : "#ffffff",
          border: `1px solid ${border}`,
          boxShadow: isDark
            ? "0 1px 3px rgba(0,0,0,0.3)"
            : "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
        }}
      >
        <Typography variant="body2" fontWeight={700} sx={{ mb: 1.5, color: "text.primary" }}>
          Upload New Image
        </Typography>
        <UploadZone onUploadDone={() => { setPage(1); setReload((n) => n + 1); }} />
      </Box>

      {/* ── Grid */}
      {loading ? (
        <MediaSkeleton />
      ) : items.length === 0 ? (
        <EmptyState />
      ) : (
        <Grid container spacing={2}>
          {items.map((it) => {
            const src      = it?.url || (it?.file_name ? `${image_file_url}/${it.file_name}` : null);
            const name     = it.file_original_name || it.file_name || "Unnamed";
            const checked  = isChecked(it.id);

            return (
              <Grid key={it.id} item xs={6} sm={4} md={3} lg={2}>
                <Card
                  onClick={() => toggle(it.id)}
                  sx={{
                    cursor: "pointer",
                    overflow: "hidden",
                    position: "relative",
                    border: checked
                      ? "2px solid #6366f1"
                      : `1px solid ${border}`,
                    boxShadow: checked
                      ? "0 0 0 3px rgba(99,102,241,0.2)"
                      : undefined,
                    transition: "all 0.18s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: checked
                        ? "0 0 0 3px rgba(99,102,241,0.25), 0 8px 24px rgba(0,0,0,0.12)"
                        : "0 8px 24px rgba(0,0,0,0.1)",
                      "& .media-overlay": { opacity: 1 },
                    },
                  }}
                >
                  {/* Image */}
                  <Box sx={{ position: "relative", overflow: "hidden" }}>
                    <ImgWithFallback src={src} alt={name} height={130} />

                    {/* Hover overlay */}
                    <Box
                      className="media-overlay"
                      sx={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(15,23,42,0.45)",
                        opacity: checked ? 1 : 0,
                        transition: "opacity 0.18s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {checked && (
                        <CheckCircleIcon sx={{ color: "#6366f1", fontSize: 36, filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))" }} />
                      )}
                    </Box>

                    {/* Checkbox top-right */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        background: checked ? "#6366f1" : "rgba(255,255,255,0.85)",
                        borderRadius: "6px",
                        width: 22,
                        height: 22,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      <Checkbox
                        size="small"
                        checked={checked}
                        onChange={() => toggle(it.id)}
                        onClick={(e) => e.stopPropagation()}
                        sx={{
                          p: 0,
                          color: checked ? "#ffffff" : "rgba(0,0,0,0.5)",
                          "&.Mui-checked": { color: "#ffffff" },
                          "& .MuiSvgIcon-root": { fontSize: 16 },
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Footer */}
                  <Box
                    sx={{
                      px: 1.5,
                      py: 1,
                      background: isDark ? "#1e293b" : "#ffffff",
                      borderTop: `1px solid ${border}`,
                    }}
                  >
                    <Tooltip title={name} placement="top" arrow>
                      <Typography
                        variant="caption"
                        noWrap
                        sx={{
                          display: "block",
                          fontWeight: 600,
                          color: checked ? "#6366f1" : "text.primary",
                          lineHeight: 1.4,
                        }}
                      >
                        {name}
                      </Typography>
                    </Tooltip>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* ── Pagination */}
      {!loading && items.length > 0 && (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems="center"
          mt={4}
          gap={2}
          sx={{
            p: 2,
            borderRadius: "12px",
            background: isDark ? "#1e293b" : "#ffffff",
            border: `1px solid ${border}`,
          }}
        >
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Page <strong>{meta.current_page ?? page}</strong> of <strong>{pageCount}</strong>
            &nbsp;·&nbsp;{meta.total ?? 0} total files
          </Typography>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, v) => setPage(v)}
            color="primary"
            size="small"
            showFirstButton
            showLastButton
            sx={{
              "& .MuiPaginationItem-root": { fontWeight: 600, borderRadius: "8px" },
              "& .Mui-selected": { background: "#6366f1 !important", color: "#fff" },
            }}
          />
        </Stack>
      )}
    </Box>
  );
}

