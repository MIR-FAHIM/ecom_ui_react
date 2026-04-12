import React from "react";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

export default function KpiCard({ title, value, subtitle, icon, color, bgColor, trend, trendLabel, onClick }) {
  const isUp = trend === "up";
  return (
    <Card
      onClick={onClick}
      sx={{
        borderRadius: 2.5,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        cursor: onClick ? "pointer" : "default",
        transition: "transform 160ms, box-shadow 160ms",
        "&:hover": onClick ? { transform: "translateY(-2px)", boxShadow: 6 } : undefined,
        height: "100%",
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Stack spacing={1.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, fontSize: 11 }}>
                {title}
              </Typography>
              <Typography sx={{ fontSize: 26, fontWeight: 800, lineHeight: 1.2, mt: 0.5 }}>
                {value}
              </Typography>
            </Box>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                bgcolor: bgColor || "action.hover",
                color: color || "primary.main",
              }}
            >
              {icon}
            </Box>
          </Stack>

          {(subtitle || trendLabel) && (
            <Stack direction="row" alignItems="center" spacing={0.8}>
              {trend && (
                <Stack direction="row" alignItems="center" spacing={0.3} sx={{ color: isUp ? "#16a34a" : "#dc2626" }}>
                  {isUp ? <TrendingUpIcon sx={{ fontSize: 16 }} /> : <TrendingDownIcon sx={{ fontSize: 16 }} />}
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "inherit" }}>
                    {trendLabel}
                  </Typography>
                </Stack>
              )}
              {subtitle && (
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                  {subtitle}
                </Typography>
              )}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
