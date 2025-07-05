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

// Updated April 9th, 2025.

"<<<<<JS>>>>>"

const css = "<<<<<CSS>>>>>";
const texIconSVG = "<<<<<TEX_ICON>>>>>";

const { React, ReactDOM } = BdApi;

// Add proper BdApi availability checks
if (typeof BdApi === 'undefined') {
    console.error('BetterDiscord API is not available');
    return;
}

// Add proper katex loading check
if (typeof katex === 'undefined') {
    console.error('KaTeX is not loaded');
    BdApi.UI.showToast('Failed to attach equation', { type: 'error' });
}

const modalContainerStyle = {
    fontFamily: 'var(--font-family)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '16px',
    width: '100%',
    boxSizing: 'border-box',
    maxWidth: '700px',
    maxHeight: "100vh", // Ensure modal doesn't exceed screen height
    // overflowY: "auto"
};

const inputLabelStyle = {
    color: 'var(--header-primary)',
    fontSize: '14px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
    marginBottom: '4px',
    display: 'block',
};

const textAreaStyle = {
    width: '93%',
    minHeight: '100px',
    padding: '14px',
    borderRadius: '6px',
    border: '1px solid hsl(240 calc(1*4%) 60.784% /0.12156862745098039)',
    backgroundColor: 'var(--background-base-lower)',
    color: 'var(--text-default)',
    fontSize: '14px',
    resize: 'vertical',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    ':focus': {
        borderColor: 'var(--interactive-accent)',
    },
    caretColor: 'var(--text-default)', // Show cursor

};

const previewLabelStyle = {
    ...inputLabelStyle, // Inherits from inputLabelStyle
    marginTop: '8px',
    borderRadius: '6px',
    transition: 'background-color 0.2s ease',
    ':hover': {
        backgroundColor: 'var(--interactive-accent-hover)',
    },
};

const previewBoxStyle = {
    fontSize: '16px',
    padding: '12px',
    minHeight: '60px',
    backgroundColor: 'var(--background-base-lower)',
    border: '1px solid hsl(240 calc(1*4%) 60.784% /0.12156862745098039)',
    borderRadius: '3px',
    overflowX: 'auto',
    color: 'var(--text-default)',
    lineHeight: '1.5',
};

const validateButtonStyle = {
    padding: '6px 12px',
    backgroundColor: 'var(--button-positive-background)',
    color: 'var(--button-positive-text)',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    flex: 1,
};

const buttonGroupStyle = {
    display: 'flex',
    gap: '8px',
    marginTop: '12px',
};

const retryButtonStyle = {
    padding: '6px 12px',
    backgroundColor: 'var(--button-danger-background)',
    color: 'var(--button-danger-text)',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    flex: 1,
};

const secondaryButtonStyle = {
    padding: '6px 12px',
    backgroundColor: 'var(--background-modifier-hover)',
    color: 'var(--text-default)',
    border: '1px solid hsl(240 calc(1*4%) 60.784% /0.12156862745098039)',
    borderRadius: '3px',
    cursor: 'pointer',
    flex: 1,
};

const errorBoundaryStyle = {
    padding: '16px',
    backgroundColor: 'var(--background-base-lower)',
    border: '1px solid var(--status-danger)',
    borderRadius: '4px',
    color: 'var(--text-default)',
    fontFamily: 'var(--font-primary)',
};

const errorHeaderStyle = {
    color: 'var(--status-danger)',
    marginTop: 0,
    marginBottom: '8px',
};

const errorMessageStyle = {
    margin: '8px 0',
    whiteSpace: 'pre-wrap',
    lineHeight: '1.4',
};

const errorSnippetStyle = {
    backgroundColor: 'hsl(240 calc(1*4%) 60.784% /0.12156862745098039)',
    padding: '8px',
    borderRadius: '4px',
    overflowX: 'auto',
    fontSize: '0.9em',
    margin: '8px 0',
};

const historyContainerStyle = {
    marginTop: '20px',
    'marginLeft': '15px',
    width: '93%',
    borderRadius: '3px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid hsl(240 calc(1*4%) 60.784% /0.12156862745098039)',
};

const historyHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: 'var(--background-base-lower)',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    color: 'var(--text-default)',
    transition: 'all 0.2s ease',
    borderBottom: '1px solid hsl(240 calc(1*4%) 60.784% /0.12156862745098039)',
    ':hover': {
        backgroundColor: 'hsl(240 calc(1*4%) 60.784% /0.12156862745098039)',
    },
};

const historyContentStyle = (isCollapsed) => ({
    maxHeight: isCollapsed ? '0px' : '400px',
    overflowY: 'auto',
    backgroundColor: 'var(--background-base-lower)',
    transition:
        'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease',
    opacity: isCollapsed ? 0 : 1,
    pointerEvents: isCollapsed ? 'none' : 'auto',
    scrollbarWidth: 'thin',
    '::-webkit-scrollbar': {
        width: '8px',
    },
    '::-webkit-scrollbar-thumb': {
        backgroundColor: 'hsl(240 calc(1*4%) 60.784% /0.12156862745098039)',
        borderRadius: '4px',
        ':hover': {
            backgroundColor: 'var(--background-modifier-accent-hover)',
        },
    },
});

const historyItemStyle = {
    padding: '12px 16px',
    fontSize: '14px',
    color: 'var(--text-default)',
    cursor: 'pointer',
    borderBottom: '1px solid hsl(240 calc(1*4%) 60.784% /0.12156862745098039)',
    transition: 'all 0.2s ease',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    ':hover': {
        backgroundColor: 'var(--background-modifier-hover)',
        paddingLeft: '20px',
    },
    ':last-child': {
        borderBottom: 'none',
    },
};

const deleteButtonStyle = {
    marginLeft: 'auto',
    padding: '4px 8px',
    backgroundColor: 'transparent',
    color: 'var(--text-muted)',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'all 0.2s ease',
    ':hover': {
        color: 'var(--text-error)',
        backgroundColor: 'var(--background-modifier-error-hover)',
    },
};

const clearAllButtonStyle = {
    marginTop: '8px',
    padding: '6px 12px',
    backgroundColor: 'transparent',
    color: 'var(--text-muted)',
    border: '1px solid hsl(240 calc(1*4%) 60.784% /0.12156862745098039)',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'all 0.2s ease',
    display: 'block',
    width: '100%',
    textAlign: 'center',
    ':hover': {
        color: 'var(--text-error)',
        borderColor: 'var(--background-modifier-error)',
    },
};

