import React, { useState } from "react";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import MenuOutlined from "@mui/icons-material/MenuOutlined";
import { Outlet } from "react-router-dom";
import { tokens } from "../../../theme";
import SideBar from "./SideBar";

const SellerLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <SideBar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Box
          sx={{
            px: { xs: 2, md: 3 },
            py: 1.6,
            display: "flex",
            alignItems: "center",
            gap: 1.2,
            borderBottom: `1px solid ${colors.primary[300]}`,
            background: `linear-gradient(90deg, ${colors.primary[400]}, ${colors.primary[500]})`,
          }}
        >
          <IconButton
            onClick={() => setMobileOpen(true)}
            sx={{ display: { xs: "inline-flex", md: "none" }, color: colors.gray[200] }}
          >
            <MenuOutlined />
          </IconButton>
          <Typography sx={{ fontWeight: 900, letterSpacing: -0.3, color: colors.gray[100] }}>
            Seller Dashboard
          </Typography>
        </Box>

        <Box sx={{ flex: 1, overflowY: "auto" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default SellerLayout;
