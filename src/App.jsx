import React, { createContext, useState } from "react";
import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import { Navbar, SideBar } from "./scenes";
import { Outlet } from "react-router-dom";
import { DataProvider } from "./context/DataContext";

export const ToggledContext = createContext(null);

function App() {
  const [theme, colorMode] = useMode();
  const [toggled, setToggled] = useState(false);

  return (
    <DataProvider>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ToggledContext.Provider value={{ toggled, setToggled }}>
            <Box sx={{ display: "flex", height: "100vh", overflow: "hidden", bgcolor: "background.default" }}>
              {/* Sidebar */}
              <SideBar />

              {/* Main content column */}
              <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
                <Navbar />
                <Box
                  component="main"
                  sx={{
                    flexGrow: 1,
                    overflowY: "auto",
                    overflowX: "hidden",
                    bgcolor: "background.default",
                  }}
                >
                  <Outlet />
                </Box>
              </Box>
            </Box>
          </ToggledContext.Provider>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </DataProvider>
  );
}

export default App;