const lintBoxStyle = {
    padding: '12px',
    backgroundColor: 'var(--background-base-lower)',
    border: '1px solid hsl(240 calc(1*4%) 60.784% /0.12156862745098039)',
    borderRadius: '4px',
    fontSize: '13px',
    color: 'var(--text-default)',
    lineHeight: '1.5',
    overflowX: 'auto'
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
                console.warn('Safe remove child failed:', e);
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
            console.warn('DOM removal failed:', e);
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
            katexAvailable: typeof katex !== 'undefined',
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
        console.error('Component Error:', error, errorInfo);
        const details = this._parseErrorDetails(error);
        this.setState({
            errorInfo: errorInfo,
            errorDetails: details,
        });

        if (this.props.onError) {
            this.props.onError(error);
        }
    }
    componentWillUnmount() {
        DOMHelper.safeRemoveNode(this.errorContainer);
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
        if (error.message && error.message.includes('Minified React error')) {
            return 'React encountered an error while rendering. This is often caused by invalid input or a bug in the component.';
        }

        // Rest of your existing error parsing logic
        if (error instanceof katex.ParseError) {
            return this._parseKatexStructuralError(error);
        }

        const errorMessage = error.message || String(error);

        const patterns = [
            {
                regex: /(?:Undefined control sequence|KaTeX parse error):? \\?([a-zA-Z@]+)/,
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
                    'Unclosed math expression\n\n' +
                    'Tip: Make sure all $...$ or \\[...\\] pairs are properly closed.',
            },
            {
                regex: /(Extra|Misplaced) alignment tab character &/,
                handler: () =>
                    'Misused alignment character\n\n' +
                    'Tip: The "&" character should only be used inside alignment environments like:\n' +
                    '\\begin{align} ... \\end{align}',
            },
            {
                regex: /Invalid delimiter type|Mismatched braces|Extra (?:left|right)/,
                handler: () =>
                    'Mismatched braces/brackets/delimiters\n\n' +
                    'Tip: Check that all { } [ ] ( ) are properly matched.',
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
                    'Tip: Common environments are:\n' +
                    '- align, align*\n- matrix, pmatrix\n- cases, array',
            },
        ];

        for (const { regex, handler } of patterns) {
            const match = errorMessage.match(regex);
            if (match) return handler(match);
        }

        return (
            `Error: ${errorMessage}\n\n` +
            'No additional details available. Check your LaTeX syntax.'
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

        if (error.message.includes('\\begin')) {
            details +=
                '\n\nTip: Did you include both \\begin and \\end with matching types?';
        } else if (error.message.includes('\\end')) {
            details += '\n\nTip: Each \\end must match a previous \\begin';
        } else if (error.message.includes('$')) {
            details +=
                '\n\nTip: Math expressions must be properly closed with $ or \\]';
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
        console.log('Undefined command detected:', command); // Debug log
        const cleanCommand = command.replace(/^[\\/]/, '');
        console.log('Cleaned command:', cleanCommand); // Debug log

        const suggestions = {
            degree: 'Try ^\\circ instead (e.g., 90^\\circ)',
            text: 'Use \\text{} from the amsmath package',
            mathbb: 'Requires \\usepackage{amsfonts} in LaTeX',
            mathcal: 'Supported in KaTeX',
            overset: 'Supported in KaTeX',
            underset: 'Supported in KaTeX',
        };

        if (suggestions[command]) {
            message += `\n\nTip: ${suggestions[command]}`;
        } else if (command.startsWith('@')) {
            message +=
                '\n\nTip: This appears to be an internal LaTeX command not available in KaTeX';
        } else {
            message += '\n\nTip: Check for typos or missing packages';
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
        const cleanCommand = badCommand.replace(/^[\\/]/, '').toLowerCase();

        // Prioritize fraction-like typos (e.g., \fran → \frac)
        if (/f[r]?[a]?[c]?/.test(cleanCommand)) {
            const fractionCommands = [
                'frac',
                'dfrac',
                'tfrac',
                'cfrac',
                'binom',
            ];
            const matches = fractionCommands
                .filter(
                    (cmd) => this._levenshteinDistance(cmd, cleanCommand) <= 2
                )
                .map((cmd) => `\\${cmd}`);
            if (matches.length > 0) return matches; // Return early if fractions match
        }

        // Rest of existing command matching
        const validCommands = [
            "AA",
            "AE",
            "Alpha",
            "And",
            "Bbb",
            "Bbbk",
            "Beta",
            "Big",
            "Bigg",
            "Biggl",
            "Biggm",
            "Biggr",
            "Bigl",
            "Bigm",
            "Bigr",
            "Box",
            "Bra",
            "Braket",
            "Bumpeq",
            "C",
            "Cap",
            "Chi",
            "Colonapprox",
            "Coloneq",
            "Coloneqq",
            "Colonsim",
            "Complex",
            "Cup",
            "Dagger",
            "Darr",
            "Delta",
            "Diamond",
            "Doteq",
            "Downarrow",
            "Epsilon",
            "Eqcolon",
            "Eqqcolon",
            "Eta",
            "Finv",
            "Game",
            "Gamma",
            "H",
            "Harr",
            "Huge",
            "Im",
            "Iota",
            "Join",
            "KaTeX",
            "Kappa",
            "Ket",
            "LARGE",
            "LaTeX",
            "Lambda",
            "Large",
            "Larr",
            "Leftarrow",
            "Leftrightarrow",
            "Lleftarrow",
            "Longleftarrow",
            "Longleftrightarrow",
            "Longrightarrow",
            "Lrarr",
            "Lsh",
            "Mu",
            "N",
            "Nu",
            "O",
            "OE",
            "Omega",
            "Omicron",
            "Overrightarrow",
            "P",
            "Phi",
            "Pi",
            "Pr",
            "Psi",
            "R",
            "Rarr",
            "Re",
            "Reals",
            "Rho",
            "Rightarrow",
            "Rrightarrow",
            "Rsh",
            "S",
            "Set",
            "Sigma",
            "Subset",
            "Supset",
            "Tau",
            "TeX",
            "TextOrMath",
            "Theta",
            "Uarr",
            "Uparrow",
            "Updownarrow",
            "Upsilon",
            "VERT",
            "Vdash",
            "Vert",
            "Vvdash",
            "Xi",
            "Z",
            "Zeta",
            "aa",
            "above",
            "acute",
            "ae",
            "alef",
            "alefsym",
            "aleph",
            "allowbreak",
            "alpha",
            "amalg",
            "angl",
            "angle",
            "approx",
            "approxcolon",
            "approxcoloncolon",
            "approxeq",
            "arccos",
            "arcctg",
            "arcsin",
            "arctan",
            "arctg",
            "arg",
            "argmax",
            "argmin",
            "ast",
            "asymp",
            "atop",
            "backepsilon",
            "backprime",
            "backsim",
            "backsimeq",
            "backslash",
            "bar",
            "barwedge",
            "bcancel",
            "because",
            "begin",
            "beta",
            "beth",
            "between",
            "bf",
            "big",
            "bigcap",
            "bigcirc",
            "bigcup",
            "bigg",
            "biggl",
            "biggm",
            "biggr",
            "bigl",
            "bigm",
            "bigodot",
            "bigoplus",
            "bigotimes",
            "bigr",
            "bigsqcup",
            "bigstar",
            "bigtriangledown",
            "bigtriangleup",
            "biguplus",
            "bigvee",
            "bigwedge",
            "binom",
            "blacklozenge",
            "blacksquare",
            "blacktriangle",
            "blacktriangledown",
            "blacktriangleleft",
            "blacktriangleright",
            "bm",
            "bmod",
            "bold",
            "boldsymbol",
            "bot",
            "bowtie",
            "boxdot",
            "boxed",
            "boxminus",
            "boxplus",
            "boxtimes",
            "bra",
            "brace",
            "brack",
            "braket",
            "breve",
            "bullet",
            "bumpeq",
            "c",
            "cal",
            "cancel",
            "cap",
            "cdot",
            "cdotp",
            "cdots",
            "centerdot",
            "cfrac",
            "ch",
            "char",
            "check",
            "checkmark",
            "chi",
            "choose",
            "circ",
            "circeq",
            "circlearrowleft",
            "circlearrowright",
            "circledR",
            "circledS",
            "circledast",
            "circledcirc",
            "circleddash",
            "clap",
            "cline",
            "clubs",
            "clubsuit",
            "cnums",
            "colon",
            "colonapprox",
            "coloncolon",
            "coloncolonapprox",
            "coloncolonequals",
            "coloncolonminus",
            "coloncolonsim",
            "coloneq",
            "coloneqq",
            "colonequals",
            "colonminus",
            "colonsim",
            "color",
            "colorbox",
            "complement",
            "cong",
            "coprod",
            "copyright",
            "cos",
            "cosec",
            "cosh",
            "cot",
            "cotg",
            "coth",
            "cr",
            "csc",
            "ctg",
            "cth",
            "cup",
            "curlyeqprec",
            "curlyeqsucc",
            "curlyvee",
            "curlywedge",
            "curvearrowleft",
            "curvearrowright",
            "dArr",
            "dag",
            "dagger",
            "daleth",
            "darr",
            "dashleftarrow",
            "dashrightarrow",
            "dashv",
            "dbinom",
            "dblcolon",
            "ddag",
            "ddagger",
            "ddddot",
            "dddot",
            "ddot",
            "ddots",
            "def",
            "deg",
            "degree",
            "delta",
            "det",
            "dfrac",
            "diagdown",
            "diagup",
            "diamond",
            "diamonds",
            "diamondsuit",
            "digamma",
            "dim",
            "displaystyle",
            "div",
            "divideontimes",
            "dot",
            "doteq",
            "doteqdot",
            "dotplus",
            "dots",
            "dotsb",
            "dotsc",
            "dotsi",
            "dotsm",
            "dotso",
            "doublebarwedge",
            "doublecap",
            "doublecup",
            "downarrow",
            "downdownarrows",
            "downharpoonleft",
            "downharpoonright",
            "edef",
            "ell",
            "emph",
            "empty",
            "emptyset",
            "end",
            "enspace",
            "epsilon",
            "eqcirc",
            "eqcolon",
            "eqqcolon",
            "eqsim",
            "eqslantgtr",
            "eqslantless",
            "equalscolon",
            "equalscoloncolon",
            "equiv",
            "eta",
            "eth",
            "exist",
            "exists",
            "exp",
            "expandafter",
            "fallingdotseq",
            "fcolorbox",
            "flat",
            "foo",
            "footnotesize",
            "forall",
            "frac",
            "frak",
            "frown",
            "futurelet",
            "gamma",
            "gcd",
            "gdef",
            "ge",
            "genfrac",
            "geq",
            "geqq",
            "geqslant",
            "gets",
            "gg",
            "ggg",
            "gggtr",
            "gimel",
            "global",
            "gnapprox",
            "gneq",
            "gneqq",
            "gnsim",
            "grave",
            "gt",
            "gtrapprox",
            "gtrdot",
            "gtreqless",
            "gtreqqless",
            "gtrless",
            "gtrsim",
            "gvertneqq",
            "hArr",
            "harr",
            "hat",
            "hbar",
            "hbox",
            "hdashline",
            "hearts",
            "heartsuit",
            "hline",
            "hom",
            "hookleftarrow",
            "hookrightarrow",
            "hphantom",
            "href",
            "hskip",
            "hslash",
            "hspace",
            "html",
            "htmlClass",
            "htmlData",
            "htmlId",
            "htmlStyle",
            "huge",
            "i",
            "iff",
            "iiint",
            "iint",
            "image",
            "imageof",
            "imath",
            "impliedby",
            "implies",
            "in",
            "includegraphics",
            "inf",
            "infin",
            "infty",
            "injlim",
            "int",
            "intercal",
            "intop",
            "iota",
            "isin",
            "it",
            "j",
            "jmath",
            "kappa",
            "ker",
            "kern",
            "ket",
            "lArr",
            "lBrace",
            "lVert",
            "lambda",
            "land",
            "lang",
            "langle",
            "large",
            "larr",
            "lbrace",
            "lbrack",
            "lceil",
            "ldotp",
            "ldots",
            "le",
            "leadsto",
            "left",
            "leftarrow",
            "leftarrowtail",
            "leftharpoondown",
            "leftharpoonup",
            "leftleftarrows",
            "leftrightarrow",
            "leftrightarrows",
            "leftrightharpoons",
            "leftrightsquigarrow",
            "leftthreetimes",
            "leq",
            "leqq",
            "leqslant",
            "lessapprox",
            "lessdot",
            "lesseqgtr",
            "lesseqqgtr",
            "lessgtr",
            "lesssim",
            "let",
            "lfloor",
            "lg",
            "lgroup",
            "lhd",
            "lim",
            "liminf",
            "limits",
            "limsup",
            "ll",
            "llap",
            "llbracket",
            "llcorner",
            "lll",
            "llless",
            "lmoustache",
            "ln",
            "lnapprox",
            "lneq",
            "lneqq",
            "lnot",
            "lnsim",
            "log",
            "long",
            "longleftarrow",
            "longleftrightarrow",
            "longmapsto",
            "longrightarrow",
            "looparrowleft",
            "looparrowright",
            "lor",
            "lozenge",
            "lparen",
            "lq",
            "lrArr",
            "lrarr",
            "lrcorner",
            "lt",
            "ltimes",
            "lvert",
            "lvertneqq",
            "makeatletter",
            "maltese",
            "mapsto",
            "mathbb",
            "mathbf",
            "mathbin",
            "mathcal",
            "mathchoice",
            "mathclap",
            "mathclose",
            "mathellipsis",
            "mathfrak",
            "mathinner",
            "mathit",
            "mathllap",
            "mathnormal",
            "mathop",
            "mathopen",
            "mathord",
            "mathpunct",
            "mathrel",
            "mathring",
            "mathrlap",
            "mathrm",
            "mathscr",
            "mathsf",
            "mathsfit",
            "mathsterling",
            "mathstrut",
            "mathtt",
            "max",
            "measuredangle",
            "medspace",
            "mho",
            "mid",
            "middle",
            "min",
            "minuscolon",
            "minuscoloncolon",
            "minuso",
            "mkern",
            "mod",
            "models",
            "mp",
            "mskip",
            "mu",
            "multicolumn",
            "multimap",
            "nLeftarrow",
            "nLeftrightarrow",
            "nRightarrow",
            "nVDash",
            "nVdash",
            "nabla",
            "natnums",
            "natural",
            "ncong",
            "ne",
            "nearrow",
            "neg",
            "negmedspace",
            "negthickspace",
            "negthinspace",
            "neq",
            "newcommand",
            "newline",
            "nexists",
            "ngeq",
            "ngeqq",
            "ngeqslant",
            "ngtr",
            "ni",
            "nleftarrow",
            "nleftrightarrow",
            "nleq",
            "nleqq",
            "nleqslant",
            "nless",
            "nmid",
            "nobreak",
            "nobreakspace",
            "noexpand",
            "nonumber",
            "normalsize",
            "not",
            "notag",
            "notin",
            "notni",
            "nparallel",
            "nprec",
            "npreceq",
            "nrightarrow",
            "nshortmid",
            "nshortparallel",
            "nsim",
            "nsubseteq",
            "nsubseteqq",
            "nsucc",
            "nsucceq",
            "nsupseteq",
            "nsupseteqq",
            "ntriangleleft",
            "ntrianglelefteq",
            "ntriangleright",
            "ntrianglerighteq",
            "nu",
            "nvDash",
            "nvdash",
            "nwarrow",
            "o",
            "odot",
            "oe",
            "oiiint",
            "oiint",
            "oint",
            "omega",
            "omicron",
            "ominus",
            "operatorname",
            "operatornamewithlimits",
            "oplus",
            "origof",
            "oslash",
            "otimes",
            "over",
            "overbrace",
            "overgroup",
            "overleftarrow",
            "overleftharpoon",
            "overleftrightarrow",
            "overline",
            "overlinesegment",
            "overrightarrow",
            "overrightharpoon",
            "overset",
            "owns",
            "par",
            "parallel",
            "partial",
            "perp",
            "phantom",
            "phase",
            "phi",
            "pi",
            "pitchfork",
            "plim",
            "plusmn",
            "pm",
            "pmb",
            "pmod",
            "pod",
            "pounds",
            "prec",
            "precapprox",
            "preccurlyeq",
            "preceq",
            "precnapprox",
            "precneqq",
            "precnsim",
            "precsim",
            "prime",
            "prod",
            "projlim",
            "propto",
            "providecommand",
            "psi",
            "qquad",
            "quad",
            "r",
            "rArr",
            "rVert",
            "raisebox",
            "rang",
            "rangle",
            "rarr",
            "ratio",
            "rbrace",
            "rbrack",
            "rceil",
            "real",
            "reals",
            "relax",
            "renewcommand",
            "restriction",
            "rfloor",
            "rgroup",
            "rhd",
            "rho",
            "right",
            "rightarrow",
            "rightarrowtail",
            "rightharpoondown",
            "rightharpoonup",
            "rightleftarrows",
            "rightleftharpoons",
            "rightrightarrows",
            "rightsquigarrow",
            "rightthreetimes",
            "risingdotseq",
            "rlap",
            "rm",
            "rmoustache",
            "rparen",
            "rq",
            "rrbracket",
            "rtimes",
            "rule",
            "rvert",
            "scriptscriptstyle",
            "scriptsize",
            "scriptstyle",
            "sdot",
            "searrow",
            "sec",
            "sect",
            "set",
            "setminus",
            "sf",
            "sh",
            "sharp",
            "shortmid",
            "shortparallel",
            "sigma",
            "sim",
            "simcolon",
            "simcoloncolon",
            "simeq",
            "sin",
            "sinh",
            "small",
            "smallfrown",
            "smallint",
            "smallsetminus",
            "smallsmile",
            "smash",
            "smile",
            "sout",
            "space",
            "spades",
            "spadesuit",
            "sphericalangle",
            "sqcap",
            "sqcup",
            "sqrt",
            "sqsubset",
            "sqsubseteq",
            "sqsupset",
            "sqsupseteq",
            "square",
            "ss",
            "stackrel",
            "star",
            "sub",
            "sube",
            "subset",
            "subseteq",
            "subseteqq",
            "subsetneq",
            "subsetneqq",
            "substack",
            "succ",
            "succapprox",
            "succcurlyeq",
            "succeq",
            "succnapprox",
            "succneqq",
            "succnsim",
            "succsim",
            "sum",
            "sup",
            "supe",
            "supset",
            "supseteq",
            "supseteqq",
            "supsetneq",
            "supsetneqq",
            "surd",
            "swarrow",
            "tag",
            "tan",
            "tanh",
            "tau",
            "tbinom",
            "text",
            "textXX",
            "textasciicircum",
            "textasciitilde",
            "textbackslash",
            "textbar",
            "textbardbl",
            "textbf",
            "textbraceleft",
            "textbraceright",
            "textcircled",
            "textcolor",
            "textdagger",
            "textdaggerdbl",
            "textdegree",
            "textdollar",
            "textellipsis",
            "textemdash",
            "textendash",
            "textgreater",
            "textit",
            "textless",
            "textmd",
            "textnormal",
            "textquotedblleft",
            "textquotedblright",
            "textquoteleft",
            "textquoteright",
            "textregistered",
            "textrm",
            "textsf",
            "textsterling",
            "textstyle",
            "texttt",
            "textunderscore",
            "textup",
            "tfrac",
            "tg",
            "th",
            "therefore",
            "theta",
            "thetasym",
            "thickapprox",
            "thicksim",
            "thickspace",
            "thinspace",
            "tilde",
            "times",
            "tiny",
            "to",
            "top",
            "triangle",
            "triangledown",
            "triangleleft",
            "trianglelefteq",
            "triangleq",
            "triangleright",
            "trianglerighteq",
            "tt",
            "twoheadleftarrow",
            "twoheadrightarrow",
            "u",
            "uArr",
            "uarr",
            "ulcorner",
            "underbar",
            "underbrace",
            "undergroup",
            "underleftarrow",
            "underleftrightarrow",
            "underline",
            "underlinesegment",
            "underrightarrow",
            "underset",
            "unlhd",
            "unrhd",
            "uparrow",
            "updownarrow",
            "upharpoonleft",
            "upharpoonright",
            "uplus",
            "upsilon",
            "upuparrows",
            "urcorner",
            "url",
            "utilde",
            "v",
            "vDash",
            "varDelta",
            "varGamma",
            "varLambda",
            "varOmega",
            "varPhi",
            "varPi",
            "varPsi",
            "varSigma",
            "varTheta",
            "varUpsilon",
            "varXi",
            "varepsilon",
            "varinjlim",
            "varkappa",
            "varliminf",
            "varlimsup",
            "varnothing",
            "varphi",
            "varpi",
            "varprojlim",
            "varpropto",
            "varrho",
            "varsigma",
            "varsubsetneq",
            "varsubsetneqq",
            "varsupsetneq",
            "varsupsetneqq",
            "vartheta",
            "vartriangle",
            "vartriangleleft",
            "vartriangleright",
            "vcentcolon",
            "vcenter",
            "vdash",
            "vdots",
            "vec",
            "vee",
            "veebar",
            "verb",
            "vert",
            "vphantom",
            "wedge",
            "weierp",
            "widecheck",
            "widehat",
            "widetilde",
            "wp",
            "wr",
            "xLeftarrow",
            "xLeftrightarrow",
            "xRightarrow",
            "xcancel",
            "xdef",
            "xhookleftarrow",
            "xhookrightarrow",
            "xi",
            "xleftarrow",
            "xleftharpoondown",
            "xleftharpoonup",
            "xleftrightarrow",
            "xleftrightharpoons",
            "xlongequal",
            "xmapsto",
            "xrightarrow",
            "xrightharpoondown",
            "xrightharpoonup",
            "xrightleftharpoons",
            "xtofrom",
            "xtwoheadleftarrow",
            "xtwoheadrightarrow",
            "yen",
            "zeta"
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
        if (!input || position === undefined) return '';

        const contextSize = 20;
        const start = Math.max(0, position - contextSize);
        const end = Math.min(input.length, position + contextSize);

        let context = input.slice(start, end);
        let pointer = '';

        const lines = context.split('\n');
        if (lines.length > 1) {
            const linePos = input.slice(0, position).split('\n').length - 1;
            context = lines[linePos] || '';
            pointer = `\n${' '.repeat(
                position - (input.lastIndexOf('\n', position) + 1)
            )}^`;
        } else {
            pointer = `\n${' '.repeat(position - start)}^`;
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
            `Component: ${this.props.componentName || 'Unknown'}`,
        ].join('\n\n');

        navigator.clipboard.writeText(textToCopy);
        BdApi.UI.showToast('Error copied to clipboard');
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
            'div',
            { className: 'lax-error-boundary', style: errorBoundaryStyle },
            React.createElement(
                'h3',
                { style: errorHeaderStyle },
                'LaTeX Rendering Error'
            ),
            React.createElement(
                'div',
                { style: errorMessageStyle },
                showRawError
                    ? error?.message || 'Unknown error'
                    : errorDetails || 'No details available'
            ),
            value &&
            error &&
            React.createElement(
                'pre',
                { style: errorSnippetStyle },
                this._getErrorContext(value, error.position || 0)
            ),
            React.createElement(
                'div',
                { style: buttonGroupStyle },
                React.createElement(
                    'button',
                    { onClick: this.handleReset, style: retryButtonStyle },
                    'Retry'
                ),
                React.createElement(
                    'button',
                    {
                        onClick: this.toggleRawError,
                        style: secondaryButtonStyle,
                    },
                    showRawError ? 'Show Help' : 'Show Raw Error'
                ),
                React.createElement(
                    'button',
                    {
                        onClick: this.copyErrorToClipboard,
                        style: secondaryButtonStyle,
                    },
                    'Copy Error'
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
                'div',
                { style: errorBoundaryStyle },
                'KaTeX is not available. LaTeX rendering will not work.'
            );
        }

        return this.state.hasError
            ? this.renderErrorDisplay()
            : this.props.children;
    }
}

/**
 * A linter for KaTeX input that checks syntax, compatibility, and style issues.
 *
 * @class Linter
 */

class Linter {
    /**
     * Creates an instance of Linter.
     */
    constructor() {
        /**
         * List of known/supported LaTeX commands by KaTeX.
         *
         * @type {Array<string>}
         */
        this.knownCommands = [
            "AA",
            "AE",
            "Alpha",
            "And",
            "Bbb",
            "Bbbk",
            "Beta",
            "Big",
            "Bigg",
            "Biggl",
            "Biggm",
            "Biggr",
            "Bigl",
            "Bigm",
            "Bigr",
            "Box",
            "Bra",
            "Braket",
            "Bumpeq",
            "C",
            "Cap",
            "Chi",
            "Colonapprox",
            "Coloneq",
            "Coloneqq",
            "Colonsim",
            "Complex",
            "Cup",
            "Dagger",
            "Darr",
            "Delta",
            "Diamond",
            "Doteq",
            "Downarrow",
            "Epsilon",
            "Eqcolon",
            "Eqqcolon",
            "Eta",
            "Finv",
            "Game",
            "Gamma",
            "H",
            "Harr",
            "Huge",
            "Im",
            "Iota",
            "Join",
            "KaTeX",
            "Kappa",
            "Ket",
            "LARGE",
            "LaTeX",
            "Lambda",
            "Large",
            "Larr",
            "Leftarrow",
            "Leftrightarrow",
            "Lleftarrow",
            "Longleftarrow",
            "Longleftrightarrow",
            "Longrightarrow",
            "Lrarr",
            "Lsh",
            "Mu",
            "N",
            "Nu",
            "O",
            "OE",
            "Omega",
            "Omicron",
            "Overrightarrow",
            "P",
            "Phi",
            "Pi",
            "Pr",
            "Psi",
            "R",
            "Rarr",
            "Re",
            "Reals",
            "Rho",
            "Rightarrow",
            "Rrightarrow",
            "Rsh",
            "S",
            "Set",
            "Sigma",
            "Subset",
            "Supset",
            "Tau",
            "TeX",
            "TextOrMath",
            "Theta",
            "Uarr",
            "Uparrow",
            "Updownarrow",
            "Upsilon",
            "VERT",
            "Vdash",
            "Vert",
            "Vvdash",
            "Xi",
            "Z",
            "Zeta",
            "aa",
            "above",
            "acute",
            "ae",
            "alef",
            "alefsym",
            "aleph",
            "allowbreak",
            "alpha",
            "amalg",
            "angl",
            "angle",
            "approx",
            "approxcolon",
            "approxcoloncolon",
            "approxeq",
            "arccos",
            "arcctg",
            "arcsin",
            "arctan",
            "arctg",
            "arg",
            "argmax",
            "argmin",
            "ast",
            "asymp",
            "atop",
            "backepsilon",
            "backprime",
            "backsim",
            "backsimeq",
            "backslash",
            "bar",
            "barwedge",
            "bcancel",
            "because",
            "begin",
            "beta",
            "beth",
            "between",
            "bf",
            "big",
            "bigcap",
            "bigcirc",
            "bigcup",
            "bigg",
            "biggl",
            "biggm",
            "biggr",
            "bigl",
            "bigm",
            "bigodot",
            "bigoplus",
            "bigotimes",
            "bigr",
            "bigsqcup",
            "bigstar",
            "bigtriangledown",
            "bigtriangleup",
            "biguplus",
            "bigvee",
            "bigwedge",
            "binom",
            "blacklozenge",
            "blacksquare",
            "blacktriangle",
            "blacktriangledown",
            "blacktriangleleft",
            "blacktriangleright",
            "bm",
            "bmod",
            "bold",
            "boldsymbol",
            "bot",
            "bowtie",
            "boxdot",
            "boxed",
            "boxminus",
            "boxplus",
            "boxtimes",
            "bra",
            "brace",
            "brack",
            "braket",
            "breve",
            "bullet",
            "bumpeq",
            "c",
            "cal",
            "cancel",
            "cap",
            "cdot",
            "cdotp",
            "cdots",
            "centerdot",
            "cfrac",
            "ch",
            "char",
            "check",
            "checkmark",
            "chi",
            "choose",
            "circ",
            "circeq",
            "circlearrowleft",
            "circlearrowright",
            "circledR",
            "circledS",
            "circledast",
            "circledcirc",
            "circleddash",
            "clap",
            "cline",
            "clubs",
            "clubsuit",
            "cnums",
            "colon",
            "colonapprox",
            "coloncolon",
            "coloncolonapprox",
            "coloncolonequals",
            "coloncolonminus",
            "coloncolonsim",
            "coloneq",
            "coloneqq",
            "colonequals",
            "colonminus",
            "colonsim",
            "color",
            "colorbox",
            "complement",
            "cong",
            "coprod",
            "copyright",
            "cos",
            "cosec",
            "cosh",
            "cot",
            "cotg",
            "coth",
            "cr",
            "csc",
            "ctg",
            "cth",
            "cup",
            "curlyeqprec",
            "curlyeqsucc",
            "curlyvee",
            "curlywedge",
            "curvearrowleft",
            "curvearrowright",
            "dArr",
            "dag",
            "dagger",
            "daleth",
            "darr",
            "dashleftarrow",
            "dashrightarrow",
            "dashv",
            "dbinom",
            "dblcolon",
            "ddag",
            "ddagger",
            "ddddot",
            "dddot",
            "ddot",
            "ddots",
            "def",
            "deg",
            "degree",
            "delta",
            "det",
            "dfrac",
            "diagdown",
            "diagup",
            "diamond",
            "diamonds",
            "diamondsuit",
            "digamma",
            "dim",
            "displaystyle",
            "div",
            "divideontimes",
            "dot",
            "doteq",
            "doteqdot",
            "dotplus",
            "dots",
            "dotsb",
            "dotsc",
            "dotsi",
            "dotsm",
            "dotso",
            "doublebarwedge",
            "doublecap",
            "doublecup",
            "downarrow",
            "downdownarrows",
            "downharpoonleft",
            "downharpoonright",
            "edef",
            "ell",
            "emph",
            "empty",
            "emptyset",
            "end",
            "enspace",
            "epsilon",
            "eqcirc",
            "eqcolon",
            "eqqcolon",
            "eqsim",
            "eqslantgtr",
            "eqslantless",
            "equalscolon",
            "equalscoloncolon",
            "equiv",
            "eta",
            "eth",
            "exist",
            "exists",
            "exp",
            "expandafter",
            "fallingdotseq",
            "fcolorbox",
            "flat",
            "foo",
            "footnotesize",
            "forall",
            "frac",
            "frak",
            "frown",
            "futurelet",
            "gamma",
            "gcd",
            "gdef",
            "ge",
            "genfrac",
            "geq",
            "geqq",
            "geqslant",
            "gets",
            "gg",
            "ggg",
            "gggtr",
            "gimel",
            "global",
            "gnapprox",
            "gneq",
            "gneqq",
            "gnsim",
            "grave",
            "gt",
            "gtrapprox",
            "gtrdot",
            "gtreqless",
            "gtreqqless",
            "gtrless",
            "gtrsim",
            "gvertneqq",
            "hArr",
            "harr",
            "hat",
            "hbar",
            "hbox",
            "hdashline",
            "hearts",
            "heartsuit",
            "hline",
            "hom",
            "hookleftarrow",
            "hookrightarrow",
            "hphantom",
            "href",
            "hskip",
            "hslash",
            "hspace",
            "html",
            "htmlClass",
            "htmlData",
            "htmlId",
            "htmlStyle",
            "huge",
            "i",
            "iff",
            "iiint",
            "iint",
            "image",
            "imageof",
            "imath",
            "impliedby",
            "implies",
            "in",
            "includegraphics",
            "inf",
            "infin",
            "infty",
            "injlim",
            "int",
            "intercal",
            "intop",
            "iota",
            "isin",
            "it",
            "j",
            "jmath",
            "kappa",
            "ker",
            "kern",
            "ket",
            "lArr",
            "lBrace",
            "lVert",
            "lambda",
            "land",
            "lang",
            "langle",
            "large",
            "larr",
            "lbrace",
            "lbrack",
            "lceil",
            "ldotp",
            "ldots",
            "le",
            "leadsto",
            "left",
            "leftarrow",
            "leftarrowtail",
            "leftharpoondown",
            "leftharpoonup",
            "leftleftarrows",
            "leftrightarrow",
            "leftrightarrows",
            "leftrightharpoons",
            "leftrightsquigarrow",
            "leftthreetimes",
            "leq",
            "leqq",
            "leqslant",
            "lessapprox",
            "lessdot",
            "lesseqgtr",
            "lesseqqgtr",
            "lessgtr",
            "lesssim",
            "let",
            "lfloor",
            "lg",
            "lgroup",
            "lhd",
            "lim",
            "liminf",
            "limits",
            "limsup",
            "ll",
            "llap",
            "llbracket",
            "llcorner",
            "lll",
            "llless",
            "lmoustache",
            "ln",
            "lnapprox",
            "lneq",
            "lneqq",
            "lnot",
            "lnsim",
            "log",
            "long",
            "longleftarrow",
            "longleftrightarrow",
            "longmapsto",
            "longrightarrow",
            "looparrowleft",
            "looparrowright",
            "lor",
            "lozenge",
            "lparen",
            "lq",
            "lrArr",
            "lrarr",
            "lrcorner",
            "lt",
            "ltimes",
            "lvert",
            "lvertneqq",
            "makeatletter",
            "maltese",
            "mapsto",
            "mathbb",
            "mathbf",
            "mathbin",
            "mathcal",
            "mathchoice",
            "mathclap",
            "mathclose",
            "mathellipsis",
            "mathfrak",
            "mathinner",
            "mathit",
            "mathllap",
            "mathnormal",
            "mathop",
            "mathopen",
            "mathord",
            "mathpunct",
            "mathrel",
            "mathring",
            "mathrlap",
            "mathrm",
            "mathscr",
            "mathsf",
            "mathsfit",
            "mathsterling",
            "mathstrut",
            "mathtt",
            "max",
            "measuredangle",
            "medspace",
            "mho",
            "mid",
            "middle",
            "min",
            "minuscolon",
            "minuscoloncolon",
            "minuso",
            "mkern",
            "mod",
            "models",
            "mp",
            "mskip",
            "mu",
            "multicolumn",
            "multimap",
            "nLeftarrow",
            "nLeftrightarrow",
            "nRightarrow",
            "nVDash",
            "nVdash",
            "nabla",
            "natnums",
            "natural",
            "ncong",
            "ne",
            "nearrow",
            "neg",
            "negmedspace",
            "negthickspace",
            "negthinspace",
            "neq",
            "newcommand",
            "newline",
            "nexists",
            "ngeq",
            "ngeqq",
            "ngeqslant",
            "ngtr",
            "ni",
            "nleftarrow",
            "nleftrightarrow",
            "nleq",
            "nleqq",
            "nleqslant",
            "nless",
            "nmid",
            "nobreak",
            "nobreakspace",
            "noexpand",
            "nonumber",
            "normalsize",
            "not",
            "notag",
            "notin",
            "notni",
            "nparallel",
            "nprec",
            "npreceq",
            "nrightarrow",
            "nshortmid",
            "nshortparallel",
            "nsim",
            "nsubseteq",
            "nsubseteqq",
            "nsucc",
            "nsucceq",
            "nsupseteq",
            "nsupseteqq",
            "ntriangleleft",
            "ntrianglelefteq",
            "ntriangleright",
            "ntrianglerighteq",
            "nu",
            "nvDash",
            "nvdash",
            "nwarrow",
            "o",
            "odot",
            "oe",
            "oiiint",
            "oiint",
            "oint",
            "omega",
            "omicron",
            "ominus",
            "operatorname",
            "operatornamewithlimits",
            "oplus",
            "origof",
            "oslash",
            "otimes",
            "over",
            "overbrace",
            "overgroup",
            "overleftarrow",
            "overleftharpoon",
            "overleftrightarrow",
            "overline",
            "overlinesegment",
            "overrightarrow",
            "overrightharpoon",
            "overset",
            "owns",
            "par",
            "parallel",
            "partial",
            "perp",
            "phantom",
            "phase",
            "phi",
            "pi",
            "pitchfork",
            "plim",
            "plusmn",
            "pm",
            "pmb",
            "pmod",
            "pod",
            "pounds",
            "prec",
            "precapprox",
            "preccurlyeq",
            "preceq",
            "precnapprox",
            "precneqq",
            "precnsim",
            "precsim",
            "prime",
            "prod",
            "projlim",
            "propto",
            "providecommand",
            "psi",
            "qquad",
            "quad",
            "r",
            "rArr",
            "rVert",
            "raisebox",
            "rang",
            "rangle",
            "rarr",
            "ratio",
            "rbrace",
            "rbrack",
            "rceil",
            "real",
            "reals",
            "relax",
            "renewcommand",
            "restriction",
            "rfloor",
            "rgroup",
            "rhd",
            "rho",
            "right",
            "rightarrow",
            "rightarrowtail",
            "rightharpoondown",
            "rightharpoonup",
            "rightleftarrows",
            "rightleftharpoons",
            "rightrightarrows",
            "rightsquigarrow",
            "rightthreetimes",
            "risingdotseq",
            "rlap",
            "rm",
            "rmoustache",
            "rparen",
            "rq",
            "rrbracket",
            "rtimes",
            "rule",
            "rvert",
            "scriptscriptstyle",
            "scriptsize",
            "scriptstyle",
            "sdot",
            "searrow",
            "sec",
            "sect",
            "set",
            "setminus",
            "sf",
            "sh",
            "sharp",
            "shortmid",
            "shortparallel",
            "sigma",
            "sim",
            "simcolon",
            "simcoloncolon",
            "simeq",
            "sin",
            "sinh",
            "small",
            "smallfrown",
            "smallint",
            "smallsetminus",
            "smallsmile",
            "smash",
            "smile",
            "sout",
            "space",
            "spades",
            "spadesuit",
            "sphericalangle",
            "sqcap",
            "sqcup",
            "sqrt",
            "sqsubset",
            "sqsubseteq",
            "sqsupset",
            "sqsupseteq",
            "square",
            "ss",
            "stackrel",
            "star",
            "sub",
            "sube",
            "subset",
            "subseteq",
            "subseteqq",
            "subsetneq",
            "subsetneqq",
            "substack",
            "succ",
            "succapprox",
            "succcurlyeq",
            "succeq",
            "succnapprox",
            "succneqq",
            "succnsim",
            "succsim",
            "sum",
            "sup",
            "supe",
            "supset",
            "supseteq",
            "supseteqq",
            "supsetneq",
            "supsetneqq",
            "surd",
            "swarrow",
            "tag",
            "tan",
            "tanh",
            "tau",
            "tbinom",
            "text",
            "textXX",
            "textasciicircum",
            "textasciitilde",
            "textbackslash",
            "textbar",
            "textbardbl",
            "textbf",
            "textbraceleft",
            "textbraceright",
            "textcircled",
            "textcolor",
            "textdagger",
            "textdaggerdbl",
            "textdegree",
            "textdollar",
            "textellipsis",
            "textemdash",
            "textendash",
            "textgreater",
            "textit",
            "textless",
            "textmd",
            "textnormal",
            "textquotedblleft",
            "textquotedblright",
            "textquoteleft",
            "textquoteright",
            "textregistered",
            "textrm",
            "textsf",
            "textsterling",
            "textstyle",
            "texttt",
            "textunderscore",
            "textup",
            "tfrac",
            "tg",
            "th",
            "therefore",
            "theta",
            "thetasym",
            "thickapprox",
            "thicksim",
            "thickspace",
            "thinspace",
            "tilde",
            "times",
            "tiny",
            "to",
            "top",
            "triangle",
            "triangledown",
            "triangleleft",
            "trianglelefteq",
            "triangleq",
            "triangleright",
            "trianglerighteq",
            "tt",
            "twoheadleftarrow",
            "twoheadrightarrow",
            "u",
            "uArr",
            "uarr",
            "ulcorner",
            "underbar",
            "underbrace",
            "undergroup",
            "underleftarrow",
            "underleftrightarrow",
            "underline",
            "underlinesegment",
            "underrightarrow",
            "underset",
            "unlhd",
            "unrhd",
            "uparrow",
            "updownarrow",
            "upharpoonleft",
            "upharpoonright",
            "uplus",
            "upsilon",
            "upuparrows",
            "urcorner",
            "url",
            "utilde",
            "v",
            "vDash",
            "varDelta",
            "varGamma",
            "varLambda",
            "varOmega",
            "varPhi",
            "varPi",
            "varPsi",
            "varSigma",
            "varTheta",
            "varUpsilon",
            "varXi",
            "varepsilon",
            "varinjlim",
            "varkappa",
            "varliminf",
            "varlimsup",
            "varnothing",
            "varphi",
            "varpi",
            "varprojlim",
            "varpropto",
            "varrho",
            "varsigma",
            "varsubsetneq",
            "varsubsetneqq",
            "varsupsetneq",
            "varsupsetneqq",
            "vartheta",
            "vartriangle",
            "vartriangleleft",
            "vartriangleright",
            "vcentcolon",
            "vcenter",
            "vdash",
            "vdots",
            "vec",
            "vee",
            "veebar",
            "verb",
            "vert",
            "vphantom",
            "wedge",
            "weierp",
            "widecheck",
            "widehat",
            "widetilde",
            "wp",
            "wr",
            "xLeftarrow",
            "xLeftrightarrow",
            "xRightarrow",
            "xcancel",
            "xdef",
            "xhookleftarrow",
            "xhookrightarrow",
            "xi",
            "xleftarrow",
            "xleftharpoondown",
            "xleftharpoonup",
            "xleftrightarrow",
            "xleftrightharpoons",
            "xlongequal",
            "xmapsto",
            "xrightarrow",
            "xrightharpoondown",
            "xrightharpoonup",
            "xrightleftharpoons",
            "xtofrom",
            "xtwoheadleftarrow",
            "xtwoheadrightarrow",
            "yen",
            "zeta"
        ];
        /**
         * Mapping of command replacements or suggestions for unsupported features.
         *
         * @type {Object.<string, string>}
         */
        this.commandReplacements = {
            degree: '^\\circ',
            mathbb: '\\mathrm',
            mathcal: '\\mathscr is not supported; consider Unicode symbols',
            includegraphics: 'Images are not supported in KaTeX',
            section: 'Use plain text outside of equations',
            label: 'Labels are not supported in KaTeX',
            ref: 'References are not supported in KaTeX',
            alignat: 'Use align instead',
            equation: 'Supported',
            eqnarray: 'Use align instead',
            itemize: 'Not supported in KaTeX',
            enumerate: 'Not supported in KaTeX',
        };
    }

    /**
     * Checks if a command is known/supported
     * @param {string} command - The command to check (without leading backslash)
     * @returns {boolean} True if the command is known/supported
     */
    _isKnownCommand(command) {
        return this.knownCommands.includes(command);
    }

    /**
 * Finds similar supported commands for better error messages
 * @param {string} command - The unrecognized command
 * @returns {Array<string>} List of similar supported commands (with backslashes)
 */
    _findSimilarCommands(badCommand) {
        if (!badCommand) return [];

        const cleanCommand = badCommand.replace(/^[\\/]/, '').toLowerCase();

        // 1. Direct replacement mapping for common typos
        const directReplacements = {
            'degree': '^\\circ',
            'franc': 'frac',
            'franction': 'frac',
            'intergal': 'int',
            'intergral': 'int',
            'matix': 'matrix',
            'pmatix': 'pmatrix',
            'bmatix': 'bmatrix',
            'sqr': 'sqrt',
            'squart': 'sqrt',
            'squareroot': 'sqrt',
            'differential': 'd',
            'derivative': 'd',
            'partialderivative': 'partial',
            'infinity': 'infty',
            'lamda': 'lambda',
            'gamme': 'gamma',
            'delte': 'delta',
            'vect': 'vec',
            'overbar': 'overline',
            'hatt': 'hat',
            'til': 'tilde'
        };

        // Check direct replacements first
        if (directReplacements[cleanCommand]) {
            return [`\\${directReplacements[cleanCommand]}`];
        }

        // 2. Enhanced scoring system using only knownCommands
        const scoreCommand = (cmd) => {
            const lcCmd = cmd.toLowerCase();
            const cleanLen = cleanCommand.length;
            const cmdLen = cmd.length;

            // Exact match (case insensitive)
            if (lcCmd === cleanCommand) return 100;

            // Starts with
            if (lcCmd.startsWith(cleanCommand)) return 90 - (cmdLen - cleanLen);

            // Contains
            if (lcCmd.includes(cleanCommand)) return 80 - (cmdLen - cleanLen);

            // Common prefix length
            const prefixLen = [...cleanCommand].filter((c, i) => c === lcCmd[i]).length;
            const prefixScore = prefixLen * 3;

            // Length difference penalty
            const lengthPenalty = Math.abs(cleanLen - cmdLen) * 2;

            // Levenshtein distance
            const distance = this._levenshteinDistance(lcCmd, cleanCommand);

            return 70 - distance - lengthPenalty + prefixScore;
        };

        // 3. Generate suggestions
        const suggestions = this.knownCommands
            .map(cmd => ({
                cmd: `\\${cmd}`,
                score: scoreCommand(cmd)
            }))
            .filter(({ score }) => score > 50) // Only reasonably good matches
            .sort((a, b) => b.score - a.score)
            .map(({ cmd }) => cmd)
            .slice(0, 5); // Return top 5 suggestions

        // 4. Special case for fraction-like commands
        if (suggestions.length === 0 && /^f[r]?[a]?[c]?/.test(cleanCommand)) {
            return ['\\frac', '\\dfrac', '\\tfrac', '\\cfrac'];
        }

        return suggestions;
    }

    /**
     * Calculates Levenshtein distance between two strings
     * @private
     * @param {string} a - First string.
     * @param {string} b - Second string.
     * @returns {number} The minimum number of single-character edits required to convert one string into the other.
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
     * Lints KaTeX input for syntax, compatibility, and style issues.
     * @param {string} input - The raw KaTeX string.
     * @returns {Array<{type: 'error'|'warning'|'info', message: string, suggestion?: string}>}
     */
    lintKaTeX(input) {
        const issues = [];

        // Rule: Use of $$...$$ is discouraged in KaTeX
        if (input.includes('$$')) {
            issues.push({
                type: 'warning',
                message: "Avoid using '$$...$$'. Prefer '\\begin{equation}...\\end{equation}' or use single '$' for inline math.",
                suggestion: input.replace(/\$\$(.+?)\$\$/gs, '$$$$1$$$$')
            });
        }

        // Rule: Missing closing brace
        const openBraces = (input.match(/{/g) || []).length;
        const closeBraces = (input.match(/}/g) || []).length;
        if (openBraces !== closeBraces) {
            issues.push({
                type: 'error',
                message: 'Mismatched braces detected. Ensure all opening braces have a matching closing brace.'
            });
        }

        // Rule: Undefined command detection (basic)


        // Check for undefined commands
        const commandRegex = /\\([a-zA-Z]+)/g;
        let match;
        const foundCommands = new Set();

        while ((match = commandRegex.exec(input)) !== null) {
            const cmd = match[1];
            if (!foundCommands.has(cmd)) {
                foundCommands.add(cmd);

                if (!this._isKnownCommand(cmd)) {
                    const similar = this._findSimilarCommands(cmd);
                    issues.push({
                        type: 'error',
                        message: `Unsupported command: \\${cmd}`,
                        suggestion: similar.length > 0
                            ? `Did you mean: ${similar.join(', ')}`
                            : 'Check KaTeX documentation for supported commands'
                    });
                }
            }
        }
        // Rule: Environment validation
        const envRegex = /\\begin{([^}]+)}/g;
        while ((match = envRegex.exec(input)) !== null) {
            const env = match[1];
            const allowedEnvironments = ['align', 'aligned', 'matrix', 'pmatrix', 'cases'];
            if (!allowedEnvironments.includes(env)) {
                issues.push({
                    type: 'error',
                    message: `Unsupported environment: ${env}`,
                    suggestion: `Try using one of: ${allowedEnvironments.join(', ')}.`
                });
            }
        }

        // Rule: Unescaped $ signs
        const dollarRegex = /\$(?![a-zA-Z])/g;
        if (dollarRegex.test(input)) {
            issues.push({
                type: 'error',
                message: 'Unescaped $ detected. Use double-dollar or wrap in \\(...\\).'
            });
        }

        return issues;
    }

    /**
     * Gets replacement suggestions for unsupported commands
     * @param {string} command - The unsupported command
     * @returns {string} Suggested replacement
     */
    _suggestKaTeXAlternative(command) {
        // Remove leading backslash if present
        const cleanCmd = command.replace(/^\\/, '');

        // Check direct replacements first
        if (this.commandReplacements[cleanCmd]) {
            return this.commandReplacements[cleanCmd];
        }

        // Default fallback
        return 'Check KaTeX documentation for supported commands';
    }



}

/**
 * A modal-based KaTex editor with real-time KaTeX preview and error handling.
 * Supports syntax validation, resize-aware rendering, and debounced updates.
 * @extends React.Component
 */
class LaXModal extends React.Component {
    /**
     * Creates an instance of LaXModal.
     *
     * @param {Object} props - Component properties.
     * @param {string} [props.initialValue] - Initial value for the KaTeX input.
     * @param {Array<string>} [props.history=[]] - List of previously used equations.
     * @param {Function} [props.onUpdate] - Callback when the input changes.
     * @param {Function} [props.onUpdateHistory] - Callback when history changes.
     * @param {number} [props.debounceTime=50] - Time in ms to debounce rendering.
     */
    constructor(props) {
        super(props);
        /**
 * State object managing internal component state.
 *
 * @type {{
 *   texInput: string,
 *   error: Error|null,
 *   isLoading: boolean,
 *   katexAvailable: boolean,
 *   isHistoryCollapsed: boolean,
 *   localHistory: Array<string>,
 *   historySearchQuery: string,
 *   viewMode: 'saved'|'pinned',
 *   showViewModeMenu: boolean,
 *   isDragging: boolean,
 *   lintResults: Array<{type: string, message: string, suggestion?: string}>
 * }}
 */
        this.state = {
            /** @type {string} Current KaTeX input */
            texInput: props.initialValue || '',
            /** @type {Error|null} Rendering or validation error */
            error: null,
            /** @type {boolean} Rendering state */
            isLoading: false,
            katexAvailable: typeof katex !== 'undefined',
            isHistoryCollapsed: true,
            localHistory: props.history || [],
            historySearchQuery: '',
            viewMode: 'saved',
            showViewModeMenu: false,
            isDragging: false,
            lintResults: []
        };

        const defaultDebounce = 50;
        const minDebounce = 0;
        const maxDebounce = 500;

        let debounceTime =
            props.debounceTime !== undefined
                ? Math.max(
                    minDebounce,
                    Math.min(maxDebounce, props.debounceTime)
                )
                : defaultDebounce;

        this.debounceSettings = { time: debounceTime };

        this.katexContainerRef = React.createRef();
        this.renderKaTeX = this.debounce(
            this.renderKaTeX.bind(this),
            this.debounceSettings
        ).bind(this);
        this.toggleHistoryCollapse = this.toggleHistoryCollapse.bind(this);
        this.resizeObserver = null;
        this.renderDebounceTimer = null;
        this.linter = new Linter(); // Initialize the linter

    }

    /**
     * Updates lint results based on current KaTeX input.
     *
     * @param {string} input - Current KaTeX expression.
     */
    updateLintResults(input) {
        if (!input || !input.trim()) {
            this.setState({ lintResults: [] });
            return;
        }
        const results = this.linter.lintKaTeX(input);
        this.setState({ lintResults: results });
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
        this.setState({ value: '' });
    };

    /**
     * Handles clicks outside the view mode menu.
     *
     * @param {Event} e - Click event.
     */
    handleClickOutside = (e) => {
        if (
            this.state.showViewModeMenu &&
            !e.target.closest('.view-mode-menu-container')
        ) {
            this.setState({ showViewModeMenu: false });
        }
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
        document.addEventListener('click', this.handleClickOutside);
        this.loadHistoryFromDisk();
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
            this.renderDebounceTimer = null;
        }
        document.removeEventListener('click', this.handleClickOutside);
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
                console.warn('KaTeX container cleanup error:', e);
                throw e;
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
                 * - Waits for debounceSettings.time
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
                console.error('Error in componentDidUpdate:', error);
                this.setState({ error });
            }
        }
        if (prevProps.history !== this.props.history) {
            // Force update if history changed
            this.forceUpdate();
        }
        // Clean up timer when component unmounts (handled in componentWillUnmount)
    }

    /**
     * Validates current KaTeX input using strict KaTeX parsing.
     * Throws an error if parsing fails.
     */
    validateSyntax = () => {
        try {
            const testEl = document.createElement('div');
            katex.render(this.state.texInput, testEl, {
                throwOnError: true,
                displayMode: true,
                strict: "error",
                macros: {
                    '\\dv': '\\frac{d #1}{d #2}', // \dv{f}{x} → df/dx
                    '\\ddv': '\\frac{d^2 #1}{d #2^2}', // \ddv{f}{x} → d²f/dx²
                    '\\pdv': '\\frac{\\partial #1}{\\partial #2}', // \pdv{f}{x} → ∂f/∂x
                    '\\pddv': '\\frac{\\partial^2 #1}{\\partial #2^2}', // \pddv{f}{x} → ∂²f/∂x²
                    '\\mpdv':
                        '\\frac{\\partial^2 #1}{\\partial #2 \\partial #3}', // \mpdv{f}{x}{y} → ∂²f/∂x∂y
                    '\\norm': '\\left\\|#1\\right\\|', // \norm{v} → \left| v \right|
                    '\\qty': '\\left(#1\\right)',
                },
            });
            BdApi.UI.showToast('Valid KaTeX syntax', { type: 'success' });
            return true;
        } catch (error) {
            // Instead of handling here, let the error boundary catch it
            throw error;
        }
    };

    /**
     * Handles file drop events for .txt/.tex files.
     *
     * @param {File} file - Dropped file.
     */

    handleFileDrop(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result.trim();
            if (content) {
                this.setState({ texInput: content });
                this.props.onUpdate?.(content);
            }
        };
        reader.readAsText(file);
    }

    /**
     * Gets pinned equations from persistent storage.
     *
     * @returns {Array<{equation: string, timestamp: number}>}
     */

    getPinnedEquations() {
        return BdApi.Data.load('LaX', 'pinnedEquations') || [];
    }

    /**
     * Checks if an equation is already pinned.
     *
     * @param {string} equation - Equation to check.
     * @returns {boolean}
     */

    isPinned(equation) {
        const pinned = this.getPinnedEquations();
        return pinned.some((eq) => eq.equation === equation);
    }

    /**
     * Toggles collapse state of the history panel.
     */
    toggleHistoryCollapse() {
        this.setState((prevState) => ({
            isHistoryCollapsed: !prevState.isHistoryCollapsed,
        }));
    }

    /**
     * Toggles pinning of a specific equation.
     *
     * @param {number} index - Index in history list.
     * @param {Event} e - Click event.
     */

    togglePinEquation(index, e) {
        e.stopPropagation();
        const { localHistory } = this.state;
        const equation = localHistory[index];
        const pinned = this.getPinnedEquations();

        if (this.isPinned(equation)) {
            // Unpin
            const newPinned = pinned.filter((eq) => eq.equation !== equation);
            BdApi.Data.save('LaX', 'pinnedEquations', newPinned);
            BdApi.UI.showToast('Equation unpinned', { type: 'info' });
        } else {
            // Pin
            pinned.unshift({ equation, timestamp: Date.now() });
            BdApi.Data.save('LaX', 'pinnedEquations', pinned);
            BdApi.UI.showToast('Equation pinned', { type: 'success' });
        }

        this.forceUpdate();
    }

    /**
     * Switches between saved and pinned history views.
     */

    toggleViewMode() {
        this.setState((prevState) => ({
            viewMode: prevState.viewMode === 'saved' ? 'pinned' : 'saved',
        }));
    }

    /**
     * Toggles visibility of the view mode dropdown menu.
     *
     * @param {Event} e - Click event.
     */

    toggleViewModeMenu = (e) => {
        e.stopPropagation();
        this.setState((prev) => ({ showViewModeMenu: !prev.showViewModeMenu }));
    };

    /**
     * Loads history from disk into state.
     */

    loadHistoryFromDisk() {
        const history = BdApi.Data.load('LaX', 'equationHistory') || [];
        this.setState({ localHistory: history });
    }

    /**
     * Deletes a history item with animation.
     *
     * @param {number} index - Index of the item to delete.
     * @param {Event} e - Click event.
     */

    handleDeleteEquation(index, e) {
        e.stopPropagation();
        const newHistory = [...this.state.localHistory];
        const itemToDelete = document.querySelectorAll('.history-item')[index];

        // Apply animation by adding 'deleted' class
        if (itemToDelete) {
            itemToDelete.classList.add('deleted');
        }
        setTimeout(() => {
            newHistory.splice(index, 1);
            this.props.onUpdateHistory?.(newHistory);
            this.setState({ localHistory: newHistory });
            BdApi.UI.showToast(`${index + 1}. Equation has been cleared`, {
                type: 'success',
            });
        }, 300);
    }

    /**
     * Removes an equation from the pinned list with animation.
     *
     * @param {number} index - Index of the item to unpin.
     * @param {Event} e - Click event.
     */

    handleDeleteEquationFromPinned(index, e) {
        e.stopPropagation();
        const pinned = this.getPinnedEquations();
        const itemToDelete = document.querySelectorAll('.history-item')[index];

        // Apply animation by adding 'deleted' class
        if (itemToDelete) {
            itemToDelete.classList.add('deleted');
        }
        setTimeout(() => {
            pinned.splice(index, 1);
            BdApi.Data.save('LaX', 'pinnedEquations', pinned);
            this.forceUpdate();
            BdApi.UI.showToast('Equation removed from pinned', {
                type: 'info',
            });
        }, 300);
    }

    /**
     * Clears all history items with animation.
     */

    handleClearAllHistory() {
        const historyItems = document.querySelectorAll('.history-item');

        // Apply animation to all history items
        historyItems.forEach((item) => {
            item.classList.add('deleted');
        });
        setTimeout(() => {
            BdApi.Data.delete('LaX', 'equationHistory');
            // Reload history from disk
            this.loadHistoryFromDisk();
            BdApi.UI.showToast('History cleared', { type: 'success' });
            // Notify parent
            if (this.props.onUpdateHistory) {
                this.props.onUpdateHistory([]);
            }
        }, 300);
    }

    /**
     * Unpins all equations with animation.
     */

    clearAllPinnedEquations() {
        const pinnedHistoryItems = document.querySelectorAll('.history-item');

        // Apply animation to all history items
        pinnedHistoryItems.forEach((item) => {
            item.classList.add('deleted');
        });

        setTimeout(() => {
            BdApi.Data.delete('LaX', 'pinnedEquations');
            this.forceUpdate();
            BdApi.UI.showToast('Unpinned all equations', { type: 'info' });
        }, 300);
    }

    /**
     * Filters history based on search query.
     *
     * @returns {Array<string>}
     */

    getFilteredHistory() {
        const { historySearchQuery, localHistory } = this.state;
        if (!historySearchQuery.trim()) return localHistory;

        const query = historySearchQuery.toLowerCase();
        return localHistory.filter((eq) => eq.toLowerCase().includes(query));
    }

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
                container.innerHTML = '';
            }
        } catch (e) {
            console.warn('Cleanup error:', e);
        }

        if (this.state.texInput.trim()) {
            try {
                const katexWrapper = document.createElement('div');
                katexWrapper.classList.add('katex');
                container.style.setProperty('font-size', `20px`);
                katex.render(this.state.texInput, katexWrapper, {
                    throwOnError: false,
                    displayMode: true,
                    leqno: true,
                    colorIsTextColor: true,
                    trust: false,
                    output: 'htmlAndMathml',
                    macros: {
                        '\\dv': '\\frac{d #1}{d #2}', // \dv{f}{x} → df/dx
                        '\\ddv': '\\frac{d^2 #1}{d #2^2}', // \ddv{f}{x} → d²f/dx²
                        '\\pdv': '\\frac{\\partial #1}{\\partial #2}', // \pdv{f}{x} → ∂f/∂x
                        '\\pddv': '\\frac{\\partial^2 #1}{\\partial #2^2}', // \pddv{f}{x} → ∂²f/∂x²
                        '\\mpdv': '\\frac{\\partial^2 #1}{\\partial #2 \\partial #3}', // \mpdv{f}{x}{y} → ∂²f/∂x∂y
                        '\\norm': '\\left\\|#1\\right\\|', // \norm{v} → \left| v \right|
                        '\\qty': '\\left(#1\\right)',
                    },
                });

                container.innerHTML = katexWrapper.innerHTML;
            } catch (error) {
                console.error('KaTeX render error:', error);
                this.setState({
                    error: new Error(`KaTeX syntax error: ${error.message}`),
                    errorDetails: this._getErrorContext(this.state.texInput, error.position)
                });
                container.innerHTML =
                    '<div style="color: red">Failed to render KaTeX</div>';
            } finally {
                this.setState({ isLoading: false });
                const endTime = performance.now();
                console.log(
                    `KaTeX render took ${(endTime - startTime).toFixed(2)}ms`
                );
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
        const collapseToggleIcon = `
      <svg width="14px" height="14px" viewBox="-3 0 28 28" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#ffffff" stroke="#ffffff">
        <g id="SVGRepo_bgCarrier" stroke-width="0"/>
        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
        <g id="SVGRepo_iconCarrier">
          <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" transform="translate(-419.000000, -571.000000)">
            <g id="Icon-Set-Filled" transform="">
              <!-- This path is changed to white -->
              <path d="M440.415,583.554 L421.418,571.311 C420.291,570.704 419,570.767 419,572.946 L419,597.054 C420.385,599.36 421.418,598.689 L440.415,586.446 C441.197,585.647 441.197,584.353 440.415,583.554" 
                    fill="#ffffff" stroke="#ffffff">
              </path>
            </g>
          </g>
        </g>
      </svg>   
    `;
        const deleteIcon = `
      <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.99486 7.00636C6.60433 7.39689 6.60433 8.03005 6.99486 8.42058L10.58 12.0057L6.99486 15.5909C6.60433 15.9814 6.60433 16.6146 6.99486 17.0051C7.38538 17.3956 8.01855 17.3956 8.40907 17.0051L11.9942 13.4199L15.5794 17.0051C15.9699 17.3956 16.6031 17.3956 16.9936 17.0051C17.3841 16.6146 17.3841 15.9814 16.9936 15.5909L13.4084 12.0057L16.9936 8.42059C17.3841 8.03007 17.3841 7.3969 16.9936 7.00638C16.603 6.61585 15.9699 6.61585 15.5794 7.00638L11.9942 10.5915L8.40907 7.00636C8.01855 6.61584 7.38538 6.61584 6.99486 7.00636Z" 
              fill="#FFFFFF"/>
      </svg>
    `;
        const moreIcon = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="1.5" transform="rotate(90 12 12)"/>
        <circle cx="6" cy="12" r="1.5" transform="rotate(90 6 12)"/>
        <circle cx="18" cy="12" r="1.5" transform="rotate(90 18 12)"/>
      </svg>
    `;
        const pinIcon = `
      <svg width="16px" height="16px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M17.1218 1.87023C15.7573 0.505682 13.4779 0.76575 12.4558 2.40261L9.61062 6.95916C9.61033 6.95965 9.60913 6.96167 9.6038 6.96549C9.59728 6.97016 9.58336 6.97822 9.56001 6.9848C9.50899 6.99916 9.44234 6.99805 9.38281 6.97599C8.41173 6.61599 6.74483 6.22052 5.01389 6.87251C4.08132 7.22378 3.61596 8.03222 3.56525 8.85243C3.51687 9.63502 3.83293 10.4395 4.41425 11.0208L7.94975 14.5563L1.26973 21.2363C0.879206 21.6269 0.879206 22.26 1.26973 22.6506C1.66025 23.0411 2.29342 23.0411 2.68394 22.6506L9.36397 15.9705L12.8995 19.5061C13.4808 20.0874 14.2853 20.4035 15.0679 20.3551C15.8881 20.3044 16.6966 19.839 17.0478 18.9065C17.6998 17.1755 17.3043 15.5086 16.9444 14.5375C16.9223 14.478 16.9212 14.4114 16.9355 14.3603C16.9421 14.337 16.9502 14.3231 16.9549 14.3165C16.9587 14.3112 16.9606 14.31 16.9611 14.3098L21.5177 11.4645C23.1546 10.4424 23.4147 8.16307 22.0501 6.79853L17.1218 1.87023ZM14.1523 3.46191C14.493 2.91629 15.2528 2.8296 15.7076 3.28445L20.6359 8.21274C21.0907 8.66759 21.0041 9.42737 20.4584 9.76806L15.9019 12.6133C14.9572 13.2032 14.7469 14.3637 15.0691 15.2327C15.3549 16.0037 15.5829 17.1217 15.1762 18.2015C15.1484 18.2752 15.1175 18.3018 15.0985 18.3149C15.0743 18.3316 15.0266 18.3538 14.9445 18.3589C14.767 18.3699 14.5135 18.2916 14.3137 18.0919L5.82846 9.6066C5.62872 9.40686 5.55046 9.15333 5.56144 8.97583C5.56651 8.8937 5.58877 8.84605 5.60548 8.82181C5.61855 8.80285 5.64516 8.7719 5.71886 8.74414C6.79869 8.33741 7.91661 8.56545 8.68762 8.85128C9.55668 9.17345 10.7171 8.96318 11.3071 8.01845L14.1523 3.46191Z" fill="#FFFFFF"/>
      </svg>
      `;
        const pinnedIcon = `
      <svg width="16px" height="16px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ff0000" stroke-width="0.552"><g id="SVGRepo_bgCarrier" stroke-width="0">
        </g>
           <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M17.1218 1.87023C15.7573 0.505682 13.4779 0.76575 12.4558 2.40261L9.61062 6.95916C9.61033 6.95965 9.60913 6.96167 9.6038 6.96549C9.59728 6.97016 9.58336 6.97822 9.56001 6.9848C9.50899 6.99916 9.44234 6.99805 9.38281 6.97599C8.41173 6.61599 6.74483 6.22052 5.01389 6.87251C4.08132 7.22378 3.61596 8.03222 3.56525 8.85243C3.51687 9.63502 3.83293 10.4395 4.41425 11.0208L7.94975 14.5563L1.26973 21.2363C0.879206 21.6269 0.879206 22.26 1.26973 22.6506C1.66025 23.0411 2.29342 23.0411 2.68394 22.6506L9.36397 15.9705L12.8995 19.5061C13.4808 20.0874 14.2853 20.4035 15.0679 20.3551C15.8881 20.3044 16.6966 19.839 17.0478 18.9065C17.6998 17.1755 17.3043 15.5086 16.9444 14.5375C16.9223 14.478 16.9212 14.4114 16.9355 14.3603C16.9421 14.337 16.9502 14.3231 16.9549 14.3165C16.9587 14.3112 16.9606 14.31 16.9611 14.3098L21.5177 11.4645C23.1546 10.4424 23.4147 8.16307 22.0501 6.79853L17.1218 1.87023ZM14.1523 3.46191C14.493 2.91629 15.2528 2.8296 15.7076 3.28445L20.6359 8.21274C21.0907 8.66759 21.0041 9.42737 20.4584 9.76806L15.9019 12.6133C14.9572 13.2032 14.7469 14.3637 15.0691 15.2327C15.3549 16.0037 15.5829 17.1217 15.1762 18.2015C15.1484 18.2752 15.1175 18.3018 15.0985 18.3149C15.0743 18.3316 15.0266 18.3538 14.9445 18.3589C14.767 18.3699 14.5135 18.2916 14.3137 18.0919L5.82846 9.6066C5.62872 9.40686 5.55046 9.15333 5.56144 8.97583C5.56651 8.8937 5.58877 8.84605 5.60548 8.82181C5.61855 8.80285 5.64516 8.7719 5.71886 8.74414C6.79869 8.33741 7.91661 8.56545 8.68762 8.85128C9.55668 9.17345 10.7171 8.96318 11.3071 8.01845L14.1523 3.46191Z" fill="#0F0F0F">
           </path> 
        </g>
      </svg>
      `;

        const pinnedEquations = this.getPinnedEquations();
        const filteredHistory = this.getFilteredHistory();
        const persistentSettings = BdApi.Data.load('LaX', 'persistentSettings')
        return React.createElement(
            'div',
            { style: modalContainerStyle, className: 'lax-modal-container' },
            React.createElement(
                LaXErrorBoundary,
                {
                    value: this.state.texInput,
                    onError: (error) => this.setState({ error }),
                    onReset: () =>
                        this.setState(
                            { texInput: '', error: null, isLoading: false },
                            this.renderKaTeX
                        ),
                },
                // history panel
                React.createElement(
                    'div',
                    { style: historyContainerStyle },
                    React.createElement(
                        'div',
                        {
                            style: historyHeaderStyle,
                            onClick: this.toggleHistoryCollapse,
                        },
                        React.createElement('span', null, 'History'),
                        React.createElement('span', {
                            style: {
                                fontSize: '12px',
                                transition: 'transform 0.2s ease',
                                transform: this.state.isHistoryCollapsed
                                    ? 'rotate(-90deg)'
                                    : 'none',
                            },
                            dangerouslySetInnerHTML: {
                                __html: collapseToggleIcon,
                            },
                        })
                    ),
                    !this.state.isHistoryCollapsed &&
                    React.createElement(
                        'div',
                        {
                            style: {
                                position: 'relative',
                                marginLeft: 'auto',
                                marginRight: '4px',
                            },
                        },
                        React.createElement(
                            'button',
                            {
                                style: {
                                    marginLeft: 'auto',
                                    padding: '4px',
                                    backgroundColor: this.state
                                        .showViewModeMenu
                                        ? 'var(--background-modifier-selected)'
                                        : 'transparent',
                                    style: {
                                        position: 'relative',
                                        marginLeft: 'auto',
                                    },
                                    color: 'var(--text-default)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '4px',
                                    '&:hover': {
                                        backgroundColor:
                                            'var(--background-modifier-hover)',
                                    },
                                },
                                onClick: this.toggleViewModeMenu,
                            },
                            React.createElement('span', {
                                dangerouslySetInnerHTML: {
                                    __html: moreIcon,
                                },
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '16px',
                                    height: '16px',
                                },
                            })
                        ),
                        this.state.showViewModeMenu &&
                        React.createElement(
                            'div',
                            {
                                style: {
                                    position: 'absolute',
                                    right: 0,
                                    top: '100%',
                                    backgroundColor:
                                        'var(--background-base-lowest)',
                                    borderRadius: '4px',
                                    boxShadow: 'var(--elevation-high)',
                                    padding: '4px',
                                    width: '160px',
                                    zIndex: 1000,
                                },
                            },
                            React.createElement(
                                'div',
                                {
                                    style: {
                                        padding: '8px 12px',
                                        borderRadius: '2px',
                                        color: 'var(--text-default)',
                                        cursor: 'pointer',
                                        backgroundColor:
                                            this.state.viewMode ===
                                                'saved'
                                                ? 'var(--background-modifier-selected)'
                                                : 'transparent',
                                        '&:hover': {
                                            backgroundColor:
                                                'var(--background-modifier-hover)',
                                        },
                                    },
                                    onClick: (e) => {
                                        e.stopPropagation();
                                        this.setState({
                                            viewMode: 'saved',
                                            showViewModeMenu: false,
                                        });
                                    },
                                },
                                'Saved Equations'
                            ),
                            React.createElement(
                                'div',
                                {
                                    style: {
                                        padding: '8px 12px',
                                        borderRadius: '2px',
                                        cursor: 'pointer',
                                        color: 'var(--text-default)',
                                        backgroundColor:
                                            this.state.viewMode ===
                                                'pinned'
                                                ? 'var(--background-modifier-selected)'
                                                : 'transparent',
                                        '&:hover': {
                                            backgroundColor:
                                                'hsl(240 calc(1*4%) 60.784% /0.12156862745098039)',
                                        },
                                    },
                                    onClick: (e) => {
                                        e.stopPropagation();
                                        this.setState({
                                            viewMode: 'pinned',
                                            showViewModeMenu: false,
                                        });
                                    },
                                },
                                'Pinned Equations'
                            )
                        )
                    ),
                    React.createElement(
                        'div',
                        {
                            style: historyContentStyle(
                                this.state.isHistoryCollapsed
                            ),
                        },
                        React.createElement('input', {
                            type: 'text',
                            placeholder: 'Search history...',
                            value: this.state.historySearchQuery,
                            onChange: (e) =>
                                this.setState({
                                    historySearchQuery: e.target.value,
                                }),
                            style: {
                                width: '94%',
                                padding: '6px 10px',
                                borderRadius: '4px',
                                border: '1px solid hsl(240 calc(1*4%) 60.784% /0.12156862745098039)',
                                backgroundColor: 'var(--background-base-lower)',
                                color: 'var(--text-default)',
                                fontSize: '13px',
                                marginBottom: '8px',
                            },
                        }),
                        this.state.viewMode === 'saved'
                            ? filteredHistory.length > 0
                                ? [
                                    ...filteredHistory.map((eq, index) =>
                                        React.createElement(
                                            'div',
                                            {
                                                key: index,
                                                className: 'history-item',
                                                style: historyItemStyle,
                                                onClick: () => {
                                                    this.setState({
                                                        texInput: eq,
                                                    });
                                                    this.props.onUseHistory?.(
                                                        eq
                                                    );
                                                },
                                            },
                                            React.createElement(
                                                'span',
                                                {
                                                    style: {
                                                        color: 'var(--text-muted)',
                                                        fontSize: '12px',
                                                        minWidth: '20px',
                                                    },
                                                },
                                                `${index + 1}.`
                                            ),
                                            React.createElement(
                                                'span',
                                                {
                                                    style: {
                                                        flex: 1,
                                                        overflow: 'hidden',
                                                        textOverflow:
                                                            'ellipsis',
                                                    },
                                                },
                                                `$${eq.slice(0, 50)}${eq.length > 50 ? '...' : ''}$`
                                            ),
                                            React.createElement(
                                                'button',
                                                {
                                                    style: {
                                                        ...deleteButtonStyle,
                                                        backgroundColor:
                                                            this.isPinned(eq)
                                                                ? 'var(--brand-experiment)'
                                                                : 'transparent',
                                                    },
                                                    onClick: (e) =>
                                                        this.togglePinEquation(
                                                            index,
                                                            e
                                                        ),
                                                    title: this.isPinned(eq)
                                                        ? 'Unpin this equation'
                                                        : 'Pin this equation',
                                                },
                                                React.createElement('span', {
                                                    dangerouslySetInnerHTML: {
                                                        __html: this.isPinned(
                                                            eq
                                                        )
                                                            ? pinnedIcon
                                                            : pinIcon,
                                                    },
                                                })
                                            ),
                                            React.createElement(
                                                'button',
                                                {
                                                    style: deleteButtonStyle,
                                                    onClick: (e) =>
                                                        this.handleDeleteEquation(
                                                            index,
                                                            e
                                                        ),
                                                    title: 'Delete this equation',
                                                },
                                                React.createElement('span', {
                                                    dangerouslySetInnerHTML: {
                                                        __html: deleteIcon,
                                                    },
                                                })
                                            )
                                        )
                                    ),
                                    React.createElement(
                                        'button',
                                        {
                                            style: clearAllButtonStyle,
                                            onClick: () =>
                                                this.handleClearAllHistory(),
                                            title: 'Clear all history',
                                        },
                                        'Clear All History'
                                    ),
                                ]
                                : React.createElement(
                                    'div',
                                    {
                                        style: {
                                            padding: '16px',
                                            textAlign: 'center',
                                            color: 'var(--text-muted)',
                                            fontSize: '13px',
                                        },
                                    },
                                    'No history yet'
                                )
                            : pinnedEquations.length > 0
                                ? [
                                    ...pinnedEquations.map((eqObj, index) =>
                                        React.createElement(
                                            'div',
                                            {
                                                key: index,
                                                className: 'history-item',
                                                style: historyItemStyle,
                                                onClick: () => {
                                                    this.setState({
                                                        texInput:
                                                            eqObj.equation,
                                                    });
                                                    this.props.onUseHistory?.(
                                                        eqObj.equation
                                                    );
                                                },
                                            },
                                            React.createElement(
                                                'span',
                                                {
                                                    style: {
                                                        color: 'var(--text-muted)',
                                                        fontSize: '12px',
                                                        minWidth: '20px',
                                                    },
                                                },
                                                `${index + 1}.`
                                            ),
                                            React.createElement(
                                                'span',
                                                {
                                                    style: {
                                                        flex: 1,
                                                        overflow: 'hidden',
                                                        textOverflow:
                                                            'ellipsis',
                                                    },
                                                },
                                                `$${eqObj.equation.slice(0, 50)}${eqObj.equation.length > 50 ? '...' : ''}$`
                                            ),
                                            React.createElement(
                                                'button',
                                                {
                                                    style: {
                                                        ...deleteButtonStyle,
                                                        backgroundColor:
                                                            'var(--brand-experiment)',
                                                    },
                                                    onClick: (e) =>
                                                        this.togglePinEquation(
                                                            index,
                                                            e
                                                        ),
                                                    title: 'Unpin this equation',
                                                },
                                                React.createElement('span', {
                                                    dangerouslySetInnerHTML: {
                                                        __html: pinnedIcon,
                                                    },
                                                })
                                            ),
                                        )
                                    ),
                                    React.createElement(
                                        'button',
                                        {
                                            style: clearAllButtonStyle,
                                            onClick: () =>
                                                this.clearAllPinnedEquations(),
                                            title: 'Unpin all equations',
                                        },
                                        'Unpin All Equations'
                                    ),
                                ]
                                : React.createElement(
                                    'div',
                                    {
                                        style: {
                                            padding: '16px',
                                            textAlign: 'center',
                                            color: 'var(--text-muted)',
                                            fontSize: '13px',
                                        },
                                    },
                                    'No pinned equations yet'
                                )
                    )
                ),
                React.createElement(
                    "div",
                    {
                        onDrop: persistentSettings.DragAndDrop ? (e) => {
                            e.preventDefault();
                            const file = e.dataTransfer.files[0];
                            if (file && /\.(txt|tex)$/i.test(file.name)) {
                                this.handleFileDrop(file);
                                BdApi.UI.showToast(`Imported equation from "${file.name}"`, { type: "success" });
                                this.setState({ isDragging: false });
                            } else {
                                BdApi.UI.showToast("Only .txt and .tex files are supported.", { type: "error" });
                                this.setState({ isDragging: false });
                            }
                        } : undefined,
                        onDragOver: persistentSettings.DragAndDrop ? (e) => {
                            e.preventDefault();
                            this.setState({ isDragging: true });
                        } : undefined,
                        onDragLeave: persistentSettings.DragAndDrop ? () => {
                            this.setState({ isDragging: false });
                        } : undefined,
                        style: {
                            ...modalContainerStyle,
                        }
                    },
                    persistentSettings.DragAndDrop && this.state.isDragging &&
                    React.createElement(
                        "div",
                        {
                            style: {
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                fontSize: "16px",
                                fontWeight: "bold",
                                color: "var(--text-muted)",
                                pointerEvents: "none",
                                zIndex: 10,
                                backdropFilter: "blur(2px)",
                                backgroundColor: "rgba(0,0,0,0.4)"
                            }
                        },
                        "Drop your .txt or .tex file here"
                    ),
                    // Input Section
                    React.createElement(
                        'div',
                        null,
                        React.createElement(
                            'div',
                            { style: inputLabelStyle },
                            'KaTeX Input'
                        ),

                        React.createElement('textarea', {
                            value: this.state.texInput,
                            onChange: (e) => {
                                this.setState({
                                    texInput: e.target.value,
                                    error: null,
                                });
                                this.updateLintResults(e.target.value); // Update lint results on change
                                this.props.onUpdate?.(e.target.value);
                            },
                            style: textAreaStyle,
                            placeholder: 'E.g., E = mc^2',
                        })
                    ),
                    // Validate Button Row
                    React.createElement(
                        'button',
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
                        'Validate Syntax'
                    ),
                    // Preview Section
                    React.createElement(
                        LaXErrorBoundary,
                        {
                            key: 'preview-boundary',
                            value: this.state.texInput,
                            onError: (error) => this.setState({ error }),
                            onReset: this.renderKaTeX,
                        },
                        React.createElement(
                            'div',
                            { key: 'preview-section' },
                            React.createElement(
                                'div',
                                { style: previewLabelStyle },
                                'Preview'
                            ),
                            React.createElement('div', {
                                ref: this.katexContainerRef,
                                style: previewBoxStyle,
                            })
                        )
                    ),
                    // Error Display
                    this.state.error &&
                    React.createElement(
                        'div',
                        {
                            style: {
                                color: 'var(--text-danger)',
                                fontSize: '14px',
                                marginTop: '8px',
                                fontWeight: 'bold',
                            },
                        },
                        this.state.error.message
                    ),

                    this.state.isLoading &&
                    React.createElement(
                        'div',
                        {
                            style: {
                                textAlign: 'center',
                                padding: '8px',
                                color: 'var(--text-default)',
                            },
                        },
                        'Rendering equation...'
                    ),

                    this.state.lintResults.length > 0 &&
                    React.createElement(
                        'div',
                        { style: lintBoxStyle },
                        React.createElement('strong', null, 'Lint Results:'),
                        this.state.lintResults.map((issue, idx) =>
                            React.createElement(
                                'div',
                                {
                                    key: idx,
                                    style: {
                                        color: issue.type === 'error'
                                            ? 'var(--status-danger)'
                                            : issue.type === 'warning'
                                                ? 'var(--status-warning)'
                                                : 'var(--text-muted)',
                                        marginTop: '8px'
                                    }
                                },
                                `${issue.type.toUpperCase()}: ${issue.message}`,
                                issue.suggestion &&
                                React.createElement(
                                    'div',
                                    {
                                        style: {
                                            fontSize: '16px',
                                            marginTop: '4px',
                                            color: 'var(--text-muted)'
                                        }
                                    },
                                    'Suggestion: ',
                                    issue.suggestion
                                )
                            )
                        )
                    )
                )

            ));
    }
}

class Sanitizer {
    constructor() { }
    /**
     * Sanitizes KaTeX-generated HTML before rendering.
     * @param {string} html - KaTeX-generated HTML.
     * @returns {string} Sanitized HTML.
     */
    sanitizeKaTeXOutput(html) {
        if (html.includes('<svg') || html.includes('<math')) {
            return html
                .replace(/javascript:/gi, 'blocked:')
                .replace(/on\w+="[^"]*"/gi, '');
        }

        const div = document.createElement('div');
        div.innerHTML = html;

        const allowedAttributes = [
            'class',
            'style',
            'aria-hidden',
            'xmlns',
            'viewBox',
            'width',
            'height',
            'fill',
            'd',
        ];
        const allowedStyleProps = new Set([
            'color',
            'background-color',
            'font',
            'font-family',
            'font-size',
            'font-weight',
            'font-style',
            'text-align',
            'line-height',
            'vertical-align',
            'white-space',
            'margin',
            'padding',
            'border',
            'display',
            'position',
            'top',
            'left',
            'right',
            'bottom',
            'width',
            'height',
            'min-width',
            'min-height',
            'max-width',
            'max-height',
        ]);
        const isSafeStyleValue = (value) =>
            !/javascript:|expression\(|url\((["']?)javascript:/i.test(value);

        div.querySelectorAll('*').forEach((el) => {
            [...el.attributes].forEach((attr) => {
                const name = attr.name.toLowerCase();
                const value = attr.value;
                if (name.startsWith('on') || /javascript:/i.test(value)) {
                    el.removeAttribute(attr.name);
                    return;
                }
                if (name === 'style') {
                    const newStyle = [];
                    el.style.cssText.split(';').forEach((rule) => {
                        const [prop, val] = rule.split(':');
                        if (!prop || !val) return;
                        const key = prop.trim().toLowerCase();
                        const safeVal = val.trim();
                        if (
                            allowedStyleProps.has(key) &&
                            isSafeStyleValue(safeVal)
                        ) {
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

}

/**
 * @typedef {Object} ProcessOptions
 * @property {boolean} [edgeEnhance=false] - Enable edge enhancement
 * @property {'tophat'|'blackhat'|'gradient'|'erosion'|'dilation'} [edgeType='tophat'] - Edge enhancement type
 * @property {number} [edgeRadius=1] - Edge kernel radius
 * @property {boolean} [MathStroke=false] - Enable math stroke enhancement
 * @property {number} [strokeIntensity=1.0] - Intensity of math stroke enhancement
 * @property {boolean} [BilateralFilter=false] - Enable bilateral filtering
 * @property {boolean} [GlyphAlignmentCorrection=false] - Enable glyph alignment correction
 * @property {number} [GlyphThreshold=0.3] - Threshold for glyph alignment correction
 * @property {boolean} [subpixelHinting=true] - Enable syntax hinting
 * @property {boolean} [adaptiveContrast=false] - Enable adaptive contrast enhancement
 * @property {number} [contrastAmount=1.0] - Amount of contrast enhancement (0.5-2.0)
 * @property {boolean} [symbolRecognition=false] - Enable mathematical symbol recognition and enhancement
 * @property {boolean} [vectorFieldAA=false] - Enable vector field anti-aliasing
 * @property {number} [vfaaIntensity=0.7] - Vector field AA intensity
 */

class ImagePostProcessing {
    constructor() { }

    supersampleAntiAliasing(ctx, width, height, scaleFactor = 2) {
        // Create an offscreen canvas at higher resolution
        const ssCanvas = document.createElement('canvas');
        ssCanvas.width = width * scaleFactor;
        ssCanvas.height = height * scaleFactor;
        const ssCtx = ssCanvas.getContext('2d');

        // Scale up with smoothing
        ssCtx.imageSmoothingEnabled = true;
        ssCtx.imageSmoothingQuality = 'high';
        ssCtx.drawImage(ctx.canvas, 0, 0, ssCanvas.width, ssCanvas.height);

        // Downsample with high quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(ssCanvas, 0, 0, width, height);
    }

    edgePreservingAntiAliasing(ctx, width, height) {
        const original = ctx.getImageData(0, 0, width, height);
        const output = ctx.getImageData(0, 0, width, height);
        const data = original.data;
        const outData = output.data;

        // Edge detection kernel (Sobel operator)
        const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
        const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const i = (y * width + x) * 4;

                // Skip transparent pixels
                if (data[i + 3] < 10) continue;

                // Calculate luminance for edge detection
                let gx = 0, gy = 0;
                let centerLum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

                // Apply Sobel operator to luminance
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const ki = ((y + ky) * width + (x + kx)) * 4;
                        const weightX = sobelX[(ky + 1) * 3 + (kx + 1)];
                        const weightY = sobelY[(ky + 1) * 3 + (kx + 1)];
                        const lum = 0.299 * data[ki] + 0.587 * data[ki + 1] + 0.114 * data[ki + 2];

                        gx += lum * weightX;
                        gy += lum * weightY;
                    }
                }

                // Calculate gradient magnitude
                const edgeStrength = Math.min(1, Math.sqrt(gx * gx + gy * gy) / 1000);

                // Adaptive filtering based on edge strength
                if (edgeStrength > 0.1) {
                    // Edge area - sharpen while preserving color
                    const sharpenFactor = 0.3 * edgeStrength;
                    for (let c = 0; c < 3; c++) {
                        const center = data[i + c];
                        const avg = (
                            data[i + c - 4] + data[i + c + 4] +
                            data[i + c - width * 4] + data[i + c + width * 4]
                        ) / 4;
                        outData[i + c] = center + (center - avg) * sharpenFactor;
                    }
                } else {
                    // Smooth area - apply bilateral filter (edge-preserving blur)
                    const gaussian = [1, 2, 1, 2, 4, 2, 1, 2, 1];
                    let sumR = 0, sumG = 0, sumB = 0, sumA = 0, divisor = 0;

                    for (let ky = -1; ky <= 1; ky++) {
                        for (let kx = -1; kx <= 1; kx++) {
                            const ki = ((y + ky) * width + (x + kx)) * 4;
                            const weight = gaussian[(ky + 1) * 3 + (kx + 1)];
                            const neighborLum = 0.299 * data[ki] + 0.587 * data[ki + 1] + 0.114 * data[ki + 2];

                            // Add luminance similarity factor to preserve edges
                            const lumDiff = Math.abs(centerLum - neighborLum);
                            const similarity = Math.exp(-lumDiff * lumDiff / (2 * 25 * 25)); // 25 is sigma
                            const finalWeight = weight * similarity;

                            sumR += data[ki] * finalWeight;
                            sumG += data[ki + 1] * finalWeight;
                            sumB += data[ki + 2] * finalWeight;
                            sumA += data[ki + 3] * finalWeight;
                            divisor += finalWeight;
                        }
                    }

                    outData[i] = sumR / divisor;
                    outData[i + 1] = sumG / divisor;
                    outData[i + 2] = sumB / divisor;
                    outData[i + 3] = sumA / divisor;
                }
            }
        }

        ctx.putImageData(output, 0, 0);
    }

    contrastAdaptiveSharpen(ctx, width, height) {
        const original = ctx.getImageData(0, 0, width, height);
        const output = ctx.getImageData(0, 0, width, height);
        const data = original.data;
        const outData = output.data;

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const i = (y * width + x) * 4;

                if (data[i + 3] < 10) continue;

                // Calculate local contrast using luminance
                let minLum = Infinity, maxLum = -Infinity;
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const ki = ((y + ky) * width + (x + kx)) * 4;
                        const lum = 0.299 * data[ki] + 0.587 * data[ki + 1] + 0.114 * data[ki + 2];
                        minLum = Math.min(minLum, lum);
                        maxLum = Math.max(maxLum, lum);
                    }
                }

                const contrast = (maxLum - minLum) / 255;
                const sharpenAmount = 0.7 * (1 - contrast);

                if (sharpenAmount > 0.05) {
                    // Unsharp masking with color preservation
                    const blurKernel = [1, 2, 1, 2, 4, 2, 1, 2, 1];
                    let blurR = 0, blurG = 0, blurB = 0;
                    let divisor = 0;

                    for (let ky = -1; ky <= 1; ky++) {
                        for (let kx = -1; kx <= 1; kx++) {
                            const ki = ((y + ky) * width + (x + kx)) * 4;
                            const weight = blurKernel[(ky + 1) * 3 + (kx + 1)];
                            blurR += data[ki] * weight;
                            blurG += data[ki + 1] * weight;
                            blurB += data[ki + 2] * weight;
                            divisor += weight;
                        }
                    }

                    blurR /= divisor;
                    blurG /= divisor;
                    blurB /= divisor;

                    // Apply sharpening while preserving color ratios
                    const centerR = data[i], centerG = data[i + 1], centerB = data[i + 2];
                    const avgLum = 0.299 * blurR + 0.587 * blurG + 0.114 * blurB;
                    const centerLum = 0.299 * centerR + 0.587 * centerG + 0.114 * centerB;

                    if (avgLum > 0) {
                        const lumRatio = centerLum / avgLum;
                        outData[i] = Math.min(255, Math.max(0, centerR + (centerR - blurR * lumRatio) * sharpenAmount));
                        outData[i + 1] = Math.min(255, Math.max(0, centerG + (centerG - blurG * lumRatio) * sharpenAmount));
                        outData[i + 2] = Math.min(255, Math.max(0, centerB + (centerB - blurB * lumRatio) * sharpenAmount));
                    } else {
                        outData[i] = centerR;
                        outData[i + 1] = centerG;
                        outData[i + 2] = centerB;
                    }
                } else {
                    outData[i] = data[i];
                    outData[i + 1] = data[i + 1];
                    outData[i + 2] = data[i + 2];
                }

                outData[i + 3] = data[i + 3];
            }
        }

        ctx.putImageData(output, 0, 0);
    }

    enhanceTextRendering(ctx, width, height) {
        const original = ctx.getImageData(0, 0, width, height);
        const output = ctx.getImageData(0, 0, width, height);
        const data = original.data;
        const outData = output.data;

        // Sharpening kernel that enhances edges while preserving shape
        const textKernel = [
            0, -0.5, 0,
            -0.5, 3, -0.5,
            0, -0.5, 0
        ];

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const i = (y * width + x) * 4;
                if (data[i + 3] < 10) continue;

                let r = 0, g = 0, b = 0;
                let k = 0;
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const ki = ((y + ky) * width + (x + kx)) * 4;
                        const weight = textKernel[k++];
                        r += data[ki] * weight;
                        g += data[ki + 1] * weight;
                        b += data[ki + 2] * weight;
                    }
                }

                // Get original pixel values
                const origR = data[i];
                const origG = data[i + 1];
                const origB = data[i + 2];

                // Compute original and new luminance
                const origLum = 0.299 * origR + 0.587 * origG + 0.114 * origB;
                const newLum = 0.299 * r + 0.587 * g + 0.114 * b;

                if (origLum > 0 && newLum > 0) {
                    // Preserve original color ratio
                    const rRatio = origR / origLum;
                    const gRatio = origG / origLum;
                    const bRatio = origB / origLum;

                    // Apply new luminance while keeping color ratios
                    outData[i] = Math.min(255, Math.max(0, rRatio * newLum));
                    outData[i + 1] = Math.min(255, Math.max(0, gRatio * newLum));
                    outData[i + 2] = Math.min(255, Math.max(0, bRatio * newLum));
                } else {
                    // Fallback if luminance is zero
                    outData[i] = Math.min(255, Math.max(0, r));
                    outData[i + 1] = Math.min(255, Math.max(0, g));
                    outData[i + 2] = Math.min(255, Math.max(0, b));
                }

                outData[i + 3] = data[i + 3]; // Keep alpha
            }
        }

        ctx.putImageData(output, 0, 0);
    }

    bilateralFilter(ctx, width, height) {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        const output = ctx.createImageData(width, height);
        const outData = output.data;

        const sigmaS = 2.0;  // Spatial standard deviation
        const sigmaR = 50.0; // Range standard deviation

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let rSum = 0, gSum = 0, bSum = 0, wSum = 0;
                const i = (y * width + x) * 4;
                const centerR = data[i];
                const centerG = data[i + 1];
                const centerB = data[i + 2];

                for (let ky = -2; ky <= 2; ky++) {
                    for (let kx = -2; kx <= 2; kx++) {
                        const ny = y + ky;
                        const nx = x + kx;
                        if (ny < 0 || nx < 0 || ny >= height || nx >= width) continue;

                        const ni = (ny * width + nx) * 4;
                        const nr = data[ni];
                        const ng = data[ni + 1];
                        const nb = data[ni + 2];

                        const distSq = kx * kx + ky * ky;
                        const rangeSq = (nr - centerR) ** 2 + (ng - centerG) ** 2 + (nb - centerB) ** 2;

                        const spatialWeight = Math.exp(-distSq / (2 * sigmaS * sigmaS));
                        const rangeWeight = Math.exp(-rangeSq / (2 * sigmaR * sigmaR));
                        const weight = spatialWeight * rangeWeight;

                        rSum += nr * weight;
                        gSum += ng * weight;
                        bSum += nb * weight;
                        wSum += weight;
                    }
                }

                outData[i] = rSum / wSum;
                outData[i + 1] = gSum / wSum;
                outData[i + 2] = bSum / wSum;
                outData[i + 3] = data[i + 3];
            }
        }

        ctx.putImageData(output, 0, 0);
    }

    /**
     * Advanced morphological operations for edge enhancement
     */
    morphologicalEdgeEnhancement(ctx, width, height, type = 'tophat', radius = 1) {
        const original = ctx.getImageData(0, 0, width, height);
        const output = new ImageData(new Uint8ClampedArray(original.data), width, height);
        const data = original.data;
        const outData = output.data;

        // Create grayscale image
        const gray = new Uint8Array(width * height);
        for (let i = 0; i < data.length; i += 4) {
            gray[i / 4] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        }

        // Apply morphological operation
        const result = new Uint8Array(width * height);
        const kernelSize = 2 * radius + 1;

        for (let y = radius; y < height - radius; y++) {
            for (let x = radius; x < width - radius; x++) {
                const i = y * width + x;

                if (type === 'erosion') {
                    let minVal = 255;
                    for (let ky = -radius; ky <= radius; ky++) {
                        for (let kx = -radius; kx <= radius; kx++) {
                            minVal = Math.min(minVal, gray[i + ky * width + kx]);
                        }
                    }
                    result[i] = minVal;
                }
                else if (type === 'dilation') {
                    let maxVal = 0;
                    for (let ky = -radius; ky <= radius; ky++) {
                        for (let kx = -radius; kx <= radius; kx++) {
                            maxVal = Math.max(maxVal, gray[i + ky * width + kx]);
                        }
                    }
                    result[i] = maxVal;
                }
                else if (type === 'gradient') {
                    let minVal = 255, maxVal = 0;
                    for (let ky = -radius; ky <= radius; ky++) {
                        for (let kx = -radius; kx <= radius; kx++) {
                            const val = gray[i + ky * width + kx];
                            minVal = Math.min(minVal, val);
                            maxVal = Math.max(maxVal, val);
                        }
                    }
                    result[i] = maxVal - minVal;
                }
            }
        }

        // Combine with original image based on operation type
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = y * width + x;
                const ii = i * 4;

                if (type === 'tophat') {
                    // Top-hat transform (original - opening)
                    const diff = gray[i] - result[i];
                    outData[ii] = Math.min(255, data[ii] + diff);
                    outData[ii + 1] = Math.min(255, data[ii + 1] + diff);
                    outData[ii + 2] = Math.min(255, data[ii + 2] + diff);
                }
                else if (type === 'blackhat') {
                    // Black-hat transform (closing - original)
                    const diff = result[i] - gray[i];
                    outData[ii] = Math.min(255, data[ii] + diff);
                    outData[ii + 1] = Math.min(255, data[ii + 1] + diff);
                    outData[ii + 2] = Math.min(255, data[ii + 2] + diff);
                }
                else if (type === 'gradient') {
                    // Morphological gradient
                    const enh = result[i] * 0.5;
                    outData[ii] = Math.min(255, data[ii] + enh);
                    outData[ii + 1] = Math.min(255, data[ii + 1] + enh);
                    outData[ii + 2] = Math.min(255, data[ii + 2] + enh);
                }
                else {
                    // Direct application for erosion/dilation
                    const scale = result[i] / Math.max(1, gray[i]);
                    outData[ii] = Math.min(255, data[ii] * scale);
                    outData[ii + 1] = Math.min(255, data[ii + 1] * scale);
                    outData[ii + 2] = Math.min(255, data[ii + 2] * scale);
                }

                outData[ii + 3] = data[ii + 3];
            }
        }

        ctx.putImageData(output, 0, 0);
    }


    /**
    * Specialized stroke enhancement for mathematical symbols
    */
    mathStrokeEnhancement(ctx, width, height, intensity = 1.0) {
        const original = ctx.getImageData(0, 0, width, height);
        const output = ctx.getImageData(0, 0, width, height);
        const data = original.data;
        const outData = output.data;

        // First pass: detect thin strokes using morphological gradient
        const strokeMap = new Float32Array(width * height);
        const lum = new Float32Array(width * height);

        // Precompute luminance
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                lum[y * width + x] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            }
        }

        // Detect thin strokes
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const i = y * width + x;
                let minLum = Infinity, maxLum = -Infinity;

                // 3x3 neighborhood
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const ni = (y + ky) * width + (x + kx);
                        minLum = Math.min(minLum, lum[ni]);
                        maxLum = Math.max(maxLum, lum[ni]);
                    }
                }

                // Stroke strength is inverse of local contrast
                strokeMap[i] = 1 - (maxLum - minLum) / 255;
            }
        }

        // Apply stroke enhancement
        for (let y = 2; y < height - 2; y++) {
            for (let x = 2; x < width - 2; x++) {
                const i = (y * width + x) * 4;
                if (data[i + 3] < 10) continue;

                // Calculate stroke-aware sharpening
                const strokeWeight = strokeMap[y * width + x] * intensity;
                if (strokeWeight > 0.1) {
                    // Directional sharpening kernel
                    const kernel = [
                        [0, -0.25, 0],
                        [-0.25, 2, -0.25],
                        [0, -0.25, 0]
                    ];

                    let r = 0, g = 0, b = 0;
                    for (let ky = -1; ky <= 1; ky++) {
                        for (let kx = -1; kx <= 1; kx++) {
                            const ni = ((y + ky) * width + (x + kx)) * 4;
                            const weight = kernel[ky + 1][kx + 1] * strokeWeight;
                            r += data[ni] * weight;
                            g += data[ni + 1] * weight;
                            b += data[ni + 2] * weight;
                        }
                    }

                    outData[i] = Math.max(0, Math.min(255, r));
                    outData[i + 1] = Math.max(0, Math.min(255, g));
                    outData[i + 2] = Math.max(0, Math.min(255, b));
                } else {
                    outData[i] = data[i];
                    outData[i + 1] = data[i + 1];
                    outData[i + 2] = data[i + 2];
                }
                outData[i + 3] = data[i + 3];
            }
        }

        ctx.putImageData(output, 0, 0);
    }
    /**
     * Mathematical symbol recognition and enhancement
     * Detects common math symbols and applies specialized processing
     */
    mathematicalSymbolRecognition(ctx, width, height) {
        const original = ctx.getImageData(0, 0, width, height);
        const output = ctx.getImageData(0, 0, width, height);
        const data = original.data;
        const outData = output.data;

        // Create a binary map of significant edges
        const edgeMap = new Array(width * height).fill(0);
        const edgeThreshold = 50;

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const i = (y * width + x) * 4;
                if (data[i + 3] < 10) continue;

                // Sobel edge detection
                let gx = 0, gy = 0;
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const ni = ((y + ky) * width + (x + kx)) * 4;
                        const lum = 0.299 * data[ni] + 0.587 * data[ni + 1] + 0.114 * data[ni + 2];
                        gx += lum * (kx === 0 ? 0 : kx * (ky === 0 ? 2 : 1));
                        gy += lum * (ky === 0 ? 0 : ky * (kx === 0 ? 2 : 1));
                    }
                }

                const edgeStrength = Math.sqrt(gx * gx + gy * gy);
                if (edgeStrength > edgeThreshold) {
                    edgeMap[y * width + x] = 1;
                }
            }
        }

        // Detect and enhance specific symbols
        for (let y = 2; y < height - 2; y++) {
            for (let x = 2; x < width - 2; x++) {
                const i = (y * width + x) * 4;
                if (data[i + 3] < 10) continue;

                // Check for vertical lines (like in '+', '∫', '∑', etc.)
                let verticalScore = 0;
                for (let ky = -2; ky <= 2; ky++) {
                    verticalScore += edgeMap[(y + ky) * width + x];
                }

                // Check for horizontal lines
                let horizontalScore = 0;
                for (let kx = -2; kx <= 2; kx++) {
                    horizontalScore += edgeMap[y * width + (x + kx)];
                }

                // Check for diagonal lines (like in '/', '∂', etc.)
                let diagonal1Score = 0, diagonal2Score = 0;
                for (let k = -2; k <= 2; k++) {
                    diagonal1Score += edgeMap[(y + k) * width + (x + k)];
                    diagonal2Score += edgeMap[(y + k) * width + (x - k)];
                }

                // If we detect a line-like structure, enhance it
                if (verticalScore >= 3 || horizontalScore >= 3 ||
                    diagonal1Score >= 3 || diagonal2Score >= 3) {

                    // Apply directional sharpening based on line orientation
                    let kernel;
                    if (verticalScore >= horizontalScore &&
                        verticalScore >= diagonal1Score &&
                        verticalScore >= diagonal2Score) {
                        // Vertical line
                        kernel = [
                            [0, -0.5, 0],
                            [0, 2.0, 0],
                            [0, -0.5, 0]
                        ];
                    } else if (horizontalScore >= diagonal1Score &&
                        horizontalScore >= diagonal2Score) {
                        // Horizontal line
                        kernel = [
                            [0, 0, 0],
                            [-0.5, 2.0, -0.5],
                            [0, 0, 0]
                        ];
                    } else {
                        // Diagonal line
                        kernel = [
                            [-0.5, 0, 0],
                            [0, 2.0, 0],
                            [0, 0, -0.5]
                        ];
                    }

                    let r = 0, g = 0, b = 0;
                    for (let ky = -1; ky <= 1; ky++) {
                        for (let kx = -1; kx <= 1; kx++) {
                            const ni = ((y + ky) * width + (x + kx)) * 4;
                            const weight = kernel[ky + 1][kx + 1];
                            r += data[ni] * weight;
                            g += data[ni + 1] * weight;
                            b += data[ni + 2] * weight;
                        }
                    }

                    outData[i] = Math.max(0, Math.min(255, r));
                    outData[i + 1] = Math.max(0, Math.min(255, g));
                    outData[i + 2] = Math.max(0, Math.min(255, b));
                } else {
                    outData[i] = data[i];
                    outData[i + 1] = data[i + 1];
                    outData[i + 2] = data[i + 2];
                }
                outData[i + 3] = data[i + 3];
            }
        }

        ctx.putImageData(output, 0, 0);
    }

    /**
     * Mathematical symbol alignment correction
     */
    glyphAlignmentCorrection(ctx, width, height, threshold = 0.3) {
        const original = ctx.getImageData(0, 0, width, height);
        const output = ctx.getImageData(0, 0, width, height);
        const data = original.data;
        const outData = output.data;

        // First detect vertical stems
        const stemMap = new Array(width * height).fill(0);
        const stemWidth = 1; // For detecting 1px vertical stems

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const i = y * width + x;
                const ii = i * 4;

                if (data[ii + 3] < 10) continue;

                // Check if this is part of a vertical stem
                let isStem = true;
                for (let ky = -1; ky <= 1; ky++) {
                    const ni = ((y + ky) * width + x) * 4;
                    if (data[ni + 3] < 10) {
                        isStem = false;
                        break;
                    }
                }

                if (isStem) {
                    stemMap[i] = 1;
                }
            }
        }

        // Adjust horizontal positions
        for (let y = 0; y < height; y++) {
            for (let x = 1; x < width - 1; x++) {
                const i = y * width + x;
                const ii = i * 4;

                if (stemMap[i] && !stemMap[i - 1] && stemMap[i + 1]) {
                    // Found a left edge of a stem
                    const alpha = data[ii + 3] / 255;
                    if (alpha > threshold) {
                        // Snap to full pixel if partially aligned
                        outData[ii] = data[ii];
                        outData[ii + 1] = data[ii + 1];
                        outData[ii + 2] = data[ii + 2];
                        outData[ii + 3] = 255; // Make fully opaque
                    }
                }
            }
        }

        ctx.putImageData(output, 0, 0);
    }

    /**
     * Subpixel hinting for LCD displays (RGB striping)
     */
    subpixelHinting(ctx, width, height) {
        const original = ctx.getImageData(0, 0, width, height);
        const output = ctx.getImageData(0, 0, width, height);
        const data = original.data;
        const outData = output.data;

        // Subpixel kernels for RGB striping
        const kernelR = [0.1, 0.8, 0.1, 0, 0, 0];
        const kernelG = [0, 0.1, 0.8, 0.1, 0, 0];
        const kernelB = [0, 0, 0.1, 0.8, 0.1, 0];

        for (let y = 0; y < height; y++) {
            for (let x = 3; x < width - 3; x++) {
                const i = (y * width + x) * 4;
                if (data[i + 3] < 10) continue;

                let r = 0, g = 0, b = 0;
                for (let kx = -3; kx <= 2; kx++) {
                    const ni = (y * width + (x + kx)) * 4;
                    r += data[ni] * kernelR[kx + 3];
                    g += data[ni + 1] * kernelG[kx + 3];
                    b += data[ni + 2] * kernelB[kx + 3];
                }

                outData[i] = Math.max(0, Math.min(255, r));
                outData[i + 1] = Math.max(0, Math.min(255, g));
                outData[i + 2] = Math.max(0, Math.min(255, b));
                outData[i + 3] = data[i + 3];
            }
        }

        ctx.putImageData(output, 0, 0);
    }
    /**
     * Vector Field Anti-Aliasing (VFAA) for mathematical curves
     * Uses edge direction information to apply directionally-adaptive AA
     */
    vectorFieldAntiAliasing(ctx, width, height, intensity = 0.7) {
        const original = ctx.getImageData(0, 0, width, height);
        const output = ctx.getImageData(0, 0, width, height);
        const data = original.data;
        const outData = output.data;

        // First pass: compute edge directions
        const angleMap = new Float32Array(width * height);
        const gradientMap = new Float32Array(width * height);

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const i = y * width + x;
                const ii = i * 4;

                if (data[ii + 3] < 10) continue;

                // Sobel operator for gradient
                let gx = 0, gy = 0;
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const ni = ((y + ky) * width + (x + kx)) * 4;
                        const lum = 0.299 * data[ni] + 0.587 * data[ni + 1] + 0.114 * data[ni + 2];
                        gx += lum * (kx === 0 ? 0 : kx * (ky === 0 ? 2 : 1));
                        gy += lum * (ky === 0 ? 0 : ky * (kx === 0 ? 2 : 1));
                    }
                }

                const gradMag = Math.sqrt(gx * gx + gy * gy);
                gradientMap[i] = gradMag;

                if (gradMag > 10) {
                    angleMap[i] = Math.atan2(gy, gx); // Edge angle in radians
                } else {
                    angleMap[i] = -Math.PI; // Invalid angle
                }
            }
        }

        // Second pass: apply directionally-adaptive AA
        for (let y = 2; y < height - 2; y++) {
            for (let x = 2; x < width - 2; x++) {
                const i = y * width + x;
                const ii = i * 4;

                if (data[ii + 3] < 10 || angleMap[i] === -Math.PI) {
                    outData[ii] = data[ii];
                    outData[ii + 1] = data[ii + 1];
                    outData[ii + 2] = data[ii + 2];
                    outData[ii + 3] = data[ii + 3];
                    continue;
                }

                // Get edge direction
                const angle = angleMap[i];
                const cosAngle = Math.cos(angle);
                const sinAngle = Math.sin(angle);

                // Sample along the edge direction (not across it)
                let sumR = 0, sumG = 0, sumB = 0, sumA = 0;
                let count = 0;

                for (let t = -2; t <= 2; t += 0.5) {
                    const sx = x + t * cosAngle;
                    const sy = y + t * sinAngle;

                    if (sx < 0 || sy < 0 || sx >= width - 1 || sy >= height - 1) continue;

                    // Bilinear interpolation
                    const x1 = Math.floor(sx), y1 = Math.floor(sy);
                    const x2 = x1 + 1, y2 = y1 + 1;
                    const dx = sx - x1, dy = sy - y1;

                    const i11 = (y1 * width + x1) * 4;
                    const i12 = (y1 * width + x2) * 4;
                    const i21 = (y2 * width + x1) * 4;
                    const i22 = (y2 * width + x2) * 4;

                    const r = (1 - dx) * (1 - dy) * data[i11] +
                        dx * (1 - dy) * data[i12] +
                        (1 - dx) * dy * data[i21] +
                        dx * dy * data[i22];

                    const g = (1 - dx) * (1 - dy) * data[i11 + 1] +
                        dx * (1 - dy) * data[i12 + 1] +
                        (1 - dx) * dy * data[i21 + 1] +
                        dx * dy * data[i22 + 1];

                    const b = (1 - dx) * (1 - dy) * data[i11 + 2] +
                        dx * (1 - dy) * data[i12 + 2] +
                        (1 - dx) * dy * data[i21 + 2] +
                        dx * dy * data[i22 + 2];

                    const a = (1 - dx) * (1 - dy) * data[i11 + 3] +
                        dx * (1 - dy) * data[i12 + 3] +
                        (1 - dx) * dy * data[i21 + 3] +
                        dx * dy * data[i22 + 3];

                    sumR += r;
                    sumG += g;
                    sumB += b;
                    sumA += a;
                    count++;
                }

                if (count > 0) {
                    // Blend between original and smoothed based on intensity
                    outData[ii] = data[ii] * (1 - intensity) + (sumR / count) * intensity;
                    outData[ii + 1] = data[ii + 1] * (1 - intensity) + (sumG / count) * intensity;
                    outData[ii + 2] = data[ii + 2] * (1 - intensity) + (sumB / count) * intensity;
                    outData[ii + 3] = data[ii + 3] * (1 - intensity) + (sumA / count) * intensity;
                } else {
                    outData[ii] = data[ii];
                    outData[ii + 1] = data[ii + 1];
                    outData[ii + 2] = data[ii + 2];
                    outData[ii + 3] = data[ii + 3];
                }
            }
        }

        ctx.putImageData(output, 0, 0);
    }

    /**
    * Adaptive contrast enhancement specifically for mathematical symbols
    */
    adaptiveContrastEnhancement(ctx, width, height, amount = 1.0) {
        const original = ctx.getImageData(0, 0, width, height);
        const output = ctx.getImageData(0, 0, width, height);
        const data = original.data;
        const outData = output.data;

        // First create a luminance map
        const lum = new Float32Array(width * height);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                lum[y * width + x] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            }
        }

        // Calculate local contrast
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const i = (y * width + x) * 4;
                if (data[i + 3] < 10) continue;

                // Calculate local luminance statistics
                let minLum = Infinity, maxLum = -Infinity, sumLum = 0;
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const ni = (y + ky) * width + (x + kx);
                        minLum = Math.min(minLum, lum[ni]);
                        maxLum = Math.max(maxLum, lum[ni]);
                        sumLum += lum[ni];
                    }
                }

                const localContrast = maxLum - minLum;
                const avgLum = sumLum / 9;
                const centerLum = lum[y * width + x];

                // Adaptive contrast enhancement
                const contrastFactor = 1.0 + (amount * (localContrast / 255));
                const enhancedLum = avgLum + (centerLum - avgLum) * contrastFactor;

                // Preserve color ratios while applying luminance change
                const lumRatio = centerLum > 0 ? enhancedLum / centerLum : 1;
                outData[i] = Math.min(255, Math.max(0, data[i] * lumRatio));
                outData[i + 1] = Math.min(255, Math.max(0, data[i + 1] * lumRatio));
                outData[i + 2] = Math.min(255, Math.max(0, data[i + 2] * lumRatio));
                outData[i + 3] = data[i + 3];
            }
        }

        ctx.putImageData(output, 0, 0);
    }

    /**
     * Applies post-processing effects to an image context.
     *
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {number} width - Width of the image
     * @param {number} height - Height of the image
     * @param {number} [quality=1] - Supersampling quality factor
     * @param {ProcessOptions} [options={}] - Post-processing options
     */
    ProcessImage(ctx, width, height, quality = 1, options = {}) {
        ctx.save();

        // Store original settings
        const originalImageSmoothing = ctx.imageSmoothingEnabled;
        const originalImageSmoothingQuality = ctx.imageSmoothingQuality;

        try {
            // 1. Supersample first if needed
            if (quality > 1) {
                this.supersampleAntiAliasing(ctx, width, height, quality);
            }

            if (options.MathStroke) {
                this.mathStrokeEnhancement(ctx, width, height, options.strokeIntensity || 1.0)
            }
            if (options.symbolRecognition) {
                this.mathematicalSymbolRecognition(ctx, width, height);
            }
            // 5. Subpixel hinting for LCD displays
            if (options.subpixelHinting) {
                this.subpixelHinting(ctx, width, height);
            }

            // 2. Enhance text before AA (less aggressive for colored text)
            this.enhanceTextRendering(ctx, width, height);

            if (options.vectorFieldAA) {
                this.vectorFieldAntiAliasing(ctx, width, height, options.vfaaIntensity || 0.7);
            } else {
                this.edgePreservingAntiAliasing(ctx, width, height);
            }
            // 4. Optional sharpening (less aggressive)
            this.contrastAdaptiveSharpen(ctx, width, height);

            if (options.edgeEnhance) {
                this.morphologicalEdgeEnhancement(ctx, width, height,
                    options.edgeType || 'tophat',
                    options.edgeRadius || 1);
            }
            if (options.BilateralFilter) {
                this.bilateralFilter(ctx, width, height);
            }
            if (options.GlyphAlignmentCorrection) {
                this.glyphAlignmentCorrection(ctx, width, height, options.GlyphThreshold || 0.3)
            }
            if (options.adaptiveContrast) {
                this.adaptiveContrastEnhancement(ctx, width, height, options.contrastAmount || 1.0);
            }

        } finally {
            // Restore original settings
            ctx.imageSmoothingEnabled = originalImageSmoothing;
            ctx.imageSmoothingQuality = originalImageSmoothingQuality;
            ctx.restore();
        }
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
    // Get Discord's button classes using BetterDiscord's Webpack module finder
    const discordButtonClasses = BdApi.Webpack.getModule(
        (m) => m.button && m.grow && m.colorBrand
    );

    // Create the button element
    const LaXButton = document.createElement('button');
    LaXButton.classList.add(
        discordButtonClasses.button,
        discordButtonClasses.grow,
        'BD-LaX-plugin-button'
    );

    // Add accessibility attributes
    LaXButton.setAttribute('aria-label', 'Open LaTeX Equation Editor');
    LaXButton.setAttribute('role', 'button');

    // Hover effect with smooth transition
    LaXButton.style.transition = 'transform 0.2s ease, filter 0.2s ease';
    LaXButton.addEventListener('mouseenter', () => {
        LaXButton.style.transform = 'scale(1.1)';
        LaXButton.style.filter = 'brightness(1.2)';
    });
    LaXButton.addEventListener('mouseleave', () => {
        LaXButton.style.transform = 'scale(1)';
        LaXButton.style.filter = 'brightness(1)';
    });

    // Create inner div structure matching Discord's button layout
    const innerDiv = document.createElement('div');
    innerDiv.classList.add(discordButtonClasses.contents);

    const iconWrapper = document.createElement('div');
    iconWrapper.classList.add(discordButtonClasses.iconWrapper);

    const svgContainer = document.createElement('div');
    svgContainer.classList.add('icon-container');

    // Insert the SVG icon into the container
    svgContainer.innerHTML = texIconSVG.trim();
    const svg = svgContainer.firstElementChild;

    // Apply styles and classes to the SVG
    svg.classList.add(discordButtonClasses.icon, 'BD-LaX-plugin-button-icon');
    svg.setAttribute('width', '25');
    svg.setAttribute('height', '25');
    svg.setAttribute('viewBox', '0 0 512 512');

    // Set stroke or fill color to adapt to theme
    svg.style.fill = 'currentColor'; // This makes the icon respect Discord's text color

    // Assemble elements
    iconWrapper.appendChild(svg);
    innerDiv.appendChild(iconWrapper);
    LaXButton.appendChild(innerDiv);

    // Add click handler
    LaXButton.addEventListener('click', (e) => {
        onClick(e);
    });

    return LaXButton;
}

/**
 * A utility class for tracking memory usage and performance metrics in a browser environment.
 * Particularly useful for plugins or performance-sensitive applications to monitor memory consumption,
 * detect leaks, and analyze object retention.
 *
 * @class MemoryTracker
 */
class MemoryTracker {
    constructor(pluginName) {
        this.pluginName = pluginName;
        this.baselineMemory = 0;
        this.interval = null;
        this.snapshots = [];
        this.lastTimestamp = 0;
    }

    /**
     * Gets current timestamp with high precision using `performance.now()` if available.
     *
     * Falls back to `Date.now()` if high-resolution timing is not supported.
     *
     * @private
     * @returns {number} Milliseconds since navigation start or time origin
     */

    _getHighResTimestamp() {
        try {
            return performance.now();
        } catch (e) {
            return Date.now();
        }
    }

    /**
     * Estimates memory usage of an object in bytes.
     *
     * Handles various types including:
     * - Primitive values
     * - Arrays and objects
     * - DOM elements (with estimates)
     * - Blobs and files
     * - Circular references
     *
     * @private
     * @param {*} obj - Object to measure
     * @param {WeakSet} [seen] - Internal set to track circular references
     * @param {number} [depth=0] - Current recursion depth
     * @returns {number} Estimated size in bytes (-1 for errors)
     */
    _estimateObjectMemory(obj, seen = new WeakSet(), depth = 0) {
        // Safety checks
        if (depth > 10) return -1; // Prevent infinite recursion
        if (!obj) return 0;
        if (obj === null || obj === undefined) return 0;

        // Special cases
        if (obj instanceof Blob || obj instanceof File) {
            return obj.size || 0;
        }

        if (obj instanceof HTMLElement) {
            return 1000; // Rough estimate per DOM node
        }

        if (obj instanceof HTMLCanvasElement) {
            return (obj.width * obj.height * 4) || 0;
        }

        try {
            const type = typeof obj;

            // Primitive types
            if (type === 'boolean') return 4;
            if (type === 'number') return 8;
            if (type === 'string') return obj.length * 2;
            if (type === 'symbol') return 12;

            // Complex types
            if (typeof obj === 'object' || typeof obj === 'function') {
                if (seen.has(obj)) return 0;
                seen.add(obj);

                if (Array.isArray(obj)) {
                    return obj.reduce((sum, item) => sum + this._estimateObjectMemory(item, seen, depth + 1), 0);
                }
                else if (typeof obj === 'object') {
                    return Object.keys(obj).reduce((sum, key) => {
                        return sum + key.length * 2 +
                            this._estimateObjectMemory(obj[key], seen, depth + 1);
                    }, 0);
                }
            }
        } catch (e) {
            console.error('Memory estimation failed for:', obj, e);
            return -1;
        }
        return 0;
    }

    /**
     * Safely retrieves browser memory statistics with error handling.
     *
     * @private
     * @returns {{
     *   usedJSHeapSize: number,
     *   totalJSHeapSize: number,
     *   jsHeapSizeLimit: number
     * }|{
     *   error: string
     * }} Memory stats or error information
     */
    _getSafeMemoryInfo() {
        try {
            const mem = window.performance?.memory;
            if (!mem) return { error: "Memory API unavailable" };

            return {
                usedJSHeapSize: mem.usedJSHeapSize || 0,
                totalJSHeapSize: mem.totalJSHeapSize || 0,
                jsHeapSizeLimit: mem.jsHeapSizeLimit || 0
            };
        } catch (e) {
            return { error: "Memory API error", details: e.message };
        }
    }

    /**
     * Safely retrieves browser memory statistics with error handling.
     *
     * @private
     * @returns {{
     *   usedJSHeapSize: number,
     *   totalJSHeapSize: number,
     *   jsHeapSizeLimit: number
     * }|{
     *   error: string
     * }} Memory stats or error information
     */
    _formatBytes(bytes) {
        if (bytes < 1024) return `${bytes} bytes`;
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(2)}KB`;
        return `${(bytes / 1048576).toFixed(2)}MB`;
    }

    /**
     * Takes a memory snapshot with detailed metrics.
     *
     * @param {string} label - Label for this snapshot
     * @param {Object} [pluginData] - Optional data to include in analysis
     * @returns {Object} Snapshot object containing memory and timing metrics
     */
    takeSnapshot(label, pluginData = {}) {
        const now = this._getHighResTimestamp();
        const timeSinceLast = this.lastTimestamp ? (now - this.lastTimestamp) : 0;
        this.lastTimestamp = now;

        const memoryInfo = this._getSafeMemoryInfo();

        const snapshot = {
            label,
            timestamp: now,
            chromeMemory: memoryInfo,
            estimatedMemory: {},
            domElements: document.querySelectorAll(`[class*="${this.pluginName}"]`).length,
            timing: {},
            memory: {}
        };

        // Calculate memory delta if we have previous data
        if (this.snapshots.length > 0) {
            const lastMem = this.snapshots[this.snapshots.length - 1].chromeMemory;
            if (lastMem && !lastMem.error && memoryInfo && !memoryInfo.error) {
                snapshot.memoryDelta = memoryInfo.usedJSHeapSize - lastMem.usedJSHeapSize;
            }
        }

        // Split plugin data into timing and memory categories
        for (const [key, value] of Object.entries(pluginData)) {
            if (key.includes('Time') || key.includes('Duration')) {
                snapshot.timing[key] = value;
            } else {
                const memEstimate = this._estimateObjectMemory(value);
                snapshot.estimatedMemory[key] = memEstimate;
                snapshot.memory[key] = memEstimate;
            }
        }

        // Add time since last snapshot
        if (timeSinceLast > 0) {
            snapshot.timing.sinceLastSnapshot = timeSinceLast;
        }

        this.snapshots.push(snapshot);
        this._logSnapshot(snapshot);
        return snapshot;
    }

    /**
     * Logs snapshot data to console in a structured format.
     *
     * @private
     * @param {Object} snapshot - The memory snapshot to log
     */
    _logSnapshot(snapshot) {
        try {
            console.groupCollapsed(`[${this.pluginName}] ${snapshot.label}`);

            // Basic info
            console.log('Timestamp:', new Date().toISOString());

            // Memory info
            if (snapshot.chromeMemory.error) {
                console.warn('Memory API:', snapshot.chromeMemory.error);
            } else {
                const used = snapshot.chromeMemory.usedJSHeapSize / 1048576;
                const total = snapshot.chromeMemory.totalJSHeapSize / 1048576;
                console.log(`Memory: ${used.toFixed(2)}MB / ${total.toFixed(2)}MB`);

                if (snapshot.memoryDelta !== undefined) {
                    console.log(`Memory Delta: ${this._formatBytes(snapshot.memoryDelta)}`);
                }
            }

            // Timing Data
            if (Object.keys(snapshot.timing).length) {
                console.log('Timing:', Object.fromEntries(
                    Object.entries(snapshot.timing)
                        .map(([k, v]) => [k, `${v.toFixed(2)}ms`])
                ));
            }

            // Memory Estimates
            if (Object.keys(snapshot.memory).length) {
                console.log('Memory Estimates:',
                    Object.fromEntries(
                        Object.entries(snapshot.memory)
                            .map(([k, v]) => [k, this._formatBytes(v)])
                    )
                );
            }

            // DOM info
            console.log('DOM Elements:', snapshot.domElements);

            console.groupEnd();
        } catch (e) {
            console.error('Failed to log snapshot:', e);
            console.log('Raw snapshot:', snapshot);
        }
    }

    /**
     * Starts periodic memory monitoring.
     *
     * @param {number} [interval=30000] - Monitoring interval in milliseconds
     * @param {Object} [pluginData] - Optional data to include in snapshots
     * @returns {Object} Initial memory snapshot
     */
    startMonitoring(interval = 30000, pluginData = {}) {
        this.stopMonitoring();
        this.baselineMemory = this._getSafeMemoryInfo().usedJSHeapSize || 0;

        this.interval = setInterval(() => {
            this.takeSnapshot('Periodic Check', pluginData);
        }, interval);

        return this.takeSnapshot('Initial', pluginData);
    }

    /**
     * Stops monitoring
     */
    stopMonitoring() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}





