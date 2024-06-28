import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fontPath = join(__dirname, 'assets', 'fonts', 'DancingScript-Regular.ttf');
const outputPath = join(__dirname, 'assets', 'fonts', 'DancingScript-Regular-base64.txt');

try {
  // Čitanje fonta i konverzija u base64
  const fontContent = readFileSync(fontPath);
  const base64Font = fontContent.toString('base64');

  // Zapisivanje base64 stringa u datoteku
  writeFileSync(outputPath, base64Font);

  console.log('Font je uspješno konvertiran u base64 i spremljen u:', outputPath);
} catch (error) {
  console.error('Došlo je do greške:', error.message);
  console.error('Putanja fonta:', fontPath);
  console.error('Izlazna putanja:', outputPath);
}
