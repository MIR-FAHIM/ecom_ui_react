import React from "react";
import { Box, Typography } from "@mui/material";

const ShopManageReviews = () => {
	return (
		<Box>
			<Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
				Reviews
			</Typography>
			<Typography variant="body2" color="text.secondary">
				No reviews data connected yet.
			</Typography>
		</Box>
	);
};

export default ShopManageReviews;