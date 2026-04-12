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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  TextField,
  MenuItem,
  Stack,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import PaymentOutlinedIcon from "@mui/icons-material/PaymentOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import LocalMallOutlinedIcon from "@mui/icons-material/LocalMallOutlined";
import NoteAltOutlinedIcon from "@mui/icons-material/NoteAltOutlined";
import DeliveryDiningOutlinedIcon from "@mui/icons-material/DeliveryDiningOutlined";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import jsPDF from "jspdf";
import { getOrderDetails, updateOrderStatusPatch, assignDeliveryBoy, unassignDeliveryBoy } from "../../../api/controller/admin_controller/order/order_controller";
import { getDeliveryMen } from "../../../api/controller/admin_controller/user_controller";

/* ── Constants ── */
const ACCENT = "#6366f1";
const ORDER_STATUS_CONFIG = {
  "new order":            { label: "New Order",   color: "#3b82f6", bg: "#eff6ff", icon: <ShoppingBagOutlinedIcon sx={{ fontSize: 14 }} /> },
  "order received":       { label: "Received",    color: "#f59e0b", bg: "#fffbeb", icon: <PendingActionsOutlinedIcon sx={{ fontSize: 14 }} /> },
  "assigned deliveryman": { label: "Assigned",    color: "#8b5cf6", bg: "#f5f3ff", icon: <DeliveryDiningOutlinedIcon sx={{ fontSize: 14 }} /> },
  "on the way":           { label: "On The Way",  color: "#0ea5e9", bg: "#f0f9ff", icon: <LocalShippingOutlinedIcon sx={{ fontSize: 14 }} /> },
  delivered:              { label: "Delivered",    color: "#10b981", bg: "#ecfdf5", icon: <CheckCircleOutlineIcon sx={{ fontSize: 14 }} /> },
  completed:              { label: "Completed",    color: "#059669", bg: "#ecfdf5", icon: <CheckCircleOutlineIcon sx={{ fontSize: 14 }} /> },
  cancelled:              { label: "Cancelled",    color: "#ef4444", bg: "#fef2f2", icon: <CancelOutlinedIcon sx={{ fontSize: 14 }} /> },
  pending:                { label: "Pending",      color: "#f59e0b", bg: "#fffbeb", icon: <PendingActionsOutlinedIcon sx={{ fontSize: 14 }} /> },
  processing:             { label: "Processing",   color: "#3b82f6", bg: "#eff6ff", icon: <SettingsOutlinedIcon sx={{ fontSize: 14 }} /> },
};
const PAYMENT_STATUS_CONFIG = {
  paid:     { label: "Paid",     color: "#10b981", bg: "#ecfdf5" },
  unpaid:   { label: "Unpaid",   color: "#ef4444", bg: "#fef2f2" },
  pending:  { label: "Pending",  color: "#f59e0b", bg: "#fffbeb" },
  refunded: { label: "Refunded", color: "#6366f1", bg: "#eef2ff" },
};
const ORDER_STATUSES = ["new order", "order received", "assigned deliveryman", "on the way", "delivered", "completed"];

/* ── Reusable components ── */
const StatusChip = ({ status, config }) => {
  const cfg = config[status] || config[String(status).toLowerCase()] || { label: status || "—", color: "#64748b", bg: "#f1f5f9" };
  return <Chip icon={cfg.icon || null} label={cfg.label} size="small" sx={{ fontWeight: 700, fontSize: 11, height: 26, bgcolor: cfg.bg, color: cfg.color, border: "1px solid", borderColor: cfg.color + "30", "& .MuiChip-icon": { color: cfg.color, ml: 0.5 } }} />;
};
const InfoRow = ({ icon, label, value }) => (
  <Stack direction="row" spacing={1.5} alignItems="flex-start">
    <Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: "#f1f5f9", display: "grid", placeItems: "center", color: "#64748b", flexShrink: 0, mt: 0.2 }}>{icon}</Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 700, textTransform: "uppercase", fontSize: 10, letterSpacing: 0.5 }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, wordBreak: "break-word" }}>{value || "—"}</Typography>
    </Box>
  </Stack>
);
const SectionHeader = ({ icon, title, color = ACCENT, bg = "#eef2ff" }) => (
  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
    <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: bg, display: "grid", placeItems: "center", color }}>{icon}</Box>
    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{title}</Typography>
  </Stack>
);

