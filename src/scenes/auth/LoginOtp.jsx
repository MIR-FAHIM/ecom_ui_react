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
	Alert,
	useTheme,
	Stack,
	Divider,
} from "@mui/material";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import SmsIcon from "@mui/icons-material/Sms";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { sendOtp } from "../../api/controller/admin_controller/website_setting/website_setting_controller";
import { loginWithOtpController } from "../../api/controller/admin_controller/user_controller";

const LoginOtp = () => {
	const theme = useTheme();
	const navigate = useNavigate();

	const [phone, setPhone] = useState("");
	const [otp, setOtp] = useState("");
	const [otpSent, setOtpSent] = useState(false);
	const [loadingSend, setLoadingSend] = useState(false);
	const [loadingVerify, setLoadingVerify] = useState(false);
	const [errMsg, setErrMsg] = useState("");
	const [successMsg, setSuccessMsg] = useState("");

	const isValidPhone = (value) => /^\+?\d{8,15}$/.test(String(value || "").replace(/[\s-]/g, ""));

	const handleSendOtp = async (e) => {
		e.preventDefault();
		setErrMsg("");
		setSuccessMsg("");

		if (!phone || !isValidPhone(phone)) {
			setErrMsg("Enter a valid mobile number.");
			return;
		}

		setLoadingSend(true);
		try {
			const payload =  { receiver: phone , remove_duplicate: true };
			const res = await sendOtp(payload);
			const ok = res?.status === 200 || res?.status === "success" || res?.success === true;

			if (!ok) {
				setErrMsg(res?.message || "Failed to send OTP.");
			} else {
				setOtpSent(true);
				setSuccessMsg(res?.message || "OTP sent to your mobile number.");
			}
		} catch (err) {
			console.error(err);
			setErrMsg("Something went wrong. Please try again.");
		} finally {
			setLoadingSend(false);
		}
	};

	const handleVerifyOtp = async (e) => {
		e.preventDefault();
		setErrMsg("");
		setSuccessMsg("");

		if (!phone || !isValidPhone(phone)) {
			setErrMsg("Enter a valid mobile number.");
			return;
		}
		if (!otp) {
			setErrMsg("Enter the OTP.");
			return;
		}

		setLoadingVerify(true);
		try {
			const payload = { mobile_number: phone, otp: otp };
			const res = await loginWithOtpController(payload);
           
			const ok = res?.status === 200 || res?.status === "success" || res?.success === true;
			const apiMessage = res?.message || res?.data?.message;

			if (!ok) {
				if (apiMessage === "User not found") {
                    setErrMsg(apiMessage || "Invalid OTP. Please try again.");
					navigate("/signup");
					return;
				}
				setErrMsg(apiMessage || "Invalid OTP. Please try again.");
			} else {
				const token = res?.token || res?.data?.token || res?.data?.access_token;
				const userId = res?.user?.id || res?.data?.user?.id || res?.data?.id;

				if (!token || !userId) {
					setErrMsg("Login succeeded but token/user is missing.");
				} else {
					localStorage.setItem("authToken", token);
					localStorage.setItem("userId", userId);
					navigate("/");
				}
			}
		} catch (err) {
            if (err.response?.data?.message === "User not found") {
                    setErrMsg(err.response?.data?.message || "User not found.");
					  navigate("/register", { state: { phoneNumber: phone } });
                      return;
					
				}
			console.error(err);
			setErrMsg("Something went wrong. Please try again.");
		} finally {
			setLoadingVerify(false);
		}
	};

	return (
		<Box
			sx={{
				minHeight: "100vh",
				display: "grid",
				placeItems: "center",
				background: `radial-gradient(1200px 600px at 10% -10%, ${
					theme.palette.mode === "dark" ? "rgba(58,134,255,0.10)" : "rgba(58,134,255,0.16)"
				}, transparent 60%),
				linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.background.default} 100%)`,
				p: 2,
			}}
		>
			<Container maxWidth="xs" disableGutters>
				<Paper
					elevation={6}
					sx={{
						borderRadius: 3,
						overflow: "hidden",
						bgcolor: "background.paper",
						backdropFilter: "blur(8px)",
						border: `1px solid ${theme.palette.divider}`,
						p: 3,
					}}
				>
					<Stack spacing={1} sx={{ mb: 2 }}>
						<Typography variant="h5" fontWeight={900}>
							Login with OTP
						</Typography>
						<Typography variant="body2" color="text.secondary" fontWeight={600}>
							Enter your mobile number to receive an OTP.
						</Typography>
					</Stack>

					{errMsg && (
						<Alert severity="error" sx={{ mb: 2 }}>
							{errMsg}
						</Alert>
					)}
					{successMsg && (
						<Alert severity="success" sx={{ mb: 2 }}>
							{successMsg}
						</Alert>
					)}

					<Stack spacing={1.5} component="form" onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
						<TextField
							label="Mobile Number"
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							fullWidth
							size="small"
							placeholder="e.g. 017XXXXXXXX"
							InputProps={{
								startAdornment: <PhoneIphoneIcon sx={{ mr: 1, color: "text.secondary" }} />,
							}}
						/>

						{otpSent && (
							<TextField
								label="OTP"
								value={otp}
								onChange={(e) => setOtp(e.target.value)}
								fullWidth
								size="small"
								placeholder="Enter OTP"
								InputProps={{
									startAdornment: <SmsIcon sx={{ mr: 1, color: "text.secondary" }} />,
								}}
							/>
						)}

						<Stack spacing={1}>
							{!otpSent ? (
								<Button
									type="submit"
									variant="contained"
									disabled={loadingSend}
									startIcon={loadingSend ? null : <SmsIcon />}
									sx={{
										textTransform: "none",
										fontWeight: 800,
										borderRadius: 999,
									}}
								>
									{loadingSend ? <CircularProgress size={18} /> : "Send OTP"}
								</Button>
							) : (
								<Button
									type="submit"
									variant="contained"
									disabled={loadingVerify}
									startIcon={loadingVerify ? null : <CheckCircleOutlineIcon />}
									sx={{
										textTransform: "none",
										fontWeight: 800,
										borderRadius: 999,
									}}
								>
									{loadingVerify ? <CircularProgress size={18} /> : "Verify OTP"}
								</Button>
							)}

							{otpSent && (
								<>
									<Divider />
									<Button
										variant="outlined"
										onClick={() => {
											setOtpSent(false);
											setOtp("");
											setErrMsg("");
											setSuccessMsg("");
										}}
										sx={{ textTransform: "none", fontWeight: 700, borderRadius: 999 }}
									>
										Change number
									</Button>
								</>
							)}
						</Stack>
					</Stack>
				</Paper>
			</Container>
		</Box>
	);
};

export default LoginOtp;
