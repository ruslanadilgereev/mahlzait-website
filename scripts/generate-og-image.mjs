import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// Read logo as base64 for embedding in SVG
const logoPng = readFileSync(join(root, 'public', 'favicon-512x512.png'));
const logoBase64 = logoPng.toString('base64');

const width = 1200;
const height = 630;

const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#059669;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#10b981;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#34d399;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="shine" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:white;stop-opacity:0.15" />
      <stop offset="100%" style="stop-color:white;stop-opacity:0" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  
  <!-- Subtle grid pattern -->
  <g opacity="0.06">
    ${Array.from({length: 30}, (_, i) => `<line x1="${i*45}" y1="0" x2="${i*45}" y2="${height}" stroke="white" stroke-width="1"/>`).join('')}
    ${Array.from({length: 15}, (_, i) => `<line x1="0" y1="${i*45}" x2="${width}" y2="${i*45}" stroke="white" stroke-width="1"/>`).join('')}
  </g>
  
  <!-- Decorative circles -->
  <circle cx="950" cy="100" r="250" fill="white" opacity="0.05"/>
  <circle cx="1100" cy="450" r="180" fill="white" opacity="0.04"/>
  
  <!-- Logo -->
  <image href="data:image/png;base64,${logoBase64}" x="60" y="160" width="120" height="120" />
  
  <!-- Brand name -->
  <text x="200" y="245" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="64" font-weight="800" fill="white" letter-spacing="-1">Mahlzait</text>
  
  <!-- Tagline -->
  <text x="65" y="340" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="42" font-weight="600" fill="white" opacity="0.95">Kalorienzähler mit KI</text>
  
  <!-- Features line -->
  <text x="65" y="400" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="24" fill="white" opacity="0.8">Foto · Barcode · Text · Rezepte · Makros</text>
  
  <!-- Pill badges -->
  <rect x="65" y="440" width="140" height="40" rx="20" fill="white" opacity="0.2"/>
  <text x="135" y="466" font-family="system-ui, sans-serif" font-size="18" fill="white" text-anchor="middle" font-weight="600">iOS</text>
  
  <rect x="220" y="440" width="160" height="40" rx="20" fill="white" opacity="0.2"/>
  <text x="300" y="466" font-family="system-ui, sans-serif" font-size="18" fill="white" text-anchor="middle" font-weight="600">Android</text>
  
  <rect x="395" y="440" width="180" height="40" rx="20" fill="white" opacity="0.2"/>
  <text x="485" y="466" font-family="system-ui, sans-serif" font-size="18" fill="white" text-anchor="middle" font-weight="600">Kostenlos</text>
  
  <!-- Phone mockup hint (right side) -->
  <rect x="800" y="80" width="320" height="550" rx="40" fill="white" opacity="0.1"/>
  <rect x="815" y="100" width="290" height="510" rx="30" fill="white" opacity="0.08"/>
  
  <!-- Mockup content lines -->
  <rect x="845" y="140" width="230" height="20" rx="10" fill="white" opacity="0.15"/>
  <rect x="845" y="175" width="180" height="14" rx="7" fill="white" opacity="0.1"/>
  <rect x="845" y="210" width="230" height="80" rx="12" fill="white" opacity="0.08"/>
  <rect x="845" y="310" width="230" height="80" rx="12" fill="white" opacity="0.08"/>
  <rect x="845" y="410" width="230" height="80" rx="12" fill="white" opacity="0.08"/>
  
  <!-- Bottom bar -->
  <rect x="0" y="${height - 60}" width="${width}" height="60" fill="black" opacity="0.15"/>
  <text x="60" y="${height - 25}" font-family="system-ui, sans-serif" font-size="20" fill="white" opacity="0.9">www.mahlzait.de</text>
  <text x="${width - 60}" y="${height - 25}" font-family="system-ui, sans-serif" font-size="20" fill="white" opacity="0.7" text-anchor="end">Einfach. Präzise. KI-gestützt.</text>
</svg>
`;

await sharp(Buffer.from(svg))
  .png()
  .toFile(join(root, 'public', 'og-image.png'));

console.log('✅ OG image generated: public/og-image.png (1200x630)');
