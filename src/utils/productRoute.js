export const getProductIdentifier = (product) => {
  const slug = product?.slug ?? product?.product?.slug;
  if (slug) return encodeURIComponent(String(slug));

  const id = product?.id ?? product?.product_id ?? product?.product?.id;
  if (id === undefined || id === null || id === "") return "";

  return encodeURIComponent(String(id));
};

export const productDetailPath = (product) => {
  const identifier = getProductIdentifier(product);
  return identifier ? `/product/${identifier}` : "/product";
};