/**
 * A BetterDiscord plugin for creating and sending mathematical equations using LaTeX syntax.
 * Converts LaTeX to images and attaches them directly to Discord messages.
 *
 */
class LaX {
    /**
     * Initializes plugin configuration, settings, and DOM elements.
     */
    constructor() {
        this.config = {
            info: {
                name: 'LaX',
                version: "1.0.0",
            },
        };
        this.texInput = this.texInput || '';
        this.svgDocument = this.svgDocument || null;
        this.LaXButton = this.LaXButton || null;
        this.observer = this.observer || null;
        this.persistentSettings = this.persistentSettings ||
            BdApi?.Data?.load(this.constructor.name, 'persistentSettings') || {};
        this.modalOpen = false
        this.isProcessingEquation = false
        this.history = this.getEquationHistory() || []; // Ensure array
        this.cachedElements = {
            webpackModules: null,
            domElements: {},
        };
        this.resources = {
            elements: new Set(),
            observers: new Set(),
            timeouts: new Set(),
        };
        this.memoryTracker = new MemoryTracker('LaX');
        this.handleKeyDownBound = this.handleKeyDown.bind(this);
    }

    /**
     * Clears cached DOM elements to prevent memory leaks.
     */
    clearCache() {
        this.memoryTracker.takeSnapshot('Pre-Cache-Clear', {
            cachedItems: Object.keys(this.cachedElements.domElements).length,
            webpackModules: !!this.cachedElements.webpackModules
        });
        Object.values(this.cachedElements.domElements).forEach((el) => {
            DOMHelper.safeRemoveNode(el);
        });
        this.cachedElements = {
            webpackModules: null,
            domElements: {},
        }
        this.memoryTracker.takeSnapshot('Post-Cache-Clear', {
            remainingCachedItems: Object.keys(this.cachedElements.domElements).length
        });
    }

