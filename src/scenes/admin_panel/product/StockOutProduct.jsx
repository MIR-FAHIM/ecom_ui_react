import React, { useEffect, useMemo, useState } from "react";
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
  TextField,
  IconButton,
  Tooltip,
  CircularProgress,
  Chip,
} from "@mui/material";
import { Refresh, Search } from "@mui/icons-material";
import { tokens } from "../../../theme";
import { image_file_url } from "../../../api/config/index.jsx";
import { getStockOutProduct } from "../../../api/controller/admin_controller/product/product_controller.jsx";

const StockOutProduct = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchStockOutProducts = async (pageZeroBased = 0, perPage = 10) => {
    try {
      setLoading(true);
      const params = {
        page: pageZeroBased + 1,
        per_page: perPage,
        search: searchTerm.trim() || undefined,
      };
      const response = await getStockOutProduct(params);
      const payload = response?.data ?? response;
      if (payload?.data) {
        setProducts(payload.data || []);
        setTotalProducts(payload.total || 0);
      } else {
        setProducts([]);
        setTotalProducts(0);
      }
    } catch (error) {
      console.error("Error fetching stock out products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockOutProducts(page, rowsPerPage);
  }, [page, rowsPerPage, searchTerm]);

  useEffect(() => {
    setPage(0);
  }, [searchTerm]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const term = searchTerm.toLowerCase();
    return products.filter((product) => {
      const name = product?.name?.toLowerCase?.() || "";
      const sku = product?.sku?.toLowerCase?.() || "";
      const slug = product?.slug?.toLowerCase?.() || "";
      return name.includes(term) || sku.includes(term) || slug.includes(term);
    });
  }, [products, searchTerm]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRefresh = () => {
    fetchStockOutProducts(page, rowsPerPage);
  };

  const getPrimaryImage = (product) => {
    if (product?.primary_image) return product.primary_image;
    if (product?.images && product.images.length > 0) {
      const primaryImg = product.images.find((img) => img.is_primary);
      return primaryImg || product.images[0];
    }
    return null;
  };

  const getPrimaryImageUrl = (product) => {
    const img = getPrimaryImage(product);
    if (!img) return null;
    if (img?.url) return img.url;
    if (img?.file_name) return `${image_file_url}/${img.file_name}`;
    if (img?.image) return `${image_file_url}/${img.image}`;
    return null;
  };

  const getStockValue = (product) =>
    product?.stock?.quantity ?? product?.current_stock ?? product?.quantity ?? product?.stock ?? "-";

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Stock Out Products
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Products with zero or low inventory
          </Typography>
        </Box>
        <Tooltip title="Refresh list">
          <IconButton onClick={handleRefresh} disabled={loading}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
        <TextField
          size="small"
          placeholder="Search by name, SKU, or slug..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: "action.active" }} />,
          }}
          sx={{ flex: 1, minWidth: 220 }}
        />
      </Box>

      <Card sx={{ background: colors.primary[400] }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredProducts.length === 0 ? (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography color="text.secondary">
                {searchTerm ? "No stock out products found." : "No stock out products available."}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table sx={{ borderCollapse: "collapse" }}>
                <TableHead sx={{ backgroundColor: colors.primary[300] }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, borderBottom: `1px solid ${colors.primary[200]}` }}>
                      ID
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, borderBottom: `1px solid ${colors.primary[200]}` }}>
                      Image
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, borderBottom: `1px solid ${colors.primary[200]}` }}>
                      Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, borderBottom: `1px solid ${colors.primary[200]}` }}>
                      SKU
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, borderBottom: `1px solid ${colors.primary[200]}` }}>
                      Category
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, borderBottom: `1px solid ${colors.primary[200]}` }}>
                      Stock
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, borderBottom: `1px solid ${colors.primary[200]}` }}>
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProducts.map((product, idx) => {
                    const primaryImageUrl = getPrimaryImageUrl(product);
                    const isEven = idx % 2 === 0;

                    return (
                      <TableRow
                        key={product.id}
                        sx={{
                          backgroundColor: isEven ? colors.primary[300] : "transparent",
                          borderBottom: `1px solid ${colors.primary[200]}`,
                          transition: "background-color 0.2s",
                          "&:hover": {
                            backgroundColor: isEven ? colors.primary[250] : colors.primary[400],
                          },
                        }}
                      >
                        <TableCell sx={{ borderBottom: `1px solid ${colors.primary[200]}` }}>
                          {product.id}
                        </TableCell>
                        <TableCell sx={{ borderBottom: `1px solid ${colors.primary[200]}` }}>
                          {primaryImageUrl ? (
                            <Box
                              component="img"
                              src={primaryImageUrl}
                              alt={product.name}
                              sx={{
                                width: 50,
                                height: 50,
                                objectFit: "cover",
                                borderRadius: 0.5,
                                bgcolor: colors.primary[300],
                              }}
                            />
                          ) : (
                            <Box
                              sx={{
                                width: 50,
                                height: 50,
                                borderRadius: 0.5,
                                bgcolor: colors.primary[300],
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 12,
                                color: "text.secondary",
                              }}
                            >
                              No Image
                            </Box>
                          )}
                        </TableCell>
                        <TableCell sx={{ borderBottom: `1px solid ${colors.primary[200]}` }}>
                          <Typography variant="body2" fontWeight={600} noWrap title={product.name}>
                            {product.name}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: `1px solid ${colors.primary[200]}` }}>
                          <Typography variant="body2">{product.sku || "-"}</Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: `1px solid ${colors.primary[200]}` }}>
                          <Typography variant="body2">
                            {product.category?.name || product.category_id || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: `1px solid ${colors.primary[200]}` }}>
                          <Typography variant="body2" fontWeight={700} color="error">
                            {getStockValue(product)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: `1px solid ${colors.primary[200]}` }}>
                          <Chip label="Stock Out" color="error" size="small" />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {!loading && filteredProducts.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[10, 20, 50, 100]}
              component="div"
              count={totalProducts}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                borderTop: `1px solid ${colors.primary[200]}`,
                "& .MuiTablePagination-toolbar": {
                  backgroundColor: colors.primary[300],
                },
              }}
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default StockOutProduct;
