import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator, Platform } from 'react-native';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

const API_URL = 'http://10.0.2.2:3001/api';

const RegisterScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    birthDate: '',
    gender: '',
    height: '',
    weight: '',
  });
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const iso = selectedDate.toISOString().split('T')[0];
      setForm({ ...form, birthDate: iso });
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleRegister = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.password || !form.birthDate || !form.gender || !form.height || !form.weight) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }
    if (!validateEmail(form.email)) {
      Alert.alert('Hata', 'Geçerli bir e-posta adresi girin.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/register`, {
        ...form,
        height: Number(form.height),
        weight: Number(form.weight),
      });
      if (response.data.success) {
        Alert.alert('Başarılı', 'Kayıt başarılı! Giriş ekranına yönlendiriliyorsunuz.', [
          { text: 'Tamam', onPress: () => navigation.navigate('Login') }
        ]);
      } else {
        Alert.alert('Hata', response.data.message || 'Kayıt başarısız.');
      }
    } catch (err) {
      Alert.alert('Hata', err.response?.data?.message || 'Kayıt sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Kayıt Ol</Text>
      <TextInput style={styles.input} placeholder="Ad" value={form.firstName} onChangeText={v => handleChange('firstName', v)} />
      <TextInput style={styles.input} placeholder="Soyad" value={form.lastName} onChangeText={v => handleChange('lastName', v)} />
      <TextInput
        style={styles.input}
        placeholder="E-posta"
        value={form.email}
        onChangeText={v => handleChange('email', v)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput style={styles.input} placeholder="Şifre" value={form.password} onChangeText={v => handleChange('password', v)} secureTextEntry />
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input} activeOpacity={0.8}>
        <Text style={{ color: form.birthDate ? '#333' : '#aaa' }}>{form.birthDate ? form.birthDate : 'Doğum Tarihi Seç'}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={form.birthDate ? new Date(form.birthDate) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
      <View style={[styles.input, { paddingHorizontal: 0, paddingVertical: 0, justifyContent: 'center', height: 56 }]}> 
        <Picker
          selectedValue={form.gender}
          onValueChange={v => handleChange('gender', v)}
          style={{ width: '100%', height: 56, color: form.gender ? '#333' : '#aaa', fontSize: 16, textAlignVertical: 'center' }}
          itemStyle={{ fontSize: 16, height: 56 }}
          dropdownIconColor="#800080"
        >
          <Picker.Item label="Cinsiyet Seçin" value="" color="#aaa" />
          <Picker.Item label="Erkek" value="male" color="#333" />
          <Picker.Item label="Kadın" value="female" color="#333" />
        </Picker>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Boy (cm)"
        value={form.height}
        onChangeText={v => handleChange('height', v.replace(/[^0-9]/g, ''))}
        keyboardType="numeric"
        maxLength={3}
      />
      <TextInput
        style={styles.input}
        placeholder="Kilo (kg)"
        value={form.weight}
        onChangeText={v => handleChange('weight', v.replace(/[^0-9]/g, ''))}
        keyboardType="numeric"
        maxLength={3}
      />
      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Kayıt Ol</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 16 }}>
        <Text style={styles.link}>Zaten hesabınız var mı? Giriş Yap</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#800080' },
  input: { width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 0, marginBottom: 12, backgroundColor: '#fff', height: 56 },
  button: { backgroundColor: '#800080', padding: 15, borderRadius: 8, width: '100%', alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { color: '#800080', marginTop: 16, textDecorationLine: 'underline' },
});

export default RegisterScreen; 