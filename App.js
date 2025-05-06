import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { StatusBar, View, Text, StyleSheet } from 'react-native';
import 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import BodyAnalysisScreen from './screens/BodyAnalysisScreen';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const CustomDrawerContent = ({ navigation }) => {
  return (
    <View style={styles.drawerContent}>
      <View style={styles.drawerHeader}>
        <Icon name="account-circle" size={60} color="#800080" />
        <Text style={styles.drawerHeaderText}>FitAnaliz</Text>
      </View>
      <View style={styles.drawerBody}>
        <Text style={styles.drawerItem} onPress={() => navigation.navigate('Home')}>
          <Icon name="home" size={24} color="#800080" /> Ana Sayfa
        </Text>
        <Text style={styles.drawerItem} onPress={() => navigation.navigate('BodyAnalysis')}>
          <Icon name="human" size={24} color="#800080" /> Vücut Analizi
        </Text>
        <Text style={styles.drawerItem} onPress={() => console.log('Profil')}>
          <Icon name="account" size={24} color="#800080" /> Profil
        </Text>
        <Text style={styles.drawerItem} onPress={() => console.log('Ayarlar')}>
          <Icon name="cog" size={24} color="#800080" /> Ayarlar
        </Text>
      </View>
    </View>
  );
};

const MainDrawer = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#fff',
          width: 280,
        },
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="BodyAnalysis" component={BodyAnalysisScreen} />
    </Drawer.Navigator>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#800080" />
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#800080' }
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="MainApp" 
          component={MainDrawer}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  drawerHeader: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  drawerHeaderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#800080',
    marginTop: 10,
  },
  drawerBody: {
    padding: 20,
  },
  drawerItem: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
});
