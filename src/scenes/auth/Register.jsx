import React, { useState } from 'react';
import { Container, Box, Paper, Typography, TextField, Button, Grid, Snackbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleRegister = () => {
    if (!name || (!email && !mobile) || !password) {
      setMsg('Please fill required fields');
      return;
    }
    if (password !== confirm) {
      setMsg('Passwords do not match');
      return;
    }
    // Mock register - store in localStorage (demo)
    const user = { id: Date.now(), name, email, mobile };
    localStorage.setItem('user', JSON.stringify(user));
    setMsg('Registration successful. You can now login.');
    setTimeout(() => navigate('/login'), 900);
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
            <TextField fullWidth label="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Mobile (optional)" value={mobile} onChange={(e) => setMobile(e.target.value)} />
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
            <Button variant="contained" onClick={handleRegister}>Register</Button>
          </Grid>
        </Grid>
      </Paper>

      <Snackbar open={!!msg} autoHideDuration={3000} onClose={() => setMsg('')} message={msg} />
    </Container>
  );
};

export default Register;