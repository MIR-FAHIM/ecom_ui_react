import React, { useEffect, useState } from "react";
import { Box, Divider, IconButton, Link, Typography } from "@mui/material";
import { Facebook, Instagram, LinkedIn, YouTube, X } from "@mui/icons-material";
import BoltIcon from "@mui/icons-material/Bolt";
import { useNavigate } from "react-router-dom";
import { getWebsiteSetting } from "../../../api/controller/admin_controller/website_setting/website_setting_controller.jsx";
import { image_file_url } from "../../../api/config/index.jsx";

const buildImageUrl = (media) => {
  if (!media) return "";
  const direct = media?.url || media?.external_link;
  if (direct && /^https?:\/\//i.test(String(direct))) return String(direct);
  const fileName = media?.file_name || media?.file_original_name;
  if (fileName) {
    return `${String(image_file_url || "").replace(/\/+$/, "")}/${String(fileName).replace(/^\/+/, "")}`;
  }
  return "";
};

const BottomBar = () => {
  const navigate = useNavigate();
  const [brand, setBrand] = useState({
    name: "ShopLogo",
    slogan: "Trendy picks, fast checkout",
    logoUrl: "",
  });

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

    loadWebsiteSetting();
  }, []);

  return (
    <Box component="footer" sx={{ mt: 6, bgcolor: "#1f2026", color: "#fff" }}>
      <Box
        sx={{
          px: { xs: 2, md: 6 },
          py: { xs: 4, md: 5 },
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.2fr 1fr" },
          alignItems: "start",
          gap: { xs: 3, md: 6 },
        }}
      >
        <Box sx={{ minWidth: 220 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, minWidth: 220 }}>
            <IconButton
              onClick={() => navigate("/")}
              sx={{
                width: 40,
                height: 40,
                borderRadius: 3,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.06)",
                "&:hover": { background: "rgba(255,255,255,0.12)", transform: "translateY(-1px)" },
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
              <Typography sx={{ fontWeight: 950, letterSpacing: -0.3, color: "#fff" }}>
                {brand.name}
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)", fontWeight: 800 }}>
                {brand.slogan}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ minWidth: 280 }}>
          <Typography variant="body2" sx={{ opacity: 0.7, fontWeight: 700, textTransform: "uppercase" }}>
            FOLLOW US
          </Typography>
          <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
            <Box sx={{ width: 34, height: 34, borderRadius: "50%", bgcolor: "#2d5aa7", display: "grid", placeItems: "center" }}>
              <Facebook fontSize="small" />
            </Box>
            <Box sx={{ width: 34, height: 34, borderRadius: "50%", bgcolor: "#000", display: "grid", placeItems: "center" }}>
              <X fontSize="small" />
            </Box>
            <Box sx={{ width: 34, height: 34, borderRadius: "50%", bgcolor: "#d62976", display: "grid", placeItems: "center" }}>
              <Instagram fontSize="small" />
            </Box>
            <Box sx={{ width: 34, height: 34, borderRadius: "50%", bgcolor: "#ff0000", display: "grid", placeItems: "center" }}>
              <YouTube fontSize="small" />
            </Box>
            <Box sx={{ width: 34, height: 34, borderRadius: "50%", bgcolor: "#0a66c2", display: "grid", placeItems: "center" }}>
              <LinkedIn fontSize="small" />
            </Box>
          </Box>

          <Typography variant="body2" sx={{ opacity: 0.7, fontWeight: 700, mt: 3, display: "block", textTransform: "uppercase" }}>
            MOBILE APPS
          </Typography>
          <Box sx={{ display: "flex", gap: 1.5, mt: 1, flexWrap: "wrap" }}>
            <Box sx={{ border: "1px solid #666", borderRadius: 2, px: 1.5, py: 0.75, fontSize: 12 }}>
              GET IT ON Google Play
            </Box>
            <Box sx={{ border: "1px solid #666", borderRadius: 2, px: 1.5, py: 0.75, fontSize: 12 }}>
              Available on the App Store
            </Box>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

      <Box
        sx={{
          px: { xs: 2, md: 6 },
          py: { xs: 3, md: 4 },
          display: "grid",
          gap: { xs: 3, md: 5 },
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
          alignItems: "start",
        }}
      >
        <Box>
          <Typography variant="body2" sx={{ opacity: 0.7, fontWeight: 700, textTransform: "uppercase" , textAlign: "center"}}>
            SUPPORT
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, mt: 1.5 }}>
            <Link component="button" onClick={() => navigate("/privacy")} sx={{ color: "#fff" }}>
              Support Policy Page
            </Link>
            <Link component="button" onClick={() => navigate("/privacy")} sx={{ color: "#fff" }}>
              Return Policy Page
            </Link>
            <Link component="button" onClick={() => navigate("/privacy")} sx={{ color: "#fff" }}>
              About Us
            </Link>
            <Link component="button" onClick={() => navigate("/privacy")} sx={{ color: "#fff" }}>
              Privacy Policy Page
            </Link>
            <Link component="button" onClick={() => navigate("/privacy")} sx={{ color: "#fff" }}>
              Seller Policy
            </Link>
            <Link component="button" onClick={() => navigate("/privacy")} sx={{ color: "#fff" }}>
              Term Conditions Page
            </Link>
          </Box>
        </Box>

        <Box>
          <Typography variant="body2" sx={{ opacity: 0.7, fontWeight: 700, textTransform: "uppercase" , textAlign: "center"}}>
            CONTACTS
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, mt: 1.5, color: "rgba(255,255,255,0.8)" }}>
            <Typography variant="body2">Address</Typography>
            <Typography variant="body2">Demo</Typography>
            <Typography variant="body2">Phone</Typography>
            <Typography variant="body2">+01 234 567 890</Typography>
            <Typography variant="body2">Email</Typography>
            <Typography variant="body2">yourmail@email.com</Typography>
          </Box>
        </Box>

        <Box>
          <Typography variant="body2" sx={{ opacity: 0.7, fontWeight: 700, textTransform: "uppercase" , textAlign: "center" }}>
            MY ACCOUNT
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, mt: 1.5 }}>
            <Link component="button" onClick={() => navigate("/ecom/login")} sx={{ color: "#fff" }}>
              Login
            </Link>
            <Link component="button" onClick={() => navigate("/orders")} sx={{ color: "#fff" }}>
              Order History
            </Link>
            <Link component="button" onClick={() => navigate("/wish")} sx={{ color: "#fff" }}>
              My Wishlist
            </Link>
            <Link component="button" onClick={() => navigate("/orders")} sx={{ color: "#fff" }}>
              Track Order
            </Link>
           
          </Box>
        </Box>

        <Box>
          <Typography variant="body2" sx={{ opacity: 0.7, fontWeight: 700, textTransform: "uppercase"  , textAlign: "center"}}>
            SELLER ZONE
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, mt: 1.5 }}>
            <Link component="button" onClick={() => navigate("/ecom/seller")} sx={{ color: "#fff" }}>
              Become A Seller
            </Link>
            <Link component="button" onClick={() => navigate("/login")} sx={{ color: "#fff" }}>
              Login to Seller Panel
            </Link>
            <Link component="button" onClick={() => navigate("/ecom/seller/app")} sx={{ color: "#fff" }}>
              Download Seller App
            </Link>
            <Typography variant="body2" sx={{ opacity: 0.7, fontWeight: 700, mt: 2, textTransform: "uppercase"  , textAlign: "center"}}>
              DELIVERY BOY
            </Typography>
            <Link component="button" onClick={() => navigate("/login")} sx={{ color: "#fff" }}>
              Login to Delivery Boy Panel
            </Link>
            <Link component="button" onClick={() => navigate("/ecom/delivery/app")} sx={{ color: "#fff" }}>
              Download Delivery Boy App
            </Link>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default BottomBar;
