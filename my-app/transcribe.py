import sys
import wave
import json
import re
from vosk import Model, KaldiRecognizer

# Common Dutch corrections
DUTCH_CORRECTIONS = {
    # Common mispronunciations
    "de": "de",
    "het": "het",
    "een": "een",
    "en": "en",
    "in": "in",
    "van": "van",
    "ik": "ik",
    "je": "je",
    "is": "is",
    "dat": "dat",
    "die": "die",
    "dit": "dit",
    "met": "met",
    "op": "op",
    "te": "te",
    "voor": "voor",
    "zijn": "zijn",
    "aan": "aan",
    "ook": "ook",
    "als": "als",
    "bij": "bij",
    "naar": "naar",
    "om": "om",
    "over": "over",
    "per": "per",
    "tot": "tot",
    "uit": "uit",
    "van": "van",
    "via": "via",
    "zonder": "zonder",
}

def correct_transcription(text):
    # Split into words
    words = text.split()
    
    # Apply corrections
    corrected_words = []
    for word in words:
        # Convert to lowercase for comparison
        lower_word = word.lower()
        
        # Check if word needs correction
        if lower_word in DUTCH_CORRECTIONS:
            corrected_words.append(DUTCH_CORRECTIONS[lower_word])
        else:
            corrected_words.append(word)
    
    # Join words back together
    return " ".join(corrected_words)

def transcribe_audio(audio_file):
    # Load the Dutch model
    model = Model("vosk-model-small-nl-0.22")
    
    # Open the audio file
    wf = wave.open(audio_file, "rb")
    
    # Create a recognizer
    rec = KaldiRecognizer(model, wf.getframerate())
    rec.SetWords(True)
    
    # Process the audio file
    results = []
    while True:
        data = wf.readframes(4000)
        if len(data) == 0:
            break
        if rec.AcceptWaveform(data):
            result = json.loads(rec.Result())
            if result.get("text"):
                results.append(result["text"])
    
    # Get the final result
    final_result = json.loads(rec.FinalResult())
    if final_result.get("text"):
        results.append(final_result["text"])
    
    # Join all results
    transcript = " ".join(results)
    
    # Apply corrections
    corrected_transcript = correct_transcription(transcript)
    
    return corrected_transcript

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python transcribe.py <audio_file>")
        sys.exit(1)
    
    audio_file = sys.argv[1]
    try:
        transcript = transcribe_audio(audio_file)
        print(transcript)
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1) 