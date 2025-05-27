import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const NutritionCard = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <TouchableOpacity 
      onPress={() => setIsExpanded(!isExpanded)}
      style={styles.card}
    >
      <LinearGradient
        colors={['#6B46C1', '#4C1D95']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Icon 
            name={isExpanded ? 'chevron-up' : 'chevron-down'} 
            size={24} 
            color="#fff" 
          />
        </View>

        <View style={styles.mainNutrients}>
          <View style={styles.nutrientItem}>
            <Text style={styles.nutrientValue}>{item.calories}</Text>
            <Text style={styles.nutrientLabel}>Kalori</Text>
          </View>
          <View style={[styles.nutrientItem, styles.middleNutrient]}>
            <Text style={styles.nutrientValue}>{item.protein}g</Text>
            <Text style={styles.nutrientLabel}>Protein</Text>
          </View>
          <View style={styles.nutrientItem}>
            <Text style={styles.nutrientValue}>{item.carbs}g</Text>
            <Text style={styles.nutrientLabel}>Karbonhidrat</Text>
          </View>
        </View>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Yağ</Text>
                <Text style={styles.detailValue}>{item.fat}g</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Doymuş Yağ</Text>
                <Text style={styles.detailValue}>{item.saturatedFat}g</Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Lif</Text>
                <Text style={styles.detailValue}>{item.fiber}g</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Şeker</Text>
                <Text style={styles.detailValue}>{item.sugar}g</Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Sodyum</Text>
                <Text style={styles.detailValue}>{item.sodium}mg</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Potasyum</Text>
                <Text style={styles.detailValue}>{item.potassium}mg</Text>
              </View>
            </View>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const NutritionScreen = ({ navigation, route }) => {
  const { user } = route.params || {};
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [nutritionData, setNutritionData] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!user) {
      navigation.replace('Login');
    }
  }, [user]);

  // Yaygın besinleri yükle
  useEffect(() => {
    fetchCommonFoods();
  }, []);

  const fetchCommonFoods = async () => {
    setLoading(true);
    try {
      const commonFoods = [
        {
          id: 1,
          name: 'Yulaf',
          calories: 389,
          protein: 16.9,
          carbs: 66.3,
          fat: 6.9,
          saturatedFat: 1.2,
          fiber: 10.6,
          sugar: 0,
          sodium: 2,
          potassium: 429,
        },
        {
          id: 2,
          name: 'Muz',
          calories: 89,
          protein: 1.1,
          carbs: 22.8,
          fat: 0.3,
          saturatedFat: 0.1,
          fiber: 2.6,
          sugar: 12.2,
          sodium: 1,
          potassium: 358,
        },
        {
          id: 3,
          name: 'Yumurta',
          calories: 155,
          protein: 12.6,
          carbs: 1.1,
          fat: 11.3,
          saturatedFat: 3.3,
          fiber: 0,
          sugar: 0.4,
          sodium: 124,
          potassium: 126,
        },
        {
          id: 4,
          name: 'Tavuk Göğsü',
          calories: 165,
          protein: 31,
          carbs: 0,
          fat: 3.6,
          saturatedFat: 1,
          fiber: 0,
          sugar: 0,
          sodium: 74,
          potassium: 256,
        },
        {
          id: 5,
          name: 'Tam Buğday Ekmeği',
          calories: 247,
          protein: 13,
          carbs: 41,
          fat: 3.4,
          saturatedFat: 0.4,
          fiber: 7,
          sugar: 6,
          sodium: 478,
          potassium: 250,
        },
      ];
      setNutritionData(commonFoods);
    } catch (error) {
      Alert.alert('Hata', 'Besin verileri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Besin arama işlevi
  const searchNutrition = async (query) => {
    if (!query.trim()) {
      fetchCommonFoods();
      return;
    }

    setSearching(true);
    try {
      // API'den besin arama
      const response = await axios({
        method: 'GET',
        url: 'https://trackapi.nutritionix.com/v2/search/instant',
        headers: {
          'x-app-id': 'be5e867c',
          'x-app-key': '3b27a10ff089661f56fe020f25491216',
        },
        params: {
          query: query,
          detailed: true,
        },
      });

      if (response.data) {
        const searchResults = response.data.common.map(item => ({
          id: item.food_name,
          name: item.food_name,
          calories: item.full_nutrients?.find(n => n.attr_id === 208)?.value || 0,
          protein: item.full_nutrients?.find(n => n.attr_id === 203)?.value || 0,
          carbs: item.full_nutrients?.find(n => n.attr_id === 205)?.value || 0,
          fat: item.full_nutrients?.find(n => n.attr_id === 204)?.value || 0,
          saturatedFat: item.full_nutrients?.find(n => n.attr_id === 606)?.value || 0,
          fiber: item.full_nutrients?.find(n => n.attr_id === 291)?.value || 0,
          sugar: item.full_nutrients?.find(n => n.attr_id === 269)?.value || 0,
          sodium: item.full_nutrients?.find(n => n.attr_id === 307)?.value || 0,
          potassium: item.full_nutrients?.find(n => n.attr_id === 306)?.value || 0,
        }));
        setNutritionData(searchResults);
      }
    } catch (error) {
      Alert.alert('Hata', 'Besin arama sırasında bir hata oluştu.');
      fetchCommonFoods();
    } finally {
      setSearching(false);
    }
  };

  // Arama debounce işlevi
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      searchNutrition(searchQuery);
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  return (
    <LinearGradient
      colors={['#4C1D95', '#2D1264']}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Besin Değerleri</Text>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="magnify" size={24} color="#4C1D95" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Besin ara..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searching && (
          <ActivityIndicator size="small" color="#4C1D95" style={styles.searchLoading} />
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {nutritionData.length > 0 ? (
            nutritionData.map((item) => (
              <NutritionCard key={item.id} item={item} />
            ))
          ) : (
            <View style={styles.noResultsContainer}>
              <Icon name="food-off" size={48} color="#fff" />
              <Text style={styles.noResultsText}>Besin bulunamadı</Text>
            </View>
          )}
        </ScrollView>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 48 : 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  cardGradient: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  mainNutrients: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  nutrientItem: {
    flex: 1,
    alignItems: 'center',
  },
  middleNutrient: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
  },
  nutrientValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  nutrientLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  searchLoading: {
    marginLeft: 8,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  noResultsText: {
    fontSize: 16,
    color: '#fff',
    marginTop: 8,
  },
});

export default NutritionScreen; 