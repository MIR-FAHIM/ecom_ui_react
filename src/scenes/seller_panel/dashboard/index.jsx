import React from "react";
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
  LinearProgress,
  useTheme,
} from "@mui/material";
import {
  TrendingUpOutlined,
  ShoppingCartOutlined,
  Inventory2Outlined,
  PaymentsOutlined,
  StarRounded,
  LocalShippingOutlined,
  CampaignOutlined,
  AddOutlined,
} from "@mui/icons-material";
import { tokens } from "../../../theme";

const stats = [
  {
    label: "Revenue (30d)",
    value: "BDT 248,620",
    delta: "+12.4%",
    icon: <TrendingUpOutlined />,
    accent: "linear-gradient(135deg, rgba(104,112,250,0.25), rgba(76,206,172,0.12))",
  },
  {
    label: "Orders",
    value: "1,284",
    delta: "+4.1%",
    icon: <ShoppingCartOutlined />,
    accent: "linear-gradient(135deg, rgba(226,114,110,0.22), rgba(104,112,250,0.12))",
  },
  {
    label: "Active Products",
    value: "412",
    delta: "+18",
    icon: <Inventory2Outlined />,
    accent: "linear-gradient(135deg, rgba(76,206,172,0.28), rgba(104,112,250,0.12))",
  },
  {
    label: "Avg. Rating",
    value: "4.7",
    delta: "Top 8%",
    icon: <StarRounded />,
    accent: "linear-gradient(135deg, rgba(255,199,64,0.28), rgba(104,112,250,0.12))",
  },
];

const pulse = [
  { label: "Packed", value: 72, color: "#4cceac" },
  { label: "Shipped", value: 54, color: "#6870fa" },
  { label: "Delivered", value: 38, color: "#e2726e" },
];

const recentOrders = [
  { id: "#OR-4521", status: "Packed", amount: "BDT 4,220", time: "15 min ago" },
  { id: "#OR-4512", status: "Shipped", amount: "BDT 6,900", time: "1 hr ago" },
  { id: "#OR-4499", status: "Delivered", amount: "BDT 2,180", time: "3 hr ago" },
  { id: "#OR-4492", status: "Packed", amount: "BDT 1,520", time: "6 hr ago" },
];

const topProducts = [
  { name: "Lumen Sneakers", orders: 142, stock: "In stock" },
  { name: "Vanta Hoodie", orders: 118, stock: "Low stock" },
  { name: "Noir Backpack", orders: 96, stock: "In stock" },
];

const SellerDashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

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
                    Fulfillment Pulse
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.gray[300] }}>
                    Orders moving through the pipeline today
                  </Typography>
                </Box>
                <Chip
                  icon={<LocalShippingOutlined />}
                  label="Today"
                  size="small"
                  sx={{
                    borderRadius: 999,
                    fontWeight: 800,
                    backgroundColor: colors.primary[300],
                    color: colors.gray[100],
                  }}
                />
              </Stack>

              <Stack spacing={2.2} sx={{ mt: 3 }}>
                {pulse.map((step) => (
                  <Box key={step.label}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.8 }}>
                      <Typography variant="subtitle2" sx={{ color: colors.gray[200], fontWeight: 700 }}>
                        {step.label}
                      </Typography>
                      <Typography variant="caption" sx={{ color: colors.gray[400] }}>
                        {step.value}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={step.value}
                      sx={{
                        height: 8,
                        borderRadius: 999,
                        backgroundColor: colors.primary[300],
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: step.color,
                          borderRadius: 999,
                        },
                      }}
                    />
                  </Box>
                ))}
              </Stack>

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
                {recentOrders.map((order) => (
                  <Box
                    key={order.id}
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
                          {order.id}
                        </Typography>
                        <Typography variant="caption" sx={{ color: colors.gray[400] }}>
                          {order.time}
                        </Typography>
                      </Box>
                      <Stack alignItems="flex-end">
                        <Typography variant="subtitle2" sx={{ color: colors.gray[100], fontWeight: 800 }}>
                          {order.amount}
                        </Typography>
                        <Chip
                          label={order.status}
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
                ))}
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
