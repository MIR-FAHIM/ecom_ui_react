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
} from "@mui/material";
import { Visibility, Edit, Delete, Refresh, Search } from "@mui/icons-material";
import { getAllCustomers } from "../../../api/controller/user_controller.jsx";
import { tokens } from "../../../theme";

const AllCustomers = () => {
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

  const fetchCustomers = async (pageZeroBased = page, perPage = rowsPerPage) => {
    setLoading(true);
    try {
      // Laravel pagination uses 1-based page
      const apiPage = pageZeroBased + 1;

      // Your controller MUST support params: page, per_page (if you added per_page)
      // If your backend does not support per_page yet, it will ignore it safely.
      const response = await getAllCustomers({ page: apiPage, per_page: perPage });

      if (response?.status === "success") {
        const paginator = response?.data; // THIS is the paginator object
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
      console.error("Error fetching customers:", err);
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(0, rowsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((c) => {
      const name = (c?.name ?? "").toLowerCase();
      const email = (c?.email ?? "").toLowerCase();
      const mobile = String(c?.mobile ?? "");
      const address = (c?.address ?? "").toLowerCase();
      const district = (c?.district ?? "").toLowerCase();
      const area = (c?.area ?? "").toLowerCase();
      const zone = (c?.zone ?? "").toLowerCase();

      return (
        name.includes(q) ||
        email.includes(q) ||
        mobile.includes(searchQuery.trim()) ||
        address.includes(q) ||
        district.includes(q) ||
        area.includes(q) ||
        zone.includes(q)
      );
    });
  }, [rows, searchQuery]);

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
    fetchCustomers(newPage, rowsPerPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const next = parseInt(event.target.value, 10);
    setRowsPerPage(next);
    setPage(0);
    fetchCustomers(0, next);
  };

  const handleViewProfile = (customerId) => navigate(`/admin/customer/${customerId}`);
  const handleEdit = (customerId) => navigate(`/admin/customer/edit/${customerId}`);

  const handleDelete = (customerId) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      console.log("Delete customer:", customerId);
      // add delete API later
    }
  };

  const renderStatusChip = (statusRaw, isBanned) => {
    if (isBanned === true) {
      return <Chip label="Banned" size="small" variant="outlined" color="error" />;
    }

    const status = String(statusRaw ?? "").toLowerCase();

    if (status === "active") {
      return <Chip label="Active" size="small" variant="outlined" color="success" />;
    }
    if (status === "inactive") {
      return <Chip label="Inactive" size="small" variant="outlined" color="warning" />;
    }
    if (!status) {
      return <Chip label="N/A" size="small" variant="outlined" />;
    }
    return <Chip label={status} size="small" variant="outlined" />;
  };

  const renderLocation = (c) => {
    const parts = [c?.area, c?.district, c?.zone].filter(Boolean);
    return parts.length ? parts.join(", ") : "N/A";
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" fontWeight={800}>
          All Customers
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
                Customers (Total: {total})
              </Typography>
              <Typography variant="caption" color="text.secondary">
                API: /api/users/customers?page=1
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
                      onClick={() => fetchCustomers(page, rowsPerPage)}
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
                  {["ID", "Name", "Email", "Mobile", "Location", "Status", "Actions"].map((h) => (
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
                      <Typography color="text.secondary">Loading customers...</Typography>
                    </TableCell>
                  </TableRow>
                )}

                {!loading && filteredRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No customers found</Typography>
                    </TableCell>
                  </TableRow>
                )}

                {!loading &&
                  filteredRows.map((customer, idx) => (
                    <TableRow
                      key={customer?.id ?? idx}
                      hover
                      sx={{
                        "& td": { borderBottom: `1px solid ${colors.primary[300]}` },
                        backgroundColor: idx % 2 === 0 ? "transparent" : colors.primary[300],
                      }}
                    >
                      <TableCell sx={{ fontWeight: 700 }}>{customer?.id ?? "N/A"}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{customer?.name ?? "N/A"}</TableCell>
                      <TableCell>{customer?.email ?? "N/A"}</TableCell>
                      <TableCell>{customer?.mobile ?? "N/A"}</TableCell>
                      <TableCell>{renderLocation(customer)}</TableCell>
                      <TableCell>{renderStatusChip(customer?.status, customer?.is_banned)}</TableCell>

                      <TableCell align="center">
                        <Tooltip title="View">
                          <IconButton
                            size="small"
                            onClick={() => handleViewProfile(customer.id)}
                            sx={{ color: colors.blueAccent[500] }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(customer.id)}
                            sx={{ color: colors.blueAccent[400] }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(customer.id)}
                            sx={{ color: theme.palette.error.main }}
                          >
                            <Delete fontSize="small" />
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
    </Box>
  );
};

export default AllCustomers;
