import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Container,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import { getCategory } from "../../../api/controller/admin_controller/product/setting_controller";
import Hero from "./components/Hero";
import CategoryGrid from "./components/CategoryGrid";
import FeaturedProduct from "./components/FeaturedProduct";
import TodayDealProduct from "./components/TodayDealProduct";
import AllProduct from "./components/AllProduct";
import HomeShopList from "./components/HomeShopList";

const safeArray = (x) => (Array.isArray(x) ? x : []);

const HomeP1 = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const pageBg = theme.palette.background?.default || "#fff";

  const [categories, setCategories] = useState([]);

  const loadCategories = useCallback(async () => {
    try {
      const c = await getCategory();
      const list = Array.isArray(c) ? c : c?.data?.data || [];

      // Keep nested structure (top-level categories with `children` array)
      setCategories(safeArray(list));
    } catch (e) {
      console.error("loadCategories error:", e);
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
        background: pageBg,
        backgroundImage:
          theme.palette.mode === "dark"
            ? `radial-gradient(1200px 700px at 10% 0%, rgba(251,239,118,0.10), transparent 55%),
               radial-gradient(1200px 700px at 90% 5%, rgba(250,92,92,0.10), transparent 55%),
               radial-gradient(1200px 700px at 50% 95%, rgba(254,194,136,0.08), transparent 55%)`
            : `radial-gradient(1200px 700px at 10% 0%, rgba(251,239,118,0.22), transparent 55%),
               radial-gradient(1200px 700px at 90% 5%, rgba(250,92,92,0.18), transparent 55%),
               radial-gradient(1200px 700px at 50% 95%, rgba(254,194,136,0.14), transparent 55%)`,
      }}
    >
      <Container sx={{ py: 3 }}>
        <Hero />

      

      
        <CategoryGrid categories={categories} />

        <HomeShopList />

        <FeaturedProduct
          onView={(product) => navigate(`/product/${product.id}`)}
        />

        <TodayDealProduct
          onView={(product) => navigate(`/product/${product.id}`)}
        />

        <AllProduct />
      </Container>
    </Box>
  );
};

export default HomeP1;
