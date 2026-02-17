import React, { useEffect, useMemo, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Badge,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Tooltip,
  Avatar,
  Chip,
  useTheme,
} from "@mui/material";

import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import BoltIcon from "@mui/icons-material/Bolt";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import HistoryIcon from "@mui/icons-material/History";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PersonIcon from "@mui/icons-material/Person";
import StorefrontIcon from "@mui/icons-material/Storefront";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import LanguageIcon from "@mui/icons-material/Language";
import { getCategory } from "../../../api/controller/admin_controller/product/setting_controller";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../../theme.js";
import { image_file_url } from "../../../api/config/index.jsx";
import { getUserDetail } from "../../../api/controller/admin_controller/user_controller.jsx";
import { getWebsiteSetting } from "../../../api/controller/admin_controller/website_setting/website_setting_controller.jsx";
import { getUserWish } from "../../../api/controller/admin_controller/wishlist/wish_controller";
import SearchProduct from "../search_product/SearchProduct.jsx";
import { useTranslation } from "react-i18next";

const buildImageUrl = (media) => {
  if (!media) return "";
  const direct = media?.url || media?.external_link;
  if (direct && /^https?:\/\//i.test(String(direct))) return String(direct);
  const fileName = media?.file_name || media?.file_original_name;
  if (fileName) return `${String(image_file_url || "").replace(/\/+$/, "")}/${String(fileName).replace(/^\/+/, "")}`;
  return "";
};

const safeArray = (value) => (Array.isArray(value) ? value : []);

const Topbar = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { t, i18n } = useTranslation();

  // Theme tokens
  const colors = tokens(theme.palette.mode);
  const border = colors.gray[600];
  const glass = theme.palette.mode === "dark" ? colors.primary[400] : colors.primary[300];
  const glass2 = theme.palette.mode === "dark" ? colors.primary[300] : colors.primary[200];

  const [cartCount, setCartCount] = useState(0);
  const [wishCount, setWishCount] = useState(0);

  const [user, setUser] = useState(null);
  const [brand, setBrand] = useState({
    name: "ShopLogo",
    slogan: "Trendy picks, fast checkout",
    logoUrl: "",
  });

  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);
  const [categoryAnchor, setCategoryAnchor] = useState(null);
  const categoryOpen = Boolean(categoryAnchor);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [langAnchor, setLangAnchor] = useState(null);
  const langOpen = Boolean(langAnchor);

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
    const loadWebsiteSetting = async () => {
      try {
        const res = await getWebsiteSetting();
        const payload = res?.data ?? res;
        const data = payload?.data ?? payload;
        if (data && typeof data === "object") {
          const logoUrl = buildImageUrl(data?.logo || null);
          setBrand({
            name: data?.website_name || "ShopLogo",
            slogan: data?.slogan || "Trendy picks, fast checkout",
            logoUrl,
          });
        }
      } catch (e) {
        console.error("Failed to load website settings", e);
      }
    };

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

    loadWebsiteSetting();
    loadUser();
    loadCounts();

    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const res = await getCategory();
        const payload = res?.data ?? res;
        const list = safeArray(payload?.data ?? payload);
        setCategories(list);
      } catch (e) {
        console.error("Failed to load categories", e);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();

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
  const handleCategoryOpen = (event) => setCategoryAnchor(event.currentTarget);
  const handleCategoryClose = () => setCategoryAnchor(null);
  const handleLangOpen = (event) => setLangAnchor(event.currentTarget);
  const handleLangClose = () => setLangAnchor(null);
  const handleLangChange = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
    handleLangClose();
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    setUser(null);
    handleMenuClose();
    window.dispatchEvent(new Event("auth-changed"));
    navigate("/");
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
        mb: { xs: 1, md: 2 },
        borderBottom: `1px solid ${border}`,
        background: colors.primary[500],
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          flexWrap: { xs: "wrap", md: "nowrap" },
          gap: { xs: 1.2, sm: 2 },
          justifyContent: "space-between",
          py: { xs: 0.8, sm: 1.1 },
        }}
      >
        {/* Left: Brand */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, minWidth: { xs: 0, sm: 200 } }}>
          <IconButton
            onClick={() => navigate("/")}
            sx={{
              width: { xs: 36, sm: 40 },
              height: { xs: 36, sm: 40 },
              borderRadius: 3,
              border: `1px solid ${border}`,
              background: glass,
              "&:hover": { background: glass2, transform: "translateY(-1px)" },
              transition: "transform 120ms ease",
            }}
          >
            {brand.logoUrl ? (
              <Box
                component="img"
                src={brand.logoUrl}
                alt={brand.name}
                sx={{ width: 28, height: 28, objectFit: "contain", borderRadius: 1 }}
              />
            ) : (
              <BoltIcon />
            )}
          </IconButton>

          <Box onClick={() => navigate("/")} sx={{ cursor: "pointer", userSelect: "none", lineHeight: 1.05 }}>
            <Typography
              sx={{
                fontWeight: 950,
                letterSpacing: -0.7,
                color: colors.greenAccent[500],
                fontSize: { xs: 16, sm: 18 },
              }}
            >
              {brand.name}
            </Typography>
            <Typography
              variant="body3"
              sx={{ color: "text.secondary", fontWeight: 800, display: { xs: "none", sm: "block" } }}
            >
              {brand.slogan}
            </Typography>
          </Box>
        </Box>

        {/* Middle: Search */}
        <Box sx={{ flex: 1, maxWidth: 820, display: { xs: "none", sm: "block" } }}>
          <SearchProduct placeholder={t("topbar.searchPlaceholder")} />
        </Box>

        {/* Right: Actions */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 0.6, sm: 1 },
            flexWrap: { xs: "wrap", sm: "nowrap" },
            justifyContent: { xs: "flex-end", sm: "flex-end" },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          <Tooltip title={t("topbar.becomeSeller")}>
            <IconButton onClick={() => navigate("/seller/add")} sx={{ ...pillIconSx, display: { xs: "none", md: "inline-flex" } }}>
              <StorefrontIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={t("topbar.about")}>
            <IconButton onClick={() => navigate("/about")} sx={{ ...pillIconSx, display: { xs: "none", md: "inline-flex" } }}>
              <InfoOutlinedIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={t("lang.label")}>
            <Button
              onClick={handleLangOpen}
              startIcon={<LanguageIcon />}
              sx={{
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 900,
                border: `1px solid ${border}`,
                background: colors.blueAccent[400],
                px: 1.1,
                minWidth: 70,
                "&:hover": { background: glass2 },
              }}
            >
              {i18n.language === "bn" ? "BN" : "EN"}
            </Button>
          </Tooltip>

          <Menu
            anchorEl={langAnchor}
            open={langOpen}
            sx={{ color: colors.primary[900] }}
            onClose={handleLangClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}

          >
            <MenuItem  onClick={() => handleLangChange("en")}>{t("lang.english")}</MenuItem>
            <MenuItem onClick={() => handleLangChange("bn")}>{t("lang.bangla")}</MenuItem>
          </Menu>

          <Tooltip title={t("topbar.wishlist")}>
            <IconButton onClick={() => navigate("/wish")} sx={pillIconSx}>
              <Badge badgeContent={wishCount} color="secondary">
                <FavoriteIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Cart (highlighted, brand gradient) */}
          <Tooltip title={t("topbar.cart")}>
            <IconButton
              onClick={() => navigate("/cart")}
              sx={{
                borderRadius: 3,
                border: `1px solid ${border}`,
                background: theme.palette.secondary.main,
                color: colors.gray[900],
                boxShadow: "none",
                "&:hover": { opacity: 0.92, transform: "translateY(-1px)" },
                transition: "transform 120ms ease, opacity 180ms ease",
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
              <Tooltip title={t("topbar.menu.account")}>
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
                        background: colors.blueAccent[400],
                        color: colors.gray[900],
                        border: `1px solid ${border}`,
                      }}
                    >
                      {initials}
                    </Avatar>
                  }
                >
                  <Box sx={{color: colors.primary[600], display: { xs: "none", md: "block" } }}>
                    {user?.name || t("topbar.menu.profile")}
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
                    background: colors.primary[500],
                  },
                }}
              >
                <Box sx={{ px: 2, pt: 2, pb: 1 }}>
                  <Typography sx={{  color: "text.secondary", fontWeight: 950 }}>{user?.name || t("topbar.menu.account")}</Typography>
                  <Typography variant="body3" sx={{ color: "text.secondary", fontWeight: 700 }}>
                    {user?.email || " "}
                  </Typography>

                  <Box sx={{ mt: 1 }}>
                    <Chip
                      size="small"
                      label={t("topbar.menu.verified")}
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
                  {t("topbar.menu.orderHistory")}
                </MenuItem>

                <MenuItem onClick={() => { handleMenuClose(); navigate("/profile"); }}>
                  <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                  {t("topbar.menu.profile")}
                </MenuItem>

                <MenuItem onClick={() => { handleMenuClose(); navigate("/wishlist"); }}>
                  <ListItemIcon><FavoriteIcon fontSize="small" /></ListItemIcon>
                  {t("topbar.menu.wishList")}
                </MenuItem>

                <Divider sx={{ opacity: 0.12 }} />

                <MenuItem onClick={handleLogout}>
                  <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                  {t("topbar.menu.logout")}
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              onClick={() => navigate("/login")}
              startIcon={<AccountCircleIcon />}
              sx={{
                ml: 0.4,
                 color: colors.gray[100],
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 900,
                border: `1px solid ${border}`,
                background: glass,
                sx: {
                 
                  px: 1.6,
                  "&:hover": { background: glass2 },
                }
              }}
            >
              Login
            </Button>
          )}
        </Box>
      </Toolbar>

      {/* Secondary nav */}
      <Box
        sx={{
          borderTop: `1px solid ${border}`,
          background: colors.primary[500],
          px: 2,
          py: 0.8,
          display: "flex",
          alignItems: "center",
          gap: 2,
          overflowX: "auto",
          "&::-webkit-scrollbar": { height: 6 },
          "&::-webkit-scrollbar-thumb": {
            background: colors.primary[300],
            borderRadius: 999,
          },
        }}
      >
        <Button
          onClick={handleCategoryOpen}
          endIcon={<KeyboardArrowDownIcon />}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 900,
            px: 2,
            width: { xs: "auto", sm: 200 },
            background: colors.yellowAccent ? colors.yellowAccent[500] : "#f5d000",
            color: colors.gray[100],
            border: `1px solid ${border}`,
            whiteSpace: "nowrap",
            "&:hover": { opacity: 0.92 },
          }}
        >
          Categories
        </Button>

        <Menu
          anchorEl={categoryAnchor}
          open={categoryOpen}
          onClose={handleCategoryClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          PaperProps={{
            sx: {
              mt: 1,
              borderRadius: 3,
              minWidth: 220,
              border: `1px solid ${border}`,
              background: colors.primary[500],
            },
          }}
        >
          {loadingCategories ? (
            <MenuItem disabled>Loading categories...</MenuItem>
          ) : categories.length === 0 ? (
            <MenuItem disabled>No categories found</MenuItem>
          ) : (
            categories.map((item) => (
              <MenuItem
                key={item?.id ?? item?.name ?? Math.random()}
                onClick={() => {
                  handleCategoryClose();
                  if (item?.id) navigate(`/category/${item.id}`);
                }}
              >
                {item?.name || item?.title || "Category"}
              </MenuItem>
            ))
          )}
          <Divider sx={{ opacity: 0.12 }} />
          <MenuItem
            onClick={() => {
              handleCategoryClose();
              navigate("/categories");
            }}
          >
            See all categories
          </MenuItem>
        </Menu>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, whiteSpace: "nowrap" }}>
          {[
            { label: "Home", path: "/" },
            { label: "Flash Sale", path: "/" },
            { label: "Blogs", path: "/" },
            { label: "All Brands", path: "/brands" },
            { label: "All categories", path: "/categories" },
          ].map((item) => (
            <Button
              key={item.label}
              onClick={() => navigate(item.path)}
              sx={{
                textTransform: "none",
                fontWeight: 800,
                color: colors.gray[100],
                borderRadius: 2,
               // variant:"body3",
                px: 1.2,
                "&:hover": { background: colors.primary[400] },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Mobile Search bar */}
      <Box sx={{ px: 2, pb: 1.4, display: { xs: "block", sm: "none" } }}>
        <SearchProduct isMobile placeholder="Search products..." />
      </Box>
    </AppBar>
  );
};

export default Topbar;
