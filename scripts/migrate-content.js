/**
 * 内容迁移脚本
 * 将现有的60天课程内容迁移到Astro content collections格式
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import matter from 'gray-matter'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 路径配置
const SOURCE_BASE = path.join(__dirname, '../../60-day-modern-course')
const TARGET_BASE = path.join(__dirname, '../src/content')

// 阶段映射
const PHASE_MAP = {
  'phase-1-modern-web': 'modern-web',
  'phase-2-javascript-mastery': 'javascript-mastery',
  'phase-3-react-development': 'react-development',
  'phase-4-backend-development': 'backend-development',
  'phase-5-fullstack-deployment': 'fullstack-deployment'
}

// 难度映射
const DIFFICULTY_MAP = {
  1: 'beginner',   // Day 1-20
  2: 'intermediate', // Day 21-40
  3: 'advanced'    // Day 41-60
}

/**
 * 获取课程难度
 */
function getDifficulty(day) {
  if (day <= 20) return 'beginner'
  if (day <= 40) return 'intermediate'
  return 'advanced'
}

/**
 * 提取学习目标
 */
function extractObjectives(content) {
  const objectivesMatch = content.match(/## 📋 学习目标([\s\S]*?)(?=##|$)/)
  if (!objectivesMatch) return []
  
  const objectives = []
  const lines = objectivesMatch[1].trim().split('\n')
  
  for (const line of lines) {
    const match = line.match(/^-\s+(.+)$/)
    if (match) {
      objectives.push(match[1].trim())
    }
  }
  
  return objectives
}

/**
 * 提取练习要求
 */
function extractRequirements(content) {
  const requirementsMatch = content.match(/## 📝 练习要求([\s\S]*?)(?=##|$)/)
  if (!requirementsMatch) return []
  
  const requirements = []
  const lines = requirementsMatch[1].trim().split('\n')
  
  for (const line of lines) {
    const match = line.match(/^(?:\d+\.|-)?\s*(.+)$/)
    if (match && match[1].trim()) {
      requirements.push(match[1].trim())
    }
  }
  
  return requirements
}

/**
 * 处理课程内容文件
 */
async function processCourseFile(phaseDir, dayDir, day, phaseId) {
  const readmePath = path.join(SOURCE_BASE, phaseDir, dayDir, 'README.md')
  
  if (!fs.existsSync(readmePath)) {
    console.warn(`⚠️  README.md not found: ${readmePath}`)
    return
  }
  
  const content = fs.readFileSync(readmePath, 'utf-8')
  const titleMatch = content.match(/^#\s+Day\s+\d+:\s+(.+)$/m)
  const title = titleMatch ? titleMatch[1] : `Day ${day} 课程`
  
  // 提取描述
  const descMatch = content.match(/##.*?学习目标[\s\S]*?\n\n([\s\S]*?)\n(?=##|-)/)
  const description = descMatch ? descMatch[1].trim() : `Day ${day} 的学习内容`
  
  // 提取学习目标
  const objectives = extractObjectives(content)
  
  // 创建frontmatter
  const frontmatter = {
    day: parseInt(day),
    phase: phaseId,
    title: title,
    description: description,
    objectives: objectives,
    estimatedTime: 60,
    difficulty: getDifficulty(parseInt(day)),
    tags: [phaseId, `day-${day}`]
  }
  
  // 准备内容（移除标题，因为会从frontmatter生成）
  let processedContent = content
    .replace(/^#\s+Day\s+\d+:.*$/m, '')
    .replace(/^## 📋 学习目标[\s\S]*?(?=##|$)/m, '')
    .trim()
  
  // 生成文件内容
  const fileContent = matter.stringify(processedContent, frontmatter)
  
  // 写入文件
  const targetPath = path.join(TARGET_BASE, 'courses', `day-${day}.md`)
  fs.writeFileSync(targetPath, fileContent)
  console.log(`✅ 迁移课程内容: Day ${day}`)
}

/**
 * 处理练习文件
 */
async function processExerciseFile(phaseDir, dayDir, day) {
  const exercisePath = path.join(SOURCE_BASE, phaseDir, dayDir, 'exercise.md')
  
  if (!fs.existsSync(exercisePath)) {
    console.warn(`⚠️  exercise.md not found: ${exercisePath}`)
    return
  }
  
  const content = fs.readFileSync(exercisePath, 'utf-8')
  const titleMatch = content.match(/^#\s+Day\s+\d+\s+练习[：:]\s*(.+)$/m)
  const title = titleMatch ? titleMatch[1] : `Day ${day} 练习`
  
  // 提取描述
  const descMatch = content.match(/## 🎯 练习目标[\s\S]*?\n\n([\s\S]*?)\n(?=##|-)/)
  const description = descMatch ? descMatch[1].trim() : `Day ${day} 的练习内容`
  
  // 提取要求
  const requirements = extractRequirements(content)
  
  // 创建frontmatter
  const frontmatter = {
    day: parseInt(day),
    title: title,
    description: description,
    difficulty: getDifficulty(parseInt(day)),
    estimatedTime: 45,
    requirements: requirements || ['完成本练习的基本要求'],
    hints: []
  }
  
  // 准备内容
  let processedContent = content
    .replace(/^#\s+Day\s+\d+.*$/m, '')
    .replace(/^## 🎯 练习目标[\s\S]*?(?=##|$)/m, '')
    .replace(/^## 📝 练习要求[\s\S]*?(?=##|$)/m, '')
    .trim()
  
  // 生成文件内容
  const fileContent = matter.stringify(processedContent, frontmatter)
  
  // 写入文件
  const targetPath = path.join(TARGET_BASE, 'exercises', `day-${day}-exercise.md`)
  fs.writeFileSync(targetPath, fileContent)
  console.log(`✅ 迁移练习内容: Day ${day}`)
}

/**
 * 处理解决方案
 */
async function processSolutionFile(phaseDir, dayDir, day) {
  const solutionDir = path.join(SOURCE_BASE, phaseDir, dayDir, 'solution')
  
  if (!fs.existsSync(solutionDir)) {
    console.warn(`⚠️  solution directory not found: ${solutionDir}`)
    return
  }
  
  // 查找解决方案文件
  const files = fs.readdirSync(solutionDir)
  const solutionFiles = []
  
  for (const file of files) {
    const filePath = path.join(solutionDir, file)
    const stat = fs.statSync(filePath)
    
    if (stat.isFile() && !file.startsWith('.')) {
      const ext = path.extname(file).toLowerCase()
      const language = getLanguageFromExt(ext)
      
      if (language) {
        solutionFiles.push({
          path: file,
          language: language,
          description: `${file} 解决方案文件`
        })
      }
    }
  }
  
  // 创建解决方案markdown
  const frontmatter = {
    day: parseInt(day),
    exerciseTitle: `Day ${day} 练习`,
    approach: `这是 Day ${day} 练习的参考解决方案`,
    files: solutionFiles,
    keyTakeaways: [
      '理解核心概念的实际应用',
      '掌握最佳实践和编码规范',
      '学会调试和问题解决技巧'
    ]
  }
  
  const content = `
## 实现说明

这个解决方案展示了如何完成 Day ${day} 的练习要求。

### 核心思路

1. 分析问题需求
2. 设计解决方案
3. 编写代码实现
4. 测试和优化

### 代码解析

请查看上面列出的文件，了解具体的实现细节。
`

  const fileContent = matter.stringify(content, frontmatter)
  
  // 写入文件
  const targetPath = path.join(TARGET_BASE, 'solutions', `day-${day}-solution.md`)
  fs.writeFileSync(targetPath, fileContent)
  console.log(`✅ 迁移解决方案: Day ${day}`)
}

/**
 * 根据文件扩展名获取语言
 */
function getLanguageFromExt(ext) {
  const langMap = {
    '.html': 'html',
    '.css': 'css',
    '.js': 'javascript',
    '.ts': 'typescript',
    '.jsx': 'jsx',
    '.tsx': 'tsx',
    '.json': 'json',
    '.md': 'markdown',
    '.py': 'python',
    '.sh': 'bash'
  }
  
  return langMap[ext] || null
}

/**
 * 迁移代码示例
 */
async function processCodeExamples(phaseDir, dayDir, day) {
  const codeDir = path.join(SOURCE_BASE, phaseDir, dayDir, 'code')
  
  if (!fs.existsSync(codeDir)) {
    return
  }
  
  const files = fs.readdirSync(codeDir)
  
  for (const file of files) {
    const filePath = path.join(codeDir, file)
    const stat = fs.statSync(filePath)
    
    if (stat.isFile() && !file.startsWith('.')) {
      const ext = path.extname(file).toLowerCase()
      const language = getLanguageFromExt(ext)
      
      if (language) {
        const content = fs.readFileSync(filePath, 'utf-8')
        const title = file.replace(ext, '').replace(/-/g, ' ')
        
        const frontmatter = {
          title: title,
          day: parseInt(day),
          language: language,
          description: `Day ${day} 的代码示例`,
          concepts: extractConcepts(title)
        }
        
        const fileContent = matter.stringify(content, frontmatter)
        const targetPath = path.join(TARGET_BASE, 'codeExamples', `day-${day}-${file}.md`)
        
        fs.writeFileSync(targetPath, fileContent)
        console.log(`✅ 迁移代码示例: ${file}`)
      }
    }
  }
}

/**
 * 从标题提取概念
 */
function extractConcepts(title) {
  const concepts = []
  const keywords = ['html', 'css', 'javascript', 'react', 'node', 'api', 'database', 'git']
  
  for (const keyword of keywords) {
    if (title.toLowerCase().includes(keyword)) {
      concepts.push(keyword)
    }
  }
  
  return concepts.length > 0 ? concepts : ['web开发']
}

/**
 * 主迁移函数
 */
async function migrateContent() {
  console.log('🚀 开始内容迁移...')
  
  // 确保目标目录存在
  const collections = ['courses', 'exercises', 'solutions', 'codeExamples']
  for (const collection of collections) {
    const dir = path.join(TARGET_BASE, collection)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  }
  
  // 遍历所有阶段
  const phases = fs.readdirSync(SOURCE_BASE).filter(dir => dir.startsWith('phase-'))
  
  for (const phaseDir of phases) {
    const phaseId = PHASE_MAP[phaseDir]
    if (!phaseId) continue
    
    console.log(`\n📁 处理阶段: ${phaseDir}`)
    
    const phasePath = path.join(SOURCE_BASE, phaseDir)
    const dayDirs = fs.readdirSync(phasePath).filter(dir => dir.match(/^day-\d+$/))
    
    for (const dayDir of dayDirs) {
      const day = dayDir.match(/\d+/)[0]
      console.log(`\n  📅 处理 Day ${day}...`)
      
      try {
        await processCourseFile(phaseDir, dayDir, day, phaseId)
        await processExerciseFile(phaseDir, dayDir, day)
        await processSolutionFile(phaseDir, dayDir, day)
        await processCodeExamples(phaseDir, dayDir, day)
      } catch (error) {
        console.error(`❌ 处理 Day ${day} 时出错:`, error.message)
      }
    }
  }
  
  console.log('\n✨ 内容迁移完成！')
}

// 运行迁移
migrateContent().catch(console.error)