import React from "react";
import { Typography } from "@mui/material";

export default function FeaturedTitle({ children }) {
  return (
    <Typography variant="h5" fontWeight={700} mb={2}>
      {children}
    </Typography>
  );
}
