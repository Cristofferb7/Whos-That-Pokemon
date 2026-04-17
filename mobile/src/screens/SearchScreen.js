import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PokemonCard from '../components/PokemonCard';
import { searchPokemon } from '../api';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setPokemon(null);
    try {
      const data = await searchPokemon(query);
      setPokemon(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Pokedex</Text>
          <Text style={styles.subtitle}>Search by name</Text>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="e.g. pikachu, charizard..."
              placeholderTextColor="#bbb"
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.button} onPress={handleSearch} disabled={loading}>
              <Text style={styles.buttonText}>GO</Text>
            </TouchableOpacity>
          </View>

          {loading && <ActivityIndicator size="large" color="#E63946" style={{ marginTop: 40 }} />}
          {error && <Text style={styles.error}>{error}</Text>}
          {pokemon && <PokemonCard pokemon={pokemon} />}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f5f5' },
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 36, fontWeight: '900', color: '#E63946', letterSpacing: 1 },
  subtitle: { fontSize: 16, color: '#999', marginBottom: 20 },
  inputRow: { flexDirection: 'row', gap: 10 },
  input: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16,
    paddingVertical: 12, fontSize: 16, color: '#333',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  button: {
    backgroundColor: '#E63946', borderRadius: 12,
    paddingHorizontal: 20, justifyContent: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  error: { color: '#E63946', textAlign: 'center', marginTop: 24, fontSize: 15 },
});
