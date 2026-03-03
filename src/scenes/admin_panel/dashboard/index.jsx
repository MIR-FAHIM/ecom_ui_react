import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  CircularProgress,
  Stack,
  Chip,
  useTheme,
} from "@mui/material";

import Inventory2Icon from "@mui/icons-material/Inventory2";
import StorefrontIcon from "@mui/icons-material/Storefront";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import InsightsIcon from "@mui/icons-material/Insights";
import CategoryIcon from "@mui/icons-material/Category";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import PendingActionsIcon from "@mui/icons-material/PendingActions";

import { dashboardReport } from "../../../api/controller/admin_controller/report/report_controller";
import { tokens } from "../../../theme";

const moneyBDT = (n) =>
  new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(Number(n || 0));

const StatCard = ({ title, value, icon, themeBits, accent = "a", footer, onClick }) => {
  const { divider, surface, surface2, ink, subInk, brandGlow, accents } = themeBits;

  const accentBg =
    accent === "a" ? accents.a :
    accent === "b" ? accents.b :
    accent === "c" ? accents.c :
    accents.d;

  return (
    <Card
      onClick={onClick}
      sx={{
        borderRadius: 4,
        border: `1px solid ${divider}`,
        background: surface,
        cursor: onClick ? "pointer" : "default",
        transition: "transform 140ms ease, box-shadow 200ms ease, border-color 200ms ease",
        "&:hover": onClick
          ? {
              transform: "translateY(-2px)",
              boxShadow: `0 18px 38px ${brandGlow}`,
              borderColor: "rgba(0,0,0,0.06)",
            }
          : undefined,
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" spacing={1.2} alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="body2" sx={{ color: subInk, fontWeight: 800 }}>
              {title}
            </Typography>
            <Typography sx={{ fontSize: 22, fontWeight: 900, color: ink, lineHeight: 1.1, mt: 0.6 }}>
              {value}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 3,
              display: "grid",
              placeItems: "center",
              border: `1px solid ${divider}`,
              background: accentBg,
              color: ink,
            }}
          >
            {icon}
          </Box>
        </Stack>

        {footer ? (
          <Box sx={{ mt: 1.6 }}>{footer}</Box>
        ) : null}
      </CardContent>
    </Card>
  );
};

function Dashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const colors = tokens(theme.palette.mode);

  // Theme helpers (same style used in your checkout/product pages)
  const themeBits = useMemo(() => {
    const divider = theme.palette.divider || colors.primary[200];
    const surface = colors.primary[400];
    const surface2 = colors.primary[300];
    const ink = colors.blueAccent[800];
    const subInk =  colors.blueAccent[900];

    const brandGlow = theme.palette.mode === "dark" ? "rgba(72, 90, 200, 0.25)" : "rgba(72, 90, 200, 0.18)";

    const accents = {
      a: theme.palette.mode === "dark" ? "rgba(104,112,250,0.22)" : "rgba(104,112,250,0.14)",
      b: theme.palette.mode === "dark" ? "rgba(76,206,172,0.20)" : "rgba(76,206,172,0.12)",
      c: theme.palette.mode === "dark" ? "rgba(226,114,110,0.20)" : "rgba(226,114,110,0.12)",
      d: theme.palette.mode === "dark" ? "rgba(250,92,92,0.20)" : "rgba(250,92,92,0.12)",
    };

    return { divider, surface, surface2, ink, subInk, brandGlow, accents };
  }, [theme.palette, colors]);

  const { divider, surface, surface2, ink, subInk, brandGlow } = themeBits;

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await dashboardReport();
        if (res?.status === "success" && res.data) {
          setMetrics(res.data);
        } else {
          setMetrics(null);
        }
      } catch (e) {
        console.error("Failed to load dashboard report", e);
        setMetrics(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const topCustomers = metrics?.top_customers ?? ["AR", "MS", "KT", "TL", "VR"];
  const topBrands = metrics?.top_brands ?? [
    { name: "Not Found", total: 4637393.25 },
    { name: "Akij Health And Hygiene", total: 19046.39 },
    { name: "Nautica", total: 2880 },
  ];
  const topCategories = metrics?.top_categories ?? [
    { name: "Fruits & Vegetables", total: 25495 },
    { name: "Cigars & Cigarettes", total: 18790 },
    { name: "Breakfast", total: 11165.5 },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: theme.palette.background?.default || colors.primary[500],
        p: { xs: 2, md: 2.5 },
      }}
    >
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: ink }}>
            Dashboard
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5, color: subInk, fontWeight: 700 }}>
            Overview of customers, sales, orders, and catalog performance.
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <Stack direction="row" spacing={1.2} alignItems="center">
              <CircularProgress size={18} />
              <Typography sx={{ color: subInk, fontWeight: 800 }}>Loading metrics...</Typography>
            </Stack>
          </Box>
        ) : (
          <Stack spacing={2.5}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Customer"
                  value={metrics?.customers_count ?? 0}
                  icon={<PeopleAltIcon fontSize="small" />}
                  themeBits={themeBits}
                  accent="a"
                  footer={
                    <Stack spacing={1}>
                      <Typography variant="caption" sx={{ color: subInk, fontWeight: 700 }}>
                        Top Customers
                      </Typography>
                      <Stack direction="row" spacing={0.8}>
                        {topCustomers.map((initials, idx) => (
                          <Box
                            key={`${initials}-${idx}`}
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              border: `1px solid ${divider}`,
                              background: surface2,
                              display: "grid",
                              placeItems: "center",
                              fontSize: 11,
                              fontWeight: 800,
                              color: ink,
                            }}
                          >
                            {initials}
                          </Box>
                        ))}
                      </Stack>
                    </Stack>
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Products"
                  value={metrics?.products_count ?? 0}
                  icon={<Inventory2Icon fontSize="small" />}
                  themeBits={themeBits}
                  accent="b"
                  footer={
                    <Stack spacing={0.7}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: "#33c24d" }} />
                        <Typography variant="caption" sx={{ color: subInk, fontWeight: 700 }}>
                          Inhouse Products
                        </Typography>
                        <Typography variant="caption" sx={{ color: ink, fontWeight: 800, ml: "auto" }}>
                          {metrics?.inhouse_products_count ?? 0}
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: "#1f9ef4" }} />
                        <Typography variant="caption" sx={{ color: subInk, fontWeight: 700 }}>
                          Sellers Products
                        </Typography>
                        <Typography variant="caption" sx={{ color: ink, fontWeight: 800, ml: "auto" }}>
                          {metrics?.seller_products_count ?? 0}
                        </Typography>
                      </Stack>
                    </Stack>
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Sales"
                  value={moneyBDT(metrics?.total_sell ?? 0)}
                  icon={<InsightsIcon fontSize="small" />}
                  themeBits={themeBits}
                  accent="c"
                  footer={
                    <Stack spacing={1}>
                      <Button
                        onClick={() => navigate("/ecom/report/monthly")}
                        variant="contained"
                        sx={{
                          borderRadius: 2.5,
                          textTransform: "none",
                          fontWeight: 800,
                          background: "#0a8ef2",
                          color: "#fff",
                          justifyContent: "space-between",
                          px: 1.8,
                        }}
                      >
                        Sales this month
                        <Typography component="span" sx={{ fontWeight: 900 }}>
                          {moneyBDT(metrics?.this_month_sell ?? metrics?.today_sell ?? 0)}
                        </Typography>
                      </Button>
                      <Typography variant="caption" sx={{ color: subInk, fontWeight: 700 }}>
                        Sales Stat
                      </Typography>
                      <Box sx={{ height: 12, display: "flex", alignItems: "center" }}>
                        <Box sx={{ flex: 1, height: 3, borderRadius: 999, background: "#d8ecff" }} />
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: "#0a8ef2",
                            ml: -1.2,
                          }}
                        />
                      </Box>
                      <Stack direction="row" spacing={1.5} sx={{ mt: 0.5 }}>
                        <Stack direction="row" spacing={0.6} alignItems="center">
                          <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: "#7a6bf6" }} />
                          <Typography variant="caption" sx={{ color: subInk, fontWeight: 700 }}>
                            In-house Sales
                          </Typography>
                          <Typography variant="caption" sx={{ color: ink, fontWeight: 800 }}>
                            {moneyBDT(metrics?.inhouse_sell ?? 0)}
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.6} alignItems="center">
                          <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: "#34c759" }} />
                          <Typography variant="caption" sx={{ color: subInk, fontWeight: 700 }}>
                            Sellers Sales
                          </Typography>
                          <Typography variant="caption" sx={{ color: ink, fontWeight: 800 }}>
                            {moneyBDT(metrics?.seller_sell ?? 0)}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Sellers"
                  value={metrics?.shops_count ?? 0}
                  icon={<StorefrontIcon fontSize="small" />}
                  themeBits={themeBits}
                  accent="d"
                  footer={
                    <Stack spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: "#33c24d" }} />
                        <Typography variant="caption" sx={{ color: subInk, fontWeight: 700 }}>
                          Approved Sellers
                        </Typography>
                        <Typography variant="caption" sx={{ color: ink, fontWeight: 800, ml: "auto" }}>
                          {metrics?.approved_sellers_count ?? 0}
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: "#ff5c5c" }} />
                        <Typography variant="caption" sx={{ color: subInk, fontWeight: 700 }}>
                          Pending Seller
                        </Typography>
                        <Typography variant="caption" sx={{ color: ink, fontWeight: 800, ml: "auto" }}>
                          {metrics?.pending_sellers_count ?? 0}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.8}>
                        {["AR", "BR", "CR", "DR", "ER"].map((initials) => (
                          <Box
                            key={initials}
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: "50%",
                              border: `1px solid ${divider}`,
                              background: surface2,
                              display: "grid",
                              placeItems: "center",
                              fontSize: 10,
                              fontWeight: 800,
                              color: ink,
                            }}
                          >
                            {initials}
                          </Box>
                        ))}
                      </Stack>
                      <Stack spacing={0.8}>
                        <Button
                          variant="contained"
                          sx={{
                            borderRadius: 2.5,
                            textTransform: "none",
                            fontWeight: 800,
                            background: "#e7fff1",
                            color: "#1a9b5f",
                          }}
                          onClick={() => navigate("/ecom/seller/all")}
                        >
                          All Sellers
                        </Button>
                        <Button
                          variant="contained"
                          sx={{
                            borderRadius: 2.5,
                            textTransform: "none",
                            fontWeight: 800,
                            background: "#ffeef1",
                            color: "#ff4d6d",
                          }}
                          onClick={() => navigate("/ecom/seller/pending")}
                        >
                          Pending Sellers
                        </Button>
                      </Stack>
                    </Stack>
                  }
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <StatCard
                  title="Total Category"
                  value={metrics?.categories_count ?? 0}
                  icon={<CategoryIcon fontSize="small" />}
                  themeBits={themeBits}
                  accent="b"
                  footer={
                    <Stack spacing={0.7}>
                      {[
                        { name: "Fresh Vegetables", total: 849538.52, color: "#ff7aa2" },
                        { name: "Basmati Rice", total: 293179.53, color: "#f7c04a" },
                        { name: "Ghee Vog rice", total: 260147.11, color: "#60a5fa" },
                      ].map((row) => (
                        <Stack key={row.name} direction="row" alignItems="center" spacing={1}>
                          <Box sx={{ width: 14, height: 4, borderRadius: 999, background: row.color }} />
                          <Typography variant="caption" sx={{ color: subInk, fontWeight: 700 }}>
                            {row.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: ink, fontWeight: 800, ml: "auto" }}>
                            {moneyBDT(row.total)}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  }
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <StatCard
                  title="Total Brands"
                  value={metrics?.brands_count ?? 0}
                  icon={<LocalOfferIcon fontSize="small" />}
                  themeBits={themeBits}
                  accent="a"
                  footer={
                    <Stack spacing={0.7}>
                      <Typography variant="caption" sx={{ color: subInk, fontWeight: 700 }}>
                        Top Brands
                      </Typography>
                      {topBrands.map((row) => (
                        <Stack key={row.name} direction="row" alignItems="center" spacing={1}>
                          <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
                          <Typography variant="caption" sx={{ color: subInk, fontWeight: 700 }}>
                            {row.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: ink, fontWeight: 800, ml: "auto" }}>
                            {moneyBDT(row.total)}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  }
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <StatCard
                  title="Total Order"
                  value={metrics?.orders_count ?? 0}
                  icon={<ReceiptLongIcon fontSize="small" />}
                  themeBits={themeBits}
                  accent="c"
                  footer={
                    <Button
                      fullWidth
                      variant="contained"
                      sx={{
                        borderRadius: 2.5,
                        textTransform: "none",
                        fontWeight: 800,
                        background: "#8b5cf6",
                      }}
                      onClick={() => navigate("/ecom/order/all")}
                    >
                      All Orders
                    </Button>
                  }
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Stack spacing={2}>
                  <Card
                    sx={{
                      borderRadius: 4,
                      border: `1px solid ${divider}`,
                      background: "#f1f5ff",
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Stack direction="row" alignItems="center" spacing={1.2}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 2,
                            background: "#e0e7ff",
                            display: "grid",
                            placeItems: "center",
                            color: "#2563eb",
                          }}
                        >
                          <ShoppingCartIcon fontSize="small" />
                        </Box>
                        <Box>
                          <Typography variant="body2" sx={{ color: subInk, fontWeight: 800 }}>
                            Order placed
                          </Typography>
                          <Typography sx={{ color: ink, fontWeight: 900 }}>
                            {metrics?.orders_placed ?? 0}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>

                  <Card
                    sx={{
                      borderRadius: 4,
                      border: `1px solid ${divider}`,
                      background: "#ecfdf5",
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Stack direction="row" alignItems="center" spacing={1.2}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 2,
                            background: "#d1fae5",
                            display: "grid",
                            placeItems: "center",
                            color: "#10b981",
                          }}
                        >
                          <TaskAltIcon fontSize="small" />
                        </Box>
                        <Box>
                          <Typography variant="body2" sx={{ color: subInk, fontWeight: 800 }}>
                            Confirmed Order
                          </Typography>
                          <Typography sx={{ color: ink, fontWeight: 900 }}>
                            {metrics?.orders_confirmed ?? 0}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>

                  <Card
                    sx={{
                      borderRadius: 4,
                      border: `1px solid ${divider}`,
                      background: "#fef2f2",
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Stack direction="row" alignItems="center" spacing={1.2}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 2,
                            background: "#fee2e2",
                            display: "grid",
                            placeItems: "center",
                            color: "#ef4444",
                          }}
                        >
                          <PendingActionsIcon fontSize="small" />
                        </Box>
                        <Box>
                          <Typography variant="body2" sx={{ color: subInk, fontWeight: 800 }}>
                            Processed Order
                          </Typography>
                          <Typography sx={{ color: ink, fontWeight: 900 }}>
                            {metrics?.orders_processed ?? 0}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Stack>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    borderRadius: 4,
                    border: `1px solid ${divider}`,
                    background: surface,
                    height: "100%",
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Typography sx={{ fontWeight: 900, color: ink }}>In-house Top Category</Typography>
                    <Typography variant="caption" sx={{ color: subInk, fontWeight: 700 }}>
                      By Sales
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1.2 }}>
                      {[
                        { label: "All", active: true },
                        { label: "Today" },
                        { label: "Week" },
                        { label: "Month" },
                      ].map((tab) => (
                        <Chip
                          key={tab.label}
                          label={tab.label}
                          size="small"
                          sx={{
                            borderRadius: 2,
                            fontWeight: 800,
                            background: tab.active ? "#0a8ef2" : surface2,
                            color: tab.active ? "#fff" : subInk,
                          }}
                        />
                      ))}
                    </Stack>

                    <Stack spacing={1.2} sx={{ mt: 2 }}>
                      {topCategories.map((row) => (
                        <Stack key={row.name} direction="row" alignItems="center" spacing={1}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: 2,
                              border: `1px solid ${divider}`,
                              background: surface2,
                            }}
                          />
                          <Typography variant="body2" sx={{ color: subInk, fontWeight: 700 }}>
                            {row.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#ff4d6d", fontWeight: 800, ml: "auto" }}>
                            {moneyBDT(row.total)}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    borderRadius: 4,
                    border: `1px solid ${divider}`,
                    background: surface,
                    height: "100%",
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Typography sx={{ fontWeight: 900, color: ink }}>In-house Top Brands</Typography>
                    <Typography variant="caption" sx={{ color: subInk, fontWeight: 700 }}>
                      By Sales
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1.2 }}>
                      {[
                        { label: "All", active: true },
                        { label: "Today" },
                        { label: "Week" },
                        { label: "Month" },
                      ].map((tab) => (
                        <Chip
                          key={tab.label}
                          label={tab.label}
                          size="small"
                          sx={{
                            borderRadius: 2,
                            fontWeight: 800,
                            background: tab.active ? "#ff4d6d" : surface2,
                            color: tab.active ? "#fff" : subInk,
                          }}
                        />
                      ))}

                    </Stack>
                    <Stack spacing={1.2} sx={{ mt: 2 }}>
                      {topBrands.map((row) => (
                        <Stack key={row.name} direction="row" alignItems="center" spacing={1}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: 2,
                              border: `1px solid ${divider}`,
                              background: surface2,
                            }}
                          />
                          <Typography variant="body2" sx={{ color: subInk, fontWeight: 700 }}>
                            {row.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#ff4d6d", fontWeight: 800, ml: "auto" }}>
                            {moneyBDT(row.total)}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}

export default Dashboard;
