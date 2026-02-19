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
  TextField,
  MenuItem,
} from "@mui/material";
import { ArrowBack, Print, PictureAsPdf } from "@mui/icons-material";
import jsPDF from "jspdf";
import { tokens } from "../../../theme";
import { getOrderDetails, updateOrderStatusPatch, assignDeliveryBoy , unassignDeliveryBoy} from "../../../api/controller/admin_controller/order/order_controller";
import {getDeliveryMen } from "../../../api/controller/admin_controller/user_controller";




const SellerOrderDetails = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
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

  // Fetch order details
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await getOrderDetails(id);
      if (response.status === "success" && response.data) {
        setOrder(response.data);
        setNewStatus(response.data.status);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveryMen = async () => {
    try {
      setDeliveryLoading(true);
      const response = await getDeliveryMen({ page: 1, per_page: 200 });
      if (response?.status === "success") {
        const paginator = response?.data;
        const list = Array.isArray(paginator?.data) ? paginator.data : [];
        setDeliveryMen(list);
      } else {
        setDeliveryMen([]);
      }
    } catch (error) {
      console.error("Error fetching delivery men:", error);
      setDeliveryMen([]);
    } finally {
      setDeliveryLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
      fetchDeliveryMen();
    }
  }, [id]);

  const handleOpenStatusDialog = () => {
    setStatusDialog(true);
  };

  const handleCloseStatusDialog = () => {
    setStatusDialog(false);
    setNewStatus(order?.status || "");
  };

  const handleUpdateStatus = async (newStatusValue) => {
    if (!order || newStatusValue === order.status) {
      return;
    }

    try {
      setErrMsg("");
      setUpdatingStatus(true);
      const response = await updateOrderStatusPatch(order.id, newStatusValue);
     
      if (response.status === "success") {
        setOrder({ ...order, status: newStatusValue });
      } else  {
         setErrMsg(extractErrorMessage(response?.message, "Failed to update order status"));
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      setErrMsg(
        extractErrorMessage(error?.response?.data?.message, "Failed to update order status")
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getOrderStatusColor = (status) => {
    const statusMap = {
      "new order": "info",
      "order received": "warning",
      "assigned deliveryman": "warning",
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

  const generateReceiptPdf = () => {
    if (!order) return;

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    let y = 50;

    doc.setFontSize(18);
    doc.text("Order Receipt", margin, y);
    y += 18;

    doc.setFontSize(10);
    doc.text(`Order: ${order.order_number || order.id}`, margin, y);
    doc.text(`Date: ${formatDate(order.created_at)}`, pageWidth - margin - 160, y);
    y += 18;

    doc.setFontSize(11);
    doc.text(`Customer: ${order.customer_name || "N/A"}`, margin, y);
    y += 14;
    doc.text(`Phone: ${order.customer_phone || "N/A"}`, margin, y);
    y += 14;
    doc.text(`Address: ${order.shipping_address || "N/A"}`, margin, y);
    y += 20;

    const columns = [
      { label: "Item", width: 260 },
      { label: "Qty", width: 40 },
      { label: "Unit", width: 90 },
      { label: "Total", width: 90 },
    ];

    const tableX = margin;
    const rowHeight = 18;

    doc.setFontSize(11);
    let x = tableX;
    columns.forEach((col) => {
      doc.text(col.label, x, y);
      x += col.width;
    });
    y += 8;
    doc.line(margin, y, pageWidth - margin, y);
    y += 14;

    const items = Array.isArray(order.items) ? order.items : [];
    items.forEach((item) => {
      const name = item.product_name || "Item";
      const nameLines = doc.splitTextToSize(name, columns[0].width - 6);    
      const lineCount = Math.max(1, nameLines.length);
      const lineY = y + 2;

      doc.text(nameLines, tableX, lineY);
      doc.text(String(item.qty || 0), tableX + columns[0].width, lineY);
      doc.text(formatCurrency(item.unit_price), tableX + columns[0].width + columns[1].width, lineY);
      doc.text(formatCurrency(item.line_total), tableX + columns[0].width + columns[1].width + columns[2].width, lineY);

      y += rowHeight * lineCount;
      if (y > doc.internal.pageSize.getHeight() - 140) {
        doc.addPage();
        y = 50;
      }
    });

    y += 10;
    doc.line(margin, y, pageWidth - margin, y);
    y += 16;

    doc.setFontSize(11);
    doc.text(`Subtotal: ${formatCurrency(order.subtotal)}`, pageWidth - margin - 200, y);
    y += 14;
    doc.text(`Shipping: ${formatCurrency(order.shipping_fee)}`, pageWidth - margin - 200, y);
    y += 14;
    doc.text(`Discount: -${formatCurrency(order.discount)}`, pageWidth - margin - 200, y);
    y += 18;
    doc.setFontSize(12);
    doc.text(`Total: ${formatCurrency(order.total)}`, pageWidth - margin - 200, y);

    const fileName = `order-${order.order_number || order.id}.pdf`;
    doc.save(fileName);
  };

  const getDeliveryStatusColor = (status) => {
    const statusMap = {
      assigned: "info",
      picked: "warning",
      "on the way": "info",
      delivered: "success",
      completed: "success",
      cancelled: "error",
    };
    return statusMap[String(status ?? "").toLowerCase()] || "default";
  };

  const assignment = order?.delivery_man ?? null;
  const deliveryProfile = assignment?.delivery_man ?? null;

  useEffect(() => {
    if (assignment?.delivery_man_id) {
      setSelectedDeliveryManId(String(assignment.delivery_man_id));
    }
  }, [assignment?.delivery_man_id]);

  const handleAssignDelivery = async () => {
    if (!order?.id || !selectedDeliveryManId) return;
    try {
      setErrMsg("");
      setAssigning(true);
      const response = await assignDeliveryBoy({
        delivery_man_id: selectedDeliveryManId,
        order_id: order.id,
        note: assignNote,
      });
      if (response?.status === "success") {
        await fetchOrderDetails();
      } else {
        setErrMsg(extractErrorMessage(response?.message, "Failed to assign delivery man"));
      }
    } catch (error) {
      console.error("Error assigning delivery man:", error);
      setErrMsg(
        extractErrorMessage(error?.response?.data?.message, "Failed to assign delivery man")
      );
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassignDelivery = async () => {
    if (!order?.id) return;
    try {
      setErrMsg("");
      setAssigning(true);
      const response = await unassignDeliveryBoy({ order_id: order.id });
      if (response?.status === "success") {
        await fetchOrderDetails();
        setSelectedDeliveryManId("");
        setAssignNote("");
      } else {
        setErrMsg(extractErrorMessage(response?.message, "Failed to unassign delivery man"));
      }
    } catch (error) {
      console.error("Error unassigning delivery man:", error);
      setErrMsg(
        extractErrorMessage(error?.response?.data?.message, "Failed to unassign delivery man")
      );
    } finally {
      setAssigning(false);
    }
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
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
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
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button variant="contained" startIcon={<PictureAsPdf />} onClick={generateReceiptPdf}>
            Receipt PDF
          </Button>
          <Button variant="outlined" startIcon={<Print />} onClick={() => window.print()}>
            Print
          </Button>
        </Box>
      </Box>

      {errMsg && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errMsg}
        </Alert>
      )}

      {/* Quick Summary */}
      <Card sx={{ background: colors.primary[400], mb: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                ORDER NUMBER
              </Typography>
              <Typography variant="h6" fontWeight={800} sx={{ mt: 0.5 }}>
                {order.order_number || order.id}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                STATUS
              </Typography>
              <Box sx={{ mt: 0.5, display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Chip label={order.status} color={getOrderStatusColor(order.status)} />
                <Chip label={order.payment_status} color={getPaymentStatusColor(order.payment_status)} variant="outlined" />
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                TOTAL
              </Typography>
              <Typography variant="h6" fontWeight={800} sx={{ mt: 0.5, color: colors.blueAccent[500] }}>
                {formatCurrency(order.total)}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Status Change Row */}
      <Card sx={{ background: colors.primary[400], mb: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Update Order Status
          </Typography>
          <Divider sx={{ mb: 2, opacity: 0.2 }} />

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {["new order", "order received", "assigned deliveryman", "on the way", "delivered", "completed"].map((status) => (
              <Button
                key={status}
                variant={order.status === status ? "contained" : "outlined"}
                color={getOrderStatusColor(status)}
                onClick={() => handleUpdateStatus(status)}
                disabled={updatingStatus || order.status === status}
                sx={{
                  textTransform: "capitalize",
                  minWidth: 120,
                }}
              >
                {status}
              </Button>
            ))}
          </Box>
        </CardContent>
      </Card>

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

      {/* Delivery Assignment */}
      <Card sx={{ background: colors.primary[400], mt: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Assign Delivery Man
          </Typography>
          <Divider sx={{ mb: 2, opacity: 0.2 }} />

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                select
                fullWidth
                label="Delivery Man"
                value={selectedDeliveryManId}
                onChange={(e) => setSelectedDeliveryManId(e.target.value)}
                disabled={deliveryLoading || assigning}
                size="small"
              >
                <MenuItem value="">Select delivery man</MenuItem>
                {deliveryMen.map((man) => (
                  <MenuItem key={man?.id} value={String(man?.id)}>
                    {man?.name} ({man?.phone || "N/A"})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label="Note"
                value={assignNote}
                onChange={(e) => setAssignNote(e.target.value)}
                disabled={assigning}
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={2}>
              {assignment ? (
                <Button
                  fullWidth
                  color="error"
                  variant="outlined"
                  onClick={handleUnassignDelivery}
                  disabled={assigning}
                >
                  Unassign
                </Button>
              ) : (
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleAssignDelivery}
                  disabled={!selectedDeliveryManId || assigning}
                >
                  Assign
                </Button>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Delivery Section */}
      {assignment && (
        <Card sx={{ background: colors.primary[400], mt: 2 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Delivery Information
            </Typography>
            <Divider sx={{ mb: 2, opacity: 0.2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      DELIVERY STATUS
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        label={assignment?.status ?? "N/A"}
                        color={getDeliveryStatusColor(assignment?.status)}
                        variant="outlined"
                      />
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      NOTE
                    </Typography>
                    <Typography variant="body2">{assignment?.note || "N/A"}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      ASSIGNED AT
                    </Typography>
                    <Typography variant="body2">
                      {assignment?.created_at ? formatDate(assignment.created_at) : "N/A"}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      DELIVERY MAN
                    </Typography>
                    <Typography variant="body2">{deliveryProfile?.name ?? "N/A"}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      EMAIL
                    </Typography>
                    <Typography variant="body2">{deliveryProfile?.email ?? "N/A"}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      PHONE
                    </Typography>
                    <Typography variant="body2">{deliveryProfile?.phone ?? "N/A"}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      ADDRESS
                    </Typography>
                    <Typography variant="body2">
                      {deliveryProfile?.address || "N/A"}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

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
                          <Typography variant="caption" sx={{ color: colors.blueAccent[700] }}>
                            {item?.shop?.name || item?.product?.shop?.name || ""}
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

export default SellerOrderDetails;
