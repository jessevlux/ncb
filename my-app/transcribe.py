import sys
import wave
import json
from vosk import Model, KaldiRecognizer

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
    
    # Return the complete transcript
    return " ".join(results)

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