import React, { useEffect, useState, useMemo } from "react";
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
  Button,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Visibility, Edit, Delete, Refresh, Search } from "@mui/icons-material";
import { tokens } from "../../../theme";
import { image_file_url } from "../../../api/config/index.jsx";
import { getAllProducts } from "../../../api/controller/product_controller";

const AllProducts = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch products from API
  const fetchProducts = async (pageZeroBased = 0, perPage = 10) => {
    try {
      setLoading(true);
      const params = {
        page: pageZeroBased + 1, // Convert 0-based to 1-based for API
        per_page: perPage,
      };

      const response = await getAllProducts(params);
      if (response.status === "success" && response.data) {
        setProducts(response.data.data || []);
        setTotalProducts(response.data.total || 0);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(page, rowsPerPage);
  }, [page, rowsPerPage]);

  // Client-side search (filtered on current page only)
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;

    const term = searchTerm.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term) ||
        product.slug.toLowerCase().includes(term)
    );
  }, [searchTerm, products]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRefresh = () => {
    fetchProducts(page, rowsPerPage);
  };

  const handleResetSearch = () => {
    setSearchTerm("");
  };

  const handleViewDetails = (productId) => {
    console.log("View product details:", productId);
    // TODO: Navigate to product detail page or open modal
  };

  const handleEdit = (productId) => {
    console.log("Edit product:", productId);
    // TODO: Navigate to edit product page
  };

  const handleDelete = (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      console.log("Delete product:", productId);
      // TODO: Call deleteProduct API
    }
  };

  const getPrimaryImage = (product) => {
    if (product.images && product.images.length > 0) {
      const primaryImg = product.images.find((img) => img.is_primary);
      return primaryImg || product.images[0];
    }
    return null;
  };

  const renderStatusChip = (isActive) => {
    if (isActive === null || isActive === undefined) {
      return <Chip label="N/A" variant="outlined" size="small" />;
    }
    return isActive ? (
      <Chip label="Active" color="success" size="small" />
    ) : (
      <Chip label="Inactive" color="warning" size="small" />
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Products
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage your product catalog
          </Typography>
        </Box>
        <Tooltip title="Refresh products">
          <IconButton onClick={handleRefresh} disabled={loading}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
        <TextField
          size="small"
          placeholder="Search by name, SKU, or slug..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: "action.active" }} />,
          }}
          sx={{ flex: 1, maxWidth: 400 }}
        />
        {searchTerm && (
          <Button variant="outlined" size="small" onClick={handleResetSearch}>
            Reset
          </Button>
        )}
      </Box>

      {/* Table Card */}
      <Card sx={{ background: colors.primary[400] }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredProducts.length === 0 ? (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography color="text.secondary">
                {searchTerm ? "No products found matching your search." : "No products available."}
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
                      Category ID
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, borderBottom: `1px solid ${colors.primary[200]}` }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, borderBottom: `1px solid ${colors.primary[200]}`, textAlign: "center" }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProducts.map((product, idx) => {
                    const primaryImage = getPrimaryImage(product);
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
                          {primaryImage && primaryImage.image ? (
                            <Box
                              component="img"
                              src={`${image_file_url}/${primaryImage.image}`}
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
                          <Typography variant="body2">{product.sku}</Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: `1px solid ${colors.primary[200]}` }}>
                          <Typography variant="body2">{product.category_id}</Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: `1px solid ${colors.primary[200]}` }}>
                          {renderStatusChip(product.is_active)}
                        </TableCell>
                        <TableCell
                          sx={{
                            borderBottom: `1px solid ${colors.primary[200]}`,
                            textAlign: "center",
                            display: "flex",
                            gap: 0.5,
                            justifyContent: "center",
                          }}
                        >
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetails(product.id)}
                              sx={{ color: colors.blueAccent[500] }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(product.id)}
                              sx={{ color: colors.blueAccent[400] }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(product.id)}
                             
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Pagination */}
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

export default AllProducts;
