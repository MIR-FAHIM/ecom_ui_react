import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Paper,
  CircularProgress,
  Alert,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Chip,
} from "@mui/material";
import {
  addAttribute,
  getAttributes,
  addAttributeValue,
  getAttributeDetails,
} from "../../../../api/controller/admin_controller/product/setting_controller";

const Attribute = () => {
  /* ---------- Attribute state ---------- */
  const [name, setName] = useState("");
  const [status, setStatus] = useState(true);
  const [attributes, setAttributes] = useState([]);
  const [selectedAttribute, setSelectedAttribute] = useState(null);

  /* ---------- Attribute value state ---------- */
  const [valueName, setValueName] = useState("");
  const [valueStatus, setValueStatus] = useState(true);

  /* ---------- UI state ---------- */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ---------- Load attribute list ---------- */
  const loadAttributes = async () => {
    try {
      const res = await getAttributes();
      const list = Array.isArray(res?.data?.data)
        ? res.data.data
        : [];
      setAttributes(list);
    } catch (e) {
      setError("Failed to load attributes");
    }
  };

  /* ---------- Load attribute details ---------- */
  const loadAttributeDetails = async (id) => {
    try {
      const res = await getAttributeDetails(id);
      setSelectedAttribute(res?.data?.data || null);
    } catch (e) {
      setError("Failed to load attribute details");
    }
  };

  useEffect(() => {
    loadAttributes();
  }, []);

  /* ---------- Create attribute ---------- */
  const handleAddAttribute = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Attribute name is required");
      return;
    }

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("name", name);
      fd.append("status", status ? 1 : 0);

      await addAttribute(fd);

      setSuccess("Attribute created");
      setName("");
      setStatus(true);
      loadAttributes();
    } catch (e) {
      setError("Failed to create attribute");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Add attribute value ---------- */
  const handleAddValue = async (e) => {
    e.preventDefault();
    if (!selectedAttribute || !valueName.trim()) return;

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("attribute_id", selectedAttribute.id);
      fd.append("value", valueName);
      fd.append("status", valueStatus ? 1 : 0);

      await addAttributeValue(fd);

      setValueName("");
      setValueStatus(true);
      loadAttributeDetails(selectedAttribute.id);
      setSuccess("Value added successfully");
    } catch (e) {
      setError("Failed to add value");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={700} mb={2}>
        Attribute Management
      </Typography>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: 3 }}>
        {/* ================= LEFT SIDE ================= */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" mb={2}>
            Add Attribute
          </Typography>

          <Box component="form" onSubmit={handleAddAttribute} sx={{ mb: 3 }}>
            <TextField
              fullWidth
              size="small"
              label="Attribute Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mb: 2 }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={status}
                  onChange={(e) => setStatus(e.target.checked)}
                />
              }
              label="Active"
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              Create Attribute
            </Button>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Typography variant="subtitle1" fontWeight={600} mb={1}>
            Attributes
          </Typography>

          <List dense>
            {attributes.map((attr) => (
              <ListItemButton
                key={attr.id}
                selected={selectedAttribute?.id === attr.id}
                onClick={() => loadAttributeDetails(attr.id)}
              >
                <ListItemText primary={attr.name} />
              </ListItemButton>
            ))}
          </List>
        </Paper>

        {/* ================= RIGHT SIDE ================= */}
        <Paper sx={{ p: 3 }}>
          {!selectedAttribute ? (
            <Typography color="text.secondary">
              Select an attribute to manage values
            </Typography>
          ) : (
            <>
              <Typography variant="h6" mb={1}>
                {selectedAttribute.name} Values
              </Typography>

              {/* Add value form */}
              <Box
                component="form"
                onSubmit={handleAddValue}
                sx={{ display: "flex", gap: 2, alignItems: "center", mb: 3 }}
              >
                <TextField
                  size="small"
                  label="Value"
                  value={valueName}
                  onChange={(e) => setValueName(e.target.value)}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={valueStatus}
                      onChange={(e) => setValueStatus(e.target.checked)}
                    />
                  }
                  label="Active"
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  Add Value
                </Button>
              </Box>

              {/* Value list */}
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {selectedAttribute.values?.length === 0 ? (
                  <Typography color="text.secondary">
                    No values added yet
                  </Typography>
                ) : (
                  selectedAttribute.values.map((v) => (
                    <Chip
                      key={v.id}
                      label={v.value}
                      color={v.status ? "default" : "default"}
                      variant="outlined"
                    />
                  ))
                )}
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default Attribute;
