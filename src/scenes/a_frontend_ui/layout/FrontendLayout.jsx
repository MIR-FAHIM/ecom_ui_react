import React from "react";
import { Outlet } from 'react-router-dom';
import Topbar from './Topbar';
import BottomBar from './BottomBar';
import { Container } from '@mui/material';

const FrontendLayout = () => {
  return (
    <div>
      <Topbar />
      <Container sx={{ minHeight: '70vh', py: 3 }}>
        <Outlet />
      </Container>
      <BottomBar />
    </div>
  );
};

export default FrontendLayout;
