import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  FormControlLabel,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { tokens } from "../../../theme";
import { addBanner, getBanner } from "../../../api/controller/admin_controller/media/banner_controller";
import { image_file_url } from "../../../api/config";
import AllMedia from "./AllMedia";

export default function AddBanner() {
  const [form, setForm] = useState({ banner_name: "", title: "", related_product_id: "", note: "", image: null, image_id: null });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [banners, setBanners] = useState([]);
  const [mediaOpen, setMediaOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getBanner();
        const list = res?.data?.data ?? res?.data ?? (Array.isArray(res) ? res : []);
        setBanners(list);
      } catch (e) {
        console.error(e);
        setError("Failed to load banners");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!form.image) return setPreview(null);
    // preview is driven by selected `image_id` from media library
    // keep preview unchanged here
  }, [form.image]);

  // if image_id set (selected from library), show its preview
  useEffect(() => {
    if (!form.image_id) return;
    // try to build url from image_id by checking banners list or leave as null
    const existing = banners.find((b) => String(b.image?.id) === String(form.image_id) || String(b.image_id) === String(form.image_id));
    if (existing && existing.image) {
      const url = existing.image.url || (existing.image.file_name ? `${image_file_url}/${existing.image.file_name}` : null);
      setPreview(url);
    }
  }, [form.image_id, banners]);

  const handleChange = (key) => (e) => {
    const val = e.target.value;
    setForm((p) => ({ ...p, [key]: val }));
  };

  const handleSelectMedia = (item) => {
    // item can be null or media object (when single)
    if (!item) return;
    setForm((p) => ({ ...p, image_id: item.id, image: null }));
    const url = item.url || (item.file_name ? `${image_file_url}/${item.file_name}` : null);
    setPreview(url);
    setMediaOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.banner_name.trim()) return setError("Banner name is required");

    try {
      setSaving(true);
      const fd = new FormData();
      fd.append("banner_name", form.banner_name);
      fd.append("title", form.title);
      fd.append("related_product_id", form.related_product_id);
      fd.append("note", form.note);
      if (form.image) fd.append("image", form.image);
      if (form.image_id) fd.append("image_id", form.image_id);

      const resp = await addBanner(fd);

      // If response object contains data, show success
      setSuccess(resp?.data?.message || "Banner added");

      // reload banners
      const res = await getBanner();
      const list = Array.isArray(res) ? res : res?.data || res?.data?.data || [];
      setBanners(list);

      // reset form
      setForm({ banner_name: "", title: "", related_product_id: "", note: "", image: null, image_id: null });
      setPreview(null);
    } catch (err) {
      console.error("Add banner error:", err);
      setError(err.response?.data?.message || err.message || "Failed to add banner");
    } finally {
      setSaving(false);
    }
  };

  const styles = { container: { p: 3 } };

  return (
    <Box sx={styles.container}>
      <Typography variant="h4" gutterBottom fontWeight={800}>
        Add Banner
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Banner Name"
                  fullWidth
                  size="small"
                  value={form.banner_name}
                  onChange={(e) => setForm((p) => ({ ...p, banner_name: e.target.value }))}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Title"
                  fullWidth
                  size="small"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Related Product ID"
                  fullWidth
                  size="small"
                  value={form.related_product_id}
                  onChange={(e) => setForm((p) => ({ ...p, related_product_id: e.target.value }))}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Button variant="contained" fullWidth onClick={() => setMediaOpen(true)}>
                  Choose From Library
                </Button>
                {preview && (
                  <Box sx={{ mt: 1 }}>
                    <img src={preview} alt="preview" style={{ width: 160, height: 90, objectFit: "cover", borderRadius: 4 }} />
                  </Box>
                )}
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Note"
                  fullWidth
                  size="small"
                  multiline
                  minRows={2}
                  value={form.note}
                  onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button type="submit" variant="contained" disabled={saving}>
                    {saving ? <CircularProgress size={20} /> : "Add Banner"}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setForm({ banner_name: "", title: "", related_product_id: "", note: "", image: null, image_id: null });
                      setPreview(null);
                    }}
                  >
                    Reset
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      <Dialog open={mediaOpen} onClose={() => setMediaOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle>Select media</DialogTitle>
        <DialogContent>
          <AllMedia endpoint="/api/files/list" onSelect={handleSelectMedia} single={true} />
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={700}>
            Active Banners
          </Typography>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Related Product</TableCell>
                    <TableCell>Image</TableCell>
                    <TableCell>Note</TableCell>
                    <TableCell>Active</TableCell>
                    <TableCell>Created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {banners.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>{b.id}</TableCell>
                      <TableCell>{b.banner_name}</TableCell>
                      <TableCell>{b.title}</TableCell>
                      <TableCell>{b.product?.name || "-"}</TableCell>
                      <TableCell>
                        {(() => {
                          const imgObj = b.image ?? null;
                          const imgPath = b.image_path || (imgObj?.file_name ? `${image_file_url}/${imgObj.file_name}` : null) || imgObj?.url || null;
                          if (!imgPath) return "-";
                          const src = imgPath.startsWith("http") ? imgPath : imgPath;
                          return (
                            <img src={src} alt={b.banner_name} style={{ width: 120, height: 60, objectFit: "cover", borderRadius: 4 }} />
                          );
                        })()}
                      </TableCell>
                      <TableCell>{b.note}</TableCell>
                      <TableCell>{b.is_active ? "Yes" : "No"}</TableCell>
                      <TableCell>{new Date(b.created_at).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
