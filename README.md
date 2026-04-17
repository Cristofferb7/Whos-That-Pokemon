# Pokedex App

A mobile app to find Pokemon by name or by taking a picture.

## Features
- Search any Pokemon by name (powered by PokeAPI)
- Identify Pokemon from a photo (powered by Claude AI vision)

## Project Structure
```
pokedex-app/
  backend/    # Express API server
  mobile/     # React Native app (Expo)
```

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
npm run dev
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/search/:name` | Lookup Pokemon by name |
| POST | `/identify` | Upload image, get Pokemon identification |
| GET | `/health` | Server health check |

## Mobile Setup
Coming soon — React Native (Expo) frontend.
