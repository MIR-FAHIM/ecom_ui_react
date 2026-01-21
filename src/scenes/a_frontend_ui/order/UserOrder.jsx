import React, { useEffect, useState } from 'react';
import { Box, Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, CircularProgress, Button, Chip, TablePagination, useTheme } from '@mui/material';
import { getUserOrder } from '../../../api/controller/admin_controller/order/order_controller';
import { useNavigate } from 'react-router-dom';
import { tokens } from '../../../theme';

const UserOrder = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const border = theme.palette.divider || colors.primary[200];
  const surface = colors.primary[400];
  const surface2 = colors.primary[300];
  const ink = colors.gray[100];
  const subInk = colors.gray[300];

  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [total, setTotal] = useState(0);

  const loadOrders = async (p = 1) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await getUserOrder(userId, { page: p, per_page: perPage });
      // res.data contains pagination object
      const pageData = res?.data ?? res;
      const list = pageData?.data ?? [];
      setOrders(list);
      setTotal(pageData?.total ?? pageData?.data?.length ?? 0);
      setPage(pageData?.current_page ?? p);
    } catch (e) {
      console.error('Failed to load user orders', e);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(page);
  }, [page, perPage]);

  const handleChangePage = (event, newPage) => {
    // TablePagination uses zero-based pages
    loadOrders(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    setPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const getStatusColor = (status) => {
    if (!status) return 'default';
    if (status === 'pending') return 'warning';
    if (status === 'completed') return 'success';
    if (status === 'cancelled') return 'error';
    return 'default';
  };

  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 900, color: ink }}>My Orders</Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
      ) : orders.length === 0 ? (
        <Typography>No orders yet.</Typography>
      ) : (
        <Paper sx={{ border: `1px solid ${border}`, background: surface }}>
          <TableContainer>
            <Table sx={{ "& th": { fontWeight: 900, color: ink, background: surface2 } }}>
              <TableHead>
                <TableRow>
                  <TableCell>Order #</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id} hover sx={{ "& td": { color: subInk } }}>
                    <TableCell sx={{ color: ink, fontWeight: 800 }}>{o.order_number}</TableCell>
                    <TableCell>{new Date(o.created_at).toLocaleString()}</TableCell>
                    <TableCell><Chip label={o.status} color={getStatusColor(o.status)} size="small" /></TableCell>
                    <TableCell>{o.payment_status}</TableCell>
                    <TableCell align="right">৳ {o.total ?? 0}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        sx={{ minWidth: 64, color: theme.palette.secondary.main, fontWeight: 800 }}
                        onClick={() => navigate(`/order/${o.id}`)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={total}
            page={(page - 1) || 0}
            onPageChange={handleChangePage}
            rowsPerPage={perPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 20, 50]}
            sx={{ color: subInk }}
          />
        </Paper>
      )}
    </Container>
  );
};

export default UserOrder;
