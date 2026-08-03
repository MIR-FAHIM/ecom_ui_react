import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material";
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
  Button,
  TextField,
  Grid,
  Paper,
  IconButton,
  Chip,
  InputAdornment,
  Tooltip,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";
import { Edit, Visibility, Refresh, Search } from "@mui/icons-material";
import { getDeliveryMen, getUserDetail, updateUser } from "../../../api/controller/admin_controller/user_controller.jsx";
import { tokens } from "../../../theme";


const initialEditForm = {
  name: "",
  email: "",
  mobile: "",
  optional_phone: "",
  address: "",
  zone: "",
  district: "",
  area: "",
  lat: "",
  lon: "",
  password: "",
  confirm_password: "",
};

const normalizeUser = (response, fallback = {}) => response?.data?.user || response?.data || response?.user || response || fallback;
const readErrorPayload = (error) => ({
  message: error?.response?.data?.message || error?.message || "Delivery man update failed",
  errors: error?.response?.data?.errors || error?.errors || {},
});
const AllDeliveryMans = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  // API pagination state
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0); // MUI is 0-based
  const [rowsPerPage, setRowsPerPage] = useState(20); // API default is 20
  const [loading, setLoading] = useState(false);

  // client-side search (within current page)
  const [searchQuery, setSearchQuery] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState(initialEditForm);
  const [editErrors, setEditErrors] = useState({});
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const fetchDeliveryMen = async (pageZeroBased = page, perPage = rowsPerPage) => {
    setLoading(true);
    try {
      const apiPage = pageZeroBased + 1;
      const response = await getDeliveryMen({ page: apiPage, per_page: perPage });

      if (response?.status === "success") {
        const paginator = response?.data;
        const list = Array.isArray(paginator?.data) ? paginator.data : [];

        setRows(list);
        setTotal(Number(paginator?.total ?? list.length));
        setRowsPerPage(Number(paginator?.per_page ?? perPage));
        setPage(Number(paginator?.current_page ?? apiPage) - 1);
      } else {
        setRows([]);
        setTotal(0);
      }
    } catch (err) {
      console.error("Error fetching delivery men:", err);
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryMen(0, rowsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((d) => {
      const name = (d?.name ?? "").toLowerCase();
      const email = (d?.email ?? "").toLowerCase();
      const phone = String(d?.phone ?? "");
      const address = (d?.address ?? "").toLowerCase();
      const city = (d?.city ?? "").toLowerCase();
      const state = (d?.state ?? "").toLowerCase();
      const country = (d?.country ?? "").toLowerCase();

      return (
        name.includes(q) ||
        email.includes(q) ||
        phone.includes(searchQuery.trim()) ||
        address.includes(q) ||
        city.includes(q) ||
        state.includes(q) ||
        country.includes(q)
      );
    });
  }, [rows, searchQuery]);

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
    fetchDeliveryMen(newPage, rowsPerPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const next = parseInt(event.target.value, 10);
    setRowsPerPage(next);
    setPage(0);
    fetchDeliveryMen(0, next);
  };


  const fillEditForm = (user) => {
    setEditForm({
      name: user?.name || "",
      email: user?.email || "",
      mobile: user?.mobile || user?.phone || "",
      optional_phone: user?.optional_phone || "",
      address: user?.address || "",
      zone: user?.zone || "",
      district: user?.district || "",
      area: user?.area || "",
      lat: user?.lat ?? "",
      lon: user?.lon ?? "",
      password: "",
      confirm_password: "",
    });
  };

  const setEditField = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
    setEditErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleEdit = async (deliveryMan) => {
    if (!deliveryMan?.id) return;
    setEditTarget(deliveryMan);
    fillEditForm(deliveryMan);
    setEditErrors({});
    setEditOpen(true);
    setEditLoading(true);
    try {
      const response = await getUserDetail(deliveryMan.id);
      fillEditForm(normalizeUser(response, deliveryMan));
    } catch (error) {
      setSnack({ open: true, message: error?.response?.data?.message || "Delivery man details fetch failed", severity: "error" });
    } finally {
      setEditLoading(false);
    }
  };

  const buildEditPayload = () => {
    const payload = {
      name: editForm.name.trim(),
      email: editForm.email.trim(),
      mobile: editForm.mobile.trim(),
      optional_phone: editForm.optional_phone.trim(),
      address: editForm.address.trim(),
      zone: editForm.zone.trim(),
      district: editForm.district.trim(),
      area: editForm.area.trim(),
      lat: editForm.lat === "" ? "" : Number(editForm.lat),
      lon: editForm.lon === "" ? "" : Number(editForm.lon),
    };
    if (editForm.password) payload.password = editForm.password;
    return payload;
  };

  const validateEditPassword = () => {
    if (!editForm.password && !editForm.confirm_password) return true;
    if (editForm.password.length < 6) {
      setEditErrors((prev) => ({ ...prev, password: ["Password must be at least 6 characters."] }));
      return false;
    }
    if (editForm.password !== editForm.confirm_password) {
      setEditErrors((prev) => ({ ...prev, confirm_password: ["Password and confirm password do not match."] }));
      return false;
    }
    return true;
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if (!editTarget?.id || !validateEditPassword()) return;
    setEditSaving(true);
    setEditErrors({});
    try {
      const response = await updateUser(editTarget.id, buildEditPayload());
      if (response?.status === "failed") {
        setEditErrors(response?.errors || {});
        setSnack({ open: true, message: response?.message || "Delivery man update failed", severity: "error" });
        return;
      }
      setSnack({ open: true, message: "Delivery man updated successfully", severity: "success" });
      setEditOpen(false);
      setEditTarget(null);
      fetchDeliveryMen(page, rowsPerPage);
    } catch (error) {
      const parsed = readErrorPayload(error);
      setEditErrors(parsed.errors);
      setSnack({ open: true, message: parsed.message, severity: "error" });
    } finally {
      setEditSaving(false);
    }
  };
  const handleView = (deliveryManId) => {
    if (!deliveryManId) return;
    navigate(`/ecom/delivery/detail/${deliveryManId}`);
  };

  const renderStatusChip = (banned) => {
    if (banned === 1 || banned === true) {
      return <Chip label="Banned" size="small" variant="outlined" color="error" />;
    }
    return <Chip label="Active" size="small" variant="outlined" color="success" />;
  };

  const renderLocation = (d) => {
    const parts = [d?.address, d?.city, d?.state, d?.country].filter(Boolean);
    return parts.length ? parts.join(", ") : "N/A";
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" fontWeight={800}>
          All Delivery Mans
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Server paginated list. Search filters only the current page.
        </Typography>
      </Box>

      <Card sx={{ background: colors.primary[400], borderRadius: 2 }}>
        <CardContent>
          {/* Toolbar */}
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h6" fontWeight={800}>
                Delivery Men (Total: {total})
              </Typography>
              <Typography variant="caption" color="text.secondary">
                API: /api/users/delivery-men?page=1
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  justifyContent: { xs: "flex-start", md: "flex-end" },
                  flexWrap: "wrap",
                }}
              >
                <TextField
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search current page..."
                  sx={{
                    width: { xs: "100%", md: 320 },
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: colors.primary[500],
                      borderRadius: 2,
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />

                <Tooltip title="Refresh">
                  <span>
                    <IconButton
                      onClick={() => fetchDeliveryMen(page, rowsPerPage)}
                      disabled={loading}
                      sx={{
                        backgroundColor: colors.primary[500],
                        borderRadius: 2,
                      }}
                    >
                      <Refresh fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>

                <Button
                  variant="contained"
                  onClick={() => setSearchQuery("")}
                  sx={{
                    background: colors.blueAccent[500],
                    borderRadius: 2,
                    px: 2,
                    whiteSpace: "nowrap",
                  }}
                >
                  Reset Search
                </Button>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2, opacity: 0.2 }} />

          {/* Table */}
          <TableContainer
            component={Paper}
            sx={{
              background: colors.primary[400],
              borderRadius: 2,
              overflow: "hidden",
              border: `1px solid ${colors.primary[500]}`,
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {[
                    "ID",
                    "Name",
                    "Email",
                    "Phone",
                    "Location",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <TableCell
                      key={h}
                      sx={{
                        fontWeight: 800,
                        backgroundColor: colors.primary[500],
                        borderBottom: `1px solid ${colors.primary[300]}`,
                      }}
                      align={h === "Actions" ? "center" : "left"}
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">Loading delivery men...</Typography>
                    </TableCell>
                  </TableRow>
                )}

                {!loading && filteredRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No delivery men found</Typography>
                    </TableCell>
                  </TableRow>
                )}

                {!loading &&
                  filteredRows.map((deliveryMan, idx) => (
                    <TableRow
                      key={deliveryMan?.id ?? idx}
                      hover
                      sx={{
                        "& td": { borderBottom: `1px solid ${colors.primary[300]}` },
                        backgroundColor: idx % 2 === 0 ? "transparent" : colors.primary[300],
                      }}
                    >
                      <TableCell sx={{ fontWeight: 700 }}>{deliveryMan?.id ?? "N/A"}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{deliveryMan?.name ?? "N/A"}</TableCell>
                      <TableCell>{deliveryMan?.email ?? "N/A"}</TableCell>
                      <TableCell>{deliveryMan?.phone ?? "N/A"}</TableCell>
                      <TableCell>{renderLocation(deliveryMan)}</TableCell>
                      <TableCell>{renderStatusChip(deliveryMan?.banned)}</TableCell>

                      <TableCell align="center">

                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(deliveryMan)}
                            sx={{ color: colors.blueAccent[400] }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
<Tooltip title="View">
                          <IconButton
                            size="small"
                            onClick={() => handleView(deliveryMan?.id)}
                            sx={{ color: colors.blueAccent[500] }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination (server) */}
          <TablePagination
            rowsPerPageOptions={[10, 20, 50, 100]}
            component="div"
            count={total}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              mt: 1,
              ".MuiTablePagination-toolbar": { px: 0 },
              ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
                color: "text.secondary",
              },
            }}
          />
        </CardContent>
      </Card>
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Edit Delivery Man</DialogTitle>
        <Box component="form" onSubmit={handleEditSubmit}>
          <DialogContent dividers>
            {editLoading ? (
              <Stack alignItems="center" sx={{ py: 6 }}><CircularProgress /></Stack>
            ) : (
              <Stack spacing={3}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}><TextField label="Name" value={editForm.name} onChange={(e) => setEditField("name", e.target.value)} error={Boolean(editErrors?.name)} helperText={editErrors?.name?.[0] || ""} fullWidth size="small" /></Grid>
                  <Grid item xs={12} md={6}><TextField label="Email" type="email" value={editForm.email} onChange={(e) => setEditField("email", e.target.value)} error={Boolean(editErrors?.email)} helperText={editErrors?.email?.[0] || ""} fullWidth size="small" /></Grid>
                  <Grid item xs={12} md={6}><TextField label="Mobile" value={editForm.mobile} onChange={(e) => setEditField("mobile", e.target.value)} error={Boolean(editErrors?.mobile)} helperText={editErrors?.mobile?.[0] || ""} fullWidth size="small" /></Grid>
                  <Grid item xs={12} md={6}><TextField label="Optional Phone" value={editForm.optional_phone} onChange={(e) => setEditField("optional_phone", e.target.value)} error={Boolean(editErrors?.optional_phone)} helperText={editErrors?.optional_phone?.[0] || ""} fullWidth size="small" /></Grid>
                  <Grid item xs={12}><TextField label="Address" value={editForm.address} onChange={(e) => setEditField("address", e.target.value)} error={Boolean(editErrors?.address)} helperText={editErrors?.address?.[0] || ""} fullWidth size="small" /></Grid>
                  <Grid item xs={12} md={4}><TextField label="Zone" value={editForm.zone} onChange={(e) => setEditField("zone", e.target.value)} error={Boolean(editErrors?.zone)} helperText={editErrors?.zone?.[0] || ""} fullWidth size="small" /></Grid>
                  <Grid item xs={12} md={4}><TextField label="District" value={editForm.district} onChange={(e) => setEditField("district", e.target.value)} error={Boolean(editErrors?.district)} helperText={editErrors?.district?.[0] || ""} fullWidth size="small" /></Grid>
                  <Grid item xs={12} md={4}><TextField label="Area" value={editForm.area} onChange={(e) => setEditField("area", e.target.value)} error={Boolean(editErrors?.area)} helperText={editErrors?.area?.[0] || ""} fullWidth size="small" /></Grid>
                  <Grid item xs={12} md={6}><TextField label="Latitude" type="number" value={editForm.lat} onChange={(e) => setEditField("lat", e.target.value)} error={Boolean(editErrors?.lat)} helperText={editErrors?.lat?.[0] || ""} fullWidth size="small" /></Grid>
                  <Grid item xs={12} md={6}><TextField label="Longitude" type="number" value={editForm.lon} onChange={(e) => setEditField("lon", e.target.value)} error={Boolean(editErrors?.lon)} helperText={editErrors?.lon?.[0] || ""} fullWidth size="small" /></Grid>
                </Grid>
                <Divider />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>Password</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}><TextField label="New Password" type="password" value={editForm.password} onChange={(e) => setEditField("password", e.target.value)} error={Boolean(editErrors?.password)} helperText={editErrors?.password?.[0] || "Leave blank to keep current password"} fullWidth size="small" /></Grid>
                    <Grid item xs={12} md={6}><TextField label="Confirm Password" type="password" value={editForm.confirm_password} onChange={(e) => setEditField("confirm_password", e.target.value)} error={Boolean(editErrors?.confirm_password)} helperText={editErrors?.confirm_password?.[0] || ""} fullWidth size="small" /></Grid>
                  </Grid>
                </Box>
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setEditOpen(false)} disabled={editSaving}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={editLoading || editSaving} startIcon={editSaving ? <CircularProgress size={16} color="inherit" /> : null}>{editSaving ? "Saving..." : "Save Changes"}</Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3500} onClose={() => setSnack((prev) => ({ ...prev, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={snack.severity} onClose={() => setSnack((prev) => ({ ...prev, open: false }))}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default AllDeliveryMans;
