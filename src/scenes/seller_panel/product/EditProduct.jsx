import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { tokens } from "../../../theme";
import {
  getProductDetails,
  updateProduct,
  uploadProductImages,
  addProductAttribute,
} from "../../../api/controller/admin_controller/product/product_controller";
import { getAllShops } from "../../../api/controller/admin_controller/shop/shop_controller.jsx";
import { getCategory, getBrand } from "../../../api/controller/admin_controller/product/setting_controller";
import { PRODUCT_WIZARD_STEPS } from "../../admin_panel/product/add_product/components/productWizard/steps";
import StepGeneral from "../../admin_panel/product/add_product/components/productWizard/StepGeneral";
import StepAttributes from "../../admin_panel/product/add_product/components/productWizard/StepAttributes";
import StepImages from "../../admin_panel/product/add_product/components/productWizard/StepImages";

const DEFAULT_GENERAL = {
  name: "",
  slug: "",
  category_id: "",
  user_id: "",
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
};

function EditProductSeller() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const { id } = useParams();

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [general, setGeneral] = useState(DEFAULT_GENERAL);
  const [attributes, setAttributes] = useState([]);
  const [images, setImages] = useState([]);

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [shops, setShops] = useState([]);

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

  const loadDropdowns = async () => {
    try {
      const userId = localStorage.getItem("userId") || "";
      const [cRes, bRes, vRes] = await Promise.all([
        getCategory(),
        getBrand(),
        getAllShops({ page: 1, per_page: 100, user_id: userId }),
      ]);

      setCategories(normalizeList(cRes));
      setBrands(normalizeList(bRes));
      setShops(normalizeList(vRes));
    } catch (e) {
      console.error("Error loading dropdowns:", e);
    }
  };

  const buildImageList = (product) => {
    const list = [];

    if (product?.primary_image) {
      list.push({
        file: null,
        media_id: product.primary_image.id,
        file_name: product.primary_image.file_name,
        filename: product.primary_image.file_original_name || product.primary_image.file_name,
        url: product.primary_image.url,
        is_primary: true,
      });
    }

    const extra = Array.isArray(product?.images) ? product.images : [];
    extra.forEach((img) => {
      const mediaId = img?.id ?? img?.media_id;
      if (!mediaId) return;
      if (list.some((x) => String(x.media_id) === String(mediaId))) return;
      list.push({
        file: null,
        media_id: mediaId,
        file_name: img?.file_name || img?.image,
        filename: img?.file_original_name || img?.file_name || img?.image,
        url: img?.url,
        is_primary: !!img?.is_primary,
      });
    });

    if (!list.length && product?.thumbnail_img) {
      list.push({
        file: null,
        media_id: product.thumbnail_img,
        file_name: "",
        filename: `media-${product.thumbnail_img}`,
        url: null,
        is_primary: true,
      });
    }

    if (list.length > 0 && !list.some((x) => x.is_primary)) {
      list[0].is_primary = true;
    }

    return list;
  };

  const loadProduct = async () => {
    if (!id) return;
    setFetching(true);
    setErrorMessage("");
    try {
      const resp = await getProductDetails(id);
      const product = resp?.data ?? resp;
      if (!product) {
        setErrorMessage("Unable to load product details.");
        return;
      }

      setGeneral({
        ...DEFAULT_GENERAL,
        name: product?.name ?? "",
        slug: product?.slug ?? "",
        category_id: product?.category_id ?? "",
        user_id: product?.user_id ?? localStorage.getItem("userId") ?? "",
        added_by: product?.added_by ?? localStorage.getItem("userId") ?? 1,
        description: product?.description ?? "",
        unit_price: product?.unit_price ?? "",
        purchase_price: product?.purchase_price ?? "",
        current_stock: product?.current_stock ?? "",
        variant_product: product?.variant_product ?? 0,
        todays_deal: product?.todays_deal ?? 0,
        published: product?.published ?? 0,
        approved: product?.approved ?? 1,
        featured: product?.featured ?? 0,
        refundable: product?.refundable ?? 0,
        cash_on_delivery: product?.cash_on_delivery ?? 1,
        stock_visibility_state:
          product?.stock_visibility_state === "quantity" ? 1 : (product?.stock_visibility_state ?? 1),
        unit: product?.unit ?? "",
        weight: product?.weight ?? "",
      });

      setImages(buildImageList(product));
    } catch (e) {
      console.error("Failed to load product:", e);
      setErrorMessage(e?.response?.data?.message || e.message || "Failed to load product");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadDropdowns();
  }, []);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const canGoBack = step > 0;
  const canGoNext = step < PRODUCT_WIZARD_STEPS.length - 1;

  const validateStep = (s) => {
    const nextErrors = {};

    if (s === 0) {
      if (!general.name || !general.name.trim()) nextErrors.name = "Product name is required";
      if (!general.slug || !general.slug.trim()) nextErrors.slug = "Slug is required";
      if (!general.category_id) nextErrors.category_id = "Category is required";
      if (!general.user_id) nextErrors.user_id = "User ID is required";
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
    if (!id) return;

    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const productFormData = new FormData();
      productFormData.append("name", general.name);
      productFormData.append("slug", general.slug);
      productFormData.append("category_id", general.category_id);
      productFormData.append("added_by", general.added_by ?? 1);
      productFormData.append("user_id", general.user_id);
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

      const mediaPhotos = images.filter((i) => i.media_id).map((i) => i.media_id);
      mediaPhotos.forEach((mid) => productFormData.append("photos[]", mid));

      const primaryMedia = images.find((i) => i.is_primary && i.media_id);
      if (primaryMedia) productFormData.append("thumbnail_img", primaryMedia.media_id);

      await updateProduct(id, productFormData);

      const imagesToUpload = images
        .filter((img) => img.file)
        .map((img) => ({ file: img.file, is_primary: img.is_primary }));

      if (imagesToUpload.length > 0) {
        await uploadProductImages(id, imagesToUpload);
      }

      if (attributes && attributes.length > 0) {
        for (const attr of attributes) {
          try {
            const fd = new FormData();
            fd.append("product_id", id);
            if (attr.attribute_id) fd.append("attribute_id", attr.attribute_id);
            if (attr.attribute_value_id) fd.append("attribute_value_id", attr.attribute_value_id);
            fd.append("stock", attr.stock ?? 0);
            await addProductAttribute(fd);
          } catch (err) {
            console.error("Failed to attach attribute to product:", err);
          }
        }
      }

      setSuccessMessage("Product updated successfully!");
      setTimeout(() => {
        navigate("/seller/products");
      }, 1500);
    } catch (error) {
      console.error("Product update error:", error);
      setErrorMessage(error.response?.data?.message || error.message || "Failed to update product");
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
  }, [step, general, attributes, images, errors, categories, brands, shops]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "start", gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Edit Product
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Update product information and images.
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

          {fetching ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            stepView
          )}

          <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between", gap: 2 }}>
            <Button
              variant="outlined"
              disabled={!canGoBack || loading || fetching}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              Previous
            </Button>

            {canGoNext ? (
              <Button
                variant="contained"
                disabled={loading || fetching}
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
                disabled={loading || fetching}
                onClick={handleFinish}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? "Updating..." : "Update"}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default EditProductSeller;
