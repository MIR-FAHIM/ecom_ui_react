import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import App from "./App";
import Dashboard from "./scenes/admin_panel/dashboard";
import Login from "./scenes/auth/login";
import LoginOtp from "./scenes/auth/LoginOtp";
import Register from "./scenes/auth/Register";
import AddProductTab from "./scenes/admin_panel/product/add_product/AddProductTab";
import AllProducts from "./scenes/admin_panel/product/AllProducts";
import StockOutProduct from "./scenes/admin_panel/product/StockOutProduct";
import SellerProducts from "./scenes/admin_panel/product/SellerProducts";
import AllOrdersEcom from "./scenes/admin_panel/order/AllOrders";
import AllTransaction from "./scenes/admin_panel/accounts/AllTransaction";
import OderDetails from "./scenes/admin_panel/order/OderDetails";
import CompletedOrders from "./scenes/admin_panel/order/CompletedOrders";
import OrderReport from "./scenes/admin_panel/order/OrderReport";
import AddSeller from "./scenes/admin_panel/seller/AddSeller";
import AllSellers from "./scenes/admin_panel/seller/AllSellers";
import AddCustomer from "./scenes/admin_panel/customer/AddCustomer";
import AllCustomers from "./scenes/admin_panel/customer/AllCustomers";
import TodayReport from "./scenes/admin_panel/report/TodayReport";
import MonthWiseReport from "./scenes/admin_panel/report/MonthWiseReport";
import AddDeliveryMan from "./scenes/admin_panel/delivery/AddDeliveryMan";
import DeliveryManDetail from "./scenes/admin_panel/delivery/DeliveryManDetail";

import EcommerceSetting from "./scenes/admin_panel/setting/EcommerceSetting";
import EcommerceAccounts from "./scenes/admin_panel/accounts/EcommerceAccounts";
import AddBanner from "./scenes/admin_panel/media/AddBanner";
import Attribute from "./scenes/admin_panel/product/attribute/attribute";
import AllMedia from "./scenes/admin_panel/media/AllMedia";
import EditProduct from "./scenes/admin_panel/product/edit_product/EditProduct";
import AllDeliveryMans from "./scenes/admin_panel/delivery/AllDeliveryMans";
import WebsiteLogoSetting from "./scenes/admin_panel/setting/website_logo_setting";
import ShippingCostSetting from "./scenes/admin_panel/setting/shipping_cost";

// Public / frontend pages
import HomeP1 from "./scenes/a_frontend_ui/home/Home";
import ProductDetail from "./scenes/a_frontend_ui/product/ProductDetail";
import CategoryWiseProduct from "./scenes/a_frontend_ui/product/category_wise/CategoryWiseProduct";
import Cart from "./scenes/a_frontend_ui/order/cart";

import FrontendLayout from "./scenes/a_frontend_ui/layout/FrontendLayout";
import Privacy from "./scenes/a_frontend_ui/pages/Privacy";
import Terms from "./scenes/a_frontend_ui/pages/Terms";
import About from "./scenes/a_frontend_ui/pages/About";
import Contact from "./scenes/a_frontend_ui/pages/Contact";
import ProceedOrder from "./scenes/a_frontend_ui/order/ProceedOrder";
import Profile from "./scenes/a_frontend_ui/profile/Profile";
import UserOrder from "./scenes/a_frontend_ui/order/UserOrder";
import UserOrderDetails from "./scenes/a_frontend_ui/order/UserOrderDetails";
import Wish from "./scenes/a_frontend_ui/wish/Wish";
import RelatedProduct from "./scenes/a_frontend_ui/product/related_product/RelatedProduct";
import ProductReview from "./scenes/a_frontend_ui/product/review_product/ProductReview";
import AddShop from "./scenes/a_frontend_ui/seller/AddShop";
import ShopProducts from "./scenes/a_frontend_ui/seller/ShopProducts";
import EditSellerTab from "./scenes/admin_panel/seller/EditSellerTab";
import ShopList from "./scenes/a_frontend_ui/seller/ShopList";

