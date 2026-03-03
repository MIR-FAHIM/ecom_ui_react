import { Box, IconButton, Typography, useTheme, Collapse } from "@mui/material";
import { useContext, useState } from "react";
import { tokens } from "../../../theme";
import { Menu, MenuItem, Sidebar } from "react-pro-sidebar";
import { useNavigate } from "react-router-dom";
import { appname } from '../../../api/config/index';

import {
  MenuOutlined,
  DashboardOutlined,
  Inventory2Outlined,
  ShoppingCartOutlined,
  PeopleAltOutlined,
  ReceiptLongOutlined,
  StorefrontOutlined,
  DeliveryDiningOutlined,
  SettingsOutlined,
  AccountBalanceOutlined,
  AddBoxOutlined,
  WarningAmberOutlined,
  TuneOutlined,
  BarChartOutlined,
  PointOfSaleOutlined,
  TodayOutlined,
  CalendarMonthOutlined,
  LocalShippingOutlined,
  PersonAddAltOutlined,
  PermMediaOutlined,
  ImageOutlined,
  CollectionsOutlined,
  LanguageOutlined,
  AccountBalanceWalletOutlined,
  CurrencyExchangeOutlined,
} from "@mui/icons-material";
import logo from "../../../assets/images/logo.png";
import Item from "./Item";
import { ToggledContext } from "../../../App";

