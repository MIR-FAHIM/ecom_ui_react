import React from "react";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";

const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#3b82f6", "#ec4899", "#8b5cf6", "#14b8a6"];

export default function MiniBarChart({ title, data = [], valueKey = "total", labelKey = "name" }) {
  const max = Math.max(...data.map((d) => Number(d[valueKey] || 0)), 1);

  return (
    <Card sx={{ borderRadius: 2.5, border: "1px solid", borderColor: "divider", height: "100%" }}>
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
          {title}
        </Typography>
        <Stack spacing={1.5}>
          {data.slice(0, 6).map((item, i) => {
            const val = Number(item[valueKey] || 0);
            const pct = (val / max) * 100;
            const color = COLORS[i % COLORS.length];
            return (
              <Box key={item[labelKey] || i}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", maxWidth: "60%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item[labelKey] || "N/A"}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    {val.toLocaleString()}
                  </Typography>
                </Stack>
                <Box sx={{ height: 6, borderRadius: 3, bgcolor: "action.hover", overflow: "hidden" }}>
                  <Box
                    sx={{
                      height: "100%",
                      width: `${Math.max(pct, 2)}%`,
                      borderRadius: 3,
                      bgcolor: color,
                      transition: "width 600ms ease",
                    }}
                  />
                </Box>
              </Box>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}
