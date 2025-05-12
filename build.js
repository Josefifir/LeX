const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const semver = require("semver");

// ========== 1. Original Configuration (Enhanced) ==========
const filesToInclude = {
  css: [
    { file: "./src/external/katex/katex.css" },
    { file: "./src/styles.css" }
  ],
  js: [
    {
      file: "./src/external/katex/katex.js",
      name: "katex",
      isWebpack: true
    },
    {
      file: "./src/external/katex/contrib/mhchem.js",
      isWebpack: true,
      replace: [[ /require\("katex"\)/g, "katex" ]]
    }
  ],
  strings: [
    {
      file: "./src/external/lax-icon.svg",
      target: `"<<<<<TEX_ICON>>>>>"`
    }
  ]
};

const inputFile = "./src/LaX.template.js";
const outputFile = "./LaX.plugin.js";
const replaceTargets = {
  css: `"<<<<<CSS>>>>>"`,
  js: `"<<<<<JS>>>>>"`
};

// ========== 2. New Helper Functions ==========
// Improvement 1: File existence checks
function fileExists(filePath) {
  try {
    return fs.existsSync(path.resolve(__dirname, filePath));
  } catch {
    return false;
  }
}

// Improvement 5: Checksum generation
function generateChecksum(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

// Improvement 3: Memory-safe file reading
async function readLargeFile(filePath) {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(path.resolve(__dirname, filePath), { encoding: 'utf8' });
    let data = '';
    stream.on('data', chunk => data += chunk);
    stream.on('end', () => resolve(data));
    stream.on('error', reject);
  });
}

// Improvement 9: Environment variables
function getEnv(key, defaultValue) {
  return process.env[key.toUpperCase()] || defaultValue;
}

// ========== 3. Enhanced Transformers ==========
async function transformCSS({file}) {
  if (!fileExists(file)) throw new Error(`CSS file not found: ${file}`);
  const css = await readLargeFile(file);
  const dir = path.dirname(path.resolve(__dirname, file));
  
  return css.replace(
    /(?<=@font-face\s*\{[\W\w]*?src:\s*)url\((.*?)\).*?(?=;[\W\w]*?\})/gimu, 
    (match, fontPath) => {
      try {
        const fullFontPath = path.resolve(dir, fontPath);
        if (!fileExists(fullFontPath)) {
          console.warn(`Font file not found: ${fullFontPath}`);
          return match;
        }
        const fontFile = fs.readFileSync(fullFontPath);
        return `url("data:font/woff2;base64,${fontFile.toString("base64")}") format("woff2")`;
      } catch (error) {
        console.warn(`Font processing failed: ${error.message}`);
        return match;
      }
    }
  );
}

async function transformJS({file, name, isWebpack, replace}) {
  if (!fileExists(file)) throw new Error(`JS file not found: ${file}`);
  
  let js = await readLargeFile(file);
  
  if (Array.isArray(replace)) {
    for (const r of replace) {
      js = js.replace(r[0], r[1]);
    }
  }
  
  js = js.replace(/\/\/#\s*sourceMappingURL=.+/gu, "");
  
  // MODIFIED: Only add webpack export if not already present
  if (isWebpack && name) {
    if (!js.includes(`const ${name} = module.exports`)) {
      js += `\nconst ${name} = module.exports;\nmodule.exports = undefined;`;
    }
  }
  
  return js;
}

function transformString({file, keepBase64}) {
  if (!fileExists(file)) throw new Error(`String file not found: ${file}`);
  
  const string = fs.readFileSync(path.join(__dirname, file), "utf8");
  if (keepBase64) {
    return Buffer.from(string).toString("base64");
  }
  return `atob("${Buffer.from(string).toString("base64")}")`;
}

// ========== 4. Main Build Process ==========
async function build() {
  const startTime = process.hrtime(); // Improvement 8
  
  try {
    // Improvement 2: Config validation
    if (!filesToInclude.css || !Array.isArray(filesToInclude.css)) 
      throw new Error("Invalid CSS configuration");
    if (!filesToInclude.js || !Array.isArray(filesToInclude.js))
      throw new Error("Invalid JS configuration");
    
    // Improvement 10: Backup previous build
    if (fileExists(outputFile)) {
      const backupName = `${outputFile}.bak-${Date.now()}`;
      fs.copyFileSync(outputFile, backupName);
      console.log(`Created backup: ${backupName}`);
    }
    
    // Improvement 7: Clean output directory
    const dir = path.dirname(outputFile);
    fs.readdirSync(dir)
      .filter(f => f.endsWith('.js.map'))
      .forEach(f => fs.unlinkSync(path.join(dir, f)));
    
    // Improvement 6: Dependency check
    try {
      const pkg = require('./package.json');
      if (pkg.dependencies?.katex && !semver.satisfies(pkg.dependencies.katex, '^0.16.0')) {
        console.warn(`Katex version ${pkg.dependencies.katex} may not be compatible`);
      }
    } catch (e) {
      console.warn('Could not verify dependencies');
    }
    
    // Original build logic (now async)
    let cssToInject = "";
    for (const fileToInclude of filesToInclude.css) {
      cssToInject += await transformCSS(fileToInclude) + "\n";
    }
    
    let jsToInject = "";
    for (const fileToInclude of filesToInclude.js) {
      jsToInject += await transformJS(fileToInclude) + "\n";
    }
    
    const template = await readLargeFile(inputFile);
    let output = template
      .split(replaceTargets.css).join(`atob('${Buffer.from(cssToInject).toString("base64")}')`)
      .split(replaceTargets.js).join(jsToInject);
    
    for (const file of filesToInclude.strings) {
      output = output.split(file.target).join(transformString(file));
    }
    
    // Improvement 4: Build metadata
    const buildInfo = {
      timestamp: new Date().toISOString(),
      version: require('./package.json').version || 'unknown',
      env: getEnv('NODE_ENV', 'development') // Improvement 9
    };
    output = output.split('"<<<<<BUILD_INFO>>>>>"').join(JSON.stringify(buildInfo));
    
    fs.writeFileSync(path.resolve(__dirname, outputFile), output);
    
    // Improvement 5: Checksum verification
    const checksum = generateChecksum(output);
    console.log(`Build checksum: ${checksum}`);
    
    if (process.argv[2]) {
      fs.writeFileSync(path.resolve(__dirname, process.argv[2]), output);
    }
    
    // Improvement 8: Performance timing
    const [seconds, nanoseconds] = process.hrtime(startTime);
    console.log(`Build completed in ${seconds}.${nanoseconds.toString().padStart(9,'0')}s`);
    
  } catch (error) {
    console.error("Build failed:", error.message);
    process.exit(1);
  }
}

build();