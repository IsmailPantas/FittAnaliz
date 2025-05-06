import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import * as ImagePicker from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const API_URL = 'http://10.0.2.2:3000/api';

const BodyAnalysisScreen = ({ navigation }) => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const selectImage = () => {
    const options = {
      title: 'Fotoğraf Seç',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    ImagePicker.launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        return;
      }

      if (response.error) {
        Alert.alert('Hata', 'Fotoğraf seçilirken bir hata oluştu');
        return;
      }

      setImage(response.assets[0]);
      await analyzeBody(response.assets[0]);
    });
  };

  const analyzeBody = async (selectedImage) => {
    try {
      setLoading(true);
      setResults(null);

      const formData = new FormData();
      formData.append('image', {
        uri: selectedImage.uri,
        type: selectedImage.type,
        name: selectedImage.fileName || 'photo.jpg',
      });
      formData.append('gender', 'male'); // Varsayılan olarak erkek

      const response = await fetch(`${API_URL}/body-analysis/analyze`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setResults(data.results);
    } catch (error) {
      Alert.alert('Hata', error.message);
    } finally {
      setLoading(false);
    }
  };

  const ResultItem = ({ label, value, unit = '' }) => (
    <View style={styles.resultItem}>
      <Text style={styles.resultLabel}>{label}</Text>
      <Text style={styles.resultValue}>{value}{unit}</Text>
    </View>
  );

  return (
    <LinearGradient colors={['#800080', '#4B0082']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={30} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Vücut Analizi</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.imageContainer} onPress={selectImage}>
          {image ? (
            <Image source={{ uri: image.uri }} style={styles.image} />
          ) : (
            <View style={styles.placeholderContainer}>
              <Icon name="camera" size={40} color="#fff" />
              <Text style={styles.placeholderText}>Fotoğraf Seç</Text>
            </View>
          )}
        </TouchableOpacity>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Analiz yapılıyor...</Text>
          </View>
        )}

        {results && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Analiz Sonuçları</Text>
            <ResultItem 
              label="Vücut Yağ Oranı" 
              value={results.bodyFatPercentage} 
              unit="%" 
            />
            <ResultItem 
              label="Bel-Kalça Oranı (WHR)" 
              value={results.whr} 
            />
            <ResultItem 
              label="Omuz Genişliği" 
              value={results.shoulderWidth} 
              unit=" px" 
            />
            <ResultItem 
              label="Kalça Genişliği" 
              value={results.hipWidth} 
              unit=" px" 
            />
            <ResultItem 
              label="Boy Uzunluğu" 
              value={results.height} 
              unit=" px" 
            />
          </View>
        )}
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 10,
  },
  backButton: {
    padding: 5,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginRight: 35,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  resultsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  resultLabel: {
    color: '#fff',
    fontSize: 16,
  },
  resultValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BodyAnalysisScreen; 