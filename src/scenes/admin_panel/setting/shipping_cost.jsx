
import React, { useEffect, useMemo, useState } from "react";
import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	CircularProgress,
	Divider,
	FormControlLabel,
	Grid,
	Switch,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Typography,
	useTheme,
} from "@mui/material";

import { tokens } from "../../../theme";
import { getShippingCosts, setShippingCosts } from "../../../api/controller/admin_controller/delivery/delivery_controller";

const safeArray = (x) => (Array.isArray(x) ? x : []);

const ShippingCostSetting = () => {
	const theme = useTheme();
	const colors = tokens(theme.palette.mode);

	const [form, setForm] = useState({
		shipping_cost: "",
		is_shop_wise: false,
		is_distance_wise: false,
		is_product_wise: false,
		per_shop_cost: "",
		status: "active",
	});
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const tableItems = useMemo(() => safeArray(items), [items]);

	const update = (patch) => setForm((prev) => ({ ...prev, ...patch }));

	const load = async () => {
		setLoading(true);
		setError("");
		try {
			const res = await getShippingCosts();
			const payload = res?.data ?? res;
			const list = payload?.data ?? payload ?? [];
			setItems(safeArray(list));
		} catch (e) {
			console.error("Failed to load shipping costs", e);
			setItems([]);
			setError("Failed to load shipping costs.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		load();
	}, []);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSaving(true);
		setError("");
		setSuccess("");
		try {
			const fd = new FormData();
			fd.append("shipping_cost", form.shipping_cost || "");
			fd.append("is_shop_wise", form.is_shop_wise ? "1" : "0");
			fd.append("is_distance_wise", form.is_distance_wise ? "1" : "0");
			fd.append("is_product_wise", form.is_product_wise ? "1" : "0");
			fd.append("per_shop_cost", form.per_shop_cost || "");
			fd.append("status", form.status || "");

			const res = await setShippingCosts(fd);
			if (res?.status === "success") {
				setSuccess(res?.message || "Shipping cost saved.");
				setForm((prev) => ({
					...prev,
					shipping_cost: "",
					per_shop_cost: "",
				}));
				await load();
			} else {
				setError(res?.message || "Failed to save shipping cost.");
			}
		} catch (e) {
			setError(e?.message || "Failed to save shipping cost.");
		} finally {
			setSaving(false);
		}
	};

	const cardSx = {
		background: colors.primary[400],
		borderRadius: 3,
		border: `1px solid ${theme.palette.divider}`,
	};

	const actionButtonSx = {
		textTransform: "none",
		fontWeight: 800,
		backgroundColor: colors.blueAccent[500],
		color: colors.gray[100],
		"&:hover": {
			backgroundColor: colors.blueAccent[600],
		},
	};

	return (
		<Box
			sx={{
				minHeight: "100vh",
				background: theme.palette.background?.default || colors.primary[500],
				py: 3,
			}}
		>
			<Box sx={{ px: { xs: 2, md: 3 } }}>
				<Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5 }}>
					Shipping Cost Settings
				</Typography>
				<Typography variant="body2" sx={{ color: colors.gray[300], mb: 2 }}>
					Add a shipping cost configuration and view existing rules.
				</Typography>

				{success ? (
					<Alert severity="success" sx={{ mb: 2 }}>
						{success}
					</Alert>
				) : null}
				{error ? (
					<Alert severity="error" sx={{ mb: 2 }}>
						{error}
					</Alert>
				) : null}

				<Grid container spacing={2}>
					<Grid item xs={12} lg={5}>
						<Card sx={cardSx}>
							<CardContent>
								<Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
									Add Shipping Cost
								</Typography>
								<Divider sx={{ mb: 2, opacity: 0.2 }} />
								<Box component="form" onSubmit={handleSubmit}>
									<Grid container spacing={2}>
										<Grid item xs={12}>
											<TextField
												label="Shipping Cost"
												fullWidth
												type="number"
												size="small"
												value={form.shipping_cost}
												onChange={(e) => update({ shipping_cost: e.target.value })}
											/>
										</Grid>

										<Grid item xs={12}>
											<TextField
												label="Per Shop Cost"
												fullWidth
												type="number"
												size="small"
												value={form.per_shop_cost}
												onChange={(e) => update({ per_shop_cost: e.target.value })}
											/>
										</Grid>

										<Grid item xs={12}>
											<TextField
												label="Status"
												fullWidth
												size="small"
												value={form.status}
												onChange={(e) => update({ status: e.target.value })}
											/>
										</Grid>

										<Grid item xs={12}>
											<FormControlLabel
												control={<Switch checked={form.is_shop_wise} onChange={(e) => update({ is_shop_wise: e.target.checked })} />}
												label="Shop-wise shipping"
											/>
											<FormControlLabel
												control={<Switch checked={form.is_distance_wise} onChange={(e) => update({ is_distance_wise: e.target.checked })} />}
												label="Distance-wise shipping"
											/>
											<FormControlLabel
												control={<Switch checked={form.is_product_wise} onChange={(e) => update({ is_product_wise: e.target.checked })} />}
												label="Product-wise shipping"
											/>
										</Grid>

										<Grid item xs={12}>
											<Button
												type="submit"
												variant="contained"
												disabled={saving}
												sx={actionButtonSx}
											>
												{saving ? <CircularProgress size={18} /> : "Save Shipping Cost"}
											</Button>
										</Grid>
									</Grid>
								</Box>
							</CardContent>
						</Card>
					</Grid>

					<Grid item xs={12} lg={7}>
						<Card sx={cardSx}>
							<CardContent>
								<Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
									Shipping Costs
								</Typography>
								<Divider sx={{ mb: 2, opacity: 0.2 }} />

								{loading ? (
									<Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
										<CircularProgress />
									</Box>
								) : tableItems.length === 0 ? (
									<Typography variant="body2" sx={{ color: colors.gray[300] }}>
										No shipping costs found.
									</Typography>
								) : (
									<TableContainer>
										<Table size="small">
											<TableHead>
												<TableRow>
													<TableCell>Shipping Cost</TableCell>
													<TableCell>Per Shop</TableCell>
													<TableCell>Shop-wise</TableCell>
													<TableCell>Distance-wise</TableCell>
													<TableCell>Product-wise</TableCell>
													<TableCell>Status</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{tableItems.map((row, idx) => (
													<TableRow key={row?.id ?? idx}>
														<TableCell>{row?.shipping_cost ?? "-"}</TableCell>
														<TableCell>{row?.per_shop_cost ?? "-"}</TableCell>
														<TableCell>{row?.is_shop_wise ? "Yes" : "No"}</TableCell>
														<TableCell>{row?.is_distance_wise ? "Yes" : "No"}</TableCell>
														<TableCell>{row?.is_product_wise ? "Yes" : "No"}</TableCell>
														<TableCell>{row?.status ?? "-"}</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</TableContainer>
								)}
							</CardContent>
						</Card>
					</Grid>
				</Grid>
			</Box>
		</Box>
	);
};

export default ShippingCostSetting;
