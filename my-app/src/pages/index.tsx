import { useState, useRef, useEffect, CSSProperties } from "react";
import Head from "next/head";

const styles: Record<string, CSSProperties> = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(to bottom right, #eef2ff, #f3e8ff, #fce7f3)",
    color: "#1f2937",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: "'Poppins', sans-serif",
  },
  innerContainer: {
    width: "100%",
    maxWidth: "28rem",
    padding: "2rem 1rem",
  },
  header: {
    textAlign: "center",
    marginBottom: "3rem",
  },
  title: {
    fontSize: "2.25rem",
    fontWeight: "700",
    marginBottom: "0.75rem",
    color: "#000000",
    fontFamily: "'Poppins', sans-serif",
    letterSpacing: "-0.025em",
  },
  subtitle: {
    color: "#4b5563",
    fontSize: "1.125rem",
  },
  main: {
    background: "rgba(255, 255, 255, 0.8)",
    borderRadius: "1.5rem",
    boxShadow:
      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    overflow: "hidden",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    padding: "2rem",
  },
  contentWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  buttonSection: {
    position: "relative",
    marginBottom: "2rem",
    width: "100%",
  },
  recordingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  timerCircle: {
    width: "7rem",
    height: "7rem",
    marginBottom: "1.5rem",
    borderRadius: "9999px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: "4px",
  },
  timerText: {
    color: "#ef4444",
    fontFamily: "monospace",
    fontWeight: "700",
    fontSize: "1.5rem",
  },
  stopButton: {
    background: "linear-gradient(to right, #ef4444, #dc2626)",
    color: "white",
    fontWeight: "500",
    padding: "1rem 2rem",
    borderRadius: "9999px",
    boxShadow:
      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s ease-in-out",
    width: "100%",
    maxWidth: "20rem",
    border: "none",
    cursor: "pointer",
  },
  startButton: {
    background: "linear-gradient(to right, #4f46e5, #9333ea)",
    backgroundColor: "#000000",
    color: "white",
    fontWeight: "500",
    padding: "1rem 2rem",
    borderRadius: "9999px",
    boxShadow:
      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s ease-in-out",
    width: "100%",
    border: "none",
    cursor: "pointer",
  },
  errorContainer: {
    width: "100%",
    marginBottom: "1.5rem",
    padding: "1rem",
    background: "rgba(254, 226, 226, 0.8)",
    backdropFilter: "blur(4px)",
    border: "1px solid #fca5a5",
    borderRadius: "0.75rem",
    color: "#b91c1c",
    textAlign: "center",
  },
  transcriptContainer: {
    width: "100%",
    marginTop: "1.5rem",
    padding: "1.5rem",
    background: "rgba(249, 250, 251, 0.8)",
    backdropFilter: "blur(4px)",
    borderRadius: "0.75rem",
    border: "1px solid #e5e7eb",
  },
  transcriptTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    marginBottom: "1rem",
    background: "linear-gradient(to right, #4f46e5, #9333ea)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  transcriptContent: {
    background: "rgba(255, 255, 255, 0.8)",
    padding: "1.25rem",
    borderRadius: "0.5rem",
    border: "1px solid #e5e7eb",
    color: "#374151",
  },
  issuesContainer: {
    width: "100%",
    marginTop: "1.5rem",
    padding: "1.5rem",
    background: "rgba(255, 251, 235, 0.8)",
    backdropFilter: "blur(4px)",
    borderRadius: "0.75rem",
    border: "1px solid #fcd34d",
  },
  issuesTitle: {
    fontWeight: "600",
    color: "#92400e",
    marginBottom: "1rem",
    fontSize: "1.125rem",
  },
  issuesList: {
    listStyleType: "disc",
    paddingLeft: "1.25rem",
    color: "#b45309",
  },
  issueItem: {
    marginBottom: "0.5rem",
    fontSize: "0.875rem",
  },
  footer: {
    marginTop: "3rem",
    textAlign: "center",
    fontSize: "0.875rem",
    color: "#6b7280",
  },
  darkModeButton: {
    position: "absolute",
    top: "1rem",
    right: "1rem",
    background: "rgba(255, 255, 255, 0.3)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    borderRadius: "9999px",
    width: "3.5rem",
    height: "3.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    zIndex: 10,
    transition: "all 0.3s ease",
    color: "#4f46e5",
  },
  darkModeIcon: {
    width: "1.75rem",
    height: "1.75rem",
    transition: "all 0.3s ease",
  },
};