// Seller panel
import SellerLayout from "./scenes/seller_panel/layout/SellerLayout";
import SellerDashboard from "./scenes/seller_panel/dashboard/index";
import SellerPanelProducts from "./scenes/seller_panel/product/SellerPanelProducts";
import SellerShopList from "./scenes/seller_panel/shop/SellerShopList";
import SellerShopProduct from "./scenes/seller_panel/shop/SellerShopProduct";
import AddProduct from "./scenes/seller_panel/product/AddProduct";



const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/login-otp" element={<LoginOtp />}></Route>
        <Route path="/register" element={<Register />}></Route>
        {/* Public / storefront routes */}
        <Route path="/" element={<FrontendLayout />}>
          <Route index element={<HomeP1 />} />
          <Route path="home" element={<HomeP1 />} />
          
          <Route path="profile" element={<Profile />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="shop/:id" element={<ShopProducts />} />
          <Route path="shops" element={<ShopList />} />
          <Route path="category/:id" element={<CategoryWiseProduct />} />
          <Route path="cart" element={<Cart />} />
          <Route path="orders" element={<UserOrder />} />
          <Route path="order/:id" element={<UserOrderDetails />} />
          <Route path="checkout" element={<ProceedOrder />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="proceed-order" element={<ProceedOrder />} />
          <Route path="wish" element={<Wish />} />
          <Route path="related-product" element={<RelatedProduct />} />
          <Route path="product-review" element={<ProductReview />} />
          <Route path="seller/add" element={<AddShop />} />
        </Route>

         

        <Route path="/" element={<App />}>

          <Route path="/admin" element={<Dashboard />} />

          {/* Product Routes */}
          <Route path="/ecom/product/add" element={<AddProductTab />} />
          <Route path="/ecom/product/all" element={<AllProducts />} />
          <Route path="/ecom/product/stock-out" element={<StockOutProduct />} />
          <Route path="/ecom/product/seller" element={<SellerProducts />} />
          <Route path="/ecom/product/attribute" element={<Attribute />} />
          <Route path="/ecom/product/edit/:id" element={<EditProduct />} />

          {/* Order Routes */}
          <Route path="/ecom/order/all" element={<AllOrdersEcom />} />
          <Route path="/ecom/order/completed" element={<CompletedOrders />} />
          <Route path="/ecom/order/report" element={<OrderReport />} />
          <Route path="/admin/order/:id" element={<OderDetails />} />

          {/* Seller Routes */}
          <Route path="/ecom/seller/add" element={<AddSeller />} />
          <Route path="/ecom/seller/all" element={<AllSellers />} />
          <Route path="/ecom/admin/seller/:id" element={<EditSellerTab />} />
          <Route path="/ecom/admin/seller/edit/:id" element={<EditSellerTab />} />
    

          {/* Customer Routes */}
          <Route path="/ecom/customer/add" element={<AddCustomer />} />
          <Route path="/ecom/customer/all" element={<AllCustomers />} />

          {/* Report Routes */}
          <Route path="/ecom/report/today" element={<TodayReport />} />
          <Route path="/ecom/report/month-wise" element={<MonthWiseReport />} />

          {/* Delivery Routes */}
          <Route path="/ecom/delivery/add" element={<AddDeliveryMan />} />
          <Route path="/ecom/delivery/all" element={<AllDeliveryMans />} />
          <Route path="/ecom/delivery/detail/:id" element={<DeliveryManDetail />} />

          {/* Settings & Accounts */}
          <Route path="/ecom/setting" element={<EcommerceSetting />} />
          <Route path="/ecom/accounts"  element={<EcommerceAccounts />} />
          <Route path="/ecom/accounts/transactions"  element={<AllTransaction />} />
          <Route path="/ecom/setting/website-logo"  element={<WebsiteLogoSetting />} />
          <Route path="/ecom/setting/shipping-cost"  element={<ShippingCostSetting />} />


          <Route path="/ecom/banner/add" element={<AddBanner />} />
          <Route path="/ecom/media/all" element={<AllMedia />} />

        </Route>

        <Route path="/seller" element={<SellerLayout />}>
          <Route path="dashboard" element={<SellerDashboard />} />
          <Route path="products" element={<SellerPanelProducts />} />
          <Route path="shops" element={<SellerShopList />} />
          <Route path="shops/products" element={<SellerShopProduct />} />
          <Route path="add/product" element={<AddProduct />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;
