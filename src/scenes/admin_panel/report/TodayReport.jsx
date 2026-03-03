import React, { useEffect, useMemo, useState } from "react";
import { Box, Card, CardContent, CircularProgress, Grid, Typography, IconButton, Tooltip } from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../../../theme";
import { getTodayReport } from "../../../api/controller/admin_controller/report/report_controller";
import RefreshIcon from "@mui/icons-material/Refresh";

const TodayReport = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const loadReport = async () => {
    try {
      setLoading(true);
      const res = await getTodayReport();
      if (res?.status === "success") {
        setReport(res?.data ?? null);
      } else {
        setReport(null);
      }
    } catch (error) {
      console.error("Error loading today report:", error);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const stats = useMemo(() => {
    const data = report ?? {};
    return [
      { label: "Total Orders", value: data.total_orders ?? 0, tint: "#e9f3ff", accent: "#3b82f6" },
      { label: "Total Registered", value: data.total_registered ?? 0, tint: "#eefdf6", accent: "#10b981" },
      { label: "Website Visitors", value: data.website_visitors ?? 0, tint: "#fff6e9", accent: "#f59e0b" },
      { label: "Cart Clicked", value: data.cart_clicked ?? 0, tint: "#f6f1ff", accent: "#8b5cf6" },
      { label: "Product Clicked", value: data.product_clicked ?? 0, tint: "#f0f9ff", accent: "#0ea5e9" },
      { label: "Total Review", value: data.total_review ?? 0, tint: "#fff1f2", accent: "#f43f5e" },
      { label: "Total Earn", value: data.total_earn ?? 0, tint: "#ecfdf5", accent: "#22c55e", isMoney: true },
      { label: "Total Delivered", value: data.total_delivered ?? 0, tint: "#eff6ff", accent: "#2563eb" },
      { label: "Seller Onboard", value: data.seller_onboard ?? 0, tint: "#fdf4ff", accent: "#d946ef" },
    ];
  }, [report]);

  const formatValue = (value, isMoney) => {
    if (!isMoney) return value;
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Today Report
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {report?.date ? `Snapshot for ${report.date}` : "Snapshot of today’s activity and engagement."}
          </Typography>
        </Box>
        <Tooltip title="Refresh report">
          <IconButton onClick={loadReport} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {stats.map((stat) => (
            <Grid key={stat.label} item xs={12} sm={6} md={4} lg={3}>
              <Card
                sx={{
                  background: theme.palette.mode === "dark" ? colors.primary[400] : "#ffffff",
                  borderRadius: 3,
                  border: `1px solid ${colors.primary[200]}`,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background: `linear-gradient(135deg, ${stat.tint} 0%, rgba(255,255,255,0) 60%)`,
                    opacity: theme.palette.mode === "dark" ? 0.12 : 1,
                  }}
                />
                <CardContent sx={{ position: "relative" }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    {stat.label}
                  </Typography>
                  <Typography variant="h5" fontWeight={800} sx={{ mt: 0.8 }}>
                    {formatValue(stat.value, stat.isMoney)}
                  </Typography>
                  <Box
                    sx={{
                      mt: 1.6,
                      height: 4,
                      borderRadius: 999,
                      background: stat.tint,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        width: "55%",
                        height: "100%",
                        borderRadius: 999,
                        background: stat.accent,
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default TodayReport;