    // Add this method to the LaX class
    setupKeyboardShortcuts() {
        // Remove existing listener first to prevent duplicates
        document.removeEventListener('keydown', this.handleKeyDownBound);
        // Add the new listener
        document.addEventListener('keydown', this.handleKeyDownBound);
    }

    // Add these helper methods to your LaX class:
    getCurrentTexInput() {
        // Try multiple sources for the current input
        return this.texInput ||
            (this.modalInstance?.state?.texInput) ||
            (BdApi.Data.load(this.constructor.name, 'lastLaXInput')) ||
            '';
    }

    isValidEquation(input) {
        return input &&
            typeof input === 'string' &&
            input.trim().length > 0 &&
            input.trim() !== '\\' &&  // Basic LaTeX validation
            !input.match(/^\s*$/);    // Not just whitespace
    }

    getPinnedEquations() {
        return BdApi.Data.load('LaX', 'pinnedEquations') || [];
    }

    isPinned(equation) {
        const pinned = this.getPinnedEquations();
        return pinned.some(item => item.equation === equation.trim());
    }

    // Add this method to handle key presses
    handleKeyDown(event) {
        // Check Ctrl+Enter to attach equation
        if (this.checkKeybind(event, this.persistentSettings.keybindAttach)) {
            if (this.isProcessingEquation) {
                BdApi.UI.showToast('Already processing an equation', { type: 'info' });
                return;
            }
            if (this.texInput && this.texInput.trim()) {
                event.preventDefault();
                // Prevent multiple executions while processing
                if (this.isProcessingEquation) return;
                this.isProcessingEquation = true;

                this.generateLaXImage()
                    .then(blob => this.attachImage(blob))
                    .catch(console.error)
                    .finally(() => {
                        this.isProcessingEquation = false;
                    });

            }
            return;
        }
        // Check Ctrl+Alt+S to save to pinned
        if (this.checkKeybind(event, this.persistentSettings.keybindPin)) {
            event.preventDefault();

            // Get the current input - try multiple sources
            const currentInput = this.getCurrentTexInput();

            if (!currentInput || !this.isValidEquation(currentInput)) {
                BdApi.UI.showToast('No valid equation to pin', { type: 'error' });
                return;
            }

            try {
                if (!this.isPinned(currentInput)) {
                    const pinned = this.getPinnedEquations();
                    pinned.unshift({
                        equation: currentInput,
                        timestamp: Date.now()
                    });
                    BdApi.Data.save('LaX', 'pinnedEquations', pinned);
                    BdApi.UI.showToast('Equation pinned', { type: 'success' });
                } else {
                    BdApi.UI.showToast('Equation already pinned', { type: 'info' });
                }
            } catch (error) {
                console.error('Pinning failed:', error);
                BdApi.UI.showToast('Failed to pin equation', { type: 'error' });
            }
            return;
        }
        // Check Ctrl+Alt+T to open modal
        if (this.checkKeybind(event, this.persistentSettings.keybindOpen)) {
            event.preventDefault();
            this.showLaXModal();
            return;
        }
    }

