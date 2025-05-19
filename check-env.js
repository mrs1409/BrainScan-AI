import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Checking for .env file...');

const envPath = join(process.cwd(), '.env');

try {
  if (existsSync(envPath)) {
    console.log('.env file exists at:', envPath);

    // Read the .env file
    const envContent = readFileSync(envPath, 'utf8');

    // Split by lines and filter out empty lines and comments
    const envLines = envContent
      .split('\n')
      .filter(line => line.trim() && !line.startsWith('#'));

    console.log(`Found ${envLines.length} environment variables in .env file`);

    // Print the variable names (not values for security)
    envLines.forEach(line => {
      const [key] = line.split('=');
      console.log(`- ${key}: ${key.includes('FIREBASE') ? '[HIDDEN]' : 'Set'}`);
    });
  } else {
    console.log('.env file does not exist at:', envPath);
  }
} catch (error) {
  console.error('Error checking .env file:', error);
}
