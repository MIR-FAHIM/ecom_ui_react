import React, { useMemo } from "react";
import { Box, Card, CardContent, Stack, Typography, useTheme } from "@mui/material";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function SalesChart({ monthlyData = [] }) {
  const theme = useTheme();

  const chartData = useMemo(() => {
    if (monthlyData.length) {
      return monthlyData.slice(-12).map((m) => ({
        label: m.month || m.label || "",
        value: Number(m.total || m.amount || m.sales || 0),
      }));
    }
    // fallback: empty 12 months
    return MONTHS.map((m) => ({ label: m, value: 0 }));
  }, [monthlyData]);

  const maxVal = Math.max(...chartData.map((d) => d.value), 1);
  const total = chartData.reduce((s, d) => s + d.value, 0);

  const barColor = theme.palette.mode === "dark" ? "#818cf8" : "#6366f1";
  const barHover = theme.palette.mode === "dark" ? "#a5b4fc" : "#4f46e5";

  return (
    <Card sx={{ borderRadius: 2.5, border: "1px solid", borderColor: "divider", height: "100%" }}>
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Monthly Revenue
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
              Last {chartData.length} months
            </Typography>
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: 18 }}>
            ৳{total.toLocaleString()}
          </Typography>
        </Stack>

        {/* Simple CSS bar chart */}
        <Box sx={{ display: "flex", alignItems: "flex-end", gap: 0.5, height: 140, mt: 1 }}>
          {chartData.map((d, i) => {
            const pct = (d.value / maxVal) * 100;
            return (
              <Box key={i} sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
                <Box
                  sx={{
                    width: "100%",
                    maxWidth: 32,
                    height: `${Math.max(pct, 3)}%`,
                    bgcolor: barColor,
                    borderRadius: "4px 4px 0 0",
                    transition: "height 500ms ease, background 200ms",
                    "&:hover": { bgcolor: barHover },
                    minHeight: 4,
                  }}
                  title={`${d.label}: ৳${d.value.toLocaleString()}`}
                />
                <Typography variant="caption" sx={{ fontSize: 9, color: "text.secondary", fontWeight: 600 }}>
                  {d.label}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
}
