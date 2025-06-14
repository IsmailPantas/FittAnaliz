import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { StatusBar, View, Text, StyleSheet } from 'react-native';
import 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { UserProvider } from './UserContext';

import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import BodyAnalysisScreen from './screens/BodyAnalysisScreen';
import NutritionScreen from './screens/NutritionScreen';
import ExerciseListScreen from './screens/ExerciseListScreen';
import RegisterScreen from './screens/RegisterScreen';
import ExercisePlanScreen from './screens/ExercisePlanScreen';
import MealPlanScreen from './screens/MealPlanScreen';
import WaterTrackingScreen from './screens/WaterTrackingScreen';
import { SafeAreaView } from 'react-native-safe-area-context';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const CustomDrawerContent = ({ navigation, state }) => {
  // Aktif ekrandaki user parametresini bul
  const currentRoute = state?.routes?.[state.index];
  const user = currentRoute?.params?.user;
  const userId = user?._id;
  return (
    <SafeAreaView style={styles.drawerContent}>
    <View style={styles.drawerContent}>
      <View style={styles.drawerHeader}>
        <Icon name="account-circle" size={60} color="#800080" />
        <Text style={styles.drawerHeaderText}>FitAnaliz</Text>
      </View>
      <View style={styles.drawerBody}>
        <Text style={styles.drawerItem} onPress={() => navigation.navigate('Home', { user, userId })}>
          <Icon name="home" size={24} color="#800080" /> Ana Sayfa
        </Text>
        <Text style={styles.drawerItem} onPress={() => navigation.navigate('BodyAnalysis', { user, userId })}>
          <Icon name="human" size={24} color="#800080" /> Vücut Analizi
        </Text>
        <Text style={styles.drawerItem} onPress={() => navigation.navigate('Nutrition', { user, userId })}>
          <Icon name="food-apple" size={24} color="#800080" /> Besin Değerleri
        </Text>
        <Text style={styles.drawerItem} onPress={() => navigation.navigate('Exercises', { user, userId })}>
          <Icon name="dumbbell" size={24} color="#800080" /> Egzersiz Hareketleri
        </Text>
        <Text style={styles.drawerItem} onPress={() => navigation.navigate('ExercisePlan', { user, userId })}>
          <Icon name="clipboard-text" size={24} color="#800080" /> Egzersiz Planı
        </Text>
        <Text style={styles.drawerItem} onPress={() => console.log('Profil')}>
          <Icon name="account" size={24} color="#800080" /> Profil
        </Text>
        <Text style={styles.drawerItem} onPress={() => console.log('Ayarlar')}>
          <Icon name="cog" size={24} color="#800080" /> Ayarlar
        </Text>
      </View>
    </View>
    </SafeAreaView>
  );
};

const MainDrawer = ({ route }) => {
  const user = route?.params?.user;
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
      <Drawer.Screen name="Home" component={HomeScreen} initialParams={{ user }} />
      <Drawer.Screen name="BodyAnalysis" component={BodyAnalysisScreen} />
      <Drawer.Screen name="Nutrition" component={NutritionScreen} />
      <Drawer.Screen name="Exercises" component={ExerciseListScreen} />
      <Drawer.Screen name="ExercisePlan" component={ExercisePlanScreen} />
      <Drawer.Screen name="MealPlan" component={MealPlanScreen} />
      <Drawer.Screen name="WaterTracking" component={WaterTrackingScreen} />
    </Drawer.Navigator>
  );
};

export default function App() {
  return (
    <UserProvider>
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
            name="Register" 
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="MainApp" 
            component={MainDrawer}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="ExercisePlan" 
            component={ExercisePlanScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  drawerHeader: {
    padding: 20,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  drawerHeaderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#800080',
    marginTop: 10,
  },
  drawerBody: {
    padding: 15,
  },
  drawerItem: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
    marginBottom: 5,
  },
});
