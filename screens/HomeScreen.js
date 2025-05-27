import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MenuCard = ({ title, icon, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Icon name={icon} size={40} color="#800080" />
    <Text style={styles.cardText}>{title}</Text>
  </TouchableOpacity>
);

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    console.log('HomeScreen useEffect çalıştı');
    AsyncStorage.getItem('user').then(data => {
      console.log('AsyncStorage\'dan user verisi alındı:', data);
      if (data) {
        const parsedUser = JSON.parse(data);
        console.log('Parse edilmiş user:', parsedUser);
        setUser(parsedUser);
      } else {
        console.log('AsyncStorage\'da user verisi bulunamadı, Login ekranına yönlendiriliyor');
        navigation.replace('Login');
      }
    }).catch(error => {
      console.error('AsyncStorage okuma hatası:', error);
    });
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Çıkış Yap',
          onPress: () => navigation.replace('Login'),
        },
      ],
    );
  };

  const menuItems = [
    {
      title: 'Vücut Analizi',
      icon: 'human',
      onPress: () => navigation.navigate('BodyAnalysis'),
    },
    {
      title: 'Besin Değerleri',
      icon: 'food-apple',
      onPress: () => navigation.navigate('Nutrition', { user }),
    },
    {
      title: 'Beslenme Planı',
      icon: 'clipboard-text-outline',
      onPress: () => navigation.navigate('MealPlan', { user }),
    },
    {
      title: 'Egzersiz Hareketleri',
      icon: 'dumbbell',
      onPress: () => navigation.navigate('Exercises', { user }),
    },
    {
      title: 'İlerleme Takibi',
      icon: 'chart-line',
      onPress: () => console.log('İlerleme takibi'),
    },
    {
      title: 'Su Takibi',
      icon: 'water',
      onPress: () => navigation.navigate('WaterTracking', { user }),
    },
    {
      title: 'Profil',
      icon: 'account',
      onPress: () => console.log('Profil'),
    },
    {
      title: 'Egzersiz Planı',
      icon: 'clipboard-text',
      onPress: () => {
        console.log('Egzersiz Planı butonuna tıklandı, user:', user);
        navigation.navigate('ExercisePlan', { user });
      },
    },
  ];

  const filteredMenuItems = menuItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return (
      <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
        <ActivityIndicator size="large" color="#800080" />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#800080', '#4B0082']}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.topBar}>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => navigation.openDrawer()}
          >
            <Icon name="menu" size={24} color="#800080" />
          </TouchableOpacity>
          <View style={styles.searchContainer}>
            <Icon name="magnify" size={24} color="#800080" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Menüde ara..."
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Icon name="logout" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.welcomeText}>
          Hoş Geldin, {user?.firstName || 'Kullanıcı'}
        </Text>
        <Text style={styles.subtitle}>
          Bugün sağlıklı yaşam için ne yapmak istersin?
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.cardsContainer}>
          {filteredMenuItems.map((item, index) => (
            <MenuCard
              key={index}
              title={item.title}
              icon={item.icon}
              onPress={item.onPress}
            />
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  menuButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginRight: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#333',
    fontSize: 16,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: Dimensions.get('window').width / 2 - 20,
    marginBottom: 20,
    height: 120,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardText: {
    marginTop: 10,
    fontSize: 16,
    color: '#800080',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default HomeScreen; 