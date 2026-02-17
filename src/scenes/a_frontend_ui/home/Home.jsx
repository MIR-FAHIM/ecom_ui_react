import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Container,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import { getCategory } from "../../../api/controller/admin_controller/product/setting_controller";
import Hero from "./components/Hero";
import CategoryGrid from "./components/CategoryGrid";
import FeaturedCategory from "./components/FeaturedCategory";
import FeaturedProduct from "./components/FeaturedProduct";
import CategoryWiseProductHome from "./components/category_wise_product_home";
import TodayDealProduct from "./components/TodayDealProduct";
import AllProduct from "./components/AllProduct";
import HomeShopList from "./components/HomeShopList";
import TodayDealBox from "./components/TodayDealBox";
import BannerRow from "./components/BannerRow";

import BestSellingProduct from "./components/BestSellingProduct";

const safeArray = (x) => (Array.isArray(x) ? x : []);

const HomeP1 = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const pageBg = theme.palette.background?.default || "#fff";

  const categoryBlockColor =
    theme.palette.mode === "dark" ? "#2f3b2c" : "#cfe1b8";

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
      <Container sx={{ py: { xs: 2, md: 3 } }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2.5, md: 3 } }}>
          {isMobile ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Hero />
              <CategoryGrid categories={categories} />
              <TodayDealProduct
                compact
                title="Today Deals"
                onView={(product) => navigate(`/product/${product.id}`)}
              />
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gap: 2.5,
                gridTemplateColumns: {
                  md: "1.1fr 0.9fr",
                  lg: "1.35fr 0.65fr",
                },
                alignItems: "stretch",
              }}
            >
              <Box sx={{ height: { md: 520 } }}>
                <Hero />
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, height: { md: 520 } }}>
                <Box sx={{ height: { md: 320 } }}>
                  <CategoryGrid categories={categories} />
                </Box>
                <Box sx={{ height: { md: 180 } }}>
                  <TodayDealProduct
                    compact
                    title="Today Deals"
                    onView={(product) => navigate(`/product/${product.id}`)}
                  />
                </Box>
              </Box>
            </Box>
          )}
          <FeaturedCategory categories={categories} />
           
       

        

          <Box
            sx={{
              display: "grid",
              gap: 2.5,
              gridTemplateColumns: {
                xs: "1fr",
                md: "2.8fr 0.8fr",
              },
              alignItems: "stretch",
            }}
          >
            <FeaturedProduct
              onView={(product) => navigate(`/product/${product.id}`)}
            />
            <TodayDealBox onView={(product) => navigate(`/product/${product.id}`)} />
          </Box>
          <BannerRow />
          <BestSellingProduct onView={(product) => navigate(`/product/${product.id}`)} />
          <CategoryWiseProductHome
            onView={(product) => navigate(`/product/${product.id}`)}
            category_id={4}
            color={"#ecddec"}
          
          />
          <CategoryWiseProductHome
            onView={(product) => navigate(`/product/${product.id}`)}
            category_id={5}
            color={"#f5d9e4"}
          
          />
          <HomeShopList />
          <AllProduct />
        
        </Box>
      </Container>
    </Box>
  );
};

export default HomeP1;
