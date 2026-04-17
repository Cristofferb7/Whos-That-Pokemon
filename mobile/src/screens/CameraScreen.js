import { useState } from 'react';
import {
  View, Text, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import PokemonCard from '../components/PokemonCard';
import { identifyPokemon } from '../api';

export default function CameraScreen() {
  const [imageUri, setImageUri] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function pickFromCamera() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to take photos.');
      return;
    }
    const picked = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!picked.canceled) handleImage(picked.assets[0].uri);
  }

  async function pickFromGallery() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Gallery access is required.');
      return;
    }
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!picked.canceled) handleImage(picked.assets[0].uri);
  }

  async function handleImage(uri) {
    setImageUri(uri);
    setResult(null);
    setError(null);
    setLoading(true);
    try {
      const data = await identifyPokemon(uri);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setImageUri(null);
    setResult(null);
    setError(null);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Identify</Text>
        <Text style={styles.subtitle}>Take or upload a photo</Text>

        {!imageUri ? (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>📷</Text>
            <Text style={styles.placeholderText}>No image selected</Text>
          </View>
        ) : (
          <Image source={{ uri: imageUri }} style={styles.preview} />
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.btn} onPress={pickFromCamera}>
            <Text style={styles.btnText}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={pickFromGallery}>
            <Text style={[styles.btnText, styles.btnTextOutline]}>Gallery</Text>
          </TouchableOpacity>
        </View>

        {imageUri && !loading && !result && (
          <TouchableOpacity style={styles.resetBtn} onPress={reset}>
            <Text style={styles.resetText}>Clear</Text>
          </TouchableOpacity>
        )}

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#E63946" />
            <Text style={styles.loadingText}>Scanning image...</Text>
          </View>
        )}

        {error && <Text style={styles.error}>{error}</Text>}

        {result && (
          <>
            <PokemonCard
              pokemon={result.pokemon}
              source={result.identification?.source}
              reasoning={result.identification?.reasoning}
            />
            <TouchableOpacity style={styles.resetBtn} onPress={reset}>
              <Text style={styles.resetText}>Try another</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f5f5' },
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 36, fontWeight: '900', color: '#E63946', letterSpacing: 1 },
  subtitle: { fontSize: 16, color: '#999', marginBottom: 20 },
  placeholder: {
    height: 220, backgroundColor: '#fff', borderRadius: 20, borderWidth: 2,
    borderColor: '#eee', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center',
  },
  placeholderIcon: { fontSize: 48 },
  placeholderText: { color: '#ccc', marginTop: 8, fontSize: 15 },
  preview: { width: '100%', height: 220, borderRadius: 20, resizeMode: 'cover' },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  btn: {
    flex: 1, backgroundColor: '#E63946', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  btnOutline: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#E63946' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  btnTextOutline: { color: '#E63946' },
  loadingBox: { alignItems: 'center', marginTop: 32, gap: 10 },
  loadingText: { color: '#999', fontSize: 15 },
  error: { color: '#E63946', textAlign: 'center', marginTop: 24, fontSize: 15 },
  resetBtn: { marginTop: 16, alignItems: 'center' },
  resetText: { color: '#999', fontSize: 14, textDecorationLine: 'underline' },
});
