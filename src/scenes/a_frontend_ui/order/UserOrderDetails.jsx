import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Stack,
  Tooltip,
  IconButton,
  Avatar,
} from "@mui/material";
import {
  ArrowBack,
  Print,
  LocalShipping,
  Person,
  LocationOn,
  CalendarMonth,
  Payments,
  ReceiptLong,
  ShoppingBag,
} from "@mui/icons-material";
import { getOrderDetails } from "../../../api/controller/admin_controller/order/order_controller";

const UserOrderDetails = () => {
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

    if (id) fetchOrderDetails();
  }, [id]);

  const normalizeStatus = (s) => (s || "").toString().trim().toLowerCase();

  const statusMeta = useMemo(() => {
    const s = normalizeStatus(order?.status);

    const map = {
      "new order": { label: "New Order", tone: "info", icon: <ReceiptLong fontSize="small" /> },
      processing: { label: "Processing", tone: "warning", icon: <ShoppingBag fontSize="small" /> },
      "on the way": { label: "On the Way", tone: "info", icon: <LocalShipping fontSize="small" /> },
      delivered: { label: "Delivered", tone: "success", icon: <LocalShipping fontSize="small" /> },
      completed: { label: "Completed", tone: "success", icon: <LocalShipping fontSize="small" /> },
      cancelled: { label: "Cancelled", tone: "error", icon: <ReceiptLong fontSize="small" /> },
    };

    return (
      map[s] || {
        label: order?.status || "Unknown",
        tone: "default",
        icon: <ReceiptLong fontSize="small" />,
      }
    );
  }, [order?.status]);

  const paymentMeta = useMemo(() => {
    const s = normalizeStatus(order?.payment_status);

    const map = {
      paid: { label: "Paid", tone: "success" },
      unpaid: { label: "Unpaid", tone: "error" },
      pending: { label: "Pending", tone: "warning" },
      refunded: { label: "Refunded", tone: "info" },
    };

    return map[s] || { label: order?.payment_status || "Unknown", tone: "default" };
  }, [order?.payment_status]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(Number(amount || 0));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name) => {
    const parts = (name || "").trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "U";
    const a = parts[0][0] || "U";
    const b = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (a + b).toUpperCase();
  };

  const orderItems = order?.items || [];
  const itemsCount = orderItems.reduce((sum, i) => sum + Number(i.qty || 0), 0);

  if (loading) {
    return (
      <Box
        sx={{
          p: { xs: 2, md: 3 },
          display: "grid",
          placeItems: "center",
          minHeight: "70vh",
          background:
            "radial-gradient(1200px 600px at 20% 10%, rgba(124, 58, 237, 0.18), transparent 55%), radial-gradient(1200px 600px at 80% 0%, rgba(34, 211, 238, 0.16), transparent 55%), radial-gradient(1200px 600px at 50% 90%, rgba(244, 114, 182, 0.14), transparent 55%)",
        }}
      >
        <Card
          sx={{
            width: { xs: "100%", sm: 460 },
            borderRadius: 4,
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
            backdropFilter: "blur(10px)",
            background: "rgba(255,255,255,0.06)",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={2} alignItems="center">
              <CircularProgress />
              <Typography fontWeight={800} sx={{ letterSpacing: 0.2 }}>
                Loading order vibes...
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Fetching the latest details for this order. Hang tight.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Alert
          severity="error"
          sx={{
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          Order not found
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mt: 2, borderRadius: 3, textTransform: "none", fontWeight: 700 }}
        >
          Back
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        minHeight: "100vh",
        background:
          "radial-gradient(1400px 700px at 10% 0%, rgba(34, 211, 238, 0.18), transparent 55%), radial-gradient(1400px 700px at 90% 5%, rgba(124, 58, 237, 0.18), transparent 55%), radial-gradient(1400px 700px at 50% 95%, rgba(244, 114, 182, 0.14), transparent 55%)",
      }}
    >
      {/* Header */}
      <Card
        sx={{
          mb: 2,
          borderRadius: 4,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(10px)",
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }} justifyContent="space-between">
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant="outlined"
                size="small"
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                sx={{
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 800,
                  px: 2,
                  borderColor: "rgba(255,255,255,0.18)",
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                Back
              </Button>

              <Box>
                <Typography
                  variant="h4"
                  fontWeight={900}
                  sx={{
                    lineHeight: 1.05,
                    letterSpacing: -0.6,
                    background: "linear-gradient(90deg, rgba(34,211,238,1), rgba(124,58,237,1), rgba(244,114,182,1))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Order Details
                </Typography>

                <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mt: 0.6, flexWrap: "wrap" }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                    {order.order_number}
                  </Typography>

                  <Chip
                    icon={statusMeta.icon}
                    label={statusMeta.label}
                    color={statusMeta.tone}
                    size="small"
                    sx={{ borderRadius: 999, fontWeight: 800, textTransform: "capitalize" }}
                  />

                  <Chip
                    icon={<Payments fontSize="small" />}
                    label={paymentMeta.label}
                    color={paymentMeta.tone}
                    variant="outlined"
                    size="small"
                    sx={{
                      borderRadius: 999,
                      fontWeight: 800,
                      borderColor: "rgba(255,255,255,0.18)",
                      background: "rgba(255,255,255,0.03)",
                    }}
                  />
                </Stack>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} justifyContent={{ xs: "flex-start", md: "flex-end" }}>
              <Tooltip title="Print this order">
                <IconButton
                  onClick={() => window.print()}
                  sx={{
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "rgba(255,255,255,0.18)",
                    background: "rgba(255,255,255,0.04)",
                  }}
                >
                  <Print />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Quick stats row */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(10px)",
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ p: 2.2 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 3,
                    display: "grid",
                    placeItems: "center",
                    background: "linear-gradient(135deg, rgba(34,211,238,0.35), rgba(124,58,237,0.25))",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  <CalendarMonth fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 900, letterSpacing: 0.8, color: "text.secondary" }}>
                    ORDER DATE
                  </Typography>
                  <Typography fontWeight={800} sx={{ mt: 0.4 }}>
                    {formatDate(order.created_at)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(10px)",
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ p: 2.2 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 3,
                    display: "grid",
                    placeItems: "center",
                    background: "linear-gradient(135deg, rgba(244,114,182,0.30), rgba(124,58,237,0.22))",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  <ReceiptLong fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 900, letterSpacing: 0.8, color: "text.secondary" }}>
                    ITEMS
                  </Typography>
                  <Typography fontWeight={900} sx={{ mt: 0.4, fontSize: 22 }}>
                    {itemsCount || orderItems.length || 0}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(10px)",
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ p: 2.2 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 3,
                    display: "grid",
                    placeItems: "center",
                    background: "linear-gradient(135deg, rgba(34,211,238,0.22), rgba(244,114,182,0.25))",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  <Payments fontSize="small" />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 900, letterSpacing: 0.8, color: "text.secondary" }}>
                    TOTAL
                  </Typography>
                  <Typography
                    fontWeight={950}
                    sx={{
                      mt: 0.4,
                      fontSize: 22,
                      background: "linear-gradient(90deg, rgba(34,211,238,1), rgba(244,114,182,1))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {formatCurrency(order.total)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {/* Customer Information */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(10px)",
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 3,
                    display: "grid",
                    placeItems: "center",
                    background: "linear-gradient(135deg, rgba(124,58,237,0.26), rgba(244,114,182,0.22))",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  <Person fontSize="small" />
                </Box>
                <Typography variant="h6" fontWeight={900}>
                  Customer
                </Typography>
              </Stack>

              <Divider sx={{ mb: 2, opacity: 0.22 }} />

              <Stack spacing={1.7}>
                <Stack direction="row" spacing={1.6} alignItems="center">
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      fontWeight: 900,
                      borderRadius: 3,
                      background: "linear-gradient(135deg, rgba(34,211,238,0.35), rgba(124,58,237,0.30))",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    {getInitials(order.customer_name)}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, letterSpacing: 0.8, color: "text.secondary" }}>
                      NAME
                    </Typography>
                    <Typography fontWeight={850} noWrap>
                      {order.customer_name || "N/A"}
                    </Typography>
                  </Box>
                </Stack>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 900, letterSpacing: 0.8, color: "text.secondary" }}>
                        PHONE
                      </Typography>
                      <Typography fontWeight={800}>{order.customer_phone || "N/A"}</Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 900, letterSpacing: 0.8, color: "text.secondary" }}>
                        USER ID
                      </Typography>
                      <Typography fontWeight={800}>{order.user_id ?? "N/A"}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Shipping Information */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(10px)",
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 3,
                    display: "grid",
                    placeItems: "center",
                    background: "linear-gradient(135deg, rgba(34,211,238,0.22), rgba(124,58,237,0.22))",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  <LocationOn fontSize="small" />
                </Box>
                <Typography variant="h6" fontWeight={900}>
                  Shipping
                </Typography>
              </Stack>

              <Divider sx={{ mb: 2, opacity: 0.22 }} />

              <Stack spacing={1.7}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 900, letterSpacing: 0.8, color: "text.secondary" }}>
                    ADDRESS
                  </Typography>
                  <Typography fontWeight={800} sx={{ mt: 0.3 }}>
                    {order.shipping_address || "N/A"}
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 900, letterSpacing: 0.8, color: "text.secondary" }}>
                        ZONE
                      </Typography>
                      <Typography fontWeight={800}>{order.zone || "N/A"}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 900, letterSpacing: 0.8, color: "text.secondary" }}>
                        DISTRICT
                      </Typography>
                      <Typography fontWeight={800}>{order.district || "N/A"}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 900, letterSpacing: 0.8, color: "text.secondary" }}>
                        AREA
                      </Typography>
                      <Typography fontWeight={800}>{order.area || "N/A"}</Typography>
                    </Box>
                  </Grid>
                </Grid>

                {order.note ? (
                  <Box
                    sx={{
                      mt: 0.5,
                      p: 1.4,
                      borderRadius: 3,
                      border: "1px solid rgba(255,255,255,0.14)",
                      background: "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 900, letterSpacing: 0.8, color: "text.secondary" }}>
                      NOTE
                    </Typography>
                    <Typography sx={{ mt: 0.5, fontWeight: 700 }}>{order.note}</Typography>
                  </Box>
                ) : null}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Order Items */}
      <Card
        sx={{
          mt: 2,
          borderRadius: 4,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 3,
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(135deg, rgba(244,114,182,0.28), rgba(34,211,238,0.20))",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              <ShoppingBag fontSize="small" />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={950} sx={{ lineHeight: 1.05 }}>
                Order Items
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700, mt: 0.2 }}>
                {orderItems.length ? `${orderItems.length} products` : "No items"}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Divider sx={{ opacity: 0.22 }} />

        {orderItems.length > 0 ? (
          <TableContainer sx={{ maxHeight: 520 }}>
            <Table stickyHeader sx={{ borderCollapse: "separate", borderSpacing: 0 }}>
              <TableHead
                sx={{
                  "& th": {
                    fontWeight: 900,
                    borderBottom: "1px solid rgba(255,255,255,0.14)",
                    background: "rgba(20, 20, 24, 0.35)",
                    backdropFilter: "blur(10px)",
                  },
                }}
              >
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell align="center">Unit Price</TableCell>
                  <TableCell align="center">Qty</TableCell>
                  <TableCell align="right">Line Total</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>

              <TableBody
                sx={{
                  "& td": { borderBottom: "1px solid rgba(255,255,255,0.10)" },
                }}
              >
                {orderItems.map((item, idx) => {
                  const isEven = idx % 2 === 0;

                  return (
                    <TableRow
                      key={item.id ?? `${item.sku}-${idx}`}
                      sx={{
                        background: isEven
                          ? "linear-gradient(90deg, rgba(34,211,238,0.06), rgba(124,58,237,0.04), rgba(244,114,182,0.06))"
                          : "transparent",
                        transition: "transform 120ms ease, background 200ms ease",
                        "&:hover": {
                          background:
                            "linear-gradient(90deg, rgba(34,211,238,0.10), rgba(124,58,237,0.08), rgba(244,114,182,0.10))",
                        },
                      }}
                    >
                      <TableCell>
                        <Typography fontWeight={900} sx={{ letterSpacing: -0.1 }}>
                          {item.product_name}
                        </Typography>
                        {item.variant ? (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.2, fontWeight: 700 }}>
                            {item.variant}
                          </Typography>
                        ) : null}
                      </TableCell>

                      <TableCell>
                        <Typography sx={{ fontWeight: 800 }}>{item.sku || "N/A"}</Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Typography sx={{ fontWeight: 800 }}>{formatCurrency(item.unit_price)}</Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Chip
                          label={item.qty}
                          size="small"
                          sx={{
                            borderRadius: 999,
                            fontWeight: 900,
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.14)",
                          }}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Typography sx={{ fontWeight: 950 }}>
                          {formatCurrency(item.line_total ?? Number(item.unit_price || 0) * Number(item.qty || 0))}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Chip
                          label={(item.status || "pending").toString()}
                          size="small"
                          color={normalizeStatus(item.status) === "pending" ? "warning" : "success"}
                          sx={{ borderRadius: 999, fontWeight: 900, textTransform: "capitalize" }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography color="text.secondary" sx={{ fontWeight: 800 }}>
              No items in this order
            </Typography>
          </Box>
        )}
      </Card>

      {/* Order Summary */}
      <Card
        sx={{
          mt: 2,
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(10px)",
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 3,
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(135deg, rgba(34,211,238,0.20), rgba(244,114,182,0.25))",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              <ReceiptLong fontSize="small" />
            </Box>
            <Typography variant="h6" fontWeight={950}>
              Summary
            </Typography>
          </Stack>

          <Divider sx={{ mb: 2, opacity: 0.22 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} md={7}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 4,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background:
                    "linear-gradient(135deg, rgba(34,211,238,0.08), rgba(124,58,237,0.06), rgba(244,114,182,0.08))",
                }}
              >
                <Stack spacing={1.2}>
                  <Row label="Subtotal" value={formatCurrency(order.subtotal)} />
                  <Row label="Shipping Fee" value={formatCurrency(order.shipping_fee)} />
                  <Row
                    label="Discount"
                    value={`-${formatCurrency(order.discount)}`}
                    valueSx={{ color: "error.main" }}
                  />
                  <Divider sx={{ opacity: 0.22 }} />
                  <Row
                    label="Total"
                    value={formatCurrency(order.total)}
                    labelSx={{ fontSize: 16, fontWeight: 950 }}
                    valueSx={{
                      fontSize: 18,
                      fontWeight: 950,
                      background: "linear-gradient(90deg, rgba(34,211,238,1), rgba(244,114,182,1))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  />
                </Stack>
              </Box>
            </Grid>

            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 4,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                <Typography sx={{ fontWeight: 950, mb: 1.2 }}>Timeline</Typography>

                <Stack spacing={1}>
                  <MiniMeta icon={<CalendarMonth fontSize="small" />} label="Created" value={formatDate(order.created_at)} />
                  <MiniMeta icon={<CalendarMonth fontSize="small" />} label="Updated" value={formatDate(order.updated_at)} />
                  <MiniMeta
                    icon={<LocalShipping fontSize="small" />}
                    label="Status"
                    value={statusMeta.label}
                    valueChip={{
                      label: statusMeta.label,
                      color: statusMeta.tone,
                      icon: statusMeta.icon,
                    }}
                  />
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

function Row({ label, value, labelSx, valueSx }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
      <Typography sx={{ fontWeight: 850, color: "text.secondary", ...labelSx }}>{label}</Typography>
      <Typography sx={{ fontWeight: 900, ...valueSx }}>{value}</Typography>
    </Box>
  );
}

function MiniMeta({ icon, label, value, valueChip }) {
  return (
    <Stack direction="row" spacing={1.2} alignItems="center" sx={{ minWidth: 0 }}>
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: 3,
          display: "grid",
          placeItems: "center",
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.03)",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 900, letterSpacing: 0.6, color: "text.secondary" }}>
          {label}
        </Typography>

        {valueChip ? (
          <Chip
            icon={valueChip.icon}
            label={valueChip.label}
            color={valueChip.color}
            size="small"
            sx={{ borderRadius: 999, fontWeight: 900, mt: 0.4 }}
          />
        ) : (
          <Typography noWrap sx={{ fontWeight: 850 }}>
            {value}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

export default UserOrderDetails;
