import type { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import multer from 'multer';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

// Configure multer for file upload
const upload = multer({
  storage: multer.diskStorage({
    destination: os.tmpdir(),
    filename: (req, file, cb) => {
      cb(null, `audio-${Date.now()}.webm`);
    },
  }),
});

// Helper function to check dependencies
async function checkDependencies() {
  const issues = [];

  // Check FFmpeg
  try {
    await execAsync('ffmpeg -version');
  } catch (error) {
    issues.push('FFmpeg is niet geïnstalleerd. Installeer FFmpeg om audio te kunnen verwerken.');
  }

  // Check Whisper
  try {
    await execAsync('pip show openai-whisper');
  } catch (error) {
    issues.push('Whisper is niet geïnstalleerd. Installeer Whisper met: pip install openai-whisper');
  }

  return issues;
}

// Helper function to convert audio to WAV format
async function convertToWav(inputPath: string): Promise<string> {
  const outputPath = inputPath.replace('.webm', '.wav');
  await execAsync(`ffmpeg -i "${inputPath}" -acodec pcm_s16le -ar 16000 -ac 1 "${outputPath}"`);
  return outputPath;
}

// Helper function to run Python script
async function runTranscriptionScript(audioPath: string, expectedText: string, focusSound?: string): Promise<any> {
  const scriptPath = path.join(process.cwd(), 'whisper_transcribe.py');
  const command = `python "${scriptPath}" "${audioPath}" "${expectedText}" ${focusSound ? `"${focusSound}"` : ''}`;
  
  try {
    const { stdout } = await execAsync(command);
    return JSON.parse(stdout);
  } catch (error) {
    console.error('Error running transcription script:', error);
    throw new Error('Er is een fout opgetreden bij het transcriberen van de audio.');
  }
}

// Configure multer middleware
const multerMiddleware = (req: any, res: any) => {
  return new Promise((resolve, reject) => {
    upload.single('audio')(req, res, (err: any) => {
      if (err) reject(err);
      resolve(true);
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Alleen POST requests zijn toegestaan' });
  }

  try {
    // Check dependencies
    const dependencyIssues = await checkDependencies();
    if (dependencyIssues.length > 0) {
      return res.status(500).json({ error: dependencyIssues.join('\n') });
    }

    // Handle file upload
    await multerMiddleware(req, res);
    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ error: 'Geen audio bestand ontvangen' });
    }

    // Get expected text and focus sound from request
    const expectedText = req.body.expectedText;
    const focusSound = req.body.focusSound;

    // Convert audio to WAV format
    const wavPath = await convertToWav(file.path);

    // Run transcription script
    const result = await runTranscriptionScript(wavPath, expectedText, focusSound);

    // Clean up temporary files
    await fs.unlink(file.path);
    await fs.unlink(wavPath);

    // Return transcription result
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in transcription API:', error);
    return res.status(500).json({ error: 'Er is een fout opgetreden bij het verwerken van de audio.' });
  }
}

// Configure API route to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
}; 