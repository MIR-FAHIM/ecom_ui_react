import React from "react";
import { Box, Card, CardContent, Chip, Stack, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const STATUS_CHIP = {
  pending: { label: "Pending", color: "warning" },
  confirmed: { label: "Confirmed", color: "info" },
  processing: { label: "Processing", color: "secondary" },
  delivered: { label: "Delivered", color: "success" },
  cancelled: { label: "Cancelled", color: "error" },
};

const moneyBDT = (n) =>
  new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 }).format(Number(n || 0));

export default function RecentOrdersTable({ orders = [] }) {
  const navigate = useNavigate();
  const list = orders.slice(0, 8);

  return (
    <Card sx={{ borderRadius: 2.5, border: "1px solid", borderColor: "divider", height: "100%" }}>
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Recent Orders
          </Typography>
          <Button
            size="small"
            onClick={() => navigate("/ecom/order/all")}
            sx={{ textTransform: "none", fontWeight: 700, fontSize: 12 }}
          >
            View All
          </Button>
        </Stack>

        {!list.length ? (
          <Typography variant="body2" color="text.secondary">No recent orders.</Typography>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", "& th, & td": { px: 1.5, py: 1, textAlign: "left", fontSize: 13 }, "& th": { fontWeight: 700, color: "text.secondary", borderBottom: "2px solid", borderColor: "divider", whiteSpace: "nowrap" }, "& td": { borderBottom: "1px solid", borderColor: "divider" } }}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {list.map((o) => {
                  const status = (o.status || o.order_status || "pending").toLowerCase();
                  const cfg = STATUS_CHIP[status] || STATUS_CHIP.pending;
                  return (
                    <Box
                      component="tr"
                      key={o.id}
                      onClick={() => navigate(`/admin/order/${o.id}`)}
                      sx={{ cursor: "pointer", transition: "background 120ms", "&:hover": { bgcolor: "action.hover" } }}
                    >
                      <td style={{ fontWeight: 600 }}>#{o.id}</td>
                      <td>{o.user?.name || o.customer_name || "—"}</td>
                      <td style={{ fontWeight: 700 }}>{moneyBDT(o.total || o.grand_total || o.amount)}</td>
                      <td>
                        <Chip label={cfg.label} color={cfg.color} size="small" sx={{ fontWeight: 700, fontSize: 11, height: 22 }} />
                      </td>
                    </Box>
                  );
                })}
              </tbody>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
