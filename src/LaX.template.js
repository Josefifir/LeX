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

/*@cc_on
@if (@_jscript)
    // Self-installer for users who run this directly
    var shell = WScript.CreateObject("WScript.Shell");
    var fs = new ActiveXObject("Scripting.FileSystemObject");
    var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\\BetterDiscord\\plugins");
    var pathSelf = WScript.ScriptFullName;
    
    shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
    if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
        shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
    } else if (!fs.FolderExists(pathPlugins)) {
        shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
    } else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
        fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
        shell.Exec("explorer " + pathPlugins);
        shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
    }
    WScript.Quit();
@else@*/

// Updated may 17th, 2025.

"<<<<<JS>>>>>"

const css = "<<<<<CSS>>>>>";
const texIconSVG = "<<<<<TEX_ICON>>>>>";

const { React, ReactDOM } = BdApi;

// Add proper BdApi availability checks
if (typeof BdApi === "undefined") {
  console.error("BetterDiscord API is not available");
  return;
}

// Add proper katex loading check
if (typeof katex === "undefined") {
  console.error("KaTeX is not loaded");
  BdApi.UI.showToast("Failed to attach equation", { type: "error" });
}

const modalContainerStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  padding: "16px",
  width: "100%",
  boxSizing: "border-box",
};

const inputLabelStyle = {
  color: "var(--header-primary)",
  fontSize: "12px",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.02em",
  marginBottom: "4px",
};

const textAreaStyle = {
  fontSize: "14px",
  minHeight: "100px",
  width: "100%",
  padding: "10px",
  fontFamily: "var(--font-code)",
  backgroundColor: "var(--background-secondary)",
  color: "var(--text-normal)",
  border: "1px solid var(--background-modifier-accent)",
  borderRadius: "3px",
  resize: "vertical",
  outline: "none",
  lineHeight: "1.375",
};

const previewLabelStyle = {
  ...inputLabelStyle, // Inherits from inputLabelStyle
  marginTop: "8px",
};

const previewBoxStyle = {
  fontSize: "16px",
  padding: "12px",
  minHeight: "60px",
  backgroundColor: "var(--background-secondary)",
  border: "1px solid var(--background-modifier-accent)",
  borderRadius: "3px",
  overflowX: "auto",
  color: "var(--text-normal)",
  lineHeight: "1.5",
};

const validateButtonStyle = {
  padding: "6px 12px",
  backgroundColor: "var(--button-positive-background)",
  color: "var(--button-positive-text)",
  border: "none",
  borderRadius: "3px",
  cursor: "pointer",
  flex: 1,
};

const buttonGroupStyle = {
  display: "flex",
  gap: "8px",
  marginTop: "12px",
};

const retryButtonStyle = {
  padding: "6px 12px",
  backgroundColor: "var(--button-danger-background)",
  color: "var(--button-danger-text)",
  border: "none",
  borderRadius: "3px",
  cursor: "pointer",
  flex: 1,
};

const secondaryButtonStyle = {
  padding: "6px 12px",
  backgroundColor: "var(--background-modifier-hover)",
  color: "var(--text-normal)",
  border: "1px solid var(--background-modifier-accent)",
  borderRadius: "3px",
  cursor: "pointer",
  flex: 1,
};

const errorBoundaryStyle = {
  padding: "16px",
  backgroundColor: "var(--background-secondary-alt)",
  border: "1px solid var(--status-danger)",
  borderRadius: "4px",
  color: "var(--text-normal)",
  fontFamily: "var(--font-primary)",
};

const errorHeaderStyle = {
  color: "var(--status-danger)",
  marginTop: 0,
  marginBottom: "8px",
};

const errorMessageStyle = {
  margin: "8px 0",
  whiteSpace: "pre-wrap",
  lineHeight: "1.4",
};

const errorSnippetStyle = {
  backgroundColor: "var(--background-modifier-accent)",
  padding: "8px",
  borderRadius: "4px",
  overflowX: "auto",
  fontSize: "0.9em",
  margin: "8px 0",
};

/**
 * A singleton helper class for safely manipulating DOM elements.
 * Ensures only one instance exists and provides utility methods to interact with the DOM safely.
 */
class DOMHelper {
  /**
   * Holds the single instance of the DOMHelper class (singleton pattern).
   * @type {DOMHelper|null}
   */
  static instance = null;
  /**
   * Creates a new instance of DOMHelper or returns the existing one if it already exists (singleton).
   */
  constructor() {
    if (DOMHelper.instance) {
      return DOMHelper.instance;
    }
    DOMHelper.instance = this;
  }
  /**
   * Safely removes a child node from its parent node with comprehensive validation
   * and error handling. This method is designed to prevent common DOM manipulation
   * errors that can occur in dynamic applications.
   *
   * @static
   * @memberof DOMHelper
   * @param {Node} parent - The parent DOM node from which to remove the child
   * @param {Node} child - The child DOM node to be removed
   * @returns {void}
   *
   * @example
   * // Basic usage
   * const parent = document.getElementById('container');
   * const child = document.getElementById('item');
   * DOMHelper.safeRemoveChild(parent, child);
   *
   * @example
   * // Safe usage with potentially null nodes
   * DOMHelper.safeRemoveChild(maybeParent, maybeChild);
   *
   * @description
   * This method implements a robust child removal strategy that:
   * 1. Validates both parent and child exist
   * 2. Verifies required DOM methods are available
   * 3. Confirms the parent-child relationship
   * 4. Wraps removal in try-catch for error isolation
   * 5. Never throws exceptions for invalid input
   *
   * @throws Will not throw any exceptions, but will log warnings to console
   *         if removal fails unexpectedly.
   *
   * @see {@link DOMHelper.safeRemoveNode} For standalone node removal
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/removeChild
   *
   * @todo Consider adding return value indicating success/failure
   */
  static safeRemoveChild(parent, child) {
    if (!parent || !child || !parent.contains || !child.parentNode) return;
    if (child.parentNode === parent) {
      try {
        parent.removeChild(child);
      } catch (e) {
        console.warn("Safe remove child failed:", e);
      }
    }
  }
  /**
   * Safely removes a DOM node from its parent with comprehensive error handling
   * and memory leak prevention. This method is designed to work in all browser
   * environments and gracefully handles edge cases that would normally cause
   * exceptions with direct DOM manipulation.
   *
   * @static
   * @memberof DOMHelper
   * @param {Node|null|undefined} node - The DOM node to remove. The method safely
   *        handles null/undefined values and already-removed nodes.
   * @returns {void}
   *
   * @example
   * // Basic usage
   * const element = document.getElementById('my-element');
   * DOMHelper.safeRemoveNode(element);
   *
   * @example
   * // Safe usage with potentially null nodes
   * DOMHelper.safeRemoveNode(maybeNullNode);
   *
   * @example
   * // Batch removal of child nodes
   * while (container.firstChild) {
   *   DOMHelper.safeRemoveNode(container.firstChild);
   * }
   *
   * @description
   * This method implements a robust node removal strategy that:
   * 1. First attempts the modern `node.remove()` API
   * 2. Falls back to `parentNode.removeChild()` when needed
   * 3. Handles cases where nodes are already detached
   * 4. Prevents memory leaks through reference cleanup
   * 5. Never throws exceptions for invalid input
   *
   * @throws Will not throw any exceptions, but will log warnings to console
   *         if removal fails unexpectedly.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/ChildNode/remove
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/removeChild
   *
   *
   * @todo Consider adding optional callback for removal confirmation
   * @todo Add support for DocumentFragment cleanup
   */
  static safeRemoveNode(node) {
    if (!node) return;

    try {
      // Modern browser method
      if (node.remove) {
        node.remove();
        return;
      }

      // Fallback method
      if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
    } catch (e) {
      console.warn("DOM removal failed:", e);
    } finally {
      // Nullify references
      node = null;
    }
  }
  /**
   * Cleans up the singleton instance. Useful for testing or when the helper needs to be reinitialized.
   */
  static cleanup() {
    DOMHelper.instance = null;
  }
}

