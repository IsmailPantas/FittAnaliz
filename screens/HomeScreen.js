import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const MenuCard = ({ title, icon, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Icon name={icon} size={40} color="#800080" />
    <Text style={styles.cardText}>{title}</Text>
  </TouchableOpacity>
);

const HomeScreen = ({ navigation, route }) => {
  const { user } = route.params || {};
  const [searchQuery, setSearchQuery] = useState('');

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
      onPress: () => console.log('Besin değerleri'),
    },
    {
      title: 'Beslenme Planı',
      icon: 'clipboard-text',
      onPress: () => console.log('Beslenme planı'),
    },
    {
      title: 'Egzersiz Planı',
      icon: 'dumbbell',
      onPress: () => console.log('Egzersiz planı'),
    },
    {
      title: 'İlerleme Takibi',
      icon: 'chart-line',
      onPress: () => console.log('İlerleme takibi'),
    },
    {
      title: 'Su Takibi',
      icon: 'water',
      onPress: () => console.log('Su takibi'),
    },
    {
      title: 'Profil',
      icon: 'account',
      onPress: () => console.log('Profil'),
    },
  ];

  const filteredMenuItems = menuItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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