// Dark mode styles
const darkStyles: Record<string, CSSProperties> = {
  container: {
    minHeight: "100vh",
    background: "black",
    color: "#e2e8f0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: "'Poppins', sans-serif",
  },
  innerContainer: styles.innerContainer,
  header: styles.header,
  title: {
    ...styles.title,
    color: "#ffffff",
  },
  subtitle: {
    ...styles.subtitle,
    color: "#94a3b8",
  },
  main: {
    ...styles.main,
    background: "rgba(30, 41, 59, 0.2)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
  },
  contentWrapper: styles.contentWrapper,
  buttonSection: styles.buttonSection,
  recordingContainer: styles.recordingContainer,
  timerCircle: styles.timerCircle,
  timerText: styles.timerText,
  stopButton: {
    ...styles.stopButton,
    background: "linear-gradient(to right, #ef4444, #b91c1c)",
  },
  startButton: {
    ...styles.startButton,
    background: "linear-gradient(to right, #4f46e5, #7e22ce)",
  },
  errorContainer: {
    ...styles.errorContainer,
    background: "rgba(127, 29, 29, 0.5)",
    border: "1px solid #ef4444",
    color: "#fecaca",
  },
  transcriptContainer: {
    ...styles.transcriptContainer,
    background: "rgba(30, 41, 59, 0.5)",
    border: "1px solid #475569",
  },
  transcriptTitle: {
    ...styles.transcriptTitle,
    background: "linear-gradient(to right, #93c5fd, #c4b5fd)",
  },
  transcriptContent: {
    ...styles.transcriptContent,
    background: "rgba(30, 41, 59, 0.8)",
    border: "1px solid #475569",
    color: "#e2e8f0",
  },
  issuesContainer: {
    ...styles.issuesContainer,
    background: "rgba(120, 53, 15, 0.5)",
    border: "1px solid #d97706",
  },
  issuesTitle: {
    ...styles.issuesTitle,
    color: "#fbbf24",
  },
  issuesList: {
    ...styles.issuesList,
    color: "#fcd34d",
  },
  issueItem: styles.issueItem,
  footer: {
    ...styles.footer,
    color: "#94a3b8",
  },
  darkModeButton: {
    ...styles.darkModeButton,
    background: "rgba(30, 41, 59, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
    color: "#93c5fd",
  },
  darkModeIcon: {
    ...styles.darkModeIcon,
    color: "#93c5fd",
  },
};

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const [issues, setIssues] = useState<string[]>([]);
  const [isTestMode, setIsTestMode] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingAnimation, setRecordingAnimation] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Use the correct style set based on dark mode state
  const currentStyles = darkMode ? darkStyles : styles;

  useEffect(() => {
    // Check if user prefers dark mode
    const prefersDarkMode =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDarkMode(prefersDarkMode);

    // Listen for changes in color scheme preference
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setDarkMode(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

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

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div style={currentStyles.container}>
      <Head>
        <title>Nederlandse Uitspraaktrainer</title>
        <meta name="description" content="Oefen je Nederlandse uitspraak" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet"
        />
      </Head>

      <button
        onClick={toggleDarkMode}
        style={currentStyles.darkModeButton}
        aria-label="Donkere modus schakelen"
      >
        {darkMode ? (
          <svg
            style={currentStyles.darkModeIcon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        ) : (
          <svg
            style={currentStyles.darkModeIcon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        )}
      </button>

      <div style={currentStyles.innerContainer}>
        <header style={currentStyles.header}>
          <h1 style={currentStyles.title}>Nederlandse Uitspraaktrainer</h1>
          <p style={currentStyles.subtitle}>
            Oefen je uitspraak en krijg directe feedback
          </p>
        </header>

        <main style={currentStyles.main}>
          <div style={currentStyles.contentWrapper}>
            <div style={currentStyles.buttonSection}>
              {isRecording ? (
                <div style={currentStyles.recordingContainer}>
                  <div
                    style={{
                      ...currentStyles.timerCircle,
                      borderColor: recordingAnimation ? "#ef4444" : "#f87171",
                      animation: recordingAnimation
                        ? "pulse 2s infinite"
                        : "none",
                    }}
                  >
                    <div style={currentStyles.timerText}>
                      {formatTime(recordingTime)}
                    </div>
                  </div>
                  <button
                    onClick={stopRecording}
                    style={currentStyles.stopButton}
                  >
                    Stop Opname
                  </button>
                </div>
              ) : (
                <button
                  onClick={startRecording}
                  style={currentStyles.startButton}
                >
                  Start Opname
                </button>
              )}
            </div>

            {error && <div style={currentStyles.errorContainer}>{error}</div>}

            {transcript && (
              <div style={currentStyles.transcriptContainer}>
                <h2 style={currentStyles.transcriptTitle}>Transcriptie:</h2>
                <div style={currentStyles.transcriptContent}>{transcript}</div>
              </div>
            )}

            {isTestMode && issues.length > 0 && (
              <div style={currentStyles.issuesContainer}>
                <h3 style={currentStyles.issuesTitle}>
                  Om spraakherkenning te gebruiken moet je installeren:
                </h3>
                <ul style={currentStyles.issuesList}>
                  {issues.map((issue, index) => (
                    <li key={index} style={currentStyles.issueItem}>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </main>

        <footer style={currentStyles.footer}>
          <p>© {new Date().getFullYear()} Nederlandse Uitspraaktrainer</p>
        </footer>
      </div>
      <style jsx global>{`
        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 1;
          }
        }
        body {
          margin: 0;
          padding: 0;
        }
      `}</style>
    </div>
  );
}
