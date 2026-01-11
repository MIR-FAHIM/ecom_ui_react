import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import App from "./App";
import Dashboard from "./scenes/admin_panel/dashboard";
import Login from "./scenes/auth/login";
import AddProductTab from "./scenes/admin_panel/product/add_product/AddProductTab";
import AllProducts from "./scenes/admin_panel/product/AllProducts";
import StockOutProduct from "./scenes/admin_panel/product/StockOutProduct";
import SellerProducts from "./scenes/admin_panel/product/SellerProducts";
import AllOrdersEcom from "./scenes/admin_panel/order/AllOrders";
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
import AllDeliveryMans from "./scenes/admin_panel/delivery/AllDeliveryMans";
import EcommerceSetting from "./scenes/admin_panel/setting/EcommerceSetting";
import EcommerceAccounts from "./scenes/admin_panel/accounts/EcommerceAccounts";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/" element={<App />}>
          <Route path="/" element={<Dashboard />} />

          {/* Product Routes */}
          <Route path="/ecom/product/add" element={<AddProductTab />} />
          <Route path="/ecom/product/all" element={<AllProducts />} />
          <Route path="/ecom/product/stock-out" element={<StockOutProduct />} />
          <Route path="/ecom/product/seller" element={<SellerProducts />} />

          {/* Order Routes */}
          <Route path="/ecom/order/all" element={<AllOrdersEcom />} />
          <Route path="/ecom/order/completed" element={<CompletedOrders />} />
          <Route path="/ecom/order/report" element={<OrderReport />} />
          <Route path="/admin/order/:id" element={<OderDetails />} />

          {/* Seller Routes */}
          <Route path="/ecom/seller/add" element={<AddSeller />} />
          <Route path="/ecom/seller/all" element={<AllSellers />} />

          {/* Customer Routes */}
          <Route path="/ecom/customer/add" element={<AddCustomer />} />
          <Route path="/ecom/customer/all" element={<AllCustomers />} />

          {/* Report Routes */}
          <Route path="/ecom/report/today" element={<TodayReport />} />
          <Route path="/ecom/report/month-wise" element={<MonthWiseReport />} />

          {/* Delivery Routes */}
          <Route path="/ecom/delivery/add" element={<AddDeliveryMan />} />
          <Route path="/ecom/delivery/all" element={<AllDeliveryMans />} />

          {/* Settings & Accounts */}
          <Route path="/ecom/setting" element={<EcommerceSetting />} />
          <Route path="/ecom/accounts" element={<EcommerceAccounts />} />

        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;
