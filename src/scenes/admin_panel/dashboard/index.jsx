import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
} from "@mui/material";

import Inventory2Icon from "@mui/icons-material/Inventory2";
import StorefrontIcon from "@mui/icons-material/Storefront";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import InsightsIcon from "@mui/icons-material/Insights";
import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import { dashboardReport } from "../../../api/controller/admin_controller/report/report_controller";

const moneyBDT = (n) =>
  new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(Number(n || 0));

const MetricCard = ({ title, value, icon, themeBits, onClick, accent = "a" }) => {
  const { divider, surface, surface2, ink, subInk, brandGradient, brandGlow, accents } = themeBits;

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
        backdropFilter: "blur(12px)",
        cursor: onClick ? "pointer" : "default",
        transition: "transform 140ms ease, box-shadow 200ms ease, border-color 200ms ease",
        "&:hover": onClick
          ? {
              transform: "translateY(-2px)",
              boxShadow: `0 18px 38px ${brandGlow}`,
              borderColor: "rgba(255,255,255,0.20)",
            }
          : undefined,
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" spacing={1.2} alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="body2" sx={{ color: subInk, fontWeight: 900 }}>
              {title}
            </Typography>
            <Typography sx={{ fontSize: 22, fontWeight: 950, color: ink, lineHeight: 1.1, mt: 0.6 }}>
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
              boxShadow: `0 14px 28px ${brandGlow}`,
            }}
          >
            {icon}
          </Box>
        </Stack>

        <Box sx={{ mt: 1.2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Chip
            size="small"
            label="View"
            sx={{
              borderRadius: 999,
              fontWeight: 900,
              background: surface2,
              border: `1px solid ${divider}`,
              color: ink,
            }}
          />
          <Box
            sx={{
              width: 60,
              height: 4,
              borderRadius: 999,
              background: brandGradient,
              opacity: 0.9,
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

function Dashboard() {
  const theme = useTheme();
  const navigate = useNavigate();

  // Theme helpers (same style used in your checkout/product pages)
  const themeBits = useMemo(() => {
    const brand = theme.palette.brand || {};
    const semantic = theme.palette.semantic || {};

    const divider = theme.palette.divider || "rgba(0,0,0,0.08)";
    const surface =
      semantic.surface || (theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)");
    const surface2 =
      semantic.surface2 || (theme.palette.mode === "dark" ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.06)");
    const ink = semantic.ink || (theme.palette.mode === "dark" ? "rgba(255,255,255,0.92)" : "rgba(0,0,0,0.88)");
    const subInk =
      semantic.subInk || (theme.palette.mode === "dark" ? "rgba(255,255,255,0.68)" : "rgba(0,0,0,0.58)");

    const brandGradient = brand.gradient || "linear-gradient(90deg, #FA5C5C, #FD8A6B, #FEC288, #FBEF76)";
    const brandGlow = brand.glow || (theme.palette.mode === "dark" ? "rgba(250,92,92,0.18)" : "rgba(250,92,92,0.12)");

    // Accent surfaces derived from your palette colors (safe fallback)
    const accents = {
      a: theme.palette.mode === "dark" ? "rgba(250,92,92,0.18)" : "rgba(250,92,92,0.14)",   // FA5C5C
      b: theme.palette.mode === "dark" ? "rgba(253,138,107,0.18)" : "rgba(253,138,107,0.14)", // FD8A6B
      c: theme.palette.mode === "dark" ? "rgba(254,194,136,0.18)" : "rgba(254,194,136,0.14)", // FEC288
      d: theme.palette.mode === "dark" ? "rgba(251,239,118,0.18)" : "rgba(251,239,118,0.14)", // FBEF76
    };

    return { divider, surface, surface2, ink, subInk, brandGradient, brandGlow, accents };
  }, [theme.palette]);

  const { divider, surface, surface2, ink, subInk, brandGradient, brandGlow } = themeBits;

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

  const breakdown = Array.isArray(metrics?.last_7_days_breakdown) ? metrics.last_7_days_breakdown : [];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: theme.palette.background?.default,
        backgroundImage:
          theme.palette.mode === "dark"
            ? `radial-gradient(1200px 700px at 10% 0%, rgba(251,239,118,0.10), transparent 55%),
               radial-gradient(1200px 700px at 90% 5%, rgba(250,92,92,0.10), transparent 55%),
               radial-gradient(1200px 700px at 50% 95%, rgba(254,194,136,0.08), transparent 55%)`
            : `radial-gradient(1200px 700px at 10% 0%, rgba(251,239,118,0.22), transparent 55%),
               radial-gradient(1200px 700px at 90% 5%, rgba(250,92,92,0.18), transparent 55%),
               radial-gradient(1200px 700px at 50% 95%, rgba(254,194,136,0.14), transparent 55%)`,
        p: 2.5,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          mb: 2,
          p: 2,
          borderRadius: 4,
          border: `1px solid ${divider}`,
          background: surface,
          backdropFilter: "blur(12px)",
          display: "flex",
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 950,
              letterSpacing: -0.7,
              background: brandGradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1.05,
            }}
          >
            Dashboard
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.6, color: subInk, fontWeight: 700 }}>
            Live overview of products, orders, customers, and sales.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            icon={<InsightsIcon />}
            label={loading ? "Refreshing..." : "Overview"}
            sx={{
              borderRadius: 999,
              fontWeight: 900,
              background: surface2,
              border: `1px solid ${divider}`,
              color: ink,
            }}
          />
          <Button
            onClick={() => navigate("/ecom/product/add")}
            startIcon={<AddIcon />}
            variant="contained"
            sx={{
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 950,
              px: 2,
              background: brandGradient,
              color: "#141414",
              boxShadow: `0 16px 34px ${brandGlow}`,
              "&:hover": { filter: "saturate(1.1)", boxShadow: `0 20px 40px ${brandGlow}` },
            }}
          >
            Add product
          </Button>
        </Stack>
      </Box>

      <Divider sx={{ mb: 2.5, opacity: 0.12 }} />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <Stack direction="row" spacing={1.2} alignItems="center">
            <CircularProgress size={18} />
            <Typography sx={{ color: subInk, fontWeight: 800 }}>Loading metrics...</Typography>
          </Stack>
        </Box>
      ) : (
        <>
          {/* Metrics */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Products"
                value={metrics?.products_count ?? 0}
                icon={<Inventory2Icon />}
                themeBits={themeBits}
                accent="a"
                onClick={() => navigate("/ecom/product/all")}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Shops"
                value={metrics?.shops_count ?? 0}
                icon={<StorefrontIcon />}
                themeBits={themeBits}
                accent="b"
                onClick={() => navigate("/ecom/shop/all")}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Customers"
                value={metrics?.customers_count ?? 0}
                icon={<PeopleAltIcon />}
                themeBits={themeBits}
                accent="c"
                onClick={() => navigate("/ecom/customer/all")}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Orders"
                value={metrics?.orders_count ?? 0}
                icon={<ReceiptLongIcon />}
                themeBits={themeBits}
                accent="d"
                onClick={() => navigate("/ecom/order/all")}
              />
            </Grid>
          </Grid>

          {/* Sales */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <MetricCard
                title="Total Sell"
                value={moneyBDT(metrics?.total_sell ?? 0)}
                icon={<InsightsIcon />}
                themeBits={themeBits}
                accent="c"
                onClick={() => navigate("/ecom/report/all")}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <MetricCard
                title="Today Sell"
                value={moneyBDT(metrics?.today_sell ?? 0)}
                icon={<InsightsIcon />}
                themeBits={themeBits}
                accent="a"
                onClick={() => navigate("/ecom/report/today")}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <MetricCard
                title="Last 7 Days"
                value={moneyBDT(metrics?.last_7_days_sell ?? 0)}
                icon={<InsightsIcon />}
                themeBits={themeBits}
                accent="b"
                onClick={() => navigate("/ecom/report/weekly")}
              />
            </Grid>
          </Grid>

          {/* Breakdown + Summary */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Card
                sx={{
                  borderRadius: 4,
                  border: `1px solid ${divider}`,
                  background: surface,
                  backdropFilter: "blur(12px)",
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 950, color: ink }}>
                        Sales Breakdown (Last 7 Days)
                      </Typography>
                      <Typography variant="body2" sx={{ color: subInk, fontWeight: 700, mt: 0.4 }}>
                        Daily totals for quick monitoring.
                      </Typography>
                    </Box>

                    <Tooltip title="View reports">
                      <IconButton
                        onClick={() => navigate("/ecom/report/weekly")}
                        sx={{
                          borderRadius: 3,
                          border: `1px solid ${divider}`,
                          background: surface2,
                          "&:hover": { background: surface },
                        }}
                      >
                        <ArrowForwardIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>

                  <Divider sx={{ my: 1.2, opacity: 0.12 }} />

                  {breakdown.length === 0 ? (
                    <Box sx={{ p: 2, borderRadius: 3, border: `1px solid ${divider}`, background: surface2 }}>
                      <Typography sx={{ fontWeight: 900, color: ink }}>No breakdown data</Typography>
                      <Typography variant="body2" sx={{ color: subInk, fontWeight: 700, mt: 0.4 }}>
                        The API did not return last_7_days_breakdown.
                      </Typography>
                    </Box>
                  ) : (
                    <List dense sx={{ p: 0 }}>
                      {breakdown.map((d) => (
                        <ListItem
                          key={d.date}
                          sx={{
                            borderRadius: 3,
                            mb: 1,
                            border: `1px solid ${divider}`,
                            background: surface2,
                          }}
                        >
                          <ListItemText
                            primary={
                              <Typography sx={{ fontWeight: 900, color: ink }}>
                                {d.date}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="body2" sx={{ color: subInk, fontWeight: 800 }}>
                                {moneyBDT(d.total)}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  borderRadius: 4,
                  border: `1px solid ${divider}`,
                  background: surface,
                  backdropFilter: "blur(12px)",
                  height: "100%",
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Typography sx={{ fontWeight: 950, color: ink }}>Summary</Typography>
                  <Divider sx={{ my: 1.2, opacity: 0.12 }} />

                  <Stack spacing={1}>
                    <Box
                      sx={{
                        p: 1.2,
                        borderRadius: 3,
                        border: `1px solid ${divider}`,
                        background: surface2,
                      }}
                    >
                      <Typography variant="body2" sx={{ color: subInk, fontWeight: 800 }}>
                        Active Carts
                      </Typography>
                      <Typography sx={{ fontWeight: 950, color: ink, fontSize: 18 }}>
                        {metrics?.active_carts ?? 0}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        p: 1.2,
                        borderRadius: 3,
                        border: `1px solid ${divider}`,
                        background: surface2,
                      }}
                    >
                      <Typography variant="body2" sx={{ color: subInk, fontWeight: 800 }}>
                        Yesterday Sell
                      </Typography>
                      <Typography sx={{ fontWeight: 950, color: ink, fontSize: 18 }}>
                        {moneyBDT(metrics?.yesterday_sell ?? 0)}
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 1.6, opacity: 0.12 }} />

                  <Button
                    fullWidth
                    onClick={() => navigate("/ecom/order/all")}
                    sx={{
                      borderRadius: 999,
                      textTransform: "none",
                      fontWeight: 950,
                      background: brandGradient,
                      color: "#141414",
                      boxShadow: `0 16px 34px ${brandGlow}`,
                      "&:hover": { filter: "saturate(1.1)", boxShadow: `0 20px 40px ${brandGlow}` },
                    }}
                    variant="contained"
                  >
                    Manage orders
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Quick actions */}
          <Box sx={{ mt: 3 }}>
            <Typography sx={{ fontWeight: 950, color: ink, mb: 1.2 }}>Quick Actions</Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  sx={{
                    borderRadius: 999,
                    textTransform: "none",
                    fontWeight: 950,
                    py: 1.25,
                    background: brandGradient,
                    color: "#141414",
                    boxShadow: `0 14px 30px ${brandGlow}`,
                    "&:hover": { filter: "saturate(1.1)", boxShadow: `0 18px 36px ${brandGlow}` },
                  }}
                  onClick={() => navigate("/ecom/product/add")}
                >
                  Add Product
                </Button>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{
                    borderRadius: 999,
                    textTransform: "none",
                    fontWeight: 950,
                    py: 1.25,
                    borderColor: divider,
                    background: surface,
                    "&:hover": { background: surface2, borderColor: theme.palette.primary.main },
                  }}
                  onClick={() => navigate("/ecom/order/all")}
                >
                  View Orders
                </Button>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{
                    borderRadius: 999,
                    textTransform: "none",
                    fontWeight: 950,
                    py: 1.25,
                    borderColor: divider,
                    background: surface,
                    "&:hover": { background: surface2, borderColor: theme.palette.primary.main },
                  }}
                  onClick={() => navigate("/ecom/product/all")}
                >
                  Manage Products
                </Button>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{
                    borderRadius: 999,
                    textTransform: "none",
                    fontWeight: 950,
                    py: 1.25,
                    borderColor: divider,
                    background: surface,
                    "&:hover": { background: surface2, borderColor: theme.palette.primary.main },
                  }}
                  onClick={() => navigate("/ecom/report/today")}
                >
                  View Reports
                </Button>
              </Grid>
            </Grid>
          </Box>
        </>
      )}
    </Box>
  );
}

export default Dashboard;
