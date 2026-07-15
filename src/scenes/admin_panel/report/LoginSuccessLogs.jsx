import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import FilterListIcon from "@mui/icons-material/FilterList";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { getLoginSuccessLogs } from "../../../api/controller/admin_controller/report/report_controller";

const DEFAULT_FILTERS = {
  user_id: "",
  user_type: "",
  login_type: "",
  platform: "",
  start_date: "",
  end_date: "",
};

const USER_TYPE_OPTIONS = ["admin", "customer", "seller", "delivery_boy", "reseller"];
const LOGIN_TYPE_OPTIONS = ["password", "otp"];
const PLATFORM_OPTIONS = ["web", "android", "ios", "admin", "pos"];

const buildParams = (filters, page, perPage) => {
  const params = {
    page,
    per_page: perPage,
  };

  Object.entries(filters).forEach(([key, value]) => {
    const nextValue = String(value ?? "").trim();
    if (nextValue) params[key] = nextValue;
  });

  return params;
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("en-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatLabel = (value) => {
  const text = String(value || "").trim();
  if (!text) return "-";
  return text.replace(/[_-]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

const getUserLabel = (row) => row?.name || row?.user?.name || row?.email || row?.phone || `User #${row?.user_id || "-"}`;

const LoginSuccessLogs = () => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [pagination, setPagination] = useState({
    total: 0,
    currentPage: 1,
    lastPage: 1,
    perPage: 20,
  });

  const activeFilterCount = useMemo(
    () => Object.values(appliedFilters).filter((value) => String(value || "").trim()).length,
    [appliedFilters]
  );

  const fetchLogs = async (pageZeroBased = page, perPage = rowsPerPage, nextFilters = appliedFilters) => {
    try {
      setLoading(true);
      setErrorMessage("");

      const apiPage = pageZeroBased + 1;
      const response = await getLoginSuccessLogs(buildParams(nextFilters, apiPage, perPage));

      if (response?.status === "success" && response?.data) {
        const payload = response.data;
        const list = Array.isArray(payload?.data) ? payload.data : [];

        setRows(list);
        setPagination({
          total: Number(payload?.total || 0),
          currentPage: Number(payload?.current_page || apiPage),
          lastPage: Number(payload?.last_page || 1),
          perPage: Number(payload?.per_page || perPage),
        });
        setPage(Math.max(0, Number(payload?.current_page || apiPage) - 1));
        setRowsPerPage(Number(payload?.per_page || perPage));
      } else {
        setRows([]);
        setPagination({ total: 0, currentPage: apiPage, lastPage: 1, perPage });
        setErrorMessage(response?.message || "Failed to fetch login success logs");
      }
    } catch (error) {
      console.error("Login success logs error:", error);
      setRows([]);
      setPagination({ total: 0, currentPage: pageZeroBased + 1, lastPage: 1, perPage });
      setErrorMessage(error?.response?.data?.message || error.message || "Failed to fetch login success logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(0, rowsPerPage, appliedFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (key) => (event) => {
    setFilters((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setPage(0);
    fetchLogs(0, rowsPerPage, filters);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    setPage(0);
    fetchLogs(0, rowsPerPage, DEFAULT_FILTERS);
  };

  const handleChangePage = (_event, nextPage) => {
    setPage(nextPage);
    fetchLogs(nextPage, rowsPerPage, appliedFilters);
  };

  const handleChangeRowsPerPage = (event) => {
    const nextPerPage = Number(event.target.value || 20);
    setRowsPerPage(nextPerPage);
    setPage(0);
    fetchLogs(0, nextPerPage, appliedFilters);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        sx={{ mb: 2 }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: "#eef2ff",
              color: "#6366f1",
              display: "grid",
              placeItems: "center",
            }}
          >
            <LoginOutlinedIcon />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Login Success Logs
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600 }}>
              Track successful logins by user, login type, platform, and date range
            </Typography>
          </Box>
        </Stack>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => fetchLogs(page, rowsPerPage, appliedFilters)}
          disabled={loading}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
        >
          Refresh
        </Button>
      </Stack>

      <Card variant="outlined" sx={{ borderRadius: 2.5, mb: 2 }}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <FilterListIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            <Typography sx={{ fontWeight: 800 }}>Filters</Typography>
            {activeFilterCount > 0 ? (
              <Chip size="small" label={`${activeFilterCount} active`} color="primary" variant="outlined" />
            ) : null}
          </Stack>

          <Grid container spacing={1.5}>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                size="small"
                label="User ID"
                value={filters.user_id}
                onChange={handleFilterChange("user_id")}
                inputProps={{ inputMode: "numeric" }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                fullWidth
                size="small"
                label="User Type"
                value={filters.user_type}
                onChange={handleFilterChange("user_type")}
              >
                <MenuItem value="">All</MenuItem>
                {USER_TYPE_OPTIONS.map((item) => (
                  <MenuItem key={item} value={item}>{formatLabel(item)}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                fullWidth
                size="small"
                label="Login Type"
                value={filters.login_type}
                onChange={handleFilterChange("login_type")}
              >
                <MenuItem value="">All</MenuItem>
                {LOGIN_TYPE_OPTIONS.map((item) => (
                  <MenuItem key={item} value={item}>{formatLabel(item)}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                fullWidth
                size="small"
                label="Platform"
                value={filters.platform}
                onChange={handleFilterChange("platform")}
              >
                <MenuItem value="">All</MenuItem>
                {PLATFORM_OPTIONS.map((item) => (
                  <MenuItem key={item} value={item}>{formatLabel(item)}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Start Date"
                value={filters.start_date}
                onChange={handleFilterChange("start_date")}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="End Date"
                value={filters.end_date}
                onChange={handleFilterChange("end_date")}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  startIcon={<RestartAltIcon />}
                  onClick={handleResetFilters}
                  disabled={loading}
                  sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
                >
                  Reset
                </Button>
                <Button
                  variant="contained"
                  startIcon={<FilterListIcon />}
                  onClick={handleApplyFilters}
                  disabled={loading}
                  sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, bgcolor: "#6366f1" }}
                >
                  Apply Filters
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
        <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            spacing={1}
            sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}
          >
            <Box>
              <Typography sx={{ fontWeight: 800 }}>Successful Login History</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {pagination.total} record{pagination.total === 1 ? "" : "s"} found
              </Typography>
            </Box>
            <Chip
              size="small"
              label={`Page ${pagination.currentPage} of ${pagination.lastPage}`}
              variant="outlined"
              sx={{ alignSelf: { xs: "flex-start", sm: "center" }, fontWeight: 700 }}
            />
          </Stack>

          {errorMessage ? (
            <Box sx={{ p: 2 }}>
              <Alert severity="error">{errorMessage}</Alert>
            </Box>
          ) : null}

          <TableContainer>
            <Table size="small" sx={{ minWidth: 1050 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "action.hover" }}>
                  <TableCell sx={{ fontWeight: 800 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>User Type</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Login Type</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Platform</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Identifier</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>IP Address</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Logged In At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                      <CircularProgress size={28} sx={{ color: "#6366f1" }} />
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6, color: "text.secondary", fontWeight: 600 }}>
                      No login success logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell sx={{ fontWeight: 700 }}>{row.id}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {getUserLabel(row)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          ID: {row.user_id || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={formatLabel(row.user_type)} variant="outlined" sx={{ fontWeight: 700 }} />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={formatLabel(row.login_type)}
                          color={row.login_type === "otp" ? "info" : "success"}
                          variant="outlined"
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={formatLabel(row.platform)} sx={{ fontWeight: 700, bgcolor: "#eef2ff", color: "#4f46e5" }} />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 220 }}>
                        <Tooltip title={row.identifier || "-"}>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 210 }}>
                            {row.identifier || "-"}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{row.ip_address || "-"}</TableCell>
                      <TableCell>{formatDateTime(row.logged_in_at || row.created_at)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={pagination.total}
            page={page}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[10, 20, 50, 100]}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginSuccessLogs;
