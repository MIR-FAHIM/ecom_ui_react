import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const Blogs = () => (
  <Box sx={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", background: (theme) => theme.palette.background.default }}>
    <Paper elevation={2} sx={{ p: 5, borderRadius: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, minWidth: 320 }}>
      <InfoOutlinedIcon sx={{ fontSize: 48, color: "#f5d000" }} />
      <Typography variant="h5" sx={{ color: "text.secondary", fontWeight: 700, mb: 1 }}>
        No blogs available
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", opacity: 0.7, textAlign: "center" }}>
        There are currently no blogs added. Please check back later for updates and new articles.
      </Typography>
    </Paper>
  </Box>
);

export default Blogs;
