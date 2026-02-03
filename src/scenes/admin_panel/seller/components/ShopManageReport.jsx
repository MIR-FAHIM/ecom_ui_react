import React from "react";
import { Box, Typography } from "@mui/material";

const ShopManageReport = () => {
	return (
		<Box>
			<Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
				Report
			</Typography>
			<Typography variant="body2" color="text.secondary">
				Reports will appear here once connected.
			</Typography>
		</Box>
	);
};

export default ShopManageReport;