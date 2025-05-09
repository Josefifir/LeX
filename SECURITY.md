# Security Policy

## Supported Versions

Only the latest version of LeX receives security updates. We recommend always using the most recent release.

## Reporting a Vulnerability

**Please DO NOT report security vulnerabilities through public GitHub issues.**

If you discover any security concerns, please:
1. Email the maintainer directly at: [thejoefirguy@protonmail.com]
2. Include "LeX Security" in your subject line
3. Provide details including:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested mitigation (if known)

We will respond within 3 business days to acknowledge receipt and outline next steps.

## Scope

This policy applies to:
- The core equation generation functionality
- Any data processing within LeX
- Dependency chain (KaTeX and other libraries)

### Out of Scope:
- Rendering issues in third-party LaTeX processors
- Browser-specific quirks not related to core functionality
- Theoretical vulnerabilities without practical exploitation

## Security Considerations

LeX handles:
- Mathematical equation generation
- Text processing for LaTeX output

LeX does NOT:
- Store user data persistently
- Process sensitive information
- Execute arbitrary user-provided code

However, we take all potential security issues seriously.


## Reward Program

While we currently don't have a bug bounty program, significant security contributions may be acknowledged in release notes (with contributor permission).

## Disclosure Policy

Confirmed vulnerabilities will be:
1. Patched in a timely manner
2. Disclosed in the next release notes
3. Given a CVE if appropriate

We follow responsible disclosure principles and will credit finders who follow this policy.
