
import React, { useMemo, useState } from "react";
import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	CircularProgress,
	Divider,
	Grid,
	Rating,
	TextField,
	Typography,
	useTheme,
} from "@mui/material";

import { tokens } from "../../../theme";
import { addReview } from "../../../api/controller/admin_controller/review/review_controller";

const ProductReviewForm = ({ productId, userId: userIdProp, status: statusProp = 1, onSuccess }) => {
	const theme = useTheme();
	const colors = tokens(theme.palette.mode);

	const userId = useMemo(() => {
		if (userIdProp) return String(userIdProp);
		const stored = localStorage.getItem("userId");
		return stored ? String(stored) : "";
	}, [userIdProp]);

	const [comment, setComment] = useState("");
	const [starCount, setStarCount] = useState(5);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const validate = () => {
		if (!productId) return "Product ID is required";
		if (!userId) return "User ID is required";
		if (!comment.trim()) return "Comment is required";
		if (!starCount || Number(starCount) < 1) return "Rating is required";
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
			fd.append("user_id", String(userId));
			fd.append("product_id", String(productId));
			fd.append("comment", comment.trim());
			fd.append("star_count", String(starCount));
			fd.append("status", String(statusProp));

			const res = await addReview(fd);
			const payload = res?.data ?? res;
			if (payload?.status === "success") {
				setSuccess(payload?.message || "Review submitted successfully");
				setComment("");
				setStarCount(5);
				onSuccess?.(payload);
			} else {
				setError(payload?.message || "Failed to submit review");
			}
		} catch (err) {
			setError(err?.message || "Failed to submit review");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card
			sx={{
				background: colors.primary[400],
				borderRadius: 3,
				border: `1px solid ${theme.palette.divider}`,
			}}
		>
			<CardContent>
				<Typography variant="h5" sx={{ fontWeight: 900 }}>
					Write a review
				</Typography>
				<Typography variant="body2" sx={{ color: colors.gray[300], mt: 0.5 }}>
					Share your experience with this product.
				</Typography>

				<Divider sx={{ my: 2, opacity: 0.25 }} />

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
							<Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 700 }}>
								Rating
							</Typography>
							<Rating
								value={Number(starCount)}
								onChange={(_, value) => setStarCount(value || 1)}
								size="large"
							/>
						</Grid>

						<Grid item xs={12}>
							<TextField
								fullWidth
								multiline
								minRows={4}
								label="Comment"
								value={comment}
								onChange={(e) => setComment(e.target.value)}
								size="small"
								required
							/>
						</Grid>

						<Grid item xs={12}>
							<Button
								type="submit"
								variant="contained"
								disabled={loading}
								sx={{ textTransform: "none", fontWeight: 800 }}
							>
								{loading ? <CircularProgress size={18} /> : "Submit Review"}
							</Button>
						</Grid>
					</Grid>
				</Box>
			</CardContent>
		</Card>
	);
};

export default ProductReviewForm;
