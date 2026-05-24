import React, { useContext, useState } from "react";
import {
  Box,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
  InputBase,
  Tooltip,
} from "@mui/material";
import {
  MenuOutlined,
  DarkModeOutlined,
  LightModeOutlined,
  NotificationsOutlined,
  SearchOutlined,
  LogoutOutlined,
  PersonOutlined,
  SettingsOutlined,
  PointOfSaleOutlined,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { ColorModeContext } from "../../../theme";
import { ToggledContext } from "../../../App";

const PAGE_TITLES = {
  "/admin":                          "Dashboard",
  "/admin/pos":                      "POS Management",
  "/ecom/product/add":               "Add Product",
  "/ecom/product/all":               "All Products",
  "/ecom/product/stock-out":         "Stock Out Products",
  "/ecom/product/attribute":         "Attributes",
  "/ecom/order/all":                 "All Orders",
  "/ecom/order/completed":           "Completed Orders",
  "/ecom/seller/add":                "Add Seller",
  "/ecom/seller/all":                "All Sellers",
  "/ecom/customer/add":              "Add Customer",
  "/ecom/customer/all":              "All Customers",
  "/ecom/delivery/add":              "Add Delivery Man",
  "/ecom/delivery/all":              "All Delivery Men",
  "/ecom/report/today":              "Today's Report",
  "/ecom/report/month-wise":         "Monthly Report",
  "/ecom/banner/add":                "Add Banner",
  "/ecom/media/all":                 "All Media",
  "/ecom/setting/website-logo":      "Website Settings",
  "/ecom/setting/shipping-cost":     "Shipping Cost",
  "/ecom/accounts/transactions":     "Ledgers",
  "/ecom/accounts/settlements":      "Settlements",
};

const Navbar = () => {
  const navigate                   = useNavigate();
  const location                   = useLocation();
  const theme                      = useTheme();
  const colorMode                  = useContext(ColorModeContext);
  const { toggled, setToggled }    = useContext(ToggledContext);
  const isMobile                   = useMediaQuery("(max-width:768px)");
  const isDark                     = theme.palette.mode === "dark";

  const [anchorEl, setAnchorEl]    = useState(null);

  const pageTitle = PAGE_TITLES[location.pathname] ?? "Admin Panel";

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userType");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("userType");
    navigate("/admin-login");
  };

  const navBg     = isDark ? "#1e293b" : "#ffffff";
  const border    = isDark ? "#334155" : "#e2e8f0";
  const inputBg   = isDark ? "rgba(255,255,255,0.05)" : "#f8fafc";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: { xs: 2, sm: 3 },
        height: 64,
        minHeight: 64,
        background: navBg,
        borderBottom: `1px solid ${border}`,
        flexShrink: 0,
        zIndex: 10,
      }}
    >
      {/* ── Left: hamburger + page title */}
      <Box display="flex" alignItems="center" gap={1.5}>
        {isMobile && (
          <IconButton size="small" onClick={() => setToggled(!toggled)} sx={{ color: "text.secondary" }}>
            <MenuOutlined fontSize="small" />
          </IconButton>
        )}
        <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, fontSize: { xs: 14, sm: 16 }, color: "text.primary", lineHeight: 1.2 }}
          >
            {pageTitle}
          </Typography>
          {!isMobile && (
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
              Admin Panel
            </Typography>
          )}
        </Box>
      </Box>

      {/* ── Right: actions */}
      <Box display="flex" alignItems="center" gap={0.5}>
        {/* Search (desktop) */}
        {!isMobile && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              background: inputBg,
              border: `1px solid ${border}`,
              borderRadius: "8px",
              px: 1.5,
              py: 0.6,
              mr: 1,
              width: 200,
              transition: "all 0.2s",
              "&:focus-within": {
                borderColor: "#6366f1",
                boxShadow: "0 0 0 3px rgba(99,102,241,0.12)",
                width: 240,
              },
            }}
          >
            <SearchOutlined sx={{ fontSize: 15, color: "text.disabled", mr: 0.5 }} />
            <InputBase
              placeholder="Search..."
              sx={{ fontSize: 13, flex: 1, color: "text.primary", "& input::placeholder": { color: "text.disabled" } }}
            />
          </Box>
        )}

        {/* Dark / Light toggle */}
        <Tooltip title={isDark ? "Light Mode" : "Dark Mode"}>
          <IconButton size="small" onClick={colorMode.toggleColorMode} sx={{ color: "text.secondary" }}>
            {isDark ? <LightModeOutlined fontSize="small" /> : <DarkModeOutlined fontSize="small" />}
          </IconButton>
        </Tooltip>

        {/* POS shortcut */}
        <Tooltip title="POS Management">
          <IconButton size="small" onClick={() => navigate("/admin/pos")} sx={{ color: "text.secondary" }}>
            <PointOfSaleOutlined fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* Notifications */}
        <Tooltip title="Notifications">
          <IconButton size="small" sx={{ color: "text.secondary" }}>
            <Badge color="error" variant="dot" invisible>
              <NotificationsOutlined fontSize="small" />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* User avatar */}
        <Box
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            ml: 0.5,
            pl: 1.5,
            borderLeft: `1px solid ${border}`,
            cursor: "pointer",
            borderRadius: "8px",
            py: 0.5,
            pr: 0.5,
            transition: "background 0.15s",
            "&:hover": { background: isDark ? "rgba(255,255,255,0.05)" : "rgba(99,102,241,0.06)" },
          }}
        >
          <Avatar sx={{ width: 32, height: 32, fontSize: 13 }}>A</Avatar>
          {!isMobile && (
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.primary", lineHeight: 1.2 }}>
                Admin
              </Typography>
              <Typography sx={{ fontSize: 11, color: "text.secondary", lineHeight: 1.2 }}>
                Administrator
              </Typography>
            </Box>
          )}
        </Box>

        {/* Dropdown menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          PaperProps={{
            sx: {
              mt: 1, minWidth: 190,
              border: `1px solid ${border}`,
              "& .MuiMenuItem-root": { px: 2, py: 1, gap: 1.5, fontSize: 13, fontWeight: 500 },
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "text.primary" }}>Admin</Typography>
            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>admin@example.com</Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => { navigate("/admin"); setAnchorEl(null); }}>
            <PersonOutlined fontSize="small" />  Profile
          </MenuItem>
          <MenuItem onClick={() => { navigate("/ecom/setting/website-logo"); setAnchorEl(null); }}>
            <SettingsOutlined fontSize="small" />  Settings
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={handleLogout}
            sx={{ color: "error.main", "&:hover": { background: "rgba(239,68,68,0.08)" } }}
          >
            <LogoutOutlined fontSize="small" />  Sign out
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Navbar;

