import sys
import json
import os
import difflib
import whisper

# Load Whisper model
model = whisper.load_model("small")

# Dutch words for pronunciation practice
DUTCH_WORDS = {
    "aa": ["maan", "paal", "zaal", "raam", "baan"],
    "ee": ["meer", "peer", "zeer", "reep", "beer"],
    "oo": ["moor", "poor", "zoor", "roos", "boon"],
    "uu": ["muur", "puur", "zuur", "ruim", "buur"],
    "ei": ["mei", "peil", "zeil", "rein", "beil"],
    "ij": ["mij", "pijl", "zijl", "rijm", "bijl"],
    "ui": ["muis", "puin", "zuil", "ruit", "buik"],
    "au": ["mauw", "pauw", "zauw", "rauw", "bauw"],
    "ou": ["mouw", "pouw", "zouw", "rouw", "bouw"],
    "eu": ["meubel", "peul", "zeur", "reus", "beugel"],
    "ie": ["mies", "pier", "zier", "riet", "bier"],
    "oe": ["moes", "poes", "zoet", "roet", "boer"]
}

def transcribe_audio(audio_file):
    """Transcribe audio using Whisper"""
    try:
        # Load and transcribe audio
        result = model.transcribe(audio_file, language="nl")
        return result["text"].strip()
    except Exception as e:
        print(f"Error transcribing audio: {str(e)}")
        return None

def compare_pronunciation(expected, actual, focus_sound=None):
    """Compare expected and actual pronunciation"""
    # Convert to lowercase for comparison
    expected = expected.lower()
    actual = actual.lower()
    
    # Calculate similarity ratio
    similarity = difflib.SequenceMatcher(None, expected, actual).ratio()
    
    # Check if focus sound is present
    if focus_sound and focus_sound in DUTCH_WORDS:
        expected_has_sound = any(focus_sound in word for word in expected.split())
        actual_has_sound = any(focus_sound in word for word in actual.split())
        
        if not expected_has_sound and actual_has_sound:
            similarity *= 0.8  # Penalty for using focus sound when not expected
        elif expected_has_sound and not actual_has_sound:
            similarity *= 0.7  # Penalty for missing focus sound
    
    return similarity

def generate_feedback(expected, actual, focus_sound, similarity):
    """Generate feedback based on pronunciation accuracy"""
    if similarity >= 0.9:
        return {
            "score": "Uitstekend!",
            "feedback": "Je uitspraak is perfect!",
            "similarity": similarity
        }
    elif similarity >= 0.8:
        return {
            "score": "Zeer goed!",
            "feedback": "Je uitspraak is bijna perfect. Probeer de klanken nog iets duidelijker uit te spreken.",
            "similarity": similarity
        }
    elif similarity >= 0.7:
        return {
            "score": "Goed!",
            "feedback": "Je uitspraak is goed, maar er is nog ruimte voor verbetering. Let extra op de '{}' klank.".format(focus_sound),
            "similarity": similarity
        }
    else:
        return {
            "score": "Oefen nog even",
            "feedback": "Probeer het nog een keer. Focus vooral op de '{}' klank.".format(focus_sound),
            "similarity": similarity
        }

def main():
    if len(sys.argv) < 3:
        print("Usage: python whisper_transcribe.py <audio_file> <expected_text> [focus_sound]")
        sys.exit(1)
    
    audio_file = sys.argv[1]
    expected_text = sys.argv[2]
    focus_sound = sys.argv[3] if len(sys.argv) > 3 else None
    
    # Transcribe audio
    actual_text = transcribe_audio(audio_file)
    if not actual_text:
        print(json.dumps({
            "error": "Kon de audio niet transcriberen"
        }))
        sys.exit(1)
    
    # Compare pronunciations
    similarity = compare_pronunciation(expected_text, actual_text, focus_sound)
    
    # Generate feedback
    feedback = generate_feedback(expected_text, actual_text, focus_sound, similarity)
    
    # Add transcription to feedback
    feedback["transcription"] = actual_text
    
    # Output JSON result
    print(json.dumps(feedback))

if __name__ == "__main__":
    main() 