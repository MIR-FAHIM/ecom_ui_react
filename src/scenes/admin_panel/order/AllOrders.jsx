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
} from "@mui/material";
import { Visibility, Edit, Delete, Refresh, Search } from "@mui/icons-material";
import { tokens } from "../../../theme";
import { getAllOrder, deleteOrder, updateOrderStatus } from "../../../api/controller/admin_controller/order/order_controller";

const AllOrders = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
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

  // Client-side search (filtered on current page only)
  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return orders;

    const term = searchTerm.toLowerCase();
    return orders.filter(
      (order) =>
        order.order_number.toLowerCase().includes(term) ||
        order.customer_name.toLowerCase().includes(term) ||
        order.customer_phone.toLowerCase().includes(term)
    );
  }, [searchTerm, orders]);

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

  const handleDelete = (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      console.log("Delete order:", orderId);
      // TODO: Call deleteOrder API
    }
  };

  const getOrderStatusColor = (status) => {
    const statusMap = {
      completed: "success",
      pending: "warning",
      processing: "info",
      cancelled: "error",
      shipped: "primary",
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
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Orders
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage customer orders
          </Typography>
        </Box>
        <Tooltip title="Refresh orders">
          <IconButton onClick={handleRefresh} disabled={loading}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
        <TextField
          size="small"
          placeholder="Search by order number, customer name, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: "action.active" }} />,
          }}
          sx={{ flex: 1, maxWidth: 500 }}
        />
        {searchTerm && (
          <Button variant="outlined" size="small" onClick={handleResetSearch}>
            Reset
          </Button>
        )}
      </Box>

      {/* Table Card */}
      <Card sx={{ background: colors.primary[400] }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredOrders.length === 0 ? (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography color="text.secondary">
                {searchTerm ? "No orders found matching your search." : "No orders available."}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table sx={{ borderCollapse: "collapse" }}>
                <TableHead sx={{ backgroundColor: colors.primary[300] }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, borderBottom: `1px solid ${colors.primary[200]}` }}>
                      Order ID
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, borderBottom: `1px solid ${colors.primary[200]}` }}>
                      Order Number
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, borderBottom: `1px solid ${colors.primary[200]}` }}>
                      Customer
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, borderBottom: `1px solid ${colors.primary[200]}` }}>
                      Phone
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, borderBottom: `1px solid ${colors.primary[200]}` }}>
                      Total
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, borderBottom: `1px solid ${colors.primary[200]}` }}>
                      Order Status
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, borderBottom: `1px solid ${colors.primary[200]}` }}>
                      Payment Status
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, borderBottom: `1px solid ${colors.primary[200]}` }}>
                      Date
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, borderBottom: `1px solid ${colors.primary[200]}`, textAlign: "center" }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.map((order, idx) => {
                    const isEven = idx % 2 === 0;

                    return (
                      <TableRow
                        key={order.id}
                        sx={{
                          backgroundColor: isEven ? colors.primary[300] : "transparent",
                          borderBottom: `1px solid ${colors.primary[200]}`,
                          transition: "background-color 0.2s",
                          "&:hover": {
                            backgroundColor: isEven ? colors.primary[250] : colors.primary[400],
                          },
                        }}
                      >
                        <TableCell sx={{ borderBottom: `1px solid ${colors.primary[200]}` }}>
                          {order.id}
                        </TableCell>
                        <TableCell sx={{ borderBottom: `1px solid ${colors.primary[200]}` }}>
                          <Typography variant="body2" fontWeight={600}>
                            {order.order_number}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: `1px solid ${colors.primary[200]}` }}>
                          <Typography variant="body2">{order.customer_name}</Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: `1px solid ${colors.primary[200]}` }}>
                          <Typography variant="body2">{order.customer_phone}</Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: `1px solid ${colors.primary[200]}` }}>
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(order.total)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: `1px solid ${colors.primary[200]}` }}>
                          <Chip
                            label={order.status}
                            color={getOrderStatusColor(order.status)}
                            size="small"
                            onClick={() => handleOpenStatusDialog(order)}
                            clickable
                            sx={{ cursor: "pointer" }}
                          />
                        </TableCell>
                        <TableCell sx={{ borderBottom: `1px solid ${colors.primary[200]}` }}>
                          <Chip
                            label={order.payment_status}
                            color={getPaymentStatusColor(order.payment_status)}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell sx={{ borderBottom: `1px solid ${colors.primary[200]}` }}>
                          <Typography variant="body2">{formatDate(order.created_at)}</Typography>
                        </TableCell>
                        <TableCell
                          sx={{
                            borderBottom: `1px solid ${colors.primary[200]}`,
                            textAlign: "center",
                            display: "flex",
                            gap: 0.5,
                            justifyContent: "center",
                          }}
                        >
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetails(order.id)}
                              sx={{ color: colors.blueAccent[500] }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(order.id)}

                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
              sx={{
                borderTop: `1px solid ${colors.primary[200]}`,
                "& .MuiTablePagination-toolbar": {
                  backgroundColor: colors.primary[300],
                },
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Status Update Dialog */}
      <Dialog open={statusDialog} onClose={handleCloseStatusDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Order: <strong>{selectedOrder?.order_number}</strong>
          </Typography>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="shipped">Shipped</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog}>Cancel</Button>
          <Button
            onClick={handleUpdateStatus}
            variant="contained"
            disabled={updatingStatus || newStatus === selectedOrder?.status}
          >
            {updatingStatus ? "Updating..." : "Update"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AllOrders;
