import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
} from "@mui/material";
import { ArrowBack, Print } from "@mui/icons-material";
import { tokens } from "../../../theme";
import { getOrderDetails } from "../../../api/controller/admin_controller/order/order_controller";

const UserOrderDetails = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await getOrderDetails(id);
        if (response.status === "success" && response.data) {
          setOrder(response.data);
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrderDetails();
    }
  }, [id]);


  const getOrderStatusColor = (status) => {
    const statusMap = {
      "new order": "info",
      processing: "warning",
      "on the way": "info",
      delivered: "success",
      completed: "success",
      cancelled: "error",
    };
    return statusMap[status] || "default";
  };

  const getPaymentStatusColor = (status) => {
    const statusMap = {
      paid: "success",
      unpaid: "error",
      pending: "warning",
      refunded: "info",
    };
    return statusMap[status] || "default";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Order not found</Alert>
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button variant="outlined" size="small" startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
              Back
            </Button>
            <Box>
              <Typography variant="h4" fontWeight={800}>
                Order Details
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {order.order_number}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" startIcon={<Print />} onClick={() => window.print()}>
            Print
          </Button>
        </Box>
      </Box>

      

      {/* Status Section */}
      <Card sx={{ background: colors.primary[400], mb: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  CURRENT STATUS
                </Typography>
                <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}>
                  <Chip label={order.status} color={getOrderStatusColor(order.status)} />
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  PAYMENT STATUS
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip label={order.payment_status} color={getPaymentStatusColor(order.payment_status)} variant="outlined" />
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  ORDER DATE
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {formatDate(order.created_at)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  LAST UPDATED
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {formatDate(order.updated_at)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        {/* Customer Information */}
        <Grid item xs={12} md={6}>
          <Card sx={{ background: colors.primary[400] }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Customer Information
              </Typography>
              <Divider sx={{ mb: 2, opacity: 0.2 }} />

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    NAME
                  </Typography>
                  <Typography variant="body2">{order.customer_name}</Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    PHONE
                  </Typography>
                  <Typography variant="body2">{order.customer_phone}</Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    USER ID
                  </Typography>
                  <Typography variant="body2">{order.user_id}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Shipping Information */}
        <Grid item xs={12} md={6}>
          <Card sx={{ background: colors.primary[400] }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Shipping Information
              </Typography>
              <Divider sx={{ mb: 2, opacity: 0.2 }} />

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    ADDRESS
                  </Typography>
                  <Typography variant="body2">{order.shipping_address}</Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    ZONE
                  </Typography>
                  <Typography variant="body2">{order.zone || "N/A"}</Typography>
                </Box>

                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        DISTRICT
                      </Typography>
                      <Typography variant="body2">{order.district || "N/A"}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        AREA
                      </Typography>
                      <Typography variant="body2">{order.area || "N/A"}</Typography>
                    </Box>
                  </Grid>
                </Grid>

                {order.note && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      NOTE
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {order.note}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Order Items */}
      <Card sx={{ background: colors.primary[400], mt: 2 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={700}>
              Order Items
            </Typography>
          </Box>
          <Divider sx={{ opacity: 0.2 }} />

          {order.items && order.items.length > 0 ? (
            <TableContainer>
              <Table sx={{ borderCollapse: "collapse" }}>
                <TableHead sx={{ backgroundColor: colors.primary[300] }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, borderBottom: `1px solid ${colors.primary[200]}` }}>
                      Product
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, borderBottom: `1px solid ${colors.primary[200]}` }}>
                      SKU
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, borderBottom: `1px solid ${colors.primary[200]}`, textAlign: "center" }}>
                      Unit Price
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, borderBottom: `1px solid ${colors.primary[200]}`, textAlign: "center" }}>
                      Qty
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, borderBottom: `1px solid ${colors.primary[200]}`, textAlign: "right" }}>
                      Line Total
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, borderBottom: `1px solid ${colors.primary[200]}`, textAlign: "center" }}>
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map((item, idx) => {
                    const isEven = idx % 2 === 0;
                    return (
                      <TableRow
                        key={item.id}
                        sx={{
                          backgroundColor: isEven ? colors.primary[300] : "transparent",
                          borderBottom: `1px solid ${colors.primary[200]}`,
                        }}
                      >
                        <TableCell sx={{ borderBottom: `1px solid ${colors.primary[200]}` }}>
                          <Typography variant="body2" fontWeight={600}>
                            {item.product_name}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: `1px solid ${colors.primary[200]}` }}>
                          <Typography variant="body2">{item.sku}</Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: `1px solid ${colors.primary[200]}`, textAlign: "center" }}>
                          <Typography variant="body2">{formatCurrency(item.unit_price)}</Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: `1px solid ${colors.primary[200]}`, textAlign: "center" }}>
                          <Typography variant="body2" fontWeight={600}>
                            {item.qty}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: `1px solid ${colors.primary[200]}`, textAlign: "right" }}>
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(item.line_total)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: `1px solid ${colors.primary[200]}`, textAlign: "center" }}>
                          <Chip label={item.status} size="small" color={item.status === "pending" ? "warning" : "success"} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography color="text.secondary">No items in this order</Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card sx={{ background: colors.primary[400], mt: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Order Summary
          </Typography>
          <Divider sx={{ mb: 2, opacity: 0.2 }} />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, maxWidth: 400, ml: "auto" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2">Subtotal:</Typography>
              <Typography variant="body2">{formatCurrency(order.subtotal)}</Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2">Shipping Fee:</Typography>
              <Typography variant="body2">{formatCurrency(order.shipping_fee)}</Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2">Discount:</Typography>
              <Typography variant="body2" color="error">
                -{formatCurrency(order.discount)}
              </Typography>
            </Box>

            <Divider sx={{ opacity: 0.2 }} />

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="h6" fontWeight={700}>
                Total:
              </Typography>
              <Typography variant="h6" fontWeight={700} color={colors.blueAccent[500]}>
                {formatCurrency(order.total)}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserOrderDetails;
