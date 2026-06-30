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
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ReplayIcon from "@mui/icons-material/Replay";
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

const PaymentFailedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const storedPayment = useMemo(readStoredPayment, []);
  const payment = location.state?.payment || {};

  const paymentGroupId = firstValue(params.get("payment_group_id"), payment.payment_group_id, storedPayment.paymentGroupId);
  const orderId = firstValue(params.get("order_id"), payment.order_id, storedPayment.orderId);
  const orderIds = firstValue(params.get("order_ids"), storedPayment.orderIds);
  const amount = firstValue(params.get("amount"), payment.amount, storedPayment.amount);
  const transactionId = firstValue(
    params.get("tran_id"),
    params.get("mer_txnid"),
    payment.merchant_transaction_id,
    storedPayment.transactionId
  );
  const gatewayTransactionId = firstValue(params.get("pg_txnid"), params.get("gateway_transaction_id"));
  const reason = firstValue(
    params.get("reason"),
    params.get("message"),
    params.get("error"),
    payment.gateway_response?.callback?.reason,
    "Payment could not be completed."
  );
  const status = firstValue(params.get("status"), params.get("pay_status"), payment.status);

  useEffect(() => {
    sessionStorage.removeItem("aamarpay_pending_payment");
  }, []);

  const detailRows = [
    { label: "Payment group", value: paymentGroupId },
    { label: "Order ID", value: orderIds || orderId },
    { label: "Transaction ID", value: transactionId },
    { label: "Gateway transaction", value: gatewayTransactionId },
    { label: "Status", value: status },
    { label: "Reason", value: reason },
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
          "radial-gradient(700px 420px at 12% 8%, rgba(239, 68, 68, 0.14), transparent 60%)," +
          "radial-gradient(620px 360px at 88% 18%, rgba(245, 158, 11, 0.14), transparent 65%)," +
          "linear-gradient(180deg, #fff8f8 0%, #f7f8fb 100%)",
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            p: { xs: 2.5, sm: 4 },
            borderRadius: 3,
            background: "rgba(255,255,255,0.96)",
            border: "1px solid rgba(239, 68, 68, 0.18)",
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
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.24)",
              }}
            >
              <ErrorOutlineIcon sx={{ fontSize: 46, color: "#dc2626" }} />
            </Box>

            <Box>
              <Chip
                icon={<ErrorOutlineIcon />}
                label="Payment failed"
                sx={{
                  mb: 1.2,
                  borderRadius: 1,
                  fontWeight: 800,
                  bgcolor: "rgba(239, 68, 68, 0.1)",
                  color: "#b91c1c",
                }}
              />
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#102033", lineHeight: 1.1 }}>
                Payment was not completed
              </Typography>
              <Typography variant="body1" sx={{ color: "#516070", mt: 1 }}>
                Your online payment could not be verified. You can try again or review your order history.
              </Typography>
            </Box>

            {amount && (
              <Box
                sx={{
                  width: "100%",
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "rgba(239, 68, 68, 0.06)",
                  border: "1px solid rgba(239, 68, 68, 0.14)",
                }}
              >
                <Typography variant="caption" sx={{ color: "#b91c1c", fontWeight: 800 }}>
                  Attempted amount
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
                    Payment attempt details
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
                startIcon={<ReplayIcon />}
                onClick={() => navigate("/checkout")}
                sx={{
                  textTransform: "none",
                  fontWeight: 800,
                  borderRadius: 2,
                  py: 1.2,
                  bgcolor: "#dc2626",
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#b91c1c", boxShadow: "none" },
                }}
              >
                Try again
              </Button>
              <Button
                variant="outlined"
                size="large"
                fullWidth
                startIcon={<ShoppingBagIcon />}
                onClick={() => navigate("/orders")}
                sx={{ textTransform: "none", fontWeight: 800, borderRadius: 2, py: 1.2 }}
              >
                View orders
              </Button>
            </Stack>

            <Button
              variant="text"
              startIcon={<HomeIcon />}
              onClick={() => navigate("/")}
              sx={{ textTransform: "none", fontWeight: 800 }}
            >
              Continue shopping
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default PaymentFailedPage;
