import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	Box,
	Paper,
	TextField,
	Button,
	Typography,
	Container,
	CircularProgress,
	InputAdornment,
	IconButton,
	Checkbox,
	FormControlLabel,
	Alert,
	useTheme,
	Divider,
} from "@mui/material";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Visibility from "@mui/icons-material/Visibility";
import LoginIcon from "@mui/icons-material/Login";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import { loginController } from "../../api/controller/admin_controller/user_controller";

const AdminLogin = () => {
	const theme = useTheme();
	const navigate = useNavigate();

	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [password, setPassword] = useState("");
	const [remember, setRemember] = useState(true);
	const [showPw, setShowPw] = useState(false);

	const [loading, setLoading] = useState(false);
	const [errMsg, setErrMsg] = useState("");

	const validate = () => {
		if ((!email && !phone) || !password) return "Please fill in all fields.";
		if (email) {
			const isEmail = /^\S+@\S+\.\S+$/.test(email);
			if (!isEmail) return "Enter a valid email address.";
		}
		if (phone) {
			const isPhone = /^\+?\d{8,15}$/.test(String(phone).replace(/[\s-]/g, ""));
			if (!isPhone) return "Enter a valid phone number.";
		}
		return "";
	};

	const isPhoneInput = (value) => /^\+?\d[\d\s-]*$/.test(value || "");

	const handleLogin = async (e) => {
		e.preventDefault();
		const v = validate();
		if (v) {
			setErrMsg(v);
			return;
		}
		setLoading(true);
		setErrMsg("");

		try {
			const payload = phone ? { phone, password } : { email, password };
			const res = await loginController(payload);

			const ok =
				res?.status === 200 ||
				res?.status === "success" ||
				res?.success === true;

			if (!ok) {
				setErrMsg(res?.message || "Invalid credentials. Please try again.");
			} else {
				const token = res?.token || res?.data?.token || res?.data?.access_token;
				const userId = res?.user?.id || res?.data?.user?.id || res?.data?.id;
				const userType =
					res?.user?.user_type ||
					res?.data?.user?.user_type ||
					res?.data?.user_type;

				if (!token || !userId) {
					setErrMsg("Login succeeded but token/user is missing.");
				} else if (userType !== "admin") {
					setErrMsg("This portal is for admins only.");
				} else {
					if (remember) {
						localStorage.setItem("authToken", token);
						localStorage.setItem("userId", userId);
					} else {
						sessionStorage.setItem("authToken", token);
						sessionStorage.setItem("userId", userId);
					}
					navigate("/admin");
				}
			}
		} catch (err) {
			console.error(err);
			setErrMsg("Something went wrong. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box
			sx={{
				minHeight: "100vh",
				display: "grid",
				placeItems: "center",
				background:
					"radial-gradient(900px 500px at 20% -10%, rgba(64, 98, 255, 0.18), transparent 60%)," +
					"radial-gradient(700px 400px at 90% 0%, rgba(30, 193, 162, 0.18), transparent 60%)," +
					"linear-gradient(180deg, #f6f8ff 0%, #eef2ff 100%)",
				p: 2,
			}}
		>
			<Container maxWidth="xs" disableGutters>
				<Paper
					elevation={6}
					sx={{
						borderRadius: 4,
						overflow: "hidden",
						bgcolor: "background.paper",
						backdropFilter: "blur(10px)",
						border: "1px solid rgba(20, 33, 61, 0.08)",
					}}
				>
					<Box
						sx={{
							px: 3,
							py: 2.8,
							background:
								"linear-gradient(90deg, rgba(37, 80, 202, 0.95) 0%, rgba(47, 189, 158, 0.95) 100%)",
							color: "#fff",
							display: "flex",
							gap: 1.2,
							alignItems: "center",
						}}
					>
						<ShieldOutlinedIcon />
						<Box>
							<Typography
								variant="h5"
								fontWeight={800}
								sx={{ fontFamily: '"Playfair Display", "Georgia", serif' }}
							>
								Admin portal
							</Typography>
							<Typography variant="body2" sx={{ opacity: 0.9 }}>
								Secure access to analytics and operations
							</Typography>
						</Box>
					</Box>

					<Box component="form" onSubmit={handleLogin} sx={{ p: 3 }}>
						{errMsg && (
							<Alert severity="error" sx={{ mb: 2 }}>
								{errMsg}
							</Alert>
						)}

						<TextField
							label="Email or phone"
							type="text"
							value={phone || email}
							onChange={(e) => {
								const v = e.target.value;
								if (!v) {
									setEmail("");
									setPhone("");
									return;
								}
								if (isPhoneInput(v)) {
									setPhone(v);
									setEmail("");
								} else {
									setEmail(v);
									setPhone("");
								}
							}}
							fullWidth
							margin="normal"
							autoComplete="email"
							autoFocus
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<MailOutlineIcon fontSize="small" />
									</InputAdornment>
								),
							}}
						/>

						<TextField
							label="Password"
							type={showPw ? "text" : "password"}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							fullWidth
							margin="normal"
							autoComplete="current-password"
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<LockOutlinedIcon fontSize="small" />
									</InputAdornment>
								),
								endAdornment: (
									<InputAdornment position="end">
										<IconButton
											edge="end"
											onClick={() => setShowPw((s) => !s)}
											aria-label="toggle password visibility"
										>
											{showPw ? <VisibilityOff /> : <Visibility />}
										</IconButton>
									</InputAdornment>
								),
							}}
						/>

						<Box
							sx={{
								mt: 1,
								mb: 2,
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
							}}
						>
							<FormControlLabel
								control={
									<Checkbox
										checked={remember}
										onChange={(e) => setRemember(e.target.checked)}
									/>
								}
								label="Remember me"
							/>
							<Button
								size="small"
								sx={{ textTransform: "none" }}
								onClick={() => navigate("/forgot-password")}
							>
								Forgot password?
							</Button>
						</Box>

						<Button
							type="submit"
							fullWidth
							variant="contained"
							size="large"
							startIcon={!loading && <LoginIcon />}
							disabled={loading}
							sx={{
								py: 1.2,
								fontWeight: 700,
								borderRadius: 2.5,
								textTransform: "none",
								background:
									"linear-gradient(90deg, rgba(37, 80, 202, 0.95) 0%, rgba(47, 189, 158, 0.95) 100%)",
							}}
						>
							{loading ? <CircularProgress size={22} color="inherit" /> : "Sign in"}
						</Button>

						<Divider sx={{ my: 2 }} />

						<Typography variant="body2" sx={{ textAlign: "center", color: "#5b6480" }}>
							For support access, contact your system administrator.
						</Typography>
					</Box>
				</Paper>
			</Container>
		</Box>
	);
};

export default AdminLogin;
