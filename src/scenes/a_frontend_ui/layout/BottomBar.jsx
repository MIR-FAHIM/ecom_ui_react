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
    <Box component="footer" sx={{ mt: 6, bgcolor: "#161820", color: "#fff" }}>
      <Box
        sx={{
          px: { xs: 3, md: 8 },
          py: { xs: 5, md: 6 },
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.2fr 1fr" },
          alignItems: "start",
          gap: { xs: 4, md: 8 },
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
              <Typography sx={{ fontWeight: 700, letterSpacing: "-0.02em", color: "#fff", fontSize: 16 }}>
                {brand.name}
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
                {brand.slogan}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ minWidth: 280 }}>
          <Typography variant="caption" sx={{ opacity: 0.4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", fontSize: 11 }}>
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

          <Typography variant="caption" sx={{ opacity: 0.4, fontWeight: 600, mt: 3.5, display: "block", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: 11 }}>
            MOBILE APPS
          </Typography>
          <Box sx={{ display: "flex", gap: 1.5, mt: 1.5, flexWrap: "wrap" }}>
            <Box sx={{ border: "1px solid rgba(255,255,255,0.15)", borderRadius: 2.5, px: 2, py: 1, fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.8)", transition: "all 0.2s", "&:hover": { borderColor: "rgba(255,255,255,0.3)" } }}>
              GET IT ON Google Play
            </Box>
            <Box sx={{ border: "1px solid rgba(255,255,255,0.15)", borderRadius: 2.5, px: 2, py: 1, fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.8)", transition: "all 0.2s", "&:hover": { borderColor: "rgba(255,255,255,0.3)" } }}>
              Available on the App Store
            </Box>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

      <Box
        sx={{
          px: { xs: 3, md: 8 },
          py: { xs: 4, md: 5 },
          display: "grid",
          gap: { xs: 3, md: 6 },
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
          alignItems: "start",
        }}
      >
        <Box>
          <Typography variant="caption" sx={{ opacity: 0.4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", fontSize: 11, textAlign: "center", display: "block" }}>
            SUPPORT
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 2 }}>
            <Link component="button" onClick={() => navigate("/privacy")} sx={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 500, "&:hover": { color: "#fff" } }}>
              Support Policy Page
            </Link>
            <Link component="button" onClick={() => navigate("/privacy")} sx={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 500, "&:hover": { color: "#fff" } }}>
              Return Policy Page
            </Link>
            <Link component="button" onClick={() => navigate("/privacy")} sx={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 500, "&:hover": { color: "#fff" } }}>
              About Us
            </Link>
            <Link component="button" onClick={() => navigate("/privacy")} sx={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 500, "&:hover": { color: "#fff" } }}>
              Privacy Policy Page
            </Link>
            <Link component="button" onClick={() => navigate("/privacy")} sx={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 500, "&:hover": { color: "#fff" } }}>
              Seller Policy
            </Link>
            <Link component="button" onClick={() => navigate("/privacy")} sx={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 500, "&:hover": { color: "#fff" } }}>
              Term Conditions Page
            </Link>
          </Box>
        </Box>

        <Box>
          <Typography variant="caption" sx={{ opacity: 0.4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", fontSize: 11, textAlign: "center", display: "block" }}>
            CONTACTS
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 2, color: "rgba(255,255,255,0.6)" }}>
            <Typography variant="body2" sx={{ fontSize: 13, fontWeight: 500 }}>Address</Typography>
            <Typography variant="body2" sx={{ fontSize: 13 }}>Demo</Typography>
            <Typography variant="body2" sx={{ fontSize: 13, fontWeight: 500 }}>Phone</Typography>
            <Typography variant="body2" sx={{ fontSize: 13 }}>+01 234 567 890</Typography>
            <Typography variant="body2" sx={{ fontSize: 13, fontWeight: 500 }}>Email</Typography>
            <Typography variant="body2" sx={{ fontSize: 13 }}>yourmail@email.com</Typography>
          </Box>
        </Box>

        <Box>
          <Typography variant="caption" sx={{ opacity: 0.4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", fontSize: 11, textAlign: "center", display: "block" }}>
            MY ACCOUNT
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 2 }}>
            <Link component="button" onClick={() => navigate("/ecom/login")} sx={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 500, "&:hover": { color: "#fff" } }}>
              Login
            </Link>
            <Link component="button" onClick={() => navigate("/orders")} sx={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 500, "&:hover": { color: "#fff" } }}>
              Order History
            </Link>
            <Link component="button" onClick={() => navigate("/wish")} sx={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 500, "&:hover": { color: "#fff" } }}>
              My Wishlist
            </Link>
            <Link component="button" onClick={() => navigate("/orders")} sx={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 500, "&:hover": { color: "#fff" } }}>
              Track Order
            </Link>
           
          </Box>
        </Box>

        <Box>
          <Typography variant="caption" sx={{ opacity: 0.4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", fontSize: 11, textAlign: "center", display: "block" }}>
            SELLER ZONE
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 2 }}>
            <Link component="button" onClick={() => navigate("/ecom/seller")} sx={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 500, "&:hover": { color: "#fff" } }}>
              Become A Seller
            </Link>
            <Link component="button" onClick={() => navigate("/login")} sx={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 500, "&:hover": { color: "#fff" } }}>
              Login to Seller Panel
            </Link>
            <Link component="button" onClick={() => navigate("/ecom/seller/app")} sx={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 500, "&:hover": { color: "#fff" } }}>
              Download Seller App
            </Link>
            <Typography variant="caption" sx={{ opacity: 0.4, fontWeight: 600, mt: 2.5, textTransform: "uppercase", letterSpacing: "0.08em", fontSize: 11, textAlign: "center", display: "block" }}>
              DELIVERY BOY
            </Typography>
            <Link component="button" onClick={() => navigate("/login")} sx={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 500, "&:hover": { color: "#fff" } }}>
              Login to Delivery Boy Panel
            </Link>
            <Link component="button" onClick={() => navigate("/ecom/delivery/app")} sx={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 500, "&:hover": { color: "#fff" } }}>
              Download Delivery Boy App
            </Link>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default BottomBar;
