import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Chip,
  TextField,
  Card,
  CardContent,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import TuneIcon from "@mui/icons-material/Tune";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";
import {
  getAttributes,
  getAttributeDetails,
} from "../../../../../../api/controller/admin_controller/product/setting_controller";
import { getProductAttributes } from "../../../../../../api/controller/admin_controller/product/product_varient_controller";

function StepAttributes({ value = [], onAdd, onRemove, productId }) {
  const [attributesList, setAttributesList] = useState([]);
  const [selectedAttrId, setSelectedAttrId] = useState("");
  const [attrValues, setAttrValues] = useState([]);
  const [selectedValue, setSelectedValue] = useState("");
  const [stock, setStock] = useState(0);
  const loadedExistingRef = useRef(false);

  const getAttributeKey = (attrId, valueId) => `${attrId ?? ""}-${valueId ?? ""}`;

  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        const res = await getAttributes();
        // Support different response shapes (axios response or direct data)
        const list = res?.data?.data ?? res?.data ?? [];
        setAttributesList(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Failed to load attributes", err);
      }
    };

    fetchAttributes();
  }, []);

  useEffect(() => {
    const loadExistingAttributes = async () => {
      if (!productId || loadedExistingRef.current || value.length > 0) return;
      loadedExistingRef.current = true;
      try {
        const res = await getProductAttributes(productId);
        const payload = res?.data?.data ?? res?.data ?? {};
        const rows = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : [];
        if (rows.length === 0) return;

        const existing = new Set(
          value.map((item) => getAttributeKey(item?.attribute_id, item?.attribute_value_id))
        );

        rows.forEach((row) => {
          const key = getAttributeKey(row?.attribute_id, row?.attribute_value_id);
          if (existing.has(key)) return;
          existing.add(key);
          onAdd({
            attribute_id: Number(row?.attribute_id),
            attribute_value_id: Number(row?.attribute_value_id),
            name: row?.attribute?.name || "",
            value: row?.value?.value || "",
            stock: Number(row?.stock) || 0,
          });
        });
      } catch (err) {
        console.error("Failed to load product attributes", err);
      }
    };

    loadExistingAttributes();
  }, [productId, value, onAdd]);

  useEffect(() => {
    const fetchValues = async () => {
      if (!selectedAttrId) return;
      try {
        const res = await getAttributeDetails(selectedAttrId);
        // Response shape: { data: { data: { values: [...] } } } or { data: { values: [...] } }
        const values = res?.data?.data?.values ?? res?.data?.values ?? res?.data ?? [];
        setAttrValues(Array.isArray(values) ? values : []);
        setSelectedValue("");
      } catch (err) {
        console.error("Failed to load attribute values", err);
        setAttrValues([]);
      }
    };

    fetchValues();
  }, [selectedAttrId]);

  const addSelectedAttribute = () => {
    if (!selectedAttrId || !selectedValue) return;

    const attr = attributesList.find((a) => a.id === selectedAttrId || a.id === Number(selectedAttrId));
    const valueObj = attrValues.find((v) => v.id === selectedValue || v.id === Number(selectedValue));

    const name = attr?.name ?? attr?.attribute_name ?? "";
    const val = valueObj?.value ?? valueObj?.attribute_value ?? valueObj?.value_name ?? selectedValue;

    if (!name || !val) return;

    onAdd({
      attribute_id: Number(selectedAttrId),
      attribute_value_id: Number(selectedValue),
      name,
      value: val,
      stock: Number(stock) || 0,
    });

    // reset selectors
    setSelectedAttrId("");
    setAttrValues([]);
    setSelectedValue("");
    setStock(0);
  };

  const selectSx = { borderRadius: 2, "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#6366f1" } };
  const fieldSx = { "& .MuiOutlinedInput-root": { borderRadius: 2, "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#6366f1" } }, "& .MuiInputLabel-root.Mui-focused": { color: "#6366f1" } };

  return (
    <Stack spacing={3}>
      {/* ── Add attribute form ── */}
      <Card variant="outlined" sx={{ borderRadius: 2.5, borderColor: "divider" }}>
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Box sx={{ width: 30, height: 30, borderRadius: 1.5, bgcolor: "#eef2ff", display: "grid", placeItems: "center", color: "#6366f1" }}>
              <TuneIcon sx={{ fontSize: 18 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Add Attribute</Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>Select attribute and value (e.g., Size → XL)</Typography>
            </Box>
          </Stack>

          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="attr-select-label">Attribute</InputLabel>
                <Select labelId="attr-select-label" value={selectedAttrId} label="Attribute" onChange={(e) => setSelectedAttrId(e.target.value)} sx={selectSx}>
                  <MenuItem value=""><em>None</em></MenuItem>
                  {attributesList.map((a) => (
                    <MenuItem key={a.id} value={a.id}>{a.name ?? a.attribute_name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="value-select-label">Value</InputLabel>
                <Select labelId="value-select-label" value={selectedValue} label="Value" onChange={(e) => setSelectedValue(e.target.value)} disabled={!attrValues || attrValues.length === 0} sx={selectSx}>
                  <MenuItem value=""><em>None</em></MenuItem>
                  {attrValues.map((v) => (
                    <MenuItem key={v.id} value={v.id}>{v.value ?? v.attribute_value ?? v.value_name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={2}>
              <TextField fullWidth size="small" label="Stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} sx={fieldSx} />
            </Grid>
            <Grid item xs={6} sm={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={addSelectedAttribute}
                disabled={!selectedAttrId || !selectedValue}
                startIcon={<AddCircleOutlineIcon />}
                sx={{ height: 40, borderRadius: 2, textTransform: "none", fontWeight: 700, bgcolor: "#6366f1", boxShadow: "0 4px 14px rgba(99,102,241,0.25)", "&:hover": { bgcolor: "#4f46e5" } }}
              >
                Add
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ── Added attributes ── */}
      <Card variant="outlined" sx={{ borderRadius: 2.5, borderColor: "divider" }}>
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Box sx={{ width: 30, height: 30, borderRadius: 1.5, bgcolor: "#f0fdf4", display: "grid", placeItems: "center", color: "#16a34a" }}>
              <InventoryOutlinedIcon sx={{ fontSize: 18 }} />
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Added Attributes
              {value.length > 0 && (
                <Typography component="span" variant="caption" sx={{ ml: 1, color: "text.secondary" }}>({value.length})</Typography>
              )}
            </Typography>
          </Stack>

          {value.length === 0 ? (
            <Box sx={{ py: 4, textAlign: "center", border: "2px dashed", borderColor: "divider", borderRadius: 2.5 }}>
              <TuneIcon sx={{ fontSize: 36, color: "text.disabled", mb: 1 }} />
              <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600 }}>No attributes added yet</Typography>
              <Typography variant="caption" sx={{ color: "text.disabled" }}>Use the form above to add product attributes</Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {value.map((a, idx) => (
                <Chip
                  key={`${a.name}-${a.value}-${idx}`}
                  label={
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{a.name}:</Typography>
                      <Typography variant="body2">{a.value}</Typography>
                      {a.stock > 0 && <Typography variant="caption" sx={{ color: "text.secondary" }}>(stock: {a.stock})</Typography>}
                    </Stack>
                  }
                  onDelete={() => onRemove(idx)}
                  deleteIcon={<Tooltip title="Remove"><DeleteOutlineIcon sx={{ fontSize: 18 }} /></Tooltip>}
                  sx={{
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "rgba(99,102,241,0.06)",
                    height: 36,
                    "& .MuiChip-deleteIcon": { color: "#ef4444", "&:hover": { color: "#dc2626" } },
                  }}
                />
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}

export default StepAttributes;
