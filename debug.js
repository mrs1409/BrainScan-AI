import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, readdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Current directory:', process.cwd());
console.log('Files in src directory:');

try {
  const files = readdirSync(join(process.cwd(), 'src'));
  files.forEach(file => {
    console.log(' -', file);
  });
} catch (error) {
  console.error('Error reading src directory:', error);
}

console.log('\nChecking main.tsx:');
try {
  const mainContent = readFileSync(join(process.cwd(), 'src', 'main.tsx'), 'utf8');
  console.log(mainContent);
} catch (error) {
  console.error('Error reading main.tsx:', error);
}

console.log('\nChecking App.tsx:');
try {
  const appContent = readFileSync(join(process.cwd(), 'src', 'App.tsx'), 'utf8');
  console.log(appContent.substring(0, 200) + '...');
} catch (error) {
  console.error('Error reading App.tsx:', error);
}
