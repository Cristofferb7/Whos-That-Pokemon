import express from 'express';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const POKEAPI_BASE = 'https://pokeapi.co/api/v2';
const HF_API_URL = 'https://api-inference.huggingface.co/models/imjeffhi/pokemon_classifier';

// Step 1: Try HuggingFace Pokemon-specific classifier (fast, free, no key needed)
async function classifyWithHuggingFace(imageBuffer) {
  const response = await fetch(HF_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      // optional: add HF token for higher rate limits
      ...(process.env.HF_TOKEN && { Authorization: `Bearer ${process.env.HF_TOKEN}` }),
    },
    body: imageBuffer,
  });

  if (!response.ok) throw new Error(`HuggingFace error: ${response.status}`);

  const results = await response.json();
  // results = [{ label: "charizard", score: 0.95 }, ...]
  if (!Array.isArray(results) || results.length === 0) throw new Error('No results from HuggingFace');

  const top = results[0];
  return {
    name: top.label.toLowerCase().replace(/\s+/g, '-'),
    score: top.score,
    confidence: top.score >= 0.7 ? 'high' : top.score >= 0.4 ? 'medium' : 'low',
  };
}

// Step 2: Fallback to Gemini vision when HuggingFace confidence is low
async function classifyWithGemini(imageBuffer, mediaType) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are a Pokemon expert. Identify the Pokemon in this image.
Respond ONLY with a JSON object, no markdown, no extra text:
{"name":"pokemon-name-lowercase","confidence":"high|medium|low","reasoning":"brief visual explanation"}
If no Pokemon is visible: {"name":null,"confidence":"low","reasoning":"explanation"}`;

  const result = await model.generateContent([
    prompt,
    { inlineData: { mimeType: mediaType, data: imageBuffer.toString('base64') } },
  ]);

  const text = result.response.text().trim();
  // Strip markdown code fences if Gemini wraps the JSON
  const clean = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
  return JSON.parse(clean);
}

// Fetch full Pokemon data from PokeAPI
async function fetchPokemonData(name) {
  const response = await fetch(`${POKEAPI_BASE}/pokemon/${name}`);
  if (!response.ok) return null;
  const data = await response.json();
  return {
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
  };
}

// POST /identify  →  multipart image upload, returns identified Pokemon + full Pokedex data
router.post('/', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image provided' });
  }

  const { buffer, mimetype } = req.file;
  let identification = null;
  let source = null;

  // Try HuggingFace first
  try {
    const hfResult = await classifyWithHuggingFace(buffer);
    console.log(`HuggingFace: ${hfResult.name} (${hfResult.score.toFixed(2)})`);

    if (hfResult.confidence === 'high' || hfResult.confidence === 'medium') {
      identification = { name: hfResult.name, confidence: hfResult.confidence, reasoning: `Classifier score: ${(hfResult.score * 100).toFixed(0)}%` };
      source = 'huggingface';
    }
  } catch (err) {
    console.warn('HuggingFace failed, falling back to Gemini:', err.message);
  }

  // Fall back to Gemini if HF failed or confidence was low
  if (!identification) {
    try {
      const geminiResult = await classifyWithGemini(buffer, mimetype);
      console.log(`Gemini: ${geminiResult.name} (${geminiResult.confidence})`);
      identification = geminiResult;
      source = 'gemini';
    } catch (err) {
      console.error('Gemini also failed:', err.message);
      return res.status(500).json({ error: 'Both recognition services failed. Try a clearer image.' });
    }
  }

  if (!identification.name) {
    return res.status(422).json({
      error: 'Could not identify a Pokemon in this image',
      reasoning: identification.reasoning,
    });
  }

  // Cross-reference with PokeAPI for full data
  const pokemon = await fetchPokemonData(identification.name);
  if (!pokemon) {
    return res.status(404).json({
      error: `Identified as "${identification.name}" but not found in Pokedex`,
      identification,
    });
  }

  res.json({ identification: { ...identification, source }, pokemon });
});

export default router;
