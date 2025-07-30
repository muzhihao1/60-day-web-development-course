/**
 * Remark插件：将Markdown检查清单转换为交互式组件
 * 匹配包含"今日检查清单"标题的部分，并将其转换为InteractiveChecklist组件
 */
import { visit } from 'unist-util-visit'

export function remarkInteractiveChecklist() {
  return (tree, file) => {
    let inChecklistSection = false
    let checklistItems = []
    let checklistStartIndex = -1
    let checklistEndIndex = -1
    
    // 遍历AST寻找检查清单
    visit(tree, (node, index, parent) => {
      // 查找包含"今日检查清单"的标题
      if (
        node.type === 'heading' && 
        node.depth === 2 &&
        node.children &&
        node.children.some(child => 
          child.type === 'text' && 
          child.value.includes('今日检查清单')
        )
      ) {
        inChecklistSection = true
        checklistStartIndex = index
        return
      }
      
      // 如果在检查清单部分
      if (inChecklistSection) {
        // 检查是否是段落节点
        if (node.type === 'paragraph' && index === checklistStartIndex + 1) {
          // 跳过描述段落
          return
        }
        
        // 检查是否是列表
        if (node.type === 'list' && node.ordered === false) {
          // 提取所有的checkbox项
          node.children.forEach(listItem => {
            if (listItem.type === 'listItem' && listItem.checked === false) {
              // 提取列表项的文本内容
              const text = extractText(listItem)
              if (text) {
                checklistItems.push(text)
              }
            }
          })
          
          checklistEndIndex = index
          inChecklistSection = false
        }
        
        // 如果遇到其他标题，结束检查清单部分
        if (node.type === 'heading' && index > checklistStartIndex) {
          inChecklistSection = false
        }
      }
    })
    
    // 如果找到了检查清单，替换为组件
    if (checklistItems.length > 0 && checklistStartIndex !== -1 && checklistEndIndex !== -1) {
      // 创建HTML节点而不是MDX组件（因为我们也需要支持.md文件）
      const componentNode = {
        type: 'html',
        value: `<div class="interactive-checklist-wrapper" data-items='${JSON.stringify(checklistItems).replace(/'/g, '&#39;')}'></div>`
      }
      
      // 获取父节点
      const parent = tree.children
      
      // 替换原始的检查清单内容
      const deleteCount = checklistEndIndex - checklistStartIndex + 1
      parent.splice(checklistStartIndex, deleteCount, componentNode)
    }
  }
}

// 递归提取节点的文本内容
function extractText(node) {
  if (node.type === 'text') {
    return node.value
  }
  
  if (node.children && node.children.length > 0) {
    return node.children.map(child => extractText(child)).join('')
  }
  
  return ''
}