import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './Router';
import './i18n';
import './index.css';
import { appname } from '../src/api/config'; // adjust path as needed
import { ProfileProvider } from './scenes/provider/profile_context';
import { ColorModeContext, useMode } from './theme';
import { CssBaseline, ThemeProvider } from '@mui/material';

// Set document title
document.title = appname;

function Root() {
    const [theme, colorMode] = useMode();

    return (
        <React.StrictMode>
            <ProfileProvider>
                <ColorModeContext.Provider value={colorMode}>
                    <ThemeProvider theme={theme}>
                        <CssBaseline />
                        <AppRouter />
                    </ThemeProvider>
                </ColorModeContext.Provider>
            </ProfileProvider>
        </React.StrictMode>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);