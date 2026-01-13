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
  Button,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import { tokens } from "../../../../theme";
import { createProduct, uploadProductImages } from "../../../../api/controller/product_controller";
import { getAllVendors } from "../../../../api/controller/user_controller";
import { getCategory, getBrand } from "../../../../api/controller/admin_controller/product/setting_controller"; 

import { PRODUCT_WIZARD_STEPS } from "../../../admin_panel/product/add_product/components/productWizard/steps";
import StepGeneral from "../../../admin_panel/product/add_product/components/productWizard/StepGeneral";
import StepAttributes from "../../../admin_panel/product/add_product/components/productWizard/StepAttributes";
import StepImages from "../../../admin_panel/product/add_product/components/productWizard/StepImages";

function AddProductTab() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Wizard state
  const [general, setGeneral] = useState({
    shop_id: "",
    category_id: "",
    brand_id: "",
    name: "",
    slug: "",
    sku: "",
    short_description: "",
    description: "",
    is_active: true,
  });

  const [attributes, setAttributes] = useState([]);
  const [images, setImages] = useState([]);

  // Data for dropdowns - loaded from API
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [shops, setShops] = useState([]);

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [cRes, bRes, vRes] = await Promise.all([
          getCategory(),
          getBrand(),
          getAllVendors({ page: 1, per_page: 100 }),
        ]);

        const cats = Array.isArray(cRes) ? cRes : cRes?.data || [];
        const brs = Array.isArray(bRes) ? bRes : bRes?.data || bRes?.data || [];
        const vens = Array.isArray(vRes) ? vRes : vRes?.data || vRes?.data || [];

        setCategories(cats);
        setBrands(brs);
        setShops(vens);
      } catch (e) {
        console.error("Error loading dropdowns:", e);
      }
    };

    loadDropdowns();
  }, []);

  const canGoBack = step > 0;
  const canGoNext = step < PRODUCT_WIZARD_STEPS.length - 1;

  const validateStep = (s) => {
    const nextErrors = {};

    if (s === 0) {
      if (!general.name.trim()) nextErrors.name = "Product name is required";
      if (!general.sku.trim()) nextErrors.sku = "SKU is required";
      if (!general.shop_id) nextErrors.shop_id = "Shop is required";
      if (!general.category_id) nextErrors.category_id = "Category is required";
      if (!general.slug.trim()) nextErrors.slug = "Slug is required";
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
      productFormData.append("shop_id", general.shop_id);
      productFormData.append("category_id", general.category_id);
      if (general.brand_id) productFormData.append("brand_id", general.brand_id);
      productFormData.append("name", general.name);
      productFormData.append("slug", general.slug);
      productFormData.append("sku", general.sku);
      productFormData.append("short_description", general.short_description);
      productFormData.append("description", general.description);
      productFormData.append("is_active", general.is_active ? 1 : 0);

      const productResponse = await createProduct(productFormData);
      const productId = productResponse.data?.id;

      if (!productId) {
        setErrorMessage("Failed to create product: Invalid response");
        setLoading(false);
        return;
      }

      // Step 2: Upload images
      if (images.length > 0) {
        const imagesToUpload = images.map((img) => ({
          file: img.file,
          is_primary: img.is_primary,
        }));

        await uploadProductImages(productId, imagesToUpload);
      }

      setSuccessMessage("Product created successfully!");
      setTimeout(() => {
        navigate("/admin/products");
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
        onAdd={(img) => setImages((prev) => [...prev, img])}
        onRemove={(idx) => {
          setImages((prev) => {
            const next = prev.filter((_, i) => i !== idx);
            if (next.length > 0 && !next.some((x) => x.is_primary)) {
              next[0] = { ...next[0], is_primary: true };
            }
            return next;
          });
        }}
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
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "start", gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Add Product
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Create a new product with images.
          </Typography>
        </Box>

        <Button variant="outlined" onClick={() => navigate(-1)} disabled={loading}>
          Back
        </Button>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      <Card sx={{ background: colors.primary[400], borderRadius: 2 }}>
        <CardContent>
          <Stepper activeStep={step} alternativeLabel>
            {PRODUCT_WIZARD_STEPS.map((s) => (
              <Step key={s.key}>
                <StepLabel>{s.label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Divider sx={{ my: 2, opacity: 0.2 }} />

          {stepView}

          <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between", gap: 2 }}>
            <Button
              variant="outlined"
              disabled={!canGoBack || loading}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              Previous
            </Button>

            {canGoNext ? (
              <Button
                variant="contained"
                disabled={loading}
                onClick={() => {
                  if (!validateStep(step)) return;
                  setStep((s) => Math.min(PRODUCT_WIZARD_STEPS.length - 1, s + 1));
                }}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                disabled={loading}
                onClick={handleFinish}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? "Creating..." : "Finish"}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default AddProductTab;
