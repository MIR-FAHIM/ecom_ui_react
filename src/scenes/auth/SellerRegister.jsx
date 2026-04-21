import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { registerSeller } from "../../api/controller/admin_controller/user_controller.jsx";

const initialForm = {
  name: "",
  email: "",
  password: "",
  user_type: "seller",
  phone: "",
  address: "",
  avatar: "",
  avatar_original: "",
  country: "",
  state: "",
  city: "",
  postal_code: "",
};

const SellerRegister = () => {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Seller Registration
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <Box component="form" onSubmit={handleSubmit} autoComplete="off">
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField label="Name" name="name" value={form.name} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Email" name="email" value={form.email} onChange={handleChange} fullWidth type="email" />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Password" name="password" value={form.password} onChange={handleChange} fullWidth type="password" required />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Phone" name="phone" value={form.phone} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Address" name="address" value={form.address} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Country" name="country" value={form.country} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="State" name="state" value={form.state} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="City" name="city" value={form.city} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Postal Code" name="postal_code" value={form.postal_code} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Avatar URL" name="avatar" value={form.avatar} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Avatar Original URL" name="avatar_original" value={form.avatar_original} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mt: 2 }}>
                  {loading ? <CircularProgress size={24} /> : "Register"}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default SellerRegister;
