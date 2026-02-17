import React, { useEffect, useMemo, useState } from "react";
import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	Checkbox,
	CircularProgress,
	Divider,
	FormControlLabel,
	FormGroup,
	Grid,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Typography,
	useTheme,
	Paper,
} from "@mui/material";
import { tokens } from "../../../theme";
import { addBankAccount, getBankAccount } from "../../../api/controller/admin_controller/transaction/transaction_controller.jsx";

const normalizeList = (x) => {
	if (!x) return [];
	if (Array.isArray(x)) return x;
	if (Array.isArray(x?.data)) return x.data;
	if (Array.isArray(x?.data?.data)) return x.data.data;
	if (Array.isArray(x?.data?.data?.data)) return x.data.data.data;
	const inner = x?.data ?? x;
	if (inner && typeof inner === "object") return [inner];
	return [];
};

const SellerBankAccount = () => {
	const theme = useTheme();
	const colors = tokens(theme.palette.mode);
	const userId = useMemo(() => localStorage.getItem("userId") || "", []);

	const [form, setForm] = useState({
		user_id: userId,
		bank_name: "",
		account_name: "",
		account_no: "",
		type: "bank",
		address: "",
		route: "",
	});

	const [rows, setRows] = useState([]);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const loadAccounts = async () => {
		if (!userId) return;
		setLoading(true);
		setError("");
		try {
			const res = await getBankAccount(userId);
			const list = normalizeList(res);
			setRows(list);
		} catch (e) {
			console.error("Failed to load bank accounts", e);
			setRows([]);
			setError("Failed to load bank accounts.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (userId) setForm((prev) => ({ ...prev, user_id: userId }));
		loadAccounts();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userId]);

	const update = (patch) => setForm((prev) => ({ ...prev, ...patch }));

	const validate = () => {
		if (!form.user_id) return "User ID is required";
		if (!form.bank_name.trim()) return "Bank name is required";
		if (!form.account_name.trim()) return "Account name is required";
		if (!form.account_no.trim()) return "Account number is required";
		if (!form.type.trim()) return "Type is required";
		return "";
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const validationError = validate();
		if (validationError) {
			setError(validationError);
			setSuccess("");
			return;
		}

		setSaving(true);
		setError("");
		setSuccess("");

		try {
			const fd = new FormData();
			fd.append("user_id", form.user_id);
			fd.append("bank_name", form.bank_name);
			fd.append("account_name", form.account_name);
			fd.append("account_no", form.account_no);
			fd.append("type", form.type);
			fd.append("address", form.address || "");
			fd.append("route", form.route || "");

			const res = await addBankAccount(fd);
			if (res?.status === "success") {
				setSuccess(res?.message || "Bank account added successfully.");
				setForm((prev) => ({
					...prev,
					bank_name: "",
					account_name: "",
					account_no: "",
					address: "",
					route: "",
				}));
				await loadAccounts();
			} else {
				setError(res?.message || "Failed to add bank account.");
			}
		} catch (e) {
			console.error("Failed to add bank account", e);
			setError(e?.message || "Failed to add bank account.");
		} finally {
			setSaving(false);
		}
	};

	return (
		<Box sx={{ p: { xs: 2, md: 3 } }}>
			<Box sx={{ mb: 2 }}>
				<Typography variant="h4" sx={{ fontWeight: 900 }}>
					Bank Accounts
				</Typography>
				<Typography variant="body2" sx={{ color: colors.gray[300] }}>
					Add and manage your payout bank accounts.
				</Typography>
			</Box>

			<Grid container spacing={2}>
				<Grid item xs={12} md={5}>
					<Card sx={{ background: colors.primary[400], borderRadius: 2, border: `1px solid ${colors.primary[500]}` }}>
						<CardContent>
							<Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
								Add Bank Account
							</Typography>
							<Divider sx={{ mb: 2, opacity: 0.2 }} />

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

							<Box component="form" onSubmit={handleSubmit}>
								<Grid container spacing={2}>
									<Grid item xs={12}>
										<TextField
											fullWidth
											size="small"
											label="Bank Name"
											value={form.bank_name}
											onChange={(e) => update({ bank_name: e.target.value })}
										/>
									</Grid>
									<Grid item xs={12}>
										<TextField
											fullWidth
											size="small"
											label="Account Name"
											value={form.account_name}
											onChange={(e) => update({ account_name: e.target.value })}
										/>
									</Grid>
									<Grid item xs={12}>
										<TextField
											fullWidth
											size="small"
											label="Account Number"
											value={form.account_no}
											onChange={(e) => update({ account_no: e.target.value })}
										/>
									</Grid>
									<Grid item xs={12} sm={6}>
										<Box>
											<Typography variant="caption" sx={{ color: colors.gray[300], fontWeight: 700 }}>
												Type
											</Typography>
											<FormGroup row>
												<FormControlLabel
													control={
														<Checkbox
															checked={form.type === "bank"}
															onChange={() => update({ type: "bank" })}
																sx={{ color: colors.gray[300], "&.Mui-checked": { color: colors.blueAccent[500] } }}
														/>
													}
													label="Bank"
												/>
												<FormControlLabel
													control={
														<Checkbox
															checked={form.type === "mfs"}
															onChange={() => update({ type: "mfs" })}
																sx={{ color: colors.gray[300], "&.Mui-checked": { color: colors.blueAccent[500] } }}
														/>
													}
													label="MFS"
												/>
											</FormGroup>
										</Box>
									</Grid>
										{form.type !== "mfs" ? (
											<>
												<Grid item xs={12} sm={6}>
													<TextField
														fullWidth
														size="small"
														label="Route"
														value={form.route}
														onChange={(e) => update({ route: e.target.value })}
													/>
												</Grid>
												<Grid item xs={12}>
													<TextField
														fullWidth
														size="small"
														label="Address"
														value={form.address}
														onChange={(e) => update({ address: e.target.value })}
													/>
												</Grid>
											</>
										) : null}
								</Grid>

								<Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
									<Button
										type="submit"
										variant="contained"
										disabled={saving}
										startIcon={saving ? <CircularProgress size={18} /> : null}
										sx={{ textTransform: "none", fontWeight: 800 }}
									>
										{saving ? "Saving..." : "Add Account"}
									</Button>
								</Box>
							</Box>
						</CardContent>
					</Card>
				</Grid>

				<Grid item xs={12} md={7}>
					<Card sx={{ background: colors.primary[400], borderRadius: 2, border: `1px solid ${colors.primary[500]}` }}>
						<CardContent>
							<Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
								Saved Accounts
							</Typography>
							<Divider sx={{ mb: 2, opacity: 0.2 }} />

							{loading ? (
								<Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
									<CircularProgress size={24} />
								</Box>
							) : rows.length === 0 ? (
								<Typography variant="body2" sx={{ color: colors.gray[300] }}>
									No bank accounts found.
								</Typography>
							) : (
								<TableContainer component={Paper} sx={{ background: colors.primary[400], boxShadow: "none" }}>
									<Table stickyHeader>
										<TableHead>
											<TableRow>
												{["Bank", "Account", "Number", "Type", "Route", "Address"].map((header) => (
													<TableCell
														key={header}
														sx={{
															background: colors.primary[500],
															color: colors.gray[100],
															fontWeight: 800,
														}}
													>
														{header}
													</TableCell>
												))}
											</TableRow>
										</TableHead>
										<TableBody>
											{rows.map((row, idx) => (
												<TableRow key={row?.id ?? idx} hover>
													<TableCell>{row?.bank_name || "-"}</TableCell>
													<TableCell>{row?.account_name || "-"}</TableCell>
													<TableCell>{row?.account_no || "-"}</TableCell>
													<TableCell>{row?.type || "-"}</TableCell>
													<TableCell>{row?.route || "-"}</TableCell>
													<TableCell>{row?.address || "-"}</TableCell>
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
	);
};

export default SellerBankAccount;