const cardSx = { borderRadius: 3, border: "1px solid", borderColor: "divider" };
const headCellSx = { fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: "text.secondary", py: 1.5, borderBottom: "2px solid", borderColor: "divider" };
const fieldSx = { "& .MuiOutlinedInput-root": { borderRadius: 2 }, "& .MuiInputLabel-root": { fontSize: 13 } };

const SellerOrderDetails = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { id } = useParams();
  const navigate = useNavigate();

  const [errMsg, setErrMsg] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deliveryMen, setDeliveryMen] = useState([]);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [selectedDeliveryManId, setSelectedDeliveryManId] = useState("");
  const [assignNote, setAssignNote] = useState("");
  const [assigning, setAssigning] = useState(false);

  const extractErrorMessage = (value, fallback) => {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (value?.message && typeof value.message === "string") return value.message;
    return fallback;
  };

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await getOrderDetails(id);
      if (response.status === "success" && response.data) setOrder(response.data);
    } catch (error) { console.error("Error fetching order details:", error); }
    finally { setLoading(false); }
  };

  const fetchDeliveryMenList = async () => {
    try {
      setDeliveryLoading(true);
      const response = await getDeliveryMen({ page: 1, per_page: 200 });
      if (response?.status === "success") {
        const paginator = response?.data;
        setDeliveryMen(Array.isArray(paginator?.data) ? paginator.data : []);
      } else { setDeliveryMen([]); }
    } catch (error) { console.error("Error fetching delivery men:", error); setDeliveryMen([]); }
    finally { setDeliveryLoading(false); }
  };

  useEffect(() => { if (id) { fetchOrderDetails(); fetchDeliveryMenList(); } }, [id]);

  const handleUpdateStatus = async (newStatusValue) => {
    if (!order || newStatusValue === order.status) return;
    try {
      setErrMsg(""); setUpdatingStatus(true);
      const response = await updateOrderStatusPatch(order.id, newStatusValue);
      if (response.status === "success") setOrder({ ...order, status: newStatusValue });
      else setErrMsg(extractErrorMessage(response?.message, "Failed to update order status"));
    } catch (error) {
      console.error("Error updating order status:", error);
      setErrMsg(extractErrorMessage(error?.response?.data?.message, "Failed to update order status"));
    } finally { setUpdatingStatus(false); }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(amount || 0);
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString("en-BD", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  const generateReceiptPdf = () => {
    if (!order) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    let y = 50;
    doc.setFontSize(18); doc.text("Order Receipt", margin, y); y += 18;
    doc.setFontSize(10);
    doc.text(`Order: ${order.order_number || order.id}`, margin, y);
    doc.text(`Date: ${formatDate(order.created_at)}`, pageWidth - margin - 160, y); y += 18;
    doc.setFontSize(11);
    doc.text(`Customer: ${order.customer_name || "N/A"}`, margin, y); y += 14;
    doc.text(`Phone: ${order.customer_phone || "N/A"}`, margin, y); y += 14;
    doc.text(`Address: ${order.shipping_address || "N/A"}`, margin, y); y += 20;
    const columns = [{ label: "Item", width: 260 }, { label: "Qty", width: 40 }, { label: "Unit", width: 90 }, { label: "Total", width: 90 }];
    const tableX = margin; const rowHeight = 18;
    doc.setFontSize(11); let x = tableX;
    columns.forEach((col) => { doc.text(col.label, x, y); x += col.width; });
    y += 8; doc.line(margin, y, pageWidth - margin, y); y += 14;
    const items = Array.isArray(order.items) ? order.items : [];
    items.forEach((item) => {
      const name = item.product_name || "Item";
      const nameLines = doc.splitTextToSize(name, columns[0].width - 6);
      const lineCount = Math.max(1, nameLines.length); const lineY = y + 2;
      doc.text(nameLines, tableX, lineY);
      doc.text(String(item.qty || 0), tableX + columns[0].width, lineY);
      doc.text(formatCurrency(item.unit_price), tableX + columns[0].width + columns[1].width, lineY);
      doc.text(formatCurrency(item.line_total), tableX + columns[0].width + columns[1].width + columns[2].width, lineY);
      y += rowHeight * lineCount;
      if (y > doc.internal.pageSize.getHeight() - 140) { doc.addPage(); y = 50; }
    });
    y += 10; doc.line(margin, y, pageWidth - margin, y); y += 16;
    doc.setFontSize(11);
    doc.text(`Subtotal: ${formatCurrency(order.subtotal)}`, pageWidth - margin - 200, y); y += 14;
    doc.text(`Shipping: ${formatCurrency(order.shipping_fee)}`, pageWidth - margin - 200, y); y += 14;
    doc.text(`Discount: -${formatCurrency(order.discount)}`, pageWidth - margin - 200, y); y += 18;
    doc.setFontSize(12); doc.text(`Total: ${formatCurrency(order.total)}`, pageWidth - margin - 200, y);
    doc.save(`order-${order.order_number || order.id}.pdf`);
  };

  const assignment = order?.delivery_man ?? null;
  const deliveryProfile = assignment?.delivery_man ?? null;

  useEffect(() => { if (assignment?.delivery_man_id) setSelectedDeliveryManId(String(assignment.delivery_man_id)); }, [assignment?.delivery_man_id]);

  const handleAssignDelivery = async () => {
    if (!order?.id || !selectedDeliveryManId) return;
    try {
      setErrMsg(""); setAssigning(true);
      const response = await assignDeliveryBoy({ delivery_man_id: selectedDeliveryManId, order_id: order.id, note: assignNote });
      if (response?.status === "success") await fetchOrderDetails();
      else setErrMsg(extractErrorMessage(response?.message, "Failed to assign delivery man"));
    } catch (error) {
      console.error("Error assigning delivery man:", error);
      setErrMsg(extractErrorMessage(error?.response?.data?.message, "Failed to assign delivery man"));
    } finally { setAssigning(false); }
  };

  const handleUnassignDelivery = async () => {
    if (!order?.id) return;
    try {
      setErrMsg(""); setAssigning(true);
      const response = await unassignDeliveryBoy({ order_id: order.id });
      if (response?.status === "success") { await fetchOrderDetails(); setSelectedDeliveryManId(""); setAssignNote(""); }
      else setErrMsg(extractErrorMessage(response?.message, "Failed to unassign delivery man"));
    } catch (error) {
      console.error("Error unassigning delivery man:", error);
      setErrMsg(extractErrorMessage(error?.response?.data?.message, "Failed to unassign delivery man"));
    } finally { setAssigning(false); }
  };

  /* ── Loading / empty states ── */
  if (loading) return <Box sx={{ p: 3, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}><CircularProgress sx={{ color: ACCENT }} /></Box>;
  if (!order) return <Box sx={{ p: 3 }}><Alert severity="error" sx={{ borderRadius: 2.5 }}>Order not found</Alert><Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mt: 2, borderRadius: 2, textTransform: "none" }}>Back</Button></Box>;

  const itemsArr = Array.isArray(order.items) ? order.items : [];
  const currentIdx = ORDER_STATUSES.indexOf(order.status);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: "auto" }}>

      {/* Header */}
      <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: isDark ? "#1e2030" : "#f1f5f9", "&:hover": { bgcolor: isDark ? "#262940" : "#e2e8f0" } }}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Box>
            <Typography variant="h5" fontWeight={800}>Order Details</Typography>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.3 }}>
              <Typography variant="body2" color="text.secondary">{order.order_number}</Typography>
              <StatusChip status={order.status} config={ORDER_STATUS_CONFIG} />
            </Stack>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button variant="contained" size="small" startIcon={<PictureAsPdfOutlinedIcon sx={{ fontSize: 16 }} />} onClick={generateReceiptPdf}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2, bgcolor: ACCENT, "&:hover": { bgcolor: "#4f46e5" }, boxShadow: `0 2px 8px ${ACCENT}30` }}>
            Receipt PDF
          </Button>
          <Button variant="outlined" size="small" startIcon={<PrintOutlinedIcon sx={{ fontSize: 16 }} />} onClick={() => window.print()}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2, borderColor: "divider", color: "text.primary" }}>
            Print
          </Button>
        </Stack>
      </Stack>

      {errMsg && <Alert severity="error" sx={{ mb: 2, borderRadius: 2.5 }}>{errMsg}</Alert>}

      {/* Summary Banner */}
      <Card variant="outlined" sx={{ ...cardSx, mb: 2.5, background: `linear-gradient(135deg, #eef2ff 0%, #f8fafc 100%)` }}>
        <CardContent sx={{ py: 2.5 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Avatar sx={{ width: 44, height: 44, bgcolor: ACCENT, borderRadius: 2.5 }}><ReceiptLongOutlinedIcon /></Avatar>
                <Box>
                  <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 700, fontSize: 10, letterSpacing: 0.5 }}>ORDER NO.</Typography>
                  <Typography variant="subtitle1" fontWeight={800}>{order.order_number || order.id}</Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 700, fontSize: 10, letterSpacing: 0.5 }}>STATUS</Typography>
              <Stack direction="row" spacing={0.75} flexWrap="wrap" sx={{ mt: 0.3 }}>
                <StatusChip status={order.status} config={ORDER_STATUS_CONFIG} />
                <StatusChip status={order.payment_status} config={PAYMENT_STATUS_CONFIG} />
              </Stack>
            </Grid>
            <Grid item xs={6} sm={4} sx={{ textAlign: { sm: "right" } }}>
              <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 700, fontSize: 10, letterSpacing: 0.5 }}>TOTAL</Typography>
              <Typography variant="h5" fontWeight={800} sx={{ color: ACCENT }}>{formatCurrency(order.total)}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Status Progress */}
      <Card variant="outlined" sx={{ ...cardSx, mb: 2.5 }}>
        <CardContent>
          <SectionHeader icon={<SettingsOutlinedIcon sx={{ fontSize: 18 }} />} title="Update Status" />
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {ORDER_STATUSES.map((s, i) => {
              const cfg = ORDER_STATUS_CONFIG[s] || {};
              const isActive = order.status === s;
              const isPast = currentIdx >= 0 && i < currentIdx;
              return (
                <Button key={s} size="small" disabled={updatingStatus || isActive} onClick={() => handleUpdateStatus(s)} startIcon={cfg.icon || null}
                  sx={{ textTransform: "capitalize", fontWeight: 700, fontSize: 12, borderRadius: 2, px: 2, border: "1.5px solid", borderColor: isActive ? cfg.color : isPast ? cfg.color + "40" : "divider", bgcolor: isActive ? cfg.bg : isPast ? cfg.bg + "80" : "transparent", color: isActive ? cfg.color : isPast ? cfg.color : "text.secondary", "&:hover": { bgcolor: cfg.bg, borderColor: cfg.color }, ...(isActive && { boxShadow: `0 2px 8px ${cfg.color}30` }) }}>
                  {cfg.label || s}
                </Button>
              );
            })}
          </Stack>
        </CardContent>
      </Card>

      {/* Info mini-cards */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        {[
          { icon: <CalendarTodayOutlinedIcon sx={{ fontSize: 16 }} />, label: "Order Date", value: formatDate(order.created_at), accent: "#3b82f6", bg: "#eff6ff" },
          { icon: <CalendarTodayOutlinedIcon sx={{ fontSize: 16 }} />, label: "Last Updated", value: formatDate(order.updated_at), accent: "#f59e0b", bg: "#fffbeb" },
          { icon: <PaymentOutlinedIcon sx={{ fontSize: 16 }} />, label: "Payment", value: <StatusChip status={order.payment_status} config={PAYMENT_STATUS_CONFIG} />, accent: "#10b981", bg: "#ecfdf5" },
          { icon: <LocalMallOutlinedIcon sx={{ fontSize: 16 }} />, label: "Items", value: `${itemsArr.length} product${itemsArr.length !== 1 ? "s" : ""}`, accent: "#8b5cf6", bg: "#f5f3ff" },
        ].map((c) => (
          <Grid item xs={6} md={3} key={c.label}>
            <Card variant="outlined" sx={{ ...cardSx, height: "100%" }}>
              <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: c.bg, display: "grid", placeItems: "center", color: c.accent }}>{c.icon}</Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 700, fontSize: 10, letterSpacing: 0.5 }}>{c.label}</Typography>
                    {typeof c.value === "string" ? <Typography variant="body2" fontWeight={600}>{c.value}</Typography> : c.value}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Customer + Shipping */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ ...cardSx, height: "100%" }}>
            <CardContent>
              <SectionHeader icon={<PersonOutlineIcon sx={{ fontSize: 18 }} />} title="Customer" />
              <Stack spacing={2}>
                <InfoRow icon={<BadgeOutlinedIcon sx={{ fontSize: 16 }} />} label="Name" value={order.customer_name} />
                <InfoRow icon={<PhoneOutlinedIcon sx={{ fontSize: 16 }} />} label="Phone" value={order.customer_phone} />
                <InfoRow icon={<BadgeOutlinedIcon sx={{ fontSize: 16 }} />} label="User ID" value={order.user_id} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ ...cardSx, height: "100%" }}>
            <CardContent>
              <SectionHeader icon={<LocationOnOutlinedIcon sx={{ fontSize: 18 }} />} title="Shipping" color="#10b981" bg="#ecfdf5" />
              <Stack spacing={2}>
                <InfoRow icon={<HomeOutlinedIcon sx={{ fontSize: 16 }} />} label="Address" value={order.shipping_address} />
                <Grid container spacing={1}>
                  <Grid item xs={4}><InfoRow icon={<LocationOnOutlinedIcon sx={{ fontSize: 16 }} />} label="Zone" value={order.zone || "N/A"} /></Grid>
                  <Grid item xs={4}><InfoRow icon={<LocationOnOutlinedIcon sx={{ fontSize: 16 }} />} label="District" value={order.district || "N/A"} /></Grid>
                  <Grid item xs={4}><InfoRow icon={<LocationOnOutlinedIcon sx={{ fontSize: 16 }} />} label="Area" value={order.area || "N/A"} /></Grid>
                </Grid>
                {order.note && <InfoRow icon={<NoteAltOutlinedIcon sx={{ fontSize: 16 }} />} label="Note" value={order.note} />}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Delivery Assignment */}
      <Card variant="outlined" sx={{ ...cardSx, mb: 2.5 }}>
        <CardContent>
          <SectionHeader icon={<AssignmentIndOutlinedIcon sx={{ fontSize: 18 }} />} title="Assign Delivery Man" color="#8b5cf6" bg="#f5f3ff" />
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField select fullWidth label="Delivery Man" value={selectedDeliveryManId} onChange={(e) => setSelectedDeliveryManId(e.target.value)} disabled={deliveryLoading || assigning} size="small" sx={fieldSx}>
                <MenuItem value="">Select delivery man</MenuItem>
                {deliveryMen.map((man) => <MenuItem key={man?.id} value={String(man?.id)}>{man?.name} ({man?.phone || "N/A"})</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField fullWidth label="Note" value={assignNote} onChange={(e) => setAssignNote(e.target.value)} disabled={assigning} size="small" sx={fieldSx} />
            </Grid>
            <Grid item xs={12} md={2}>
              {assignment ? (
                <Button fullWidth variant="outlined" onClick={handleUnassignDelivery} disabled={assigning} sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2, borderColor: "#ef4444", color: "#ef4444", "&:hover": { bgcolor: "#fef2f2", borderColor: "#ef4444" } }}>Unassign</Button>
              ) : (
                <Button fullWidth variant="contained" onClick={handleAssignDelivery} disabled={!selectedDeliveryManId || assigning} sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2, bgcolor: "#8b5cf6", "&:hover": { bgcolor: "#7c3aed" }, boxShadow: "0 2px 8px #8b5cf630" }}>Assign</Button>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Delivery Info */}
      {assignment && (
        <Card variant="outlined" sx={{ ...cardSx, mb: 2.5 }}>
          <CardContent>
            <SectionHeader icon={<DeliveryDiningOutlinedIcon sx={{ fontSize: 18 }} />} title="Delivery Information" color="#0ea5e9" bg="#f0f9ff" />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <InfoRow icon={<SettingsOutlinedIcon sx={{ fontSize: 16 }} />} label="Delivery Status" value={<StatusChip status={assignment?.status ?? "N/A"} config={ORDER_STATUS_CONFIG} />} />
                  <InfoRow icon={<NoteAltOutlinedIcon sx={{ fontSize: 16 }} />} label="Note" value={assignment?.note || "N/A"} />
                  <InfoRow icon={<CalendarTodayOutlinedIcon sx={{ fontSize: 16 }} />} label="Assigned At" value={assignment?.created_at ? formatDate(assignment.created_at) : "N/A"} />
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <InfoRow icon={<BadgeOutlinedIcon sx={{ fontSize: 16 }} />} label="Delivery Man" value={deliveryProfile?.name ?? "N/A"} />
                  <InfoRow icon={<EmailOutlinedIcon sx={{ fontSize: 16 }} />} label="Email" value={deliveryProfile?.email ?? "N/A"} />
                  <InfoRow icon={<PhoneOutlinedIcon sx={{ fontSize: 16 }} />} label="Phone" value={deliveryProfile?.phone ?? "N/A"} />
                  <InfoRow icon={<HomeOutlinedIcon sx={{ fontSize: 16 }} />} label="Address" value={deliveryProfile?.address || "N/A"} />
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Order Items */}
      <Card variant="outlined" sx={{ ...cardSx, mb: 2.5 }}>
        <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
          <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
            <SectionHeader icon={<ShoppingBagOutlinedIcon sx={{ fontSize: 18 }} />} title={`Order Items (${itemsArr.length})`} color="#f59e0b" bg="#fffbeb" />
          </Box>
          {itemsArr.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "action.hover" }}>
                    <TableCell sx={headCellSx}>Product</TableCell>
                    <TableCell sx={headCellSx}>SKU</TableCell>
                    <TableCell sx={{ ...headCellSx, textAlign: "center" }}>Unit Price</TableCell>
                    <TableCell sx={{ ...headCellSx, textAlign: "center" }}>Qty</TableCell>
                    <TableCell sx={{ ...headCellSx, textAlign: "right" }}>Line Total</TableCell>
                    <TableCell sx={{ ...headCellSx, textAlign: "center" }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {itemsArr.map((item) => (
                    <TableRow key={item.id} sx={{ "&:hover": { bgcolor: "action.hover" }, transition: "background .15s" }}>
                      <TableCell sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
                        <Typography variant="body2" fontWeight={700}>{item.product_name}</Typography>
                        <Typography variant="caption" sx={{ color: ACCENT }}>{item?.shop?.name || item?.product?.shop?.name || ""}</Typography>
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
                        <Typography variant="body2" color="text.secondary">{item.sku}</Typography>
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid", borderColor: "divider", textAlign: "center" }}>
                        <Typography variant="body2">{formatCurrency(item.unit_price)}</Typography>
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid", borderColor: "divider", textAlign: "center" }}>
                        <Chip label={item.qty} size="small" sx={{ fontWeight: 700, minWidth: 32, bgcolor: "#f1f5f9" }} />
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid", borderColor: "divider", textAlign: "right" }}>
                        <Typography variant="body2" fontWeight={700}>{formatCurrency(item.line_total)}</Typography>
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid", borderColor: "divider", textAlign: "center" }}>
                        <StatusChip status={item.status} config={ORDER_STATUS_CONFIG} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <ShoppingBagOutlinedIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
              <Typography color="text.secondary">No items in this order</Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card variant="outlined" sx={cardSx}>
        <CardContent>
          <SectionHeader icon={<ReceiptLongOutlinedIcon sx={{ fontSize: 18 }} />} title="Order Summary" color="#10b981" bg="#ecfdf5" />
          <Box sx={{ maxWidth: 380, ml: "auto" }}>
            <Stack spacing={1.5}>
              {[
                { label: "Subtotal", value: formatCurrency(order.subtotal) },
                { label: "Shipping Fee", value: formatCurrency(order.shipping_fee) },
                { label: "Discount", value: `-${formatCurrency(order.discount)}`, color: "#ef4444" },
              ].map((r) => (
                <Stack key={r.label} direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">{r.label}</Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ color: r.color || "text.primary" }}>{r.value}</Typography>
                </Stack>
              ))}
              <Box sx={{ borderTop: "2px dashed", borderColor: "divider", pt: 1.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" fontWeight={800}>Total</Typography>
                  <Typography variant="h5" fontWeight={800} sx={{ color: ACCENT }}>{formatCurrency(order.total)}</Typography>
                </Stack>
              </Box>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SellerOrderDetails;
