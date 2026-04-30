import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
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
  Paper,
  Popper,
  Fade,
  ClickAwayListener,
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
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import LanguageIcon from "@mui/icons-material/Language";
import FolderIcon from "@mui/icons-material/Folder";

import { useNavigate } from "react-router-dom";
import { tokens } from "../../../theme.js";
import { image_file_url } from "../../../api/config/index.jsx";
import { getUserDetail } from "../../../api/controller/admin_controller/user_controller.jsx";
import { getWebsiteSetting } from "../../../api/controller/admin_controller/website_setting/website_setting_controller.jsx";
import { getUserWish } from "../../../api/controller/admin_controller/wishlist/wish_controller";
import { getCategoryWithAllChildren } from "../../../api/controller/admin_controller/category/category_controller";
import SearchProduct from "../search_product/SearchProduct.jsx";
import { useTranslation } from "react-i18next";

const buildImageUrl = (media) => {
  if (!media) return "";
  const direct = media?.url || media?.external_link;
  if (direct && /^https?:\/\//i.test(String(direct))) return String(direct);
  const fileName = media?.file_name || media?.file_original_name;
  if (fileName)
    return `${String(image_file_url || "").replace(/\/+$/, "")}/${String(fileName).replace(/^\/+/, "")}`;
  return "";
};

const safeArray = (value) => (Array.isArray(value) ? value : []);

// ─── Mega Menu ────────────────────────────────────────────────────────────────

const MegaMenu = ({ open, anchorEl, categories, onClose, navigate, colors, border }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const closeTimer = useRef(null);

  const activeCategory = categories[activeIndex] ?? null;
  const children = safeArray(activeCategory?.children);

  const handleMouseEnterMenu = () => {
    clearTimeout(closeTimer.current);
  };

  const handleMouseLeaveMenu = () => {
    closeTimer.current = setTimeout(onClose, 180);
  };

  useEffect(() => {
    if (open) setActiveIndex(0);
    return () => clearTimeout(closeTimer.current);
  }, [open]);

  if (!open || !anchorEl) return null;

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-start"
      transition
      style={{ zIndex: 1400 }}
      modifiers={[{ name: "offset", options: { offset: [0, 4] } }]}
    >
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={160}>
          <Paper
            onMouseEnter={handleMouseEnterMenu}
            onMouseLeave={handleMouseLeaveMenu}
            elevation={0}
            sx={{
              display: "flex",
              borderRadius: 2,
              border: `1px solid ${border}`,
              background: colors.primary[500],
              overflow: "hidden",
              minWidth: 680,
              maxWidth: 900,
              maxHeight: 480,
              boxShadow: "0 12px 40px rgba(0,0,0,0.22)",
            }}
          >
            {/* Left: parent category list */}
            <Box
              sx={{
                width: 210,
                flexShrink: 0,
                borderRight: `1px solid ${border}`,
                overflowY: "auto",
                py: 1,
                "&::-webkit-scrollbar": { width: 4 },
                "&::-webkit-scrollbar-thumb": {
                  background: colors.primary[300],
                  borderRadius: 999,
                },
              }}
            >
              {categories.map((cat, idx) => {
                const icon = buildImageUrl(cat?.banner || cat?.icon || cat?.cover_image);
                const isActive = idx === activeIndex;
                return (
                  <Box
                    key={cat.id ?? cat.name}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => {
                      onClose();
                      if (cat?.id) navigate(`/category/${cat.id}`);
                    }}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1.2,
                      px: 1.5,
                      py: 0.9,
                      cursor: "pointer",
                      background: isActive ? colors.primary[400] : "transparent",
                      borderLeft: isActive
                        ? `3px solid ${colors.greenAccent?.[500] || "#4cceac"}`
                        : "3px solid transparent",
                      transition: "background 0.12s",
                      "&:hover": { background: colors.primary[400] },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                      {/* Category icon */}
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: 1.5,
                          overflow: "hidden",
                          flexShrink: 0,
                          background: colors.primary[300],
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {icon ? (
                          <Box
                            component="img"
                            src={icon}
                            alt={cat?.name}
                            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                          />
                        ) : (
                          <FolderIcon sx={{ fontSize: 15, color: colors.gray[400] }} />
                        )}
                      </Box>

                      <Typography
                        sx={{
                          fontSize: "0.8rem",
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? colors.gray[100] : colors.gray[300],
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {cat?.name || "Category"}
                      </Typography>
                    </Box>

                    {safeArray(cat?.children).length > 0 && (
                      <KeyboardArrowRightIcon
                        sx={{
                          fontSize: 15,
                          color: isActive
                            ? colors.greenAccent?.[500] || "#4cceac"
                            : colors.gray[500],
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </Box>
                );
              })}

              {/* See all */}
              <Divider sx={{ opacity: 0.1, my: 0.5 }} />
              <Box
                onClick={() => { onClose(); navigate("/categories"); }}
                sx={{
                  px: 1.5,
                  py: 0.9,
                  cursor: "pointer",
                  "&:hover": { background: colors.primary[400] },
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    color: colors.greenAccent?.[400] || "#4cceac",
                  }}
                >
                  See all categories →
                </Typography>
              </Box>
            </Box>

            {/* Right: children grid */}
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                p: 2.5,
                "&::-webkit-scrollbar": { width: 4 },
                "&::-webkit-scrollbar-thumb": {
                  background: colors.primary[300],
                  borderRadius: 999,
                },
              }}
            >
              {children.length === 0 ? (
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    sx={{ fontSize: "0.8rem", color: colors.gray[500] }}
                  >
                    No subcategories
                  </Typography>
                </Box>
              ) : (
                <>
                  {/* Header */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.88rem",
                        fontWeight: 700,
                        color: colors.gray[100],
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {activeCategory?.name}
                    </Typography>
                    <Typography
                      onClick={() => {
                        onClose();
                        if (activeCategory?.id)
                          navigate(`/category/${activeCategory.id}`);
                      }}
                      sx={{
                        fontSize: "0.72rem",
                        color: colors.greenAccent?.[400] || "#4cceac",
                        cursor: "pointer",
                        fontWeight: 600,
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      View all →
                    </Typography>
                  </Box>

                  {/* Subcategory grid */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                      gap: 2,
                    }}
                  >
                    {children.map((child) => {
                      const grandchildren = safeArray(child?.children);
                      return (
                        <Box key={child.id ?? child.name}>
                          {/* Sub heading */}
                          <Typography
                            onClick={() => {
                              onClose();
                              if (child?.id) navigate(`/category/${child.id}`);
                            }}
                            sx={{
                              fontSize: "0.78rem",
                              fontWeight: 700,
                              color: colors.gray[100],
                              cursor: "pointer",
                              mb: 0.6,
                              lineHeight: 1.3,
                              "&:hover": {
                                color:
                                  colors.greenAccent?.[400] || "#4cceac",
                              },
                            }}
                          >
                            {child?.name}
                          </Typography>

                          {/* Leaf items */}
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "2px",
                            }}
                          >
                            {grandchildren.slice(0, 5).map((leaf) => (
                              <Typography
                                key={leaf.id ?? leaf.name}
                                onClick={() => {
                                  onClose();
                                  if (leaf?.id)
                                    navigate(`/category/${leaf.id}`);
                                }}
                                sx={{
                                  fontSize: "0.72rem",
                                  color: colors.gray[400],
                                  cursor: "pointer",
                                  lineHeight: 1.5,
                                  "&:hover": {
                                    color:
                                      colors.greenAccent?.[400] || "#4cceac",
                                    textDecoration: "underline",
                                  },
                                }}
                              >
                                {leaf.name}
                              </Typography>
                            ))}
                            {grandchildren.length > 5 && (
                              <Typography
                                onClick={() => {
                                  onClose();
                                  if (child?.id)
                                    navigate(`/category/${child.id}`);
                                }}
                                sx={{
                                  fontSize: "0.7rem",
                                  color:
                                    colors.greenAccent?.[500] || "#4cceac",
                                  cursor: "pointer",
                                  fontWeight: 600,
                                  mt: 0.2,
                                  "&:hover": { textDecoration: "underline" },
                                }}
                              >
                                +{grandchildren.length - 5} more
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </>
              )}
            </Box>
          </Paper>
        </Fade>
      )}
    </Popper>
  );
};

// ─── Topbar ───────────────────────────────────────────────────────────────────

const Topbar = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { t, i18n } = useTranslation();

  const colors = tokens(theme.palette.mode);
  const border = colors.gray[600];
  const glass =
    theme.palette.mode === "dark" ? colors.primary[400] : colors.primary[300];
  const glass2 =
    theme.palette.mode === "dark" ? colors.primary[300] : colors.primary[200];

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

  // Category mega menu
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [categoryBtnEl, setCategoryBtnEl] = useState(null);
  const categoryBtnRef = useRef(null);
  const megaCloseTimer = useRef(null);

  const [langAnchor, setLangAnchor] = useState(null);
  const langOpen = Boolean(langAnchor);

  const initials = useMemo(() => {
    const n = (user?.name || "").trim();
    if (!n) return "U";
    const parts = n.split(" ").filter(Boolean);
    return ((parts[0] || "U").slice(0, 1) + (parts[1] || "").slice(0, 1)).toUpperCase();
  }, [user?.name]);

  const loadCounts = () => {
    try {
      const raw = localStorage.getItem("cart");
      const parsed = raw ? JSON.parse(raw) : 0;
      setCartCount(Array.isArray(parsed) ? parsed.length : Number(parsed || 0));
    } catch { setCartCount(0); }

    try {
      const storedId = localStorage.getItem("userId");
      if (storedId) {
        (async () => {
          try {
            const res = await getUserWish(storedId);
            const payload = res?.data?.data ?? res?.data ?? res ?? [];
            const items = Array.isArray(payload)
              ? payload.map((e) => e?.product ?? e).filter(Boolean)
              : [];
            setWishCount(items.length);
          } catch { setWishCount(0); }
        })();
      } else { setWishCount(0); }
    } catch { setWishCount(0); }
  };

  useEffect(() => {
    const loadWebsiteSetting = async () => {
      try {
        const res = await getWebsiteSetting();
        const data = (res?.data ?? res)?.data ?? (res?.data ?? res);
        if (data && typeof data === "object") {
          setBrand({
            name: data?.website_name || "ShopLogo",
            slogan: data?.slogan || "Trendy picks, fast checkout",
            logoUrl: buildImageUrl(data?.logo || null),
          });
        }
      } catch (e) { console.error("Failed to load website settings", e); }
    };

    const loadUser = async () => {
      try {
        const storedId = localStorage.getItem("userId");
        if (!storedId) return setUser(null);
        const res = await getUserDetail(storedId);
        setUser(res?.data?.data ?? res?.data ?? null);
      } catch { setUser(null); }
    };

    // ✅ Use getCategoryWithAllChildren instead of getCategory
    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const res = await getCategoryWithAllChildren();
        const payload = res?.data ?? res;
        setCategories(safeArray(payload?.data ?? payload));
      } catch { setCategories([]); }
      finally { setLoadingCategories(false); }
    };

    loadWebsiteSetting();
    loadUser();
    loadCounts();
    loadCategories();

    const onAuth = () => loadUser();
    const onCart = () => loadCounts();
    window.addEventListener("auth-changed", onAuth);
    window.addEventListener("cart-updated", onCart);
    window.addEventListener("wishlist-updated", onCart);
    return () => {
      window.removeEventListener("auth-changed", onAuth);
      window.removeEventListener("cart-updated", onCart);
      window.removeEventListener("wishlist-updated", onCart);
    };
  }, []);

  // Mega menu hover handlers
  const handleCategoryBtnMouseEnter = (e) => {
    clearTimeout(megaCloseTimer.current);
    setCategoryBtnEl(e.currentTarget);
    setMegaMenuOpen(true);
  };

  const handleCategoryBtnMouseLeave = () => {
    megaCloseTimer.current = setTimeout(() => setMegaMenuOpen(false), 180);
  };

  const handleMegaMenuClose = () => {
    clearTimeout(megaCloseTimer.current);
    setMegaMenuOpen(false);
  };

  const handleUserClick = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLangOpen = (e) => setLangAnchor(e.currentTarget);
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
        mb: 0,
        borderBottom: `1px solid ${border}`,
        background: colors.primary[500],
        backdropFilter: "blur(20px)",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          flexWrap: { xs: "wrap", md: "nowrap" },
          gap: { xs: 1, sm: 1.5 },
          justifyContent: "space-between",
          py: { xs: 0.6, sm: 0.8 },
          minHeight: { xs: 56, sm: 64 },
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
                fontWeight: 600,
                letterSpacing: "-0.03em",
                color: colors.greenAccent[500],
                fontSize: { xs: 15, sm: 17 },
                lineHeight: 1.2,
              }}
            >
              {brand.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", fontWeight: 500, display: { xs: "none", sm: "block" }, opacity: 0.7 }}
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
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.6, width: { xs: "100%", sm: "auto" } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.6, sm: 1 }, flexWrap: { xs: "wrap", sm: "nowrap" }, justifyContent: { xs: "flex-end", sm: "flex-end" }, width: { xs: "100%", sm: "auto" } }}>

            <Tooltip title={t("lang.label")}>
              <Button
                onClick={handleLangOpen}
                startIcon={<LanguageIcon sx={{ fontSize: 18 }} />}
                sx={{ borderRadius: 999, textTransform: "none", fontWeight: 600, fontSize: 12, border: `1px solid ${border}`, background: colors.primary[900], px: 1.2, py: 0.5, minWidth: 64, "&:hover": { background: colors.primary[900] } }}
              >
                {i18n.language === "bn" ? "BN" : "EN"}
              </Button>
            </Tooltip>

            <Menu anchorEl={langAnchor} open={langOpen} onClose={handleLangClose} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} transformOrigin={{ vertical: "top", horizontal: "right" }}>
              <MenuItem onClick={() => handleLangChange("en")}>{t("lang.english")}</MenuItem>
              <MenuItem onClick={() => handleLangChange("bn")}>{t("lang.bangla")}</MenuItem>
            </Menu>

            <Tooltip title={t("topbar.wishlist")}>
              <IconButton onClick={() => navigate("/wish")} sx={pillIconSx}>
                <Badge badgeContent={wishCount} color="secondary"><FavoriteIcon /></Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title={t("topbar.cart")}>
              <IconButton
                onClick={() => navigate("/cart")}
                sx={{ borderRadius: 3, border: `1px solid ${border}`, background: theme.palette.secondary.main, color: colors.gray[900], "&:hover": { opacity: 0.92, transform: "translateY(-1px)" }, transition: "transform 120ms ease, opacity 180ms ease" }}
              >
                <Badge badgeContent={cartCount} color="error"><ShoppingCartIcon /></Badge>
              </IconButton>
            </Tooltip>

            {user?.user_type === "customer" ? (
              <>
                <Tooltip title={t("topbar.menu.account")}>
                  <Button
                    onClick={handleUserClick}
                    sx={{ ml: 0.4, borderRadius: 999, textTransform: "none", fontWeight: 600, fontSize: 13, border: `1px solid ${border}`, background: glass, px: 1.4, py: 0.5, gap: 0.8, "&:hover": { background: glass2 } }}
                    startIcon={
                      <Avatar sx={{ width: 26, height: 26, fontSize: 12, fontWeight: 600, background: colors.blueAccent[400], color: colors.gray[900], border: `1px solid ${border}` }}>
                        {initials}
                      </Avatar>
                    }
                  >
                    <Box sx={{ color: colors.primary[600], display: { xs: "none", md: "block" } }}>{user?.name || t("topbar.menu.profile")}</Box>
                  </Button>
                </Tooltip>

                <Menu
                  id="user-menu"
                  anchorEl={anchorEl}
                  open={menuOpen}
                  onClose={handleMenuClose}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                  PaperProps={{ sx: { mt: 1, borderRadius: 4, minWidth: 250, overflow: "hidden", border: `1px solid ${border}`, background: colors.primary[500] } }}
                >
                  <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{user?.name}</Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.3, display: "block" }}>{user?.email}</Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip size="small" label={t("topbar.menu.verified")} sx={{ borderRadius: 999, fontWeight: 600, background: glass, border: `1px solid ${border}` }} />
                    </Box>
                  </Box>
                  <Divider sx={{ opacity: 0.12 }} />
                  <MenuItem onClick={() => { handleMenuClose(); navigate("/orders"); }}><ListItemIcon><HistoryIcon fontSize="small" /></ListItemIcon>{t("topbar.menu.orderHistory")}</MenuItem>
                  <MenuItem onClick={() => { handleMenuClose(); navigate("/profile"); }}><ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>{t("topbar.menu.profile")}</MenuItem>
                  <MenuItem onClick={() => { handleMenuClose(); navigate("/wishlist"); }}><ListItemIcon><FavoriteIcon fontSize="small" /></ListItemIcon>{t("topbar.menu.wishList")}</MenuItem>
                  <Divider sx={{ opacity: 0.12 }} />
                  <MenuItem onClick={handleLogout}><ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>{t("topbar.menu.logout")}</MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button onClick={() => navigate("/login")} startIcon={<AccountCircleIcon />} sx={{ ml: 0.4, color: colors.gray[100], borderRadius: 999, textTransform: "none", fontWeight: 600, border: `1px solid ${border}`, background: glass, px: 1.6, "&:hover": { background: glass2 } }}>Login</Button>
                <Button onClick={() => navigate("/register")} startIcon={<AccountCircleIcon />} sx={{ ml: 0.4, color: colors.gray[100], borderRadius: 999, textTransform: "none", fontWeight: 600, border: `1px solid ${border}`, background: glass, px: 1.6, "&:hover": { background: glass2 } }}>Register</Button>
              </>
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <Tooltip title="Seller Login">
              <Button onClick={() => navigate("/seller-login")} startIcon={<StorefrontIcon sx={{ fontSize: 16 }} />} sx={{ display: { xs: "none", md: "inline-flex" }, textTransform: "none", fontWeight: 500, fontSize: 12, color: colors.gray[100], px: 1, minWidth: 0, opacity: 0.8, "&:hover": { opacity: 1 } }}>{t("topbar.becomeSeller")}</Button>
            </Tooltip>
            <Tooltip title="Seller Register">
              <Button onClick={() => navigate("/seller-register")} startIcon={<StorefrontIcon sx={{ fontSize: 16 }} />} sx={{ display: { xs: "none", md: "inline-flex" }, textTransform: "none", fontWeight: 500, fontSize: 12, color: colors.gray[100], px: 1, minWidth: 0, opacity: 0.8, "&:hover": { opacity: 1 } }}>Seller Register</Button>
            </Tooltip>
            <Tooltip title={t("topbar.about")}>
              <Button onClick={() => navigate("/about")} startIcon={<InfoOutlinedIcon sx={{ fontSize: 16 }} />} sx={{ display: { xs: "none", md: "inline-flex" }, textTransform: "none", fontWeight: 500, fontSize: 12, color: colors.gray[100], px: 1, minWidth: 0, opacity: 0.8, "&:hover": { opacity: 1 } }}>{t("topbar.about")}</Button>
            </Tooltip>
          </Box>
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
          "&::-webkit-scrollbar-thumb": { background: colors.primary[300], borderRadius: 999 },
        }}
      >
        {/* ✅ Category button with hover mega menu */}
        <Box
          ref={categoryBtnRef}
          onMouseEnter={handleCategoryBtnMouseEnter}
          onMouseLeave={handleCategoryBtnMouseLeave}
          sx={{ position: "relative" }}
        >
          <Button
            endIcon={
              <KeyboardArrowDownIcon
                sx={{
                  transition: "transform 0.2s",
                  transform: megaMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            }
            sx={{
              borderRadius: 1,
              textTransform: "none",
              fontWeight: 700,
              fontSize: 13,
              px: 2,
              py: 0.75,
              width: { xs: "auto", sm: 180 },
              background: colors.yellowAccent ? colors.yellowAccent[500] : "#f5d000",
              color: colors.gray[100],
              border: `1px solid ${border}`,
              whiteSpace: "nowrap",
              "&:hover": { opacity: 0.92 },
            }}
          >
            {loadingCategories ? "Loading…" : "Categories"}
          </Button>

          {/* Mega menu */}
          <MegaMenu
            open={megaMenuOpen}
            anchorEl={categoryBtnRef.current}
            categories={categories}
            onClose={handleMegaMenuClose}
            navigate={navigate}
            colors={colors}
            border={border}
          />
        </Box>

        {/* Nav links + Helpline */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, whiteSpace: "nowrap", flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {[
              { label: "Home", path: "/" },
              { label: "Flash Sale", path: "/flash-sale" },
              { label: "Blogs", path: "/blogs" },
              { label: "All Brands", path: "/brands" },
              { label: "All categories", path: "/categories" },
            ].map((item) => (
              <Button
                key={item.label}
                onClick={() => navigate(item.path)}
                sx={{ textTransform: "none", fontWeight: 500, fontSize: 13, color: colors.gray[100], borderRadius: 2, px: 1.5, py: 0.4, "&:hover": { background: colors.primary[400] } }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
          <Box sx={{ flex: 1 }} />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                color: colors.yellowAccent ? colors.yellowAccent[400] : "#f5d000",
                fontSize: 12,
                letterSpacing: 0.2,
                ml: 2,
                whiteSpace: "nowrap"
              }}
            >
              Helpline <span style={{ color: colors.gray[100], marginLeft: 6 }}>+88 09611-677686</span>
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Mobile Search */}
      <Box sx={{ px: 2, pb: 1.4, display: { xs: "block", sm: "none" } }}>
        <SearchProduct isMobile placeholder="Search products..." />
      </Box>
    </AppBar>
  );
};

export default Topbar;