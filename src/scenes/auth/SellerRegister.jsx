import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  InputAdornment,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Link,
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { registerSeller } from "../../api/controller/admin_controller/user_controller.jsx";

const initialForm = {
  name: "",
  shop_name: "",
  email: "",
  password: "",
  user_type: "seller",
  phone: "",
  address: "",
};

const SellerRegister = () => {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setError("Please agree to the Terms and Conditions");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await registerSeller(form);
      if (res?.status === "success") {
        setSuccess("Seller registered successfully!");
        setForm(initialForm);
      } else {
        setError(res?.message || "Registration failed");
      }
    } catch (err) {
      setError(err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        py: 4,
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
          }}
        >
          {/* Header Banner */}
          <Box
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              py: 4,
              px: 4,
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                bgcolor: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2,
              }}
            >
              <StorefrontIcon sx={{ fontSize: 32, color: "#fff" }} />
            </Box>
            <Typography variant="h5" fontWeight={700} color="#fff">
              Become a Seller
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", mt: 0.5 }}>
              Create your seller account to start selling
            </Typography>
          </Box>

          <CardContent sx={{ px: 4, py: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                {success}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} autoComplete="off">
              <Grid container spacing={2.5}>
                {/* Personal Info Section */}
                <Grid item xs={12}>
                  <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
                    Personal Information
                  </Typography>
                  <Divider sx={{ mt: 0.5, mb: 1 }} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Full Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonOutlineIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Shop Name"
                    name="shop_name"
                    value={form.shop_name}
                    onChange={handleChange}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonOutlineIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    fullWidth
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneOutlinedIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Email Address"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    fullWidth
                    type="email"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlinedIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    fullWidth
                    type="password"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlinedIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Address Section */}
                <Grid item xs={12}>
                  <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
                    Address
                  </Typography>
                  <Divider sx={{ mt: 0.5, mb: 1 }} />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={2}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1.5 }}>
                          <LocationOnOutlinedIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        color="primary"
                        sx={{
                          color: '#1976d2',
                          '&.Mui-checked': {
                            color: '#1976d2',
                          },
                        }}
                      />
                    }
                    label={
                      <Typography variant="body2">
                        I agree to the{' '}
                        <Link href="/privacy" target="_blank" underline="hover">
                          <span style={{ color: '#1976d2' }}>Terms and Conditions</span>
                        </Link>
                      </Typography>
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loading}
                    sx={{
                      mt: 1,
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 600,
                      fontSize: "1rem",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      boxShadow: "0 4px 15px rgba(102,126,234,0.4)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)",
                        boxShadow: "0 6px 20px rgba(102,126,234,0.5)",
                      },
                    }}
                  >
                    {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Create Seller Account"}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default SellerRegister;
