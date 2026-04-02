import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Button,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import { registerEmployee } from "../../../api/controller/admin_controller/user_controller.jsx";

const AddCustomer = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",   
    role: "customer",
    mobile: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleChange = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name || !form.email || !form.password || !form.mobile) {
      setMsg("Please fill required fields.");
      return;
    }

    try {
      setLoading(true);
      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("email", form.email);
      payload.append("password", form.password);
      payload.append("role", form.role || "customer");
      payload.append("mobile", form.mobile);
      payload.append("address", form.address || "");

      const res = await registerEmployee(payload);
      const ok = res?.status === 200 || res?.status === "success" || res?.success === true;
      if (!ok) {
        setMsg(res?.message || "Registration failed.");
        return;
      }

      setMsg("Customer registered successfully.");
      setForm({ name: "", email: "", password: "", role: "customer", mobile: "", address: "" });
    } catch (error) {
      const apiMsg = error?.response?.data?.message;
      setMsg(apiMsg || "Something went wrong. Please try again.");
      console.error("Customer registration failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" fontWeight={800}>
          Add Customer
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Register a new customer account.
        </Typography>
      </Box>

      <Card sx={{ maxWidth: 720 }}>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={form.name}
                  onChange={handleChange("name")}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Mobile"
                  value={form.mobile}
                  onChange={handleChange("mobile")}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={form.password}
                  onChange={handleChange("password")}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={form.address}
                  onChange={handleChange("address")}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button type="submit" variant="contained" disabled={loading}>
                  {loading ? <CircularProgress size={18} color="inherit" /> : "Register Customer"}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      <Snackbar open={!!msg} autoHideDuration={3000} onClose={() => setMsg("")} message={msg} />
    </Box>
  );
};

export default AddCustomer;