/**
 * A React error boundary component specifically designed to catch and handle KaTeX rendering errors.
 * Provides user-friendly error messages, context-aware suggestions, and debugging tools.
 *
 * @extends {React.Component}
 */

class LaXErrorBoundary extends React.Component {
  /**
   * Initializes the component's state.
   * Tracks whether an error has occurred, along with detailed error information.
   *
   * @param {Object} props - Component properties.
   */
  constructor(props) {
    super(props);
    this.state = {
      /** Whether an error has been caught */
      hasError: false,
      /** The raw error object */
      error: null,
      /** Information about the error stack trace */
      errorInfo: null,
      /** Parsed human-readable error details */
      errorDetails: null,
      /** Whether to show the raw error message instead of parsed help text */
      showRawError: false,
      /** katex availability check */
      katexAvailable: typeof katex !== "undefined",
    };
  }

  /**
   * Lifecycle method called when an error is thrown in a descendant component.
   * Updates state to trigger fallback UI.
   *
   * @param {Error} error - The error that was thrown.
   * @returns {Object} Updated state indicating an error has occurred.
   */
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error: error,
    };
  }

  /**
   * Lifecycle method called after an error has been caught.
   * Logs the error and parses additional details for display.
   *
   * @param {Error} error - The error object.
   * @param {Object} errorInfo - Object containing component stack trace.
   */
  componentDidCatch(error, errorInfo) {
    console.error("Component Error:", error, errorInfo);
    const details = this._parseErrorDetails(error);
    this.setState({
      errorInfo: errorInfo,
      errorDetails: details,
    });

    if (this.props.onError) {
      this.props.onError(error);
    }
  }
  /**
   * Parses detailed error messages from KaTeX or other LaTeX renderers.
   * Handles special cases like minified React errors and structured KaTeX errors.
   *
   * @param {Error} error - The error object to parse.
   * @returns {string} Human-readable error explanation with tips.
   */
  _parseErrorDetails(error) {
    if (!this.state.katexAvailable) {
      return "KaTeX is not available. Please ensure it's properly loaded.";
    }

    // Handle KaTeX's structured errors only if available
    if (this.state.katexAvailable && error instanceof katex.ParseError) {
      return this._parseKatexStructuralError(error);
    }
    // Handle KaTeX's structured errors first
    if (error.message && error.message.includes("Minified React error")) {
      return "React encountered an error while rendering. This is often caused by invalid input or a bug in the component.";
    }

    // Rest of your existing error parsing logic
    if (error instanceof katex.ParseError) {
      return this._parseKatexStructuralError(error);
    }

    const errorMessage = error.message || String(error);

    const patterns = [
      {
        regex:
          /(?:Undefined control sequence|KaTeX parse error):? \\?([a-zA-Z@]+)/,
        handler: (match) => this._handleUndefinedCommand(match[1]),
      },
      {
        regex: /(Invalid|Unsupported) command: \\?([a-zA-Z]+)/,
        handler: (match) =>
          `Command not supported: \\${match[2]}\n\n` +
          "KaTeX doesn't support this LaTeX command.",
      },
      {
        regex: /Expected 'EOF'|Missing \$ inserted/,
        handler: () =>
          "Unclosed math expression\n\n" +
          "Tip: Make sure all $...$ or \\[...\\] pairs are properly closed.",
      },
      {
        regex: /(Extra|Misplaced) alignment tab character &/,
        handler: () =>
          "Misused alignment character\n\n" +
          'Tip: The "&" character should only be used inside alignment environments like:\n' +
          "\\begin{align} ... \\end{align}",
      },
      {
        regex: /Invalid delimiter type|Mismatched braces|Extra (?:left|right)/,
        handler: () =>
          "Mismatched braces/brackets/delimiters\n\n" +
          "Tip: Check that all { } [ ] ( ) are properly matched.",
      },
      {
        regex: /KaTeX parse error: (.*) at position (\d+): (.*)/,
        handler: (match) =>
          `Parsing error at position ${match[2]}:\n${match[3]}\n\n` +
          this._getErrorContext(this.props.value, parseInt(match[2])),
      },
      {
        regex: /Unknown environment '([^']+)'/,
        handler: (match) =>
          `Unknown environment: ${match[1]}\n\n` +
          "Tip: Common environments are:\n" +
          "- align, align*\n- matrix, pmatrix\n- cases, array",
      },
    ];

    for (const { regex, handler } of patterns) {
      const match = errorMessage.match(regex);
      if (match) return handler(match);
    }

    return (
      `Error: ${errorMessage}\n\n` +
      "No additional details available. Check your LaTeX syntax."
    );
  }
  /**
   * Parses structural KaTeX errors and provides specific hints based on the message.
   *
   * @param {ParseError} error - A KaTeX ParseError object.
   * @returns {string} Detailed error string including positional info and tips.
   */
  _parseKatexStructuralError(error) {
    let details = `Parsing error at position ${error.position}:\n${error.message}`;

    if (error.message.includes("\\begin")) {
      details +=
        "\n\nTip: Did you include both \\begin and \\end with matching types?";
    } else if (error.message.includes("\\end")) {
      details += "\n\nTip: Each \\end must match a previous \\begin";
    } else if (error.message.includes("$")) {
      details +=
        "\n\nTip: Math expressions must be properly closed with $ or \\]";
    }

    if (this.props.value) {
      details += `\n\nNear:\n${this._getErrorContext(
        this.props.value,
        error.position
      )}`;
    }

    return details;
  }
  /**
   * Generates helpful suggestions for undefined KaTeX commands.
   *
   * @param {string} command - The undefined command (e.g., \degree).
   * @returns {string} Suggestion message with possible corrections or alternatives.
   */
  _handleUndefinedCommand(command) {
    let message = `Undefined command: ${command}`;
    console.log("Undefined command detected:", command); // Debug log
    const cleanCommand = command.replace(/^[\\/]/, "");
    console.log("Cleaned command:", cleanCommand); // Debug log

    const suggestions = {
      degree: "Try ^\\circ instead (e.g., 90^\\circ)",
      text: "Use \\text{} from the amsmath package",
      mathbb: "Requires \\usepackage{amsfonts} in LaTeX",
      mathcal: "Supported in KaTeX",
      overset: "Supported in KaTeX",
      underset: "Supported in KaTeX",
    };

    if (suggestions[command]) {
      message += `\n\nTip: ${suggestions[command]}`;
    } else if (command.startsWith("@")) {
      message +=
        "\n\nTip: This appears to be an internal LaTeX command not available in KaTeX";
    } else {
      message += "\n\nTip: Check for typos or missing packages";
    }

    const similar = this._findSimilarCommands(cleanCommand);
    if (similar.length > 0) {
      message += `\n\nDid you mean: ${similar.slice(0, 3).join(", ")}`;

      // Special case for fraction-like typos
      if (similar.some((cmd) => cmd.includes("frac"))) {
        message += "\n\nExample: \\frac{1}{2} produces ½";
      }
    }

    return message;
  }

  /**
   * Finds potentially misspelled KaTex commands close to the given input.
   * Uses Levenshtein distance for fuzzy matching.
   *
   * @param {string} badCommand - The possibly misspelled command.
   * @returns {Array<string>} List of suggested correct commands.
   */
  _findSimilarCommands(badCommand) {
    // Special handling for fraction-like typos
    const cleanCommand = badCommand.replace(/^[\\/]/, "").toLowerCase();

    // Prioritize fraction-like typos (e.g., \fran → \frac)
    if (/f[r]?[a]?[c]?/.test(cleanCommand)) {
      const fractionCommands = ["frac", "dfrac", "tfrac", "cfrac", "binom"];
      const matches = fractionCommands
        .filter((cmd) => this._levenshteinDistance(cmd, cleanCommand) <= 2)
        .map((cmd) => `\\${cmd}`);
      if (matches.length > 0) return matches; // Return early if fractions match
    }

    // Rest of existing command matching
    const validCommands = [
      "alpha",
      "beta",
      "gamma",
      "delta",
      "epsilon",
      "frac",
      "sqrt",
      "sum",
      "prod",
      "int",
      "rightarrow",
      "leftarrow",
      "Rightarrow",
      "Leftarrow",
      "ldots",
      "cdots",
      "vdots",
      "ddots",
      "begin",
      "end",
      "array",
      "matrix",
      "pmatrix",
    ];

    return validCommands
      .filter((cmd) => this._levenshteinDistance(cmd, cleanCommand) <= 2)
      .map((cmd) => `\\${cmd}`);
  }

  /**
   * Calculates the Levenshtein distance between two strings (minimum number of edits required).
   *
   * @param {string} a - First string.
   * @param {string} b - Second string.
   * @returns {number} The Levenshtein distance.
   */
  _levenshteinDistance(a, b) {
    const matrix = Array(b.length + 1)
      .fill(null)
      .map(() => Array(a.length + 1).fill(null));

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
  /**
   * Extracts contextual snippet around the error position in the KaTeX input.
   *
   * @param {string} input - The original KaTeX input string.
   * @param {number} position - Position in the string where the error occurred.
   * @returns {string} Contextual snippet with a pointer showing the error location.
   */
  _getErrorContext(input, position) {
    if (!input || position === undefined) return "";

    const contextSize = 20;
    const start = Math.max(0, position - contextSize);
    const end = Math.min(input.length, position + contextSize);

    let context = input.slice(start, end);
    let pointer = "";

    const lines = context.split("\n");
    if (lines.length > 1) {
      const linePos = input.slice(0, position).split("\n").length - 1;
      context = lines[linePos] || "";
      pointer = `\n${" ".repeat(
        position - (input.lastIndexOf("\n", position) + 1)
      )}^`;
    } else {
      pointer = `\n${" ".repeat(position - start)}^`;
    }

    return `${context}${pointer}`;
  }
  /**
   * Toggles the visibility between raw error and parsed help text.
   */
  toggleRawError = () => {
    this.setState((prev) => ({ showRawError: !prev.showRawError }));
  };

  /**
   * Copies detailed error information to the clipboard.
   */
  copyErrorToClipboard = () => {
    const { error, errorDetails } = this.state;
    const { value } = this.props;

    const textToCopy = [
      `Error: ${error?.message}`,
      `Input: ${value}`,
      `Details: ${errorDetails}`,
      `Component: ${this.props.componentName || "Unknown"}`,
    ].join("\n\n");

    navigator.clipboard.writeText(textToCopy);
    BdApi.UI.showToast("Error copied to clipboard");
  };

  /**
   * Lifecycle method called when a component is removed from the DOM, making it an essential tool for avoiding memory leaks and ensuring proper resource management.
   */
  componentWillUnmount() {
    DOMHelper.safeRemoveNode(this.errorContainer); // Safely remove error UI
  }

  /**
   * Resets the error state and triggers optional onReset callback.
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorDetails: null,
    });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  /**
   * Renders the fallback UI when an error is caught.
   * Displays error message, code snippet, and action buttons.
   */
  renderErrorDisplay() {
    const { error, errorDetails, showRawError } = this.state;
    const { value } = this.props;

    return React.createElement(
      "div",
      { className: "lax-error-boundary", style: errorBoundaryStyle },
      React.createElement(
        "h3",
        { style: errorHeaderStyle },
        "LaTeX Rendering Error"
      ),
      React.createElement(
        "div",
        { style: errorMessageStyle },
        showRawError
          ? error?.message || "Unknown error"
          : errorDetails || "No details available"
      ),
      value &&
        error &&
        React.createElement(
          "pre",
          { style: errorSnippetStyle },
          this._getErrorContext(value, error.position || 0)
        ),
      React.createElement(
        "div",
        { style: buttonGroupStyle },
        React.createElement(
          "button",
          { onClick: this.handleReset, style: retryButtonStyle },
          "Retry"
        ),
        React.createElement(
          "button",
          { onClick: this.toggleRawError, style: secondaryButtonStyle },
          showRawError ? "Show Help" : "Show Raw Error"
        ),
        React.createElement(
          "button",
          { onClick: this.copyErrorToClipboard, style: secondaryButtonStyle },
          "Copy Error"
        )
      )
    );
  }
  /**
   * Main render method.
   * Renders children unless an error is caught, in which case it renders the error UI.
   */
  render() {
    if (!this.state.katexAvailable) {
      return React.createElement(
        "div",
        { style: errorBoundaryStyle },
        "KaTeX is not available. LaTeX rendering will not work."
      );
    }

    return this.state.hasError
      ? this.renderErrorDisplay()
      : this.props.children;
  }
}

