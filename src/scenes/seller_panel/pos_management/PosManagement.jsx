import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  MenuItem,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
  Autocomplete,
  Button,
  Pagination,
} from "@mui/material";
import {
  Add,
  Remove,
  Refresh,
  Search,
  ShoppingCartOutlined,
  Close,
} from "@mui/icons-material";
import { tokens } from "../../../theme";
import { image_file_url } from "../../../api/config/index.jsx";
import { getProduct } from "../../../api/controller/admin_controller/product/product_controller.jsx";
import { getCategory } from "../../../api/controller/admin_controller/product/setting_controller.jsx";
import { getBrand } from "../../../api/controller/admin_controller/brand/brand_controller.jsx";
import { getAllCustomers, registerEmployee } from "../../../api/controller/admin_controller/user_controller.jsx";
import { addCart, deleteItem, getCartByUser, updateQuantity } from "../../../api/controller/admin_controller/order/cart_controller.jsx";
import { checkOutOrder, getOrderDetails } from "../../../api/controller/admin_controller/order/order_controller.jsx";

const moneyBDT = (n) => new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(Number(n || 0));

const buildImageUrl = (fileOrUrl) => {
  if (!fileOrUrl) return "/assets/images/placeholder.png";
  const raw = String(fileOrUrl).replaceAll("\\/", "/");
  if (/^https?:\/\//i.test(raw)) return raw;
  const base = String(image_file_url || "").replace(/\/+$/, "");
  const path = raw.replace(/^\/+/, "");
  return `${base}/${path}`;
};

const normalizeList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data?.data?.data)) return payload.data.data.data;
  return [];
};

const ProductCard = ({ product, onAdd }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const img = product?.primary_image?.file_name || product?.primary_image?.url || product?.thumbnail || product?.image;
  const stock = Number(product?.current_stock ?? product?.stock_qty ?? 0);
  const inStock = stock > 0;

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        background: colors.primary[400],
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box
        sx={{
          position: "relative",
          height: 160,
          backgroundImage: `url("${buildImageUrl(img)}")`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundColor: colors.primary[500],
        }}
      >
        <Chip
          size="small"
          label={`${inStock ? "In stock" : "Out of Stock"}: ${stock}`}
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            fontWeight: 900,
            background: inStock ? "#24c56b" : "#ef476f",
            color: "#fff",
          }}
        />
      </Box>
      <CardContent sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 0.6, flex: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800 }} noWrap>
          {product?.name || "Unnamed product"}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 800, color: colors.gray[200] }}>
          {moneyBDT(product?.unit_price || product?.price || 0)}
        </Typography>
        <Button
          size="small"
          variant="contained"
          startIcon={<ShoppingCartOutlined />}
          onClick={() => onAdd?.(product)}
          disabled={!inStock}
          sx={{
            mt: "auto",
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 800,
            background: theme.palette.secondary.main,
            color: colors.gray[900],
            boxShadow: "none",
            "&:hover": { opacity: 0.92, boxShadow: "none" },
          }}
        >
          Add
        </Button>
      </CardContent>
    </Card>
  );
};

