import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  Button,
  CircularProgress,
  Alert,
  Stack,
  stepConnectorClasses,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import TuneIcon from "@mui/icons-material/Tune";
import CollectionsOutlinedIcon from "@mui/icons-material/CollectionsOutlined";
import { createProduct, uploadProductImages, addProductAttribute, addProdductDiscount } from "../../../../api/controller/admin_controller/product/product_controller";
import { getAllShops } from "../../../../api/controller/admin_controller/shop/shop_controller.jsx";
import { getCategory, getBrand } from "../../../../api/controller/admin_controller/product/setting_controller";
import { getCategoryChildren } from "../../../../api/controller/admin_controller/product/product_setting_controller.jsx";

import { PRODUCT_WIZARD_STEPS } from "../../../admin_panel/product/add_product/components/productWizard/steps";
import StepGeneral from "../../../admin_panel/product/add_product/components/productWizard/StepGeneral";
import StepAttributes from "../../../admin_panel/product/add_product/components/productWizard/StepAttributes";
import StepImages from "../../../admin_panel/product/add_product/components/productWizard/StepImages";

/* ── Custom stepper connector ── */
const IndConnector = styled(StepConnector)(() => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: { top: 20 },
  [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line}`]: { background: "#6366f1" },
  [`&.${stepConnectorClasses.completed} .${stepConnectorClasses.line}`]: { background: "#6366f1" },
  [`& .${stepConnectorClasses.line}`]: { height: 3, border: 0, borderRadius: 2, background: "#e0e0e0" },
}));

const stepIcons = { 1: <InfoOutlinedIcon />, 2: <TuneIcon />, 3: <CollectionsOutlinedIcon /> };

function StepIconComponent({ active, completed, icon }) {
  return (
    <Box
      sx={{
        width: 42,
        height: 42,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        transition: "all 250ms",
        bgcolor: completed ? "#6366f1" : active ? "#6366f1" : "#f1f5f9",
        color: completed || active ? "#fff" : "#94a3b8",
        boxShadow: active ? "0 4px 14px rgba(99,102,241,0.35)" : "none",
      }}
    >
      {completed ? <CheckCircleOutlineIcon sx={{ fontSize: 22 }} /> : stepIcons[icon]}
    </Box>
  );
}

const normalizeList = (x) => {
  if (!x) return [];
  if (Array.isArray(x)) return x;

  if (Array.isArray(x?.data)) return x.data;
  if (Array.isArray(x?.data?.data)) return x.data.data;
  if (Array.isArray(x?.data?.data?.data)) return x.data.data.data;

  if (Array.isArray(x?.data?.items)) return x.data.items;
  if (Array.isArray(x?.data?.rows)) return x.data.rows;
  if (Array.isArray(x?.results)) return x.results;
  if (Array.isArray(x?.data?.results)) return x.data.results;

  const inner = x?.data ?? x;
  if (inner && typeof inner === "object") {
    for (const k of Object.keys(inner)) {
      if (Array.isArray(inner[k])) return inner[k];
    }
  }

  return [];
};

function AddProductTab() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Wizard state
  const [general, setGeneral] = useState({
  name: "",
  slug: "",
  category_id: "",
  brand_id: "",
  user_id: localStorage.getItem("userId") || "",
  added_by: 1,

  description: "",

  unit_price: "",
  purchase_price: "",
  current_stock: "",

  variant_product: 0,
  todays_deal: 0,
  published: 0,
  approved: 1,
  featured: 0,
  refundable: 0,
  cash_on_delivery: 1,
  stock_visibility_state: 1,

  unit: "",
  weight: "",
});

  const [attributes, setAttributes] = useState([]);
  const [images, setImages] = useState([]);

  // Data for dropdowns - loaded from API
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [shops, setShops] = useState([]);
  const [parentCategoryId, setParentCategoryId] = useState("");
  const [subCategories, setSubCategories] = useState([]);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);

  const loadDropdowns = async () => {
    try {
      const [cRes, bRes, vRes] = await Promise.all([
        getCategory(),
        getBrand(),
        getAllShops({ page: 1, per_page: 100 }),
      ]);

      const cats = normalizeList(cRes);
      const brs = normalizeList(bRes);
      const vens = normalizeList(vRes);

      console.debug("Dropdown raw responses:", { cRes, bRes, vRes });
      console.debug("Dropdown normalized:", { cats, brs, vens });

      setCategories(cats);
      setBrands(brs);
      setShops(vens);
    } catch (e) {
      console.error("Error loading dropdowns:", e);
    }
  };

  useEffect(() => {
    loadDropdowns();
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setGeneral((prev) => ({ ...prev, user_id: storedUserId }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadSubCategories = async () => {
      if (!parentCategoryId) {
        setSubCategories([]);
        setGeneral((prev) => ({ ...prev, category_id: "" }));
        return;
      }

      setLoadingSubCategories(true);
      try {
        const res = await getCategoryChildren(parentCategoryId);
        const list = normalizeList(res);
        setSubCategories(list);
        setGeneral((prev) => {
          if (list.length === 0) return { ...prev, category_id: parentCategoryId };
          const exists = list.some((c) => String(c?.id ?? c?._id) === String(prev.category_id));
          return exists ? prev : { ...prev, category_id: "" };
        });
      } catch (e) {
        console.error("Error loading sub categories:", e);
        setSubCategories([]);
      } finally {
        setLoadingSubCategories(false);
      }
    };

    loadSubCategories();
  }, [parentCategoryId]);

  const canGoBack = step > 0;
  const canGoNext = step < PRODUCT_WIZARD_STEPS.length - 1;

  const validateStep = (s) => {
    const nextErrors = {};

    if (s === 0) {
      if (!general.name || !general.name.trim()) nextErrors.name = "Product name is required";
      if (!general.slug || !general.slug.trim()) nextErrors.slug = "Slug is required";
      if (!general.category_id) nextErrors.category_id = "Category is required";
      if (parentCategoryId && subCategories.length > 0 && !general.category_id) {
        nextErrors.category_id = "Sub category is required";
      }
      if (!general.user_id && !localStorage.getItem("userId")) nextErrors.user_id = "User ID is required";
    }

    if (s === 2) {
      if (images.length === 0) {
        nextErrors.images = "At least one image is required";
      } else {
        const primaryCount = images.filter((i) => i.is_primary).length;
        if (primaryCount !== 1) nextErrors.images = "Exactly one image must be primary";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleFinish = async () => {
    if (!validateStep(step)) return;

    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      // Step 1: Create product
      const productFormData = new FormData();
productFormData.append("name", general.name);
productFormData.append("slug", general.slug);
productFormData.append("category_id", general.category_id);
if (general.brand_id) productFormData.append("brand_id", general.brand_id);

productFormData.append("added_by", localStorage.getItem("userId") );
productFormData.append("user_id", general.user_id || localStorage.getItem("userId") );

productFormData.append("description", general.description || "");

productFormData.append("unit_price", general.unit_price);
productFormData.append("purchase_price", general.purchase_price);
productFormData.append("current_stock", general.current_stock);

productFormData.append("variant_product", general.variant_product ? 1 : 0);
productFormData.append("todays_deal", general.todays_deal ? 1 : 0);
productFormData.append("published", general.published ? 1 : 0);
productFormData.append("approved", general.approved ? 1 : 0);
productFormData.append("featured", general.featured ? 1 : 0);
productFormData.append("refundable", general.refundable ? 1 : 0);
productFormData.append("cash_on_delivery", general.cash_on_delivery ? 1 : 0);
productFormData.append("stock_visibility_state", general.stock_visibility_state ? 1 : 0);

productFormData.append("unit", general.unit || "");
productFormData.append("weight", general.weight || "");

      // attach media library images as photo ids
      const mediaPhotos = images.filter((i) => i.media_id).map((i) => i.media_id);
      mediaPhotos.forEach((id) => productFormData.append("photos[]", id));

      // set thumbnail_img if primary is a media item
      const primaryMedia = images.find((i) => i.is_primary && i.media_id);
      if (primaryMedia) productFormData.append("thumbnail_img", primaryMedia.media_id);

      // legacy price/stock fields removed; using unit_price/current_stock instead

      const productResponse = await createProduct(productFormData);
      const productId = productResponse.data?.id ?? productResponse?.id ?? productResponse?.data?.id;

      if (!productId) {
        setErrorMessage("Failed to create product: Invalid response");
        setLoading(false);
        return;
      }

      // Step 2: Upload images (only those with a file to upload)
      // Step 2: Upload images (only those with a file to upload)
      const imagesToUpload = images
        .filter((img) => img.file)
        .map((img) => ({ file: img.file, is_primary: img.is_primary }));

      if (imagesToUpload.length > 0) {
        await uploadProductImages(productId, imagesToUpload);
      }

      // Step 3: Attach attributes to product (if any)
      if (attributes && attributes.length > 0) {
        for (const attr of attributes) {
          try {
            const fd = new FormData();
            fd.append("product_id", productId);
            // API expects IDs and stock
            if (attr.attribute_id) fd.append("attribute_id", attr.attribute_id);
            if (attr.attribute_value_id) fd.append("attribute_value_id", attr.attribute_value_id);
            fd.append("stock", attr.stock ?? 0);

            await addProductAttribute(fd);
          } catch (err) {
            console.error("Failed to attach attribute to product:", err);
          }
        }
      }

        // Step 4: Add discount if provided
        try {
          if (general?.discount_value) {
            const dfd = new FormData();
            dfd.append('product_id', productId);
            dfd.append('type', general.discount_type || 'flat');
            dfd.append('value', general.discount_value);
            const discResp = await addProdductDiscount(dfd);
            console.debug('Discount response:', discResp);
          }
        } catch (e) {
          console.error('Failed to add product discount:', e);
        }

      setSuccessMessage("Product created successfully!");
      setTimeout(() => {
        navigate("/ecom/product/all");
      }, 2000);
    } catch (error) {
      console.error("Product creation error:", error);
      setErrorMessage(error.response?.data?.message || error.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const stepView = useMemo(() => {
    if (step === 0) {
      return (
        <StepGeneral
          value={general}
          onChange={(patch) => setGeneral((prev) => ({ ...prev, ...patch }))}
          parentCategoryId={parentCategoryId}
          subCategories={subCategories}
          loadingSubCategories={loadingSubCategories}
          onParentCategoryChange={(id) => {
            setParentCategoryId(id);
            setGeneral((prev) => ({ ...prev, category_id: "" }));
          }}
          onSubCategoryChange={(id) => setGeneral((prev) => ({ ...prev, category_id: id }))}
          onOpenDropdown={loadDropdowns}
          errors={errors}
          categories={categories}
          brands={brands}
          shops={shops}
        />
      );
    }

    if (step === 1) {
      return (
        <StepAttributes
          value={attributes}
          onAdd={(attr) => setAttributes((prev) => [...prev, attr])}
          onRemove={(idx) => setAttributes((prev) => prev.filter((_, i) => i !== idx))}
        />
      );
    }

    return (
      <StepImages
        value={images}
        error={errors.images}
        onChange={setImages}
        onPrimary={(idx) => {
          setImages((prev) =>
            prev.map((x, i) => ({
              ...x,
              is_primary: i === idx,
            }))
          );
        }}
      />
    );
  }, [step, general, attributes, images, errors]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", p: { xs: 2, md: 3 } }}>
      {/* ── Header ── */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: "#eef2ff", display: "grid", placeItems: "center", color: "#6366f1" }}>
            <AddBoxOutlinedIcon />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>Add Product</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600 }}>
              Create a new product — fill in details, attributes, and images.
            </Typography>
          </Box>
        </Stack>
        <Button
          variant="outlined"
          onClick={() => navigate(-1)}
          disabled={loading}
          startIcon={<ArrowBackIcon />}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, borderColor: "divider", color: "text.secondary" }}
        >
          Back
        </Button>
      </Stack>

      {/* ── Alerts ── */}
      {successMessage && <Alert severity="success" onClose={() => setSuccessMessage("")} sx={{ mb: 2, borderRadius: 2 }}>{successMessage}</Alert>}
      {errorMessage && <Alert severity="error" onClose={() => setErrorMessage("")} sx={{ mb: 2, borderRadius: 2 }}>{errorMessage}</Alert>}

      {/* ── Stepper card ── */}
      <Card sx={{ borderRadius: 2.5, border: "1px solid", borderColor: "divider", mb: 3 }}>
        <CardContent sx={{ py: 3 }}>
          <Stepper activeStep={step} alternativeLabel connector={<IndConnector />}>
            {PRODUCT_WIZARD_STEPS.map((s) => (
              <Step key={s.key}>
                <StepLabel StepIconComponent={StepIconComponent}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>{s.label}</Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* ── Step content card ── */}
      <Card sx={{ borderRadius: 2.5, border: "1px solid", borderColor: "divider" }}>
        <CardContent sx={{ p: { xs: 2, md: 3 }, "&:last-child": { pb: 3 } }}>
          {stepView}

          {/* ── Navigation buttons ── */}
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 3, pt: 2.5, borderTop: "1px solid", borderColor: "divider" }}>
            <Button
              variant="outlined"
              disabled={!canGoBack || loading}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              startIcon={<ArrowBackIcon />}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, borderColor: "divider", color: "text.secondary", px: 3, py: 1 }}
            >
              Previous
            </Button>

            {canGoNext ? (
              <Button
                variant="contained"
                disabled={loading}
                endIcon={<ArrowForwardIcon />}
                onClick={() => { if (!validateStep(step)) return; setStep((s) => Math.min(PRODUCT_WIZARD_STEPS.length - 1, s + 1)); }}
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, bgcolor: "#6366f1", px: 3, py: 1, boxShadow: "0 4px 14px rgba(99,102,241,0.25)", "&:hover": { bgcolor: "#4f46e5" } }}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                disabled={loading}
                onClick={handleFinish}
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <CheckCircleOutlineIcon />}
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, bgcolor: "#10b981", px: 3, py: 1, boxShadow: "0 4px 14px rgba(16,185,129,0.25)", "&:hover": { bgcolor: "#059669" } }}
              >
                {loading ? "Creating..." : "Create Product"}
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export default AddProductTab;
