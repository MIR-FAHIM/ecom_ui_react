import { createTheme } from "@mui/material";
import { useMemo, useState, createContext } from "react";

// Color Design Tokens
export const tokens = (mode) => {
  const isDark = mode === "dark";
  return {
    gray: isDark
      ? { 10: "#6366f1", 100: "#f1f5f9", 200: "#e2e8f0", 300: "#cbd5e1", 400: "#94a3b8", 500: "#64748b", 600: "#475569", 700: "#334155", 800: "#1e293b", 900: "#0f172a" }
      : { 10: "#6366f1", 100: "#0f172a", 200: "#1e293b", 300: "#334155", 400: "#475569", 500: "#64748b", 600: "#94a3b8", 700: "#cbd5e1", 800: "#e2e8f0", 900: "#f8fafc" },
    bg: { 100: isDark ? "#0f172a" : "#f8fafc" },
    primary: isDark
      ? { 100: "#e0e7ff", 200: "#c7d2fe", 300: "#a5b4fc", 400: "#818cf8", 500: "#1e293b", 600: "#4f46e5", 700: "#4338ca", 800: "#3730a3", 900: "#312e81" }
      : { 100: "#f8fafc", 200: "#f1f5f9", 300: "#e2e8f0", 400: "#f8fafc", 500: "#f1f5f9", 600: "#64748b", 700: "#94a3b8", 800: "#cbd5e1", 900: "#e2e8f0" },
    greenAccent: isDark
      ? { 100: "#d1fae5", 200: "#a7f3d0", 300: "#6ee7b7", 400: "#34d399", 500: "#10b981", 600: "#059669", 700: "#047857", 800: "#065f46", 900: "#064e3b" }
      : { 100: "#064e3b", 200: "#065f46", 300: "#047857", 400: "#059669", 500: "#10b981", 600: "#34d399", 700: "#6ee7b7", 800: "#a7f3d0", 900: "#d1fae5" },
    redAccent: isDark
      ? { 100: "#fee2e2", 200: "#fecaca", 300: "#fca5a5", 400: "#f87171", 500: "#ef4444", 600: "#dc2626", 700: "#b91c1c", 800: "#991b1b", 900: "#7f1d1d" }
      : { 100: "#7f1d1d", 200: "#991b1b", 300: "#b91c1c", 400: "#dc2626", 500: "#ef4444", 600: "#f87171", 700: "#fca5a5", 800: "#fecaca", 900: "#fee2e2" },
    blueAccent: isDark
      ? { 100: "#dbeafe", 200: "#bfdbfe", 300: "#93c5fd", 400: "#60a5fa", 500: "#3b82f6", 600: "#2563eb", 700: "#1d4ed8", 800: "#1e40af", 900: "#1e3a8a" }
      : { 100: "#6366f1", 200: "#bfdbfe", 300: "#93c5fd", 400: "#60a5fa", 500: "#3b82f6", 600: "#2563eb", 700: "#1d4ed8", 800: "#1e40af", 900: "#1e3a8a" },
    yellowAccent: { 100: "#f59e0b" },
  };
};

