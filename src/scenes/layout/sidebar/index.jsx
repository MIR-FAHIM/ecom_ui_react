import { Box, IconButton, Typography, useTheme, Collapse } from "@mui/material";
import { useContext, useState } from "react";
import { tokens } from "../../../theme";
import { Menu, MenuItem, Sidebar } from "react-pro-sidebar";
import { useNavigate } from "react-router-dom";
import { appname } from '../../../api/config/index';

import {
  MenuOutlined,
  DashboardOutlined,
  LocalShippingOutlined,
  ShoppingCartOutlined,
  PeopleOutlined,
  ReceiptOutlined,
  StorefrontOutlined,
  DeliveryDiningOutlined,
  SettingsOutlined,
  AccountBalanceOutlined,
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

  const iconStyle = {
    color: colors.blueAccent[500],
    transition: ".3s ease",
    ":hover": {
      color: colors.blueAccent[700],
      transform: "scale(1.2)",
    },
  };

  const toggleCategory = (category) => {
    setExpandedCategory((prev) => (prev === category ? null : category));
  };

  return (
    <Sidebar
      backgroundColor={colors.primary[400]}
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
            color: colors.gray[100],
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {!collapsed && (
              <Box display="flex" alignItems="center" gap="12px" sx={{ transition: ".3s ease" }}>
                <img style={{ width: "30px", height: "30px", borderRadius: "8px" }} src={logo} alt="Logo" />
                <Typography variant="h6" fontWeight="bold" textTransform="capitalize" color={colors.blueAccent[500]}>
                  {appname}
                </Typography>
              </Box>
            )}
            <IconButton onClick={() => setCollapsed(!collapsed)}>
              <MenuOutlined />
            </IconButton>
          </Box>
        </MenuItem>
      </Menu>

      <Box mb={5} pl={collapsed ? undefined : "5%"}>
        {/* Dashboard */}
        <Typography
          variant="h6"
          color={colors.gray[300]}
          sx={{
            m: "15px 0 5px 20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            ":hover": {
              color: colors.blueAccent[700],
            },
          }}
          onClick={() => navigate("/admin")}
        >
          <DashboardOutlined sx={iconStyle} />
          {!collapsed ? "Dashboard" : ""}
        </Typography>

        {/* Product */}
        <Typography
          variant="h6"
          color={colors.gray[300]}
          sx={{
            m: "15px 0 5px 20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            ":hover": {
              color: colors.blueAccent[700],
            },
          }}
          onClick={() => toggleCategory("product")}
        >
          <LocalShippingOutlined sx={iconStyle} />
          {!collapsed ? "Product" : ""}
        </Typography>

        <Collapse in={expandedCategory === "product"}>
          <Menu
            menuItemStyles={{
              button: {
                ":hover": {
                  color: "#868dfb",
                  background: "transparent",
                  transition: ".4s ease",
                },
              },
            }}
          >
            <Item title="Add Product" path="/ecom/product/add" colors={colors} icon={<LocalShippingOutlined sx={iconStyle} />} />
            <Item title="All Products" path="/ecom/product/all" colors={colors} icon={<LocalShippingOutlined sx={iconStyle} />} />
            <Item title="Stock Out Products" path="/ecom/product/stock-out" colors={colors} icon={<LocalShippingOutlined sx={iconStyle} />} />
            <Item title="Seller Products" path="/ecom/product/seller" colors={colors} icon={<LocalShippingOutlined sx={iconStyle} />} />
            <Item title="Attribute" path="/ecom/product/attribute" colors={colors} icon={<LocalShippingOutlined sx={iconStyle} />} />
          </Menu>
        </Collapse>

        {/* Order */}
        <Typography
          variant="h6"
          color={colors.gray[300]}
          sx={{
            m: "15px 0 5px 20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            ":hover": {
              color: colors.blueAccent[700],
            },
          }}
          onClick={() => toggleCategory("order")}
        >
          <ShoppingCartOutlined sx={iconStyle} />
          {!collapsed ? "Order" : ""}
        </Typography>

        <Collapse in={expandedCategory === "order"}>
          <Menu
            menuItemStyles={{
              button: {
                ":hover": {
                  color: "#868dfb",
                  background: "transparent",
                  transition: ".4s ease",
                },
              },
            }}
          >
            <Item title="All Orders" path="/ecom/order/all" colors={colors} icon={<ShoppingCartOutlined sx={iconStyle} />} />
            <Item title="Completed Orders" path="/ecom/order/completed" colors={colors} icon={<ShoppingCartOutlined sx={iconStyle} />} />
            <Item title="Order Report" path="/ecom/order/report" colors={colors} icon={<ReceiptOutlined sx={iconStyle} />} />
          </Menu>
        </Collapse>

        {/* Seller */}
        <Typography
          variant="h6"
          color={colors.gray[300]}
          sx={{
            m: "15px 0 5px 20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            ":hover": {
              color: colors.blueAccent[700],
            },
          }}
          onClick={() => toggleCategory("seller")}
        >
          <StorefrontOutlined sx={iconStyle} />
          {!collapsed ? "Seller" : ""}
        </Typography>

        <Collapse in={expandedCategory === "seller"}>
          <Menu
            menuItemStyles={{
              button: {
                ":hover": {
                  color: "#868dfb",
                  background: "transparent",
                  transition: ".4s ease",
                },
              },
            }}
          >
            <Item title="Add Seller" path="/ecom/seller/add" colors={colors} icon={<StorefrontOutlined sx={iconStyle} />} />
            <Item title="All Sellers" path="/ecom/seller/all" colors={colors} icon={<StorefrontOutlined sx={iconStyle} />} />
          </Menu>
        </Collapse>

        {/* Customer */}
        <Typography
          variant="h6"
          color={colors.gray[300]}
          sx={{
            m: "15px 0 5px 20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            ":hover": {
              color: colors.blueAccent[700],
            },
          }}
          onClick={() => toggleCategory("customer")}
        >
          <PeopleOutlined sx={iconStyle} />
          {!collapsed ? "Customer" : ""}
        </Typography>

        <Collapse in={expandedCategory === "customer"}>
          <Menu
            menuItemStyles={{
              button: {
                ":hover": {
                  color: "#868dfb",
                  background: "transparent",
                  transition: ".4s ease",
                },
              },
            }}
          >
            <Item title="Add Customer" path="/ecom/customer/add" colors={colors} icon={<PeopleOutlined sx={iconStyle} />} />
            <Item title="All Customers" path="/ecom/customer/all" colors={colors} icon={<PeopleOutlined sx={iconStyle} />} />
          </Menu>
        </Collapse>

        {/* Report */}
        <Typography
          variant="h6"
          color={colors.gray[300]}
          sx={{
            m: "15px 0 5px 20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            ":hover": {
              color: colors.blueAccent[700],
            },
          }}
          onClick={() => toggleCategory("report")}
        >
          <ReceiptOutlined sx={iconStyle} />
          {!collapsed ? "Report" : ""}
        </Typography>

        <Collapse in={expandedCategory === "report"}>
          <Menu
            menuItemStyles={{
              button: {
                ":hover": {
                  color: "#868dfb",
                  background: "transparent",
                  transition: ".4s ease",
                },
              },
            }}
          >
            <Item title="Today Report" path="/ecom/report/today" colors={colors} icon={<ReceiptOutlined sx={iconStyle} />} />
            <Item title="Month Wise Report" path="/ecom/report/month-wise" colors={colors} icon={<ReceiptOutlined sx={iconStyle} />} />
          </Menu>
        </Collapse>

        {/* Delivery */}
        <Typography
          variant="h6"
          color={colors.gray[300]}
          sx={{
            m: "15px 0 5px 20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            ":hover": {
              color: colors.blueAccent[700],
            },
          }}
          onClick={() => toggleCategory("delivery")}
        >
          <DeliveryDiningOutlined sx={iconStyle} />
          {!collapsed ? "Delivery" : ""}
        </Typography>

        <Collapse in={expandedCategory === "delivery"}>
          <Menu
            menuItemStyles={{
              button: {
                ":hover": {
                  color: "#868dfb",
                  background: "transparent",
                  transition: ".4s ease",
                },
              },
            }}
          >
            <Item title="Add Delivery Man" path="/ecom/delivery/add" colors={colors} icon={<DeliveryDiningOutlined sx={iconStyle} />} />
            <Item title="All Delivery Mans" path="/ecom/delivery/all" colors={colors} icon={<DeliveryDiningOutlined sx={iconStyle} />} />
          </Menu>
        </Collapse>

                {/* Banner */}
        <Typography
          variant="h6"
          color={colors.gray[300]}
          sx={{
            m: "15px 0 5px 20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            ":hover": {
              color: colors.blueAccent[700],
            },
          }}
          onClick={() => toggleCategory("media")}
        >
          <DeliveryDiningOutlined sx={iconStyle} />
          {!collapsed ? "Media" : ""}
        </Typography>

        <Collapse in={expandedCategory === "media"}>
          <Menu
            menuItemStyles={{
              button: {
                ":hover": {
                  color: "#868dfb",
                  background: "transparent",
                  transition: ".4s ease",
                },
              },
            }}
          >
            <Item title="Add Banner" path="/ecom/banner/add" colors={colors} icon={<DeliveryDiningOutlined sx={iconStyle} />} />
            <Item title="All Media" path="/ecom/media/all" colors={colors} icon={<DeliveryDiningOutlined sx={iconStyle} />} />
           
          </Menu>
        </Collapse>

        {/* Setting */}
        <Typography
          variant="h6"
          color={colors.gray[300]}
          sx={{
            m: "15px 0 5px 20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            ":hover": {
              color: colors.blueAccent[700],
            },
          }}
          onClick={() => navigate("/ecom/setting")}
        >
          <SettingsOutlined sx={iconStyle} />
          {!collapsed ? "Setting" : ""}
        </Typography>

        {/* Accounts */}
        <Typography
          variant="h6"
          color={colors.gray[300]}
          sx={{
            m: "15px 0 5px 20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            ":hover": {
              color: colors.blueAccent[700],
            },
          }}
          onClick={() => navigate("/ecom/accounts/transactions")}
        >
          <AccountBalanceOutlined sx={iconStyle} />
          {!collapsed ? "Accounts" : ""}
        </Typography>

      </Box>
    </Sidebar>
  );
};

export default SideBar;