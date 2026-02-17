import React, { useEffect, useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Button,
  Stack,
  Chip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  DashboardOutlined,
  Inventory2Outlined,
  ShoppingCartOutlined,
  InsightsOutlined,
  AccountBalanceWalletOutlined,
  StorefrontOutlined,
  SettingsOutlined,
  SupportAgentOutlined,
} from "@mui/icons-material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { tokens } from "../../../theme";
import { getUserDetail } from "../../../api/controller/admin_controller/user_controller";

const drawerWidth = 264;

const navGroups = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", icon: <DashboardOutlined />, path: "/seller/dashboard" },
      { label: "Analytics", icon: <InsightsOutlined />, path: "/seller/dashboard" },
    ],
  },
  {
    title: "Commerce",
    items: [
      { label: "Shops", icon: <Inventory2Outlined />, path: "/seller/shops" },
      // { label: "Products", icon: <Inventory2Outlined />, path: "/seller/products" },
      { label: "Orders", icon: <ShoppingCartOutlined />, path: "/seller/orders" },
    
    ],
  },
  {
    title: "Accounting",
    items: [
     
      { label: "Account", icon: <AccountBalanceWalletOutlined />, path: "/seller/accounting" },
      { label: "Transaction", icon: <AccountBalanceWalletOutlined />, path: "/seller/transaction" },
    ],
  },
  {
    title: "Store",
    items: [
      // { label: "Shop Profile", icon: <StorefrontOutlined />, path: "/seller/shop" },
      // { label: "Settings", icon: <SettingsOutlined />, path: "/seller/settings" },
      // { label: "Support", icon: <SupportAgentOutlined />, path: "/seller/support" },
    ],
  },
];

const SideBar = ({ mobileOpen = false, onMobileClose }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const location = useLocation();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Seller");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedId = localStorage.getItem("userId");
        if (!storedId) {
          setUserName("Seller");
          return;
        }

        const res = await getUserDetail(storedId);
        const user = res?.data?.data ?? res?.data ?? null;
        const name = user?.name || user?.full_name || user?.user_name;
        setUserName(name || "Seller");
      } catch (e) {
        console.error("Failed to load seller name", e);
        setUserName("Seller");
      }
    };

    loadUser();
    const onAuth = () => loadUser();
    window.addEventListener("auth-changed", onAuth);

    return () => window.removeEventListener("auth-changed", onAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    setUserName("Seller");
    window.dispatchEvent(new Event("auth-changed"));
    navigate("/");
  };

  const renderItem = (item) => {
    const active = location.pathname === item.path;

    return (
      <ListItemButton
        key={item.label}
        component={Link}
        to={item.path}
        sx={{
          borderRadius: 2,
          mb: 0.6,
          color: active ? colors.blueAccent[500] : colors.gray[200],
          backgroundColor: active ? colors.primary[300] : "transparent",
          border: active ? `1px solid ${colors.blueAccent[400]}` : "1px solid transparent",
          "&:hover": {
            backgroundColor: colors.primary[300],
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 36,
            color: active ? colors.blueAccent[500] : colors.gray[200],
          }}
        >
          {item.icon}
        </ListItemIcon>
        <ListItemText
          primary={item.label}
          primaryTypographyProps={{
            fontWeight: active ? 700 : 600,
            fontSize: 13,
            letterSpacing: 0.2,
          }}
        />
      </ListItemButton>
    );
  };

  const content = (
    <Box
      sx={{
        height: "100%",
        background: `linear-gradient(180deg, ${colors.primary[400]}, ${colors.primary[500]})`,
        color: colors.gray[100],
        px: 2,
        py: 2.5,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Box>
        <Typography variant="subtitle2" sx={{ color: colors.blueAccent[400], fontWeight: 900 }}>
          Seller Console
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: -0.4 }}>
          {userName}
        </Typography>
        <Button
          size="small"
          onClick={handleLogout}
          sx={{
            mt: 1,
            textTransform: "none",
            fontWeight: 800,
            color: colors.gray[100],
            border: `1px solid ${colors.redAccent[300]}`,
            borderRadius: 999,
            px: 2,
            "&:hover": { backgroundColor: colors.primary[300] },
          }}
        >
          Logout
        </Button>
      
      </Box>

      <Divider sx={{ borderColor: colors.primary[300] }} />

      <Box sx={{ flex: 1, overflowY: "auto", pr: 0.5 }}>
        {navGroups.map((group) => (
          <Box key={group.title} sx={{ mb: 2 }}>
            <Typography
              variant="overline"
              sx={{
                color: colors.gray[400],
                fontWeight: 900,
                letterSpacing: 1.4,
              }}
            >
              {group.title}
            </Typography>
            <List sx={{ mt: 0.6 }}>{group.items.map(renderItem)}</List>
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          borderRadius: 3,
          p: 2,
          border: `1px solid ${colors.primary[300]}`,
          background: `linear-gradient(135deg, ${colors.primary[300]}, ${colors.primary[400]})`,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              Store Status
            </Typography>
            <Typography variant="caption" sx={{ color: colors.gray[300] }}>
              Online and accepting orders
            </Typography>
          </Box>
          <Chip
            size="small"
            label="Live"
            sx={{
              backgroundColor: colors.greenAccent[500],
              color: colors.gray[900],
              fontWeight: 800,
            }}
          />
        </Stack>
      </Box>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
      {!isDesktop && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onMobileClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              borderRight: `1px solid ${colors.primary[300]}`,
            },
          }}
        >
          {content}
        </Drawer>
      )}

      {isDesktop && (
        <Drawer
          variant="permanent"
          open
          sx={{
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              borderRight: `1px solid ${colors.primary[300]}`,
            },
          }}
        >
          {content}
        </Drawer>
      )}
    </Box>
  );
};

export default SideBar;
