import React from "react";
import {
  Box,
  Paper,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  List,
  ListItem,
  Divider,
  IconButton,
  Chip,
  Stack,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import PlaceIcon from "@mui/icons-material/Place";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const UserAddress = ({
  addresses,
  selectedAddress,
  onSelectAddress,
  onDeleteAddress,
  addressDeleting,
  addrLoading,
  divider,
  surface,
  surface2,
  ink,
  subInk,
  theme,
  colors,
}) => {
  const AddressCard = ({ a, selected }) => {
    const labelLine = `${a.address}${a.area ? `, ${a.area}` : ""}`;

    return (
      <Box
        sx={{
          p: 1.4,
          borderRadius: 3,
          border: `1px solid ${selected ? "transparent" : divider}`,
          background: selected ? theme.palette.primary[100] : surface,
          boxShadow: "none",
          transition: "transform 140ms ease, box-shadow 200ms ease, filter 200ms ease",
          color: selected ? colors.primary[800] : ink,
          "&:hover": { transform: "translateY(-1px)" },
        }}
      >
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              background: selected ? colors.primary[200] : surface2,
              border: `1px solid ${selected ? colors.primary[300] : divider}`,
              flexShrink: 0,
            }}
          >
            <PlaceIcon fontSize="small" />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 950, lineHeight: 1.1 }}>
              {a.name}{" "}
              <Box component="span" sx={{ fontWeight: 800, opacity: 0.85 }}>
                {a.mobile}
              </Box>
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.4, fontWeight: 700, opacity: selected ? 0.9 : 0.78 }}>
              {labelLine}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.4, fontWeight: 700, opacity: selected ? 0.9 : 0.78 }}>
              {a.division?.name} {a.district?.name}
            </Typography>
          </Box>

          <Stack direction="row" spacing={0.6} alignItems="center" sx={{ ml: "auto" }}>
            <Tooltip title="Delete address">
              <span>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDeleteAddress(a);
                  }}
                  disabled={addressDeleting?.[a.id]}
                  sx={{
                    borderRadius: 2,
                    border: `1px solid ${divider}`,
                    background:
                      theme.palette.mode === "dark" ? "rgba(250,92,92,0.12)" : "rgba(250,92,92,0.10)",
                    "&:hover": {
                      background:
                        theme.palette.mode === "dark" ? "rgba(250,92,92,0.16)" : "rgba(250,92,92,0.14)",
                    },
                  }}
                >
                  <DeleteOutlineIcon fontSize="small" sx={{ color: theme.palette.error.main }} />
                </IconButton>
              </span>
            </Tooltip>

            <Chip
              size="small"
              label={selected ? "Selected" : "Use"}
              sx={{
                borderRadius: 999,
                fontWeight: 950,
                background: selected ? colors.primary[200] : surface2,
                border: `1px solid ${selected ? colors.primary[300] : divider}`,
                color: selected ? colors.gray[10] : ink,
              }}
            />
          </Stack>
        </Stack>
      </Box>
    );
  };

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 4,
        border: `1px solid ${divider}`,
        background: surface,
        backdropFilter: "blur(12px)",
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 3,
            display: "grid",
            placeItems: "center",
            background: surface2,
            border: `1px solid ${divider}`,
          }}
        >
          <PlaceIcon fontSize="small" />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 950, color: ink }}>
            Shipping Address
          </Typography>
          <Typography variant="body2" sx={{ color: subInk, fontWeight: 700 }}>
            Choose a saved address.
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ my: 1.5, opacity: 0.12 }} />

      {addrLoading ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, py: 3 }}>
          <CircularProgress size={18} />
          <Typography sx={{ color: subInk, fontWeight: 800 }}>Loading addresses...</Typography>
        </Box>
      ) : addresses.length === 0 ? (
        <Paper
          sx={{
            p: 2,
            borderRadius: 4,
            border: `1px dashed ${divider}`,
            background: surface2,
          }}
        >
          <Typography sx={{ fontWeight: 950, color: ink }}>No saved addresses</Typography>
          <Typography variant="body2" sx={{ color: subInk, fontWeight: 700, mt: 0.4 }}>
            Add one to continue checkout.
          </Typography>
        </Paper>
      ) : (
        <RadioGroup value={selectedAddress || ""} onChange={(e) => onSelectAddress(e.target.value)}>
          <List sx={{ p: 0, display: "grid", gap: 1.2 }}>
            {addresses.map((a) => {
              const isSelected = String(selectedAddress) === String(a.id);
              return (
                <ListItem key={a.id} sx={{ p: 0, borderRadius: 3 }}>
                  <FormControlLabel
                    value={String(a.id)}
                    control={<Radio sx={{ ml: 1.2 }} />}
                    sx={{ m: 0, width: "100%" }}
                    label={
                      <Box sx={{ width: "100%", pr: 1.2 }}>
                        <AddressCard a={a} selected={isSelected} />
                      </Box>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        </RadioGroup>
      )}
    </Paper>
  );
};

export default UserAddress;
