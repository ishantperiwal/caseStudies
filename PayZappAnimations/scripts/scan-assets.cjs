const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const LOTTIES_DIR = path.join(ROOT_DIR, 'public', 'lotties');
const ILLUSTRATIONS_DIR = path.join(ROOT_DIR, 'public', 'illustrations');
const OUTPUT_FILE = path.join(ROOT_DIR, 'src', 'assets_manifest.json');

const ALLOWED_EXTENSIONS = ['.json', '.gif', '.mp4'];

// Helper to format clean names
function formatName(filename) {
  const ext = path.extname(filename);
  let base = path.basename(filename, ext);
  
  // Replace underscores and dashes with spaces
  base = base.replace(/[_-]/g, ' ');
  
  // Add spaces before capital letters (camelCase)
  base = base.replace(/([a-z])([A-Z])/g, '$1 $2');
  
  // Capitalize first letter of each word
  return base
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Helper to determine asset type
function getAssetType(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.json') return 'lottie';
  if (ext === '.gif') return 'gif';
  if (ext === '.mp4') return 'video';
  return 'unknown';
}

// Predefined gorgeous background colors based on animation style or random selection
const PRESET_BACKGROUNDS = [
  'linear-gradient(135deg, #1e1e38 0%, #111124 100%)', // Deep Dark Navy
  'linear-gradient(135deg, #1a2a6c 0%, #275d8c 100%)', // Oceanic Gradient
  'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)', // Sleek Teal
  'linear-gradient(135deg, #141e30 0%, #243b55 100%)', // Midnight Blue
  'linear-gradient(135deg, #1d1d1d 0%, #151515 100%)', // Classic Pure Charcoal
  'linear-gradient(135deg, #2c3e50 0%, #000000 100%)', // Dark Metal
  'linear-gradient(135deg, #0b090a 0%, #161a1d 100%)', // Obsidian Red-hint
  'linear-gradient(135deg, #11042c 0%, #04010b 100%)', // Royal Purple
];

// Helper to assign a stable backdrop color based on filename string hash
function getBackdropColor(filename) {
  // Check if filename has indicators of color
  const lower = filename.toLowerCase();
  if (lower.includes('green') || lower.includes('success')) {
    return 'linear-gradient(135deg, #062b1b 0%, #02120b 100%)'; // Emerald depth
  }
  if (lower.includes('yellow') || lower.includes('gold') || lower.includes('coin')) {
    return 'linear-gradient(135deg, #2d2206 0%, #110d02 100%)'; // Amber depth
  }
  if (lower.includes('blue') || lower.includes('circularloader')) {
    return 'linear-gradient(135deg, #061d33 0%, #020b14 100%)'; // Blue depth
  }
  if (lower.includes('red') || lower.includes('failed')) {
    return 'linear-gradient(135deg, #2d0606 0%, #110202 100%)'; // Crimson depth
  }

  // Fallback to a hash-based stable preset index
  let hash = 0;
  for (let i = 0; i < filename.length; i++) {
    hash = filename.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PRESET_BACKGROUNDS.length;
  return PRESET_BACKGROUNDS[index];
}

// Predefined size options: 'square' (1x1), 'wide' (2x1), 'tall' (1x2), 'large' (2x2)
// Determine sizes based on actual aspect ratio from Lottie JSON or GIF header
function getBentoSize(filename, fullPath) {
  const ext = path.extname(filename).toLowerCase();
  const lower = filename.toLowerCase();

  // 1. Check for specific MP4 video sizes manually
  if (ext === '.mp4') {
    if (lower.includes('banner')) {
      return 'wide';
    }
    if (lower.includes('loading') || lower.includes('only transactipon') || lower.includes('cards tb')) {
      return 'tall';
    }
    return 'square';
  }

  // 2. Parse GIF aspect ratio from binary header
  if (ext === '.gif') {
    try {
      const buffer = fs.readFileSync(fullPath);
      if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) { // "GIF"
        const w = buffer.readUInt16LE(6);
        const h = buffer.readUInt16LE(8);
        if (w > 0 && h > 0) {
          const ratio = w / h;
          if (ratio > 1.35) return 'wide';
          if (ratio < 0.6) return 'tall';
          // Only make it large if explicitly designated
          if (lower.includes('hero') || lower.includes('illustration') || lower.includes('unboxing') || lower.includes('splash')) {
            return 'large';
          }
          return 'square';
        }
      }
    } catch (e) {
      console.warn(`Failed to read GIF dimensions for ${filename}:`, e.message);
    }
  }

  // 3. Parse Lottie JSON dimensions
  if (ext === '.json') {
    try {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed.w && parsed.h) {
        const ratio = parsed.w / parsed.h;
        if (ratio > 1.35) return 'wide';
        if (ratio < 0.6) return 'tall';
        
        // Small loaders or indicators should be small square
        if (lower.includes('loader') || lower.includes('tick') || lower.includes('orb') || lower.includes('nav') || parsed.w < 200) {
          return 'square';
        }
        
        // Only classify as large if it has explicit big indicators
        if (lower.includes('hero') || lower.includes('illustration') || lower.includes('unboxing') || lower.includes('zapp full') || lower.includes('migrate')) {
          return 'large';
        }
        return 'square';
      }
    } catch (e) {
      // JSON might be invalid or not Lottie format, fallback
    }
  }

  // Fallback to name-based logic
  if (lower.includes('wide') || lower.includes('navbar') || lower.includes('nav') || lower.includes('banner')) {
    return 'wide';
  }
  if (lower.includes('onboarding') || lower.includes('education') || lower.includes('flow') || lower.includes('sms')) {
    return 'tall';
  }
  if (lower.includes('unboxing') || lower.includes('zapp full') || lower.includes('migrate') || lower.includes('comp_1')) {
    return 'large';
  }
  
  return 'square';
}