    checkKeybind(event, keybind) {
        const lowerKeybind = keybind.map(k => k.toLowerCase());

        // Modifier keys in event
        const modifiersPressed = new Set();
        if (event.ctrlKey) modifiersPressed.add('control');
        if (event.altKey) modifiersPressed.add('alt');
        if (event.shiftKey) modifiersPressed.add('shift');
        if (event.metaKey) modifiersPressed.add('meta');

        const modifiersPressedArray = [...modifiersPressed];

        // Normalize pressed key
        const pressedKey = event.key.toLowerCase();

        // Extract expected modifiers and main key from keybind
        const expectedModifiers = new Set();
        let expectedMainKey = null;

        for (const key of lowerKeybind) {
            if (['control', 'alt', 'shift', 'meta'].includes(key)) {
                expectedModifiers.add(key);
            } else {
                expectedMainKey = key;
            }
        }

        // console.log("Expected Modifiers:", [...expectedModifiers]);
        // console.log("Pressed Modifiers:", modifiersPressedArray);
        // console.log("Expected Key:", expectedMainKey);
        // console.log("Pressed Key:", pressedKey);

        // Ensure main key matches
        if (pressedKey !== expectedMainKey) {
            console.log("Key mismatch");
            return false;
        }

        // Check that all required modifiers are pressed
        for (const mod of expectedModifiers) {
            if (!modifiersPressedArray.includes(mod)) {
                console.log("Missing modifier:", mod);
                return false;
            }
        }

        // Ensure no extra modifiers are pressed beyond what was expected
        for (const mod of modifiersPressedArray) {
            if (![...expectedModifiers].includes(mod)) {
                console.log("Unexpected modifier:", mod);
                return false;
            }
        }

        console.log("✅ Keybind matched!");
        return true;
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
            (m) => m.textArea?.value?.includes?.('textArea__'),
            { searchExports: true }
        ) || {
            channelTextArea: { value: 'channelTextArea__74017' },
            textArea: { value: 'textArea__74017' },
            buttons: { value: 'buttons__74017' },
        };

