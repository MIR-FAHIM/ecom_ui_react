import React, { useRef } from "react";
import {
  Box,
  Grid,
  Button,
  Typography,
  Divider,
  Card,
  CardContent,
  Chip,
  FormHelperText,
} from "@mui/material";
import { CloudUpload } from "@mui/icons-material";

function StepImages({ value = [], onAdd, onRemove, onPrimary, error = "" }) {
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert(`${file.name} is not a valid image file`);
        return;
      }

      // Add file object with is_primary flag
      onAdd({
        file: file,
        filename: file.name,
        is_primary: value.length === 0, // first image is primary by default
      });
    });

    // Reset input
    fileInputRef.current.value = "";
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Upload product images. The first image will be set as primary by default.
      </Typography>

      {/* File Upload Section */}
      <Box
        sx={{
          border: "2px dashed",
          borderColor: error ? "error.main" : "primary.main",
          borderRadius: 1,
          p: 3,
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.2s",
          "&:hover": {
            bgcolor: "action.hover",
          },
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />

        <CloudUpload sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
        <Typography variant="body1" fontWeight={600} sx={{ mb: 0.5 }}>
          Click to upload or drag and drop
        </Typography>
        <Typography variant="caption" color="text.secondary">
          PNG, JPG, GIF up to 10MB
        </Typography>
      </Box>

      {error && (
        <FormHelperText error sx={{ mt: 1 }}>
          {error}
        </FormHelperText>
      )}

      <Divider sx={{ my: 2, opacity: 0.2 }} />

      {/* Images List */}
      {value.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No images added yet. Upload at least one image.
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {value.map((img, idx) => (
            <Card key={idx} variant="outlined">
              <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                <Box sx={{ minWidth: 0, display: "flex", alignItems: "center", gap: 2 }}>
                  {/* File preview thumbnail */}
                  {img.file && (
                    <Box
                      component="img"
                      src={URL.createObjectURL(img.file)}
                      alt="preview"
                      sx={{
                        width: 60,
                        height: 60,
                        objectFit: "cover",
                        borderRadius: 0.5,
                        bgcolor: "action.hover",
                      }}
                    />
                  )}

                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={700} noWrap title={img.filename}>
                      {img.filename}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {img.file ? `${(img.file.size / 1024).toFixed(2)} KB` : "No file"}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
                  {img.is_primary ? (
                    <Chip label="Primary" color="success" size="small" />
                  ) : (
                    <Button size="small" variant="outlined" onClick={() => onPrimary(idx)}>
                      Set Primary
                    </Button>
                  )}

                  <Button size="small" color="error" variant="outlined" onClick={() => onRemove(idx)}>
                    Remove
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default StepImages;
