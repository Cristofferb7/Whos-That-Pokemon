import express from 'express';
import multer from 'multer';
import Anthropic from '@anthropic-ai/sdk';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const client = new Anthropic();
const POKEAPI_BASE = 'https://pokeapi.co/api/v2';

const SYSTEM_PROMPT = `You are a Pokemon expert and Pokedex AI. When shown an image, identify which Pokemon it is.
Respond ONLY with a JSON object in this exact format, no extra text:
{
  "name": "pokemon-name-lowercase",
  "confidence": "high|medium|low",
  "reasoning": "brief explanation of visual features that led to this identification"
}
If you cannot identify a Pokemon in the image, respond with:
{
  "name": null,
  "confidence": "low",
  "reasoning": "explanation of why identification failed"
}`;

// POST /identify  →  multipart image upload, returns identified Pokemon data
router.post('/', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image provided' });
  }

  const imageBase64 = req.file.buffer.toString('base64');
  const mediaType = req.file.mimetype;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: imageBase64 },
            },
            { type: 'text', text: 'What Pokemon is in this image?' },
          ],
        },
      ],
    });

    let identification;
    try {
      identification = JSON.parse(message.content[0].text);
    } catch {
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    if (!identification.name) {
      return res.status(422).json({
        error: 'Could not identify a Pokemon in this image',
        reasoning: identification.reasoning,
      });
    }

    // Cross-reference with PokeAPI to get full data + official sprites
    const pokeResponse = await fetch(`${POKEAPI_BASE}/pokemon/${identification.name}`);
    if (!pokeResponse.ok) {
      return res.status(404).json({
        error: `Identified as "${identification.name}" but not found in Pokedex`,
        identification,
      });
    }

    const data = await pokeResponse.json();

    res.json({
      identification: {
        name: identification.name,
        confidence: identification.confidence,
        reasoning: identification.reasoning,
      },
      pokemon: {
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
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Identification failed' });
  }
});

export default router;
