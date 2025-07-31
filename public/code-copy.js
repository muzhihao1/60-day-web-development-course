// Code copy functionality
document.addEventListener('DOMContentLoaded', function() {
  // Find all pre elements that contain code
  const codeBlocks = document.querySelectorAll('pre');
  
  codeBlocks.forEach((pre, index) => {
    // Skip if already wrapped
    if (pre.parentElement.classList.contains('code-block-wrapper')) {
      return;
    }
    
    // Extract language from class
    const codeElement = pre.querySelector('code');
    if (!codeElement) return;
    
    const classList = codeElement.className || '';
    const languageMatch = classList.match(/language-(\w+)/);
    const language = languageMatch ? languageMatch[1] : 'plaintext';
    
    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'code-block-wrapper';
    wrapper.setAttribute('data-code-id', `code-${index}`);
    
    // Create header
    const header = document.createElement('div');
    header.className = 'code-header';
    
    // Language label
    const langLabel = document.createElement('span');
    langLabel.className = 'code-language';
    langLabel.textContent = language;
    
    // Copy button
    const copyButton = document.createElement('button');
    copyButton.className = 'copy-button';
    copyButton.setAttribute('aria-label', '复制代码');
    copyButton.setAttribute('title', '复制代码');
    copyButton.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
      </svg>
      <span>复制</span>
    `;
    
    // Add click handler
    copyButton.addEventListener('click', async function() {
      const code = codeElement.textContent;
      
      try {
        await navigator.clipboard.writeText(code.trim());
        
        // Success feedback
        copyButton.classList.add('copied');
        copyButton.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 6L9 17l-5-5"></path>
          </svg>
          <span>已复制</span>
        `;
        
        // Reset after 2 seconds
        setTimeout(() => {
          copyButton.classList.remove('copied');
          copyButton.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
            </svg>
            <span>复制</span>
          `;
        }, 2000);
      } catch (err) {
        console.error('复制失败:', err);
        // Fallback method
        const textArea = document.createElement('textarea');
        textArea.value = code.trim();
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
          document.execCommand('copy');
          copyButton.classList.add('copied');
          copyButton.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 6L9 17l-5-5"></path>
            </svg>
            <span>已复制</span>
          `;
          
          setTimeout(() => {
            copyButton.classList.remove('copied');
            copyButton.innerHTML = `
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
              </svg>
              <span>复制</span>
            `;
          }, 2000);
        } catch (fallbackErr) {
          console.error('降级复制也失败:', fallbackErr);
        }
        
        document.body.removeChild(textArea);
      }
    });
    
    // Assemble header
    header.appendChild(langLabel);
    header.appendChild(copyButton);
    
    // Wrap the pre element
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(header);
    wrapper.appendChild(pre);
  });
});