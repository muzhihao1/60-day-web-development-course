/**
 * Fix code block styling by overriding inline styles
 * This ensures all code blocks have consistent dark background
 */
document.addEventListener('DOMContentLoaded', () => {
  // Target all code blocks with inline styles
  const codeBlocks = document.querySelectorAll('pre.astro-code, pre.shiki, pre[class*="language-"]');
  
  codeBlocks.forEach(pre => {
    // Override inline styles
    pre.style.backgroundColor = '#0d1117';
    pre.style.background = '#0d1117';
    pre.style.color = '#c9d1d9';
    pre.style.padding = '1rem';
    pre.style.borderRadius = '8px';
    pre.style.border = '1px solid rgba(240, 246, 252, 0.1)';
    pre.style.margin = '1.5rem 0';
    
    // Ensure code elements inside also have correct styling
    const codeElement = pre.querySelector('code');
    if (codeElement) {
      codeElement.style.backgroundColor = 'transparent';
      codeElement.style.background = 'transparent';
      codeElement.style.color = '#c9d1d9';
    }
  });
});