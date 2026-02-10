import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Stack,
  Chip,
  Button,
  Divider,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  ShoppingCartOutlined,
  Inventory2Outlined,
  PaymentsOutlined,
  LocalShippingOutlined,
  CampaignOutlined,
  AddOutlined,
  StorefrontOutlined,
} from "@mui/icons-material";
import { tokens } from "../../../theme";
import { useNavigate } from "react-router-dom";
import { getShopReport, getShopMonthReport } from "../../../api/controller/admin_controller/report/report_controller";
import { getShopOrder } from "../../../api/controller/admin_controller/order/order_controller";
import { getAllShops } from "../../../api/controller/admin_controller/shop/shop_controller.jsx";

const safeArray = (x) => (Array.isArray(x) ? x : []);

const topProducts = [
  { name: "Lumen Sneakers", orders: 142, stock: "In stock" },
  { name: "Vanta Hoodie", orders: 118, stock: "Low stock" },
  { name: "Noir Backpack", orders: 96, stock: "In stock" },
];

const SellerDashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [report, setReport] = useState({
    shops_count: 0,
    orders_count: 0,
    orders_amount: 0,
    products_count: 0,
  });
  const [loadingReport, setLoadingReport] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loadingRecentOrders, setLoadingRecentOrders] = useState(false);
  const [monthReport, setMonthReport] = useState({ months: [] });
  const [loadingMonthReport, setLoadingMonthReport] = useState(false);
  const [shops, setShops] = useState([]);
  const [loadingShops, setLoadingShops] = useState(false);
  const [selectedShopId, setSelectedShopId] = useState("");

  useEffect(() => {
    const loadShops = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      setLoadingShops(true);
      try {
        const res = await getAllShops({ user_id: userId, page: 1, per_page: 200 });
        const payload = res?.data ?? res;
        const list = safeArray(payload?.data ?? payload);
        setShops(list);

        if (list.length === 1) {
          setSelectedShopId(String(list[0]?.id ?? ""));
        } else if (!selectedShopId && list.length > 0) {
          setSelectedShopId(String(list[0]?.id ?? ""));
        }
      } catch (error) {
        console.error("Failed to load shops", error);
        setShops([]);
      } finally {
        setLoadingShops(false);
      }
    };

    loadShops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadReport = async () => {
     

      setLoadingReport(true);
      try {
        const res = await getShopReport(userId);
        const data = res?.data ?? res?.data?.data ?? res ?? null;
        if (data && typeof data === "object") {
          setReport({
            shops_count: Number(data?.shops_count ?? 0),
            orders_count: Number(data?.orders_count ?? 0),
            orders_amount: Number(data?.orders_amount ?? 0),
            products_count: Number(data?.products_count ?? 0),
          });
        }
      } catch (error) {
        console.error("Failed to load shop report", error);
      } finally {
        setLoadingReport(false);
      }
    };

    loadReport();
  }, [selectedShopId]);

  useEffect(() => {
    const loadRecentOrders = async () => {
   
  
      if (!userId) return;




      setLoadingRecentOrders(true);
      try {
        const res = await getShopOrder(userId, { page: 1, per_page: 4 });
        const pageData = res?.data ?? {};
        const list = safeArray(pageData?.data);
        setRecentOrders(list);
      } catch (error) {
        console.error("Failed to load recent orders", error);
        setRecentOrders([]);
      } finally {
        setLoadingRecentOrders(false);
      }
    };

    loadRecentOrders();
  }, [selectedShopId]);

  useEffect(() => {
    const loadMonthReport = async () => {
      if (!selectedShopId) return;

      setLoadingMonthReport(true);
      try {
        const res = await getShopMonthReport(selectedShopId);
        const data = res?.data?.data ?? res?.data ?? res ?? null;
        const months = safeArray(data?.months);
        setMonthReport({ months });
      } catch (error) {
        console.error("Failed to load month report", error);
        setMonthReport({ months: [] });
      } finally {
        setLoadingMonthReport(false);
      }
    };

    loadMonthReport();
  }, [selectedShopId]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(amount || 0);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatMonthLabel = (value) => {
    if (!value) return "-";
    const parts = String(value).split("-");
    if (parts.length < 2) return String(value);
    const year = parts[0];
    const monthIndex = Math.max(0, Math.min(11, Number(parts[1]) - 1));
    const short = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][monthIndex];
    return `${short} ${String(year).slice(2)}`;
  };

  const stats = useMemo(
    () => [
      {
        label: "Revenue",
        value: formatCurrency(report.orders_amount),
        delta: loadingReport ? "Loading" : "Updated",
        icon: <PaymentsOutlined />,
        accent: "linear-gradient(135deg, rgba(104,112,250,0.25), rgba(76,206,172,0.12))",
      },
      {
        label: "Orders",
        value: String(report.orders_count ?? 0),
        delta: loadingReport ? "Loading" : "Updated",
        icon: <ShoppingCartOutlined />,
        accent: "linear-gradient(135deg, rgba(226,114,110,0.22), rgba(104,112,250,0.12))",
      },
      {
        label: "Products",
        value: String(report.products_count ?? 0),
        delta: loadingReport ? "Loading" : "Updated",
        icon: <Inventory2Outlined />,
        accent: "linear-gradient(135deg, rgba(76,206,172,0.28), rgba(104,112,250,0.12))",
      },
      {
        label: "Shops",
        value: String(report.shops_count ?? 0),
        delta: loadingReport ? "Loading" : "Updated",
        icon: <StorefrontOutlined />,
        accent: "linear-gradient(135deg, rgba(255,199,64,0.28), rgba(104,112,250,0.12))",
      },
    ],
    [report.orders_amount, report.orders_count, report.products_count, report.shops_count, loadingReport]
  );
  return (
    <Box
      sx={{
        minHeight: "100%",
        p: { xs: 2, md: 3 },
        fontFamily: '"Space Grotesk", "Source Sans 3", sans-serif',
        background: theme.palette.mode === "dark"
          ? "radial-gradient(1200px 700px at 20% -10%, rgba(104,112,250,0.15), transparent 60%), radial-gradient(800px 500px at 95% 15%, rgba(76,206,172,0.12), transparent 60%), radial-gradient(900px 600px at 40% 120%, rgba(226,114,110,0.12), transparent 60%)"
          : "radial-gradient(1200px 700px at 20% -10%, rgba(104,112,250,0.18), transparent 60%), radial-gradient(800px 500px at 95% 15%, rgba(76,206,172,0.16), transparent 60%), radial-gradient(900px 600px at 40% 120%, rgba(226,114,110,0.12), transparent 60%)",
      }}
    >
      <Box
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 4,
          border: `1px solid ${colors.primary[300]}`,
          background: `linear-gradient(135deg, ${colors.primary[400]}, ${colors.primary[500]})`,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          gap: 2,
          boxShadow: theme.palette.mode === "dark" ? "0 24px 60px rgba(15,20,40,0.55)" : "0 24px 60px rgba(104,112,250,0.15)",
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -0.8, color: colors.gray[100] }}>
            Seller Overview
          </Typography>
          <Typography variant="body2" sx={{ color: colors.gray[300], mt: 0.6 }}>
            Track sales momentum, fulfillment flow, and campaign impact in one place.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="seller-shop-select-label">Shop</InputLabel>
            <Select
              labelId="seller-shop-select-label"
              label="Shop"
              value={selectedShopId}
              onChange={(event) => setSelectedShopId(String(event.target.value))}
              disabled={loadingShops || shops.length === 0}
            >
              {shops.map((shop) => (
                <MenuItem key={shop?.id ?? Math.random()} value={String(shop?.id ?? "")}>
                  {shop?.name || `Shop ${shop?.id}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Chip
            icon={<CampaignOutlined />}
            label="Campaign live"
            sx={{
              borderRadius: 999,
              fontWeight: 800,
              border: `1px solid ${colors.primary[300]}`,
              backgroundColor: colors.primary[400],
              color: colors.gray[100],
            }}
          />
          <Button
            variant="contained"
            startIcon={<AddOutlined />}
            onClick={() => navigate("/seller/add/product")}
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

      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        {stats.map((item) => (
          <Grid item xs={12} sm={6} lg={3} key={item.label}>
            <Card
              sx={{
                height: "100%",
                borderRadius: 4,
                border: `1px solid ${colors.primary[300]}`,
                background: item.accent,
                backdropFilter: "blur(12px)",
              }}
            >
              <CardContent sx={{ p: 2.4 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" sx={{ color: colors.gray[300], fontWeight: 800 }}>
                      {item.label}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: colors.gray[100], mt: 0.4 }}>
                      {item.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 3,
                      display: "grid",
                      placeItems: "center",
                      border: `1px solid ${colors.primary[300]}`,
                      color: colors.gray[100],
                      background: `linear-gradient(145deg, ${colors.primary[400]}, ${colors.primary[300]})`,
                    }}
                  >
                    {item.icon}
                  </Box>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1.6 }}>
                  <Chip
                    label={item.delta}
                    size="small"
                    sx={{
                      backgroundColor: colors.primary[400],
                      color: colors.gray[100],
                      fontWeight: 800,
                    }}
                  />
                  <Typography variant="caption" sx={{ color: colors.gray[300] }}>
                    vs last month
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid item xs={12} lg={7}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 4,
              border: `1px solid ${colors.primary[300]}`,
              background: `linear-gradient(180deg, ${colors.primary[400]}, ${colors.primary[500]})`,
            }}
          >
            <CardContent sx={{ p: 2.6 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: colors.gray[100] }}>
                    Monthly Sales
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.gray[300] }}>
                    Last 12 months performance
                  </Typography>
                </Box>
                <Chip
                  icon={<LocalShippingOutlined />}
                  label="Month-wise"
                  size="small"
                  sx={{
                    borderRadius: 999,
                    fontWeight: 800,
                    backgroundColor: colors.primary[300],
                    color: colors.gray[100],
                  }}
                />
              </Stack>

              <Box sx={{ mt: 3 }}>
                {loadingMonthReport ? (
                  <Typography variant="caption" sx={{ color: colors.gray[400] }}>
                    Loading report...
                  </Typography>
                ) : monthReport.months.length === 0 ? (
                  <Typography variant="caption" sx={{ color: colors.gray[400] }}>
                    No report data yet.
                  </Typography>
                ) : (
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
                      gap: 1.2,
                      alignItems: "end",
                      height: 180,
                    }}
                  >
                    {monthReport.months.map((entry, index) => {
                      const maxAmount = Math.max(
                        1,
                        ...monthReport.months.map((m) => Number(m?.amount ?? 0))
                      );
                      const amount = Number(entry?.amount ?? 0);
                      const height = Math.round((amount / maxAmount) * 140) + 20;
                      return (
                        <Box key={`${entry?.month ?? "month"}-${index}`} sx={{ textAlign: "center" }}>
                          <Box
                            sx={{
                              height,
                              borderRadius: 2,
                              background: `linear-gradient(180deg, ${colors.blueAccent[400]}, ${colors.greenAccent[400]})`,
                              border: `1px solid ${colors.primary[300]}`,
                            }}
                          />
                          <Typography variant="caption" sx={{ color: colors.gray[400], mt: 0.6, display: "block" }}>
                            {formatMonthLabel(entry?.month)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: colors.gray[300] }}>
                            {formatCurrency(amount)}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Box>

              <Divider sx={{ my: 3, borderColor: colors.primary[300] }} />

              <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="flex-start">
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: colors.gray[300], fontWeight: 700 }}>
                    Payout forecast
                  </Typography>
                  <Typography variant="h5" sx={{ color: colors.gray[100], fontWeight: 900, mt: 0.4 }}>
                    BDT 82,540
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.gray[400] }}>
                    Next settlement in 2 days
                  </Typography>
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    p: 1.6,
                    borderRadius: 3,
                    border: `1px solid ${colors.primary[300]}`,
                    background: colors.primary[400],
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PaymentsOutlined sx={{ color: colors.greenAccent[500] }} />
                    <Typography variant="subtitle2" sx={{ color: colors.gray[200], fontWeight: 700 }}>
                      On-time payouts
                    </Typography>
                  </Stack>
                  <Typography variant="caption" sx={{ color: colors.gray[400] }}>
                    98% paid within 24 hours this month
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 4,
              border: `1px solid ${colors.primary[300]}`,
              background: `linear-gradient(180deg, ${colors.primary[400]}, ${colors.primary[500]})`,
            }}
          >
            <CardContent sx={{ p: 2.6 }}>
              <Typography variant="h6" sx={{ fontWeight: 900, color: colors.gray[100] }}>
                Recent Orders
              </Typography>
              <Typography variant="caption" sx={{ color: colors.gray[400] }}>
                Most recent activity across your storefront
              </Typography>

              <Stack spacing={1.6} sx={{ mt: 2.4 }}>
                {loadingRecentOrders ? (
                  <Typography variant="caption" sx={{ color: colors.gray[400] }}>
                    Loading recent orders...
                  </Typography>
                ) : recentOrders.length === 0 ? (
                  <Typography variant="caption" sx={{ color: colors.gray[400] }}>
                    No recent orders yet.
                  </Typography>
                ) : (
                  recentOrders.map((order) => (
                    <Box
                      key={order?.id ?? Math.random()}
                      sx={{
                        p: 1.4,
                        borderRadius: 3,
                        border: `1px solid ${colors.primary[300]}`,
                        backgroundColor: colors.primary[400],
                      }}
                    >
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="subtitle2" sx={{ color: colors.gray[100], fontWeight: 800 }}>
                            {order?.order?.order_number || `#${order?.id ?? ""}`}
                          </Typography>
                          <Typography variant="caption" sx={{ color: colors.gray[400] }}>
                            {order?.created_at ? formatDate(order.created_at) : "-"}
                          </Typography>
                        </Box>
                        <Stack alignItems="flex-end">
                          <Typography variant="subtitle2" sx={{ color: colors.gray[100], fontWeight: 800 }}>
                            {formatCurrency(order?.line_total)}
                          </Typography>
                          <Chip
                            label={order?.status || "pending"}
                            size="small"
                            sx={{
                              borderRadius: 999,
                              fontWeight: 700,
                              backgroundColor: colors.primary[300],
                              color: colors.gray[100],
                            }}
                          />
                        </Stack>
                      </Stack>
                    </Box>
                  ))
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid item xs={12} md={7}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 4,
              border: `1px solid ${colors.primary[300]}`,
              background: `linear-gradient(180deg, ${colors.primary[400]}, ${colors.primary[500]})`,
            }}
          >
            <CardContent sx={{ p: 2.6 }}>
              <Typography variant="h6" sx={{ fontWeight: 900, color: colors.gray[100] }}>
                Top Products
              </Typography>
              <Typography variant="caption" sx={{ color: colors.gray[400] }}>
                Most ordered items in the last 7 days
              </Typography>

              <Stack spacing={2} sx={{ mt: 2.4 }}>
                {topProducts.map((product) => (
                  <Box
                    key={product.name}
                    sx={{
                      p: 1.6,
                      borderRadius: 3,
                      border: `1px solid ${colors.primary[300]}`,
                      backgroundColor: colors.primary[400],
                    }}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="subtitle2" sx={{ color: colors.gray[100], fontWeight: 800 }}>
                          {product.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: colors.gray[400] }}>
                          {product.orders} orders
                        </Typography>
                      </Box>
                      <Chip
                        label={product.stock}
                        size="small"
                        sx={{
                          borderRadius: 999,
                          fontWeight: 700,
                          backgroundColor: colors.primary[300],
                          color: colors.gray[100],
                        }}
                      />
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 4,
              border: `1px solid ${colors.primary[300]}`,
              background: `linear-gradient(180deg, ${colors.primary[400]}, ${colors.primary[500]})`,
            }}
          >
            <CardContent sx={{ p: 2.6 }}>
              <Typography variant="h6" sx={{ fontWeight: 900, color: colors.gray[100] }}>
                Quick Actions
              </Typography>
              <Typography variant="caption" sx={{ color: colors.gray[400] }}>
                Shortcuts for daily seller operations
              </Typography>

              <Stack spacing={1.6} sx={{ mt: 2.4 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Inventory2Outlined />}
                  sx={{
                    borderRadius: 999,
                    borderColor: colors.primary[300],
                    color: colors.gray[100],
                    textTransform: "none",
                    fontWeight: 700,
                  }}
                >
                  Update inventory
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<LocalShippingOutlined />}
                  sx={{
                    borderRadius: 999,
                    borderColor: colors.primary[300],
                    color: colors.gray[100],
                    textTransform: "none",
                    fontWeight: 700,
                  }}
                >
                  Print shipping labels
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<CampaignOutlined />}
                  sx={{
                    borderRadius: 999,
                    borderColor: colors.primary[300],
                    color: colors.gray[100],
                    textTransform: "none",
                    fontWeight: 700,
                  }}
                >
                  Launch campaign
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SellerDashboard;
