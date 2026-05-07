import React, { useCallback, useEffect, useState } from "react";
import { Box, Divider, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getCategory } from "../../../../api/controller/admin_controller/product/setting_controller";

import MobileSearchBar from "./MobileSearchBar";
import MobileHero from "./MobileHero";
import MobileCategoryStrip from "./MobileCategoryStrip";
import MobileDealsStrip from "./MobileDealsStrip";
import MobileFeaturedSection from "./MobileFeaturedSection";
import MobilePromoBanner from "./MobilePromoBanner";
import MobileShopStrip from "./MobileShopStrip";
import MobileProductGrid from "./MobileProductGrid";

const safeArray = (x) => (Array.isArray(x) ? x : []);

function SectionDivider() {
  return <Divider sx={{ mx: 1.5, opacity: 0.3 }} />;
}

export default function MobileHome() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === "dark";

  const [categories, setCategories] = useState([]);

  const loadCategories = useCallback(async () => {
    try {
      const c = await getCategory();
      const list = Array.isArray(c) ? c : c?.data?.data || [];
      setCategories(safeArray(list));
    } catch (e) {
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: isDark ? "#0f0f1a" : "#f5f5f5",
        pb: 8,
      }}
    >
      {/* Sticky top bar */}
      <MobileSearchBar />

      {/* Main scrollable content */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>

        {/* 1 — Hero banner carousel */}
        <MobileHero />

        {/* 2 — Category bubbles */}
        <Box
          sx={{
            bgcolor: theme.palette.background.paper,
            borderRadius: 2,
            mx: 1.5,
            py: 1.5,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <MobileCategoryStrip categories={categories} />
        </Box>

        {/* 3 — Today's Deals strip */}
        <Box
          sx={{
            bgcolor: theme.palette.background.paper,
            borderRadius: 2,
            mx: 1.5,
            py: 1.5,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <MobileDealsStrip />
        </Box>

        {/* 4 — Promo banner */}
        <MobilePromoBanner bannerIndex={0} />

        {/* 5 — Featured Products */}
        <Box
          sx={{
            bgcolor: theme.palette.background.paper,
            borderRadius: 2,
            mx: 1.5,
            py: 1.5,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <MobileFeaturedSection />
        </Box>

        {/* 6 — Second promo banner */}
        <MobilePromoBanner bannerIndex={2} />

        {/* 7 — Top Shops */}
        <Box
          sx={{
            bgcolor: theme.palette.background.paper,
            borderRadius: 2,
            mx: 1.5,
            py: 1.5,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <MobileShopStrip />
        </Box>

        {/* 8 — Products grid */}
        <Box
          sx={{
            bgcolor: theme.palette.background.paper,
            borderRadius: 2,
            mx: 1.5,
            py: 1.5,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <MobileProductGrid title="All Products" seeAllPath="/all-products" />
        </Box>

      </Box>
    </Box>
  );
}