        while (
            !document.querySelector(
                `.${TextareaClasses.channelTextArea.value} .${TextareaClasses.buttons.value}`
            )
        ) {
            await this.delay(500);
        }

        this.injectButton();
        this.attachments = BdApi.Webpack.getByKeys('addFiles');

        const LaXSettingsStyles = `
      .lax-settings-minimal { padding: 16px; background: var(--background-tertiary); border-radius: 8px; width: 300px; display: flex; flex-direction: column; gap: 16px; }
      .lax-minimal-title { color: var(--header-primary); margin: 0; text-align: center; font-size: 16px; font-weight: 600; }
      .lax-minimal-label { color: var(--text-muted); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
      .lax-minimal-color { width: 100%; height: 32px; border-radius: 4px; border: 1px solid hsl(240 calc(1*4%) 60.784% /0.12156862745098039); cursor: pointer; }
      .lax-minimal-color::-webkit-color-swatch { border: none; border-radius: 2px; }
      .lax-minimal-buttons { display: flex; gap: 8px; margin-top: 8px; }
      .lax-minimal-btn { flex: 1; padding: 8px; border-radius: 3px; cursor: pointer; font-weight: 500; transition: all 0.2s ease; }
      .lax-minimal-btn.apply { background: var(--brand-experiment); color: white; border: none; }
      .lax-minimal-btn.apply:hover { background: var(--brand-experiment-560); }
      .lax-minimal-btn.done { background: transparent; color: var(--interactive-normal); border: 1px solid var(--interactive-muted); }
      .lax-minimal-btn.done:hover { border-color: var(--interactive-normal); }
    `;
        const LaXButtonStyle = `
      .BD-LaX-plugin-button .icon-container { display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; }
      .BD-LaX-plugin-button svg { fill: currentColor !important; width: 25px; height: 25px; transition: fill 0.2s ease;}
      .BD-LaX-plugin-button:hover svg { fill: var(--interactive-hover) !important; }
    `;
        const deleteAnimationStyles = ` 
    .history-item { transition: transform 0.2s ease, opacity 0.3s ease; overflow: visible; }
    .history-item.deleted { transform: scale(0.8); opacity: 0; }
    `;
        BdApi.DOM.addStyle('LaX-settings-styles', LaXSettingsStyles);
        BdApi.DOM.addStyle('LaX-button-style', LaXButtonStyle);
        BdApi.DOM.addStyle('LaX-delete-animation', deleteAnimationStyles);

        const versionInfo =
            BdApi.Data.load(this.constructor.name, 'versionInfo') || {};
        if (
            this.hasVersionChanged(
                versionInfo.version,
                this.config?.info.version
            )
        ) {
            this.showChangeLogModal();
            BdApi.Data.save(this.constructor.name, 'versionInfo', {
                version: this.config?.info.version,
            });
        }