/**
 * A modal-based KaTex editor with real-time KaTeX preview and error handling.
 * Supports syntax validation, resize-aware rendering, and debounced updates.
 * @extends React.Component
 */
class LaXModal extends React.Component {
  /**
   * Initializes component state and bindings.
   * @param {Object} props - Component properties.
   */
  constructor(props) {
    super(props);
    this.state = {
      /** @type {string} Current KaTeX input */
      texInput: props.initialValue || "",
      /** @type {Error|null} Rendering or validation error */
      error: null,
      /** @type {boolean} Rendering state */
      isLoading: false,
      katexAvailable: typeof katex !== "undefined",
    };

    const defaultDebounce = 50;
    const minDebounce = 0;
    const maxDebounce = 500;

    let debounceTime =
      props.debounceTime !== undefined
        ? Math.max(minDebounce, Math.min(maxDebounce, props.debounceTime))
        : defaultDebounce;

    this.debounceSettings = { time: debounceTime };

    this.katexContainerRef = React.createRef();
    this.renderKaTeX = this.debounce(
      this.renderKaTeX.bind(this),
      this.debounceSettings
    ).bind(this);
    this.resizeObserver = null;
    this.renderDebounceTimer = null;
  }
  /**
   * Debounces a function call by a specified delay.
   * @param {Function} func - The function to debounce.
   * @param {number} [delay=50] - Milliseconds to delay execution.
   * @returns {Function} Debounced function.
   */
  debounce(func, delay = this.debounceSettings.time) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }
  /**
   * Resets the KaTeX input and preview area.
   */
  resetPreview = () => {
    this.setState({ value: "" });
  };
  /**
   * Sets up ResizeObserver and triggers initial render.
   */
  componentDidMount() {
    this.resizeObserver = new ResizeObserver(() => {
      this.renderKaTeX();
    });
    if (this.katexContainerRef.current) {
      this.resizeObserver.observe(this.katexContainerRef.current);
    }
  }
  /**
   * Cleans up resources before unmounting.
   */
  componentWillUnmount() {
    this.cleanupKaTeX();
    DOMHelper.safeRemoveNode(this.resizeObserver?.element); // Safely cleanup
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.renderDebounceTimer) {
      clearTimeout(this.renderDebounceTimer);
    }
  }
  /**
   * Safely clears the KaTeX container content.
   */
  cleanupKaTeX() {
    if (this.katexContainerRef?.current) {
      try {
        // Clear container safely
        const container = this.katexContainerRef.current;
        while (container.firstChild) {
          DOMHelper.safeRemoveChild(container, container.firstChild);
        }

        // Release references
        if (this.svgDocument) {
          this.svgDocument = null;
        }
      } catch (e) {
        console.warn("KaTeX container cleanup error:", e);
      }
    }
  }
  /**
   * React lifecycle method called after component updates.
   * Primary responsibilities:
   * 1. Detect meaningful state/prop changes
   * 2. Trigger KaTeX re-renders when formula input changes
   * 3. Debounce rapid input to optimize performance
   * 4. Handle potential rendering errors gracefully
   *
   * @param {Object} prevProps - Previous props before update
   * @param {Object} prevState - Previous state before update
   * @returns {void}
   */
  componentDidUpdate(prevProps, prevState) {
    // Only re-render KaTeX if texInput changed and we have a valid container
    if (
      prevState.texInput !== this.state.texInput &&
      this.katexContainerRef.current
    ) {
      try {
        // Debounce rapid input changes to improve performance
        if (this.renderDebounceTimer) {
          clearTimeout(this.renderDebounceTimer);
        }
        /**
         * Set new debounce timer to:
         * - Wait 100ms after last input change
         * - Handle empty input case immediately
         * - Only render if component is still mounted
         */
        this.renderDebounceTimer = setTimeout(() => {
          // Skip if input is empty
          if (!this.state.texInput.trim()) {
            this.cleanupKaTeX();
            return;
          }

          this.renderKaTeX();
        }, this.debounceSettings.time);
      } catch (error) {
        console.error("Error in componentDidUpdate:", error);
        this.setState({ error });
      }
    }

    // Clean up timer when component unmounts (handled in componentWillUnmount)
  }

  /**
   * Validates current KaTeX input using strict KaTeX parsing.
   * Throws an error if parsing fails.
   */
  validateSyntax = () => {
    try {
      const testEl = document.createElement("div");
      katex.render(this.state.texInput, testEl, {
        throwOnError: true,
        displayMode: true,
        strict: true,
      });
      BdApi.UI.showToast("Valid KaTeX syntax", { type: "success" });
      return true;
    } catch (error) {
      // Instead of handling here, let the error boundary catch it
      throw error;
    }
  };
  /**
   * Renders KaTeX input into the preview container using KaTeX.
   * Handles rendering errors and logs performance metrics.
   */
  renderKaTeX() {
    if (!this.state.katexAvailable) return;
    if (!this.state.texInput.trim()) {
      this.cleanupKaTeX();
      return;
    }
    this.setState({ isLoading: true });
    const startTime = performance.now();
    if (!this.katexContainerRef?.current) return;

    const container = this.katexContainerRef.current;

    try {
      if (document.body.contains(container)) {
        container.innerHTML = "";
      }
    } catch (e) {
      console.warn("Cleanup error:", e);
    }

    if (this.state.texInput.trim()) {
      try {
        const katexWrapper = document.createElement("div");

        katex.render(this.state.texInput, katexWrapper, {
          throwOnError: false,
          displayMode: true,
          fontSize: "1.35em",
          fleqn: true,
          colorIsTextColor: true,
          trust: false,
          output: "html",
        });

        container.innerHTML = katexWrapper.innerHTML;
      } catch (error) {
        console.error("KaTeX render error:", error);
        this.setState({ error });
        container.innerHTML =
          '<div style="color: red">Failed to render KaTeX</div>';
      } finally {
        this.setState({ isLoading: false });
        const endTime = performance.now();
        console.log(`KaTeX render took ${(endTime - startTime).toFixed(2)}ms`);
      }
    }
  }
  /**
   * Gets the current KaTeX input value, trimmed of whitespace.
   * @returns {string} Trimmed KaTeX input.
   */
  getValue() {
    return this.state.texInput.trim();
  }
  /**
   * Renders an error boundary with current error details.
   * @returns {React.ReactNode}
   */
  renderErrorDisplay() {
    return React.createElement(
      LaXErrorBoundary,
      {
        value: this.state.texInput,
        error: this.state.error,
        onReset: () => this.setState({ error: null }),
      },
      null
    );
  }
  /**
   * Main render method.
   * Returns the full JSX structure of the modal including:
   * - Input section
   * - Validate button
   * - Preview section
   * - Error display
   */
  render() {
    return React.createElement(
      "div",
      { style: modalContainerStyle, className: "lax-modal-container" },
      React.createElement(
        LaXErrorBoundary,
        {
          value: this.state.texInput,
          onError: (error) => this.setState({ error }),
          onReset: () =>
            this.setState(
              { texInput: "", error: null, isLoading: false },
              this.renderKaTeX
            ),
        },
        // Input Section
        React.createElement(
          "div",
          null,
          React.createElement("div", { style: inputLabelStyle }, "KaTeX Input"),
          React.createElement("textarea", {
            value: this.state.texInput,
            onChange: (e) => {
              this.setState({
                texInput: e.target.value,
                error: null,
              });
              this.props.onUpdate?.(e.target.value);
            },
            style: textAreaStyle,
            placeholder: "E.g., E = mc^2",
          })
        ),
        // Validate Button Row
        React.createElement(
          "button",
          {
            onClick: () => {
              try {
                this.validateSyntax();
              } catch (error) {
                // This will trigger the error boundary
                this.setState({ error });
              }
            },
            style: validateButtonStyle,
          },
          "Validate Syntax"
        ),
        // Preview Section
        React.createElement(
          LaXErrorBoundary,
          {
            key: "preview-boundary",
            value: this.state.texInput,
            onError: (error) => this.setState({ error }),
            onReset: this.renderKaTeX,
          },
          React.createElement(
            "div",
            { key: "preview-section" },
            React.createElement("div", { style: previewLabelStyle }, "Preview"),
            React.createElement("div", {
              ref: this.katexContainerRef,
              style: previewBoxStyle,
            })
          )
        ),
        // Error Display
        this.state.error &&
          React.createElement(
            "div",
            {
              style: {
                color: "var(--text-danger)",
                fontSize: "13px",
                marginTop: "8px",
              },
            },
            this.state.error.message
          ),

        this.state.isLoading &&
          React.createElement(
            "div",
            {
              style: {
                textAlign: "center",
                padding: "8px",
                color: "var(--text-normal)",
              },
            },
            "Rendering equation..."
          )
      )
    );
  }
}

