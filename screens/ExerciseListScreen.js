import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';

const RAPIDAPI_KEY = '7ff5988664msheb5eae186060375p148599jsn6ff4bd2e1e34';
const RAPIDAPI_HOST = 'exercisedb.p.rapidapi.com';

export default function ExerciseListScreen({ navigation, route }) {
  const { user } = route.params || {};
  const [bodyParts, setBodyParts] = useState([]);
  const [targets, setTargets] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [selectedBodyPart, setSelectedBodyPart] = useState('');
  const [selectedTarget, setSelectedTarget] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filteredTargets, setFilteredTargets] = useState([]);
  const [filteredEquipments, setFilteredEquipments] = useState([]);
  const [filteredBodyParts, setFilteredBodyParts] = useState([]);

  useEffect(() => {
    if (!user) {
      navigation.replace('Login');
    }
  }, [user]);

  useEffect(() => {
    const fetchFilters = async () => {
      setLoading(true);
      setError('');
      try {
        const [bodyPartsRes, targetsRes, equipmentsRes] = await Promise.all([
          axios.get('https://exercisedb.p.rapidapi.com/exercises/bodyPartList', {
            headers: {
              'X-RapidAPI-Key': RAPIDAPI_KEY,
              'X-RapidAPI-Host': RAPIDAPI_HOST,
            },
          }),
          axios.get('https://exercisedb.p.rapidapi.com/exercises/targetList', {
            headers: {
              'X-RapidAPI-Key': RAPIDAPI_KEY,
              'X-RapidAPI-Host': RAPIDAPI_HOST,
            },
          }),
          axios.get('https://exercisedb.p.rapidapi.com/exercises/equipmentList', {
            headers: {
              'X-RapidAPI-Key': RAPIDAPI_KEY,
              'X-RapidAPI-Host': RAPIDAPI_HOST,
            },
          }),
        ]);
        setBodyParts(bodyPartsRes.data);
        setTargets(targetsRes.data);
        setEquipments(equipmentsRes.data);
        setFilteredBodyParts(bodyPartsRes.data);
        setFilteredTargets(targetsRes.data);
        setFilteredEquipments(equipmentsRes.data);
      } catch (err) {
        setError('Filtre verileri alınırken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    if (!selectedBodyPart && !selectedTarget && !selectedEquipment) {
      setExercises([]);
      setFilteredBodyParts(bodyParts);
      setFilteredTargets(targets);
      setFilteredEquipments(equipments);
      return;
    }
    const fetchExercises = async () => {
      setLoading(true);
      setError('');
      try {
        let url = '';
        if (selectedBodyPart) {
          url = `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${selectedBodyPart}`;
        } else if (selectedTarget) {
          url = `https://exercisedb.p.rapidapi.com/exercises/target/${selectedTarget}`;
        } else if (selectedEquipment) {
          url = `https://exercisedb.p.rapidapi.com/exercises/equipment/${selectedEquipment}`;
        }
        const response = await axios.get(url, {
          headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': RAPIDAPI_HOST,
          },
        });
        let filtered = response.data;
        if (selectedBodyPart) filtered = filtered.filter(e => !selectedTarget || e.target === selectedTarget);
        if (selectedBodyPart) filtered = filtered.filter(e => !selectedEquipment || e.equipment === selectedEquipment);
        if (selectedTarget) filtered = filtered.filter(e => !selectedBodyPart || e.bodyPart === selectedBodyPart);
        if (selectedTarget) filtered = filtered.filter(e => !selectedEquipment || e.equipment === selectedEquipment);
        if (selectedEquipment) filtered = filtered.filter(e => !selectedBodyPart || e.bodyPart === selectedBodyPart);
        if (selectedEquipment) filtered = filtered.filter(e => !selectedTarget || e.target === selectedTarget);
        setExercises(filtered);
        setFilteredBodyParts([...new Set(filtered.map(e => e.bodyPart))]);
        setFilteredTargets([...new Set(filtered.map(e => e.target))]);
        setFilteredEquipments([...new Set(filtered.map(e => e.equipment))]);
        if (selectedBodyPart && !filtered.some(e => e.bodyPart === selectedBodyPart)) setSelectedBodyPart('');
        if (selectedTarget && !filtered.some(e => e.target === selectedTarget)) setSelectedTarget('');
        if (selectedEquipment && !filtered.some(e => e.equipment === selectedEquipment)) setSelectedEquipment('');
      } catch (err) {
        setError('Egzersiz verileri alınırken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    fetchExercises();
  }, [selectedBodyPart, selectedTarget, selectedEquipment, bodyParts, targets, equipments]);

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
        <Icon name="arrow-back" size={28} color="#800080" />
      </TouchableOpacity>
      <FlatList
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Egzersiz Hareketleri</Text>
            <Text style={styles.subtitle}>Vücut bölümü, hedef kas grubu veya ekipman seçerek egzersizleri filtreleyin.</Text>
            <View style={styles.filterRow}>
              <View style={styles.filterCol}>
                <Text style={styles.filterLabel}>Vücut Bölümü</Text>
                <Picker
                  selectedValue={selectedBodyPart}
                  onValueChange={setSelectedBodyPart}
                  style={styles.picker}
                >
                  <Picker.Item label="Tümü" value="" />
                  {filteredBodyParts.map((part, idx) => (
                    <Picker.Item label={part.charAt(0).toUpperCase() + part.slice(1)} value={part} key={idx} />
                  ))}
                </Picker>
              </View>
              <View style={styles.filterCol}>
                <Text style={styles.filterLabel}>Hedef Kas Grubu</Text>
                <Picker
                  selectedValue={selectedTarget}
                  onValueChange={setSelectedTarget}
                  style={styles.picker}
                >
                  <Picker.Item label="Tümü" value="" />
                  {filteredTargets.map((target, idx) => (
                    <Picker.Item label={target.charAt(0).toUpperCase() + target.slice(1)} value={target} key={idx} />
                  ))}
                </Picker>
              </View>
              <View style={styles.filterCol}>
                <Text style={styles.filterLabel}>Ekipman</Text>
                <Picker
                  selectedValue={selectedEquipment}
                  onValueChange={setSelectedEquipment}
                  style={styles.picker}
                >
                  <Picker.Item label="Tümü" value="" />
                  {filteredEquipments.map((eq, idx) => (
                    <Picker.Item label={eq.charAt(0).toUpperCase() + eq.slice(1)} value={eq} key={idx} />
                  ))}
                </Picker>
              </View>
            </View>
            {loading && <ActivityIndicator size="large" color="#800080" style={{ marginVertical: 20 }} />}
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </>
        }
        data={exercises}
        keyExtractor={(item, idx) => item.id || idx.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.gifUrl || item.image || 'https://via.placeholder.com/300x180?text=Egzersiz' }} style={styles.image} />
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardDesc}>{item.bodyPart} | {item.equipment} | {item.target}</Text>
          </View>
        )}
        ListEmptyComponent={!loading && <Text style={styles.empty}>Seçilen filtre(ler) için egzersiz bulunamadı.</Text>}
        contentContainerStyle={{ paddingTop: 56, paddingBottom: 20, paddingHorizontal: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#800080', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#555', marginBottom: 16 },
  filterRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  filterCol: { flex: 1, marginHorizontal: 4 },
  filterLabel: { fontSize: 14, color: '#800080', marginBottom: 4 },
  picker: { backgroundColor: '#f3f3f3', borderRadius: 8 },
  card: { backgroundColor: '#f9f9f9', borderRadius: 10, padding: 12, marginBottom: 12, alignItems: 'center', elevation: 2 },
  image: { width: '100%', height: 180, borderRadius: 8, marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#800080', marginBottom: 4 },
  cardDesc: { fontSize: 14, color: '#555' },
  error: { color: 'red', textAlign: 'center', marginVertical: 10 },
  empty: { color: '#888', textAlign: 'center', marginVertical: 20 },
  backButton: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    elevation: 2,
  },
}); 