import Navbar from "./layout/navbar";
import SideBar from "./layout/sidebar";
import Dashboard from "./admin_panel/dashboard";
import Login from "./auth/login";
import LoginOtp from "./auth/LoginOtp";

// Ecommerce imports
import AddProductTab from "./admin_panel/product/add_product/AddProductTab";
import AllProducts from "./admin_panel/product/AllProducts";
import StockOutProduct from "./admin_panel/product/StockOutProduct";
import SellerProducts from "./admin_panel/product/SellerProducts";
import AllOrdersEcom from "./admin_panel/order/AllOrders";
import CompletedOrders from "./admin_panel/order/CompletedOrders";
import OderDetails from "./admin_panel/order/OderDetails";
import OrderReport from "./admin_panel/order/OrderReport";
import AddSeller from "./admin_panel/seller/AddSeller";
import AllSellers from "./admin_panel/seller/AllSellers";
import AddCustomer from "./admin_panel/customer/AddCustomer";
import AllCustomers from "./admin_panel/customer/AllCustomers";
import TodayReport from "./admin_panel/report/TodayReport";
import MonthWiseReport from "./admin_panel/report/MonthWiseReport";
import AddDeliveryMan from "./admin_panel/delivery/AddDeliveryMan";
import AllDeliveryMans from "./admin_panel/delivery/AllDeliveryMans";
import EcommerceSetting from "./admin_panel/setting/EcommerceSetting";
import EcommerceAccounts from "./admin_panel/accounts/EcommerceAccounts";
import AddBanner from "./admin_panel/media/AddBanner";
import Attribute from "./admin_panel/product/attribute/attribute";
import AllMedia from "./admin_panel/media/AllMedia";
import EditProduct from "./admin_panel/product/edit_product/EditProduct";
import DeliveryManDetail from "./admin_panel/delivery/DeliveryManDetail";
import AllTransaction from "./admin_panel/accounts/AllTransaction";
import ShopManage from "./admin_panel/seller/EditSellerTab";
import WebsiteLogoSetting from "./admin_panel/setting/website_logo_setting";
import ShippingCostSetting from "./admin_panel/setting/shipping_cost";





// user frontend

import HomeP1 from "./a_frontend_ui/home/Home";
import UserOrder from "./a_frontend_ui/order/UserOrder";
import Profile from "./a_frontend_ui/profile/Profile";
import UserOrderDetails from "./a_frontend_ui/order/UserOrderDetails";
import ProductDetail from "./a_frontend_ui/product/ProductDetail";
import Cart from "./a_frontend_ui/order/cart";
import ProceedOrder from "./a_frontend_ui/order/ProceedOrder";
import CategoryWiseProduct from "./a_frontend_ui/product/category_wise/CategoryWiseProduct";
import RelatedProduct from "./a_frontend_ui/product/related_product/RelatedProduct";
import ProductReview from "./a_frontend_ui/product/review_product/ProductReview";
import AddShop from "./a_frontend_ui/seller/AddShop";
import ShopProducts from "./a_frontend_ui/seller/ShopProducts";
import Brand from "./a_frontend_ui/brand/brand";
import AllCategory from "./a_frontend_ui/category/AllCategory";

import Wish from "./a_frontend_ui/wish/Wish";

//seller panel
import SellerDashboard from "./seller_panel/dashboard/index";
import SellerPanelProducts from "./seller_panel/product/SellerPanelProducts";
import SellerShopList from "./seller_panel/shop/SellerShopList";
import SellerShopProduct from "./seller_panel/shop/SellerShopProduct";
import AddProductSeller from "./seller_panel/product/AddProduct";
import EditProductSeller from "./seller_panel/product/EditProduct";
import OrderShop from "./seller_panel/order/OrderShop";

export {
  Navbar,
  SideBar,
  Dashboard,
  Login,
  LoginOtp,
  AddProductTab,
  AllProducts,
  StockOutProduct,
  SellerProducts,
  AllOrdersEcom,
  CompletedOrders,
  OrderReport,
  OderDetails,
  AddSeller,
  AllSellers,
  AddCustomer,
  AllCustomers,
  TodayReport,
  MonthWiseReport,
  AddDeliveryMan,
  AllDeliveryMans,
  EcommerceSetting,
  EcommerceAccounts,
  AddBanner,
  Attribute,
  AllMedia,
  EditProduct,
  DeliveryManDetail,
  AllTransaction,
  ShopManage,
  WebsiteLogoSetting,
  ShippingCostSetting,

  
  // user frontend
  HomeP1,
  Profile,
  UserOrderDetails,
  UserOrder,
  ProductDetail,
  Cart,
  ProceedOrder,
  Wish,
  CategoryWiseProduct,
  RelatedProduct,
  ProductReview,
  AddShop,
  ShopProducts,
  Brand,
  AllCategory,


  // seller panel

  SellerDashboard,
  SellerPanelProducts,
  SellerShopList,
  SellerShopProduct,
  AddProductSeller,
  EditProductSeller,
  OrderShop,
};
