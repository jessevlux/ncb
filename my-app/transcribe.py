import sys
import wave
import json
from vosk import Model, KaldiRecognizer

def transcribe_audio(audio_file):
    # Load the Dutch model
    model = Model("vosk-model-small-nl-0.22")
    
    # Open the audio file
    wf = wave.open(audio_file, "rb")
    
    # Create a recognizer with alternatives
    rec = KaldiRecognizer(model, wf.getframerate())
    rec.SetWords(True)
    rec.SetMaxAlternatives(5)  # Get up to 5 alternative transcriptions
    
    # Process the audio file
    segments = []
    
    while True:
        data = wf.readframes(4000)
        if len(data) == 0:
            break
        if rec.AcceptWaveform(data):
            segment_result = json.loads(rec.Result())
            if segment_result:
                segments.append(segment_result)
    
    # Get the final result
    final_segment = json.loads(rec.FinalResult())
    if final_segment:
        segments.append(final_segment)
    
    # Prepare the complete result with raw details
    complete_result = {
        "raw_segments": segments,
        "raw_text": " ".join([segment.get("text", "") for segment in segments]),
        "words": [],
        "alternatives": []
    }
    
    # Extract all words with their details
    for segment in segments:
        if "result" in segment:
            complete_result["words"].extend(segment["result"])
        
        # Add alternatives if available
        if "alternatives" in segment:
            complete_result["alternatives"].extend(segment["alternatives"])
    
    return complete_result

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python transcribe.py <audio_file>")
        sys.exit(1)
    
    audio_file = sys.argv[1]
    try:
        result = transcribe_audio(audio_file)
        # Output as JSON to stdout for easy parsing by backend
        print(json.dumps(result, ensure_ascii=False))
    except Exception as e:
        error_response = {
            "error": str(e),
            "success": False
        }
        print(json.dumps(error_response, ensure_ascii=False), file=sys.stderr)
        sys.exit(1) 