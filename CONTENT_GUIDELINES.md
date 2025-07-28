# 内容创建指南 - 60天Web开发课程

## 📋 目录

1. [Schema定义和要求](#schema定义和要求)
2. [内容模板](#内容模板)
3. [常见错误和解决方案](#常见错误和解决方案)
4. [验证和测试](#验证和测试)
5. [最佳实践](#最佳实践)

---

## 🔧 Schema定义和要求

### 1. 课程内容 (courses)

**必需字段**：
```yaml
day: number                    # 天数（1-60）
phase: enum                    # 阶段名称，必须是以下之一：
  - "modern-web"              # Phase 1
  - "javascript-mastery"      # Phase 2
  - "react-development"       # Phase 3
  - "backend-development"     # Phase 4
  - "fullstack-deployment"   # Phase 5
title: string                  # 课程标题
description: string            # 课程描述
objectives: array<string>      # 学习目标（3-5个）
estimatedTime: number          # 预计时间（分钟，默认60）
difficulty: enum               # 难度等级
  - "beginner"
  - "intermediate" 
  - "advanced"
```

**可选字段**：
```yaml
prerequisites: array<number>   # 前置课程（天数数组，如 [5, 6]）
tags: array<string>           # 标签
resources: array<object>      # 学习资源
  - title: string
  - url: string
  - type: enum                # 只能是以下值之一
    - "article"
    - "video"
    - "documentation"
    - "tool"
codeExamples: array<object>   # 代码示例引用
  - title: string
  - language: string
  - path: string
```

### 2. 练习内容 (exercises)

**必需字段**：
```yaml
day: number                    # 天数（与课程对应）
title: string                  # 练习标题
description: string            # 练习描述（必需！）
difficulty: enum               # 难度等级
  - "beginner"
  - "intermediate"
  - "advanced"
estimatedTime: number          # 预计时间（分钟，不是小时！）
requirements: array<string>    # 练习要求（必需！至少3-5个）
```

**可选字段**：
```yaml
hints: array<string>          # 提示
checkpoints: array<object>    # 检查点
  - task: string
  - completed: boolean        # 默认false
starterCode: object           # 起始代码
  - language: string
  - path: string
```

### 3. 解决方案 (solutions)

**必需字段**：
```yaml
day: number                    # 天数
exerciseTitle: string          # 对应的练习标题
approach: string               # 解决方法描述
files: array<object>          # 文件列表
  - path: string
  - language: string
  - description: string       # 可选
keyTakeaways: array<string>   # 关键要点
```

**可选字段**：
```yaml
commonMistakes: array<string>  # 常见错误
extensions: array<object>      # 扩展练习
  - title: string
  - description: string
```

### 4. 代码示例 (codeExamples)

**必需字段**：
```yaml
title: string                  # 示例标题
description: string            # 示例描述
category: string               # 分类
language: string               # 编程语言
```

### 5. 阶段数据 (phases)

**必需字段**：
```yaml
number: number                 # 阶段号（1-5）
name: string                   # 阶段名称
description: string            # 阶段描述
startDay: number              # 开始天数
endDay: number                # 结束天数
objectives: array<string>     # 阶段目标
```

**可选字段**：
```yaml
icon: string                  # 图标
prerequisites: array<string>  # 前置要求
```

---

## 📝 内容模板

### 课程模板 (courses/day-X.md)

```markdown
---
day: 13
phase: "javascript-mastery"
title: "DOM操作基础"
description: "学习如何使用JavaScript操作HTML文档对象模型"
objectives:
  - "理解DOM的树形结构"
  - "掌握元素选择方法"
  - "学会修改元素内容和属性"
  - "实现基本的事件处理"
estimatedTime: 90
difficulty: "intermediate"
prerequisites: [12]
tags:
  - "JavaScript"
  - "DOM"
  - "Web API"
resources:
  - title: "MDN DOM文档"
    url: "https://developer.mozilla.org/zh-CN/docs/Web/API/Document_Object_Model"
    type: "documentation"
  - title: "DOM操作视频教程"
    url: "https://example.com/dom-tutorial"
    type: "video"
---

# Day 13: DOM操作基础

## 📋 学习目标

今天我们将学习...

## 课程内容...
```

### 练习模板 (exercises/day-X.md)

```markdown
---
day: 13
title: "构建动态待办事项列表"
description: "使用DOM操作创建一个功能完整的待办事项应用"
difficulty: "intermediate"
estimatedTime: 60
requirements:
  - "创建任务添加功能"
  - "实现任务删除功能"
  - "添加任务完成状态切换"
  - "使用事件委托处理动态元素"
  - "保存数据到localStorage"
hints:
  - "使用createElement创建新元素"
  - "考虑使用事件委托处理动态添加的元素"
  - "记得处理空输入的情况"
---

# 练习：构建动态待办事项列表

## 任务描述...
```

### 解决方案模板 (solutions/day-X.md)

```markdown
---
day: 13
exerciseTitle: "构建动态待办事项列表"
approach: "使用事件委托和localStorage实现持久化的待办事项应用"
files:
  - path: "index.html"
    language: "html"
    description: "HTML结构"
  - path: "script.js"
    language: "javascript"
    description: "JavaScript逻辑"
  - path: "styles.css"
    language: "css"
    description: "样式文件"
keyTakeaways:
  - "事件委托可以有效处理动态元素"
  - "localStorage提供简单的客户端存储"
  - "proper input validation防止空任务"
commonMistakes:
  - "忘记阻止表单默认提交行为"
  - "直接在循环中添加事件监听器"
  - "没有处理localStorage的异常情况"
---

# 解决方案：动态待办事项列表

## 实现思路...
```

---

## ❌ 常见错误和解决方案

### 1. 缺少必需字段

**错误示例**：
```yaml
# exercises/day-11.md
---
title: "DevTools侦探挑战"
day: 11
difficulty: "intermediate"
estimatedTime: 90
# 缺少 description 和 requirements！
---
```

**解决方案**：
始终包含所有必需字段，参考上面的模板。

### 2. 使用错误的字段名

**错误示例**：
```yaml
estimatedHours: 8  # ❌ 应该是 estimatedTime（分钟）
type: "project"    # ❌ exercises schema中没有type字段
```

**解决方案**：
- 使用`estimatedTime`（单位：分钟）
- 只使用schema中定义的字段

### 3. 枚举值错误

**错误示例**：
```yaml
resources:
  - type: "library"  # ❌ 不在允许的枚举值中
```

**解决方案**：
resources.type只能是: `article`, `video`, `documentation`, `tool`

### 4. 数据类型错误

**错误示例**：
```yaml
prerequisites:
  - day: 5           # ❌ 应该是数字数组
    title: "CSS Grid"
```

**解决方案**：
```yaml
prerequisites: [5]   # ✅ 正确：数字数组
```

---

## 🔍 验证和测试

### 本地验证步骤

1. **运行开发服务器**：
```bash
npm run dev
```

2. **检查控制台错误**：
访问相关页面，查看是否有schema验证错误。

3. **构建测试**：
```bash
npm run build
```
如果构建失败，检查错误信息中的schema验证问题。

### 提交前检查清单

- [ ] 所有必需字段都已填写
- [ ] 字段名拼写正确
- [ ] 枚举值在允许范围内
- [ ] 数据类型正确（特别注意数组和对象）
- [ ] estimatedTime使用分钟（不是小时）
- [ ] prerequisites是数字数组（不是对象数组）
- [ ] 本地构建成功

---

## 💡 最佳实践

### 1. 使用模板

创建新内容时，复制相应的模板文件，避免遗漏字段。

### 2. 参考config.ts

不确定字段要求时，查看`/src/content/config.ts`中的schema定义。

### 3. 渐进式开发

先创建包含所有必需字段的基础版本，再逐步添加可选内容。

### 4. 保持一致性

- 使用相同的标签格式
- 保持相似的描述风格
- 遵循既定的命名规范

### 5. 团队协作

- Terminal C创建内容时严格遵循此指南
- Terminal A审查时检查schema合规性
- 发现新的模式时及时更新此文档

---

## 📅 更新日志

- **2025-07-28**: 初始版本，记录了exercises schema验证问题的解决方案
- 添加了完整的schema定义和模板
- 包含了常见错误案例

---

**注意**：此文档是内容创建的权威指南，所有内容开发者必须遵循。如有疑问，请先查阅此文档。