import React, { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PaymentsIcon from "@mui/icons-material/Payments";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import HomeIcon from "@mui/icons-material/Home";

const readStoredPayment = () => {
  try {
    return JSON.parse(sessionStorage.getItem("aamarpay_pending_payment") || "{}");
  } catch {
    return {};
  }
};

const firstValue = (...values) => values.find((value) => value !== undefined && value !== null && value !== "");

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const storedPayment = useMemo(readStoredPayment, []);

  const payment = location.state?.payment || {};
  const order = location.state?.order || {};

  const paymentGroupId = firstValue(
    params.get("payment_group_id"),
    params.get("paymentGroupId"),
    payment.payment_group_id,
    order.payment_group_id,
    storedPayment.paymentGroupId
  );
  const orderId = firstValue(params.get("order_id"), payment.order_id, order.id, storedPayment.orderId);
  const orderIds = firstValue(
    params.get("order_ids"),
    Array.isArray(payment.order_ids) ? payment.order_ids.join(", ") : payment.order_ids,
    storedPayment.orderIds
  );
  const amount = firstValue(params.get("amount"), payment.amount, storedPayment.amount);
  const transactionId = firstValue(
    params.get("tran_id"),
    params.get("mer_txnid"),
    payment.merchant_transaction_id,
    payment.gateway_response?.callback?.mer_txnid,
    storedPayment.transactionId
  );
  const gatewayTransactionId = firstValue(
    params.get("pg_txnid"),
    params.get("gateway_transaction_id"),
    payment.gateway_transaction_id,
    payment.gateway_response?.callback?.pg_txnid
  );
  const paymentMethod = firstValue(
    params.get("card_type"),
    payment.gateway_response?.callback?.card_type,
    payment.gateway_response?.validation?.gateway_response?.payment_type
  );
  const paidAt = firstValue(params.get("paid_at"), payment.paid_at, payment.updated_at);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(0));
    sessionStorage.removeItem("aamarpay_pending_payment");
    window.dispatchEvent(new Event("cart-updated"));
  }, []);

  const detailRows = [
    { label: "Payment group", value: paymentGroupId },
    { label: "Order ID", value: orderIds || orderId },
    { label: "Transaction ID", value: transactionId },
    { label: "Gateway transaction", value: gatewayTransactionId },
    { label: "Payment method", value: paymentMethod },
    { label: "Paid at", value: paidAt },
  ].filter((row) => row.value);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 2,
        py: 4,
        background:
          "radial-gradient(700px 420px at 12% 8%, rgba(45, 180, 137, 0.18), transparent 60%)," +
          "radial-gradient(620px 360px at 88% 18%, rgba(59, 179, 216, 0.18), transparent 65%)," +
          "linear-gradient(180deg, #f8fffb 0%, #f5f7fb 100%)",
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            p: { xs: 2.5, sm: 4 },
            borderRadius: 3,
            background: "rgba(255,255,255,0.96)",
            border: "1px solid rgba(16, 185, 129, 0.18)",
          }}
        >
          <Stack spacing={2.4} alignItems="center" textAlign="center">
            <Box
              sx={{
                width: 82,
                height: 82,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.28)",
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 46, color: "#10b981" }} />
            </Box>

            <Box>
              <Chip
                icon={<PaymentsIcon />}
                label="Payment verified"
                sx={{
                  mb: 1.2,
                  borderRadius: 1,
                  fontWeight: 800,
                  bgcolor: "rgba(16, 185, 129, 0.1)",
                  color: "#047857",
                }}
              />
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#102033", lineHeight: 1.1 }}>
                Payment successful
              </Typography>
              <Typography variant="body1" sx={{ color: "#516070", mt: 1 }}>
                Thank you. Your online payment has been verified and your order is confirmed.
              </Typography>
            </Box>

            {amount && (
              <Box
                sx={{
                  width: "100%",
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "rgba(16, 185, 129, 0.08)",
                  border: "1px solid rgba(16, 185, 129, 0.18)",
                }}
              >
                <Typography variant="caption" sx={{ color: "#047857", fontWeight: 800 }}>
                  Paid amount
                </Typography>
                <Typography variant="h4" sx={{ color: "#102033", fontWeight: 800 }}>
                  BDT {Number(amount).toLocaleString("en-BD")}
                </Typography>
              </Box>
            )}

            {detailRows.length > 0 && (
              <Stack
                spacing={1}
                sx={{
                  width: "100%",
                  textAlign: "left",
                  bgcolor: "rgba(15, 23, 42, 0.035)",
                  borderRadius: 2,
                  p: 2,
                  border: "1px solid rgba(15, 23, 42, 0.08)",
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <ReceiptLongIcon fontSize="small" sx={{ color: "#334155" }} />
                  <Typography variant="subtitle2" sx={{ color: "#102033", fontWeight: 800 }}>
                    Payment details
                  </Typography>
                </Stack>
                <Divider />
                {detailRows.map((row) => (
                  <Stack key={row.label} direction="row" justifyContent="space-between" spacing={2}>
                    <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 700 }}>
                      {row.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#102033", fontWeight: 800, textAlign: "right", wordBreak: "break-word" }}
                    >
                      {row.value}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            )}

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.4} sx={{ width: "100%" }}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<ShoppingBagIcon />}
                onClick={() => navigate("/orders")}
                sx={{
                  textTransform: "none",
                  fontWeight: 800,
                  borderRadius: 2,
                  py: 1.2,
                  bgcolor: "#10b981",
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#059669", boxShadow: "none" },
                }}
              >
                View orders
              </Button>
              <Button
                variant="outlined"
                size="large"
                fullWidth
                startIcon={<HomeIcon />}
                onClick={() => navigate("/")}
                sx={{ textTransform: "none", fontWeight: 800, borderRadius: 2, py: 1.2 }}
              >
                Continue shopping
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default PaymentSuccessPage;
