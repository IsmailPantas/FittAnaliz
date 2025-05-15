import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Grid, 
  TextField, 
  Divider, 
  CircularProgress,
  Box,
  IconButton,
  InputAdornment,
  useTheme,
  alpha
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import axios from 'axios';

const NutritionPage = () => {
  const [nutritionData, setNutritionData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  const commonFoods = [
    {
      fields: {
        item_name: 'Elma',
        nf_calories: 95,
        nf_protein: 0.5,
        nf_total_carbohydrate: 25,
        nf_total_fat: 0.3
      }
    },
    {
      fields: {
        item_name: 'Yumurta (Haşlanmış)',
        nf_calories: 68,
        nf_protein: 5.5,
        nf_total_carbohydrate: 0.6,
        nf_total_fat: 4.8
      }
    },
    {
      fields: {
        item_name: 'Tam Buğday Ekmeği (1 Dilim)',
        nf_calories: 69,
        nf_protein: 3.6,
        nf_total_carbohydrate: 12,
        nf_total_fat: 0.9
      }
    },
    {
      fields: {
        item_name: 'Tavuk Göğsü (100g)',
        nf_calories: 165,
        nf_protein: 31,
        nf_total_carbohydrate: 0,
        nf_total_fat: 3.6
      }
    },
    {
      fields: {
        item_name: 'Yoğurt (Sade, 100g)',
        nf_calories: 61,
        nf_protein: 3.5,
        nf_total_carbohydrate: 4.7,
        nf_total_fat: 3.3
      }
    }
  ];

  const theme = useTheme();

  useEffect(() => {
    setNutritionData(commonFoods);
    setInitialLoading(false);
  }, []);

  const searchNutrition = async () => {
    if (!searchQuery) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Besin araması yap
      const searchResponse = await axios({
        method: 'GET',
        url: 'https://trackapi.nutritionix.com/v2/search/instant',
        headers: {
          'x-app-id': 'be5e867c',
          'x-app-key': '3b27a10ff089661f56fe020f25491216'
        },
        params: {
          query: searchQuery,
          detailed: true
        }
      });

      if (searchResponse.data.common.length === 0 && searchResponse.data.branded.length === 0) {
        setError('No results found. Please try another food.');
        setLoading(false);
        return;
      }

      const allFoods = [...searchResponse.data.common, ...searchResponse.data.branded]
        .filter(food => food.food_name.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 10);

      const detailPromises = allFoods.map(food =>
        axios({
          method: 'POST',
          url: 'https://trackapi.nutritionix.com/v2/natural/nutrients',
          headers: {
            'x-app-id': 'be5e867c',
            'x-app-key': '3b27a10ff089661f56fe020f25491216',
            'Content-Type': 'application/json'
          },
          data: {
            query: food.food_name
          }
        }).catch(err => null)
      );

      const detailResponses = await Promise.all(detailPromises);

      const formattedResults = detailResponses
        .filter(response => response !== null)
        .flatMap(response => response.data.foods)
        .map(food => ({
          fields: {
            item_name: food.food_name,
            serving_qty: food.serving_qty,
            serving_unit: food.serving_unit,
            nf_calories: Math.round(food.nf_calories || 0),
            nf_protein: Math.round(food.nf_protein || 0),
            nf_total_carbohydrate: Math.round(food.nf_total_carbohydrate || 0),
            nf_total_fat: Math.round(food.nf_total_fat || 0),
            nf_sugars: Math.round(food.nf_sugars || 0),
            nf_dietary_fiber: Math.round(food.nf_dietary_fiber || 0)
          }
        }));

      if (formattedResults.length === 0) {
        setError('Besin Değerleri Bulunamadı. Lütfen başka bir besin arayınız.');
      } else {
        setSearchResults(formattedResults);
      }
    } catch (err) {
      console.error('API Error:', err.response?.data || err.message);
      setError('Veriler alınamadı. Lütfen daha sonra tekrar deneyiniz.');
    } finally {
      setLoading(false);
    }
  };

  const renderFoodCard = (item, index) => (
    <Grid item xs={12} sm={6} md={4} key={index}>
      <Card 
        elevation={0}
        sx={{ 
          mb: 2, 
          height: '100%',
          transition: 'all 0.3s ease',
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          background: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(10px)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[4],
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          }
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <LocalDiningIcon color="primary" sx={{ mr: 1 }} />
            <Typography 
              variant="h6" 
              color="primary"
              sx={{ 
                fontWeight: 600,
                fontSize: '1.1rem',
                lineHeight: 1.2
              }}
            >
              {item.fields.item_name}
            </Typography>
          </Box>
          
          {item.fields.serving_qty && item.fields.serving_unit && (
            <Typography 
              variant="subtitle2" 
              color="text.secondary" 
              gutterBottom
              sx={{ mb: 2, fontStyle: 'italic' }}
            >
              Porsiyon: {item.fields.serving_qty} {item.fields.serving_unit}
            </Typography>
          )}
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                textAlign: 'center'
              }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Kalori
                </Typography>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                  {item.fields.nf_calories}
                  <Typography component="span" variant="caption" sx={{ ml: 0.5 }}>
                    kcal
                  </Typography>
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                bgcolor: alpha(theme.palette.success.main, 0.1),
                textAlign: 'center'
              }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Protein
                </Typography>
                <Typography variant="h6" color="success.main" sx={{ fontWeight: 600 }}>
                  {item.fields.nf_protein}
                  <Typography component="span" variant="caption" sx={{ ml: 0.5 }}>
                    g
                  </Typography>
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                bgcolor: alpha(theme.palette.warning.main, 0.1),
                textAlign: 'center'
              }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Karbonhidrat
                </Typography>
                <Typography variant="h6" color="warning.main" sx={{ fontWeight: 600 }}>
                  {item.fields.nf_total_carbohydrate}
                  <Typography component="span" variant="caption" sx={{ ml: 0.5 }}>
                    g
                  </Typography>
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                bgcolor: alpha(theme.palette.info.main, 0.1),
                textAlign: 'center'
              }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Yağ
                </Typography>
                <Typography variant="h6" color="info.main" sx={{ fontWeight: 600 }}>
                  {item.fields.nf_total_fat}
                  <Typography component="span" variant="caption" sx={{ ml: 0.5 }}>
                    g
                  </Typography>
                </Typography>
              </Box>
            </Grid>
            {(item.fields.nf_sugars > 0 || item.fields.nf_dietary_fiber > 0) && (
              <>
                <Grid item xs={6}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    bgcolor: alpha(theme.palette.error.main, 0.1),
                    textAlign: 'center'
                  }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Şeker
                    </Typography>
                    <Typography variant="h6" color="error.main" sx={{ fontWeight: 600 }}>
                      {item.fields.nf_sugars}
                      <Typography component="span" variant="caption" sx={{ ml: 0.5 }}>
                        g
                      </Typography>
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    bgcolor: alpha(theme.palette.success.light, 0.1),
                    textAlign: 'center'
                  }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Lif
                    </Typography>
                    <Typography variant="h6" color="success.light" sx={{ fontWeight: 600 }}>
                      {item.fields.nf_dietary_fiber}
                      <Typography component="span" variant="caption" sx={{ ml: 0.5 }}>
                        g
                      </Typography>
                    </Typography>
                  </Box>
                </Grid>
              </>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Grid>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box textAlign="center" mb={6}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontWeight: 700,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            textFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Sık Tüketilen Besinlerin Değerleri
        </Typography>
      </Box>
      
      {initialLoading ? (
        <Box display="flex" justifyContent="center" sx={{ my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {nutritionData.map((item, index) => renderFoodCard(item, index))}
        </Grid>
      )}

      <Divider sx={{ 
        my: 8,
        '&::before, &::after': {
          borderColor: alpha(theme.palette.primary.main, 0.2),
        }
      }} />

      <Box textAlign="center" mb={6}>
        <Typography 
          variant="h3" 
          component="h2" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            textFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Besin Ara
        </Typography>
      </Box>

      <Box 
        sx={{ 
          maxWidth: 800,
          mx: 'auto',
          mb: 6
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={9}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Enter food name in English (example: apple, banana, egg)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  searchNutrition();
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 3,
                  bgcolor: 'background.paper',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                  },
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              onClick={searchNutrition}
              disabled={loading}
              sx={{
                borderRadius: 3,
                py: 1.7,
                boxShadow: 2,
                '&:hover': {
                  boxShadow: 4,
                }
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Ara'
              )}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {error && (
        <Box 
          sx={{ 
            mb: 4, 
            p: 2, 
            borderRadius: 2, 
            bgcolor: alpha(theme.palette.error.main, 0.1),
            border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
            textAlign: 'center'
          }}
        >
          <Typography color="error">
            {error}
          </Typography>
        </Box>
      )}

      {searchResults.length > 0 && (
        <>
          <Box textAlign="center" mb={4}>
            <Typography 
              variant="h4" 
              gutterBottom
              sx={{ 
                fontWeight: 600,
                color: theme.palette.text.primary
              }}
            >
              Arama Sonuçları
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {searchResults.map((item, index) => renderFoodCard(item, index))}
          </Grid>
        </>
      )}
    </Container>
  );
};

export default NutritionPage; 