/**
 * @file Build script for LaX plugin - bundles CSS, JS, and assets into a single plugin file
 * @module build
 * @requires fs
 * @requires path
 * @requires crypto
 * @requires semver
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const semver = require("semver");

/**
 * Configuration object defining files to include in the build
 * @type {Object}
 * @property {Array} css - CSS files to bundle
 * @property {Array} js - JavaScript files to bundle
 * @property {Array} strings - Static assets to include
 */
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
    },
    {
      file: "./src/external/katex/contrib/auto-render.js",
      isWebpack: true,
      replace: [[ /require\("katex"\)/g, "katex" ]]
    },
    {
      file: "./src/external/katex/contrib/copy-tex.js",
      isWebpack: true,
      replace: [[ /require\("katex"\)/g, "katex" ]]
    },
    {
      file: "./src/external/katex/contrib/render-a11y-string.js",
      isWebpack: true,
      replace: [[ /require\("katex"\)/g, "katex" ]]
    },
  ],
  strings: [
    {
      file: "./src/external/lax-icon.svg",
      target: `"<<<<<TEX_ICON>>>>>"`
    }
  ]
};

/** @constant {string} inputFile - Path to the template file */
const inputFile = "./src/LaX.template.js";

/** @constant {string} outputFile - Output path for the built plugin */
const outputFile = "./LaX.plugin.js";

/**
 * Replacement markers in the template file
 * @type {Object}
 * @property {string} css - Marker for CSS injection
 * @property {string} js - Marker for JS injection
 */
const replaceTargets = {
  css: `"<<<<<CSS>>>>>"`,
  js: `"<<<<<JS>>>>>"`
};

/**
 * Checks if a file exists
 * @param {string} filePath - Path to the file
 * @returns {boolean} True if file exists
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(path.resolve(__dirname, filePath));
  } catch {
    return false;
  }
}

/**
 * Generates SHA-256 checksum of content
 * @param {string} content - Input content
 * @returns {string} Hexadecimal checksum
 */
function generateChecksum(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Reads large files using streams to avoid memory issues
 * @param {string} filePath - Path to file
 * @returns {Promise<string>} File contents
 */
async function readLargeFile(filePath) {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(path.resolve(__dirname, filePath), { encoding: 'utf8' });
    let data = '';
    stream.on('data', chunk => data += chunk);
    stream.on('end', () => resolve(data));
    stream.on('error', reject);
  });
}

/**
 * Gets environment variable with fallback
 * @param {string} key - Environment variable name
 * @param {*} defaultValue - Fallback value
 * @returns {*} Environment value or fallback
 */
function getEnv(key, defaultValue) {
  return process.env[key.toUpperCase()] || defaultValue;
}

/**
 * Transforms CSS files by:
 * 1. Converting font URLs to base64 data URIs
 * 2. Preserving original formatting
 * @param {Object} param0 - File config
 * @param {string} param0.file - CSS file path
 * @returns {Promise<string>} Transformed CSS
 */
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

/**
 * Transforms JavaScript files by:
 * 1. Applying regex replacements
 * 2. Removing source maps
 * 3. Handling webpack exports
 * @param {Object} param0 - File config
 * @param {string} param0.file - JS file path
 * @param {string} [param0.name] - Export name for webpack modules
 * @param {boolean} [param0.isWebpack] - Whether file is webpack bundle
 * @param {Array} [param0.replace] - Replacement rules
 * @returns {Promise<string>} Transformed JS
 */
