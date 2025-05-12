import sys
import json
import os
import difflib
import whisper

# Load Whisper model - using small for better speed/accuracy balance
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

def transcribe_audio(audio_file, expected_text="", focus_sound=""):
    """Transcribe audio using Whisper"""
    try:
        # Create a more specific prompt for non-native speakers
        prompt = f"""Dit is een Nederlandse uitspraak oefening. 
De spreker is een taalleerder die Nederlands leert.
De verwachte tekst is: "{expected_text}"
De focus klank is: "{focus_sound}"
Let extra op de uitspraak van de {focus_sound} klank.
Transcribeer exact wat de spreker zegt, ook als de uitspraak niet perfect is.
De spreker zegt: """

        # Load and transcribe audio with optimized settings for non-native speakers
        result = model.transcribe(
            audio_file,
            language="nl",
            task="transcribe",
            beam_size=5,
            best_of=5,
            temperature=0.0,  
            compression_ratio_threshold=2.4,
            condition_on_previous_text=True,
            initial_prompt=prompt,
            word_timestamps=True,  # Voor betere klankherkenning
            suppress_tokens=[],  # Geen tokens onderdrukken
            no_speech_threshold=0.6,  # Meer tolerant voor pauzes
            logprob_threshold=-1.0,  # Meer tolerant voor onzekere voorspellingen
        )
        
        transcription = result["text"].strip()
        
        # Prepare response
        response = {
            "transcription": transcription,
            "expected": expected_text,
            "focus_sound": focus_sound,
            "confidence": result.get("confidence", 0.0)  # Voeg confidence score toe
        }
        
        # Print as JSON for the API to parse
        print(json.dumps(response))
    except Exception as e:
        print(f"Error transcribing audio: {str(e)}")

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
    if len(sys.argv) < 2:
        print("Usage: python whisper_transcribe.py <audio_file> [expected_text] [focus_sound]")
        sys.exit(1)
    
    audio_file = sys.argv[1]
    expected_text = sys.argv[2] if len(sys.argv) > 2 else ""
    focus_sound = sys.argv[3] if len(sys.argv) > 3 else ""
    
    transcribe_audio(audio_file, expected_text, focus_sound)

if __name__ == "__main__":
    main() 