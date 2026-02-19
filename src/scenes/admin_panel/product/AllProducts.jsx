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
  MenuItem ,
} from "@mui/material";
import { Visibility, Edit, Delete, Refresh, Search, Link } from "@mui/icons-material";
import { tokens } from "../../../theme";
import { image_file_url } from "../../../api/config/index.jsx";
import { getProduct } from "../../../api/controller/admin_controller/product/product_controller.jsx";
import { getCategory, getBrand } from "../../../api/controller/admin_controller/product/setting_controller";
import { getAllShops } from "../../../api/controller/admin_controller/shop/shop_controller.jsx";
import { useNavigate } from "react-router-dom";

const AllProducts = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [shops, setShops] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [categoryId, setCategoryId] = useState("all");
  const [brandId, setBrandId] = useState("all");
  const [shopId, setShopId] = useState("all");
  const [userId, setUserId] = useState("all");

  const normalizeList = (x) => {
    if (!x) return [];
    if (Array.isArray(x)) return x;
    if (Array.isArray(x?.data)) return x.data;
    if (Array.isArray(x?.data?.data)) return x.data.data;
    if (Array.isArray(x?.data?.data?.data)) return x.data.data.data;
    return [];
  };

  // Fetch products from API
  const fetchProducts = async (pageZeroBased = 0, perPage = 10) => {
    try {
      setLoading(true);
      const params = {
        page: pageZeroBased + 1, // Convert 0-based to 1-based for API
        per_page: perPage,
        search: searchTerm.trim() || undefined,
        category_id: categoryId !== "all" ? categoryId : undefined,
        brand_id: brandId !== "all" ? brandId : undefined,
        shop_id: shopId !== "all" ? shopId : undefined,
        user_id: userId !== "all" ? userId : undefined,
      };

      const response = await getProduct(params);
      const payload = response?.data ?? response;
      if (payload?.data) {
        setProducts(payload.data || []);
        setTotalProducts(payload.total || 0);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadFilters = async () => {
    try {
      const [cRes, bRes, sRes] = await Promise.all([
        getCategory(),
        getBrand(),
        getAllShops({ page: 1, per_page: 200 }),
      ]);

      const catList = normalizeList(cRes);
      const brandList = normalizeList(bRes);
      const shopList = normalizeList(sRes);

      setCategories(catList);
      setBrands(brandList);
      setShops(shopList);

      const users = shopList
        .map((s) => ({
          id: s?.user_id ?? s?.user?.id ?? s?.owner_id ?? s?.id,
          name: s?.owner?.name || s?.user?.name || s?.name || `User #${s?.user_id ?? s?.id}`,
        }))
        .filter((u) => u.id != null);

      const unique = new Map();
      users.forEach((u) => {
        const key = String(u.id);
        if (!unique.has(key)) unique.set(key, u);
      });
      setUserOptions(Array.from(unique.values()));
    } catch (e) {
      console.error("Error loading filters:", e);
    }
  };

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    fetchProducts(page, rowsPerPage);
  }, [page, rowsPerPage, searchTerm, categoryId, brandId, shopId, userId]);

  useEffect(() => {
    setPage(0);
  }, [searchTerm, categoryId, brandId, shopId, userId]);

  // Client-side search (filtered on current page only)
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;

    const term = searchTerm.toLowerCase();
    return products.filter((product) => {
      const name = product?.name?.toLowerCase?.() || "";
      const sku = product?.sku?.toLowerCase?.() || "";
      const slug = product?.slug?.toLowerCase?.() || "";
      return name.includes(term) || sku.includes(term) || slug.includes(term);
    });
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
navigate(`/ecom/product/edit/${productId}`);
  };

  const handleRelated = (productId) => {
    navigate(`/related-product-add?product_id=${productId}`);
  };

  const handleDelete = (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      console.log("Delete product:", productId);
      // TODO: Call deleteProduct API
    }
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

  const renderStatusChip = (product) => {
    const published = product?.published;
    const approved = product?.approved;

    if (published === undefined && approved === undefined) {
      return <Chip label="N/A" variant="outlined" size="small" />;
    }

    if (published && approved) {
      return <Chip label="Published" color="success" size="small" />;
    }

    if (approved && !published) {
      return <Chip label="Approved" color="info" size="small" />;
    }

    return <Chip label="Draft" color="warning" size="small" />;
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

      {/* Search + Filters */}
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

        <TextField
          size="small"
          select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="all">All categories</MenuItem>
          {categories.map((c) => (
            <MenuItem key={c.id} value={String(c.id)}>
              {c.name || c.title || "Category"}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          size="small"
          select
          value={brandId}
          onChange={(e) => setBrandId(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="all">All brands</MenuItem>
          {brands.map((b) => (
            <MenuItem key={b.id} value={String(b.id)}>
              {b.name || b.title || "Brand"}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          size="small"
          select
          value={shopId}
          onChange={(e) => setShopId(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="all">All shops</MenuItem>
          {shops.map((s) => (
            <MenuItem key={s.id} value={String(s.id)}>
              {s.name || `Shop #${s.id}`}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          size="small"
          select
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="all">All users</MenuItem>
          {userOptions.map((u) => (
            <MenuItem key={u.id} value={String(u.id)}>
              {u.name}
            </MenuItem>
          ))}
        </TextField>

        {(searchTerm || categoryId !== "all" || brandId !== "all" || shopId !== "all" || userId !== "all") && (
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              setSearchTerm("");
              setCategoryId("all");
              setBrandId("all");
              setShopId("all");
              setUserId("all");
            }}
          >
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
                      Category
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
                          <Typography variant="body2">{product.category?.name || product.category_id || "-"}</Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: `1px solid ${colors.primary[200]}` }}>
                          {renderStatusChip(product)}
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
                          <Tooltip title="Related">
                            <IconButton
                              size="small"
                              onClick={() => handleRelated(product.id)}
                              sx={{ color: colors.blueAccent[300] }}
                            >
                              <Link fontSize="small" />
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
