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
import { Visibility, Refresh, Search } from "@mui/icons-material";
import { getDeliveryMen } from "../../../api/controller/admin_controller/user_controller.jsx";
import { tokens } from "../../../theme";

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

    </Box>
  );
};

export default AllDeliveryMans;
