import { useState, useRef, useEffect } from "react";
import Head from "next/head";

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const [issues, setIssues] = useState<string[]>([]);
  const [isTestMode, setIsTestMode] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingAnimation, setRecordingAnimation] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording) {
      setRecordingAnimation(true);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingAnimation(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setRecordingTime(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError("");
      setIssues([]);
    } catch (err) {
      setError(
        "Kon geen toegang krijgen tot de microfoon. Controleer de permissies."
      );
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current) return;

    return new Promise<void>((resolve) => {
      mediaRecorderRef.current!.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        await sendAudioToBackend(audioBlob);
        resolve();
      };

      mediaRecorderRef.current!.stop();
      mediaRecorderRef
        .current!.stream.getTracks()
        .forEach((track) => track.stop());
      setIsRecording(false);
    });
  };

  const sendAudioToBackend = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok && response.status !== 200) {
        throw new Error("Server error");
      }

      const data = await response.json();
      setTranscript(data.transcript);

      if (data.mockMode) {
        setIsTestMode(true);
        setIssues(data.issues || []);
      } else {
        setIsTestMode(false);
      }
    } catch (err) {
      setError("Er is een fout opgetreden bij het verwerken van de opname.");
      console.error("Error sending audio:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 text-gray-800 dark:text-gray-200 font-['Poppins']">
      <Head>
        <title>Nederlandse Uitspraaktrainer</title>
        <meta name="description" content="Oefen je Nederlandse uitspraak" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="container mx-auto px-4 py-8 max-w-md">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
            Nederlandse Uitspraaktrainer
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Oefen je uitspraak en krijg directe feedback
          </p>
        </header>

        <main className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-white/20 dark:border-gray-700/20">
          <div className="p-8">
            <div className="flex flex-col items-center justify-center">
              <div className="relative mb-8 w-full">
                {isRecording ? (
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-28 h-28 mb-6 rounded-full flex items-center justify-center border-4 ${
                        recordingAnimation
                          ? "border-red-500 animate-pulse"
                          : "border-red-400"
                      }`}
                    >
                      <div className="text-red-500 font-mono font-bold text-2xl">
                        {formatTime(recordingTime)}
                      </div>
                    </div>
                    <button
                      onClick={stopRecording}
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-4 px-8 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 w-full max-w-xs"
                    >
                      Stop Opname
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={startRecording}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-4 px-8 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 w-full"
                  >
                    Start Opname
                  </button>
                )}
              </div>

              {error && (
                <div className="w-full mb-6 p-4 bg-red-50/80 dark:bg-red-900/30 backdrop-blur-sm border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-center">
                  {error}
                </div>
              )}

              {transcript && (
                <div className="w-full mt-6 p-6 bg-gray-50/80 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
                    Transcriptie:
                  </h2>
                  <div className="bg-white/80 dark:bg-gray-800/80 p-5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                    {transcript}
                  </div>
                </div>
              )}

              {isTestMode && issues.length > 0 && (
                <div className="w-full mt-6 p-6 bg-amber-50/80 dark:bg-amber-900/20 backdrop-blur-sm rounded-xl border border-amber-200 dark:border-amber-800">
                  <h3 className="font-semibold text-amber-800 dark:text-amber-400 mb-4 text-lg">
                    Om spraakherkenning te gebruiken moet je installeren:
                  </h3>
                  <ul className="list-disc pl-5 space-y-2 text-amber-700 dark:text-amber-300">
                    {issues.map((issue, index) => (
                      <li key={index} className="text-sm">
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </main>

        <footer className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Nederlandse Uitspraaktrainer</p>
        </footer>
      </div>
    </div>
  );
}
