import React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";

const ShopManageProducts = ({ shopId, onOpenShop }) => {
	return (
		<Box>
			<Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
				Products
			</Typography>
			<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
				Open the shop product list to manage items.
			</Typography>
			<Stack direction="row" spacing={1.5}>
				<Button variant="contained" onClick={() => onOpenShop?.(shopId)}>
					View Shop Products
				</Button>
			</Stack>
		</Box>
	);
};

export default ShopManageProducts;