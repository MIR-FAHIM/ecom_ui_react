import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import BoltIcon from "@mui/icons-material/Bolt";

const FlashSale = () => (
  <Box sx={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", background: (theme) => theme.palette.background.default }}>
    <Paper elevation={2} sx={{ p: 5, borderRadius: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, minWidth: 320 }}>
      <BoltIcon sx={{ fontSize: 48, color: "#f5d000" }} />
      <Typography variant="h5" sx={{ color: "text.secondary", fontWeight: 700, mb: 1 }}>
        No flash deal available
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", opacity: 0.7, textAlign: "center" }}>
        There are currently no flash sales. Please check back later for exciting deals!
      </Typography>
    </Paper>
  </Box>
);

export default FlashSale;
