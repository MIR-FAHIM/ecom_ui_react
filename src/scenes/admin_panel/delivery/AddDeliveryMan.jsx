import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  Snackbar,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import VisibilityOutlined        from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlined     from "@mui/icons-material/VisibilityOffOutlined";
import ArrowBackOutlined         from "@mui/icons-material/ArrowBackOutlined";
import { useNavigate } from "react-router-dom";
import { registerEmployee } from "../../../api/controller/admin_controller/user_controller";

const INITIAL = {
  name: "", email: "", password: "", phone: "",
  address: "", country: "", state: "", city: "", postal_code: "",
};

export default function AddDeliveryMan() {
  const theme   = useTheme();
  const isDark  = theme.palette.mode === "dark";
  const navigate = useNavigate();

  const [form,     setForm]     = useState(INITIAL);
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState({});
  const [snack,    setSnack]    = useState({ open: false, msg: "", severity: "success" });

  const border = isDark ? "#334155" : "#e2e8f0";

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.password || form.password.length < 6)
      errs.password = "Password must be at least 6 characters.";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email address.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const payload = { ...form, user_type: "delivery_boy" };
      Object.keys(payload).forEach((k) => { if (payload[k] === "") delete payload[k]; });
      await registerEmployee(payload);
      setSnack({ open: true, msg: "Delivery man created successfully!", severity: "success" });
      setForm(INITIAL);
      setTimeout(() => navigate("/ecom/delivery/all"), 1500);
    } catch (err) {
      const msgs = err?.response?.data?.errors;
      if (msgs && typeof msgs === "object") {
        const fieldErrors = {};
        Object.entries(msgs).forEach(([k, v]) => { fieldErrors[k] = Array.isArray(v) ? v[0] : v; });
        setErrors(fieldErrors);
      }
      setSnack({ open: true, msg: err?.response?.data?.message || "Failed to create delivery man.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const F = (label, name, opts = {}) => (
    <TextField
      fullWidth
      label={label}
      name={name}
      value={form[name]}
      onChange={onChange}
      error={!!errors[name]}
      helperText={errors[name] || ""}
      size="small"
      {...opts}
    />
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={3} flexWrap="wrap" gap={1}>
        <IconButton size="small" onClick={() => navigate(-1)} sx={{ border: `1px solid ${border}`, borderRadius: "8px" }}>
          <ArrowBackOutlined fontSize="small" />
        </IconButton>
        <Box
          sx={{
            width: 42, height: 42, borderRadius: "11px",
            background: "rgba(16,185,129,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <LocalShippingOutlinedIcon sx={{ color: "#10b981" }} />
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={800}>Add Delivery Man</Typography>
          <Typography variant="body2" color="text.secondary">Register a new delivery personnel account</Typography>
        </Box>
      </Stack>

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2.5}>

          {/* ── Account Info */}
          <Grid item xs={12} md={7}>
            <Card
              sx={{
                p: 2.5,
                border: `1px solid ${border}`,
                boxShadow: isDark ? "0 1px 3px rgba(0,0,0,0.3)" : "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <Typography variant="body2" fontWeight={700} mb={2.5} color="text.primary"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Box component="span" sx={{ width: 3, height: 16, borderRadius: 4, background: "#6366f1", display: "inline-block" }} />
                Account Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>{F("Full Name", "name")}</Grid>
                <Grid item xs={12} sm={6}>{F("Email Address", "email", { type: "email" })}</Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={onChange}
                    error={!!errors.password}
                    helperText={errors.password || "Min. 6 characters"}
                    size="small"
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setShowPass((s) => !s)} edge="end">
                            {showPass
                              ? <VisibilityOffOutlined fontSize="small" />
                              : <VisibilityOutlined fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>{F("Phone", "phone", { type: "tel" })}</Grid>
                <Grid item xs={12}>{F("Address", "address", { multiline: true, rows: 2 })}</Grid>
              </Grid>
            </Card>
          </Grid>

          {/* ── Location */}
          <Grid item xs={12} md={5}>
            <Card
              sx={{
                p: 2.5,
                border: `1px solid ${border}`,
                boxShadow: isDark ? "0 1px 3px rgba(0,0,0,0.3)" : "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <Typography variant="body2" fontWeight={700} mb={2.5} color="text.primary"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Box component="span" sx={{ width: 3, height: 16, borderRadius: 4, background: "#f59e0b", display: "inline-block" }} />
                Location
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>{F("Country", "country")}</Grid>
                <Grid item xs={12} sm={6}>{F("State", "state")}</Grid>
                <Grid item xs={12} sm={6}>{F("City", "city")}</Grid>
                <Grid item xs={12} sm={6}>{F("Postal Code", "postal_code")}</Grid>
              </Grid>
            </Card>
          </Grid>

          {/* ── Actions */}
          <Grid item xs={12}>
            <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
              <Button
                variant="outlined"
                onClick={() => navigate(-1)}
                disabled={loading}
                sx={{ borderRadius: "8px", px: 3 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
                sx={{ borderRadius: "8px", px: 4, minWidth: 170 }}
              >
                {loading ? "Creating…" : "Create Delivery Man"}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snack.severity}
          variant="filled"
          sx={{ borderRadius: "10px" }}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