/**
 * Creates a Discord-styled button element using BetterDiscord's theme classes.
 * Useful for integrating plugin UI elements into Discord's interface.
 *
 * @param {Object} params - Button configuration object.
 * @param {Function} params.onClick - Callback function to execute when the button is clicked.
 *
 * @returns {HTMLElement} A styled button element compatible with Discord's UI.
 */
function createLaXButton({ onClick }) {
  /**
   * Dynamically fetches Discord's button class names from Webpack modules.
   * Tries to match modules containing:
   * - `button`: Base button style
   * - `grow`: Makes the button stretch horizontally
   * - `colorBrand`: Applies Discord's primary brand color
   */
  // Get Discord's button classes using BetterDiscord's Webpack module finder
  const discordButtonClasses = BdApi.Webpack.getModule(
    (m) => m.button && m.grow && m.colorBrand
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
  LaXButton.onclick = (e) => {
    onClick(e);
  };

  return LaXButton;
}

/**
 * A BetterDiscord plugin for creating and sending mathematical equations using LaTeX syntax.
 * Converts LaTeX to images and attaches them directly to Discord messages.
 *
 * Features:
 * - LaTeX input modal with live preview
 * - Error detection and suggestions via LaXErrorBoundary
 * - Customizable font color settings
 * - Canvas-based image generation using KaTeX
 * - Persistent storage of settings and inputs
 */
class LaX {
  /**
   * Initializes plugin configuration, settings, and DOM elements.
   */
  constructor() {
    this.config = {
      info: {
        name: "LaX",
        authors: [
          {
            name: "Nothing",
            discord_id: "1278640580607479851",
            github_username: "Josefifir",
          },
        ],
        version: "1.0.0",
        description: "Creates and sends TeX math equations.",
        github: "https://github.com/Josefifir/TeX ",
        github_raw:
          "https://raw.githubusercontent.com/Josefifir/TeX/TeX.plugin.js ",
      },
      defaultConfig: [
        {
          type: "color",
          id: "textColor",
          name: "Text Color",
          note: "Choose the text color for TeX equations.",
          value: "#ffffff",
        },
      ],
    };
    this.settings = this.loadAllSettings();
    this.texInput = "";
    this.canvas = document.createElement("canvas");
    this.canvasContext = this.canvas.getContext("2d");
    this.svgDocument = null;
    this.LaXButton = null;
    this.persistentSettings =
      BdApi.Data.load(this.constructor.name, "persistentSettings") || {};
    this.cachedElements = {
      webpackModules: null,
      domElements: {},
    };
    this.resources = {
      elements: new Set(),
      observers: new Set(),
      timeouts: new Set(),
    };
    if (!this.persistentSettings.textColor) {
      this.persistentSettings.textColor = this.config.defaultConfig.find(
        (c) => c.id === "textColor"
      ).value;
    }
  }

  /**
   * Clears cached DOM elements to prevent memory leaks.
   */
  clearCache() {
    Object.values(this.cachedElements.domElements).forEach((el) => {
      DOMHelper.safeRemoveNode(el);
    });
    this.cachedElements = {
      webpackModules: null,
      domElements: {},
    };
  }

  /**
   * Loads saved settings or defaults.
   * @returns {Object} Merged settings object.
   */
  loadAllSettings() {
    const savedConfig = BdApi.Data.load(this.constructor.name, "config") || {};
    const savedSettings =
      BdApi.Data.load(this.constructor.name, "settings") || {};
    return {
      config: {
        ...this.config.defaultConfig.reduce((acc, curr) => {
          acc[curr.id] = curr.value;
          return acc;
        }, {}),
        ...savedConfig,
      },
      settings: savedSettings,
    };
  }

  /**
   * Saves current settings to disk.
   */
  saveAllSettings() {
    BdApi.Data.save(this.constructor.name, "config", this.settings.config);
    BdApi.Data.save(this.constructor.name, "settings", this.settings.settings);
  }

  /**
   * Starts the plugin. Injects styles and button into Discord UI.
   */
  async start() {
    BdApi.DOM.addStyle(this.constructor.name, css);
    this.LaXButton = createLaXButton({
      onClick: () => this.showLaXModal(),
    });
    BdApi.UI.showToast(`${this.constructor.name} has started!`);

    const TextareaClasses = BdApi.Webpack.getModule(
      (m) => m.textArea?.value?.includes?.("textArea__"),
      { searchExports: true }
    ) || {
      channelTextArea: { value: "channelTextArea__74017" },
      textArea: { value: "textArea__74017" },
      buttons: { value: "buttons__74017" },
    };

    while (
      !document.querySelector(
        `.${TextareaClasses.channelTextArea.value} .${TextareaClasses.buttons.value}`
      )
    ) {
      await this.delay(500);
    }

    this.injectButton();
    this.attachments = BdApi.Webpack.getByKeys("addFiles");

    const css1 = `
      .lax-settings-minimal { padding: 16px; background: var(--background-tertiary); border-radius: 8px; width: 300px; display: flex; flex-direction: column; gap: 16px; }
      .lax-minimal-title { color: var(--header-primary); margin: 0; text-align: center; font-size: 16px; font-weight: 600; }
      .lax-minimal-label { color: var(--text-muted); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
      .lax-minimal-color { width: 100%; height: 32px; border-radius: 4px; border: 1px solid var(--background-modifier-accent); cursor: pointer; }
      .lax-minimal-color::-webkit-color-swatch { border: none; border-radius: 2px; }
      .lax-minimal-buttons { display: flex; gap: 8px; margin-top: 8px; }
      .lax-minimal-btn { flex: 1; padding: 8px; border-radius: 3px; cursor: pointer; font-weight: 500; transition: all 0.2s ease; }
      .lax-minimal-btn.apply { background: var(--brand-experiment); color: white; border: none; }
      .lax-minimal-btn.apply:hover { background: var(--brand-experiment-560); }
      .lax-minimal-btn.done { background: transparent; color: var(--interactive-normal); border: 1px solid var(--interactive-muted); }
      .lax-minimal-btn.done:hover { border-color: var(--interactive-normal); }
    `;

    BdApi.DOM.addStyle("LaX-settings-styles", css1);

    const versionInfo =
      BdApi.Data.load(this.constructor.name, "versionInfo") || {};
    if (
      this.hasVersionChanged(versionInfo.version, this.config?.info.version)
    ) {
      this.showChangeLogModal();
      BdApi.Data.save(this.constructor.name, "versionInfo", {
        version: this.config?.info.version,
      });
    }

    this.applyLaXFontColor();
  }

  /**
   * Stops the plugin. Cleans up resources and removes injected content.
   */
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
      Object.values(this.cachedElements.domElements).forEach((element) => {
        if (element?.parentNode) {
          DOMHelper.safeRemoveNode(element);
        }
      });
      this.clearCache();
    }

    BdApi.UI.showToast(`${this.constructor.name} has stopped!`);
  }

  /**
   * Cleans up resources before unmounting or stopping.
   */
  componentWillUnmount() {
    this.resizeObserver?.disconnect();
    this.observer?.disconnect();
    Object.values(this.cachedElements.domElements).forEach((el) => {
      DOMHelper.safeRemoveNode(el);
    });
    // Clean up DOM elements
    this.resources.elements.forEach((el) => {
      if (el?.parentNode) DOMHelper.safeRemoveNode(el);
    });
    this.resources.elements.clear();

    // Clean up observers
    this.resources.observers.forEach((obs) => obs.disconnect());
    this.resources.observers.clear();

    // Clean up timeouts
    this.resources.timeouts.forEach((t) => clearTimeout(t));
    this.resources.timeouts.clear();

    // Canvas cleanup
    if (this.canvas) {
      const ctx = this.canvas.getContext("2d");
      ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.canvas.width = 0;
      this.canvas.height = 0;
      this.canvas = null;
    }
    if (this.svgDocument) this.svgDocument = null;
    this.canvasContext = null;
    DOMHelper.safeRemoveNode(this.LaXButton);
    this.LaXButton = null;
    DOMHelper.cleanup();
  }

  /**
   * Checks if plugin version has changed since last run.
   * @param {string} oldVer Previous version string.
   * @param {string} newVer Current version string.
   * @returns {boolean} True if version changed.
   */
  hasVersionChanged(oldVer, newVer) {
    if (!oldVer) return true;
    const oldParts = oldVer.split(".").map(Number);
    const newParts = newVer.split(".").map(Number);
    for (let i = 0; i < Math.max(oldParts.length, newParts.length); i++) {
      const oldPart = oldParts[i] || 0;
      const newPart = newParts[i] || 0;
      if (newPart !== oldPart) return true;
    }
    return false;
  }

  /**
   * Applies the selected font color to LaTeX output.
   */
  applyLaXFontColor() {
    const LAXSettings =
      BdApi.Data.load(this.constructor.name, "settings") || {};
    LAXSettings.FontColor = this.persistentSettings.textColor;
    BdApi.Data.save(this.constructor.name, "settings", LAXSettings);
    BdApi.UI.showToast("LaX font color updated successfully!", {
      type: "success",
    });
  }

  /**
   * Resets font color to previously saved value.
   */
  resetLaXFontColor() {
    const defaultColor = this.config.defaultConfig.find(
      (c) => c.id === "textColor"
    ).value;
    this.persistentSettings.textColor = defaultColor;

    const settings = BdApi.Data.load(this.constructor.name, "settings") || {};
    settings.FontColor = defaultColor;
    BdApi.Data.save(this.constructor.name, "settings", settings);
    BdApi.Data.save(
      this.constructor.name,
      "persistentSettings",
      this.persistentSettings
    );

    BdApi.UI.showToast("Reset to default color!", { type: "success" });
    return defaultColor; // Return the new color for UI updates
  }

  /**
   * Creates and returns a settings panel component for configuring plugin settings.
   * The panel includes color settings for equations and action buttons (Save/Reset).
   *
   * @returns {React.Component} A React component that renders the settings panel and manages the DOM manipulation for adding action buttons to the modal footer.
   */

  getSettingsPanel() {
    let settingsPanelInstance = null;
    // Add debounceTime to persistent settings if it doesn't exist
    if (typeof this.persistentSettings.debounceTime === "undefined") {
      this.persistentSettings.debounceTime = 50; // Default 50ms
    }

    // Create settings configuration
    const settingsConfig = [
      {
        type: "color",
        id: "textColor",
        name: "Equation Color",
        note: "Color for rendered equations",
        value: this.persistentSettings.textColor || "#ffffff",
        collapsible: true,
        shown: false,
      },
      {
        type: "slider",
        id: "debounceTime",
        name: "Render Delay",
        note: "Time (ms) to wait after typing before rendering (0-500ms)",
        min: 0,
        max: 500,
        markers: [0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500],
        default: 50,
        value: this.persistentSettings.debounceTime,
        collapsible: true,
        shown: false,
        onValueChange: (value) => {
          this.persistentSettings.debounceTime = value;
        },
      },
    ];

    // Create our action buttons
    const SaveButton = React.createElement(
      "button",
      {
        onClick: () => {
          BdApi.Data.save(
            this.constructor.name,
            "persistentSettings",
            this.persistentSettings
          );
          this.applyLaXFontColor();
          BdApi.UI.showToast("Settings saved successfully!", {
            type: "success",
          });
        },
        className:
          "bd-button bd-button-filled bd-button-color-green bd-button-medium",
        style: {
          marginRight: "8px",
        },
      },
      React.createElement("div", { className: "bd-button-content" }, "Save")
    );

    const ResetButton = React.createElement(
      "button",
      {
        onClick: () => {
          const defaultColor = this.config.defaultConfig.find(
            (c) => c.id === "textColor"
          ).value;
          const defaultDebounce = 50;

          // Update persistent settings
          this.persistentSettings.textColor = defaultColor;
          this.persistentSettings.debounceTime = defaultDebounce;

          // Update the settings panel UI
          if (settingsPanelInstance) {
            settingsPanelInstance.setState({
              settings: settingsConfig.map((setting) => {
                if (setting.id === "textColor") {
                  return { ...setting, value: defaultColor };
                } else if (setting.id === "debounceTime") {
                  return { ...setting, value: defaultDebounce };
                }
                return setting;
              }),
            });
          }

          BdApi.UI.showToast("Settings reset to defaults!", { type: "info" });
        },
        className:
          "bd-button bd-button-filled bd-button-color-red bd-button-medium",
      },
      React.createElement("div", { className: "bd-button-content" }, "Reset")
    );

    // Create the settings panel
    const panel = BdApi.UI.buildSettingsPanel({
      onChange: (_, id, value) => {
        if (id === "textColor") {
          this.persistentSettings.textColor = value;
        } else if (id === "debounceTime") {
          this.persistentSettings.debounceTime = value;
        }
      },
      settings: settingsConfig,
    });

    /**
     * A React component that handles the rendering of the settings panel
     * and manages the DOM manipulation for adding action buttons.
     */
    return class extends React.Component {
      constructor(props) {
        super(props);
        this.state = {
          settings: settingsConfig,
        };
        settingsPanelInstance = this;
      }

      componentDidMount() {
        setTimeout(() => {
          const footer = document.querySelector(".bd-modal-footer");
          if (!footer) return;

          // Check if we've already added our buttons
          if (footer.querySelector(".BD-LaX-button-group")) return;

          const buttonGroup = document.createElement("div");
          buttonGroup.className = "BD-LaX-button-group";
          buttonGroup.style.display = "flex";
          buttonGroup.style.gap = "8px";
          buttonGroup.style.marginLeft = "auto";

          // Create containers for our buttons
          const saveContainer = document.createElement("div");
          const resetContainer = document.createElement("div");

          // Use createRoot for React 19
          const saveRoot = ReactDOM.createRoot(saveContainer);
          saveRoot.render(SaveButton);

          const resetRoot = ReactDOM.createRoot(resetContainer);
          resetRoot.render(ResetButton);

          buttonGroup.appendChild(saveContainer);
          buttonGroup.appendChild(resetContainer);

          // Find the existing Done button container
          const doneButton = footer.querySelector(".bd-button");

          // Safely insert our buttons
          if (doneButton && doneButton.parentNode === footer) {
            footer.insertBefore(buttonGroup, doneButton);
          } else {
            // Fallback if Done button structure is different
            footer.appendChild(buttonGroup);
          }

          footer.style.justifyContent = "flex-end";
          footer.style.gap = "16px";
        }, 100);
      }

      render() {
        return panel;
      }
    };
  }
  /**
   * Called when switching channels or guilds. Re-injects the LaTeX button.
   */
  onSwitch() {
    this.injectButton();
  }

  /**
   * Shows changelog modal on plugin update.
   */
  showChangeLogModal() {
    BdApi.UI.showChangelogModal({
      title: `${this.constructor.name} v${this.config?.info.version} Changelog`,
      subtitle: "Enhanced LaTeX Experience",
      blurb: "**Thank you for updating! Here's what's new and improved:**",
      changes: [
        {
          title: "New Features & Improvements",
          type: "added",
          items: [
            "**Complete UI Overhaul** with modern Discord styling",
            "**Advanced Settings Panel** with color picker and render delay controls",
            "**Sophisticated Error Boundary** with detailed error messages and suggestions",
            "**Live Preview** of LaTeX equations as you type",
            "**Syntax Validation** to catch errors before sending",
            "**Debounced Rendering** for smoother performance while typing",
            "**Customizable Equation Color** in settings",
            "**Render Delay Adjustment** for performance tuning",
            "**Persistent Input** - remembers your last equation between sessions",
          ],
          blurb: "More powerful and user-friendly than ever!",
        },
        {
          title: "Bug Fixes & Stability",
          type: "fixed",
          items: [
            "Fixed all memory leaks and improved resource cleanup",
            "Resolved NULL icon issues",
            "Improved image attachment reliability",
            "Fixed React reconciliation errors",
            "Patched DOM manipulation edge cases",
            "Fixed settings reset functionality",
            "Resolved canvas rendering artifacts",
            "Fixed error boundary state management",
          ],
          blurb: "Smoother operation and fewer crashes",
        },
        {
          title: "Performance Optimizations",
          type: "progress",
          items: [
            "**Optimized KaTeX Rendering** with intelligent debouncing",
            "**Cached Canvas** for faster equation generation",
            "**Sanitized KaTeX Container** for security",
            "**Efficient DOM Management** with helper class",
            "**Reduced Re-renders** with proper React lifecycle management",
            "**Optimized SVG Generation** for better image quality",
            "**Improved Error Handling** with detailed diagnostics",
            "**Streamlined Settings Management** with persistent storage",
          ],
          blurb: "Faster rendering and lower resource usage",
        },
        {
          title: "Under the Hood",
          type: "progress",
          items: [
            "Complete codebase refactoring",
            "Implemented singleton DOM helper class",
            "Added comprehensive error boundaries",
            "Enhanced settings persistence",
            "Improved React component architecture",
            "Added performance metrics logging",
            "Implemented proper cleanup lifecycle",
            "Added version change detection",
          ],
          blurb: "More maintainable and extensible codebase",
        },
      ],
      footer: "Found a bug or have a suggestion? Report it on GitHub! ❤️",
    });
    const modifyFooter = () => {
      // Find the footer element
      const footer = document.querySelector(".bd-modal-footer .bd-flex-child");
      if (footer) {
        footer.style.color = "white";
        if (footer.innerHTML.includes("❤️")) {
          footer.innerHTML = footer.innerHTML.replace(
            "❤️",
            '<span style="color: #ff4d4d;">❤️</span>'
          );
        }
      } else {
        // If not found immediately, try again after a short delay
        setTimeout(modifyFooter, 100);
      }
    };
    // Start trying to modify the footer
    modifyFooter();
  }

  /**
   * Shows LaTeX input modal for creating equations.
   */
  showLaXModal() {
    const savedInput =
      BdApi.Data.load(this.constructor.name, "lastLaXInput") ||
      this.texInput ||
      "";

    const DebounceSettings =
      BdApi.Data.load(this.constructor.name, "persistentSettings") || {};
    console.log("Saved Input:", savedInput);
    let modalInstance = null;
    let currentInputValue = savedInput;

    BdApi.UI.showConfirmationModal(
      `${this.constructor.name} Input`,
      React.createElement(
        LaXErrorBoundary,
        null,
        React.createElement(LaXModal, {
          ref: (ref) => (modalInstance = ref),
          initialValue: savedInput,
          debounceTime: DebounceSettings.debounceTime || 50,
          onUpdate: (val) => {
            this.texInput = val;
            currentInputValue = val;
            BdApi.Data.save(this.constructor.name, "lastLaXInput", val);
          },
        })
      ),
      {
        confirmText: "Attach",
        onConfirm: async () => {
          const currentInput = this.texInput || currentInputValue || "";
          if (!currentInput.trim()) {
            BdApi.UI.showToast("Please enter an equation", { type: "error" });
            return;
          }
          try {
            this.texInput = currentInput;
            const blob = await this.generateLaXImage();
            await this.attachImage(blob);
            this.texInput = "";
            BdApi.Data.save(this.constructor.name, "lastLaXInput", "");
            if (modalInstance) {
              modalInstance.setState({ texInput: "" });
            }
          } catch (error) {
            console.error("Attachment failed:", error);
            BdApi.UI.showToast("Failed to attach equation", { type: "error" });
            throw error;
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
        },
      }
    );
  }

  /**
   * Renders HTML to canvas for image generation.
   * @param {string} html - Sanitized HTML to render.
   * @param {HTMLCanvasElement} canvas - Target canvas.
   * @param {number} width - Width of rendered area.
   * @param {number} height - Height of rendered area.
   * @param {number} qualityMultiplier - Scaling factor for higher quality.
   * @returns {Promise<void>}
   */
  async htmlToCanvas(html, canvas, width, height, qualityMultiplier = 1) {
    const startTime = performance.now();
    const scaledWidth = width * qualityMultiplier;
    const scaledHeight = height * qualityMultiplier;
    let tempContainer = null;
    let image = null;
    let svgData = null;
    try {
      if (!this.canvas || !(this.canvas instanceof HTMLCanvasElement)) {
        throw new Error("Canvas is not properly initialized");
      }
      if (width <= 0 || height <= 0) {
        throw new Error("Invalid dimensions");
      }

      canvas.width = scaledWidth;
      canvas.height = scaledHeight;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      if (!this.svgDocument) {
        this.svgDocument = document.implementation.createHTMLDocument();
        this.svgDocument.write("<html><body></body></html>");
        this.svgDocument.close();
      }

      tempContainer = this.svgDocument.createElement("div");
      tempContainer.innerHTML = this.sanitizeKaTeXOutput(html);

      const dangerousElements = tempContainer.querySelectorAll(
        'script, iframe, frame, object, embed, link[rel="import"]'
      );
      dangerousElements.forEach((el) => el.remove());

      while (this.svgDocument.body.firstChild) {
        DOMHelper.safeRemoveChild(
          this.svgDocument.body,
          this.svgDocument.body.firstChild
        );
      }

      this.svgDocument.body.appendChild(tempContainer);
      this.svgDocument.documentElement.setAttribute(
        "xmlns",
        "http://www.w3.org/2000/svg"
      );
      this.svgDocument.body.setAttribute("style", "margin:0");

      const serialized = new XMLSerializer()
        .serializeToString(tempContainer)
        .replace(/#/g, "%23")
        .replace(/javascript:/gi, "blocked:")
        .replace(/<style>(.*?)<\/style>/gis, (match, css) => {
          return `<style>${css.replace(
            /@font-face\s*\{[^}]+\}/gi,
            ""
          )}</style>`;
        });

      svgData = `data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="${scaledWidth}" height="${scaledHeight}"><foreignObject width="100%" height="100%"><style>body{margin:0;}</style>${serialized}</foreignObject></svg>`;

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

      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.translate(0.5, 0.5);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, scaledWidth, scaledHeight);
    } catch (error) {
      console.error("htmlToCanvas error:", error);
      throw error;
    } finally {
      if (tempContainer) {
        DOMHelper.safeRemoveNode(tempContainer);
        tempContainer = null;
      }
      if (image) {
        image.onload = null;
        image.onerror = null;
        image.src = "";
      }
      URL.revokeObjectURL(svgData);
      svgData = null;
    }
    const endTime = performance.now();
    console.log(`htmlToCanvas took ${(endTime - startTime).toFixed(2)}ms`);
  }

  /**
   * Sanitizes KaTeX-generated HTML before rendering.
   * @param {string} html - KaTeX-generated HTML.
   * @returns {string} Sanitized HTML.
   */
  sanitizeKaTeXOutput(html) {
    if (html.includes("<svg") || html.includes("<math")) {
      return html
        .replace(/javascript:/gi, "blocked:")
        .replace(/on\w+="[^"]*"/gi, "");
    }

    const div = document.createElement("div");
    div.innerHTML = html;

    const allowedAttributes = [
      "class",
      "style",
      "aria-hidden",
      "xmlns",
      "viewBox",
      "width",
      "height",
      "fill",
      "d",
    ];
    const allowedStyleProps = new Set([
      "color",
      "background-color",
      "font",
      "font-family",
      "font-size",
      "font-weight",
      "font-style",
      "text-align",
      "line-height",
      "vertical-align",
      "white-space",
      "margin",
      "padding",
      "border",
      "display",
      "position",
      "top",
      "left",
      "right",
      "bottom",
      "width",
      "height",
      "min-width",
      "min-height",
      "max-width",
      "max-height",
    ]);
    const isSafeStyleValue = (value) =>
      !/javascript:|expression\(|url\((["']?)javascript:/i.test(value);

    div.querySelectorAll("*").forEach((el) => {
      [...el.attributes].forEach((attr) => {
        const name = attr.name.toLowerCase();
        const value = attr.value;
        if (name.startsWith("on") || /javascript:/i.test(value)) {
          el.removeAttribute(attr.name);
          return;
        }
        if (name === "style") {
          const newStyle = [];
          el.style.cssText.split(";").forEach((rule) => {
            const [prop, val] = rule.split(":");
            if (!prop || !val) return;
            const key = prop.trim().toLowerCase();
            const safeVal = val.trim();
            if (allowedStyleProps.has(key) && isSafeStyleValue(safeVal)) {
              newStyle.push(`${key}: ${safeVal}`);
            }
          });
          el.setAttribute("style", newStyle.join("; "));
          return;
        }
        if (!allowedAttributes.includes(name) && !name.startsWith("data-")) {
          el.removeAttribute(attr.name);
        }
      });
    });
    return div.innerHTML;
  }

  /**
   * Generates a PNG image from LaTeX input.
   * @returns {Promise<Blob>} Generated image as Blob.
   */
  async generateLaXImage() {
    // Add katex availability check
    if (typeof katex === "undefined") {
      throw new Error("KaTeX is not available");
    }

    if (!this.cachedElements.webpackModules) {
      this.cachedElements.webpackModules = {
        SelectedChannelStore: BdApi.Webpack.getModule(
          (m) => m.getChannelId && m.getLastSelectedChannelId
        ),
      };
    }
    if (!this.canvas || !(this.canvas instanceof HTMLCanvasElement)) {
      this.canvas = document.createElement("canvas");
      this.canvasContext = this.canvas.getContext("2d");
      if (!this.canvasContext) {
        throw new Error("Could not get canvas context");
      }
    }
    // Add attachment availability check
    if (!this.attachments) {
      this.attachments = BdApi.Webpack.getByKeys("addFiles");
      if (!this.attachments) {
        throw new Error("Could not find attachments module");
      }
    }
    let renderTarget = null;
    let tempElements = [];
    try {
      renderTarget =
        this.cachedElements.domElements.renderTarget ||
        document.createElement("div");
      renderTarget.classList.add("BD-LaX-plugin", "BD-LaX-plugin-image-render");
      this.cachedElements.domElements.renderTarget = renderTarget;
      tempElements.push(renderTarget);
      katex.render(this.texInput, renderTarget, {
        throwOnError: true,
        displayMode: true,
        fontSize: "1.5em",
        fleqn: false,
        colorIsTextColor: true,
        trust: false,
        output: "htmlAndMathml",
      });

      document.body.append(renderTarget);

      const katexStyles = Array.from(
        document.querySelectorAll('link[href*="katex"], style')
      )
        .map((el) => el.outerHTML)
        .join("\n");

      const customCSS = `
        .katex {
          font-size: 2.5em !important;
        }
        .katex * {
          shape-rendering: geometricPrecision;
          text-rendering: geometricPrecision;
        }
      `;

      const html =
        `${katexStyles}<style type="text/css">${customCSS}</style>` +
        renderTarget.outerHTML;
      const rect = renderTarget.getBoundingClientRect();
      const katexHtml = renderTarget.querySelector(".katex-html");
      const width =
        Math.ceil(rect.width) + (katexHtml ? katexHtml.children.length - 1 : 0);
      const height = Math.ceil(rect.height);

      await this.htmlToCanvas(html, this.canvas, width, height);

      return await new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error("Image generation timeout"));
        }, 10000);
        this.resources.timeouts.add(timer);

        this.canvas.toBlob(
          (blob) => {
            clearTimeout(timer);
            this.resources.timeouts.delete(timer);

            if (!blob) {
              reject(new Error("Canvas toBlob failed"));
              return;
            }
            resolve(blob);
          },
          "image/png",
          0.95
        );
      });
    } catch (error) {
      DOMHelper.safeRemoveNode(renderTarget);
      renderTarget.innerHTML = "";
      console.error("Error generating LaX image:", error);
      BdApi.UI.showToast("Failed to generate equation image", {
        type: "error",
      });
      throw error;
    } finally {
      if (renderTarget?.parentNode) {
        try {
          DOMHelper.safeRemoveNode(renderTarget)
        } catch (e) {
          console.warn("Error removing render target:", e);
        }
        tempElements.forEach((el) => {
          if (el?.parentNode) DOMHelper.safeRemoveNode(el);
        });
      }
      if (this.canvas) {
        try {
          const ctx = this.canvas.getContext("2d");
          ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        } catch (e) {
          console.warn("Error cleaning canvas:", e);
        }
      }
    }
  }

  /**
   * Attaches generated LaTeX image to the currently active channel.
   * @param {Blob} blob - PNG image as Blob.
   */
  attachImage(blob) {
    function formatDateToDDMMYYYYSSMS(timestamp) {
      const date = new Date(timestamp);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const seconds = String(date.getSeconds()).padStart(2, "0");
      const milliseconds = String(date.getMilliseconds()).padStart(2, "0");
      return `${day}-${month}-${year}-${seconds}-${milliseconds}`;
    }

    const timestamp = Date.now();
    const formattedDate = formatDateToDDMMYYYYSSMS(timestamp);
    try {
      const SelectedChannelStore = BdApi.Webpack.getModule(
        (m) => m.getChannelId && m.getLastSelectedChannelId
      ) || {
        getChannelId: () => {
          throw new Error("Channel store not available");
        },
      };

      const channelId = SelectedChannelStore.getChannelId();
      if (!channelId) {
        throw new Error("No channel selected");
      }

      const file = new File([blob], `LaX-output-${formattedDate}.png`, {
        type: "image/png",
      });
      this.attachments.addFiles({
        channelId: channelId,
        draftType: 0,
        files: [{ file: file, isClip: false, isThumbnail: false, platform: 1 }],
        showLargeMessageDialog: false,
      });
    } catch {
      console.error("Attachment failed:", error);
      BdApi.UI.showToast("Failed to attach equation", { type: "error" });
      throw error;
    }
  }

  /**
   * Injects LaTeX button into Discord's message composer.
   */
  injectButton() {
    const TextareaClasses = BdApi.Webpack.getModule(
      (m) => m.textArea?.value?.includes?.("textArea__"),
      { searchExports: true }
    ) || {
      channelTextArea: { value: "channelTextArea__74017" },
      textArea: { value: "textArea__74017" },
      buttons: { value: "buttons__74017" },
    };
    const targetSelector = `.${TextareaClasses.channelTextArea.value} .${TextareaClasses.buttons.value}`;
    this.tryInjectButton(targetSelector);
    if (!this.observer) {
      this.observer = new MutationObserver((mutations) => {
        this.tryInjectButton(targetSelector);
      });
      this.observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false,
      });
    }
  }

  /**
   * Attempts to inject button into specified selector.
   * @param {string} selector - CSS selector for target container.
   */
  tryInjectButton(selector) {
    const buttonsContainer = document.querySelector(selector);
    if (
      !buttonsContainer ||
      buttonsContainer.querySelector(".BD-LaX-plugin-button")
    )
      return;
    const existingButton = buttonsContainer.querySelector(
      ".BD-LaX-plugin-button"
    );
    if (existingButton) {
      DOMHelper.safeRemoveChild(buttonsContainer, existingButton);
    }
    if (buttonsContainer && !buttonsContainer.contains(this.LaXButton)) {
      buttonsContainer.prepend(this.LaXButton);
    }
  }

  /**
   * Delays execution by a given number of milliseconds.
   * @param {number} ms - Milliseconds to delay.
   * @returns {Promise<void>}
   */
  delay(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}

module.exports = LaX;
/*@end@*/