        const defaults = {
            textColor: "#ffffff",
            debounceTime: 50,
            fontSize: 45,
            NumberOfSavedEquations: 20,
            DragAndDrop: true,
            ImagePostProcessing: false,
            edgeEnhance: true,
            edgeType: "tophat",
            edgeRadius: 2.0,
            mathStroke: false,
            strokeIntensity: 1.0,
            bilateralFilter: false,
            glyphAlignmentCorrection: false,
            glyphThreshold: 0.3,
            subpixelHinting: false,
            adaptiveContrast: false,
            constractAmount: 1,
            vectorFieldAA: false,
            vfaaIntensity: 0.7,
            keybindOpen: ["Control", "Alt", "T"],
            keybindAttach: ["Control", "Enter"],
            keybindPin: ["Control", "Alt", "P"],
        };

        // Check each key individually
        Object.entries(defaults).forEach(([key, defaultValue]) => {
            if (!(key in this.persistentSettings)) {
                console.log(`Setting missing: ${key} - applying default`);
                this.persistentSettings[key] = defaultValue;
            }
        });
        BdApi.Data.save(this.constructor.name, "persistentSettings", this.persistentSettings);
        this.applyLaXFontColor();

        this.memoryTracker.takeSnapshot('Plugin Start', {
            settingsSize: Object.keys(this.persistentSettings).length,
            webpackModulesLoaded: !!this.cachedElements.webpackModules
        });

        this.memoryTracker.startMonitoring(30000, {
            history: this.history,
            cachedElements: this.cachedElements,
            settings: this.persistentSettings,
            currentInput: this.texInput
        });
        this.setupKeyboardShortcuts();
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

        // Clean up DOM elements
        this.componentWillUnmount();

