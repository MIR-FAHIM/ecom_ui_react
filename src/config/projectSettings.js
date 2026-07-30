import { appClient } from "../api/config";

const settingsByClient = {
  pharmavan: {
    textOverrides: {
      Sellers: "Distributors",
      "Add Seller": "Add Distributor",
      "All Sellers": "All Distributors",
      Brands: "Manufacturer",
      "Brand Management": "Manufacturer Management",
    },
  },
};

export const projectSettings = settingsByClient[appClient] || {};

export const getProjectText = (text) => {
  if (!text) return text;
  return projectSettings.textOverrides?.[text] || text;
};
