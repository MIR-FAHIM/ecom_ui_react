import React from "react";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#ec4899"];

export default function SalesDonut({ inhouse = 0, seller = 0 }) {
  const total = inhouse + seller || 1;
  const inhousePct = ((inhouse / total) * 100).toFixed(1);
  const sellerPct = ((seller / total) * 100).toFixed(1);
  const angle = (inhouse / total) * 360;

  return (
    <Card sx={{ borderRadius: 2.5, border: "1px solid", borderColor: "divider", height: "100%" }}>
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
          Sales Distribution
        </Typography>

        <Stack direction="row" alignItems="center" spacing={3}>
          {/* Donut via conic-gradient */}
          <Box
            sx={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: `conic-gradient(${COLORS[0]} 0deg ${angle}deg, ${COLORS[1]} ${angle}deg 360deg)`,
              position: "relative",
              flexShrink: 0,
              "&::after": {
                content: '""',
                position: "absolute",
                top: "22%",
                left: "22%",
                width: "56%",
                height: "56%",
                borderRadius: "50%",
                bgcolor: "background.paper",
              },
            }}
          />

          <Stack spacing={1.5} sx={{ flex: 1 }}>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: COLORS[0] }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>In-house</Typography>
              </Stack>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, ml: 2.5 }}>
                ৳{inhouse.toLocaleString()} ({inhousePct}%)
              </Typography>
            </Box>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: COLORS[1] }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Seller</Typography>
              </Stack>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, ml: 2.5 }}>
                ৳{seller.toLocaleString()} ({sellerPct}%)
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
