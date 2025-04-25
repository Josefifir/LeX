/**
 * @name LaX
 * @version 1.0.0
 * @author Nothing
 * @authorId 1278640580607479851
 * @description Creates and send LaX math equations. 
 * Supported functions can be found at https://katex.org/docs/supported.html.
 * DM the author or create an issue for support.
 * @source https://github.com/Josefifir/LeX/blob/main/LaX.plugin.js
 * @UpdateURL https://raw.githubusercontent.com/Josefifir/TeX/TeX.plugin.js
 */

/*
MIT License
 

Copyright (c) 2025-2026 Nothing

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// Updated April 19th, 2025.

"<<<<<JS>>>>>"

const css = "<<<<<CSS>>>>>";
const texIconSVG = "<<<<<TEX_ICON>>>>>";

const React = BdApi.React;
const ReactDOM = BdApi.ReactDOM || BdApi.findModuleByProps("render", "createPortal") || window.ReactDOM;
// Modal Container Styles
const modalContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  padding: '16px',
  width: '100%',
  boxSizing: 'border-box'
};

const inputLabelStyle = {
  color: 'var(--header-primary)',
  fontSize: '12px',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '0.02em',
  marginBottom: '4px'
};

const textAreaStyle = {
  fontSize: '14px',
  minHeight: '100px',
  width: '100%',
  padding: '10px',
  fontFamily: 'var(--font-code)',
  backgroundColor: 'var(--background-secondary)',
  color: 'var(--text-normal)',
  border: '1px solid var(--background-modifier-accent)',
  borderRadius: '3px',
  resize: 'vertical',
  outline: 'none',
  lineHeight: '1.375'
};

const previewLabelStyle = {
  ...inputLabelStyle, // Inherits from inputLabelStyle
  marginTop: '8px'
};

const previewBoxStyle = {
  fontSize: '16px',
  padding: '12px',
  minHeight: '60px',
  backgroundColor: 'var(--background-secondary)',
  border: '1px solid var(--background-modifier-accent)',
  borderRadius: '3px',
  overflowX: 'auto',
  color: 'var(--text-normal)',
  lineHeight: '1.5'
};

class DOMHelper {
  static instance = null;
  constructor() {
    if (DOMHelper.instance) {
      return DOMHelper.instance;
    }
    DOMHelper.instance = this;
  }
  safeRemoveChild(parent, child) {
    if (parent && child && parent.contains && child.parentNode === parent) {
        try {
            parent.removeChild(child);
        } catch (e) {
            console.warn('Safe remove child failed:', e);
        }
    }
  }
  
  safeRemoveNode(node) {
      if (node?.parentNode?.contains(node)) {
          try {
              node.parentNode.removeChild(node);
          } catch (e) {
              console.warn('Safe remove node failed:', e);
          }
      }
  }
}

const DOM_Helper = new DOMHelper();


class LaXErrorBoundary extends React.Component {
  constructor(props) {
      super(props);
      this.state = { 
        hasError: false,
        error: null,
        errorInfo: null,
        errorDetails: null,
        showRawError: false
      };
  }
  
  static getDerivedStateFromError(error) {
    return { 
      hasError: true,
      error: error
    };
  }
  
  componentDidCatch(error, errorInfo) {
    const details = this._parseErrorDetails(error);
    this.setState({ 
      errorInfo: errorInfo,
      errorDetails: details
    });
    
    if (this.props.onError) {
      this.props.onError(error);
    }
  }
  
  _parseErrorDetails(error) {
    // Handle KaTeX's structured errors first
    if (error instanceof katex.ParseError) {
        return this._parseKatexStructuralError(error);
    }

    // Then check for string-based error messages
    const errorMessage = error.message || String(error);
    
    // Common KaTeX error patterns
    const patterns = [
        {
            regex: /Undefined control sequence \\?([a-zA-Z@]+)/,
            handler: (match) => this._handleUndefinedCommand(match[1])
        },
        {
            regex: /(Invalid|Unsupported) command: \\?([a-zA-Z]+)/,
            handler: (match) => `Command not supported: \\${match[2]}\n\n` +
                'KaTeX doesn\'t support this LaTeX command.'
        },
        {
            regex: /Expected 'EOF'|Missing \$ inserted/,
            handler: () => 'Unclosed math expression\n\n' +
                'Tip: Make sure all $...$ or \\[...\\] pairs are properly closed.'
        },
        {
            regex: /(Extra|Misplaced) alignment tab character &/,
            handler: () => 'Misused alignment character\n\n' +
                'Tip: The "&" character should only be used inside alignment environments like:\n' +
                '\\begin{align} ... \\end{align}'
        },
        {
            regex: /Invalid delimiter type|Mismatched braces|Extra (?:left|right)/,
            handler: () => 'Mismatched braces/brackets/delimiters\n\n' +
                'Tip: Check that all { } [ ] ( ) are properly matched.'
        },
        {
            regex: /KaTeX parse error: (.*) at position (\d+): (.*)/,
            handler: (match) => `Parsing error at position ${match[2]}:\n${match[3]}\n\n` +
                this._getErrorContext(this.props.value, parseInt(match[2]))
        },
        {
            regex: /Unknown environment '([^']+)'/,
            handler: (match) => `Unknown environment: ${match[1]}\n\n` +
                'Tip: Common environments are:\n' +
                '- align, align*\n- matrix, pmatrix\n- cases, array'
        }
    ];

    // Check against all known patterns
    for (const { regex, handler } of patterns) {
        const match = errorMessage.match(regex);
        if (match) return handler(match);
    }

    // Fallback for unknown errors
    return `Error: ${errorMessage}\n\n` +
        'No additional details available. Check your LaTeX syntax.';
}

_parseKatexStructuralError(error) {
    let details = `Parsing error at position ${error.position}:\n${error.message}`;
    
    // Add specific suggestions based on error type
    if (error.message.includes('\\begin')) {
        details += "\n\nTip: Did you include both \\begin and \\end with matching types?";
    } 
    else if (error.message.includes('\\end')) {
        details += "\n\nTip: Each \\end must match a previous \\begin";
    }
    else if (error.message.includes('$')) {
        details += "\n\nTip: Math expressions must be properly closed with $ or \\]";
    }

    // Add context snippet if we have the input value
    if (this.props.value) {
        details += `\n\nNear:\n${this._getErrorContext(this.props.value, error.position)}`;
    }

    return details;
}

_handleUndefinedCommand(command) {
    let message = `Undefined command: \\${command}`;
    
    // Special cases for common mistakes
    const suggestions = {
        'degree': 'Try ^\\circ instead (e.g., 90^\\circ)',
        'text': 'Use \\text{} from the amsmath package',
        'mathbb': 'Requires \\usepackage{amsfonts} in LaTeX',
        'mathcal': 'Supported in KaTeX',
        'overset': 'Supported in KaTeX',
        'underset': 'Supported in KaTeX'
    };

    if (suggestions[command]) {
        message += `\n\nTip: ${suggestions[command]}`;
    } else if (command.startsWith('@')) {
        message += '\n\nTip: This appears to be an internal LaTeX command not available in KaTeX';
    } else {
        message += '\n\nTip: Check for typos or missing packages';
    }

    // Show similar commands for potential typos
    const similar = this._findSimilarCommands(command);
    if (similar.length > 0) {
        message += `\n\nDid you mean: ${similar.slice(0, 3).join(', ')}`;
    }

    return message;
}

_findSimilarCommands(badCommand) {
    const validCommands = [
        'alpha', 'beta', 'gamma', 'delta', 'epsilon', 
        'frac', 'sqrt', 'sum', 'prod', 'int',
        'rightarrow', 'leftarrow', 'Rightarrow', 'Leftarrow',
        'ldots', 'cdots', 'vdots', 'ddots',
        'begin', 'end', 'array', 'matrix', 'pmatrix'
    ];

    return validCommands.filter(cmd => 
        cmd.startsWith(badCommand) || 
        cmd.includes(badCommand) ||
        this._levenshteinDistance(cmd, badCommand) <= 2
    );
}

_levenshteinDistance(a, b) {
    // Simple implementation for command similarity checking
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1,
                matrix[j - 1][i] + 1,
                matrix[j - 1][i - 1] + cost
            );
        }
    }

    return matrix[b.length][a.length];
}

_getErrorContext(input, position) {
    if (!input || position === undefined) return '';
    
    const contextSize = 20;
    const start = Math.max(0, position - contextSize);
    const end = Math.min(input.length, position + contextSize);
    
    let context = input.slice(start, end);
    let pointer = '';
    
    // Handle multi-line context
    const lines = context.split('\n');
    if (lines.length > 1) {
        const linePos = input.slice(0, position).split('\n').length - 1;
        context = lines[linePos] || '';
        pointer = `\n${' '.repeat(position - (input.lastIndexOf('\n', position) + 1))}^`;
    } else {
        pointer = `\n${' '.repeat(position - start)}^`;
    }
    
    return `${context}${pointer}`;
}  
  toggleRawError = () => {
    this.setState(prev => ({ showRawError: !prev.showRawError }));
  };

  copyErrorToClipboard = () => {
    const { error, errorDetails } = this.state;
    const { value } = this.props;
    
    const textToCopy = [
      `Error: ${error?.message}`,
      `Input: ${value}`,
      `Details: ${errorDetails}`,
      `Component: ${this.props.componentName || 'Unknown'}`
    ].join('\n\n');

    navigator.clipboard.writeText(textToCopy);
    BdApi.UI.showToast("Error copied to clipboard");
  };
  renderErrorDisplay() {
    const { error, errorDetails, showRawError } = this.state;
    const { value } = this.props;

    return React.createElement("div", {
      className: "lax-error-boundary",
      style: errorBoundaryStyle
    },
      React.createElement("h3", {style: errorHeaderStyle}, "LaTeX Rendering Error"),
      React.createElement("div", {style: errorMessageStyle},
        showRawError ? error?.message : errorDetails
      ),
      value && React.createElement("pre", {style: errorSnippetStyle},
        this.getErrorSnippet(error)
      ),
      React.createElement("div", {style: buttonGroupStyle},
        React.createElement("button", {
          onClick: this.handleReset,
          style: retryButtonStyle
        }, "Retry"),
        React.createElement("button", {
          onClick: this.toggleRawError,
          style: secondaryButtonStyle
        }, showRawError ? 'Show Help' : 'Show Raw Error'),
        React.createElement("button", {
          onClick: this.copyErrorToClipboard,
          style: secondaryButtonStyle
        }, "Copy Error")
      )
    );
  }

  render() {
    return this.state.hasError 
      ? this.renderErrorDisplay()
      : this.props.children;
  }
}
// Style constants
// Add these with your other style constants
const buttonGroupStyle = {
  display: 'flex',
  gap: '8px',
  marginTop: '12px'
};

const retryButtonStyle = {
  padding: '6px 12px',
  backgroundColor: 'var(--button-danger-background)',
  color: 'var(--button-danger-text)',
  border: 'none',
  borderRadius: '3px',
  cursor: 'pointer',
  flex: 1
};

const secondaryButtonStyle = {
  padding: '6px 12px',
  backgroundColor: 'var(--background-modifier-hover)',
  color: 'var(--text-normal)',
  border: '1px solid var(--background-modifier-accent)',
  borderRadius: '3px',
  cursor: 'pointer',
  flex: 1
};

const errorBoundaryStyle = {
  padding: '16px',
  backgroundColor: 'var(--background-secondary-alt)',
  border: '1px solid var(--status-danger)',
  borderRadius: '4px',
  color: 'var(--text-normal)',
  fontFamily: 'var(--font-primary)'
};

const errorHeaderStyle = {
  color: 'var(--status-danger)',
  marginTop: 0,
  marginBottom: '8px'
};

const errorMessageStyle = {
  margin: '8px 0',
  whiteSpace: 'pre-wrap',
  lineHeight: '1.4'
};

const errorSnippetStyle = {
  backgroundColor: 'var(--background-modifier-accent)',
  padding: '8px',
  borderRadius: '4px',
  overflowX: 'auto',
  fontSize: '0.9em',
  margin: '8px 0'
};
class LaXModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = { texInput: props.initialValue || "", error: null };
    this.katexContainerRef = React.createRef();
    // this.modalContentRef = React.createRef(); // Add this
    this.renderKaTeX = this.debounce(this.renderKaTeX.bind(this));
    this.resizeObserver = null;
}

// getValue() {
//   return this.state.texInput;
// }


  debounce(func, delay = 50) { // Default delay 50ms
      let timeout;
      return (...args) => {
          clearTimeout(timeout);
          timeout = setTimeout(() => func.apply(this, args), delay);
      };
  }

  resetPreview = () => {
    this.setState({ value: "" }); // Clear internal state
    if (this.previewComponent) {  // If using a separate preview component
        this.previewComponent.forceUpdate(); 
    }
  };
  componentDidMount() {
    this.resizeObserver = new ResizeObserver(() => {
      this.renderKaTeX();
  });
  this.resizeObserver.observe(this.katexContainerRef.current)
}
  componentWillUnmount() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    // Clean up KaTeX container
    if (this.katexContainerRef?.current) {
        try {
            const container = this.katexContainerRef.current;
            if (container.parentNode) {
                ReactDOM.unmountComponentAtNode(container);
                DOM_Helper.safeRemoveNode(container);
            }
        } catch (e) {
            console.warn('KaTeX container cleanup error:', e);
        }
    }
    
    // Clean up resize observer
    if (this.resizeObserver) {
        try {
            this.resizeObserver.disconnect();
        } catch (e) {
            console.warn('Observer cleanup error:', e);
        }
        this.resizeObserver = null;
    }
    
    // Clean up any temporary elements
    if (this.tempElements) {
        this.tempElements.forEach(el => DOM_Helper.safeRemoveNode(el));
        this.tempElements = [];
    }
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevState.texInput !== this.state.texInput) {
      this.renderKaTeX();
    }
  }

  renderKaTeX() {
    if (!this.katexContainerRef?.current) return;
    
    const container = this.katexContainerRef.current;
    
    // Safely clean up previous render
    try {
        if (document.body.contains(container)) {
            ReactDOM.unmountComponentAtNode(container);
            container.innerHTML = '';
        }
    } catch (e) {
        console.warn('Cleanup error:', e);
    }

    if (this.state.texInput.trim()) {
        try {
            const katexWrapper = document.createElement('div');
            
            // Render KaTeX into our wrapper
            katex.render(this.state.texInput, katexWrapper, {
                throwOnError: false,
                displayMode: true,
                fontSize: "1.35em",
                fleqn: true,
                colorIsTextColor: true,
                trust: false
            });

            // Create a proper React element structure with error boundary
            ReactDOM.render(
                React.createElement(LaXErrorBoundary, {
                    value: this.state.texInput
                },
                React.createElement("div", {
                    dangerouslySetInnerHTML: {
                        __html: katexWrapper.innerHTML
                    }
                })
                ),
                container
            );
            
            this.setState({ error: null });
        } catch (error) {
            // This will catch only React rendering errors
            console.error("React render error:", error);
            DOM_Helper.safeRemoveNode(container);
            // Let LaXErrorBoundary handle KaTeX errors
        }
    }
}
  


  
    // Add this method to get the current input value
    getValue() {
      return this.state.texInput.trim();
    }
  
    render() {
      return React.createElement(LaXErrorBoundary, {
        value: this.state.texInput
      },
        React.createElement("div", {
          className: "lax-modal-container",
          style: modalContainerStyle
        },
          // Input Section
          React.createElement("div", null,
            React.createElement("div", {style: inputLabelStyle}, "KaTeX Input"),
            React.createElement("textarea", {
              value: this.state.texInput,
              onChange: (e) => {
                this.setState({ texInput: e.target.value });
                this.props.onUpdate?.(e.target.value); // Notify parent of changes
              },
              style: textAreaStyle,
              placeholder: "E.g., E = mc^2"
            })
          ),
          
          // Preview Section
          React.createElement("div", null,
            React.createElement("div", {style: previewLabelStyle}, "Preview"),
            React.createElement("div", {
              ref: this.katexContainerRef,
              style: previewBoxStyle
            })
          ),
          
          // Error Display
          this.state.error && React.createElement("div", {
            style: {
              color: 'var(--text-danger)',
              fontSize: '13px',
              marginTop: '8px'
            }
          }, this.state.error)
        )
      );
    }  
}
function createLaXButton({ onClick }) {
  // Get Discord's button classes using BetterDiscord's Webpack module finder
  const discordButtonClasses = BdApi.Webpack.getModule(m => 
    m.button && m.grow && m.colorBrand
  );
  
  // Create the button element
  const LaXButton = document.createElement("button");
  LaXButton.classList.add(
    discordButtonClasses.button, 
    discordButtonClasses.grow, 
    "BD-LaX-plugin-button"
  );
  
  // Create the inner structure
  const div = document.createElement("div");
  const innerDiv = document.createElement("div");
  innerDiv.classList.add(discordButtonClasses.buttonWrapper);
  
  // Add SVG icon
  innerDiv.innerHTML = texIconSVG.trim();
  const svg = innerDiv.firstElementChild;
  svg.classList.add(discordButtonClasses.icon, "BD-LaX-plugin-button-icon");
  svg.setAttribute("width", "24");
  svg.setAttribute("height", "24");
  svg.setAttribute("viewBox", "0 0 512 512");
  
  // Assemble the elements
  innerDiv.append(svg);
  div.append(innerDiv);
  LaXButton.append(div);
  
  // Add click handler
  LaXButton.onclick = onClick;
  
  return LaXButton;
}

class LaX {
  constructor() {
    this.config = {
      info: {
          name: "LaX", // Plugin name
          authors: [
              {
                  name: "Nothing",
                  discord_id: "1278640580607479851",
                  github_username: "Josefifir"
              }
          ],
          version: "1.0.0",
          description: "Creates and sends TeX math equations.",
          github: "https://github.com/Josefifir/TeX",
          github_raw: "https://raw.githubusercontent.com/Josefifir/TeX/TeX.plugin.js"
      },
      defaultConfig: [
          {
              type: "color",
              id: "textColor",
              name: "Text Color",
              note: "Choose the text color for TeX equations.",
              value: "#ffffff" // Default color (white)
          }
      ]
  };

    this.settings = this.loadAllSettings();
    this.texInput = "";
    this.canvas = document.createElement("canvas");
    this.LaXButton = null;
    this.persistentSettings = BdApi.Data.load(this.constructor.name, "persistentSettings") || {};
    this.cachedElements = {
      webpackModules: null,
      domElements: {}
    };
    
    // Initialize with default or saved color
    if (!this.persistentSettings.textColor) {
      this.persistentSettings.textColor = this.config.defaultConfig.find(c => c.id === "textColor").value;
    }
  }

  loadAllSettings() {
    const savedConfig = BdApi.Data.load(this.constructor.name, "config") || {};
    const savedSettings = BdApi.Data.load(this.constructor.name, "settings") || {};
    
    return {
      config: {
        ...this.config.defaultConfig.reduce((acc, curr) => {
          acc[curr.id] = curr.value;
          return acc;
        }, {}),
        ...savedConfig
      },
      settings: savedSettings
    };
  }

  saveAllSettings() {
    BdApi.Data.save(this.constructor.name, "config", this.settings.config);
    BdApi.Data.save(this.constructor.name, "settings", this.settings.settings);
  }
  
  async start() {

    // Only proceed with the rest after library is confirmed loaded
    BdApi.DOM.addStyle(this.constructor.name, css);
    this.LaXButton = createLaXButton({
      onClick: () => this.showLaXModal()
    });
    BdApi.UI.showToast(`${this.constructor.name} has started!`);
    const TextareaClasses = BdApi.Webpack.getModule(m => 
      m.textArea?.value?.includes?.('textArea__'),
      { searchExports: true }
     ) || {
      // Fallback in case Webpack fails
      channelTextArea: { value: "channelTextArea__74017" },
      textArea: { value: "textArea__74017" },
      buttons: { value: "buttons__74017" },
    };

    // Then use them in your waiting logic
    while (!document.querySelector(`.${TextareaClasses.channelTextArea.value} .${TextareaClasses.buttons.value}`)) {
      await this.delay(500);
    }
    this.injectButton();
    this.attachments = BdApi.Webpack.getByKeys('addFiles');
    
    const css1 = `
        .lax-settings-minimal {
            padding: 16px;
            background: var(--background-tertiary);
            border-radius: 8px;
            width: 300px;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        
        .lax-minimal-title {
            color: var(--header-primary);
            margin: 0;
            text-align: center;
            font-size: 16px;
            font-weight: 600;
        }
        
        .lax-minimal-label {
            color: var(--text-muted);
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .lax-minimal-color {
            width: 100%;
            height: 32px;
            border-radius: 4px;
            border: 1px solid var(--background-modifier-accent);
            cursor: pointer;
        }
        .lax-minimal-color::-webkit-color-swatch {
           border: none;
          border-radius: 2px;
        }
        .lax-minimal-buttons {
            display: flex;
            gap: 8px;
            margin-top: 8px;
        }
        
        .lax-minimal-btn {
            flex: 1;
            padding: 8px;
            border-radius: 3px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.2s ease;
        }
        
        .lax-minimal-btn.apply {
            background: var(--brand-experiment);
            color: white;
            border: none;
        }
        
        .lax-minimal-btn.apply:hover {
            background: var(--brand-experiment-560);
        }
        
        .lax-minimal-btn.done {
            background: transparent;
            color: var(--interactive-normal);
            border: 1px solid var(--interactive-muted);
        }
        
        .lax-minimal-btn.done:hover {
            border-color: var(--interactive-normal);
        }    
    `;

    // Inject the CSS
    BdApi.DOM.addStyle("LaX-settings-styles", css1);

    // Check if version changed
    const versionInfo = BdApi.Data.load(this.constructor.name, "versionInfo") || {};
    if (this.hasVersionChanged(versionInfo.version, this.config?.info.version)) {
      this.showChangeLogModal();
      BdApi.Data.save(this.constructor.name, "versionInfo", {
        version: this.config?.info.version
      });
    }
    
    // Apply the persistent color on start
    this.applyLaXFontColor();    
  }
  stop() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    BdApi.DOM.removeStyle(this.constructor.name);
    BdApi.Patcher.unpatchAll(this.constructor.name);
    this.resetLaXFontColor();
    
    // Clean up DOM elements
    this.componentWillUnmount();

    if (this.cachedElements) {
      // Clean up DOM elements
      Object.values(this.cachedElements.domElements).forEach(element => {
        if (element?.parentNode) {
          DOM_Helper.safeRemoveNode(element);
        }
      });
      
      // Clear webpack module references
      this.cachedElements.webpackModules = null;
      this.cachedElements.domElements = {};
    }
    
    BdApi.UI.showToast(`${this.constructor.name} has stopped!`);
}
  componentWillUnmount() {
      // Clean up SVG document
      if (this.svgDocument) {
        this.svgDocument = null;
    }
    
    // Clean up canvas
    if (this.canvas) {
        this.canvas.width = 0;
        this.canvas.height = 0;
        this.canvas = null;
    }
    
    // Clean up context
    this.canvasContext = null;
    
    // Clean up any DOM references
    this.LaXButton?.remove?.();
    this.LaXButton = null;
  }

 hasVersionChanged(oldVer, newVer) {
  if (!oldVer) return true; // First run
  
  const oldParts = oldVer.split('.').map(Number);
  const newParts = newVer.split('.').map(Number);
  
  // Compare each part
  for (let i = 0; i < Math.max(oldParts.length, newParts.length); i++) {
      const oldPart = oldParts[i] || 0;
      const newPart = newParts[i] || 0;
      
      if (newPart !== oldPart) {
          return true; // Any difference means changed
      }
  }
  
  return false; // All parts equal
}    // Function to apply the LaX font color
    applyLaXFontColor() {
      const LAXSettings = BdApi.Data.load(this.constructor.name, "settings") || {};
      LAXSettings.FontColor = this.persistentSettings.textColor;
      BdApi.Data.save(this.constructor.name, "settings", LAXSettings);
      BdApi.UI.showToast("LaX font color updated successfully!", { type: "success" });
    }
    
    resetLaXFontColor() {
      // This now resets to the persistent color, not default
      const LAXSettings = BdApi.Data.load("LaX", "settings") || {};
      LAXSettings.FontColor = this.persistentSettings.textColor;
      BdApi.Data.save(this.constructor.name, "settings", LAXSettings);
      BdApi.UI.showToast("LaX font color reloaded.", { type: "info" });
    }
    getSettingsPanel() {
  
      return React.createElement(React.Fragment, null,
        React.createElement("h3", {
          style: {
            color: "var(--header-primary)",
            margin: "0 0 16px 0",
            textAlign: "center",
            fontSize: "16px",
            fontWeight: 600
          }
        }, "LaX Settings"),
  
        React.createElement("div", {
          style: {
            color: "var(--text-muted)",
            fontSize: "12px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: "8px"
          }
        }, "EQUATION COLOR"),
  
        React.createElement("input", {
          type: "color",
          value: this.persistentSettings.textColor,
          style: {
            width: "100%",
            height: "32px",
            borderRadius: "4px",
            border: "1px solid var(--background-modifier-accent)",
            cursor: "pointer",
            marginBottom: "16px"
          },
          onChange: (e) => {
            this.persistentSettings.textColor = e.target.value;
            e.target.style.backgroundColor = e.target.value;
          }
        }),
  
        React.createElement("div", {
          style: {
            display: "flex",
            gap: "8px"
          }
        },
          React.createElement("button", {
            style: {
              flex: 1,
              padding: "8px",
              background: "var(--brand-experiment)",
              color: "white",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
              fontWeight: 500
            },
            onClick: () => {
              BdApi.Data.save(this.constructor.name, "persistentSettings", this.persistentSettings);
              BdApi.UI.showToast("Settings saved", { type: "success" });
            }
          }, "Apply Settings"),
        )
      );
    }
  
    onSwitch() {
      this.injectButton();
    }
  showChangeLogModal() {
    BdApi.UI.showChangelogModal({
      title: `${this.constructor.name} v${this.config?.info.version} Changelog`,
      subtitle: "Big changes",
      blurb: "**Thank you for updating! Here's what's new:**",
      changes: [
        {
          title: "New Features",
          type: "added",
          items: [
            "**New** UI!",
            "Customizable settings panel 🛠️"
          ],
          blurb: "More control than ever!"
        },
        {
          title: "Bug Fixes",
          type: "fixed",
          items: [
            "Fixed some probelms with the font layout",
            "Fixed the NULL icon",
            "Fixing the image attachement function",
            
          ]
        },
        {
          title: "Under the Hood",
          type: "progress",
          items: [
            "No more memory leaks",
            "Rewrote the code again",
            "DOM, manipulation",
            "The KaTeX container is now sanitized",
            "Better performance",
            "Canvas is now cached"
          ]
        }
      ],
      footer: "Report issues on GitHub! ❤️"
    })
  }
  showLaXModal() {
    // Load saved input from plugin storage
    const savedInput = BdApi.Data.load(this.constructor.name, "lastLaXInput") || this.texInput || "";
    console.log("Saved Input:", savedInput); 
    let modalInstance = null;

    BdApi.UI.showConfirmationModal(
        `${this.constructor.name} Input`,
        React.createElement(LaXErrorBoundary, null, 
            React.createElement(LaXModal, {
              ref: ref => modalInstance = ref,
              initialValue: savedInput,
              onUpdate: (val) => {
                  this.texInput = val;
                  BdApi.Data.save(this.constructor.name, "lastLaXInput", val);
              }
            })
        ),  
        {
            confirmText: "Attach",
            onConfirm: async () => {
                // Get the current value directly from the modal component
                const currentInput = this.laXModalRef?.getValue() || this.texInput || "";
                
                if (!currentInput.trim()) {
                    BdApi.UI.showToast("Please enter an equation", { type: "error" });
                    return;
                }

                try {
                    this.texInput = currentInput; // Update state
                    const blob = await this.generateLaXImage();
                    await this.attachImage(blob);
                    
                    // Clear after successful attachment
                    this.texInput = "";
                    BdApi.Data.save(this.constructor.name, "lastLaXInput", "");
                } catch (error) {
                    console.error("Attachment failed:", error);
                    BdApi.UI.showToast("Failed to attach equation", { type: "error" });
                }
            },
            onCancel: () => {
              if (modalInstance) {
                modalInstance = null;
              }
            },
            onUpdate: (val) => {
              this.texInput = val;
              BdApi.Data.save(this.constructor.name, "lastLaXInput", val);
              
              // Reset preview if input was empty and new text is entered
              if (this.texInput.trim() === "" && this.laXModalRef) {
                  this.laXModalRef.resetPreview(); // Add this method to LaXModal
              }
            }
        }
    );
}  async htmlToCanvas(html, canvas, width, height) {

    let tempContainer = null;
    let image = null;
    let svgData = null;

    try{
        // Validate inputs
        if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
            throw new Error("Invalid canvas element");
        }
    
        if (width <= 0 || height <= 0) {
            throw new Error("Invalid dimensions");
        }
      canvas.width = width;
      canvas.height = height;

      // Create temporary document
      if (!this.svgDocument) {
        this.svgDocument = document.implementation.createHTMLDocument();
        this.svgDocument.write('<html><body></body></html>');
        this.svgDocument.close();
    }
    
    // Create a temporary container for parsing
    tempContainer = this.svgDocument.createElement('div');
    tempContainer.innerHTML = this.sanitizeKaTeXOutput(html);;
    
    // Additional security checks
    const dangerousElements = tempContainer.querySelectorAll(
        'script, iframe, frame, object, embed, link[rel="import"]'
    );
    dangerousElements.forEach(el => el.remove());
    
    // Clear existing content
    while (this.svgDocument.body.firstChild) {
      DOM_Helper.safeRemoveChild(this.svgDocument.body, this.svgDocument.body.firstChild);
    }
    
    // Append sanitized content
    this.svgDocument.body.appendChild(tempContainer);
    this.svgDocument.documentElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    this.svgDocument.body.setAttribute("style", "margin:0");
    
    const serialized = new XMLSerializer().serializeToString(this.svgDocument.body)
        .replace(/#/g, "%23")
        .replace(/javascript:/gi, 'blocked:');
    
    svgData = `data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject width="100%" height="100%"><style>body{margin:0;}</style>${serialized}</foreignObject></svg>`;
    
    await new Promise((resolve, reject) => {
      image = new Image();
      const timer = setTimeout(() => {
        reject(new Error("Image loading timed out"));
      }, 5000);
      image.onload = () => {
        clearTimeout(timer);
        resolve();
      };
      image.onerror = (err) => {
          clearTimeout(timer);
          reject(err);
      };
      image.src = svgData;
    });
    image.onerror = () => {
        console.error("Failed to load SVG image");
        throw new Error("SVG image loading failed");
    };
    
    // image.src = svgData;
    // await image.decode();
    
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 1, 1);      
    } catch (error) {
      console.error("htmlToCanvas error:", error);
      throw error;
    } finally {
      // Cleanup in finally block
      if (tempContainer) {
          tempContainer.innerHTML = '';
      }
      if (image) {
        image.onload = null;
        image.onerror = null;
        image.src = '';
      }
      svgData = null;
  }

  }
  sanitizeKaTeXOutput(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
  
    // Allow ALL elements, but filter attributes strictly
    const allowedAttributes = ['class', 'style', 'aria-hidden'];
    const allowedStyleProps = new Set([
      'color', 'background-color', 'font', 'font-family', 'font-size',
      'font-weight', 'font-style', 'text-align', 'line-height', 'vertical-align',
      'white-space', 'margin', 'padding', 'border', 'display',
      'position', 'top', 'left', 'right', 'bottom',
      'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
    ]);
  
    const isSafeStyleValue = value =>
      !/javascript:|expression\(|url\((["']?)javascript:/i.test(value);
  
    div.querySelectorAll('*').forEach(el => {
      [...el.attributes].forEach(attr => {
        const name = attr.name.toLowerCase();
        const value = attr.value;
  
        // Remove event handlers and suspicious protocols
        if (name.startsWith('on') || /javascript:/i.test(value)) {
          el.removeAttribute(attr.name);
          return;
        }
  
        if (name === 'style') {
          const newStyle = [];
          el.style.cssText.split(';').forEach(rule => {
            const [prop, val] = rule.split(':');
            if (!prop || !val) return;
            const key = prop.trim().toLowerCase();
            const safeVal = val.trim();
            if (allowedStyleProps.has(key) && isSafeStyleValue(safeVal)) {
              newStyle.push(`${key}: ${safeVal}`);
            }
          });
          el.setAttribute('style', newStyle.join('; '));
          return;
        }
  
        if (
          !allowedAttributes.includes(name) &&
          !name.startsWith('data-')
        ) {
          el.removeAttribute(attr.name);
        }
      });
    });
  
    return div.innerHTML;
  }

  async generateLaXImage() {
    if (!this.cachedElements.webpackModules) {
        this.cachedElements.webpackModules = {
            SelectedChannelStore: BdApi.Webpack.getModule(m => m.getChannelId && m.getLastSelectedChannelId),
            // Cache other frequently used modules
        };
    }

    let renderTarget = null;
    try {
        renderTarget = this.cachedElements.domElements.renderTarget || document.createElement("div");
        renderTarget.classList.add("BD-LaX-plugin", "BD-LaX-plugin-image-render");
        this.cachedElements.domElements.renderTarget = renderTarget;
        
        katex.render(this.texInput, renderTarget, {
            throwOnError: true,
            displayMode: true,
            fontSize: "1.35em",
            fleqn: false,
            colorIsTextColor: true,
            trust: false
        });
        
        document.body.append(renderTarget);
        const html = `<style type="text/css">${css}</style>` + renderTarget.outerHTML;
        const rect = renderTarget.getBoundingClientRect();
        
        // Fix non-integer widths
        const katexHtml = renderTarget.querySelector(".katex-html");
        const width = Math.ceil(rect.width) + (katexHtml ? katexHtml.children.length - 1 : 0);
        const height = Math.ceil(rect.height);
        await this.htmlToCanvas(html, this.canvas, width, height);
        return new Promise((resolve, reject) => {
            this.canvas.toBlob(blob => {
                if (!blob) {
                    reject(new Error("Failed to generate image blob"));
                    return;
                }
                resolve(blob);
            }, "image/png");
        });
    } catch (error) {
      if (renderTarget?.parentNode) {
        renderTarget.remove();
        }
        console.error("Error generating LaX image:", error);
        BdApi.UI.showToast("Failed to generate equation image", { type: "error" });
        throw error;
    } finally {
      if (renderTarget?.parentNode) {
        try {
            renderTarget.remove();
        } catch (e) {
            console.warn('Error removing render target:', e);
        }
    }
    if (this.canvas) {
      try{
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      } catch(e) {
        console.warn('Error removing the canvas:', e);
      }
    }
  }
}
  attachImage(blob) {
    function formatDateToDDMMYYYYSSMS(timestamp) {
      const date = new Date(timestamp);
    
      // Extract components
      const day = String(date.getDate()).padStart(2, '0');          // dd
      const month = String(date.getMonth() + 1).padStart(2, '0');   // mm
      const year = date.getFullYear();                              // yyyy
      const seconds = String(date.getSeconds()).padStart(2, '0');   // ss
      const milliseconds = String(date.getMilliseconds()).padStart(2, '0'); // ms
    
      // Combine into dd/mm/yyyy/ss/ms
      return `${day}/${month}/${year}/${seconds}/${milliseconds}`;
    }
    
    // Example usage
    const timestamp = Date.now();
    const formattedDate = formatDateToDDMMYYYYSSMS(timestamp);
    const SelectedChannelStore = BdApi.Webpack.getModule(m => m.getChannelId && m.getLastSelectedChannelId);
    const channelId = SelectedChannelStore.getChannelId();
    const file = new File([blob], `LaX-output-${formattedDate}.png`, {type: 'image/png'});
    this.attachments.addFiles({
      channelId: channelId,
      draftType: 0,
      files: [{file: file, isClip: false, isThumbnail: false, platform: 1}],
      showLargeMessageDialog: false
    });
  }
  injectButton() {
    const TextareaClasses = BdApi.Webpack.getModule(m => 
        m.textArea?.value?.includes?.('textArea__'),
        { searchExports: true }
    ) || {
        channelTextArea: { value: "channelTextArea__74017" },
        textArea: { value: "textArea__74017" },
        buttons: { value: "buttons__74017" },
    };

    const targetSelector = `.${TextareaClasses.channelTextArea.value} .${TextareaClasses.buttons.value}`;
    
    // Initial injection attempt
    this.tryInjectButton(targetSelector);
    
    // Set up mutation observer
    if (!this.observer) {
        this.observer = new MutationObserver((mutations) => {
            this.tryInjectButton(targetSelector);
        });
        
        this.observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: false
        });
    }
}

  tryInjectButton(selector) {
    const buttonsContainer = document.querySelector(selector);
    if (!buttonsContainer || buttonsContainer.querySelector('.BD-LaX-plugin-button')) return;
    
    const existingButton = buttonsContainer.querySelector('.BD-LaX-plugin-button');
    if (existingButton) {
        DOM_Helper.safeRemoveChild(buttonsContainer, existingButton);
    }
    
    if (buttonsContainer && !buttonsContainer.contains(this.LaXButton)) {
        buttonsContainer.prepend(this.LaXButton);
    }
}
    delay(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }
}

module.exports = LaX;
