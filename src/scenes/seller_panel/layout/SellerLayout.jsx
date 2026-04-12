import React, { useState } from "react";
import { Box, IconButton, Typography, Stack, Chip, useTheme } from "@mui/material";
import MenuOutlined from "@mui/icons-material/MenuOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import { Outlet } from "react-router-dom";
import SideBar from "./SideBar";

const SellerLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: isDark ? "#0f1117" : "#f8fafc" }}>
      <SideBar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top bar */}
        <Box
          sx={{
            px: { xs: 2, md: 3 },
            py: 1.2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: isDark ? "#161822" : "#fff",
            backdropFilter: "blur(12px)",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <IconButton
              onClick={() => setMobileOpen(true)}
              size="small"
              sx={{ display: { xs: "inline-flex", md: "none" }, bgcolor: isDark ? "#1e2030" : "#f1f5f9", "&:hover": { bgcolor: isDark ? "#262940" : "#e2e8f0" } }}
            >
              <MenuOutlined fontSize="small" />
            </IconButton>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: "#6366f1", display: "grid", placeItems: "center" }}>
                <StorefrontOutlinedIcon sx={{ fontSize: 18, color: "#fff" }} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: 15, letterSpacing: -0.3 }}>
                Seller Panel
              </Typography>
            </Stack>
          </Stack>
          <Chip label="v2.0" size="small" sx={{ fontWeight: 700, fontSize: 10, bgcolor: isDark ? "#1e2030" : "#f1f5f9", color: "text.secondary" }} />
        </Box>

        {/* Page content */}
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default SellerLayout;
