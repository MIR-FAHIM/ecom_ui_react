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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
  LinearProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
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
  CheckCircle,
  Inventory2,
  HourglassTop,
  CancelOutlined,
  StarBorder,
  InfoOutlined,
} from "@mui/icons-material";
import { getOrderDetails } from "../../../api/controller/admin_controller/order/order_controller";
import { tokens } from "../../../theme";
import ProductReviewForm from "../review/review_page.jsx";

// ─── Styled stepper connector ───────────────────────────────────────────────
const ColorConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: { top: 18 },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: "linear-gradient(95deg, #7c3aed 0%, #a78bfa 100%)",
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: "linear-gradient(95deg, #7c3aed 0%, #a78bfa 100%)",
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: theme.palette.mode === "dark" ? "#3f3f46" : "#e4e4e7",
    borderRadius: 1,
  },
}));

const ColorStepIconRoot = styled("div")(({ theme, ownerState }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#3f3f46" : "#e4e4e7",
  zIndex: 1,
  color: "#fff",
  width: 38,
  height: 38,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  ...(ownerState.active && {
    backgroundImage: "linear-gradient(136deg, #7c3aed 0%, #a78bfa 100%)",
    boxShadow: "0 4px 10px 0 rgba(124,58,237,.4)",
  }),
  ...(ownerState.completed && {
    backgroundImage: "linear-gradient(136deg, #7c3aed 0%, #a78bfa 100%)",
  }),
}));

function ColorStepIcon({ active, completed, icon, icons }) {
  return (
    <ColorStepIconRoot ownerState={{ active, completed }}>
      {icons[String(icon)]}
    </ColorStepIconRoot>
  );
}


const ORDER_STEPS = [
  { label: "Order Placed", icon: <ReceiptLong sx={{ fontSize: 18 }} /> },
  { label: "Processing", icon: <HourglassTop sx={{ fontSize: 18 }} /> },
  { label: "Packaging", icon: <Inventory2 sx={{ fontSize: 18 }} /> },
  { label: "On the Way", icon: <LocalShipping sx={{ fontSize: 18 }} /> },
  { label: "Delivered", icon: <CheckCircle sx={{ fontSize: 18 }} /> },
];

const STATUS_TO_STEP = {
  "new order": 0,
  processing: 1,
  packaging: 2,
  "on the way": 3,
  delivered: 4,
  completed: 4,
};

const UserOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isDark = theme.palette.mode === "dark";
  const border = theme.palette.divider || colors.primary[200];
  const pageBg = isDark ? colors.primary[500] : "#f5f3ff";
  const surface = isDark ? colors.primary[400] : "#ffffff";
  const surface2 = isDark ? colors.primary[300] : "#f3efff";
  const accentGradient = "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)";
  const cardShadow = isDark ? "none" : "0 4px 24px rgba(124,58,237,0.08)";

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewProductId, setReviewProductId] = useState("");
  const [reviewProductName, setReviewProductName] = useState("");

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
      processing: { label: "Processing", tone: "warning", icon: <HourglassTop fontSize="small" /> },
      packaging: { label: "Packaging", tone: "warning", icon: <Inventory2 fontSize="small" /> },
      "on the way": { label: "On the Way", tone: "info", icon: <LocalShipping fontSize="small" /> },
      delivered: { label: "Delivered", tone: "success", icon: <CheckCircle fontSize="small" /> },
      completed: { label: "Completed", tone: "success", icon: <CheckCircle fontSize="small" /> },
      cancelled: { label: "Cancelled", tone: "error", icon: <CancelOutlined fontSize="small" /> },
    };

    return (
      map[s] || {
        label: order?.status || "Unknown",
        tone: "default",
        icon: <InfoOutlined fontSize="small" />,
      }
    );
  }, [order?.status]);

  const activeStep = useMemo(() => {
    const s = normalizeStatus(order?.status);
    return STATUS_TO_STEP[s] ?? -1;
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
  const isOrderCompleted = normalizeStatus(order?.status) === "completed";

  const openReview = (item) => {
    const pid = item?.product_id ?? item?.id ?? "";
    if (!pid) return;
    setReviewProductId(String(pid));
    setReviewProductName(item?.product_name || "Product");
    setReviewOpen(true);
  };

  const closeReview = () => {
    setReviewOpen(false);
  };

  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 }, minHeight: "70vh" }}>
        <LinearProgress
          sx={{
            borderRadius: 1,
            mb: 3,
            "& .MuiLinearProgress-bar": { backgroundImage: accentGradient },
          }}
        />
        <Card sx={{ borderRadius: 1, background: surface, boxShadow: cardShadow }}>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={2} alignItems="center">
              <CircularProgress sx={{ color: "#7c3aed" }} />
              <Typography fontWeight={700} fontSize={18}>
                Loading order details…
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hang tight while we fetch your order.
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
        <Alert severity="error" sx={{ borderRadius: 1, mb: 2 }}>
          Order not found
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{
            borderRadius: 1,
            textTransform: "none",
            fontWeight: 700,
            backgroundImage: accentGradient,
            boxShadow: "0 4px 14px rgba(124,58,237,0.35)",
          }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 }, minHeight: "100vh", background: pageBg }}>

      {/* ── HEADER CARD ───────────────────────────────────────────── */}
      <Card
        sx={{
          mb: 2.5,
          borderRadius: 1,
          overflow: "hidden",
          background: surface,
          boxShadow: cardShadow,
          border: isDark ? `1px solid ${border}` : "none",
        }}
      >
        {/* gradient accent bar */}
        <Box sx={{ height: 4, backgroundImage: accentGradient }} />

        <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ sm: "center" }}
            justifyContent="space-between"
          >
            {/* left: back + title */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Tooltip title="Go back">
                <IconButton
                  onClick={() => navigate(-1)}
                  size="small"
                  sx={{
                    borderRadius: 1,
                    background: surface2,
                    "&:hover": { backgroundImage: accentGradient, color: "#fff" },
                    transition: "all 200ms ease",
                  }}
                >
                  <ArrowBack fontSize="small" />
                </IconButton>
              </Tooltip>

              <Box>
                <Typography
                  variant="h5"
                  fontWeight={900}
                  sx={{ lineHeight: 1.1, letterSpacing: "-0.02em" }}
                >
                  Order Details
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5, flexWrap: "wrap" }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: "text.secondary",
                      fontFamily: "monospace",
                      fontSize: 12,
                    }}
                  >
                    #{order.order_number}
                  </Typography>
                  <Chip
                    icon={statusMeta.icon}
                    label={statusMeta.label}
                    color={statusMeta.tone}
                    size="small"
                    sx={{ borderRadius: 1, fontWeight: 700, fontSize: 11 }}
                  />
                  <Chip
                    icon={<Payments sx={{ fontSize: "14px !important" }} />}
                    label={paymentMeta.label}
                    color={paymentMeta.tone}
                    variant="outlined"
                    size="small"
                    sx={{ borderRadius: 1, fontWeight: 700, fontSize: 11 }}
                  />
                </Stack>
              </Box>
            </Stack>

            {/* right: actions */}
            <Stack direction="row" spacing={1}>
              <Tooltip title="Print order">
                <IconButton
                  onClick={() => window.print()}
                  size="small"
                  sx={{
                    borderRadius: 1,
                    background: surface2,
                    "&:hover": { backgroundImage: accentGradient, color: "#fff" },
                    transition: "all 200ms ease",
                  }}
                >
                  <Print fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* ── ORDER PROGRESS STEPPER ────────────────────────────────── */}
      {activeStep >= 0 && (
        <Card
          sx={{
            mb: 2.5,
            borderRadius: 1,
            overflow: "hidden",
            background: surface,
            boxShadow: cardShadow,
            border: isDark ? `1px solid ${border}` : "none",
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, letterSpacing: 1, color: "text.secondary", mb: 2.5, textTransform: "uppercase" }}
            >
              Order Progress
            </Typography>
            <Stepper
              alternativeLabel
              activeStep={activeStep}
              connector={<ColorConnector />}
            >
              {ORDER_STEPS.map((step, idx) => (
                <Step key={step.label} completed={idx <= activeStep}>
                  <StepLabel
                    StepIconComponent={(props) =>
                      ColorStepIcon({
                        ...props,
                        icons: Object.fromEntries(
                          ORDER_STEPS.map((s, i) => [String(i + 1), s.icon])
                        ),
                      })
                    }
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: idx <= activeStep ? 800 : 500,
                        color: idx <= activeStep ? "#7c3aed" : "text.secondary",
                      }}
                    >
                      {step.label}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>
      )}

      {/* ── QUICK STAT CARDS ──────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        {[
          {
            icon: <CalendarMonth sx={{ fontSize: 20 }} />,
            label: "ORDER DATE",
            value: formatDate(order.created_at),
            gradient: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)",
          },
          {
            icon: <ShoppingBag sx={{ fontSize: 20 }} />,
            label: "ITEMS",
            value: String(itemsCount || orderItems.length || 0),
            gradient: "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)",
          },
          {
            icon: <Payments sx={{ fontSize: 20 }} />,
            label: "ORDER TOTAL",
            value: formatCurrency(order.total),
            gradient: "linear-gradient(135deg, #059669 0%, #34d399 100%)",
            highlight: true,
          },
        ].map((stat) => (
          <Grid item xs={12} sm={4} key={stat.label}>
            <Card
              sx={{
                borderRadius: 1,
                background: surface,
                boxShadow: cardShadow,
                border: isDark ? `1px solid ${border}` : "none",
                transition: "transform 150ms ease, box-shadow 150ms ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: isDark ? "none" : "0 8px 32px rgba(124,58,237,0.14)",
                },
              }}
            >
              <CardContent sx={{ p: 2.2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      width: 46,
                      height: 46,
                      borderRadius: 1,
                      display: "grid",
                      placeItems: "center",
                      backgroundImage: stat.gradient,
                      color: "#fff",
                      flexShrink: 0,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, letterSpacing: 0.8, color: "text.secondary" }}
                    >
                      {stat.label}
                    </Typography>
                    <Typography
                      fontWeight={900}
                      sx={{
                        mt: 0.2,
                        fontSize: stat.highlight ? 20 : 15,
                        color: stat.highlight ? "#7c3aed" : "text.primary",
                        lineHeight: 1.2,
                      }}
                    >
                      {stat.value}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ── CUSTOMER & SHIPPING ───────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        {/* Customer */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 1,
              background: surface,
              boxShadow: cardShadow,
              border: isDark ? `1px solid ${border}` : "none",
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <SectionHeader icon={<Person />} title="Customer" gradient={accentGradient} />
              <Divider sx={{ mb: 2, opacity: 0.15 }} />

              <Stack spacing={2}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar
                    sx={{
                      width: 44,
                      height: 44,
                      fontWeight: 700,
                      fontSize: 16,
                      borderRadius: 1,
                      backgroundImage: accentGradient,
                      color: "#fff",
                      boxShadow: "0 4px 10px rgba(124,58,237,0.3)",
                    }}
                  >
                    {getInitials(order.customer_name)}
                  </Avatar>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.8, color: "text.secondary" }}>
                      FULL NAME
                    </Typography>
                    <Typography fontWeight={800} sx={{ mt: 0.1 }}>
                      {order.customer_name || "N/A"}
                    </Typography>
                  </Box>
                </Stack>

                <Grid container spacing={1.5}>
                  <Grid item xs={6}>
                    <InfoBlock label="PHONE" value={order.customer_phone || "N/A"} surface2={surface2} />
                  </Grid>
                  <Grid item xs={6}>
                    <InfoBlock label="USER ID" value={String(order.user_id ?? "N/A")} surface2={surface2} />
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Shipping */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 1,
              background: surface,
              boxShadow: cardShadow,
              border: isDark ? `1px solid ${border}` : "none",
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <SectionHeader
                icon={<LocationOn />}
                title="Shipping"
                gradient="linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)"
              />
              <Divider sx={{ mb: 2, opacity: 0.15 }} />

              <Stack spacing={1.5}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    background: surface2,
                    border: isDark ? `1px solid ${border}` : "1px solid #ede9fe",
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.8, color: "text.secondary" }}>
                    ADDRESS
                  </Typography>
                  <Typography fontWeight={700} sx={{ mt: 0.3 }}>
                    {order.shipping_address || "N/A"}
                  </Typography>
                </Box>

                <Grid container spacing={1.5}>
                  <Grid item xs={4}>
                    <InfoBlock label="ZONE" value={order.zone || "N/A"} surface2={surface2} />
                  </Grid>
                  <Grid item xs={4}>
                    <InfoBlock label="DISTRICT" value={order.district || "N/A"} surface2={surface2} />
                  </Grid>
                  <Grid item xs={4}>
                    <InfoBlock label="AREA" value={order.area || "N/A"} surface2={surface2} />
                  </Grid>
                </Grid>

                {order.note ? (
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      background: isDark ? "#422006" : "#fffbeb",
                      border: "1px solid #fbbf24",
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.8, color: "#d97706" }}>
                      NOTE
                    </Typography>
                    <Typography sx={{ mt: 0.3, fontWeight: 600, fontSize: 13 }}>{order.note}</Typography>
                  </Box>
                ) : null}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── ORDER ITEMS TABLE ─────────────────────────────────────── */}
      <Card
        sx={{
          mb: 2.5,
          borderRadius: 1,
          overflow: "hidden",
          background: surface,
          boxShadow: cardShadow,
          border: isDark ? `1px solid ${border}` : "none",
        }}
      >
        <Box sx={{ px: 2.5, py: 2 }}>
          <SectionHeader
            icon={<ShoppingBag />}
            title="Order Items"
            gradient="linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)"
            subtitle={orderItems.length ? `${orderItems.length} product${orderItems.length > 1 ? "s" : ""}` : "No items"}
          />
        </Box>

        <Divider sx={{ opacity: 0.12 }} />

        {orderItems.length > 0 ? (
          <TableContainer>
            <Table sx={{ minWidth: 600 }}>
              <TableHead>
                <TableRow
                  sx={{
                    "& th": {
                      background: surface2,
                      fontWeight: 700,
                      fontSize: 11,
                      letterSpacing: 0.8,
                      color: "text.secondary",
                      textTransform: "uppercase",
                      py: 1.4,
                    },
                  }}
                >
                  <TableCell>Product</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell align="center">Unit Price</TableCell>
                  <TableCell align="center">Qty</TableCell>
                  <TableCell align="right">Line Total</TableCell>
                  <TableCell align="center">Status</TableCell>
                  {isOrderCompleted ? <TableCell align="center">Review</TableCell> : null}
                </TableRow>
              </TableHead>

              <TableBody>
                {orderItems.map((item, idx) => (
                  <TableRow
                    key={item.id ?? `${item.sku}-${idx}`}
                    sx={{
                      "&:hover": { background: surface2 },
                      transition: "background 150ms ease",
                      "& td": { borderBottom: `1px solid ${border}`, py: 1.4 },
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          variant="rounded"
                          src={item.image || undefined}
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1,
                            backgroundImage: accentGradient,
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: 13,
                          }}
                        >
                          {(item.product_name || "?")[0].toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography fontWeight={800} fontSize={13} sx={{ lineHeight: 1.2 }}>
                            {item.product_name}
                          </Typography>
                          {item.variant ? (
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              {item.variant}
                            </Typography>
                          ) : null}
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: "monospace", fontWeight: 600, color: "text.secondary", fontSize: 11 }}
                      >
                        {item.sku || "—"}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={700}>
                        {formatCurrency(item.unit_price)}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 30,
                          height: 30,
                          borderRadius: 1,
                          backgroundImage: accentGradient,
                          color: "#fff",
                          fontWeight: 800,
                          fontSize: 13,
                        }}
                      >
                        {item.qty}
                      </Box>
                    </TableCell>

                    <TableCell align="right">
                      <Typography fontWeight={800} sx={{ color: "#7c3aed" }}>
                        {formatCurrency(
                          item.line_total ?? Number(item.unit_price || 0) * Number(item.qty || 0)
                        )}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Chip
                        label={(item.status || "pending").toString()}
                        size="small"
                        color={normalizeStatus(item.status) === "pending" ? "warning" : "success"}
                        sx={{ borderRadius: 1, fontWeight: 700, fontSize: 11, textTransform: "capitalize" }}
                      />
                    </TableCell>

                    {isOrderCompleted ? (
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<StarBorder sx={{ fontSize: "14px !important" }} />}
                          onClick={() => openReview(item)}
                          sx={{
                            textTransform: "none",
                            fontWeight: 700,
                            borderRadius: 1,
                            borderColor: "#7c3aed",
                            color: "#7c3aed",
                            fontSize: 11,
                            "&:hover": {
                              backgroundImage: accentGradient,
                              color: "#fff",
                              borderColor: "transparent",
                            },
                            transition: "all 200ms ease",
                          }}
                        >
                          Review
                        </Button>
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <ShoppingBag sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
            <Typography color="text.secondary" fontWeight={600}>
              No items in this order
            </Typography>
          </Box>
        )}
      </Card>

      {/* ── ORDER SUMMARY ─────────────────────────────────────────── */}
      <Card
        sx={{
          borderRadius: 1,
          background: surface,
          overflow: "hidden",
          boxShadow: cardShadow,
          border: isDark ? `1px solid ${border}` : "none",
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <SectionHeader
            icon={<ReceiptLong />}
            title="Summary"
            gradient="linear-gradient(135deg, #059669 0%, #34d399 100%)"
          />
          <Divider sx={{ mb: 2, opacity: 0.15 }} />

          <Grid container spacing={2}>
            {/* Cost breakdown */}
            <Grid item xs={12} md={7}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  background: surface2,
                  border: isDark ? `1px solid ${border}` : "1px solid #ede9fe",
                }}
              >
                <Stack spacing={1.3}>
                  <Row label="Subtotal" value={formatCurrency(order.subtotal)} />
                  <Row label="Shipping Fee" value={formatCurrency(order.shipping_fee)} />
                  <Row
                    label="Discount"
                    value={`-${formatCurrency(order.discount)}`}
                    valueSx={{ color: "error.main", fontWeight: 800 }}
                  />
                  <Divider sx={{ opacity: 0.2 }} />
                  <Row
                    label="Total"
                    value={formatCurrency(order.total)}
                    labelSx={{ fontSize: 15, fontWeight: 800 }}
                    valueSx={{ fontSize: 20, fontWeight: 900, color: "#7c3aed" }}
                  />
                </Stack>
              </Box>
            </Grid>

            {/* Timeline */}
            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  background: surface2,
                  border: isDark ? `1px solid ${border}` : "1px solid #ede9fe",
                  height: "100%",
                }}
              >
                <Typography sx={{ fontWeight: 800, mb: 1.5, fontSize: 13, letterSpacing: 0.5 }}>
                  Timeline
                </Typography>
                <Stack spacing={1.2}>
                  <MiniMeta
                    icon={<CalendarMonth fontSize="small" />}
                    label="Created"
                    value={formatDate(order.created_at)}
                    surface2={surface2}
                    border={border}
                    accentGradient={accentGradient}
                  />
                  <MiniMeta
                    icon={<CalendarMonth fontSize="small" />}
                    label="Updated"
                    value={formatDate(order.updated_at)}
                    surface2={surface2}
                    border={border}
                    accentGradient={accentGradient}
                  />
                  <MiniMeta
                    icon={<LocalShipping fontSize="small" />}
                    label="Status"
                    valueChip={{ label: statusMeta.label, color: statusMeta.tone, icon: statusMeta.icon }}
                    surface2={surface2}
                    border={border}
                    accentGradient={accentGradient}
                  />
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ── REVIEW DIALOG ─────────────────────────────────────────── */}
      <Dialog
        open={reviewOpen}
        onClose={closeReview}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 1, overflow: "hidden" } }}
      >
        <Box sx={{ height: 4, backgroundImage: accentGradient }} />
        <DialogTitle sx={{ fontWeight: 800, fontSize: 18 }}>
          Write a Review{reviewProductName ? ` — ${reviewProductName}` : ""}
        </DialogTitle>
        <DialogContent dividers>
          <ProductReviewForm
            productId={reviewProductId}
            userId={order?.user_id}
            onSuccess={closeReview}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button
            onClick={closeReview}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ─── Helper sub-components ───────────────────────────────────────────────────

