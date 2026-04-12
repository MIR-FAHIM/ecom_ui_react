import React from "react";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";

const STATUS_MAP = {
  placed: { label: "Placed", color: "#3b82f6", bg: "#eff6ff" },
  confirmed: { label: "Confirmed", color: "#8b5cf6", bg: "#f5f3ff" },
  processed: { label: "Processed", color: "#f59e0b", bg: "#fffbeb" },
  delivered: { label: "Delivered", color: "#10b981", bg: "#ecfdf5" },
  cancelled: { label: "Cancelled", color: "#ef4444", bg: "#fef2f2" },
};

export default function OrderStatusBoard({ metrics }) {
  const items = [
    { key: "placed", count: metrics?.orders_placed ?? 0 },
    { key: "confirmed", count: metrics?.orders_confirmed ?? 0 },
    { key: "processed", count: metrics?.orders_processed ?? 0 },
    { key: "delivered", count: metrics?.orders_delivered ?? 0 },
    { key: "cancelled", count: metrics?.orders_cancelled ?? 0 },
  ];

  const total = items.reduce((s, i) => s + i.count, 0) || 1;

  return (
    <Card sx={{ borderRadius: 2.5, border: "1px solid", borderColor: "divider", height: "100%" }}>
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
          Order Status
        </Typography>

        {/* Progress bar */}
        <Box sx={{ display: "flex", height: 10, borderRadius: 5, overflow: "hidden", mb: 2.5 }}>
          {items.map((item) => {
            const pct = (item.count / total) * 100;
            const cfg = STATUS_MAP[item.key];
            return pct > 0 ? (
              <Box key={item.key} sx={{ width: `${pct}%`, bgcolor: cfg.color, transition: "width 500ms" }} />
            ) : null;
          })}
        </Box>

        <Stack spacing={1.2}>
          {items.map((item) => {
            const cfg = STATUS_MAP[item.key];
            return (
              <Stack key={item.key} direction="row" alignItems="center" spacing={1.2}>
                <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: cfg.color, flexShrink: 0 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>
                  {cfg.label}
                </Typography>
                <Box
                  sx={{
                    px: 1.2,
                    py: 0.2,
                    borderRadius: 1.5,
                    bgcolor: cfg.bg,
                    color: cfg.color,
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  {item.count}
                </Box>
              </Stack>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}
