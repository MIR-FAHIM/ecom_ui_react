import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, Grid, Avatar, CircularProgress, Alert, Chip } from "@mui/material";
import { getUserDetail } from "../../../api/controller/admin_controller/user_controller";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const userId = localStorage.getItem("userId") || sessionStorage.getItem("userId");
        if (!userId) {
          setError("User is not logged in.");
          return;
        }

        const res = await getUserDetail(userId);
        const data = res?.data?.data ?? res?.data?.user ?? res?.data ?? null;
        if (!data) {
          setError("Unable to load profile details.");
          return;
        }

        setUser(data);
      } catch (err) {
        console.error("Failed to load admin profile:", err);
        setError("Failed to load profile information.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const fullName = user?.name || user?.full_name || user?.user_name || "Admin";
  const email = user?.email || user?.mail || "admin@example.com";
  const phone = user?.phone || user?.mobile || "-";
  const role = user?.user_type || "admin";

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
        Admin Profile
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Account details fetched from user profile API.
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar sx={{ width: 72, height: 72, fontSize: 28, fontWeight: 700 }}>
                    {fullName.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {fullName}
                    </Typography>
                    <Chip label={String(role).toUpperCase()} size="small" color="primary" sx={{ mt: 0.5 }} />
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">Email</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{email}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">Phone</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{phone}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">User ID</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{user?.id ?? "-"}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">Status</Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      {user?.status ?? "active"}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Profile;