const SideBar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const { toggled, setToggled } = useContext(ToggledContext);
  const theme = useTheme();
  const navigate = useNavigate();
  const colors = tokens(theme.palette.mode);

  const sidebarBg = "#1b1b28";
  const textColor = "#d6d9f0";
  const mutedText = "#9aa1c7";
  const accent = "#8b8dfb";
  const hoverBg = "rgba(255,255,255,0.06)";
  const activeBg = "rgba(139,92,246,0.18)";

  const iconStyle = {
    color: mutedText,
    fontSize: 20,
    transition: "color 0.2s ease, transform 0.2s ease",
  };

  const categorySx = (category) => ({
    m: "10px 12px",
    px: 1.2,
    py: 1,
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    color: expandedCategory === category ? textColor : mutedText,
    background: expandedCategory === category ? activeBg : "transparent",
    transition: "all 0.2s ease",
    "&:hover": {
      color: textColor,
      background: hoverBg,
    },
    "& svg": iconStyle,
    "&:hover svg": {
      color: accent,
      transform: "translateX(2px)",
    },
  });

  const menuStyles = {
    button: {
      borderRadius: "10px",
      margin: "4px 12px",
      padding: "8px 12px",
      color: textColor,
      fontWeight: 600,
      background: "transparent",
      transition: "all 0.2s ease",
      ":hover": {
        background: hoverBg,
        color: "#ffffff",
      },
    },
  };

  const toggleCategory = (category) => {
    setExpandedCategory((prev) => (prev === category ? null : category));
  };

  return (
    <Sidebar
      backgroundColor={sidebarBg}
      rootStyles={{ border: 0, height: "100%" }}
      collapsed={collapsed}
      onBackdropClick={() => setToggled(false)}
      toggled={toggled}
      breakPoint="md"
    >
      <Menu
        menuItemStyles={{
          button: { ":hover": { background: "transparent" } },
        }}
      >
        <MenuItem
          rootStyles={{
            margin: "10px 0 20px 0",
            color: textColor,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {!collapsed && (
              <Box display="flex" alignItems="center" gap="12px" sx={{ transition: ".3s ease" }}>
                <img style={{ width: "30px", height: "30px", borderRadius: "8px" }} src={logo} alt="Logo" />
                <Typography variant="h6" fontWeight="bold" textTransform="capitalize" color={accent}>
                  {appname}
                </Typography>
              </Box>
            )}
            <IconButton onClick={() => setCollapsed(!collapsed)}>
              <MenuOutlined sx={{ color: textColor }} />
            </IconButton>
          </Box>
        </MenuItem>
      </Menu>

      <Box mb={5} pl={collapsed ? undefined : "5%"}>
        {/* Dashboard */}
        <Typography
          variant="h6"
          sx={categorySx("dashboard")}
          onClick={() => navigate("/admin")}
        >
          <DashboardOutlined />
          {!collapsed ? "Dashboard" : ""}
        </Typography>

        {/* Product */}
        <Typography
          variant="h6"
          sx={categorySx("product")}
          onClick={() => toggleCategory("product")}
        >
          <Inventory2Outlined />
          {!collapsed ? "Product" : ""}
        </Typography>

        <Collapse in={expandedCategory === "product"}>
          <Menu menuItemStyles={menuStyles}>
            <Item title="Add Product" path="/ecom/product/add" colors={colors} icon={<AddBoxOutlined sx={iconStyle} />} />
            <Item title="All Products" path="/ecom/product/all" colors={colors} icon={<Inventory2Outlined sx={iconStyle} />} />
            <Item title="Stock Out Products" path="/ecom/product/stock-out" colors={colors} icon={<WarningAmberOutlined sx={iconStyle} />} />
       
            <Item title="Attribute" path="/ecom/product/attribute" colors={colors} icon={<TuneOutlined sx={iconStyle} />} />
          </Menu>
        </Collapse>

        {/* Order */}
        <Typography
          variant="h6"
          sx={categorySx("order")}
          onClick={() => toggleCategory("order")}
        >
          <ReceiptLongOutlined />
          {!collapsed ? "Order" : ""}
        </Typography>

        <Collapse in={expandedCategory === "order"}>
          <Menu menuItemStyles={menuStyles}>
            <Item title="All Orders" path="/ecom/order/all" colors={colors} icon={<ReceiptLongOutlined sx={iconStyle} />} />
            <Item title="Completed Orders" path="/ecom/order/completed" colors={colors} icon={<ShoppingCartOutlined sx={iconStyle} />} />
            {/* <Item title="Order Report" path="/ecom/order/report" colors={colors} icon={<BarChartOutlined sx={iconStyle} />} /> */}
            <Item title="POS Management" path="/admin/pos" colors={colors} icon={<PointOfSaleOutlined sx={iconStyle} />} />
          </Menu>
        </Collapse>

        {/* Seller */}
        <Typography
          variant="h6"
          sx={categorySx("seller")}
          onClick={() => toggleCategory("seller")}
        >
          <StorefrontOutlined />
          {!collapsed ? "Seller" : ""}
        </Typography>

        <Collapse in={expandedCategory === "seller"}>
          <Menu menuItemStyles={menuStyles}>
            <Item title="Add Seller" path="/ecom/seller/add" colors={colors} icon={<PersonAddAltOutlined sx={iconStyle} />} />
            <Item title="All Sellers" path="/ecom/seller/all" colors={colors} icon={<StorefrontOutlined sx={iconStyle} />} />
          </Menu>
        </Collapse>

        {/* Customer */}
        <Typography
          variant="h6"
          sx={categorySx("customer")}
          onClick={() => toggleCategory("customer")}
        >
          <PeopleAltOutlined />
          {!collapsed ? "Customer" : ""}
        </Typography>

        <Collapse in={expandedCategory === "customer"}>
          <Menu menuItemStyles={menuStyles}>
            <Item title="Add Customer" path="/ecom/customer/add" colors={colors} icon={<PersonAddAltOutlined sx={iconStyle} />} />
            <Item title="All Customers" path="/ecom/customer/all" colors={colors} icon={<PeopleAltOutlined sx={iconStyle} />} />
          </Menu>
        </Collapse>

        {/* Report */}
        <Typography
          variant="h6"
          sx={categorySx("report")}
          onClick={() => toggleCategory("report")}
        >
          <BarChartOutlined />
          {!collapsed ? "Report" : ""}
        </Typography>

        <Collapse in={expandedCategory === "report"}>
          <Menu menuItemStyles={menuStyles}>
            <Item title="Today Report" path="/ecom/report/today" colors={colors} icon={<TodayOutlined sx={iconStyle} />} />
            <Item title="Month Wise Report" path="/ecom/report/month-wise" colors={colors} icon={<CalendarMonthOutlined sx={iconStyle} />} />
          </Menu>
        </Collapse>

        {/* Delivery */}
        <Typography
          variant="h6"
          sx={categorySx("delivery")}
          onClick={() => toggleCategory("delivery")}
        >
          <LocalShippingOutlined />
          {!collapsed ? "Delivery" : ""}
        </Typography>

        <Collapse in={expandedCategory === "delivery"}>
          <Menu menuItemStyles={menuStyles}>
            <Item title="Add Delivery Man" path="/ecom/delivery/add" colors={colors} icon={<PersonAddAltOutlined sx={iconStyle} />} />
            <Item title="All Delivery Mans" path="/ecom/delivery/all" colors={colors} icon={<DeliveryDiningOutlined sx={iconStyle} />} />
          </Menu>
        </Collapse>

        {/* Media */}
        <Typography
          variant="h6"
          sx={categorySx("media")}
          onClick={() => toggleCategory("media")}
        >
          <PermMediaOutlined />
          {!collapsed ? "Media" : ""}
        </Typography>

        <Collapse in={expandedCategory === "media"}>
          <Menu menuItemStyles={menuStyles}>
            <Item title="Add Banner" path="/ecom/banner/add" colors={colors} icon={<ImageOutlined sx={iconStyle} />} />
            <Item title="All Media" path="/ecom/media/all" colors={colors} icon={<CollectionsOutlined sx={iconStyle} />} />
          </Menu>
        </Collapse>

        {/* Setting */}
        <Typography
          variant="h6"
          sx={categorySx("setting")}
          onClick={() => toggleCategory("setting")}
        >
          <SettingsOutlined />
          {!collapsed ? "Setting" : ""}
        </Typography>
        <Collapse in={expandedCategory === "setting"}>
          <Menu menuItemStyles={menuStyles}>
            <Item title="Website Setting" path="/ecom/setting/website-logo" colors={colors} icon={<LanguageOutlined sx={iconStyle} />} />
            <Item title="Shipping Cost Setting" path="/ecom/setting/shipping-cost" colors={colors} icon={<LocalShippingOutlined sx={iconStyle} />} />
          </Menu>
        </Collapse>
        {/* Accounts */}

        <Typography
          variant="h6"
          sx={categorySx("accounts")}
          onClick={() => toggleCategory("accounts")}
        >
          <AccountBalanceOutlined />
          {!collapsed ? "Accounts" : ""}
        </Typography>
        <Collapse in={expandedCategory === "accounts"}>
          <Menu menuItemStyles={menuStyles}>
            <Item title="Ledgers" path="/ecom/accounts/transactions" colors={colors} icon={<AccountBalanceWalletOutlined sx={iconStyle} />} />
            <Item title="Settlements" path="/ecom/accounts/settlements" colors={colors} icon={<CurrencyExchangeOutlined sx={iconStyle} />} />
          </Menu>
        </Collapse>
      

      </Box>
    </Sidebar>
  );
};

export default SideBar;