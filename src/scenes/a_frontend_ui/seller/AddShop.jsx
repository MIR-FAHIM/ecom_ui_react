import React, { useMemo, useState } from "react";
import {
	Box,
	Button,
	Card,
	CardContent,
	Container,
	Divider,
	Grid,
	TextField,
	Typography,
	Alert,
	CircularProgress,
	useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../../theme";
import { addShop } from "../../../api/controller/admin_controller/shop/shop_controller.jsx";

const AddShop = () => {
	const theme = useTheme();
	const colors = tokens(theme.palette.mode);
	const navigate = useNavigate();

	const defaultUserId = useMemo(() => {
		const u = localStorage.getItem("userId");
		return u ? String(u) : "";
	}, []);

	const [form, setForm] = useState({
		user_id: defaultUserId || "",
		name: "",
		slug: "",
		description: "",
		phone: "",
		email: "",
	});

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const update = (patch) => setForm((prev) => ({ ...prev, ...patch }));

	const validate = () => {
		if (!form.user_id) return "User ID is required";
		if (!form.name.trim()) return "Shop name is required";
		if (!form.slug.trim()) return "Slug is required";
		if (!form.description.trim()) return "Description is required";
		if (!form.phone.trim()) return "Phone is required";
		if (!form.email.trim()) return "Email is required";
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

		setLoading(true);
		setError("");
		setSuccess("");
		try {
			const fd = new FormData();
			fd.append("user_id", localStorage.getItem("userId"));
			fd.append("name", form.name);
			fd.append("slug", form.slug);
			fd.append("description", form.description);
			fd.append("phone", form.phone);
			fd.append("email", form.email);

			const res = await addShop(fd);
			if (res?.status === "success") {
				setSuccess(res?.message || "Shop created successfully");
				setForm((prev) => ({
					...prev,
					name: "",
					slug: "",
					description: "",
					phone: "",
					email: "",
				}));
			} else {
				setError(res?.message || "Failed to create shop");
			}
		} catch (err) {
			setError(err?.message || "Failed to create shop");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box
			sx={{
				minHeight: "100vh",
				background: theme.palette.background?.default || colors.primary[500],
				py: 3,
			}}
		>
			<Container maxWidth="sm">
				<Card sx={{ background: colors.primary[400], borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
					<CardContent>
						<Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
							<Typography variant="h5" sx={{ fontWeight: 900 }}>
								Create Shop
							</Typography>
							<Button variant="outlined" onClick={() => navigate(-1)} disabled={loading}>
								Back
							</Button>
						</Box>

						<Typography variant="body2" sx={{ color: colors.gray[300], mt: 0.5, fontWeight: 700 }}>
							Fill the details and create a shop.
						</Typography>

						<Divider sx={{ my: 2, opacity: 0.2 }} />

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
										label="Shop Name"
										value={form.name}
										onChange={(e) => update({ name: e.target.value })}
									/>
								</Grid>

								<Grid item xs={12}>
									<TextField
										fullWidth
										size="small"
										label="Slug"
										value={form.slug}
										onChange={(e) => update({ slug: e.target.value })}
									/>
								</Grid>

								<Grid item xs={12}>
									<TextField
										fullWidth
										size="small"
										label="Description"
										multiline
										minRows={3}
										value={form.description}
										onChange={(e) => update({ description: e.target.value })}
									/>
								</Grid>

								<Grid item xs={12} sm={6}>
									<TextField
										fullWidth
										size="small"
										label="Phone"
										value={form.phone}
										onChange={(e) => update({ phone: e.target.value })}
									/>
								</Grid>

								<Grid item xs={12} sm={6}>
									<TextField
										fullWidth
										size="small"
										label="Email"
										type="email"
										value={form.email}
										onChange={(e) => update({ email: e.target.value })}
									/>
								</Grid>
							</Grid>

							<Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 1.2 }}>
								<Button variant="outlined" onClick={() => navigate(-1)} disabled={loading}>
									Cancel
								</Button>
								<Button
									type="submit"
									variant="contained"
									disabled={loading}
									startIcon={loading ? <CircularProgress size={18} /> : null}
									sx={{
										fontWeight: 900,
										textTransform: "none",
										background: theme.palette.secondary.main,
										color: colors.gray[900],
										boxShadow: "none",
										"&:hover": { opacity: 0.92, boxShadow: "none" },
									}}
								>
									{loading ? "Creating..." : "Create Shop"}
								</Button>
							</Box>
						</Box>
					</CardContent>
				</Card>
			</Container>
		</Box>
	);
};

export default AddShop;
