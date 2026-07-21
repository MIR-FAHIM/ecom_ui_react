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
import { tokens } from "../../../../theme";
import {
	getProductDetails,
	updateProduct,
	uploadProductImages,
	addProductAttribute,
} from "../../../../api/controller/admin_controller/product/product_controller";
import { getAllShops } from "../../../../api/controller/admin_controller/shop/shop_controller.jsx";
import { getCategory, getBrand } from "../../../../api/controller/admin_controller/product/setting_controller";
import { getCategoryChildren, getProductCategoryDetails } from "../../../../api/controller/admin_controller/product/product_setting_controller.jsx";
import { PRODUCT_WIZARD_STEPS } from "../add_product/components/productWizard/steps";
import StepGeneral from "../add_product/components/productWizard/StepGeneral";
import StepDiscountSeo from "../add_product/components/productWizard/StepDiscountSeo";
import StepAttributes from "../add_product/components/productWizard/StepAttributes";
import StepImages from "../add_product/components/productWizard/StepImages";

const DEFAULT_GENERAL = {
	name: "",
	slug: "",
	category_id: "",
	brand_id: "",
	shop_id: "",
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
	// Discount
	discount_type: "flat",
	discount_value: "",
	discount_start_date: "",
	discount_end_date: "",
	// SEO
	short_description: "",
	meta_title: "",
	meta_description: "",
	meta_img: "",
};