async function transformJS({file, name, isWebpack, replace}) {
  if (!fileExists(file)) throw new Error(`JS file not found: ${file}`);
  
  let js = await readLargeFile(file);
  
  if (Array.isArray(replace)) {
    for (const r of replace) {
      js = js.replace(r[0], r[1]);
    }
  }
  
  js = js.replace(/\/\/#\s*sourceMappingURL=.+/gu, "");
  
  if (isWebpack && name) {
    if (!js.includes(`const ${name} = module.exports`)) {
      js += `\nconst ${name} = module.exports;\nmodule.exports = undefined;`;
    }
  }
  
  return js;
}

/**
 * Transforms string assets to base64
 * @param {Object} param0 - File config
 * @param {string} param0.file - Asset file path
 * @param {boolean} [param0.keepBase64] - Whether to return raw base64
 * @returns {string} Transformed string (wrapped in atob() unless keepBase64)
 */
function transformString({file, keepBase64}) {
  if (!fileExists(file)) throw new Error(`String file not found: ${file}`);
  
  const string = fs.readFileSync(path.join(__dirname, file), "utf8");
  if (keepBase64) {
    return Buffer.from(string).toString("base64");
  }
  return `atob("${Buffer.from(string).toString("base64")}")`;
}

/**
 * Main build process that:
 * 1. Validates configuration
 * 2. Processes all assets
 * 3. Generates output file
 */
async function build() {
  const startTime = process.hrtime(); 
  
  try {
    // Configuration validation
    if (!filesToInclude.css || !Array.isArray(filesToInclude.css)) 
      throw new Error("Invalid CSS configuration");
    if (!filesToInclude.js || !Array.isArray(filesToInclude.js))
      throw new Error("Invalid JS configuration");
    
    // Create backup of previous build
    if (fileExists(outputFile)) {
      const backupName = `${outputFile}.bak-${Date.now()}`;
      fs.copyFileSync(outputFile, backupName);
      console.log(`Created backup: ${backupName}`);
    }
    
    // Clean output directory
    const dir = path.dirname(outputFile);
    fs.readdirSync(dir)
      .filter(f => f.endsWith('.js.map'))
      .forEach(f => fs.unlinkSync(path.join(dir, f)));
    
    // Verify dependencies
    try {
      const pkg = require('./package.json');
      if (pkg.dependencies?.katex && !semver.satisfies(pkg.dependencies.katex, '^0.16.0')) {
        console.warn(`Katex version ${pkg.dependencies.katex} may not be compatible`);
      }
    } catch (e) {
      console.warn('Could not verify dependencies');
    }
    
    // Process CSS files
    let cssToInject = "";
    for (const fileToInclude of filesToInclude.css) {
      cssToInject += await transformCSS(fileToInclude) + "\n";
    }
    
    // Process JS files
    let jsToInject = "";
    for (const fileToInclude of filesToInclude.js) {
      jsToInject += await transformJS(fileToInclude) + "\n";
    }
    
    // Read template and perform injections
    const template = await readLargeFile(inputFile);
    let output = template
      .split(replaceTargets.css).join(`atob('${Buffer.from(cssToInject).toString("base64")}')`)
      .split(replaceTargets.js).join(jsToInject);
    
    // Process string replacements
    for (const file of filesToInclude.strings) {
      output = output.split(file.target).join(transformString(file));
    }
    
    // Add build metadata
    const buildInfo = {
      timestamp: new Date().toISOString(),
      version: require('./package.json').version || 'unknown',
      env: getEnv('NODE_ENV', 'development')
    };
    output = output.split('"<<<<<BUILD_INFO>>>>>"').join(JSON.stringify(buildInfo));
    
    // Write output file
    fs.writeFileSync(path.resolve(__dirname, outputFile), output);
    
    // Generate checksum for verification
    const checksum = generateChecksum(output);
    console.log(`Build checksum: ${checksum}`);
    
    // Optional secondary output
    if (process.argv[2]) {
      fs.writeFileSync(path.resolve(__dirname, process.argv[2]), output);
    }
    
    // Log build time
    const [seconds, nanoseconds] = process.hrtime(startTime);
    console.log(`Build completed in ${seconds}.${nanoseconds.toString().padStart(9,'0')}s`);
    
  } catch (error) {
    console.error("Build failed:", error.message);
    process.exit(1);
  }
}

// Execute build
build();