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
  Divider,
  Chip,
  TextField,
} from "@mui/material";
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

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Select attribute and its value (e.g., Size → XL).
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }} alignItems="center">
        <Grid item xs={12} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel id="attr-select-label">Attribute</InputLabel>
            <Select
              labelId="attr-select-label"
              value={selectedAttrId}
              label="Attribute"
              onChange={(e) => setSelectedAttrId(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {attributesList.map((a) => (
                <MenuItem key={a.id} value={a.id}>
                  {a.name ?? a.attribute_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel id="value-select-label">Value</InputLabel>
            <Select
              labelId="value-select-label"
              value={selectedValue}
              label="Value"
              onChange={(e) => setSelectedValue(e.target.value)}
              disabled={!attrValues || attrValues.length === 0}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {attrValues.map((v) => (
                <MenuItem key={v.id} value={v.id}>
                  {v.value ?? v.attribute_value ?? v.value_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={2}>
          <TextField
            fullWidth
            size="small"
            label="Stock"
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <Button
            fullWidth
            variant="contained"
            sx={{ height: 40 }}
            onClick={addSelectedAttribute}
            disabled={!selectedAttrId || !selectedValue}
          >
            Add
          </Button>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2, opacity: 0.2 }} />

      {value.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No attributes added yet.
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {value.map((a, idx) => (
            <Chip
              key={`${a.name}-${a.value}-${idx}`}
              label={`${a.name}: ${a.value}`}
              onDelete={() => onRemove(idx)}
              variant="outlined"
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

export default StepAttributes;