function EditProduct() {
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
	const [parentCategoryId, setParentCategoryId] = useState("");
	const [subCategoryId, setSubCategoryId] = useState("");
	const [childCategoryId, setChildCategoryId] = useState("");
	const [subCategories, setSubCategories] = useState([]);
	const [childCategories, setChildCategories] = useState([]);
	const [loadingSubCategories, setLoadingSubCategories] = useState(false);
	const [loadingChildCategories, setLoadingChildCategories] = useState(false);

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
			const [cRes, bRes, vRes] = await Promise.all([
				getCategory(),
				getBrand(),
				getAllShops({ page: 1, per_page: 100 }),
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
		const primary = product?.primary_image || null;
		const primaryUpload = primary?.upload || null;
		const primaryUploadId = primaryUpload?.id ?? primary?.media_id ?? primary?.upload_id ?? product?.thumbnail_img ?? null;

		const extra = Array.isArray(product?.images) ? product.images : [];
		extra.forEach((img) => {
			const upload = img?.upload || null;
			const productImageId = img?.id ?? img?.product_image_id ?? null;
			const uploadId = upload?.id ?? img?.media_id ?? img?.upload_id ?? null;
			if (!productImageId && !uploadId && !img?.file_name && !img?.image && !img?.url) return;
			if (productImageId && list.some((x) => String(x.product_image_id) === String(productImageId))) return;
			if (!productImageId && uploadId && list.some((x) => String(x.upload_id ?? x.media_id) === String(uploadId))) return;
			list.push({
				file: null,
				id: productImageId,
				product_image_id: productImageId,
				upload_id: uploadId,
				media_id: uploadId,
				file_name: upload?.file_name || upload?.url || img?.file_name || img?.image || "",
				filename:
					upload?.file_original_name ||
					upload?.file_name ||
					img?.file_original_name ||
					img?.file_name ||
					img?.image ||
					"",
				url: upload?.url || img?.url || null,
				is_primary:
					Boolean(img?.is_primary ?? img?.is_primary_image ?? img?.primary) ||
					(Boolean(primaryUploadId) && Boolean(uploadId) && String(uploadId) === String(primaryUploadId)),
				existing: Boolean(productImageId),
			});
		});

		if (primaryUpload?.file_name || primary?.file_name || primaryUpload?.url || primary?.url) {
			const duplicatePrimary = list.some((x) => {
				if (primaryUploadId && x.upload_id) return String(x.upload_id) === String(primaryUploadId);
				return x.file_name && x.file_name === (primaryUpload?.file_name || primary?.file_name);
			});
			const primaryProductImageId = primary?.product_image_id ?? primary?.productImageId ?? null;
			if (!duplicatePrimary) {
				list.unshift({
					file: null,
					id: primaryProductImageId,
					product_image_id: primaryProductImageId,
					upload_id: primaryUploadId,
					media_id: primaryUploadId,
					file_name: primaryUpload?.file_name || primary?.file_name || "",
					filename: primaryUpload?.file_original_name || primary?.file_original_name || primaryUpload?.file_name || primary?.file_name || "",
					url: primaryUpload?.url || primary?.url || null,
					is_primary: true,
					existing: Boolean(primaryProductImageId),
				});
			}
		}

		if (!list.length && product?.thumbnail_img) {
			list.push({
				file: null,
				id: null,
				product_image_id: null,
				upload_id: product.thumbnail_img,
				media_id: product.thumbnail_img,
				file_name: "",
				filename: `media-${product.thumbnail_img}`,
				url: null,
				is_primary: true,
				existing: false,
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
				brand_id: product?.brand_id ?? "",
				shop_id: product?.shop_id ?? product?.shop?.id ?? "",
				user_id: product?.user_id ?? product?.shop?.user_id ?? localStorage.getItem("userId") ?? "",
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
				short_description: product?.short_description ?? "",
				meta_title: product?.meta_title ?? "",
				meta_description: product?.meta_description ?? "",
				meta_img: product?.meta_img ?? product?.meta_image ?? product?.seo?.image ?? "",
				// Discount — loaded directly from product columns
				discount_type: product?.discount_type === "amount" ? "flat" : (product?.discount_type ?? "flat"),
				discount_value: product?.discount ? product.discount : "",
				discount_start_date: product?.discount_start_date
					? new Date(product.discount_start_date * 1000).toISOString().slice(0, 10)
					: "",
				discount_end_date: product?.discount_end_date
					? new Date(product.discount_end_date * 1000).toISOString().slice(0, 10)
					: "",
			});

			setImages(buildImageList(product));

			const categoryId = product?.category_id;
			if (categoryId) {
				try {
					const categoryRes = await getProductCategoryDetails(categoryId);
					const category = categoryRes?.data ?? categoryRes;
					const selectedLevel = Number(category?.level ?? 0);
					const selectedParentId = category?.parent_id ? String(category.parent_id) : "";

					if (selectedLevel === 2 && selectedParentId) {
						const subCategoryRes = await getProductCategoryDetails(selectedParentId);
						const subCategory = subCategoryRes?.data ?? subCategoryRes;
						setParentCategoryId(subCategory?.parent_id ? String(subCategory.parent_id) : "");
						setSubCategoryId(selectedParentId);
						setChildCategoryId(String(categoryId));
					} else if (selectedLevel === 1 && selectedParentId) {
						setParentCategoryId(selectedParentId);
						setSubCategoryId(String(categoryId));
						setChildCategoryId("");
					} else if (selectedParentId) {
						setParentCategoryId(selectedParentId);
						setSubCategoryId(String(categoryId));
						setChildCategoryId("");
					} else {
						setParentCategoryId(String(categoryId));
						setSubCategoryId("");
						setChildCategoryId("");
					}
				} catch (e) {
					console.error("Failed to load category details:", e);
					setParentCategoryId(String(categoryId));
				}
			}
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

	useEffect(() => {
		const loadSubCategories = async () => {
			if (!parentCategoryId) {
				setSubCategories([]);
				setSubCategoryId("");
				setChildCategories([]);
				setChildCategoryId("");
				return;
			}

			setLoadingSubCategories(true);
			try {
				const res = await getCategoryChildren(parentCategoryId);
				const list = normalizeList(res);
				setSubCategories(list);
				setGeneral((prev) => {
					if (list.length === 0) return { ...prev, category_id: parentCategoryId };
					const exists = list.some((c) => String(c?.id ?? c?._id) === String(subCategoryId));
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

	useEffect(() => {
		const loadChildCategories = async () => {
			if (!subCategoryId) {
				setChildCategories([]);
				setChildCategoryId("");
				return;
			}

			setLoadingChildCategories(true);
			try {
				const res = await getCategoryChildren(subCategoryId);
				const list = normalizeList(res);
				setChildCategories(list);
				setGeneral((prev) => {
					if (list.length === 0) return { ...prev, category_id: subCategoryId };
					const exists = list.some((c) => String(c?.id ?? c?._id) === String(childCategoryId));
					return exists ? prev : { ...prev, category_id: "" };
				});
			} catch (e) {
				console.error("Error loading child categories:", e);
				setChildCategories([]);
			} finally {
				setLoadingChildCategories(false);
			}
		};

		loadChildCategories();
	}, [subCategoryId]);

	const canGoBack = step > 0;
	const canGoNext = step < PRODUCT_WIZARD_STEPS.length - 1;

	const validateStep = (s) => {
		const nextErrors = {};

		if (s === 0) {
			if (!general.name || !general.name.trim()) nextErrors.name = "Product name is required";
			if (!general.slug || !general.slug.trim()) nextErrors.slug = "Slug is required";
			if (!general.category_id) nextErrors.category_id = "Category is required";
			if (!general.shop_id) nextErrors.shop_id = "Shop is required";
			if (parentCategoryId && subCategories.length > 0 && !subCategoryId) {
				nextErrors.category_id = "Sub category is required";
			}
			if (subCategoryId && childCategories.length > 0 && !childCategoryId) {
				nextErrors.category_id = "Child category is required";
			}
			if (!general.user_id) nextErrors.user_id = "User ID is required";
		}

		if (s === 1) {
			const discVal = parseFloat(general.discount_value);
			if (!isNaN(discVal) && discVal > 0) {
				if (general.discount_type === "percent" && discVal > 100)
					nextErrors.discount_value = "Percentage discount cannot exceed 100%";
				const price = parseFloat(general.unit_price) || 0;
				if (general.discount_type === "flat" && price > 0 && discVal >= price)
					nextErrors.discount_value = "Flat discount cannot equal or exceed the unit price";
			}
			if (general.discount_start_date && general.discount_end_date) {
				if (new Date(general.discount_end_date) <= new Date(general.discount_start_date))
					nextErrors.discount_end_date = "End date must be after start date";
			}
		}

		if (s === 3) {
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

	const apiFieldStep = {
		name: 0,
		slug: 0,
		category_id: 0,
		brand_id: 0,
		shop_id: 0,
		user_id: 0,
		added_by: 0,
		unit_price: 0,
		purchase_price: 0,
		current_stock: 0,
		unit: 0,
		weight: 0,
		discount: 1,
		discount_type: 1,
		discount_value: 1,
		discount_start_date: 1,
		discount_end_date: 1,
		short_description: 1,
		meta_title: 1,
		meta_description: 1,
		meta_img: 1,
		photos: 3,
		thumbnail_img: 3,
		images: 3,
	};

	const getErrorText = (value) => {
		if (Array.isArray(value)) return value.filter(Boolean).join(" ");
		if (value && typeof value === "object") return Object.values(value).flat().filter(Boolean).join(" ");
		return value ? String(value) : "";
	};

	const normalizeApiErrors = (apiErrors = {}) => {
		return Object.entries(apiErrors).reduce((acc, [field, value]) => {
			const key = String(field).split(".").pop();
			const message = getErrorText(value);
			if (key && message) acc[key] = message;
			return acc;
		}, {});
	};

	const isFailedResponse = (res) => {
		const status = String(res?.status || "").toLowerCase();
		return status === "failed" || status === "error" || res?.success === false || !!res?.errors;
	};

	const showApiFailure = (payload, fallback = "Failed to update product") => {
		const fieldErrors = normalizeApiErrors(payload?.errors);
		const firstField = Object.keys(fieldErrors)[0];
		const firstFieldMessage = firstField ? fieldErrors[firstField] : "";

		if (Object.keys(fieldErrors).length > 0) {
			setErrors((prev) => ({ ...prev, ...fieldErrors }));
			if (firstField && apiFieldStep[firstField] !== undefined) {
				setStep(apiFieldStep[firstField]);
			}
		}

		setSuccessMessage("");
		setErrorMessage(payload?.message || firstFieldMessage || fallback);
	};

	const handleFinish = async () => {
		if (!validateStep(step)) return;
		if (!id) return;

		try {
			setLoading(true);
			setErrorMessage("");
			setSuccessMessage("");

			const productFormData = new FormData();
			const selectedShop = shops.find((shop) => String(shop?.id) === String(general.shop_id));
			const selectedShopId = selectedShop?.id ?? general.shop_id;
			const selectedShopUserId = selectedShop?.user_id ?? general.user_id;

			productFormData.append("name", general.name);
			productFormData.append("slug", general.slug);
			productFormData.append("category_id", general.category_id);
			if (general.brand_id) productFormData.append("brand_id", general.brand_id);
			if (selectedShopId) productFormData.append("shop_id", selectedShopId);
			productFormData.append("added_by", general.added_by ?? 1);
			productFormData.append("user_id", selectedShopUserId);
			productFormData.append("description", general.description || "");
			productFormData.append("unit_price", general.unit_price);
			if (general.purchase_price) productFormData.append("purchase_price", general.purchase_price);
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
			if (general.weight) productFormData.append("weight", general.weight);
			if (general.short_description) productFormData.append("short_description", general.short_description);
			productFormData.append("meta_title", general.meta_title || "");
			productFormData.append("meta_description", general.meta_description || "");
			productFormData.append("meta_img", general.meta_img || "");
			// Discount fields sent directly on product
			if (general.discount_value && parseFloat(general.discount_value) > 0) {
				productFormData.append("discount", general.discount_value);
				productFormData.append("discount_type", general.discount_type === "flat" ? "amount" : "percent");
				if (general.discount_start_date)
					productFormData.append("discount_start_date", Math.floor(new Date(general.discount_start_date).getTime() / 1000));
				if (general.discount_end_date)
					productFormData.append("discount_end_date", Math.floor(new Date(general.discount_end_date).getTime() / 1000));
			} else {
				productFormData.append("discount", "");
				productFormData.append("discount_type", "");
			}

			const mediaPhotos = images.filter((i) => i.media_id).map((i) => i.media_id);
			mediaPhotos.forEach((mid) => productFormData.append("photos[]", mid));

			const primaryMedia = images.find((i) => i.is_primary && i.media_id);
			if (primaryMedia) productFormData.append("thumbnail_img", primaryMedia.media_id);

			const updateRes = await updateProduct(id, productFormData);
			if (isFailedResponse(updateRes)) {
				showApiFailure(updateRes);
				return;
			}

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
				navigate("/ecom/product/all");
			}, 1500);
		} catch (error) {
			console.error("Product update error:", error);
			if (error?.response?.data && isFailedResponse(error.response.data)) {
				showApiFailure(error.response.data);
			} else {
				setErrorMessage(error.response?.data?.message || error.message || "Failed to update product");
			}
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
					subCategoryId={subCategoryId}
					subCategories={subCategories}
					loadingSubCategories={loadingSubCategories}
					childCategoryId={childCategoryId}
					childCategories={childCategories}
					loadingChildCategories={loadingChildCategories}
					onParentCategoryChange={(nextId) => {
						setParentCategoryId(nextId);
						setSubCategoryId("");
						setChildCategoryId("");
						setChildCategories([]);
						setGeneral((prev) => ({ ...prev, category_id: "" }));
					}}
					onSubCategoryChange={(nextId) => {
						setSubCategoryId(nextId);
						setChildCategoryId("");
						setChildCategories([]);
						setGeneral((prev) => ({ ...prev, category_id: nextId }));
					}}
					onChildCategoryChange={(nextId) => {
						setChildCategoryId(nextId);
						setGeneral((prev) => ({ ...prev, category_id: nextId }));
					}}
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
				<StepDiscountSeo
					value={general}
					onChange={(patch) => setGeneral((prev) => ({ ...prev, ...patch }))}
					errors={errors}
				/>
			);
		}

		if (step === 2) {
			return (
				<StepAttributes
					value={attributes}
					onAdd={(attr) => setAttributes((prev) => [...prev, attr])}
					onRemove={(idx) => setAttributes((prev) => prev.filter((_, i) => i !== idx))}
					productId={id}
				/>
			);
		}

		return (
			<StepImages
				value={images}
				error={errors.images}
				productId={id}
				deleteProductImagesOnRemove
				onAdd={(img) => setImages((prev) => [...prev, img])}
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
	}, [
		step,
		general,
		attributes,
		images,
		errors,
		categories,
		brands,
		shops,
		parentCategoryId,
		subCategoryId,
		childCategoryId,
		subCategories,
		childCategories,
		loadingSubCategories,
		loadingChildCategories,
	]);

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

export default EditProduct;
