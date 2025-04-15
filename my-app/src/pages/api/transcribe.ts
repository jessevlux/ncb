import type { NextApiRequest, NextApiResponse } from 'next';
import { createWriteStream, unlink, existsSync } from 'fs';
import { promisify } from 'util';
import { execFile, exec } from 'child_process';
import { join } from 'path';
import { tmpdir } from 'os';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';

// Extend NextApiRequest to include the file property
interface NextApiRequestWithFile extends NextApiRequest {
  file?: Express.Multer.File;
}

const execFileAsync = promisify(execFile);
const execAsync = promisify(exec);
const unlinkAsync = promisify(unlink);

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Path to FFmpeg executable - change this to your actual path
const FFMPEG_PATH = 'C:\\ffmpeg\\bin\\ffmpeg.exe';

// Helper function to run multer middleware
const runMiddleware = (req: NextApiRequestWithFile, res: NextApiResponse, fn: any) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

// Helper function to check if dependencies are installed
const checkDependencies = async () => {
  const issues: string[] = [];

  // Check if FFmpeg is installed
  if (!existsSync(FFMPEG_PATH)) {
    issues.push('FFmpeg is niet gevonden op pad: ' + FFMPEG_PATH);
  }

  // Check if Python is installed with Vosk
  try {
    await execAsync('python -c "import vosk"');
  } catch (error) {
    issues.push('Python Vosk-pakket is niet geïnstalleerd. Installeer het met: pip install vosk');
  }

  // Check if Vosk model is present
  if (!existsSync(join(process.cwd(), 'vosk-model-small-nl-0.22'))) {
    issues.push('Vosk Nederlands taalmodel is niet gevonden. Download het van: https://alphacephei.com/vosk/models/vosk-model-small-nl-0.22.zip');
  }

  return issues;
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequestWithFile,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if dependencies are installed
  const issues = await checkDependencies();
  if (issues.length > 0) {
    console.warn('Missing dependencies:', issues);
    return res.status(200).json({ 
      transcript: 'TEST MODUS: De echte spraakherkenning is niet beschikbaar. Installeer de ontbrekende dependencies:',
      issues: issues,
      mockMode: true
    });
  }

  let inputFile: string | null = null;
  let outputFile: string | null = null;

  try {
    // Handle file upload
    await runMiddleware(req, res, upload.single('audio'));

    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Create temporary files
    inputFile = join(tmpdir(), `${uuidv4()}.webm`);
    outputFile = join(tmpdir(), `${uuidv4()}.wav`);

    // Write the uploaded file to disk
    const writeStream = createWriteStream(inputFile);
    writeStream.write(req.file.buffer);
    writeStream.end();

    // Wait for the write stream to finish
    await new Promise<void>((resolve, reject) => {
      writeStream.on('finish', () => resolve());
      writeStream.on('error', (error) => reject(error));
    });

    // Convert to WAV format using ffmpeg
    try {
      await execFileAsync(FFMPEG_PATH, [
        '-i', inputFile,
        '-ac', '1', // Convert to mono
        '-ar', '16000', // Set sample rate to 16kHz
        outputFile
      ]);
    } catch (ffmpegError) {
      console.error('FFmpeg error:', ffmpegError);
      throw new Error('Failed to convert audio file');
    }

    // Run Python script for transcription
    try {
      const { stdout, stderr } = await execFileAsync('python', [
        join(process.cwd(), 'transcribe.py'),
        outputFile
      ]);

      if (stderr) {
        console.error('Python script stderr:', stderr);
      }

      // Return the transcription
      res.status(200).json({ transcript: stdout.trim() });
    } catch (pythonError) {
      console.error('Python script error:', pythonError);
      throw new Error('Failed to transcribe audio');
    }
  } catch (error) {
    console.error('Error processing audio:', error);
    res.status(500).json({ 
      error: 'Error processing audio file',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    // Clean up temporary files
    if (inputFile) {
      try {
        await unlinkAsync(inputFile);
      } catch (error) {
        console.error('Error deleting input file:', error);
      }
    }
    if (outputFile) {
      try {
        await unlinkAsync(outputFile);
      } catch (error) {
        console.error('Error deleting output file:', error);
      }
    }
  }
} 