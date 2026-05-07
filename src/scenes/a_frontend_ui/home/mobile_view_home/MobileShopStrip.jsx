import React, { useEffect, useMemo, useState } from "react";
import { Avatar, Box, CircularProgress, Typography, useTheme } from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { useNavigate } from "react-router-dom";
import { getAllShops } from "../../../../api/controller/admin_controller/shop/shop_controller.jsx";
import { image_file_url } from "../../../../api/config/index.jsx";

const safeArray = (x) => (Array.isArray(x) ? x : []);

const buildImageUrl = (file) => {
  if (!file) return null;
  if (typeof file === "object") {
    const direct = file?.url || file?.external_link;
    if (direct && /^https?:\/\//i.test(String(direct))) return String(direct);
    const named = file?.file_name || file?.file_original_name;
    if (named) return buildImageUrl(named);
  }
  if (/^https?:\/\//i.test(String(file))) return String(file);
  const base = String(image_file_url || "").replace(/\/+$/, "");
  const safeFile = String(file).replaceAll("\\/", "/").replace(/^\/+/, "");
  return `${base}/${safeFile}`;
};

function ShopBubble({ shop }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const logoUrl = useMemo(() => buildImageUrl(shop?.logo), [shop?.logo]);
  const initials = (shop?.name || "S").slice(0, 2).toUpperCase();

  return (
    <Box
      onClick={() => navigate(`/shop/${shop.id}`)}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0.6,
        flexShrink: 0,
        width: 72,
        cursor: "pointer",
        "&:active": { transform: "scale(0.93)" },
        transition: "transform 0.15s ease",
      }}
    >
      {logoUrl ? (
        <Box
          component="img"
          src={logoUrl}
          alt={shop?.name}
          sx={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            objectFit: "cover",
            border: `2px solid ${theme.palette.divider}`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
          onError={(e) => { e.target.style.display = "none"; }}
        />
      ) : (
        <Avatar
          sx={{
            width: 56,
            height: 56,
            bgcolor: "primary.main",
            fontSize: 18,
            fontWeight: 700,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          {initials}
        </Avatar>
      )}
      <Typography
        variant="caption"
        sx={{
          fontSize: 10,
          fontWeight: 600,
          textAlign: "center",
          maxWidth: 68,
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          lineHeight: 1.2,
          color: "text.primary",
        }}
      >
        {shop?.name}
      </Typography>
    </Box>
  );
}

export default function MobileShopStrip() {
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await getAllShops({ page: 1, per_page: 10 });
        const list = res?.data?.data ?? res?.data ?? res ?? [];
        if (mounted) setShops(safeArray(list));
      } catch (e) {
        if (mounted) setShops([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  if (!loading && shops.length === 0) return null;

  return (
    <Box sx={{ px: 1.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
          <StorefrontIcon sx={{ color: "primary.main", fontSize: 18 }} />
          <Typography variant="subtitle2" fontWeight={700} fontSize={13}>
            Top Shops
          </Typography>
        </Box>
        <Typography
          variant="caption"
          fontWeight={700}
          sx={{ color: "primary.main", cursor: "pointer" }}
          onClick={() => navigate("/shops")}
        >
          See all
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            overflowX: "auto",
            pb: 0.5,
            msOverflowStyle: "none",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {shops.map((shop) => (
            <ShopBubble key={shop.id} shop={shop} />
          ))}
        </Box>
      )}
    </Box>
  );
}
