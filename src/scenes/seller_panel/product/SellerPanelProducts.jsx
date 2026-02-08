import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Pagination,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import AddOutlined from "@mui/icons-material/AddOutlined";
import { tokens } from "../../../theme.js";
import { getShopDetails, getShopProduct } from "../../../api/controller/admin_controller/shop/shop_controller.jsx";
import ProductCard from "../../a_frontend_ui/home/components/ProductCard.jsx";

const safeArray = (x) => (Array.isArray(x) ? x : []);

const SellerPanelProducts = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const shopId = useMemo(() => {
    return (
      searchParams.get("shop_id") ||
      searchParams.get("id") ||
      localStorage.getItem("userId") ||
      ""
    );
  }, [searchParams]);

  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingShop, setLoadingShop] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [errorShop, setErrorShop] = useState("");
  const [errorProducts, setErrorProducts] = useState("");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 16,
  });

  useEffect(() => {
    if (!shopId) {
      setErrorShop("Shop id not found.");
      return;
    }

    const load = async () => {
      setLoadingShop(true);
      setErrorShop("");
      try {
        const res = await getShopDetails(shopId);
        if (res?.status === "success") {
          setShop(res?.data || null);
        } else {
          setErrorShop(res?.message || "Failed to load shop details.");
        }
      } catch (err) {
        setErrorShop(err?.message || "Failed to load shop details.");
      } finally {
        setLoadingShop(false);
      }
    };

    load();
  }, [shopId]);

  useEffect(() => {
    if (!shopId) return;

    const load = async () => {
      setLoadingProducts(true);
      setErrorProducts("");
      try {
        const res = await getShopProduct(shopId, {
          page: pagination.current_page,
          per_page: pagination.per_page,
        });
        if (res?.status === "success") {
          const pageData = res?.data ?? {};
          const list = safeArray(pageData?.data);
          setProducts(list);
          setPagination((prev) => ({
            ...prev,
            current_page: pageData?.current_page || prev.current_page,
            last_page: pageData?.last_page || prev.last_page,
            total: pageData?.total ?? prev.total,
            per_page: pageData?.per_page ?? prev.per_page,
          }));
        } else {
          setErrorProducts(res?.message || "Failed to load products.");
        }
      } catch (err) {
        setErrorProducts(err?.message || "Failed to load products.");
      } finally {
        setLoadingProducts(false);
      }
    };

    load();
  }, [shopId, pagination.current_page, pagination.per_page]);

  const handlePageChange = (_, value) => {
    setPagination((prev) => ({
      ...prev,
      current_page: value,
    }));
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: theme.palette.background?.default || colors.primary[500],
        py: 3,
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            mb: 2.5,
            p: { xs: 2, md: 3 },
            borderRadius: 4,
            border: `1px solid ${theme.palette.divider}`,
            background: `linear-gradient(135deg, ${colors.primary[400]}, ${colors.primary[500]})`,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -0.6 }}>
              Seller Products
            </Typography>
            <Typography variant="body2" sx={{ color: colors.gray[300], mt: 0.6 }}>
              {shop?.name ? `Storefront: ${shop.name}` : "Manage catalog, stock, and pricing."}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              sx={{ borderRadius: 999, textTransform: "none", fontWeight: 700 }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              startIcon={<AddOutlined />}
              onClick={() => navigate("/ecom/product/add")}
              sx={{
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 800,
                background: "linear-gradient(90deg, #6870fa, #4cceac)",
                color: colors.gray[900],
              }}
            >
              Add product
            </Button>
          </Stack>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card
              sx={{
                background: colors.primary[400],
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 900 }}>
                      Products
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.gray[300] }}>
                      {pagination.total ? `${pagination.total} items` : "Browse your catalog"}
                    </Typography>
                  </Box>
                  {(loadingShop || loadingProducts) && <CircularProgress size={20} />}
                </Box>

                {errorShop ? (
                  <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                    {errorShop}
                  </Typography>
                ) : null}

                {errorProducts ? (
                  <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                    {errorProducts}
                  </Typography>
                ) : null}

                {!loadingProducts && products.length === 0 ? (
                  <Typography variant="body2" sx={{ color: colors.gray[300] }}>
                    No products found.
                  </Typography>
                ) : null}

                <Grid container spacing={2}>
                  {products.map((product) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={product?.id ?? Math.random()}>
                      <ProductCard
                        product={product}
                        onView={(p) => {
                          if (p?.id) navigate(`/product/${p.id}`);
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>

                {pagination.last_page > 1 ? (
                  <Stack alignItems="center" sx={{ mt: 3 }}>
                    <Pagination
                      count={pagination.last_page}
                      page={pagination.current_page}
                      onChange={handlePageChange}
                      color="primary"
                    />
                  </Stack>
                ) : null}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default SellerPanelProducts;
