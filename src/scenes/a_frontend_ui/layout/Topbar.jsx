import React, { useEffect, useMemo, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Badge,
  TextField,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Tooltip,
  Avatar,
  Chip,
  InputAdornment,
  useTheme,
} from "@mui/material";

import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SearchIcon from "@mui/icons-material/Search";
import BoltIcon from "@mui/icons-material/Bolt";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import HistoryIcon from "@mui/icons-material/History";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PersonIcon from "@mui/icons-material/Person";
import StorefrontIcon from "@mui/icons-material/Storefront";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { useNavigate } from "react-router-dom";
import { getUserDetail } from "../../../api/controller/admin_controller/user_controller.jsx";
import { getUserWish } from "../../../api/controller/admin_controller/wishlist/wish_controller";

const Topbar = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  // Theme helpers (works with the theme I gave you)
  const brand = theme.palette.brand || {};
  const semantic = theme.palette.semantic || {};
  const border = theme.palette.divider || "rgba(255,255,255,0.12)";
  const glass = semantic.surface || "rgba(255,255,255,0.06)";
  const glass2 = semantic.surface2 || "rgba(255,255,255,0.09)";

  const [cartCount, setCartCount] = useState(0);
  const [wishCount, setWishCount] = useState(0);

  const [query, setQuery] = useState("");
  const [user, setUser] = useState(null);

  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const initials = useMemo(() => {
    const n = (user?.name || "").trim();
    if (!n) return "U";
    const parts = n.split(" ").filter(Boolean);
    const a = (parts[0] || "U").slice(0, 1);
    const b = (parts[1] || "").slice(0, 1);
    return (a + b).toUpperCase();
  }, [user?.name]);

  const loadCounts = () => {
    try {
      const raw = localStorage.getItem("cart");
      const parsed = raw ? JSON.parse(raw) : 0;
      if (Array.isArray(parsed)) setCartCount(parsed.length);
      else setCartCount(Number(parsed || 0));
    } catch {
      setCartCount(0);
    }

    try {
      const storedId = localStorage.getItem("userId");
      if (storedId) {
        (async () => {
          try {
            const res = await getUserWish(storedId);
            const payload = res?.data?.data ?? res?.data ?? res ?? [];
            const items = Array.isArray(payload) ? payload.map((e) => e?.product ?? e).filter(Boolean) : [];
            setWishCount(items.length);
          } catch (e) {
            // API failed - show zero for wishlist (no localStorage fallback)
            setWishCount(0);
          }
        })();
      } else {
        // not authenticated: no persistent wishlist, show 0
        setWishCount(0);
      }
    } catch {
      setWishCount(0);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedId = localStorage.getItem("userId");
        if (!storedId) return setUser(null);

        const res = await getUserDetail(storedId);
        const u = res?.data?.data ?? res?.data ?? null;
        setUser(u || null);
      } catch (e) {
        console.error("Failed to load user detail", e);
        setUser(null);
      }
    };

    loadUser();
    loadCounts();

    const onAuth = () => loadUser();
    const onCart = () => loadCounts();
    const onWish = () => loadCounts();

    window.addEventListener("auth-changed", onAuth);
    window.addEventListener("cart-updated", onCart);
    window.addEventListener("wishlist-updated", onWish);

    return () => {
      window.removeEventListener("auth-changed", onAuth);
      window.removeEventListener("cart-updated", onCart);
      window.removeEventListener("wishlist-updated", onWish);
    };
  }, []);

  const handleUserClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    setUser(null);
    handleMenuClose();
    window.dispatchEvent(new Event("auth-changed"));
    navigate("/");
  };

  const handleSearch = () => {
    const q = (query || "").trim();
    navigate("/");
    window.dispatchEvent(new CustomEvent("search", { detail: q }));
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const pillIconSx = {
    borderRadius: 3,
    border: `1px solid ${border}`,
    background: glass,
    "&:hover": { background: glass2 },
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        mb: 2,
        borderBottom: `1px solid ${border}`,
        background: theme.palette.mode === "dark"
          ? `radial-gradient(1200px 260px at 10% 0%, rgba(251,239,118,0.10), transparent 55%),
             radial-gradient(1200px 260px at 90% 0%, rgba(250,92,92,0.10), transparent 55%),
             rgba(12,12,18,0.72)`
          : `radial-gradient(1200px 260px at 10% 0%, rgba(251,239,118,0.20), transparent 55%),
             radial-gradient(1200px 260px at 90% 0%, rgba(250,92,92,0.16), transparent 55%),
             rgba(255,255,255,0.78)`,
        backdropFilter: "blur(14px)",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          gap: 2,
          justifyContent: "space-between",
          py: 1.1,
        }}
      >
        {/* Left: Brand */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, minWidth: 220 }}>
          <IconButton
            onClick={() => navigate("/")}
            sx={{
              width: 40,
              height: 40,
              borderRadius: 3,
              border: `1px solid ${border}`,
              background: glass,
              "&:hover": { background: glass2, transform: "translateY(-1px)" },
              transition: "transform 120ms ease",
            }}
          >
            <BoltIcon />
          </IconButton>

          <Box onClick={() => navigate("/")} sx={{ cursor: "pointer", userSelect: "none", lineHeight: 1.05 }}>
            <Typography
              sx={{
                fontWeight: 950,
                letterSpacing: -0.7,
                background: brand.gradient || `linear-gradient(90deg, #FA5C5C, #FD8A6B, #FEC288, #FBEF76)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              ShopLogo
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 800 }}>
              Trendy picks, fast checkout
            </Typography>
          </Box>
        </Box>

        {/* Middle: Search */}
        <Box sx={{ flex: 1, maxWidth: 820, display: { xs: "none", sm: "block" } }}>
          <TextField
            size="small"
            placeholder="Search products by name or SKU"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ opacity: 0.75 }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    onClick={handleSearch}
                    size="small"
                    variant="contained"
                    sx={{
                      borderRadius: 999,
                      textTransform: "none",
                      fontWeight: 900,
                      px: 2,
                      boxShadow: "none",
                      background: brand.gradient || `linear-gradient(90deg, #FA5C5C, #FD8A6B, #FEC288, #FBEF76)`,
                      "&:hover": { filter: "saturate(1.08)", boxShadow: "none" },
                    }}
                  >
                    Search
                  </Button>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 999,
                background: glass,
                border: `1px solid ${border}`,
                "& fieldset": { borderColor: "transparent" },
                "&:hover": { background: glass2 },
                "&.Mui-focused": {
                  background: glass2,
                  borderColor: theme.palette.primary.main,
                },
              },
            }}
          />
        </Box>

        {/* Right: Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title="Become Seller">
            <IconButton onClick={() => navigate("/seller/add")} sx={{ ...pillIconSx, display: { xs: "none", md: "inline-flex" } }}>
              <StorefrontIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="About">
            <IconButton onClick={() => navigate("/about")} sx={{ ...pillIconSx, display: { xs: "none", md: "inline-flex" } }}>
              <InfoOutlinedIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Wishlist">
            <IconButton onClick={() => navigate("/wish")} sx={pillIconSx}>
              <Badge badgeContent={wishCount} color="secondary">
                <FavoriteIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Cart (highlighted, brand gradient) */}
          <Tooltip title="Cart">
            <IconButton
              onClick={() => navigate("/cart")}
              sx={{
                borderRadius: 3,
                border: `1px solid ${border}`,
                background: brand.gradient || `linear-gradient(90deg, #FA5C5C, #FD8A6B, #FEC288, #FBEF76)`,
                color: "#111",
                boxShadow: semantic.shadow || "0 16px 36px rgba(0,0,0,0.16)",
                "&:hover": { filter: "saturate(1.08)", transform: "translateY(-1px)" },
                transition: "transform 120ms ease, filter 180ms ease",
              }}
            >
              <Badge badgeContent={cartCount} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Profile */}
          {user ? (
            <>
              <Tooltip title="Account">
                <Button
                  onClick={handleUserClick}
                  aria-controls={menuOpen ? "user-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={menuOpen ? "true" : undefined}
                  sx={{
                    ml: 0.4,
                    borderRadius: 999,
                    textTransform: "none",
                    fontWeight: 900,
                    border: `1px solid ${border}`,
                    background: glass,
                    px: 1.2,
                    gap: 1,
                    "&:hover": { background: glass2 },
                  }}
                  startIcon={
                    <Avatar
                      sx={{
                        width: 26,
                        height: 26,
                        fontSize: 12,
                        fontWeight: 900,
                        background: brand.gradient || `linear-gradient(135deg, #FA5C5C, #FBEF76)`,
                        color: "#111",
                        border: `1px solid ${border}`,
                      }}
                    >
                      {initials}
                    </Avatar>
                  }
                >
                  <Box sx={{ display: { xs: "none", md: "block" } }}>
                    {user?.name || "Profile"}
                  </Box>
                </Button>
              </Tooltip>

              <Menu
                id="user-menu"
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                PaperProps={{
                  sx: {
                    mt: 1,
                    borderRadius: 4,
                    minWidth: 250,
                    overflow: "hidden",
                    border: `1px solid ${border}`,
                    background: theme.palette.mode === "dark" ? "rgba(20,20,28,0.92)" : "rgba(255,255,255,0.94)",
                    backdropFilter: "blur(14px)",
                  },
                }}
              >
                <Box sx={{ px: 2, pt: 2, pb: 1 }}>
                  <Typography sx={{ fontWeight: 950 }}>{user?.name || "Account"}</Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                    {user?.email || " "}
                  </Typography>

                  <Box sx={{ mt: 1 }}>
                    <Chip
                      size="small"
                      label="Verified"
                      sx={{
                        borderRadius: 999,
                        fontWeight: 900,
                        background: glass,
                        border: `1px solid ${border}`,
                      }}
                    />
                  </Box>
                </Box>

                <Divider sx={{ opacity: 0.12 }} />

                <MenuItem onClick={() => { handleMenuClose(); navigate("/orders"); }}>
                  <ListItemIcon><HistoryIcon fontSize="small" /></ListItemIcon>
                  Order history
                </MenuItem>

                <MenuItem onClick={() => { handleMenuClose(); navigate("/profile"); }}>
                  <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                  Profile
                </MenuItem>

                <MenuItem onClick={() => { handleMenuClose(); navigate("/wishlist"); }}>
                  <ListItemIcon><FavoriteIcon fontSize="small" /></ListItemIcon>
                  Wish list
                </MenuItem>

                <Divider sx={{ opacity: 0.12 }} />

                <MenuItem onClick={handleLogout}>
                  <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              onClick={() => navigate("/login")}
              startIcon={<AccountCircleIcon />}
              sx={{
                ml: 0.4,
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 900,
                border: `1px solid ${border}`,
                background: glass,
                px: 1.6,
                "&:hover": { background: glass2 },
              }}
            >
              Login
            </Button>
          )}
        </Box>
      </Toolbar>

      {/* Mobile Search bar */}
      <Box sx={{ px: 2, pb: 1.4, display: { xs: "block", sm: "none" } }}>
        <TextField
          size="small"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ opacity: 0.75 }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleSearch}
                  sx={{
                    borderRadius: 3,
                    border: `1px solid ${border}`,
                    background: brand.gradient || `linear-gradient(90deg, #FA5C5C, #FD8A6B, #FEC288, #FBEF76)`,
                    color: "#111",
                  }}
                >
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 999,
              background: glass,
              border: `1px solid ${border}`,
              "& fieldset": { borderColor: "transparent" },
              "&:hover": { background: glass2 },
            },
          }}
        />
      </Box>
    </AppBar>
  );
};

export default Topbar;
