import React from "react";
import { Typography, Box, Paper, Container } from "@mui/material";

const About = () => (
  <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
    <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: "-0.02em", mb: 2 }}>About</Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>Short about text...</Typography>
    </Paper>
  </Container>
);

export default About;
