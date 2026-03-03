/* eslint-disable react/prop-types */
import { MenuItem } from "react-pro-sidebar";
import { Link, useLocation } from "react-router-dom";

const Item = ({ title, path, icon }) => {
  const location = useLocation();
  const isActive = path === location.pathname;
  return (
    <MenuItem
      component={<Link to={path} />}
      to={path}
      icon={icon}
      active={isActive}
      rootStyles={{
        color: isActive ? "#ffffff" : "#d6d9f0",
        backgroundColor: isActive ? "rgba(139,92,246,0.18)" : "transparent",
        borderRadius: "10px",
        margin: "4px 12px",
      }}
    >
      {title}
    </MenuItem>
  );
};

export default Item;
