import { View, Text, Image, StyleSheet } from 'react-native';

const TYPE_COLORS = {
  fire: '#F08030', water: '#6890F0', grass: '#78C850', electric: '#F8D030',
  psychic: '#F85888', ice: '#98D8D8', dragon: '#7038F8', dark: '#705848',
  fairy: '#EE99AC', normal: '#A8A878', fighting: '#C03028', flying: '#A890F0',
  poison: '#A040A0', ground: '#E0C068', rock: '#B8A038', bug: '#A8B820',
  ghost: '#705898', steel: '#B8B8D0',
};

export default function PokemonCard({ pokemon, source, reasoning }) {
  if (!pokemon) return null;

  return (
    <View style={styles.card}>
      <Image source={{ uri: pokemon.sprites.official }} style={styles.sprite} />

      <Text style={styles.number}>#{String(pokemon.id).padStart(3, '0')}</Text>
      <Text style={styles.name}>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</Text>

      <View style={styles.types}>
        {pokemon.types.map(type => (
          <View key={type} style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[type] || '#888' }]}>
            <Text style={styles.typeText}>{type.toUpperCase()}</Text>
          </View>
        ))}
      </View>

      <View style={styles.statsRow}>
        <Stat label="Height" value={`${(pokemon.height / 10).toFixed(1)} m`} />
        <Stat label="Weight" value={`${(pokemon.weight / 10).toFixed(1)} kg`} />
      </View>

      <View style={styles.statsGrid}>
        {pokemon.stats.map(s => (
          <View key={s.name} style={styles.statItem}>
            <Text style={styles.statLabel}>{s.name.replace('special-', 'sp-').toUpperCase()}</Text>
            <View style={styles.statBarBg}>
              <View style={[styles.statBarFill, { width: `${Math.min((s.value / 150) * 100, 100)}%` }]} />
            </View>
            <Text style={styles.statValue}>{s.value}</Text>
          </View>
        ))}
      </View>

      {source && (
        <Text style={styles.source}>
          Identified by {source === 'huggingface' ? 'HuggingFace' : 'Gemini AI'}
          {reasoning ? ` · ${reasoning}` : ''}
        </Text>
      )}
    </View>
  );
}

function Stat({ label, value }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statBoxLabel}>{label}</Text>
      <Text style={styles.statBoxValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    marginTop: 16,
  },
  sprite: { width: 180, height: 180, resizeMode: 'contain' },
  number: { color: '#999', fontSize: 14, marginTop: 4 },
  name: { fontSize: 28, fontWeight: 'bold', color: '#333', marginTop: 2 },
  types: { flexDirection: 'row', gap: 8, marginTop: 10 },
  typeBadge: { paddingHorizontal: 14, paddingVertical: 4, borderRadius: 20 },
  typeText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  statsRow: { flexDirection: 'row', gap: 24, marginTop: 16 },
  statBox: { alignItems: 'center' },
  statBoxLabel: { color: '#999', fontSize: 12 },
  statBoxValue: { fontWeight: '600', fontSize: 16, color: '#333' },
  statsGrid: { width: '100%', marginTop: 16, gap: 6 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statLabel: { width: 70, fontSize: 10, color: '#999' },
  statBarBg: { flex: 1, height: 6, backgroundColor: '#eee', borderRadius: 4 },
  statBarFill: { height: 6, backgroundColor: '#E63946', borderRadius: 4 },
  statValue: { width: 30, fontSize: 12, color: '#333', textAlign: 'right' },
  source: { marginTop: 12, fontSize: 11, color: '#bbb', textAlign: 'center' },
});
