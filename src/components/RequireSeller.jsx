import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getUserDetail } from "../api/controller/admin_controller/user_controller";

export default function RequireSeller({ children }) {
	const [checking, setChecking] = useState(true);
	const [isSeller, setIsSeller] = useState(false);

	useEffect(() => {
		let active = true;

		const verifySeller = async () => {
			const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
			const userId = localStorage.getItem("userId") || sessionStorage.getItem("userId");

			if (!token || !userId) {
				if (!active) return;
				setIsSeller(false);
				setChecking(false);
				return;
			}

			try {
				const res = await getUserDetail(userId);
				const user = res?.data?.data ?? res?.data?.user ?? res?.data ?? res?.user ?? null;
				const userType = user?.user_type ?? res?.data?.user_type ?? res?.user_type;

				if (!active) return;
				setIsSeller(userType === "seller");
			} catch (error) {
				console.error("Seller guard failed:", error);
				if (!active) return;
				setIsSeller(false);
			} finally {
				if (active) setChecking(false);
			}
		};

		verifySeller();

		return () => {
			active = false;
		};
	}, []);

	if (checking) return null;
	if (!isSeller) return <Navigate to="/seller-login" replace />;

	return children;
}