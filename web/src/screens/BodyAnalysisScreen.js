import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';

function BodyAnalysisScreen() {
  return (
    <Box
      sx={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #800080 0%, #4B0082 100%)',
        py: 4,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          borderRadius: 4,
          minWidth: 350,
          maxWidth: 400,
          width: '100%',
          textAlign: 'center',
          background: 'rgba(255,255,255,0.95)',
        }}
      >
        <Typography variant="h4" sx={{ color: '#800080', fontWeight: 'bold', mb: 2 }}>
          Vücut Analizi
        </Typography>
        <Typography sx={{ color: '#666', mb: 3 }}>
          Sağlıklı yaşam yolculuğunuz için vücut analiz bilgilerinizi girin veya görüntüleyin.
        </Typography>
        {/* Buraya form veya analiz sonuçları eklenebilir */}
        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{ borderRadius: 2, mt: 2 }}
        >
          Analiz Başlat
        </Button>
      </Paper>
    </Box>
  );
}

export default BodyAnalysisScreen;