// Mui Theme Settings
export const themeSettings = (mode) => {
  const isDark = mode === "dark";

  return {
    palette: {
      mode,
      primary: {
        main: "#6366f1",
        light: "#818cf8",
        dark: "#4f46e5",
        contrastText: "#ffffff",
      },
      secondary: {
        main: "#10b981",
        light: "#34d399",
        dark: "#059669",
        contrastText: "#ffffff",
        blue: "#3b82f6",
        yellow: "#f59e0b",
      },
      error:   { main: "#ef4444", light: "#f87171", dark: "#dc2626" },
      warning: { main: "#f59e0b", light: "#fbbf24", dark: "#d97706" },
      info:    { main: "#3b82f6", light: "#60a5fa", dark: "#2563eb" },
      success: { main: "#10b981", light: "#34d399", dark: "#059669" },
      neutral: {
        dark: isDark ? "#334155" : "#cbd5e1",
        main: "#64748b",
        light: isDark ? "#94a3b8" : "#94a3b8",
      },
      background: {
        default: isDark ? "#0f172a" : "#f8fafc",
        paper:   isDark ? "#1e293b" : "#ffffff",
      },
      text: {
        primary:   isDark ? "#f1f5f9" : "#0f172a",
        secondary: isDark ? "#94a3b8" : "#64748b",
        disabled:  isDark ? "#475569" : "#94a3b8",
      },
      divider: isDark ? "#334155" : "#e2e8f0",
    },
    typography: {
      fontFamily: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"].join(","),
      fontSize: 13,
      h1: { fontFamily: "Inter, sans-serif", fontSize: 32, fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1.2 },
      h2: { fontFamily: "Inter, sans-serif", fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em",  lineHeight: 1.25 },
      h3: { fontFamily: "Inter, sans-serif", fontSize: 20, fontWeight: 700, letterSpacing: "-0.015em", lineHeight: 1.3 },
      h4: { fontFamily: "Inter, sans-serif", fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em",  lineHeight: 1.35 },
      h5: { fontFamily: "Inter, sans-serif", fontSize: 15, fontWeight: 600, letterSpacing: "-0.005em", lineHeight: 1.4 },
      h6: { fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, lineHeight: 1.45 },
      body1:   { fontSize: 14, lineHeight: 1.6,  letterSpacing: "-0.005em" },
      body2:   { fontSize: 13, lineHeight: 1.55 },
      caption: { fontSize: 12, lineHeight: 1.5,  letterSpacing: "0.01em" },
      button:  { fontWeight: 600, letterSpacing: "0.01em" },
    },
    shape: { borderRadius: 10 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: "thin",
            scrollbarColor: isDark ? "#334155 transparent" : "#cbd5e1 transparent",
            "&::-webkit-scrollbar": { width: 6, height: 6 },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": {
              background: isDark ? "#334155" : "#cbd5e1",
              borderRadius: 3,
            },
          },
        },
      },
      MuiContainer: {
        defaultProps: { maxWidth: "xl" },
        styleOverrides: { maxWidthXl: { maxWidth: "1480px" } },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: "none",
            fontWeight: 600,
            padding: "8px 18px",
            boxShadow: "none",
            "&:hover": { boxShadow: "none" },
          },
          sizeSmall: { padding: "5px 12px", fontSize: 12 },
          contained: {
            "&:hover": { boxShadow: "0 4px 12px rgba(99,102,241,0.3)" },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600, fontSize: 12, borderRadius: 6 },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: isDark
              ? "0 1px 3px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)"
              : "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
            border: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: "none" },
          rounded: { borderRadius: 12 },
          elevation1: {
            boxShadow: isDark
              ? "0 1px 3px rgba(0,0,0,0.3)"
              : "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
          },
        },
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            border: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            "& .MuiTableCell-head": {
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: isDark ? "#64748b" : "#64748b",
              background: isDark ? "#0f172a" : "#f8fafc",
              borderBottom: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
            },
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            "&:last-child .MuiTableCell-body": { border: 0 },
            "&:hover": {
              background: isDark ? "rgba(255,255,255,0.03)" : "rgba(99,102,241,0.02)",
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: isDark ? "#1e293b" : "#f1f5f9",
            fontSize: 13,
            padding: "12px 16px",
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 8,
              "& fieldset": { borderColor: isDark ? "#334155" : "#e2e8f0" },
              "&:hover fieldset": { borderColor: "#6366f1" },
              "&.Mui-focused fieldset": { borderColor: "#6366f1", borderWidth: 2 },
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            "& fieldset": { borderColor: isDark ? "#334155" : "#e2e8f0" },
            "&:hover fieldset": { borderColor: "#6366f1" },
            "&.Mui-focused fieldset": { borderColor: "#6366f1", borderWidth: 2 },
          },
        },
      },
      MuiSelect: {
        styleOverrides: { root: { borderRadius: 8 } },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            transition: "all 0.15s ease",
            "&:hover": {
              background: isDark ? "rgba(255,255,255,0.08)" : "rgba(99,102,241,0.08)",
            },
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 500,
            padding: "6px 12px",
            background: isDark ? "#334155" : "#0f172a",
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 12,
            boxShadow: isDark
              ? "0 4px 24px rgba(0,0,0,0.5)"
              : "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
            border: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            margin: "2px 6px",
            fontSize: 13,
            fontWeight: 500,
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: { borderColor: isDark ? "#334155" : "#e2e8f0" },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { borderRadius: 4, height: 6 },
          bar:  { borderRadius: 4 },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" },
        },
      },
      MuiDialogTitle: {
        styleOverrides: { root: { fontWeight: 700, fontSize: 16 } },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
            fontSize: 13,
            "&.Mui-selected": { color: "#6366f1" },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: { backgroundColor: "#6366f1", height: 3, borderRadius: 2 },
        },
      },
      MuiBadge: {
        styleOverrides: {
          badge: { fontWeight: 700, fontSize: 10 },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            fontWeight: 700,
            fontSize: 14,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          switchBase: {
            "&.Mui-checked": { color: "#6366f1" },
            "&.Mui-checked + .MuiSwitch-track": { backgroundColor: "#6366f1" },
          },
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: { "&.Mui-checked": { color: "#6366f1" } },
        },
      },
    },
  };
};

// Context For Color Mode
export const ColorModeContext = createContext({ toggleColorMode: () => {} });

export const useMode = () => {
  const [mode, setMode] = useState("light");

  const colorMode = useMemo(
    () => ({ toggleColorMode: () => setMode((prev) => (prev === "light" ? "dark" : "light")) }),
    []
  );

  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);

  return [theme, colorMode];
};
