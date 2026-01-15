import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Divider,
} from "@mui/material";
import { tokens } from "../../../theme";
import { dashboardReport } from "../../../api/controller/admin_controller/report/report_controller";
import { CircularProgress, List, ListItem, ListItemText } from "@mui/material";

function Dashboard() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await dashboardReport();
        if (res?.status === 'success' && res.data) {
          setMetrics(res.data);
        }
      } catch (e) {
        console.error('Failed to load dashboard report', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Simple layout skeleton (no API, no logic).
        </Typography>
      </Box>

      <Divider sx={{ mb: 3, opacity: 0.2 }} />

      {/* Metrics Row */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: colors.primary[400], borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">Products</Typography>
                  <Typography variant="h5" fontWeight={700}>{metrics?.products_count ?? 0}</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: colors.primary[400], borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">Shops</Typography>
                  <Typography variant="h5" fontWeight={700}>{metrics?.shops_count ?? 0}</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: colors.primary[400], borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">Customers</Typography>
                  <Typography variant="h5" fontWeight={700}>{metrics?.customers_count ?? 0}</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: colors.primary[400], borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">Orders</Typography>
                  <Typography variant="h5" fontWeight={700}>{metrics?.orders_count ?? 0}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Sales Row */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ background: colors.primary[400], borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">Total Sell</Typography>
                  <Typography variant="h5" fontWeight={700}>৳ {metrics?.total_sell ?? 0}</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ background: colors.primary[400], borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">Today Sell</Typography>
                  <Typography variant="h5" fontWeight={700}>৳ {metrics?.today_sell ?? 0}</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ background: colors.primary[400], borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">Last 7 Days</Typography>
                  <Typography variant="h5" fontWeight={700}>৳ {metrics?.last_7_days_sell ?? 0}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Breakdown and placeholders */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Card sx={{ background: colors.primary[400], borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={700}>Sales Breakdown (Last 7 Days)</Typography>
                  <List>
                    {metrics?.last_7_days_breakdown?.map((d) => (
                      <ListItem key={d.date}>
                        <ListItemText primary={d.date} secondary={`৳ ${d.total}`} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ background: colors.primary[400], borderRadius: 2, height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={700}>Summary</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Active Carts: {metrics?.active_carts ?? 0}</Typography>
                  <Typography variant="body2" color="text.secondary">Yesterday Sell: ৳ {metrics?.yesterday_sell ?? 0}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {/* Quick actions */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Quick Actions
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              sx={{ background: colors.blueAccent[500], py: 1.25 }}
              onClick={() => navigate("/ecom/product/add")}
            >
              Add Product
            </Button>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              sx={{ background: colors.blueAccent[500], py: 1.25 }}
              onClick={() => navigate("/ecom/order/all")}
            >
              View Orders
            </Button>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              sx={{ background: colors.blueAccent[500], py: 1.25 }}
              onClick={() => navigate("/ecom/product/all")}
            >
              Manage Products
            </Button>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              sx={{ background: colors.blueAccent[500], py: 1.25 }}
              onClick={() => navigate("/ecom/report/today")}
            >
              View Reports
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default Dashboard;
