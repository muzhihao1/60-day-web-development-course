import { visit } from 'unist-util-visit';
import { h } from 'hastscript';

export function rehypeCodeCopy() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      // Find pre elements that contain code
      if (node.tagName === 'pre' && node.children?.[0]?.tagName === 'code') {
        const codeElement = node.children[0];
        const codeId = `code-${Math.random().toString(36).substr(2, 9)}`;
        
        // Extract language from class name
        const className = codeElement.properties?.className || [];
        const languageClass = className.find(c => c.startsWith('language-'));
        const language = languageClass ? languageClass.replace('language-', '') : 'plaintext';
        
        // Create wrapper div
        const wrapper = h('div', { 
          class: 'code-block-wrapper',
          'data-code-id': codeId 
        }, [
          // Header with language and copy button
          h('div', { class: 'code-header' }, [
            h('span', { class: 'code-language' }, language),
            h('button', { 
              class: 'copy-button',
              'data-code-id': codeId,
              'aria-label': '复制代码',
              title: '复制代码',
              onclick: `
                (async function() {
                  const button = event.currentTarget;
                  const codeBlock = button.closest('[data-code-id]');
                  const code = codeBlock.querySelector('pre code').textContent;
                  
                  try {
                    await navigator.clipboard.writeText(code.trim());
                    button.classList.add('copied');
                    button.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"></path></svg><span>已复制</span>';
                    
                    setTimeout(() => {
                      button.classList.remove('copied');
                      button.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path></svg><span>复制</span>';
                    }, 2000);
                  } catch (err) {
                    console.error('复制失败:', err);
                  }
                })()`
            }, [
              h('svg', { 
                width: '14', 
                height: '14', 
                viewBox: '0 0 24 24', 
                fill: 'none', 
                stroke: 'currentColor',
                'stroke-width': '2'
              }, [
                h('rect', { x: '9', y: '9', width: '13', height: '13', rx: '2', ry: '2' }),
                h('path', { d: 'M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1' })
              ]),
              h('span', {}, '复制')
            ])
          ]),
          // Original pre element
          node
        ]);
        
        // Add inline styles
        const styleElement = h('style', {}, `
          .code-block-wrapper {
            position: relative;
            margin: 1.5rem 0;
            border-radius: 8px;
            overflow: hidden;
            background: #0d1117;
            border: 1px solid rgba(240, 246, 252, 0.1);
          }
          
          .code-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 1rem;
            background: rgba(13, 17, 23, 0.8);
            border-bottom: 1px solid rgba(240, 246, 252, 0.1);
          }
          
          .code-language {
            font-size: 0.75rem;
            font-weight: 500;
            color: #7d8590;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
          }
          
          .copy-button {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            padding: 0.25rem 0.75rem;
            background: transparent;
            color: #7d8590;
            border: 1px solid rgba(240, 246, 252, 0.1);
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
          }
          
          .copy-button:hover {
            background: rgba(177, 186, 196, 0.12);
            color: #f0f6fc;
            border-color: rgba(240, 246, 252, 0.2);
          }
          
          .copy-button:active {
            transform: scale(0.95);
          }
          
          .copy-button.copied {
            background: #238636;
            color: #ffffff;
            border-color: #238636;
          }
          
          .copy-button svg {
            width: 14px;
            height: 14px;
          }
          
          .copy-button span {
            font-size: 0.75rem;
          }
          
          .code-block-wrapper pre {
            margin: 0;
            padding: 1rem !important;
          }
          
          /* Light theme support */
          [data-theme="light"] .code-block-wrapper {
            background: #f6f8fa;
            border-color: #d1d9e0;
          }
          
          [data-theme="light"] .code-header {
            background: rgba(246, 248, 250, 0.8);
            border-bottom-color: #d1d9e0;
          }
          
          [data-theme="light"] .code-language {
            color: #57606a;
          }
          
          [data-theme="light"] .copy-button {
            color: #57606a;
            border-color: #d1d9e0;
          }
          
          [data-theme="light"] .copy-button:hover {
            background: rgba(208, 215, 222, 0.32);
            color: #24292f;
            border-color: #57606a;
          }
          
          /* Responsive design */
          @media (max-width: 768px) {
            .code-header {
              padding: 0.5rem 0.75rem;
            }
            
            .copy-button {
              padding: 0.25rem 0.5rem;
            }
            
            .copy-button span {
              display: none;
            }
            
            .copy-button svg {
              width: 16px;
              height: 16px;
            }
          }
        `);
        
        // Replace the node with wrapper
        parent.children[index] = wrapper;
        
        // Add styles only once per page
        if (!tree._codeBlockStylesAdded) {
          tree.children.unshift(styleElement);
          tree._codeBlockStylesAdded = true;
        }
      }
    });
  };
}