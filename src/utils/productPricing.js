export const getProductPricing = (product) => {
  const price = Number(product?.unit_price ?? product?.price ?? 0);
  const explicitSalePrice = Number(product?.sale_price ?? 0);

  const relationDiscount = product?.product_discount;
  const rawDiscount = relationDiscount?.discount ?? product?.discount ?? 0;
  const discountAmount = Number(rawDiscount);
  const discountType = String(relationDiscount?.discount_type ?? product?.discount_type ?? "").toLowerCase();

  let salePrice = explicitSalePrice > 0 ? explicitSalePrice : 0;

  if (!salePrice && discountAmount > 0 && price > 0) {
    if (discountType === "percent") {
      salePrice = Math.round(price - (price * discountAmount) / 100);
    } else {
      salePrice = Math.max(price - discountAmount, 0);
    }
  }

  const hasSale = salePrice > 0 && salePrice < price;
  const displayPrice = hasSale ? salePrice : price;

  let discountLabel = "";
  if (hasSale && discountAmount > 0) {
    if (discountType === "percent") {
      discountLabel = `-${Math.round(discountAmount)}%`;
    } else if (price > 0) {
      discountLabel = `-${Math.round(((price - salePrice) / price) * 100)}%`;
    }
  } else if (hasSale && price > 0) {
    discountLabel = `-${Math.round(((price - salePrice) / price) * 100)}%`;
  }

  return {
    price,
    salePrice,
    displayPrice,
    hasSale,
    discountLabel,
  };
};
