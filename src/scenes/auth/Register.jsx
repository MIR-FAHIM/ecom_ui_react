import React, { useEffect, useState } from 'react';
import { Container, Box, Paper, Typography, TextField, Button, Grid, Snackbar, MenuItem, CircularProgress } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { registerEmployee } from "../../api/controller/admin_controller/user_controller";
import { loginController } from "../../api/controller/admin_controller/user_controller";

const Register = () => {
  const location = useLocation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState(location.state?.phoneNumber || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.phoneNumber) {
      setMobile(location.state.phoneNumber);
    }
  }, [location.state?.phoneNumber]);

  const handleRegister = async () => {
    if (!name || !email || !mobile || !password || !role) {
      setMsg('Please fill required fields');
      return;
    }
    if (password !== confirm) {
      setMsg('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append('name', name);
      form.append('email', email);
      form.append('password', password);
      form.append('role', role);
      form.append('phone', mobile);


      const res = await registerEmployee(form);
      const ok = res?.status === 200 || res?.status === 'success' || res?.success === true;
      if (!ok) {
        setMsg(res?.message || 'Registration failed');
        return;
      }

      const loginPayload = email ? { email, password } : { phone: mobile, password };
      const loginRes = await loginController(loginPayload);
      const loginOk =
        loginRes?.status === 200 ||
        loginRes?.status === 'success' ||
        loginRes?.success === true;

      if (!loginOk) {
        setMsg(res?.message || 'Registration successful. You can now login.');
        setTimeout(() => navigate('/login'), 900);
        return;
      }

      const token = loginRes?.token || loginRes?.data?.token || loginRes?.data?.access_token;
      const userId = loginRes?.user?.id || loginRes?.data?.user?.id || loginRes?.data?.id;

      if (!token || !userId) {
        setMsg('Registration successful but login token/user is missing.');
        setTimeout(() => navigate('/login'), 900);
        return;
      }

      localStorage.setItem('authToken', token);
      localStorage.setItem('userId', userId);
      navigate('/');
    } catch (err) {
      console.error(err);
      const emailError = err?.response?.data?.errors?.email;
      const message = Array.isArray(emailError) ? emailError[0] : emailError;
      setMsg(message || err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ mt: 6, p: 3 }} elevation={3}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>Create an account</Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField fullWidth label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              select
            >
              <MenuItem value="customer">Customer</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Confirm password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </Grid>

          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="body2">Already registered?</Typography>
              <Button variant="text" onClick={() => navigate('/login')}>Login now</Button>
            </Box>
            <Button variant="contained" onClick={handleRegister} disabled={loading}>
              {loading ? <CircularProgress size={18} color="inherit" /> : 'Register'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Snackbar open={!!msg} autoHideDuration={3000} onClose={() => setMsg('')} message={msg} />
    </Container>
  );
};

export default Register;