function scanDir(dirPath, category = 'general') {
  const results = [];
  if (!fs.existsSync(dirPath)) return results;

  const items = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const item of items) {
    if (item.name.startsWith('.')) continue; // Skip hidden/deleted folders
    const fullPath = path.join(dirPath, item.name);
    
    if (item.isDirectory()) {
      // Traverse subdirectories recursively
      const subCategory = category === 'general' ? item.name : `${category}/${item.name}`;
      results.push(...scanDir(fullPath, subCategory));
    } else {
      const ext = path.extname(item.name).toLowerCase();
      if (ALLOWED_EXTENSIONS.includes(ext)) {
        // Compute path relative to ROOT_DIR, using forward slashes for web compatibility
        let relativePath = path.relative(ROOT_DIR, fullPath).replace(/\\/g, '/');
        
        // Skip package.json or node_modules accidentally found
        if (relativePath.includes('node_modules') || relativePath.includes('temp-vite')) continue;
        
        // Strip public/ prefix so it serves correctly from the root in the browser
        if (relativePath.startsWith('public/')) {
          relativePath = relativePath.slice('public/'.length);
        }
        
        results.push({
          id: relativePath.replace(/[^a-zA-Z0-9]/g, '_'),
          path: relativePath,
          name: formatName(item.name),
          type: getAssetType(item.name),
          category: category,
          backdrop: getBackdropColor(item.name),
          size: getBentoSize(item.name, fullPath),
        });
      }
    }
  }

  return results;
}

function interleaveAssets(items) {
  const tallAndLarge = [];
  const smallAndWide = [];

  items.forEach((item) => {
    if (['tall', 'extra-tall', 'large', 'tall-large'].includes(item.size)) {
      tallAndLarge.push(item);
    } else {
      smallAndWide.push(item);
    }
  });

  const result = [];
  const totalTall = tallAndLarge.length;
  const totalSmall = smallAndWide.length;

  let tallIdx = 0;
  let smallIdx = 0;

  // Distribute tall cards among small cards based on ratio
  const ratio = Math.max(1, Math.floor(totalSmall / totalTall));

  while (tallIdx < totalTall || smallIdx < totalSmall) {
    for (let i = 0; i < ratio && smallIdx < totalSmall; i++) {
      result.push(smallAndWide[smallIdx++]);
    }
    if (tallIdx < totalTall) {
      result.push(tallAndLarge[tallIdx++]);
    }
  }

  while (smallIdx < totalSmall) {
    result.push(smallAndWide[smallIdx++]);
  }

  return result;
}

// Simple seedable pseudo-random number generator for stable sorting
function sfc32(a, b, c, d) {
  return function() {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
    var t = (a + b) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0;
    t = (t + d) | 0;
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  }
}

function deterministicShuffle(array) {
  const rand = sfc32(0x9e3779b9, 0x243f6a88, 0xb7e15162, 0xdec9e912);
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function main() {
  console.log('Scanning assets...');
  
  // Load existing manifest to preserve customizations
  const existingMap = new Map();
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      const existingContent = fs.readFileSync(OUTPUT_FILE, 'utf-8');
      const existing = JSON.parse(existingContent);
      if (Array.isArray(existing)) {
        existing.forEach(a => {
          if (a && a.id) {
            existingMap.set(a.id, a);
          }
        });
      }
    } catch (e) {
      console.warn('Could not read existing manifest:', e.message);
    }
  }

  const lottieAssets = scanDir(LOTTIES_DIR);
  const illustrationAssets = scanDir(ILLUSTRATIONS_DIR);
  
  let allAssets = [...lottieAssets, ...illustrationAssets];
  
  // Merge scanned assets with existing customizations
  allAssets = allAssets.map(asset => {
    const existing = existingMap.get(asset.id);
    if (existing) {
      // Preserve user edits if they exist
      return {
        ...asset,
        name: existing.name !== undefined ? existing.name : asset.name,
        size: existing.size !== undefined ? existing.size : asset.size,
        backdrop: existing.backdrop !== undefined ? existing.backdrop : asset.backdrop,
        zoom: existing.zoom !== undefined ? existing.zoom : asset.zoom,
        offsetX: existing.offsetX !== undefined ? existing.offsetX : asset.offsetX,
        offsetY: existing.offsetY !== undefined ? existing.offsetY : asset.offsetY,
        padding: existing.padding !== undefined ? existing.padding : asset.padding,
        borderRadius: existing.borderRadius !== undefined ? existing.borderRadius : asset.borderRadius,
      };
    }
    return asset;
  });
  
  // Log original sizes
  const counts = { square: 0, wide: 0, tall: 0, large: 0 };
  allAssets.forEach(a => counts[a.size] = (counts[a.size] || 0) + 1);
  console.log('Original scanned size distribution:', counts);

  // Shuffling deterministically before interleaving to mix folders (like "bottom text") across the page
  const shuffled = deterministicShuffle(allAssets);
  const interleaved = interleaveAssets(shuffled);
  
  // Ensure src directory exists
  const srcDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
  }
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(interleaved, null, 2), 'utf-8');
  console.log(`Successfully scanned and interleaved ${interleaved.length} assets. Saved to ${OUTPUT_FILE}`);
}

main();
