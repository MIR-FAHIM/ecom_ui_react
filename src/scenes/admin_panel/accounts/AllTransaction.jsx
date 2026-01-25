import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/material";
import {
	Box,
	Card,
	CardContent,
	Typography,
	Grid,
	Divider,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TablePagination,
	Paper,
	Chip,
	CircularProgress,
	Alert,
} from "@mui/material";
import { tokens } from "../../../theme";
import {
	getAllCreditTransactions,
	getAllDebitTransactions,
	getTransactionReport,
} from "../../../api/controller/admin_controller/transaction/transaction_controller.jsx";

const AllTransaction = () => {
	const theme = useTheme();
	const colors = tokens(theme.palette.mode);

	const [report, setReport] = useState(null);
	const [reportLoading, setReportLoading] = useState(false);
	const [errMsg, setErrMsg] = useState("");

	const [creditRows, setCreditRows] = useState([]);
	const [creditTotal, setCreditTotal] = useState(0);
	const [creditPage, setCreditPage] = useState(0);
	const [creditRowsPerPage, setCreditRowsPerPage] = useState(20);
	const [creditLoading, setCreditLoading] = useState(false);

	const [debitRows, setDebitRows] = useState([]);
	const [debitTotal, setDebitTotal] = useState(0);
	const [debitPage, setDebitPage] = useState(0);
	const [debitRowsPerPage, setDebitRowsPerPage] = useState(20);
	const [debitLoading, setDebitLoading] = useState(false);

	const formatCurrency = (amount) =>
		new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(amount || 0);

	const formatDate = (dateString) =>
		dateString
			? new Date(dateString).toLocaleDateString("en-BD", {
					year: "numeric",
					month: "short",
					day: "numeric",
					hour: "2-digit",
					minute: "2-digit",
				})
			: "N/A";

	const getStatusColor = (status) => {
		const map = {
			completed: "success",
			pending: "warning",
			failed: "error",
		};
		return map[String(status ?? "").toLowerCase()] || "default";
	};

	const fetchReport = async () => {
		setReportLoading(true);
		setErrMsg("");
		try {
			const response = await getTransactionReport();
			if (response?.status === "success") {
				setReport(response?.data ?? null);
			} else {
				setReport(null);
				setErrMsg(response?.message || "Failed to load report");
			}
		} catch (error) {
			console.error("Error fetching report:", error);
			setReport(null);
			setErrMsg(error?.response?.data?.message || "Failed to load report");
		} finally {
			setReportLoading(false);
		}
	};

	const fetchCredit = async (pageZeroBased = creditPage, perPage = creditRowsPerPage) => {
		setCreditLoading(true);
		try {
			const apiPage = pageZeroBased + 1;
			const response = await getAllCreditTransactions({ page: apiPage, per_page: perPage });
			if (response?.status === "success") {
				const payload = response?.data ?? {};
				const paginator = payload?.items ?? payload;
				const list = Array.isArray(paginator?.data) ? paginator.data : [];
				setCreditRows(list);
				setCreditTotal(Number(paginator?.total ?? list.length));
				setCreditRowsPerPage(Number(paginator?.per_page ?? perPage));
				setCreditPage(Number(paginator?.current_page ?? apiPage) - 1);
			} else {
				setCreditRows([]);
				setCreditTotal(0);
			}
		} catch (error) {
			console.error("Error fetching credit transactions:", error);
			setCreditRows([]);
			setCreditTotal(0);
		} finally {
			setCreditLoading(false);
		}
	};

	const fetchDebit = async (pageZeroBased = debitPage, perPage = debitRowsPerPage) => {
		setDebitLoading(true);
		try {
			const apiPage = pageZeroBased + 1;
			const response = await getAllDebitTransactions({ page: apiPage, per_page: perPage });
			if (response?.status === "success") {
				const payload = response?.data ?? {};
				const paginator = payload?.items ?? payload;
				const list = Array.isArray(paginator?.data) ? paginator.data : [];
				setDebitRows(list);
				setDebitTotal(Number(paginator?.total ?? list.length));
				setDebitRowsPerPage(Number(paginator?.per_page ?? perPage));
				setDebitPage(Number(paginator?.current_page ?? apiPage) - 1);
			} else {
				setDebitRows([]);
				setDebitTotal(0);
			}
		} catch (error) {
			console.error("Error fetching debit transactions:", error);
			setDebitRows([]);
			setDebitTotal(0);
		} finally {
			setDebitLoading(false);
		}
	};

	useEffect(() => {
		fetchReport();
		fetchCredit(0, creditRowsPerPage);
		fetchDebit(0, debitRowsPerPage);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Box sx={{ p: 3 }}>
			<Box sx={{ mb: 2 }}>
				<Typography variant="h4" fontWeight={800}>
					Transactions
				</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
					Summary report and credit/debit history
				</Typography>
			</Box>

			{errMsg && (
				<Alert severity="error" sx={{ mb: 2 }}>
					{errMsg}
				</Alert>
			)}

			{/* Report */}
			<Card sx={{ background: colors.primary[400], borderRadius: 2, mb: 2 }}>
				<CardContent>
					<Typography variant="h6" fontWeight={800}>
						Transaction Report
					</Typography>
					<Divider sx={{ my: 2, opacity: 0.2 }} />

					{reportLoading ? (
						<Box sx={{ py: 2, display: "flex", justifyContent: "center" }}>
							<CircularProgress size={24} />
						</Box>
					) : (
						<Grid container spacing={2}>
							<Grid item xs={12} sm={6} md={3}>
								<Card sx={{ background: colors.primary[500], borderRadius: 2 }}>
									<CardContent>
										<Typography variant="caption" color="text.secondary">TOTAL CREDIT</Typography>
										<Typography variant="h6" fontWeight={800}>
											{formatCurrency(report?.total_credit)}
										</Typography>
									</CardContent>
								</Card>
							</Grid>
							<Grid item xs={12} sm={6} md={3}>
								<Card sx={{ background: colors.primary[500], borderRadius: 2 }}>
									<CardContent>
										<Typography variant="caption" color="text.secondary">TOTAL DEBIT</Typography>
										<Typography variant="h6" fontWeight={800}>
											{formatCurrency(report?.total_debit)}
										</Typography>
									</CardContent>
								</Card>
							</Grid>
							<Grid item xs={12} sm={6} md={3}>
								<Card sx={{ background: colors.primary[500], borderRadius: 2 }}>
									<CardContent>
										<Typography variant="caption" color="text.secondary">PROFIT</Typography>
										<Typography variant="h6" fontWeight={800}>
											{formatCurrency(report?.profit)}
										</Typography>
									</CardContent>
								</Card>
							</Grid>
							<Grid item xs={12} sm={6} md={3}>
								<Card sx={{ background: colors.primary[500], borderRadius: 2 }}>
									<CardContent>
										<Typography variant="caption" color="text.secondary">MARGIN %</Typography>
										<Typography variant="h6" fontWeight={800}>
											{Number(report?.margin_percent ?? 0).toFixed(2)}%
										</Typography>
									</CardContent>
								</Card>
							</Grid>
						</Grid>
					)}
				</CardContent>
			</Card>

			{/* Tables */}
			<Grid container spacing={2}>
				<Grid item xs={12} md={6}>
					<Card sx={{ background: colors.primary[400], borderRadius: 2 }}>
						<CardContent>
							<Typography variant="h6" fontWeight={800}>
								Credit Transactions
							</Typography>
							<Typography variant="caption" color="text.secondary">
								API: /api/transactions/credit?page=1
							</Typography>
							<Divider sx={{ my: 2, opacity: 0.2 }} />

							<TableContainer component={Paper} sx={{ background: colors.primary[400] }}>
								<Table stickyHeader>
									<TableHead>
										<TableRow>
											{["ID", "Amount", "Source", "Status", "Note", "Created"].map((h) => (
												<TableCell
													key={h}
													sx={{
														fontWeight: 800,
														backgroundColor: colors.primary[500],
														borderBottom: `1px solid ${colors.primary[300]}`,
													}}
												>
													{h}
												</TableCell>
											))}
										</TableRow>
									</TableHead>
									<TableBody>
										{creditLoading && (
											<TableRow>
												<TableCell colSpan={6} align="center" sx={{ py: 3 }}>
													<CircularProgress size={22} />
												</TableCell>
											</TableRow>
										)}
										{!creditLoading && creditRows.length === 0 && (
											<TableRow>
												<TableCell colSpan={6} align="center" sx={{ py: 3 }}>
													<Typography color="text.secondary">No credit transactions</Typography>
												</TableCell>
											</TableRow>
										)}
										{!creditLoading &&
											creditRows.map((trx, idx) => (
												<TableRow
													key={trx?.id ?? idx}
													hover
													sx={{
														"& td": { borderBottom: `1px solid ${colors.primary[300]}` },
														backgroundColor: idx % 2 === 0 ? "transparent" : colors.primary[300],
													}}
												>
													<TableCell sx={{ fontWeight: 700 }}>{trx?.id ?? "N/A"}</TableCell>
													<TableCell>{formatCurrency(trx?.amount)}</TableCell>
													<TableCell>{trx?.source ?? "N/A"}</TableCell>
													<TableCell>
														<Chip label={trx?.status ?? "N/A"} size="small" color={getStatusColor(trx?.status)} />
													</TableCell>
													<TableCell>{trx?.note ?? "N/A"}</TableCell>
													<TableCell>{formatDate(trx?.created_at)}</TableCell>
												</TableRow>
											))}
									</TableBody>
								</Table>
							</TableContainer>

							<TablePagination
								rowsPerPageOptions={[10, 20, 50, 100]}
								component="div"
								count={creditTotal}
								rowsPerPage={creditRowsPerPage}
								page={creditPage}
								onPageChange={(_, newPage) => {
									setCreditPage(newPage);
									fetchCredit(newPage, creditRowsPerPage);
								}}
								onRowsPerPageChange={(e) => {
									const next = parseInt(e.target.value, 10);
									setCreditRowsPerPage(next);
									setCreditPage(0);
									fetchCredit(0, next);
								}}
								sx={{
									mt: 1,
									".MuiTablePagination-toolbar": { px: 0 },
									".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
										color: "text.secondary",
									},
								}}
							/>
						</CardContent>
					</Card>
				</Grid>

				<Grid item xs={12} md={6}>
					<Card sx={{ background: colors.primary[400], borderRadius: 2 }}>
						<CardContent>
							<Typography variant="h6" fontWeight={800}>
								Debit Transactions
							</Typography>
							<Typography variant="caption" color="text.secondary">
								API: /api/transactions/debit?page=1
							</Typography>
							<Divider sx={{ my: 2, opacity: 0.2 }} />

							<TableContainer component={Paper} sx={{ background: colors.primary[400] }}>
								<Table stickyHeader>
									<TableHead>
										<TableRow>
											{["ID", "Amount", "Source", "Status", "Note", "Created"].map((h) => (
												<TableCell
													key={h}
													sx={{
														fontWeight: 800,
														backgroundColor: colors.primary[500],
														borderBottom: `1px solid ${colors.primary[300]}`,
													}}
												>
													{h}
												</TableCell>
											))}
										</TableRow>
									</TableHead>
									<TableBody>
										{debitLoading && (
											<TableRow>
												<TableCell colSpan={6} align="center" sx={{ py: 3 }}>
													<CircularProgress size={22} />
												</TableCell>
											</TableRow>
										)}
										{!debitLoading && debitRows.length === 0 && (
											<TableRow>
												<TableCell colSpan={6} align="center" sx={{ py: 3 }}>
													<Typography color="text.secondary">No debit transactions</Typography>
												</TableCell>
											</TableRow>
										)}
										{!debitLoading &&
											debitRows.map((trx, idx) => (
												<TableRow
													key={trx?.id ?? idx}
													hover
													sx={{
														"& td": { borderBottom: `1px solid ${colors.primary[300]}` },
														backgroundColor: idx % 2 === 0 ? "transparent" : colors.primary[300],
													}}
												>
													<TableCell sx={{ fontWeight: 700 }}>{trx?.id ?? "N/A"}</TableCell>
													<TableCell>{formatCurrency(trx?.amount)}</TableCell>
													<TableCell>{trx?.source ?? "N/A"}</TableCell>
													<TableCell>
														<Chip label={trx?.status ?? "N/A"} size="small" color={getStatusColor(trx?.status)} />
													</TableCell>
													<TableCell>{trx?.note ?? "N/A"}</TableCell>
													<TableCell>{formatDate(trx?.created_at)}</TableCell>
												</TableRow>
											))}
									</TableBody>
								</Table>
							</TableContainer>

							<TablePagination
								rowsPerPageOptions={[10, 20, 50, 100]}
								component="div"
								count={debitTotal}
								rowsPerPage={debitRowsPerPage}
								page={debitPage}
								onPageChange={(_, newPage) => {
									setDebitPage(newPage);
									fetchDebit(newPage, debitRowsPerPage);
								}}
								onRowsPerPageChange={(e) => {
									const next = parseInt(e.target.value, 10);
									setDebitRowsPerPage(next);
									setDebitPage(0);
									fetchDebit(0, next);
								}}
								sx={{
									mt: 1,
									".MuiTablePagination-toolbar": { px: 0 },
									".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
										color: "text.secondary",
									},
								}}
							/>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Box>
	);
};

export default AllTransaction;
