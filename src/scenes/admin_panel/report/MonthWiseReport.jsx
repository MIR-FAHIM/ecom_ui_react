import React, { useEffect, useMemo, useState } from "react";
import { ResponsiveLine } from "@nivo/line";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
  Button,
} from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../../../theme";
import { getAdminMonthReport } from "../../../api/controller/admin_controller/report/report_controller";

const moneyBDT = (n) =>
  new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(Number(n || 0));

const formatMonth = (value) => {
  if (!value) return "";
  const [year, month] = value.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleString("en-US", { month: "short", year: "numeric" });
};

const MonthWiseReport = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [view, setView] = useState("amount");

  const loadReport = async () => {
    try {
      setLoading(true);
      const res = await getAdminMonthReport();
      if (res?.status === "success") {
        setReport(res?.data ?? null);
      } else {
        setReport(null);
      }
    } catch (error) {
      console.error("Error loading monthly report:", error);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const months = report?.months ?? [];

  const totals = useMemo(() => {
    return months.reduce(
      (acc, m) => {
        acc.orders += Number(m?.orders || 0);
        acc.amount += Number(m?.amount || 0);
        return acc;
      },
      { orders: 0, amount: 0 }
    );
  }, [months]);

  const chartSeries = useMemo(() => {
    const data = months.map((m) => ({
      x: formatMonth(m?.month),
      y: view === "amount" ? Number(m?.amount || 0) : Number(m?.orders || 0),
    }));
    return [
      {
        id: view === "amount" ? "Amount (BDT)" : "Orders",
        color: view === "amount" ? colors.blueAccent[400] : colors.greenAccent[400],
        data,
      },
    ];
  }, [months, view, colors]);

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Month Wise Report
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {report?.start_month && report?.end_month
              ? `From ${formatMonth(report.start_month)} to ${formatMonth(report.end_month)}`
              : "Monthly orders and sales totals"}
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={2}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Card sx={{ flex: 1, background: colors.primary[400] }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Total Orders
                  </Typography>
                  <Typography variant="h5" fontWeight={800}>
                    {totals.orders}
                  </Typography>
                </CardContent>
              </Card>
              <Card sx={{ flex: 1, background: colors.primary[400] }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Total Amount
                  </Typography>
                  <Typography variant="h5" fontWeight={800}>
                    {moneyBDT(totals.amount)}
                  </Typography>
                </CardContent>
              </Card>
            </Stack>

            <Card sx={{ background: colors.primary[400] }}>
              <CardContent>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
                  <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>
                    Monthly Trend
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant={view === "amount" ? "contained" : "outlined"}
                      onClick={() => setView("amount")}
                    >
                      Amount
                    </Button>
                    <Button
                      size="small"
                      variant={view === "orders" ? "contained" : "outlined"}
                      onClick={() => setView("orders")}
                    >
                      Orders
                    </Button>
                  </Stack>
                </Stack>

                <Box sx={{ height: 360, mt: 2 }}>
                  {months.length === 0 ? (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                      <Typography color="text.secondary">No data available.</Typography>
                    </Box>
                  ) : (
                    <ResponsiveLine
                      data={chartSeries}
                      theme={{
                        axis: {
                          domain: { line: { stroke: colors.gray[100] } },
                          legend: { text: { fill: colors.gray[100] } },
                          ticks: {
                            line: { stroke: colors.gray[100], strokeWidth: 1 },
                            text: { fill: colors.gray[100] },
                          },
                        },
                        legends: { text: { fill: colors.gray[100] } },
                        tooltip: { container: { color: colors.primary[500] } },
                      }}
                      colors={{ datum: "color" }}
                      margin={{ top: 20, right: 30, bottom: 50, left: 60 }}
                      xScale={{ type: "point" }}
                      yScale={{ type: "linear", min: 0, max: "auto", stacked: false, reverse: false }}
                      curve="catmullRom"
                      axisTop={null}
                      axisRight={null}
                      axisBottom={{
                        orient: "bottom",
                        tickSize: 0,
                        tickPadding: 8,
                        tickRotation: 0,
                      }}
                      axisLeft={{
                        orient: "left",
                        tickSize: 3,
                        tickPadding: 5,
                        tickRotation: 0,
                      }}
                      enableGridX={false}
                      enableGridY={true}
                      pointSize={8}
                      pointColor={{ theme: "background" }}
                      pointBorderWidth={2}
                      pointBorderColor={{ from: "serieColor" }}
                      pointLabelYOffset={-12}
                      useMesh={true}
                      legends={[]}
                    />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Stack>
        )}
      </Stack>
    </Box>
  );
};

export default MonthWiseReport;
