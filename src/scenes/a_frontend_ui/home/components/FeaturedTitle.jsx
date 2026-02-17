import React from "react";
import { Typography } from "@mui/material";

export default function FeaturedTitle({ children, variant = "h5", mb = 2 }) {
  return (
    <Typography variant={variant} fontWeight={800} mb={mb}>
      {children}
    </Typography>
  );
}
