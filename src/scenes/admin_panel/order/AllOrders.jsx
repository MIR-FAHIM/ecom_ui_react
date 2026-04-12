import React, { useEffect, useState, useMemo } from "react";
import { useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  InputAdornment,
  Avatar,
} from "@mui/material";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import PaymentOutlinedIcon from "@mui/icons-material/PaymentOutlined";
import FilterListIcon from "@mui/icons-material/FilterList";
import { getAllOrder, deleteOrder, updateOrderStatus } from "../../../api/controller/admin_controller/order/order_controller";

/* ── Status config maps ── */
const ORDER_STATUS_CONFIG = {
  pending:    { label: "Pending",    color: "#f59e0b", bg: "#fffbeb", icon: <PendingActionsOutlinedIcon sx={{ fontSize: 14 }} /> },
  processing: { label: "Processing", color: "#3b82f6", bg: "#eff6ff", icon: <SettingsOutlinedIcon sx={{ fontSize: 14 }} /> },
  shipped:    { label: "Shipped",    color: "#8b5cf6", bg: "#f5f3ff", icon: <LocalShippingOutlinedIcon sx={{ fontSize: 14 }} /> },
  completed:  { label: "Completed",  color: "#10b981", bg: "#ecfdf5", icon: <CheckCircleOutlineIcon sx={{ fontSize: 14 }} /> },
  cancelled:  { label: "Cancelled",  color: "#ef4444", bg: "#fef2f2", icon: <CancelOutlinedIcon sx={{ fontSize: 14 }} /> },
};

const PAYMENT_STATUS_CONFIG = {
  paid:     { label: "Paid",     color: "#10b981", bg: "#ecfdf5" },
  unpaid:   { label: "Unpaid",   color: "#ef4444", bg: "#fef2f2" },
  pending:  { label: "Pending",  color: "#f59e0b", bg: "#fffbeb" },
  refunded: { label: "Refunded", color: "#6366f1", bg: "#eef2ff" },
};

/* ── Summary stat card ── */
const StatMini = ({ icon, label, value, color, bg }) => (
  <Card variant="outlined" sx={{ borderRadius: 2.5, borderColor: "divider", flex: 1, minWidth: 140 }}>
    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 }, display: "flex", alignItems: "center", gap: 1.5 }}>
      <Avatar sx={{ width: 38, height: 38, bgcolor: bg, color }}>{icon}</Avatar>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>{value}</Typography>
        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>{label}</Typography>
      </Box>
    </CardContent>
  </Card>
);

/* ── Custom status chip ── */
const StatusChip = ({ status, config, onClick }) => {
  const cfg = config[status] || { label: status, color: "#64748b", bg: "#f1f5f9" };
  return (
    <Chip
      icon={cfg.icon || null}
      label={cfg.label}
      size="small"
      onClick={onClick}
      clickable={!!onClick}
      sx={{
        fontWeight: 700,
        fontSize: 11,
        height: 26,
        bgcolor: cfg.bg,
        color: cfg.color,
        border: "1px solid",
        borderColor: cfg.color + "30",
        "& .MuiChip-icon": { color: cfg.color, ml: 0.5 },
        cursor: onClick ? "pointer" : "default",
      }}
    />
  );
};

