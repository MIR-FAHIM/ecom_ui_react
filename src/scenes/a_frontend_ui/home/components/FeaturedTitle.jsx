import React from "react";
import { Typography } from "@mui/material";

export default function FeaturedTitle({ children, variant = "h4", mb = 1.5 }) {
  return (
    <Typography
      variant={variant}
      sx={{
        fontWeight: 700,
        mb,
        letterSpacing: "-0.02em",
        lineHeight: 1.3,
      }}
    >
      {children}
    </Typography>
  );
}
