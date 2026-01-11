import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Divider,
} from "@mui/material";
import { tokens } from "../../../theme";

function Dashboard() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Simple layout skeleton (no API, no logic).
        </Typography>
      </Box>

      <Divider sx={{ mb: 3, opacity: 0.2 }} />

      {/* Stat placeholders */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {["Total Sales", "Total Orders", "Pending Orders", "Total Products"].map((title) => (
          <Grid key={title} item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: colors.primary[400],
                borderRadius: 2,
                height: "100%",
              }}
            >
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {title}
                </Typography>
                <Typography variant="h5" fontWeight={700} sx={{ mt: 1 }}>
                  --
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Placeholder
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main content placeholders */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Card sx={{ background: colors.primary[400], borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700}>
                Section A
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Use this area for tables, charts, recent orders, etc.
              </Typography>

              <Box
                sx={{
                  mt: 2,
                  height: 220,
                  borderRadius: 2,
                  border: `1px dashed ${colors.primary[300]}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "text.secondary",
                }}
              >
                Content placeholder
              </Box>

              <Button
                variant="text"
                sx={{ mt: 2, color: colors.blueAccent[500] }}
                onClick={() => navigate("/")}
              >
                Action Link →
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ background: colors.primary[400], borderRadius: 2, height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700}>
                Section B
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Use this area for top products, notices, summaries, etc.
              </Typography>

              <Box
                sx={{
                  mt: 2,
                  height: 220,
                  borderRadius: 2,
                  border: `1px dashed ${colors.primary[300]}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "text.secondary",
                }}
              >
                Content placeholder
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick actions */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Quick Actions
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              sx={{ background: colors.blueAccent[500], py: 1.25 }}
              onClick={() => navigate("/ecom/product/add")}
            >
              Add Product
            </Button>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              sx={{ background: colors.blueAccent[500], py: 1.25 }}
              onClick={() => navigate("/ecom/order/all")}
            >
              View Orders
            </Button>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              sx={{ background: colors.blueAccent[500], py: 1.25 }}
              onClick={() => navigate("/ecom/product/all")}
            >
              Manage Products
            </Button>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              sx={{ background: colors.blueAccent[500], py: 1.25 }}
              onClick={() => navigate("/ecom/report/today")}
            >
              View Reports
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default Dashboard;
