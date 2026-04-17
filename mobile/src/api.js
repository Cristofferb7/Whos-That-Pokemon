// Change this to your computer's local IP when testing on a real phone
// On emulator you can use 10.0.2.2 (Android) or localhost (iOS simulator)
const BASE_URL = 'http://localhost:3000';

export async function searchPokemon(name) {
  const res = await fetch(`${BASE_URL}/search/${name.toLowerCase().trim()}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Pokemon not found');
  return data;
}

export async function identifyPokemon(imageUri) {
  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'pokemon.jpg',
  });

  const res = await fetch(`${BASE_URL}/identify`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Could not identify Pokemon');
  return data;
}
