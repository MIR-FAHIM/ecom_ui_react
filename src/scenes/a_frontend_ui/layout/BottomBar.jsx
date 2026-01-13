import React from "react";
import { Box, Link, Typography } from "@mui/material";
import { useNavigate } from 'react-router-dom';

const BottomBar = () => {
  const navigate = useNavigate();
  return (
    <Box component="footer" sx={{ mt: 6, py: 2, borderTop: '1px solid #eee', display: 'flex', justifyContent: 'center', gap: 2 }}>
      <Link component="button" onClick={() => navigate('/ecom/privacy')}>Privacy Policy</Link>
      <Link component="button" onClick={() => navigate('/ecom/terms')}>Terms of Service</Link>
      <Link component="button" onClick={() => navigate('/ecom/contact')}>Contact</Link>
      <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>© {new Date().getFullYear()} Shop</Typography>
    </Box>
  );
};

export default BottomBar;