function SectionHeader({ icon, title, subtitle, gradient }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1.5,
          display: "grid",
          placeItems: "center",
          backgroundImage: gradient,
          color: "#fff",
          flexShrink: 0,
          boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
        }}
      >
        {React.cloneElement(icon, { sx: { fontSize: 18 } })}
      </Box>
      <Box>
        <Typography variant="h6" fontWeight={900} sx={{ lineHeight: 1.1 }}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
    </Stack>
  );
}

function InfoBlock({ label, value, surface2 }) {
  return (
    <Box
      sx={{
        p: 1.2,
        borderRadius: 1.5,
        background: surface2,
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.7, color: "text.secondary" }}>
        {label}
      </Typography>
      <Typography fontWeight={800} sx={{ mt: 0.2, fontSize: 13 }}>
        {value}
      </Typography>
    </Box>
  );
}

function Row({ label, value, labelSx, valueSx }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
      <Typography sx={{ fontWeight: 700, color: "text.secondary", fontSize: 13, ...labelSx }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 700, fontSize: 14, ...valueSx }}>{value}</Typography>
    </Box>
  );
}

function MiniMeta({ icon, label, value, valueChip, surface2, accentGradient }) {
  return (
    <Stack direction="row" spacing={1.2} alignItems="center">
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: 1,
          display: "grid",
          placeItems: "center",
          backgroundImage: accentGradient,
          color: "#fff",
          flexShrink: 0,
          opacity: 0.85,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.6, color: "text.secondary" }}>
          {label}
        </Typography>
        {valueChip ? (
          <Chip
            icon={valueChip.icon}
            label={valueChip.label}
            color={valueChip.color}
            size="small"
            sx={{ borderRadius: 1, fontWeight: 700, mt: 0.3, display: "flex", width: "fit-content" }}
          />
        ) : (
          <Typography noWrap sx={{ fontWeight: 800, fontSize: 13 }}>
            {value}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

export default UserOrderDetails;
