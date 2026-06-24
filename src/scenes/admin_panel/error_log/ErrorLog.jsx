import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  Typography,
  Chip,
  Tooltip,
} from "@mui/material";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import { getProductCreateErrorLogs } from "../../../api/controller/admin_controller/error_log_controller";

const TABS = ["Product create", "Login", "Register", "Order"];

const ErrorLog = () => {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [pagination, setPagination] = useState({ total: 0, perPage: 20, currentPage: 1 });

  const fetchProductCreateLogs = async (nextPage = 1) => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await getProductCreateErrorLogs({ page: nextPage });

      if (response?.status === "success" && response?.data) {
        const payload = response.data;
        setLogs(Array.isArray(payload.data) ? payload.data : []);
        setPagination({
          total: Number(payload.total || 0),
          perPage: Number(payload.per_page || 20),
          currentPage: Number(payload.current_page || nextPage),
        });
      } else {
        setLogs([]);
        setPagination({ total: 0, perPage: 20, currentPage: nextPage });
        setErrorMessage(response?.message || "Failed to fetch product create error logs");
      }
    } catch (error) {
      setErrorMessage(error?.message || "Failed to fetch product create error logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 0) {
      fetchProductCreateLogs(page + 1);
    }
  }, [tab, page]);

  const rows = useMemo(() => logs, [logs]);

  const handleTabChange = (_event, nextTab) => {
    setTab(nextTab);
    if (nextTab === 0) {
      setPage(0);
    }
  };

  const handleRefresh = () => {
    if (tab === 0) {
      fetchProductCreateLogs(page + 1);
    }
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString("en-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderProductCreateLogs = () => (
    <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
      <CardContent sx={{ p: 0 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Product Create Error Logs
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Showing important fields only
            </Typography>
          </Box>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
        </Stack>

        {errorMessage ? (
          <Box sx={{ p: 2 }}>
            <Alert severity="error">{errorMessage}</Alert>
          </Box>
        ) : null}

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Level</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Message</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Method</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Endpoint</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>IP</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={26} />
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5, color: "text.secondary" }}>
                    No logs found
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>{log.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {log?.user?.name || "N/A"}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {log?.user?.email || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={log.level || "unknown"}
                        variant="outlined"
                        color={log.level === "validation_error" ? "warning" : "default"}
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 280 }}>
                      <Tooltip title={log.message || "-"}>
                        <Typography
                          variant="body2"
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: 260,
                          }}
                        >
                          {log.message || "-"}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{log.method || "-"}</TableCell>
                    <TableCell sx={{ maxWidth: 280 }}>
                      <Tooltip title={log.url || "-"}>
                        <Typography
                          variant="body2"
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: 260,
                          }}
                        >
                          {log.url || "-"}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{log.ip_address || "-"}</TableCell>
                    <TableCell>{formatDateTime(log.created_at)}</TableCell>
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
          rowsPerPage={pagination.perPage}
          rowsPerPageOptions={[pagination.perPage]}
          onPageChange={(_event, nextPage) => setPage(nextPage)}
          onRowsPerPageChange={() => {}}
        />
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            bgcolor: "#fff7ed",
            color: "#ea580c",
            display: "grid",
            placeItems: "center",
          }}
        >
          <BugReportOutlinedIcon />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            ErrorLog
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600 }}>
            Monitor key error logs from admin activities
          </Typography>
        </Box>
      </Stack>

      <Card variant="outlined" sx={{ borderRadius: 2.5, mb: 2 }}>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 1 }}
        >
          {TABS.map((item) => (
            <Tab key={item} label={item} />
          ))}
        </Tabs>
      </Card>

      {tab === 0 ? (
        renderProductCreateLogs()
      ) : (
        <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
          <CardContent>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              {TABS[tab]} error log tab is coming soon.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ErrorLog;
