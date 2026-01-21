import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  List,
  ListItem,
  Button,
  TextField,
  CircularProgress,
  Snackbar,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Stack,
  Tooltip,
  useTheme,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import LockCheckoutIcon from "@mui/icons-material/Lock";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import PlaceIcon from "@mui/icons-material/Place";
import NotesIcon from "@mui/icons-material/Notes";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";

import { getUserAddresses, addUserAddress } from "../../../api/controller/admin_controller/order/user_address_controller";
import { checkOutOrder } from "../../../api/controller/admin_controller/order/order_controller";
import { getCartByUser, updateQuantity, deleteItem } from "../../../api/controller/admin_controller/order/cart_controller";
import { tokens } from "../../../theme";

const ProceedOrder = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const colors = tokens(theme.palette.mode);
  const divider = theme.palette.divider || colors.primary[200];
  const surface = colors.primary[400];
  const surface2 = colors.primary[300];
  const ink = colors.gray[100];
  const subInk = colors.gray[300];

  const userId = useMemo(() => {
    const id = localStorage.getItem("userId");
    return id ? String(id) : null;
  }, []);

  const money = (n) =>
    new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(Number(n || 0));

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState("");

  const [cart, setCart] = useState(null);
  const [note, setNote] = useState("");

  const [processing, setProcessing] = useState({});
  const [openAddressModal, setOpenAddressModal] = useState(false);

  // IMPORTANT: this fixes your popup bug
  const [addrLoading, setAddrLoading] = useState(true);
  const [addrLoadedOnce, setAddrLoadedOnce] = useState(false);

  // New address form
  const [newName, setNewName] = useState("");
  const [newMobile, setNewMobile] = useState("");
  const [newDistrict, setNewDistrict] = useState("");
  const [newArea, setNewArea] = useState("");
  const [newAddress, setNewAddress] = useState("");

  const resetNewAddress = () => {
    setNewName("");
    setNewMobile("");
    setNewDistrict("");
    setNewArea("");
    setNewAddress("");
  };

  const loadAddresses = async () => {
    if (!userId) {
      setAddresses([]);
      setSelectedAddress(null);
      setAddrLoading(false);
      setAddrLoadedOnce(true);
      return;
    }

    setAddrLoading(true);
    try {
      const res = await getUserAddresses(userId);
      if (res?.status === "success") {
        const list = Array.isArray(res.data) ? res.data : [];
        setAddresses(list);

        if (list.length > 0) {
          setSelectedAddress((prev) => {
            const exists = prev && list.some((a) => String(a.id) === String(prev));
            return exists ? prev : String(list[0].id);
          });
        } else {
          setSelectedAddress(null);
        }
      } else {
        setAddresses([]);
        setSelectedAddress(null);
      }
    } catch (e) {
      console.error("Error loading addresses", e);
      setAddresses([]);
      setSelectedAddress(null);
    } finally {
      setAddrLoading(false);
      setAddrLoadedOnce(true);
    }
  };

  const syncCartBadge = (data) => {
    const total = data?.total_items ?? (Array.isArray(data?.items) ? data.items.length : 0);
    localStorage.setItem("cart", JSON.stringify(total));
    window.dispatchEvent(new Event("cart-updated"));
  };

  const loadCart = async () => {
    if (!userId) {
      setCart(null);
      localStorage.setItem("cart", JSON.stringify(0));
      window.dispatchEvent(new Event("cart-updated"));
      return;
    }

    try {
      const res = await getCartByUser(userId);
      if (res?.status === "success") {
        setCart(res.data);
        syncCartBadge(res.data);
      } else {
        setCart(null);
      }
    } catch (e) {
      console.error("Error loading cart", e);
      setCart(null);
    }
  };

  useEffect(() => {
    loadAddresses();
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // AUTO-OPEN only AFTER addresses loaded, only if user logged in, only if still empty
  useEffect(() => {
    if (!userId) return;
    if (!addrLoadedOnce) return;
    if (addrLoading) return;

    if (addresses.length === 0) {
      setOpenAddressModal(true);
    }
  }, [userId, addrLoadedOnce, addrLoading, addresses.length]);

  const handleAddAddress = async () => {
    if (!userId) {
      setMsg("Please login to add an address.");
      return;
    }
    if (!newName || !newMobile || !newAddress) {
      setMsg("Please fill name, mobile and address");
      return;
    }

    setAdding(true);
    try {
      const form = new FormData();
      form.append("user_id", userId);
      form.append("name", newName);
      form.append("mobile", newMobile);
      form.append("district", newDistrict);
      form.append("area", newArea);
      form.append("address", newAddress);

      const res = await addUserAddress(form);
      const ok = res?.data?.status === "success" || res?.status === 200 || res?.status === "success";

      if (ok) {
        setMsg("Address added");
        resetNewAddress();
        await loadAddresses();
        setOpenAddressModal(false);
      } else {
        setMsg(res?.data?.message || res?.message || "Failed to add address");
      }
    } catch (e) {
      console.error("Add address error", e);
      setMsg("Error adding address");
    } finally {
      setAdding(false);
    }
  };

  const handleUpdateQty = async (item, newQty) => {
    if (newQty < 1) return;
    setProcessing((prev) => ({ ...prev, [item.id]: true }));
    try {
      const res = await updateQuantity(item.id, newQty);
      if (res?.status === "success") {
        setMsg(res.message || "Updated quantity");
        await loadCart();
      } else {
        setMsg(res?.message || "Failed to update quantity");
      }
    } catch (e) {
      console.error("Update qty error", e);
      setMsg("Error updating quantity");
    } finally {
      setProcessing((prev) => ({ ...prev, [item.id]: false }));
    }
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm("Remove this item from cart?")) return;
    setProcessing((prev) => ({ ...prev, [item.id]: true }));
    try {
      const res = await deleteItem(item.id);
      if (res?.status === "success") {
        setMsg(res.message || "Item removed");
        await loadCart();
      } else {
        setMsg(res?.message || "Failed to remove item");
      }
    } catch (e) {
      console.error("Delete item error", e);
      setMsg("Error removing item");
    } finally {
      setProcessing((prev) => ({ ...prev, [item.id]: false }));
    }
  };

  const handleCheckout = async () => {
    if (!userId) {
      setMsg("Please login to place an order.");
      return;
    }
    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
      setMsg("Cart is empty");
      return;
    }

    const addrObj = selectedAddress
      ? addresses.find((a) => String(a.id) === String(selectedAddress))
      : null;

    if (!addrObj) {
      setMsg("Select or add a shipping address");
      return;
    }

    setLoadingCheckout(true);
    try {
      const form = new FormData();
      form.append("user_id", userId);
      form.append("customer_name", addrObj.name || "");
      form.append("customer_phone", addrObj.mobile || "");
      form.append(
        "shipping_address",
        `${addrObj.address}${addrObj.area ? `, ${addrObj.area}` : ""}${addrObj.district ? `, ${addrObj.district}` : ""}`
      );
      form.append("zone", addrObj.district || "");
      form.append("note", note || "");

      const res = await checkOutOrder(form);
      const ok = res?.data?.status === "success" || res?.status === 200;

      if (ok) {
        setMsg(res?.data?.message || "Order placed");
        localStorage.setItem("cart", JSON.stringify(0));
        window.dispatchEvent(new Event("cart-updated"));
        setTimeout(() => navigate("/"), 900);
      } else {
        setMsg(res?.data?.message || "Failed to place order");
      }
    } catch (e) {
      console.error("Checkout error", e);
      setMsg("Error placing order");
    } finally {
      setLoadingCheckout(false);
    }
  };

  const AddressCard = ({ a, selected }) => {
    const labelLine = `${a.address}${a.area ? `, ${a.area}` : ""}${a.district ? `, ${a.district}` : ""}`;

    return (
      <Box
        sx={{
          p: 1.4,
          borderRadius: 3,
          border: `1px solid ${selected ? "transparent" : divider}`,
          background: selected ? theme.palette.secondary.main : surface,
          boxShadow: "none",
          transition: "transform 140ms ease, box-shadow 200ms ease, filter 200ms ease",
          color: selected ? colors.gray[900] : ink,
          "&:hover": { transform: "translateY(-1px)" },
        }}
      >
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              background: selected ? colors.primary[200] : surface2,
              border: `1px solid ${selected ? colors.primary[300] : divider}`,
              flexShrink: 0,
            }}
          >
            <PlaceIcon fontSize="small" />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 950, lineHeight: 1.1 }}>
              {a.name}{" "}
              <Box component="span" sx={{ fontWeight: 800, opacity: 0.85 }}>
                {a.mobile}
              </Box>
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.4, fontWeight: 700, opacity: selected ? 0.9 : 0.78 }}>
              {labelLine}
            </Typography>
          </Box>

          <Box sx={{ ml: "auto" }}>
            <Chip
              size="small"
              label={selected ? "Selected" : "Use"}
              sx={{
                borderRadius: 999,
                fontWeight: 950,
                background: selected ? colors.primary[200] : surface2,
                border: `1px solid ${selected ? colors.primary[300] : divider}`,
                color: selected ? colors.gray[900] : ink,
              }}
            />
          </Box>
        </Stack>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
          background: theme.palette.background?.default || colors.primary[500],
        p: { xs: 1.5, md: 2 },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          mb: 2,
          p: 2,
          borderRadius: 4,
          border: `1px solid ${divider}`,
          background: surface,
          backdropFilter: "blur(12px)",
          display: "flex",
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Stack direction="row" spacing={1.2} alignItems="center">
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              borderRadius: 3,
              border: `1px solid ${divider}`,
              background: surface,
              "&:hover": { background: surface2 },
            }}
          >
            <ArrowBackIcon />
          </IconButton>

          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 950,
                letterSpacing: -0.7,
                color: theme.palette.secondary.main,
                lineHeight: 1.05,
              }}
            >
              Checkout
            </Typography>
            <Typography variant="body2" sx={{ color: subInk, fontWeight: 700, mt: 0.5 }}>
              Select address and confirm order.
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            icon={<LocalShippingIcon />}
            label={
              addrLoading
                ? "Loading addresses..."
                : addresses.length
                ? `${addresses.length} address${addresses.length > 1 ? "es" : ""}`
                : "No address"
            }
            sx={{
              borderRadius: 999,
              fontWeight: 900,
              background: surface2,
              border: `1px solid ${divider}`,
              color: ink,
            }}
          />

          <Button
            onClick={() => setOpenAddressModal(true)}
            startIcon={<AddIcon />}
            variant="contained"
            sx={{
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 950,
              px: 2,
              background: theme.palette.secondary.main,
              color: colors.gray[900],
              boxShadow: "none",
              "&:hover": { opacity: 0.92, boxShadow: "none" },
            }}
          >
            Add new address
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={2}>
        {/* Left */}
        <Grid item xs={12} md={7}>
          <Paper
            sx={{
              p: 2,
              borderRadius: 4,
              border: `1px solid ${divider}`,
              background: surface,
              backdropFilter: "blur(12px)",
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 3,
                  display: "grid",
                  placeItems: "center",
                  background: surface2,
                  border: `1px solid ${divider}`,
                }}
              >
                <PlaceIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 950, color: ink }}>
                  Shipping Address
                </Typography>
                <Typography variant="body2" sx={{ color: subInk, fontWeight: 700 }}>
                  Choose a saved address.
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ my: 1.5, opacity: 0.12 }} />

            {addrLoading ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, py: 3 }}>
                <CircularProgress size={18} />
                <Typography sx={{ color: subInk, fontWeight: 800 }}>Loading addresses...</Typography>
              </Box>
            ) : addresses.length === 0 ? (
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 4,
                  border: `1px dashed ${divider}`,
                  background: surface2,
                }}
              >
                <Typography sx={{ fontWeight: 950, color: ink }}>No saved addresses</Typography>
                <Typography variant="body2" sx={{ color: subInk, fontWeight: 700, mt: 0.4 }}>
                  Add one to continue checkout.
                </Typography>
              </Paper>
            ) : (
              <RadioGroup value={selectedAddress || ""} onChange={(e) => setSelectedAddress(e.target.value)}>
                <List sx={{ p: 0, display: "grid", gap: 1.2 }}>
                  {addresses.map((a) => {
                    const isSelected = String(selectedAddress) === String(a.id);
                    return (
                      <ListItem key={a.id} sx={{ p: 0, borderRadius: 3 }}>
                        <FormControlLabel
                          value={String(a.id)}
                          control={<Radio sx={{ ml: 1.2 }} />}
                          sx={{ m: 0, width: "100%" }}
                          label={
                            <Box sx={{ width: "100%", pr: 1.2 }}>
                              <AddressCard a={a} selected={isSelected} />
                            </Box>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </RadioGroup>
            )}
          </Paper>
        </Grid>

        {/* Right */}
        <Grid item xs={12} md={5}>
          <Paper
            sx={{
              p: 2,
              borderRadius: 4,
              border: `1px solid ${divider}`,
              background: surface,
              backdropFilter: "blur(12px)",
              position: { md: "sticky" },
              top: { md: 86 },
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 3,
                  display: "grid",
                  placeItems: "center",
                  background: surface2,
                  border: `1px solid ${divider}`,
                }}
              >
                <LockCheckoutIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 950, color: ink }}>
                  Order Summary
                </Typography>
                <Typography variant="body2" sx={{ color: subInk, fontWeight: 700 }}>
                  Review items and place order.
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ my: 1.5, opacity: 0.12 }} />

            {!userId ? (
              <Typography sx={{ mt: 1, fontWeight: 800, color: subInk }}>
                Please login to checkout.
              </Typography>
            ) : !cart ? (
              <Typography sx={{ mt: 1, fontWeight: 800, color: subInk }}>
                Loading cart...
              </Typography>
            ) : cart.items && cart.items.length === 0 ? (
              <Typography sx={{ mt: 1, fontWeight: 800, color: subInk }}>
                Your cart is empty.
              </Typography>
            ) : (
              <Box>
                <Stack spacing={1.2}>
                  {cart.items.map((it) => (
                    <Box
                      key={it.id}
                      sx={{
                        p: 1.2,
                        borderRadius: 3,
                        border: `1px solid ${divider}`,
                        background: surface2,
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 950, color: ink, lineHeight: 1.2 }}>
                            {it.product?.name || "Item"}
                          </Typography>
                          <Typography variant="caption" sx={{ color: subInk, fontWeight: 800 }}>
                            Line: {money(it.line_total)}
                          </Typography>
                        </Box>

                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Tooltip title="Decrease">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleUpdateQty(it, it.qty - 1)}
                                disabled={processing[it.id] || it.qty <= 1}
                                sx={{
                                  borderRadius: 2,
                                  border: `1px solid ${divider}`,
                                  background: surface,
                                  "&:hover": { background: surface2 },
                                }}
                              >
                                <RemoveCircleOutlineIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>

                          <Chip
                            label={it.qty}
                            sx={{
                              borderRadius: 999,
                              fontWeight: 950,
                              background: surface,
                              border: `1px solid ${divider}`,
                              color: ink,
                              minWidth: 44,
                            }}
                          />

                          <Tooltip title="Increase">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleUpdateQty(it, it.qty + 1)}
                                disabled={processing[it.id]}
                                sx={{
                                  borderRadius: 2,
                                  border: `1px solid ${divider}`,
                                  background: surface,
                                  "&:hover": { background: surface2 },
                                }}
                              >
                                <AddCircleOutlineIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>

                          <Tooltip title="Remove item">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteItem(it)}
                                disabled={processing[it.id]}
                                sx={{
                                  borderRadius: 2,
                                  border: `1px solid ${divider}`,
                                  background:
                                    theme.palette.mode === "dark" ? "rgba(250,92,92,0.12)" : "rgba(250,92,92,0.10)",
                                  "&:hover": {
                                    background:
                                      theme.palette.mode === "dark" ? "rgba(250,92,92,0.16)" : "rgba(250,92,92,0.14)",
                                  },
                                }}
                              >
                                <DeleteOutlineIcon fontSize="small" sx={{ color: theme.palette.error.main }} />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </Stack>
                    </Box>
                  ))}
                </Stack>

                <Divider sx={{ my: 1.5, opacity: 0.12 }} />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: subInk }}>
                    Subtotal
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 950,
                      color: theme.palette.secondary.main,
                    }}
                  >
                    {money(cart.subtotal)}
                  </Typography>
                </Stack>

                <TextField
                  label="Note (optional)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  size="small"
                  fullWidth
                  sx={{
                    mt: 2,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      background: surface,
                      border: `1px solid ${divider}`,
                      "& fieldset": { borderColor: "transparent" },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <Box sx={{ mr: 1, display: "grid", placeItems: "center", color: subInk }}>
                        <NotesIcon fontSize="small" />
                      </Box>
                    ),
                  }}
                />

                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(-1)}
                    startIcon={<ArrowBackIcon />}
                    sx={{
                      borderRadius: 999,
                      textTransform: "none",
                      fontWeight: 900,
                      borderColor: divider,
                      background: surface,
                      "&:hover": { background: surface2, borderColor: theme.palette.primary.main },
                    }}
                  >
                    Back
                  </Button>

                  <Button
                    variant="contained"
                    onClick={handleCheckout}
                    disabled={loadingCheckout}
                    startIcon={loadingCheckout ? null : <LockCheckoutIcon />}
                    sx={{
                      ml: "auto",
                      borderRadius: 999,
                      textTransform: "none",
                      fontWeight: 950,
                      px: 2.6,
                      background: theme.palette.secondary.main,
                      color: colors.gray[900],
                      boxShadow: "none",
                      "&:hover": { opacity: 0.92, boxShadow: "none" },
                      "&.Mui-disabled": { opacity: 0.55 },
                    }}
                  >
                    {loadingCheckout ? <CircularProgress size={18} /> : "Place Order"}
                  </Button>
                </Stack>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Address modal */}
      <Dialog
        open={openAddressModal}
        onClose={() => {
          if (adding) return;
          // If there are zero addresses, keep it open so user must add one
          if (addresses.length === 0) return;
          setOpenAddressModal(false);
        }}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 4,
            border: `1px solid ${divider}`,
            background: surface,
            backdropFilter: "blur(14px)",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 950,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Box
            sx={{
              color: theme.palette.secondary.main,
            }}
          >
            Add new address
          </Box>

          <Tooltip title={addresses.length === 0 ? "Add an address to continue" : "Close"}>
            <span>
              <IconButton
                disabled={addresses.length === 0}
                onClick={() => setOpenAddressModal(false)}
                sx={{ borderRadius: 3, border: `1px solid ${divider}`, background: surface }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ display: "grid", gap: 1.2, mt: 1 }}>
            <TextField
              label="Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  background: surface,
                  border: `1px solid ${divider}`,
                  "& fieldset": { borderColor: "transparent" },
                },
              }}
            />
            <TextField
              label="Mobile"
              value={newMobile}
              onChange={(e) => setNewMobile(e.target.value)}
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  background: surface,
                  border: `1px solid ${divider}`,
                  "& fieldset": { borderColor: "transparent" },
                },
              }}
            />

            <Grid container spacing={1.2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="District"
                  value={newDistrict}
                  onChange={(e) => setNewDistrict(e.target.value)}
                  size="small"
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      background: surface,
                      border: `1px solid ${divider}`,
                      "& fieldset": { borderColor: "transparent" },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Area"
                  value={newArea}
                  onChange={(e) => setNewArea(e.target.value)}
                  size="small"
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      background: surface,
                      border: `1px solid ${divider}`,
                      "& fieldset": { borderColor: "transparent" },
                    },
                  }}
                />
              </Grid>
            </Grid>

            <TextField
              label="Address"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              size="small"
              multiline
              minRows={3}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  background: surface,
                  border: `1px solid ${divider}`,
                  "& fieldset": { borderColor: "transparent" },
                },
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 1, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={resetNewAddress}
            disabled={adding}
            sx={{
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 900,
              borderColor: divider,
              background: surface,
              "&:hover": { background: surface2 },
            }}
          >
            Clear
          </Button>

          <Button
            variant="contained"
            onClick={handleAddAddress}
            disabled={adding}
            startIcon={adding ? null : <AddIcon />}
            sx={{
              ml: "auto",
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 950,
              px: 2.4,
              background: theme.palette.secondary.main,
              color: colors.gray[900],
              boxShadow: "none",
              "&:hover": { opacity: 0.92, boxShadow: "none" },
              "&.Mui-disabled": { opacity: 0.55 },
            }}
          >
            {adding ? <CircularProgress size={18} /> : "Save address"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!msg} autoHideDuration={3000} onClose={() => setMsg("")} message={msg} />
    </Box>
  );
};

export default ProceedOrder;
