import React, { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Grid, Tabs, Tab, InputAdornment, IconButton, Snackbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const Login = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('email'); // 'email' | 'mobile'
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubmit = () => {
    if (mode === 'email') {
      if (!email || !password) { setMsg('Please provide email and password'); return; }
    } else {
      if (!mobile || !password) { setMsg('Please provide mobile and password'); return; }
    }
    // Mock login: store token and user id
    localStorage.setItem('authToken', 'demo-token');
    localStorage.setItem('userId', '1');
    setMsg('Login successful');
    setTimeout(() => navigate('/ecom'), 600);
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ mt: 8, p: 3 }} elevation={3}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>Welcome back</Typography>

        <Tabs value={mode} onChange={(e, v) => setMode(v)} sx={{ mb: 2 }}>
          <Tab label="Login with Email" value="email" />
          <Tab label="Login with Mobile" value="mobile" />
        </Tabs>

        <Grid container spacing={2}>
          {mode === 'email' ? (
            <>
              <Grid item xs={12}>
                <TextField fullWidth label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={12}>
                <TextField fullWidth label="Mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} />
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Password"
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShow((s) => !s)} edge="end">{show ? <VisibilityOff /> : <Visibility />}</IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button variant="text" onClick={() => navigate('/register')}>Register now</Button>
            <Button variant="contained" onClick={handleSubmit}>Login</Button>
          </Grid>

          <Grid item xs={12} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">Forgot password? <Button variant="text" onClick={() => alert('Forgot password flow not implemented (demo)')}>Reset</Button></Typography>
          </Grid>
        </Grid>

      </Paper>

      <Snackbar open={!!msg} autoHideDuration={2000} onClose={() => setMsg('')} message={msg} />
    </Container>
  );
};

export default Login;