        if (this.cachedElements) {
            // Clean up DOM elements
            Object.values(this.cachedElements.domElements).forEach(
                (element) => {
                    if (element?.parentNode) {
                        DOMHelper.safeRemoveNode(element);
                    }
                }
            );
            this.clearCache();
        }
        this.memoryTracker.takeSnapshot('Plugin Stop', {
            remainingDOM: document.querySelectorAll('.BD-LaX').length,
            finalHistorySize: this.history.length
        });
        this.memoryTracker.stopMonitoring();
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
            const ctx = this.canvas.getContext('2d');
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
        document.removeEventListener('keydown', this.handleKeyDownBound);

    }

    /**
     * Checks if plugin version has changed since last run.
     * @param {string} oldVer Previous version string.
     * @param {string} newVer Current version string.
     * @returns {boolean} True if version changed.
     */
    hasVersionChanged(oldVer, newVer) {
        if (!oldVer) return true;
        const oldParts = oldVer.split('.').map(Number);
        const newParts = newVer.split('.').map(Number);
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
            BdApi.Data.load(this.constructor.name, 'settings') || {};
        LAXSettings.FontColor = this.persistentSettings.textColor;
        BdApi.Data.save(this.constructor.name, 'settings', LAXSettings);
        BdApi.UI.showToast('LaX font color updated successfully!', {
            type: 'success',
        });
    }

    /**
     * Resets font color to previously saved value.
     */
    resetLaXFontColor() {
        const defaultColor = "#ffffff"
        this.persistentSettings.textColor = defaultColor;

        const settings =
            BdApi.Data.load(this.constructor.name, 'settings') || {};
        settings.FontColor = defaultColor;
        BdApi.Data.save(this.constructor.name, 'settings', settings);
        BdApi.Data.save(
            this.constructor.name,
            'persistentSettings',
            this.persistentSettings
        );

        BdApi.UI.showToast('Reset to default color!', { type: 'success' });
        return defaultColor; // Return the new color for UI updates
    }

    /**
     * Saves a new equation to the history list.
     * @param {string} equation - The LaTeX equation string.
     */
    saveEquationToHistory(equation) {

        if (!equation || !equation.trim()) return;

        let history =
            BdApi.Data.load(this.constructor.name, 'equationHistory') || [];
        // Remove duplicates
        history = history.filter((eq) => eq !== equation);
        // Add to front
        history.unshift(equation);
        if (history.length > this.persistentSettings.NumberOfSavedEquations)
            history.pop();
        const preSize = this.history.length;
        this.memoryTracker.takeSnapshot('Pre-History-Update', {
            historySize: preSize,
            newEquationLength: equation.length
        });
        BdApi.Data.save(this.constructor.name, 'equationHistory', history);
        this.memoryTracker.takeSnapshot('Post-History-Update', {
            newHistorySize: this.history.length,
            wasDuplicate: preSize === this.history.length
        });
    }

    /**
     * Gets the stored equation history.
     * @returns {Array<string>} List of saved equations.
     */
    getEquationHistory() {
        return BdApi.Data.load(this.constructor.name, 'equationHistory') || [];
    }
    /**
     * Creates and returns a settings panel component for configuring plugin settings.
     * The panel includes color settings for equations and action buttons (Save/Reset).
     *
     * @returns {React.Component} A React component that renders the settings panel and manages the DOM manipulation for adding action buttons to the modal footer.
     */

    getSettingsPanel() {
        let settingsPanelInstance = null;


        // Create settings configuration
        const settingsConfig = [
            {
                type: "category",
                id: "Main",
                name: "Main Settings",
                collapsible: true,
                shown: true,
                settings: [
                    {
                        type: 'color',
                        id: 'textColor',
                        name: 'Equation Color',
                        note: 'Choose the color in which rendered equations will appear on the screen.',
                        value: this.persistentSettings.textColor,
                    },
                    {
                        type: 'slider',
                        id: 'debounceTime',
                        name: 'Render Delay',
                        note: 'Set how long (in milliseconds) to wait after you finish typing before re-rendering the equation. A higher value reduces frequent updates, improving performance.',
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
                    {
                        type: 'slider',
                        id: 'fontSize',
                        name: 'Font Size',
                        note: 'Adjust the size of the rendered mathematical equations. Values range from 10 to 100 pixels.',
                        min: 10,
                        max: 100,
                        markers: [10, 30, 50, 70, 100], // Optional markers
                        default: 45, // Default value
                        value: this.persistentSettings.fontSize ?? 45,
                        onValueChange: (value) => {
                            this.persistentSettings.fontSize = value;
                        },
                    },
                    {
                        type: 'slider',
                        id: 'NumberOfSavedEquations',
                        name: 'Number of Saved Equations',
                        note: 'Determine how many equations should be saved in history. This allows you to revisit previous equations easily.',
                        min: 0,
                        max: 100,
                        markers: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100], // Optional markers
                        default: 20, // Default value
                        value: this.persistentSettings.NumberOfSavedEquations ?? 20,
                        onValueChange: (value) => {
                            this.persistentSettings.NumberOfSavedEquations = value;
                        },
                    },
                    {
                        type: "switch",
                        id: "DragAndDrop",
                        name: "Enable Drag-and-Drop Import",
                        note: 'Toggle to allow importing equations by dragging and dropping ".txt" or ".lex" files directly into the interface.',
                        value: this.persistentSettings.DragAndDrop ?? true,
                    },

                ]
            },
            {
                type: "category",
                id: "ImageProcessing",
                name: "Image Processing Settings",
                collapsible: true,
                shown: false,
                settings: [
                    {
                        type: "switch",
                        id: "ImagePostProcessing",
                        name: "Enable image processing",
                        value: this.persistentSettings.ImagePostProcessing,
                    },
                    {
                        type: "switch",
                        id: "edgeEnhance",
                        name: "Enable Edge Enhancement",
                        note: "Toggle edge enhancement for better recognition of strokes when processing images.",
                        value: this.persistentSettings.edgeEnhance ?? true,
                        disabled: !this.persistentSettings.ImagePostProcessing,
                    },
                    {
                        type: "dropdown",
                        id: "edgeType",
                        name: "Edge Enhancement Type",
                        note: "Select the type of edge enhancement algorithm to apply. Options include Top-Hat, Black-Hat, Gradient, Erosion, and Dilation.",
                        value: this.persistentSettings.edgeType ?? "tophat",
                        inline: false,
                        disabled: !this.persistentSettings.ImagePostProcessing,
                        options: [
                            { label: "Top-Hat", value: "tophat" },
                            { label: "Black-Hat", value: "blackhat" },
                            { label: "Gradient", value: "gradient" },
                            { label: "Erosion", value: "erosion" },
                            { label: "Dilation", value: "dilation" }
                        ]
                    },
                    {
                        type: "dropdown",
                        id: "edgeRadius",
                        name: "Edge Radius",
                        note: "Set the radius used for edge operations like erosion or dilation. Higher values affect larger regions around edges(2 is recommended).",
                        value: this.persistentSettings.edgeRadius ?? 2,
                        disabled: !this.persistentSettings.ImagePostProcessing,
                        options: [
                            { label: "1", value: 1 },
                            { label: "2", value: 2 },
                            { label: "3", value: 3 },
                        ]
                    },
                    {
                        type: "switch",
                        id: "mathStroke",
                        name: "Math Stroke",
                        note: "Enable special stroke detection tailored for recognizing mathematical symbols and expressions.",
                        value: this.persistentSettings.mathStroke ?? false,
                        disabled: !this.persistentSettings.ImagePostProcessing,
                    },
                    {
                        type: "dropdown",
                        id: "strokeIntensity",
                        name: "Stroke Intensity",
                        note: "Adjust the intensity of stroke enhancements. Useful for fine-tuning clarity of handwritten input(1.5 is recommended).",
                        value: this.persistentSettings.strokeIntensity ?? 1.5,
                        disabled: !this.persistentSettings.ImagePostProcessing,
                        options: [
                            { label: "0.5", value: 0.5 },
                            { label: "1", value: 1 },
                            { label: "1.5", value: 1.5 },
                            { label: "2", value: 2 },
                        ]
                    },
                    {
                        type: "switch",
                        id: "bilateralFilter",
                        name: "Bilateral Filter",
                        note: "Apply a bilateral filter to smooth images while preserving sharp edges. Improves visual quality during image-based recognition.",
                        value: this.persistentSettings.bilateralFilter ?? false,
                        disabled: !this.persistentSettings.ImagePostProcessing,
                    },
                    {
                        type: "switch",
                        id: "glyphAlignmentCorrection",
                        name: "Glyph Alignment Correction",
                        note: "Correct minor misalignments in glyphs (characters/symbols) for better rendering and recognition accuracy.",
                        value: this.persistentSettings.glyphAlignmentCorrection ?? false,
                        disabled: !this.persistentSettings.ImagePostProcessing,

                    },
                    {
                        type: "dropdown",
                        id: "glyphThreshold",
                        name: "Glyph Threshold",
                        note: "Adjust the threshold for glyph alignment correction. Lower values are more sensitive to small adjustments(0.3 is recommended).",
                        value: this.persistentSettings.glyphThreshold ?? 0.3,
                        disabled: !this.persistentSettings.ImagePostProcessing,
                        options: [
                            { label: "0.1", value: 0.1 },
                            { label: "0.2", value: 0.2 },
                            { label: "0.3", value: 0.3 },
                            { label: "0.4", value: 0.4 },
                            { label: "0.5", value: 0.5 },
                            { label: "0.6", value: 0.6 },

                        ]
                    },
                    {
                        type: "switch",
                        id: "subpixelHinting",
                        name: "Subpixel Hinting",
                        note: "Improve equation text sharpness on LCD screens by aligning glyphs with RGB subpixels. Disable for OLED/Retina displays to avoid color fringing",
                        value: this.persistentSettings.subpixelHinting ?? false,
                        disabled: !this.persistentSettings.ImagePostProcessing,

                    },
                    {
                        type: "switch",
                        id: "adaptiveContrast",
                        name: "Adaptive Contrast",
                        note: "Enhances contrast based on local content, especially effective for subscripts/superscripts.",
                        value: this.persistentSettings.adaptiveContrast ?? false,
                        disabled: !this.persistentSettings.ImagePostProcessing,
                    },
                    {
                        type: "dropdown",
                        id: "contrastAmount",
                        name: "Contrast Amount",
                        note: "Adjusts intensity of contrast enhancement (0.5-2.0).",
                        value: this.persistentSettings.contrastAmount ?? 1,
                        disabled: !this.persistentSettings.ImagePostProcessing,
                        options: [
                            { label: "0.5", value: 0.5 },
                            { label: "1.0", value: 1.0 },
                            { label: "1.5", value: 1.5 },
                            { label: "2", value: 2 },

                        ]
                    },
                    {
                        type: "switch",
                        id: "vectorFieldAA",
                        name: "Vector Field Anti-Aliasing",
                        note: "Advanced anti-aliasing that follows mathematical symbol edges for smoother curves and diagonals.",
                        value: this.persistentSettings.vectorFieldAA ?? false,
                        disabled: !this.persistentSettings.ImagePostProcessing,
                    },
                    {
                        type: "dropdown",
                        id: "vfaaIntensity",
                        name: "VFAA Intensity",
                        note: "Controls strength of vector-based anti-aliasing (lower = sharper, higher = smoother).",
                        value: this.persistentSettings.vfaaIntensity ?? 0.7, // Default = 0.7
                        disabled: !this.persistentSettings.ImagePostProcessing,
                        options: [
                            { label: "Minimal (0.1)", value: 0.1 },       // Best for high-DPI/print
                            { label: "Light (0.3)", value: 0.3 },         // UI/text balance
                            { label: "Moderate (0.5)", value: 0.5 },      // General use
                            { label: "Default (0.7)", value: 0.7 },       // Optimal for math (recommended)
                            { label: "Strong (0.9)", value: 0.9 },        // Low-res displays
                            { label: "Maximum (1.0)", value: 1.0 }        // Projectors/legacy screens
                        ]
                    },
                ]
            },
            {
                type: "category",
                id: "KeyBidings",
                name: "Keybind shortcut",
                collapsible: true,
                shown: false,
                settings: [
                    {
                        type: "keybind",
                        id: "keybindOpen",
                        name: "Open modal Keybind",
                        note: "A Keybind that opens the lax modal",
                        value: this.persistentSettings.keybindOpen ?? ["Control", "Alt", "T"],
                        max: 5,
                        clearable: true
                    },
                    {
                        type: "keybind",
                        id: "keybindAttach",
                        name: "Attack equation Keybind",
                        note: "A Keybind that attach the latex equation",
                        value: this.persistentSettings.keybindAttach ?? ["Control", "Enter"],
                        max: 5,
                        clearable: true
                    },
                    {
                        type: "keybind",
                        id: "keybindPin",
                        name: "Pin equation Keybind",
                        note: "A Keybind that pins the latex equation",
                        value: this.persistentSettings.keybindPin ?? ["Control", "Alt", "p"],
                        max: 5,
                        clearable: true
                    },
                ]
            }
        ];
        // Create our action buttons
        const SaveButton = React.createElement(
            'button',
            {
                onClick: () => {
                    BdApi.Data.save(
                        this.constructor.name,
                        'persistentSettings',
                        this.persistentSettings
                    );
                    this.applyLaXFontColor();
                    BdApi.UI.showToast('Settings saved successfully!', {
                        type: 'success',
                    });
                },
                className:
                    'bd-button bd-button-filled bd-button-color-green bd-button-medium',
                style: {
                    marginRight: '8px',
                },
            },
            React.createElement(
                'div',
                { className: 'bd-button-content' },
                'Save'
            )
        );

        const ResetButton = React.createElement(
            'button',
            {
                onClick: () => {
                    // Define all default values in a single configuration object
                    const DEFAULTS = {
                        textColor: "#ffffff",
                        debounceTime: 50,
                        fontSize: 45,
                        NumberOfSavedEquations: 20,
                        DragAndDrop: true,
                        ImagePostProcessing: false,
                        edgeEnhance: true,
                        edgeType: "tophat",
                        edgeRadius: 2.0,
                        mathStroke: false,
                        strokeIntensity: 1.0,
                        bilateralFilter: false,
                        glyphAlignmentCorrection: false,
                        glyphThreshold: 0.3,
                        subpixelHinting: false,
                        adaptiveContrast: false,
                        contrastAmount: 1,
                        vectorFieldAA: false,
                        vfaaIntensity: 0.7,
                        keybindOpen: ["Control", "Alt", "T"],
                        KeybindAttach: ["Control", "Enter"],
                        keybindPin: ["Control", "Alt", "p"],
                    };

                    // Update persistent settings in one operation
                    Object.assign(this.persistentSettings, DEFAULTS);

                    // Update the settings panel UI
                    if (settingsPanelInstance) {
                        settingsPanelInstance.setState({
                            settings: settingsConfig.map(setting => ({
                                ...setting,
                                value: DEFAULTS[setting.id] ?? setting.value
                            }))
                        });
                    }

                    BdApi.UI.showToast('Settings reset to defaults!', {
                        type: 'info',
                    });
                },
                className:
                    'bd-button bd-button-filled bd-button-color-red bd-button-medium',
            },
            React.createElement(
                'div',
                { className: 'bd-button-content' },
                'Reset'
            )
        );

        // Create the settings panel
        const SETTINGS_MAP = {
            // Basic Settings
            'textColor': 'textColor',
            'debounceTime': 'debounceTime',
            'fontSize': 'fontSize',
            'NumberOfSavedEquations': 'NumberOfSavedEquations',
            'DragAndDrop': 'DragAndDrop',

            // Image Processing
            'ImagePostProcessing': 'ImagePostProcessing',
            'edgeEnhance': 'edgeEnhance',
            'edgeType': 'edgeType',
            'edgeRadius': 'edgeRadius',
            'mathStroke': 'mathStroke',
            'strokeIntensity': 'strokeIntensity',
            'bilateralFilter': 'bilateralFilter',

            // Advanced Rendering
            'glyphAlignmentCorrection': 'glyphAlignmentCorrection',
            'glyphThreshold': 'glyphThreshold',
            'subpixelHinting': 'subpixelHinting',
            'adaptiveContrast': 'adaptiveContrast',
            'contrastAmount': 'contrastAmount',
            'vectorFieldAA': 'vectorFieldAA',
            'vfaaIntensity': 'vfaaIntensity',

            // Keybinds
            'keybindOpen': 'keybindOpen',
            'keybindAttach': 'keybindAttach',
            'keybindPin': 'keybindPin',

        };

        const panel = BdApi.UI.buildSettingsPanel({
            onChange: (_, id, value) => {
                const settingKey = SETTINGS_MAP[id];
                if (settingKey) {
                    this.persistentSettings[settingKey] = value;
                } else {
                    console.warn(`Unknown setting id: ${id}`);
                }
            },
            settings: settingsConfig,
        });

        /**
         * A React component that handles the rendering of the settings panel
         * and manages the DOM manipulation for adding action buttons.
         */
        return class SettingsPanel extends React.Component {
            constructor(props) {
                super(props);
                this.state = {
                    settings: settingsConfig,
                };
                this.saveRoot = null;
                this.resetRoot = null;
                this.saveContainer = null;
                this.resetContainer = null;
                this.buttonGroup = null;
                this.observer = null;
                this.timeout = null;

            }

            componentDidMount() {
                // Store reference to the instance
                this.settingsPanelInstance = this;

                this.timeout = setTimeout(() => {
                    const footer = document.querySelector('.bd-modal-footer');
                    if (!footer) return;

                    // Check if we've already added our buttons
                    if (footer.querySelector('.BD-LaX-button-group')) return;

                    this.buttonGroup = document.createElement('div');
                    this.buttonGroup.className = 'BD-LaX-button-group';
                    this.buttonGroup.style.display = 'flex';
                    this.buttonGroup.style.gap = '8px';
                    this.buttonGroup.style.marginLeft = 'auto';

                    // Create containers for our buttons
                    this.saveContainer = document.createElement('div');
                    this.resetContainer = document.createElement('div');

                    // Use createRoot for React 19
                    this.saveRoot = ReactDOM.createRoot(this.saveContainer);
                    this.saveRoot.render(SaveButton);

                    this.resetRoot = ReactDOM.createRoot(this.resetContainer);
                    this.resetRoot.render(ResetButton);

                    this.buttonGroup.appendChild(this.saveContainer);
                    this.buttonGroup.appendChild(this.resetContainer);

                    // Find the existing Done button container
                    const doneButton = footer.querySelector('.bd-button');

                    // Safely insert our buttons
                    if (doneButton && doneButton.parentNode === footer) {
                        footer.insertBefore(this.buttonGroup, doneButton);
                    } else {
                        // Fallback if Done button structure is different
                        footer.appendChild(this.buttonGroup);
                    }

                    footer.style.justifyContent = 'flex-end';
                    footer.style.gap = '16px';

                    // Set up mutation observer to handle modal changes
                    this.observer = new MutationObserver(() => {
                        if (!footer.contains(this.buttonGroup)) {
                            this.cleanupButtonGroup();
                            this.setupButtonGroup(footer);
                        }
                    });
                    this.observer.observe(footer, {
                        childList: true,
                        subtree: true,
                    });
                }, 100);
            }
            setupButtonGroup(footer) {
                if (this.buttonGroup) return;

                this.buttonGroup = document.createElement('div');
                this.buttonGroup.className = 'BD-LaX-button-group';
                this.buttonGroup.style.display = 'flex';
                this.buttonGroup.style.gap = '8px';
                this.buttonGroup.style.marginLeft = 'auto';

                this.saveContainer = document.createElement('div');
                this.resetContainer = document.createElement('div');

                this.saveRoot = ReactDOM.createRoot(this.saveContainer);
                this.saveRoot.render(SaveButton);

                this.resetRoot = ReactDOM.createRoot(this.resetContainer);
                this.resetRoot.render(ResetButton);

                this.buttonGroup.appendChild(this.saveContainer);
                this.buttonGroup.appendChild(this.resetContainer);

                const doneButton = footer.querySelector('.bd-button');
                if (doneButton && doneButton.parentNode === footer) {
                    footer.insertBefore(this.buttonGroup, doneButton);
                } else {
                    footer.appendChild(this.buttonGroup);
                }
            }

            cleanupButtonGroup() {
                if (this.timeout) {
                    clearTimeout(this.timeout);
                    this.timeout = null;
                }
                if (this.observer) {
                    this.observer.disconnect();
                    this.observer = null;
                }
                if (this.saveRoot) {
                    this.saveRoot.unmount();
                    this.saveRoot = null;
                }
                if (this.resetRoot) {
                    this.resetRoot.unmount();
                    this.resetRoot = null;
                }
                if (this.saveContainer) {
                    DOMHelper.safeRemoveNode(this.saveContainer);
                    this.saveContainer = null;
                }
                if (this.resetContainer) {
                    DOMHelper.safeRemoveNode(this.resetContainer);
                    this.resetContainer = null;
                }
                if (this.buttonGroup) {
                    DOMHelper.safeRemoveNode(this.buttonGroup);
                    this.buttonGroup = null;
                }
            }

            componentWillUnmount() {
                // Clean up React roots and DOM elements
                this.cleanupButtonGroup();

                // Clear instance reference
                this.settingsPanelInstance = null;
                this.settingsPanelInstance = null;
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
            subtitle: 'Enhanced LaTeX Experience',
            blurb: "**Thank you for updating! Here's what's new and improved:**",
            changes: [
                {
                    title: 'New Features & Improvements',
                    type: 'added',
                    items: [
                        '**Complete UI Overhaul** with modern Discord styling',
                        '**Advanced Settings Panel** with color picker and render delay controls',
                        '**Sophisticated Error Boundary** with detailed error messages and suggestions',
                        '**Live Preview** of LaTeX equations as you type',
                        '**Syntax Validation** to catch errors before sending',
                        '**Debounced Rendering** for smoother performance while typing',
                        '**Customizable Equation Color** in settings',
                        '**Render Delay Adjustment** for performance tuning',
                        '**Persistent Input** - remembers your last equation between sessions',
                        // 🔍 New additions below
                        '**Glyph Alignment Correction** for better rendering accuracy',
                        '**Bilateral Filter Option** to smooth images while preserving edges',
                        '**Enhanced Stroke Detection** tailored for mathematical symbols',
                        '**Drag-and-Drop Import Support** for `.txt` and `.tex` files'
                    ],
                    blurb: 'More powerful and user-friendly than ever!'
                },
                {
                    title: 'Bug Fixes & Stability',
                    type: 'fixed',
                    items: [
                        'Fixed all memory leaks and improved resource cleanup',
                        'Resolved NULL icon issues',
                        'Improved image attachment reliability',
                        'Fixed React reconciliation errors',
                        'Patched DOM manipulation edge cases',
                        'Fixed settings reset functionality',
                        'Resolved canvas rendering artifacts',
                        'Fixed error boundary state management',
                        // 🐞 New bug fixes
                        'Fixed issue with blob generation timeout handling',
                        'Corrected canvas context initialization failures',
                        'Patch for MutationObserver cleanup during unmount'
                    ],
                    blurb: 'Smoother operation and fewer crashes'
                },
                {
                    title: 'Performance Optimizations',
                    type: 'progress',
                    items: [
                        '**Optimized KaTeX Rendering** with intelligent debouncing',
                        '**Cached Canvas** for faster equation generation',
                        '**Sanitized KaTeX Container** for security',
                        '**Efficient DOM Management** with helper class',
                        '**Reduced Re-renders** with proper React lifecycle management',
                        '**Optimized SVG Generation** for better image quality',
                        '**Improved Error Handling** with detailed diagnostics',
                        '**Streamlined Settings Management** with persistent storage',
                        // ⚙️ Additional performance tweaks
                        '**Edge Enhancement Passes** for sharper output',
                        '**Morphological Filtering** for thin stroke detection',
                        '**Directional Smoothing** along edge gradients'
                    ],
                    blurb: 'Faster rendering and lower resource usage'
                },
                {
                    title: 'Under the Hood',
                    type: 'progress',
                    items: [
                        'Complete codebase refactoring',
                        'Implemented singleton DOM helper class',
                        'Added comprehensive error boundaries',
                        'Enhanced settings persistence',
                        'Improved React component architecture',
                        'Added performance metrics logging',
                        'Implemented proper cleanup lifecycle',
                        'Added version change detection',
                        // 🧱 Internal engineering updates
                        'Refactored canvas rendering pipeline',
                        'Added support for directional edge filtering',
                        'Upgraded linting system with command suggestions',
                        'Improved memory tracking integration',
                        'Enhanced mutation observer handling for dynamic DOM'
                    ],
                    blurb: 'More maintainable and extensible codebase'
                }
            ],
            footer: 'Found a bug or have a suggestion? Report it on GitHub! ❤️'
        });
        const modifyFooter = () => {
            // Find the footer element
            const footer = document.querySelector(
                '.bd-modal-footer .bd-flex-child'
            );
            if (footer) {
                footer.style.color = 'white';
                if (footer.innerHTML.includes('❤️')) {
                    footer.innerHTML = footer.innerHTML.replace(
                        '❤️',
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
        if (this.modalOpen) {
            // If modal exists but might be hidden, try to focus it
            const existingModal = document.querySelector('.lax-modal-container');
            if (existingModal) {
                existingModal.focus();
                return;
            } else {
                // Modal flag was stuck - reset it
                this.modalOpen = false;
            }
        }
        this.modalOpen = true;

        this.memoryTracker.takeSnapshot('Pre-Modal Open', {
            modalState: 'closed'
        });
        try {
            const savedInput =
                BdApi.Data.load(this.constructor.name, 'lastLaXInput') ||
                this.texInput ||
                '';

            const DebounceSettings =
                BdApi.Data.load(this.constructor.name, 'persistentSettings') || {};
            console.log('Saved Input:', savedInput);
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
                        history: this.history,
                        onUpdate: (val) => {
                            this.texInput = val;
                            currentInputValue = val;
                            BdApi.Data.save(
                                this.constructor.name,
                                'lastLaXInput',
                                val
                            );
                        },
                        onUseHistory: (equation) => {
                            this.texInput = equation;
                            currentInputValue = equation;
                            BdApi.Data.save(
                                this.constructor.name,
                                'lastLaXInput',
                                equation
                            );
                            if (modalInstance) {
                                modalInstance.setState({ texInput: equation });
                            }
                        },
                        onUpdateHistory: (newHistory) => {
                            // Save the updated history
                            BdApi.Data.save(
                                this.constructor.name,
                                'equationHistory',
                                newHistory
                            );
                        },
                    })
                ),
                {
                    confirmText: 'Attach',
                    onConfirm: async () => {
                        const currentInput =
                            this.texInput || currentInputValue || '';
                        if (!currentInput.trim()) {
                            BdApi.UI.showToast('Please enter an equation', {
                                type: 'error',
                            });
                            return;
                        }
                        try {
                            this.texInput = currentInput;
                            this.saveEquationToHistory(currentInput);
                            const blob = await this.generateLaXImage();
                            await this.attachImage(blob);
                            this.texInput = '';
                            BdApi.Data.save(
                                this.constructor.name,
                                'lastLaXInput',
                                ''
                            );
                            if (modalInstance) {
                                modalInstance.setState({ texInput: '' });
                            }
                        } catch (error) {
                            console.error('Attachment failed:', error);
                            BdApi.UI.showToast('Failed to attach equation', {
                                type: 'error',
                            });
                            throw error;
                        } finally {
                            this.modalOpen = false;
                        }
                    },
                    onCancel: () => {
                        if (modalInstance) {
                            modalInstance = null;
                        };
                        this.modalOpen = false;
                    },
                    onUpdate: (val) => {
                        this.texInput = val;
                        // Run the linter
                        const lax = new LaXModal
                        lax.updateLintResults(val);
                        BdApi.Data.save(this.constructor.name, 'lastLaXInput', val);
                    },
                    onClose: () => {
                        this.modalOpen = false;
                    }
                }
            );
        } catch (error) {
            console.error('Failed to open modal:', error);
            this.modalOpen = false; // Reset if opening fails
            BdApi.UI.showToast('Failed to open LaX modal', { type: 'error' });
        }

        this.memoryTracker.takeSnapshot('Post-Modal Open', {
            modalState: 'open',
            modalElements: document.querySelectorAll('.lax-modal *').length
        })
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
        this.memoryTracker.takeSnapshot('Pre-HTML-to-Canvas', {
            htmlLength: html.length,
            canvasSize: `${canvas.width}x${canvas.height}`
        });
        const startTime = performance.now();
        const scaledWidth = width * qualityMultiplier;
        const scaledHeight = height * qualityMultiplier;
        let tempContainer = null;
        let image = null;
        let svgData = null;
        const sanitize = new Sanitizer();
        const postProcessor = new ImagePostProcessing();
        try {
            if (!this.canvas || !(this.canvas instanceof HTMLCanvasElement)) {
                throw new Error('Canvas is not properly initialized');
            }
            if (width <= 0 || height <= 0) {
                throw new Error('Invalid dimensions');
            }

            canvas.width = scaledWidth;
            canvas.height = scaledHeight;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            if (!this.svgDocument) {
                this.svgDocument = document.implementation.createHTMLDocument();
                this.svgDocument.write('<html><body></body></html>');
                this.svgDocument.close();
            }

            tempContainer = this.svgDocument.createElement('div');
            tempContainer.innerHTML = sanitize.sanitizeKaTeXOutput(html);

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
                'xmlns',
                'http://www.w3.org/2000/svg'
            );
            this.svgDocument.body.setAttribute('style', 'margin:0');

            const serialized = new XMLSerializer()
                .serializeToString(tempContainer)
                .replace(/#/g, '%23')
                .replace(/javascript:/gi, 'blocked:')
                .replace(/<style>(.*?)<\/style>/gis, (match, css) => {
                    return `<style>${css
                        .replace(/@font-face\s*\{[^}]+\}/gi, '')
                        .replace(/\s+/g, ' ')
                        .trim()}</style>`;
                })
                .replace(/\s+/g, ' ') // Minimize whitespace
                .replace(/'/g, '%27'); // Escape single quotes

            svgData = `
            data:image/svg+xml;charset=utf-8,
            <svg xmlns="http://www.w3.org/2000/svg" width="${scaledWidth}" height="${scaledHeight}" shape-rendering="auto" text-rendering="geometricPrecision">
                <foreignObject width="100%" height="100%">
                    ${serialized}
                </foreignObject>
            </svg>`
                ;
            await new Promise((resolve, reject) => {
                image = new Image();
                const timer = setTimeout(() => {
                    reject(new Error('Image loading timed out'));
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

            const ctx = canvas.getContext('2d', {
                willReadFrequently: true,
                colorSpace: 'srgb',
                alpha: true
            });
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, scaledWidth, scaledHeight);

            ctx.translate(0.5, 0.5);

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.textDrawingMode = 'glyph'; // If supported
            ctx.filter = 'none';
            ctx.globalCompositeOperation = 'source-over';


            ctx.drawImage(image, 0, 0, scaledWidth, scaledHeight);

            ctx.restore();
            if (this.persistentSettings.ImagePostProcessing) {
                postProcessor.ProcessImage(ctx, width, height, 4, {
                    BilateralFilter: this.persistentSettings.bilateralFilter,
                    edgeEnhance: this.persistentSettings.edgeEnhance,
                    edgeRadius: this.persistentSettings.edgeRadius,
                    edgeType: this.persistentSettings.edgeType,
                    GlyphAlignmentCorrection: this.persistentSettings.glyphAlignmentCorrection,
                    GlyphThreshold: this.persistentSettings.glyphThreshold,
                    MathStroke: this.persistentSettings.mathStroke,
                    strokeIntensity: this.persistentSettings.mathStroke,
                    subpixelHinting: this.persistentSettings.subpixelHinting,
                    adaptiveContrast: this.persistentSettings.adaptiveContrast,
                    contrastAmount: this.persistentSettings.constractAmount,
                    symbolRecognition: this.persistentSettings.symbolRecognition,
                    vectorFieldAA: this.persistentSettingsvectorFieldAA,
                    vfaaIntensity: this.persistentSettings.vfaaIntensity,
                });
            }

        } catch (error) {
            console.error('htmlToCanvas error:', error);
            throw error;
        } finally {
            if (tempContainer) {
                DOMHelper.safeRemoveNode(tempContainer);
                tempContainer = null;
            }
            if (image) {
                image.onload = null;
                image.onerror = null;
                image.src = '';
            }
            URL.revokeObjectURL(svgData);
            svgData = null;
        }
        const endTime = performance.now();
        console.log(`htmlToCanvas took ${(endTime - startTime).toFixed(2)}ms `);
        this.memoryTracker.takeSnapshot('Post-HTML-to-Canvas', {
            pixelsRendered: canvas.width * canvas.height
        });
    }


    /**
     * Generates a PNG image from LaTeX input.
     * @returns {Promise<Blob>} Generated image as Blob.
     */
    async generateLaXImage() {
        // Initial memory snapshot
        const preRenderSnapshot = this.memoryTracker.takeSnapshot('Pre-Render', {
            texInputLength: this.texInput?.length || 0,
            canvasInitialized: !!this.canvas,
            historySize: this.history.length
        });

        // Add katex availability check
        if (typeof katex === 'undefined') {
            this.memoryTracker.takeSnapshot('KaTeX-Missing', {
                error: 'KaTeX not available'
            });
            throw new Error('KaTeX is not available');
        }

        // Initialize dependencies with tracking
        try {
            if (!this.cachedElements.webpackModules) {
                const webpackStart = performance.now();
                this.cachedElements.webpackModules = {
                    SelectedChannelStore: BdApi.Webpack.getModule(
                        (m) => m.getChannelId && m.getLastSelectedChannelId
                    ),
                };
                this.memoryTracker.takeSnapshot('WebPack-Loaded', {
                    loadTime: performance.now() - webpackStart,
                    modulesFound: !!this.cachedElements.webpackModules.SelectedChannelStore
                });
            }

            if (!this.canvas || !(this.canvas instanceof HTMLCanvasElement)) {
                this.canvas = document.createElement('canvas');
                this.canvasContext = this.canvas.getContext('2d');
                if (!this.canvasContext) {
                    this.memoryTracker.takeSnapshot('Canvas-Context-Failed');
                    throw new Error('Could not get canvas context');
                }
                this.memoryTracker.takeSnapshot('Canvas-Created', {
                    dimensions: `${this.canvas.width}x${this.canvas.height}`
                });
            }

            if (!this.attachments) {
                const attachStart = performance.now();
                this.attachments = BdApi.Webpack.getByKeys('addFiles');
                this.memoryTracker.takeSnapshot('Attachments-Loaded', {
                    loadTime: performance.now() - attachStart,
                    attachmentsFound: !!this.attachments
                });
                if (!this.attachments) {
                    throw new Error('Could not find attachments module');
                }
            }
        } catch (error) {
            this.memoryTracker.takeSnapshot('Dependency-Init-Failed', {
                error: error.message
            });
            throw error;
        }

        let renderTarget = null;
        let tempElements = [];
        const TEXSettings = BdApi.Data.load('LaX', 'persistentSettings') || {};

        try {
            // Create render target with tracking
            const renderSetupSnapshot = this.memoryTracker.takeSnapshot('Pre-Render-Setup');
            renderTarget = this.cachedElements.domElements.renderTarget ||
                document.createElement('div');

            renderTarget.classList.add('BD-LaX-plugin', 'BD-LaX-plugin-image-render');
            renderTarget.style.setProperty('--image-font-size', `${TEXSettings.fontSize}px`);

            this.cachedElements.domElements.renderTarget = renderTarget;
            tempElements.push(renderTarget);

            this.memoryTracker.takeSnapshot('Post-Render-Setup', {
                setupTime: performance.now() - renderSetupSnapshot.timestamp,
                domElementsCreated: tempElements.length
            });

            // KaTeX rendering with performance tracking
            const katexStart = performance.now();
            katex.render(this.texInput, renderTarget, {
                throwOnError: true,
                displayMode: true,
                fleqn: false,
                colorIsTextColor: true,
                trust: false,
                output: 'htmlAndMathml',
                macros: {
                    '\\dv': '\\frac{d #1}{d #2}',
                    '\\ddv': '\\frac{d^2 #1}{d #2^2}',
                    '\\pdv': '\\frac{\\partial #1}{\\partial #2}',
                    '\\pddv': '\\frac{\\partial^2 #1}{\\partial #2^2}',
                    '\\mpdv': '\\frac{\\partial^2 #1}{\\partial #2 \\partial #3}',
                    '\\norm': '\\left\\|#1\\right\\|',
                    '\\qty': '\\left(#1\\right)',
                },
            });
            this.memoryTracker.takeSnapshot('KaTeX-Rendered', {
                renderTime: performance.now() - katexStart,
                katexNodes: renderTarget.querySelectorAll('*').length
            });

            document.body.append(renderTarget);

            // Prepare HTML with styles
            const katexStyles = Array.from(
                document.querySelectorAll('link[href*="katex"], style')
            ).map((el) => el.outerHTML).join('\n');

            const customCSS = `
                .katex { font-size: 3em !important; }
                .katex * {
                    font-smooth: always;
                    -webkit-font-smoothing: antialiased;
                    text-rendering: geometricPrecision;
                    shape-rendering: geometricPrecision;
                    paint-order: stroke fill markers;
                    box-sizing: border-box;
                }
            `;

            const html = `${katexStyles}<style type="text/css">${customCSS}</style>${renderTarget.outerHTML}`;
            const rect = renderTarget.getBoundingClientRect();
            const katexHtml = renderTarget.querySelector('.katex-html');
            const width = Math.ceil(rect.width) + (katexHtml ? katexHtml.children.length - 1 : 0);
            const height = Math.ceil(rect.height);

            // Canvas conversion with tracking
            const preCanvasSnapshot = this.memoryTracker.takeSnapshot('Pre-Canvas-Conversion', {
                contentSize: html.length,
                targetDimensions: `${width}x${height}`
            });

            await this.htmlToCanvas(html, this.canvas, width, height);

            this.memoryTracker.takeSnapshot('Post-Canvas-Conversion', {
                conversionTime: performance.now() - preCanvasSnapshot.timestamp,
                finalDimensions: `${this.canvas.width}x${this.canvas.height}`
            });

            // Generate blob with timeout tracking
            const blobGenerationStart = performance.now();
            const blob = await new Promise((resolve, reject) => {
                const timer = setTimeout(() => {
                    this.memoryTracker.takeSnapshot('Blob-Generation-Timeout');
                    reject(new Error('Image generation timeout'));
                }, 10000);
                this.resources.timeouts.add(timer);

                this.canvas.toBlob(
                    (blob) => {
                        clearTimeout(timer);
                        this.resources.timeouts.delete(timer);

                        if (!blob) {
                            this.memoryTracker.takeSnapshot('Blob-Generation-Failed');
                            reject(new Error('Canvas toBlob failed'));
                            return;
                        }
                        this.memoryTracker.takeSnapshot('Blob-Generated', {
                            blobSize: blob.size,
                            generationTime: performance.now() - blobGenerationStart
                        });
                        resolve(blob);
                    },
                    'image/png',
                    1
                );
            });

            return blob;

        } catch (error) {
            this.memoryTracker.takeSnapshot('Render-Error', {
                error: error.message,
                errorPhase: error.stack.split('\n')[0]
            });

            DOMHelper.safeRemoveNode(renderTarget);
            renderTarget.innerHTML = '';
            console.error('Error generating LaX image:', error);
            BdApi.UI.showToast('Failed to generate equation image', {
                type: 'error',
            });
            throw error;
        } finally {
            // Cleanup with memory tracking
            const cleanupStart = performance.now();

            if (renderTarget?.parentNode) {
                try {
                    DOMHelper.safeRemoveNode(renderTarget);
                } catch (e) {
                    this.memoryTracker.takeSnapshot('Cleanup-Error', {
                        error: e.message
                    });
                    console.warn('Error removing render target:', e);
                }
                tempElements.forEach((el) => {
                    if (el?.parentNode) DOMHelper.safeRemoveNode(el);
                });
            }

            if (this.canvas) {
                try {
                    const ctx = this.canvas.getContext('2d');
                    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                } catch (e) {
                    console.warn('Error cleaning canvas:', e);
                }
            }

            // Final performance summary
            this.memoryTracker.takeSnapshot('Post-Render-Cleanup', {
                cleanupTime: performance.now() - cleanupStart,
                totalRenderTime: performance.now() - preRenderSnapshot.timestamp,
                memoryDelta: window.performance?.memory
                    ? (window.performance.memory.usedJSHeapSize - preRenderSnapshot.chromeMemory?.usedJSHeapSize || 0) / 1024
                    : null
            });
        }
    }

    /**
     * Attaches generated LaTeX image to the currently active channel.
     * @param {Blob} blob - PNG image as Blob.
     */
    attachImage(blob) {
        // Initial memory snapshot
        const preAttachSnapshot = this.memoryTracker.takeSnapshot('Pre-Attachment', {
            blobSize: blob.size,
            channelAvailable: !!this.cachedElements.webpackModules?.SelectedChannelStore
        });

        function formatDateToDDMMYYYYSSMS(timestamp) {
            const date = new Date(timestamp);
            return [
                date.getDate().toString().padStart(2, '0'),
                (date.getMonth() + 1).toString().padStart(2, '0'),
                date.getFullYear(),
                date.getSeconds().toString().padStart(2, '0'),
                date.getMilliseconds().toString().padStart(3, '0')
            ].join('-');
        }

        try {
            // Track channel resolution
            const channelStart = performance.now();
            const SelectedChannelStore = this.cachedElements.webpackModules?.SelectedChannelStore ||
                BdApi.Webpack.getModule((m) => m.getChannelId && m.getLastSelectedChannelId);

            this.memoryTracker.takeSnapshot('Channel-Resolution', {
                resolutionTime: performance.now() - channelStart,
                storeAvailable: !!SelectedChannelStore
            });

            if (!SelectedChannelStore) {
                throw new Error('Channel store not available');
            }

            const channelId = SelectedChannelStore.getChannelId();
            if (!channelId) {
                throw new Error('No channel selected');
            }

            // Track file creation
            const fileStart = performance.now();
            const timestamp = Date.now();
            const formattedDate = formatDateToDDMMYYYYSSMS(timestamp);
            const file = new File([blob], `LaX-output-${formattedDate}.png`, {
                type: 'image/png',
            });

            this.memoryTracker.takeSnapshot('File-Created', {
                creationTime: performance.now() - fileStart,
                fileName: file.name,
                fileType: file.type
            });

            // Track attachment process
            const attachStart = performance.now();
            this.attachments.addFiles({
                channelId: channelId,
                draftType: 0,
                files: [{
                    file: file,
                    isClip: false,
                    isThumbnail: false,
                    platform: 1,
                }],
                showLargeMessageDialog: false,
            });

            this.memoryTracker.takeSnapshot('Attachment-Complete', {
                attachTime: performance.now() - attachStart,
                totalTime: performance.now() - preAttachSnapshot.timestamp,
                channelId: channelId
            });

        } catch (error) {
            // Error tracking with detailed context
            this.memoryTracker.takeSnapshot('Attachment-Failed', {
                error: error.message,
                errorPhase: error.stack.split('\n')[0],
                blobSize: blob.size,
                timestamp: Date.now() - preAttachSnapshot.timestamp
            });

            console.error('Attachment failed:', error);
            BdApi.UI.showToast('Failed to attach equation', {
                type: 'error',
                timeout: 5000
            });
            throw error;
        } finally {
            // Final memory check
            this.memoryTracker.takeSnapshot('Post-Attachment', {
                memoryDelta: window.performance?.memory
                    ? (window.performance.memory.usedJSHeapSize - preAttachSnapshot.chromeMemory?.usedJSHeapSize || 0) / 1024
                    : null,
                attachmentsCount: this.attachments?.getFiles?.()?.length || 0
            });
        }
    }

    /**
     * Injects LaTeX button into Discord's message composer.
     */
    injectButton() {
        const preButtonCount = document.querySelectorAll('.BD-LaX-plugin-button').length;
        this.memoryTracker.takeSnapshot('Pre-Button Injection', {
            existingButtons: preButtonCount
        });
        const TextareaClasses = BdApi.Webpack.getModule(
            (m) => m.textArea?.value?.includes?.('textArea__'),
            { searchExports: true }
        ) || {
            channelTextArea: { value: 'channelTextArea__74017' },
            textArea: { value: 'textArea__74017' },
            buttons: { value: 'buttons__74017' },
        };
        const targetSelector = `.${TextareaClasses.channelTextArea.value} .${TextareaClasses.buttons.value}`;
        this.observer = new MutationObserver((mutations) => {
            this.tryInjectButton(targetSelector);
        });
        this.observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
        this.resources.observers.add(this.observer);
        this.memoryTracker.takeSnapshot('Post-Button Injection', {
            addedButtons: document.querySelectorAll('.BD-LaX-plugin-button').length - preButtonCount
        });
    }

    /**
     * Attempts to inject button into specified selector.
     * @param {string} selector - CSS selector for target container.
     */
    tryInjectButton(selector) {
        const buttonsContainer = document.querySelector(selector);
        if (!buttonsContainer || buttonsContainer.contains(this.LaXButton))
            return;

        if (
            buttonsContainer.lastChild?.classList?.contains(
                'BD-LaX-plugin-button'
            )
        ) {
            DOMHelper.safeRemoveChild(
                buttonsContainer,
                buttonsContainer.lastChild
            );
        }

        buttonsContainer.prepend(this.LaXButton);
        this.resources.elements.add(this.LaXButton);
    }

    /**
     * Delays execution by a given number of milliseconds.
     * @param {number} ms - Milliseconds to delay.
     * @returns {Promise<void>}
     */
    delay(ms) {
        return new Promise((resolve) => {
            const timer = setTimeout(resolve, ms);
            this.resources.timeouts.add(timer);
        });
    }
}

module.exports = LaX;