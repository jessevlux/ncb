# Nederlandse Uitspraaktrainer

Een webapplicatie voor het oefenen van Nederlandse uitspraak, met real-time spraakherkenning.

## Vereisten

- Node.js (v14 of hoger)
- Python 3.7 of hoger
- FFmpeg
- Vosk Nederlands taalmodel

## Installatie

1. Clone de repository:

```bash
git clone <repository-url>
cd uitspraaktrainer
```

2. Installeer Node.js dependencies:

```bash
npm install
```

3. Installeer Python dependencies:

```bash
pip install vosk
```

4. Download het Vosk Nederlands taalmodel:

```bash
# Maak een directory voor het model
mkdir vosk-model-small-nl-0.22
cd vosk-model-small-nl-0.22

# Download het model (vervang de URL met de meest recente versie)
wget https://alphacephei.com/vosk/models/vosk-model-small-nl-0.22.zip
unzip vosk-model-small-nl-0.22.zip
```

5. Installeer FFmpeg:

- Windows: Download van https://ffmpeg.org/download.html
- Mac: `brew install ffmpeg`
- Linux: `sudo apt-get install ffmpeg`

## Start de applicatie

1. Start de development server:

```bash
npm run dev
```

2. Open http://localhost:3000 in je browser

## Gebruik

1. Klik op "Start Opname" om te beginnen met opnemen
2. Spreek het woord of de zin in
3. Klik op "Stop Opname" om de opname te beëindigen
4. Wacht tot de transcriptie verschijnt
5. Vergelijk de transcriptie met wat je probeerde te zeggen

## Technische details

- Frontend: Next.js met TypeScript
- Backend: Node.js + Express
- Spraakherkenning: Vosk (offline)
- Audio verwerking: FFmpeg

## Licentie

MIT