export default function PosManagementSeller() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [brandId, setBrandId] = useState("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [totalProducts, setTotalProducts] = useState(0);
  const [lastPage, setLastPage] = useState(1);

  const [tab, setTab] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [serverCart, setServerCart] = useState(null);
  const [localCart, setLocalCart] = useState([]);
  const [msg, setMsg] = useState("");
  const [placing, setPlacing] = useState(false);

  const [walkIn, setWalkIn] = useState({ name: "", phone: "", email: "", address: "", note: "" });
  const [shipping, setShipping] = useState({ address: "", zone: "" });

  const loadMeta = async () => {
    setLoading(true);
    try {
      const [catRes, brandRes, customerRes] = await Promise.all([
        getCategory(),
        getBrand(),
        getAllCustomers({ page: 1, per_page: 200 }),
      ]);

      setCategories(normalizeList(catRes?.data?.data ?? catRes));
      setBrands(normalizeList(brandRes?.data?.data ?? brandRes));

      const cPayload = customerRes?.data ?? customerRes;
      if (cPayload?.status === "success" && Array.isArray(cPayload?.data?.data)) {
        setCustomers(cPayload.data?.data);
      } else {
        setCustomers(normalizeList(cPayload));
      }
    } catch (e) {
      console.error("POS load error:", e);
      setMsg("Failed to load POS data");
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async (opts = {}) => {
    const nextSearch = typeof opts.search === "string" ? opts.search : search;
    const nextCategory = opts.categoryId ?? categoryId;
    const nextBrand = opts.brandId ?? brandId;
    const nextPage = opts.page ?? page;
    const nextPerPage = opts.perPage ?? perPage;

    setLoadingProducts(true);
    try {
      const params = {
        page: nextPage,
        per_page: nextPerPage,
        category_id: nextCategory !== "all" ? nextCategory : undefined,
        brand_id: nextBrand !== "all" ? nextBrand : undefined,
        shop_id: opts.shopId ?? undefined,
        user_id: localStorage.getItem("userId") ?? undefined,
        search: nextSearch ? nextSearch.trim() : undefined,
      };

      const res = await getProduct(params);
      const payload = res?.data ?? res;
      const list = normalizeList(payload);
      const paginator = payload?.data && !Array.isArray(payload?.data) ? payload.data : payload;
      const total = Number(paginator?.total ?? list.length);
      const per = Number(paginator?.per_page ?? nextPerPage);
      const last = Number(paginator?.last_page ?? Math.max(1, Math.ceil(total / Math.max(1, per))));
      const current = Number(paginator?.current_page ?? nextPage);

      setProducts(list);
      setTotalProducts(total);
      setPerPage(per);
      setLastPage(last);
      setPage(current);
    } catch (e) {
      console.error("POS products error:", e);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadMeta();
    loadProducts({ search, categoryId, brandId, page: 1, perPage });
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => {
      setPage(1);
      loadProducts({ search, categoryId, brandId, page: 1, perPage });
    }, 300);
    return () => clearTimeout(handle);
  }, [search, categoryId, brandId]);

  const handlePageChange = (_event, value) => {
    setPage(value);
    loadProducts({ search, categoryId, brandId, page: value, perPage });
  };

  const loadServerCart = async (customerId) => {
    if (!customerId) {
      setServerCart(null);
      return;
    }
    try {
      const res = await getCartByUser(customerId);
      if (res?.status === "success") setServerCart(res.data);
      else setServerCart(res?.data ?? null);
    } catch (e) {
      console.error("POS cart error:", e);
      setServerCart(null);
    }
  };

  useEffect(() => {
    if (tab === 0 && selectedCustomer?.id) {
      loadServerCart(selectedCustomer.id);
    }
  }, [selectedCustomer, tab]);

  const handleAddProduct = async (product) => {
    if (tab === 0) {
      if (!selectedCustomer?.id) {
        setMsg("Select a customer first");
        return;
      }
      const res = await addCart({ user_id: selectedCustomer.id, product_id: product.id, qty: 1 });
      if (res?.status === "success") {
        loadServerCart(selectedCustomer.id);
      } else {
        setMsg(res?.message || "Failed to add item");
      }
      return;
    }

    setLocalCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) => (i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const updateLocalQty = (productId, nextQty) => {
    if (nextQty < 1) return;
    setLocalCart((prev) => prev.map((i) => (i.product.id === productId ? { ...i, qty: nextQty } : i)));
  };

  const removeLocalItem = (productId) => {
    setLocalCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const handleServerQty = async (item, nextQty) => {
    if (nextQty < 1) return;
    const res = await updateQuantity(item.id, nextQty);
    if (res?.status === "success") {
      loadServerCart(selectedCustomer?.id);
    } else {
      setMsg(res?.message || "Failed to update quantity");
    }
  };

  const handleServerRemove = async (item) => {
    const res = await deleteItem(item.id);
    if (res?.status === "success") {
      loadServerCart(selectedCustomer?.id);
    } else {
      setMsg(res?.message || "Failed to remove item");
    }
  };

  const localSubtotal = useMemo(() => {
    return localCart.reduce((sum, i) => sum + Number(i.product?.unit_price || i.product?.price || 0) * i.qty, 0);
  }, [localCart]);

  const serverSubtotal = Number(serverCart?.subtotal || 0);
  const total = tab === 0 ? serverSubtotal : localSubtotal;

  const handleCreateWalkInCustomer = async () => {
    if (!walkIn.name || !walkIn.phone) {
      setMsg("Walk-in name and phone are required");
      return null;
    }

    const password = `POS-${Math.random().toString(36).slice(2, 10)}!`;
    const email = walkIn.email || `${walkIn.phone}@walkin.local`;

    const form = new FormData();
    form.append("name", walkIn.name);
    form.append("email", email);
    form.append("password", password);
    form.append("user_type", "customer");
    form.append("phone", walkIn.phone);

    const res = await registerEmployee(form);
    const ok = res?.status === 200 || res?.status === "success" || res?.success === true;
    if (!ok) {
      setMsg(res?.message || "Failed to create walk-in customer");
      return null;
    }

    const refetch = await getAllCustomers({ page: 1, per_page: 200 });
    const payload = refetch?.data ?? refetch;
    const list = payload?.data?.data || normalizeList(payload);
    const found = list.find((c) => String(c?.mobile || c?.phone || "") === String(walkIn.phone) || String(c?.email || "") === email);
    if (found) {
      setSelectedCustomer(found);
      return found.id;
    }

    setMsg("Walk-in customer created, but could not locate ID");
    return null;
  };

  const handleCheckout = async () => {
    if (placing) return;
    setPlacing(true);

    try {
      if (tab === 0 && (!serverCart || !Array.isArray(serverCart.items) || serverCart.items.length === 0)) {
        setMsg("Cart is empty");
        setPlacing(false);
        return;
      }
      if (tab === 1 && localCart.length === 0) {
        setMsg("Cart is empty");
        setPlacing(false);
        return;
      }

      let customerId = selectedCustomer?.id || null;
      let customerName = selectedCustomer?.name || walkIn.name;
      let customerPhone = selectedCustomer?.mobile || selectedCustomer?.phone || walkIn.phone;

      if (tab === 1) {
        customerId = await handleCreateWalkInCustomer();
        if (!customerId) {
          setPlacing(false);
          return;
        }

        for (const item of localCart) {
          await addCart({ user_id: customerId, product_id: item.product.id, qty: item.qty });
        }
        await loadServerCart(customerId);
      }

      if (!customerId) {
        setMsg("Select a customer to place order");
        setPlacing(false);
        return;
      }

      const form = new FormData();
      form.append("user_id", customerId);
      form.append("customer_name", customerName || "Walk-in");
      form.append("customer_phone", customerPhone || "");
      form.append("shipping_address", shipping.address || walkIn.address || "POS Counter");
      form.append("zone", shipping.zone || "");
      form.append("note", walkIn.note || "POS order");

      const res = await checkOutOrder(form);
      const ok = res?.data?.status === "success" || res?.status === 200;

      if (ok) {
        const orderId =
          res?.data?.data?.order_id ??
          res?.data?.data?.id ??
          res?.data?.order?.id ??
          res?.data?.data?.order?.id ??
          res?.data?.order_id ??
          res?.data?.id ??
          res?.order_id ??
          res?.id ??
          null;

        setMsg(res?.data?.message || "Order placed");
        setLocalCart([]);
        setServerCart(null);

        if (orderId) {
          try {
            await getOrderDetails(orderId);
          } catch (e) {
            console.error("POS order details error:", e);
          }
          navigate(`/seller/orders/${orderId}`);
        }
      } else {
        setMsg(res?.data?.message || "Failed to place order");
      }
    } catch (e) {
      console.error("POS checkout error:", e);
      setMsg("Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        "& .MuiButton-root": { color: "#000" },
        "& .MuiButton-contained": { color: "#000" },
        "& .MuiButton-outlined": { color: "#000" },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            POS Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sell products quickly for customers or walk-ins
          </Typography>
        </Box>
        <IconButton
          onClick={() => {
            loadMeta();
            loadProducts({ search, categoryId, brandId, page, perPage });
          }}
          disabled={loading || loadingProducts}
        >
          <Refresh />
        </IconButton>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "2.2fr 1fr" }, gap: 2 }}>
        {/* Left panel: Products */}
        <Card sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
          <CardContent sx={{ p: 2 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "2fr 1fr 1fr" },
                gap: 1.5,
                alignItems: "center",
                mb: 2,
              }}
            >
              <TextField
                size="small"
                placeholder="Search by Product Name/Barcode"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{ startAdornment: <Search sx={{ mr: 1 }} /> }}
              />
              <TextField
                size="small"
                select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <MenuItem value="all">All categories</MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c.id} value={String(c.id)}>
                    {c.name || c.title || "Category"}
                  </MenuItem>
                ))}
              </TextField>
              <TextField size="small" select value={brandId} onChange={(e) => setBrandId(e.target.value)}>
                <MenuItem value="all">All Brands</MenuItem>
                {brands.map((b) => (
                  <MenuItem key={b.id} value={String(b.id)}>
                    {b.name || b.title || "Brand"}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {loadingProducts ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: {
                    xs: "repeat(2, minmax(0, 1fr))",
                    sm: "repeat(3, minmax(0, 1fr))",
                    md: "repeat(4, minmax(0, 1fr))",
                    lg: "repeat(5, minmax(0, 1fr))",
                  },
                }}
              >
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} onAdd={handleAddProduct} />
                ))}
              </Box>
            )}

            {lastPage > 1 ? (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Pagination
                  count={lastPage}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  shape="rounded"
                />
              </Box>
            ) : null}
          </CardContent>
        </Card>

        {/* Right panel: Customer + Cart */}
        <Card sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
          <CardContent sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <Tabs
              value={tab}
              onChange={(_e, v) => setTab(v)}
              sx={{
                "& .MuiTab-root": { color: "#000" },
                "& .Mui-selected": { color: "#000" },
                "& .MuiTabs-indicator": { backgroundColor: "#000" },
              }}
            >
              <Tab label="Customer" />
              <Tab label="Walk In" />
            </Tabs>

            {tab === 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Autocomplete
                  options={customers}
                  value={selectedCustomer}
                  onChange={(_e, v) => setSelectedCustomer(v)}
                  getOptionLabel={(o) => `${o?.name || "Customer"} (${o?.mobile || o?.phone || ""})`}
                  renderInput={(params) => <TextField {...params} size="small" label="Select customer" />}
                />
                {selectedCustomer ? (
                  <Typography variant="caption" color="text.secondary">
                    {selectedCustomer?.email || "No email"}
                  </Typography>
                ) : null}
              </Box>
            ) : (
              <Box sx={{ display: "grid", gap: 1.2 }}>
                <TextField
                  size="small"
                  label="Walk in customer"
                  value={walkIn.name}
                  onChange={(e) => setWalkIn((prev) => ({ ...prev, name: e.target.value }))}
                />
                <TextField
                  size="small"
                  label="Phone"
                  value={walkIn.phone}
                  onChange={(e) => setWalkIn((prev) => ({ ...prev, phone: e.target.value }))}
                />
                <TextField
                  size="small"
                  label="Email (optional)"
                  value={walkIn.email}
                  onChange={(e) => setWalkIn((prev) => ({ ...prev, email: e.target.value }))}
                />
                <TextField
                  size="small"
                  label="Address"
                  value={walkIn.address}
                  onChange={(e) => setWalkIn((prev) => ({ ...prev, address: e.target.value }))}
                />
                <TextField
                  size="small"
                  label="Note"
                  value={walkIn.note}
                  onChange={(e) => setWalkIn((prev) => ({ ...prev, note: e.target.value }))}
                />
              </Box>
            )}

            <Divider />

            <Box sx={{ display: "grid", gap: 1.2 }}>
              <TextField
                size="small"
                label="Shipping address"
                value={shipping.address}
                onChange={(e) => setShipping((prev) => ({ ...prev, address: e.target.value }))}
              />
              <TextField
                size="small"
                label="Zone"
                value={shipping.zone}
                onChange={(e) => setShipping((prev) => ({ ...prev, zone: e.target.value }))}
              />
            </Box>

            <Divider />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                Cart
              </Typography>

              {tab === 0 ? (
                !serverCart?.items?.length ? (
                  <Box sx={{ py: 6, textAlign: "center", color: colors.gray[300] }}>
                    No Product Added
                  </Box>
                ) : (
                  <Stack spacing={1}>
                    {serverCart.items.map((item) => (
                      <Box key={item.id} sx={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 1, alignItems: "center" }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 800 }} noWrap>
                            {item.product?.name || "Product"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {moneyBDT(item.unit_price)} x {item.qty}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <IconButton size="small" onClick={() => handleServerQty(item, item.qty - 1)}>
                            <Remove fontSize="small" />
                          </IconButton>
                          <Typography variant="body2" sx={{ fontWeight: 800 }}>
                            {item.qty}
                          </Typography>
                          <IconButton size="small" onClick={() => handleServerQty(item, item.qty + 1)}>
                            <Add fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleServerRemove(item)}>
                            <Close fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                )
              ) : !localCart.length ? (
                <Box sx={{ py: 6, textAlign: "center", color: colors.gray[300] }}>
                  No Product Added
                </Box>
              ) : (
                <Stack spacing={1}>
                  {localCart.map((item) => (
                    <Box key={item.product.id} sx={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 1, alignItems: "center" }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 800 }} noWrap>
                          {item.product?.name || "Product"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {moneyBDT(item.product?.unit_price || item.product?.price || 0)} x {item.qty}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <IconButton size="small" onClick={() => updateLocalQty(item.product.id, item.qty - 1)}>
                          <Remove fontSize="small" />
                        </IconButton>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                          {item.qty}
                        </Typography>
                        <IconButton size="small" onClick={() => updateLocalQty(item.product.id, item.qty + 1)}>
                          <Add fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => removeLocalItem(item.product.id)}>
                          <Close fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

            <Divider />

            <Box sx={{ display: "grid", gap: 0.6 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Sub Total</Typography>
                <Typography variant="body2" color="text.secondary">{moneyBDT(total)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Tax</Typography>
                <Typography variant="body2" color="text.secondary">{moneyBDT(0)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Shipping</Typography>
                <Typography variant="body2" color="text.secondary">{moneyBDT(0)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Discount</Typography>
                <Typography variant="body2" color="text.secondary">{moneyBDT(0)}</Typography>
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>Total</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>{moneyBDT(total)}</Typography>
              </Stack>
            </Box>

            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button variant="outlined" size="small" disabled={placing}>
                Shipping
              </Button>
              <Button variant="outlined" size="small" disabled={placing}>
                Discount
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={handleCheckout}
                disabled={placing}
              >
                {placing ? <CircularProgress size={16} color="inherit" /> : "Place Order"}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Snackbar open={!!msg} autoHideDuration={3000} onClose={() => setMsg("")} message={msg} />
    </Box>
  );
}
