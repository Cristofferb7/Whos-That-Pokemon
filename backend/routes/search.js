import express from 'express';

const router = express.Router();
const POKEAPI_BASE = 'https://pokeapi.co/api/v2';

// GET /search/:name  →  returns Pokemon data from PokeAPI
router.get('/:name', async (req, res) => {
  const name = req.params.name.toLowerCase().trim();

  try {
    const response = await fetch(`${POKEAPI_BASE}/pokemon/${name}`);

    if (!response.ok) {
      return res.status(404).json({ error: `Pokemon "${name}" not found` });
    }

    const data = await response.json();

    res.json({
      id: data.id,
      name: data.name,
      types: data.types.map(t => t.type.name),
      height: data.height,
      weight: data.weight,
      stats: data.stats.map(s => ({ name: s.stat.name, value: s.base_stat })),
      abilities: data.abilities.map(a => a.ability.name),
      sprites: {
        front: data.sprites.front_default,
        frontShiny: data.sprites.front_shiny,
        official: data.sprites.other['official-artwork'].front_default,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch Pokemon data' });
  }
});

export default router;