const AllOrders = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalOrders, setTotalOrders] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  // Status update dialog
  const [statusDialog, setStatusDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch orders from API
  const fetchOrders = async (pageZeroBased = 0, perPage = 10) => {
    try {
      setLoading(true);
      const params = {
        page: pageZeroBased + 1, // Convert 0-based to 1-based for API
        per_page: perPage,
      };

      const response = await getAllOrder(params);
      if (response.status === "success" && response.data) {
        setOrders(response.data.data || []);
        setTotalOrders(response.data.total || 0);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(page, rowsPerPage);
  }, [page, rowsPerPage]);

  // Client-side search + status filter
  const filteredOrders = useMemo(() => {
    let result = orders;
    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (order) =>
          String(order.order_number || "").toLowerCase().includes(term) ||
          String(order.customer_name || "").toLowerCase().includes(term) ||
          String(order.customer_phone || "").toLowerCase().includes(term)
      );
    }
    return result;
  }, [searchTerm, orders, statusFilter]);

  // Summary stats from current page data
  const stats = useMemo(() => {
    const s = { total: totalOrders, pending: 0, processing: 0, completed: 0, cancelled: 0, revenue: 0 };
    orders.forEach((o) => {
      if (o.status === "pending") s.pending++;
      else if (o.status === "processing") s.processing++;
      else if (o.status === "completed") { s.completed++; s.revenue += Number(o.total || 0); }
      else if (o.status === "cancelled") s.cancelled++;
    });
    return s;
  }, [orders, totalOrders]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRefresh = () => {
    fetchOrders(page, rowsPerPage);
  };

  const handleResetSearch = () => {
    setSearchTerm("");
  };

  const handleViewDetails = (orderId) => {
    navigate(`/admin/order/${orderId}`);
  };

  const handleOpenStatusDialog = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusDialog(true);
  };

  const handleCloseStatusDialog = () => {
    setStatusDialog(false);
    setSelectedOrder(null);
    setNewStatus("");
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || newStatus === selectedOrder.status) {
      handleCloseStatusDialog();
      return;
    }

    try {
      setUpdatingStatus(true);
      const response = await updateOrderStatus(selectedOrder.id, newStatus);
      if (response.status === "success") {
        // Update order in list
        setOrders((prev) =>
          prev.map((order) =>
            order.id === selectedOrder.id ? { ...order, status: newStatus } : order
          )
        );
        handleCloseStatusDialog();
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        const res = await deleteOrder(orderId);
        if (res?.status === "success") {
          setOrders((prev) => prev.filter((o) => o.id !== orderId));
          setTotalOrders((prev) => Math.max(0, prev - 1));
        }
      } catch (err) {
        console.error("Error deleting order:", err);
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-BD", { year: "numeric", month: "short", day: "numeric" });
  };

  const cellSx = { borderBottom: "1px solid", borderColor: "divider", py: 1.5 };
  const headCellSx = { ...cellSx, fontWeight: 700, fontSize: 12, color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5 };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", p: { xs: 2, md: 3 } }}>
      {/* ── Header ── */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: "#eef2ff", display: "grid", placeItems: "center", color: "#6366f1" }}>
            <ShoppingBagOutlinedIcon />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>Orders</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600 }}>
              Manage and track all customer orders
            </Typography>
          </Box>
        </Stack>
        <Tooltip title="Refresh">
          <IconButton
            onClick={handleRefresh}
            disabled={loading}
            sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, width: 40, height: 40 }}
          >
            <RefreshIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* ── Stat cards ── */}
      <Stack direction="row" spacing={2} sx={{ mb: 3, overflowX: "auto", pb: 0.5 }}>
        <StatMini icon={<ReceiptLongOutlinedIcon sx={{ fontSize: 20 }} />} label="Total Orders" value={stats.total} color="#6366f1" bg="#eef2ff" />
        <StatMini icon={<PendingActionsOutlinedIcon sx={{ fontSize: 20 }} />} label="Pending" value={stats.pending} color="#f59e0b" bg="#fffbeb" />
        <StatMini icon={<SettingsOutlinedIcon sx={{ fontSize: 20 }} />} label="Processing" value={stats.processing} color="#3b82f6" bg="#eff6ff" />
        <StatMini icon={<CheckCircleOutlineIcon sx={{ fontSize: 20 }} />} label="Completed" value={stats.completed} color="#10b981" bg="#ecfdf5" />
        <StatMini icon={<PaymentOutlinedIcon sx={{ fontSize: 20 }} />} label="Revenue" value={formatCurrency(stats.revenue)} color="#8b5cf6" bg="#f5f3ff" />
      </Stack>

      {/* ── Search & Filter bar ── */}
      <Card variant="outlined" sx={{ borderRadius: 2.5, borderColor: "divider", mb: 3 }}>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="center">
            <TextField
              size="small"
              placeholder="Search by order #, name, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 20, color: "text.disabled" }} /></InputAdornment>,
                endAdornment: searchTerm ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleResetSearch}><CloseIcon sx={{ fontSize: 16 }} /></IconButton>
                  </InputAdornment>
                ) : null,
              }}
              sx={{
                flex: 1,
                maxWidth: 420,
                "& .MuiOutlinedInput-root": { borderRadius: 2, "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#6366f1" } },
              }}
            />
            <Stack direction="row" spacing={0.5}>
              {["all", "pending", "processing", "shipped", "completed", "cancelled"].map((s) => {
                const active = statusFilter === s;
                const cfg = ORDER_STATUS_CONFIG[s];
                return (
                  <Chip
                    key={s}
                    label={s === "all" ? "All" : cfg?.label || s}
                    size="small"
                    onClick={() => setStatusFilter(s)}
                    sx={{
                      fontWeight: 700,
                      fontSize: 12,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: active ? (cfg?.color || "#6366f1") + "50" : "divider",
                      bgcolor: active ? (cfg?.bg || "#eef2ff") : "transparent",
                      color: active ? (cfg?.color || "#6366f1") : "text.secondary",
                      cursor: "pointer",
                      transition: "all 200ms",
                      "&:hover": { bgcolor: cfg?.bg || "#eef2ff" },
                    }}
                  />
                );
              })}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* ── Orders table ── */}
      <Card variant="outlined" sx={{ borderRadius: 2.5, borderColor: "divider" }}>
        <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 6 }}>
              <CircularProgress size={32} sx={{ color: "#6366f1" }} />
            </Box>
          ) : filteredOrders.length === 0 ? (
            <Box sx={{ py: 8, textAlign: "center" }}>
              <ShoppingBagOutlinedIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
              <Typography variant="body1" sx={{ fontWeight: 700, color: "text.secondary" }}>
                {searchTerm || statusFilter !== "all" ? "No orders match your filters" : "No orders yet"}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.disabled" }}>
                {searchTerm || statusFilter !== "all" ? "Try adjusting your search or filter" : "Orders will appear here once placed"}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: theme.palette.mode === "dark" ? "rgba(99,102,241,0.06)" : "#f8fafc" }}>
                    <TableCell sx={headCellSx}>Order</TableCell>
                    <TableCell sx={headCellSx}>Customer</TableCell>
                    <TableCell sx={headCellSx} align="right">Total</TableCell>
                    <TableCell sx={headCellSx}>Status</TableCell>
                    <TableCell sx={headCellSx}>Payment</TableCell>
                    <TableCell sx={headCellSx}>Date</TableCell>
                    <TableCell sx={{ ...headCellSx, textAlign: "center" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      sx={{
                        transition: "background 200ms",
                        "&:hover": { bgcolor: theme.palette.mode === "dark" ? "rgba(99,102,241,0.04)" : "#fafafe" },
                        cursor: "pointer",
                      }}
                      onClick={() => handleViewDetails(order.id)}
                    >
                      <TableCell sx={cellSx}>
                        <Stack>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: "#6366f1" }}>
                            #{order.order_number}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.disabled" }}>ID: {order.id}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell sx={cellSx}>
                        <Stack>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{order.customer_name || "—"}</Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>{order.customer_phone || ""}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell sx={cellSx} align="right">
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatCurrency(order.total)}</Typography>
                      </TableCell>
                      <TableCell sx={cellSx}>
                        <StatusChip
                          status={order.status}
                          config={ORDER_STATUS_CONFIG}
                          onClick={(e) => { e.stopPropagation(); handleOpenStatusDialog(order); }}
                        />
                      </TableCell>
                      <TableCell sx={cellSx}>
                        <StatusChip status={order.payment_status} config={PAYMENT_STATUS_CONFIG} />
                      </TableCell>
                      <TableCell sx={cellSx}>
                        <Typography variant="body2" sx={{ color: "text.secondary", fontSize: 13 }}>{formatDate(order.created_at)}</Typography>
                      </TableCell>
                      <TableCell sx={{ ...cellSx, textAlign: "center" }}>
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={(e) => { e.stopPropagation(); handleViewDetails(order.id); }}
                              sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1.5, width: 32, height: 32, "&:hover": { bgcolor: "#eef2ff", borderColor: "#6366f1" } }}
                            >
                              <VisibilityOutlinedIcon sx={{ fontSize: 16, color: "#6366f1" }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={(e) => { e.stopPropagation(); handleDelete(order.id); }}
                              sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1.5, width: 32, height: 32, "&:hover": { bgcolor: "#fef2f2", borderColor: "#ef4444" } }}
                            >
                              <DeleteOutlineIcon sx={{ fontSize: 16, color: "#ef4444" }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Pagination */}
          {!loading && filteredOrders.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[10, 20, 50, 100]}
              component="div"
              count={totalOrders}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ borderTop: "1px solid", borderColor: "divider" }}
            />
          )}
        </CardContent>
      </Card>

      {/* ── Status Update Dialog ── */}
      <Dialog open={statusDialog} onClose={handleCloseStatusDialog} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2.5 } }}>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Update Status</Typography>
          <IconButton size="small" onClick={handleCloseStatusDialog}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            Order <Typography component="span" sx={{ fontWeight: 700, color: "#6366f1" }}>#{selectedOrder?.order_number}</Typography>
          </Typography>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="Status"
              sx={{ borderRadius: 2, "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#6366f1" } }}
            >
              {Object.entries(ORDER_STATUS_CONFIG).map(([key, cfg]) => (
                <MenuItem key={key} value={key}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: cfg.color }} />
                    <Typography variant="body2">{cfg.label}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={handleCloseStatusDialog} sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, color: "text.secondary" }}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateStatus}
            variant="contained"
            disabled={updatingStatus || newStatus === selectedOrder?.status}
            startIcon={updatingStatus ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, bgcolor: "#6366f1", boxShadow: "0 4px 14px rgba(99,102,241,0.25)", "&:hover": { bgcolor: "#4f46e5" } }}
          >
            {updatingStatus ? "Updating..." : "Update Status"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AllOrders;
