---
title: "Git Flow团队协作实战"
description: "模拟真实开发场景的Git工作流"
category: "project"
language: "html"
---

## Git Flow团队协作完整指南

### 1. 项目初始化和团队设置

```bash
#!/bin/bash
# 团队项目初始化脚本

echo "=== 初始化团队项目 ==="

# 1. 创建中央仓库（项目负责人执行）
mkdir portfolio-team && cd portfolio-team
git init --bare

# 2. 团队成员克隆仓库
cd ../
git clone portfolio-team developer1-portfolio
git clone portfolio-team developer2-portfolio
git clone portfolio-team developer3-portfolio

# 3. 初始化Git Flow（每个开发者执行）
cd developer1-portfolio
git flow init -d

# 配置团队成员信息
git config user.name "Developer 1"
git config user.email "dev1@team.com"

# 创建初始提交
echo "# Developer Portfolio" > README.md
git add README.md
git commit -m "Initial commit"
git push -u origin main
git push -u origin develop
```

### 2. 功能开发工作流

```bash
# Developer 1: 开发导航组件
echo "=== Developer 1: 导航组件开发 ==="

# 1. 更新本地develop分支
git checkout develop
git pull origin develop

# 2. 创建功能分支
git flow feature start navigation-component

# 3. 开发导航组件
cat > src/components/Navigation.js << 'EOF'
// Navigation Component
export class Navigation {
  constructor() {
    this.menuItems = [
      { label: '首页', href: '/' },
      { label: '关于', href: '/about' },
      { label: '项目', href: '/projects' },
      { label: '博客', href: '/blog' },
      { label: '联系', href: '/contact' }
    ];
  }
  
  render() {
    return `
      <nav class="navbar">
        <div class="navbar-container">
          <a href="/" class="navbar-brand">Portfolio</a>
          <ul class="navbar-menu">
            ${this.menuItems.map(item => `
              <li><a href="${item.href}" class="navbar-link">${item.label}</a></li>
            `).join('')}
          </ul>
        </div>
      </nav>
    `;
  }
}
EOF

# 4. 提交更改
git add src/components/Navigation.js
git commit -m "feat: add responsive navigation component

- Created Navigation class with menu items
- Implemented render method with HTML template
- Added navbar styling classes"

# 5. 推送功能分支
git push origin feature/navigation-component

# 6. 创建Pull Request（通常在GitHub/GitLab上操作）
echo "请在GitHub上创建从 feature/navigation-component 到 develop 的PR"
```

### 3. 代码审查流程

```bash
# Developer 2: 审查导航组件代码
echo "=== Developer 2: 代码审查 ==="

# 1. 获取最新代码
git fetch origin

# 2. 检出功能分支进行审查
git checkout -b review/navigation-component origin/feature/navigation-component

# 3. 运行测试
npm test

# 4. 本地测试功能
npm run dev

# 5. 提供反馈（在PR中评论）
cat > review-comments.md << 'EOF'
## 代码审查反馈

### 优点
- 组件结构清晰
- 代码可读性好

### 建议改进
1. 添加移动端菜单支持
2. 添加活动链接高亮
3. 考虑添加TypeScript类型

### 代码建议
```javascript
// 建议添加移动端切换功能
toggleMobileMenu() {
  this.mobileMenuOpen = !this.mobileMenuOpen;
  this.render();
}
```
EOF

# 6. Developer 1 根据反馈更新代码
git checkout feature/navigation-component
git pull origin feature/navigation-component

# 添加移动端支持
cat >> src/components/Navigation.js << 'EOF'

  toggleMobileMenu() {
    const mobileMenu = document.querySelector('.navbar-mobile');
    mobileMenu.classList.toggle('active');
  }
  
  addEventListeners() {
    const toggleBtn = document.querySelector('.mobile-toggle');
    toggleBtn?.addEventListener('click', () => this.toggleMobileMenu());
  }
EOF

git add src/components/Navigation.js
git commit -m "feat: add mobile menu toggle functionality

- Added toggleMobileMenu method
- Added event listeners for mobile interaction
- Improved responsive behavior"

git push origin feature/navigation-component
```

### 4. 功能合并和冲突解决

```bash
# Team Lead: 合并功能到develop
echo "=== 合并功能分支 ==="

# 1. 确保develop是最新的
git checkout develop
git pull origin develop

# 2. 合并功能分支
git flow feature finish navigation-component

# 如果出现冲突，解决冲突
# 假设在styles/main.css中有冲突
cat > resolve-conflict.sh << 'EOF'
#!/bin/bash
# 冲突解决示例

# 查看冲突文件
git status

# 编辑冲突文件
# 寻找 <<<<<<< HEAD, =======, >>>>>>> 标记

# 解决后的文件
cat > src/styles/main.css << 'STYLES'
/* Navigation Styles */
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 1000;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 团队成员2添加的样式 */
.navbar-menu {
  display: flex;
  list-style: none;
  gap: 2rem;
}

/* 团队成员1添加的样式 */
.navbar-link {
  text-decoration: none;
  color: #333;
  transition: color 0.3s;
}

.navbar-link:hover {
  color: #0066cc;
}
STYLES

# 标记冲突已解决
git add src/styles/main.css
git commit -m "merge: resolve style conflicts in navigation component"
EOF

# 3. 推送到远程
git push origin develop
```

### 5. 发布流程

```bash
# Release Manager: 准备发布
echo "=== 准备v1.0.0发布 ==="

# 1. 从develop创建release分支
git flow release start v1.0.0

# 2. 更新版本号
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.version = '1.0.0';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
"

# 3. 更新CHANGELOG
cat > CHANGELOG.md << 'EOF'
# Changelog

## [1.0.0] - 2024-01-15

### Added
- 响应式导航组件
- 深色模式支持
- 项目展示页面
- 博客系统
- 联系表单

### Changed
- 优化移动端体验
- 改进性能加载

### Fixed
- 修复导航栏在移动端的显示问题
- 修复深色模式切换闪烁
EOF

git add package.json CHANGELOG.md
git commit -m "chore: bump version to 1.0.0 and update changelog"

# 4. 运行最终测试
npm run test
npm run build
npm run lighthouse

# 5. 完成release
git flow release finish v1.0.0 -m "Release version 1.0.0"

# 6. 推送标签和分支
git push origin main
git push origin develop
git push origin --tags
```

### 6. 热修复流程

```bash
# 生产环境紧急修复
echo "=== 紧急修复：修复导航栏bug ==="

# 1. 从main分支创建hotfix
git flow hotfix start fix-navigation-scroll

# 2. 修复问题
cat > src/components/Navigation.js << 'EOF'
// 修复导航栏滚动问题
export class Navigation {
  constructor() {
    this.lastScrollY = 0;
    this.navbar = null;
  }
  
  init() {
    this.navbar = document.querySelector('.navbar');
    this.handleScroll();
  }
  
  handleScroll() {
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      
      // 修复：添加null检查
      if (!this.navbar) return;
      
      if (currentScrollY > this.lastScrollY && currentScrollY > 100) {
        // 向下滚动 - 隐藏导航栏
        this.navbar.style.transform = 'translateY(-100%)';
      } else {
        // 向上滚动 - 显示导航栏
        this.navbar.style.transform = 'translateY(0)';
      }
      
      this.lastScrollY = currentScrollY;
    });
  }
}
EOF

# 3. 提交修复
git add src/components/Navigation.js
git commit -m "fix: prevent null reference error in navigation scroll handler

- Added null check for navbar element
- Fixed navigation bar hiding on scroll
- Improved scroll performance"

# 4. 完成hotfix
git flow hotfix finish fix-navigation-scroll -m "Hotfix: navigation scroll bug"

# 5. 推送更新
git push origin main
git push origin develop
git push origin --tags
```

### 7. 团队协作最佳实践

```bash
# 日常工作流程脚本
cat > team-workflow.sh << 'EOF'
#!/bin/bash

# 每日工作开始
daily_start() {
  echo "=== 开始今日工作 ==="
  
  # 1. 获取最新代码
  git fetch --all --prune
  
  # 2. 查看团队更新
  echo "团队成员的最新提交："
  git log --oneline --graph --all --decorate -10
  
  # 3. 更新本地develop
  git checkout develop
  git pull origin develop
  
  # 4. 查看当前任务
  git branch -a | grep feature
  
  echo "准备就绪！"
}

# 提交代码前检查
pre_commit_check() {
  echo "=== 提交前检查 ==="
  
  # 1. 运行linter
  npm run lint
  
  # 2. 运行测试
  npm test
  
  # 3. 检查构建
  npm run build
  
  # 4. 检查提交信息格式
  echo "提交信息应遵循格式："
  echo "  feat: 新功能"
  echo "  fix: 修复bug"
  echo "  docs: 文档更新"
  echo "  style: 代码格式"
  echo "  refactor: 重构"
  echo "  test: 测试相关"
  echo "  chore: 构建或辅助工具"
}

# 同步fork的仓库
sync_fork() {
  echo "=== 同步Fork仓库 ==="
  
  # 1. 添加上游仓库
  git remote add upstream https://github.com/original/portfolio.git
  
  # 2. 获取上游更新
  git fetch upstream
  
  # 3. 合并上游main到本地main
  git checkout main
  git merge upstream/main
  
  # 4. 推送到自己的fork
  git push origin main
  
  # 5. 更新develop
  git checkout develop
  git merge upstream/develop
  git push origin develop
}

# 代码统计
code_stats() {
  echo "=== 项目统计 ==="
  
  # 贡献者统计
  echo "贡献者排行："
  git shortlog -sn --all
  
  # 代码行数统计
  echo -e "\n代码行数统计："
  git ls-files | xargs wc -l | tail -1
  
  # 最活跃的文件
  echo -e "\n最常修改的文件："
  git log --pretty=format: --name-only | sort | uniq -c | sort -rg | head -10
}

# 执行函数
case "$1" in
  start)
    daily_start
    ;;
  check)
    pre_commit_check
    ;;
  sync)
    sync_fork
    ;;
  stats)
    code_stats
    ;;
  *)
    echo "用法: $0 {start|check|sync|stats}"
    ;;
esac
EOF

chmod +x team-workflow.sh
```

### 8. CI/CD集成

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linter
      run: npm run lint
    
    - name: Run tests
      run: npm test
    
    - name: Build project
      run: npm run build
    
    - name: Run Lighthouse CI
      uses: treosh/lighthouse-ci-action@v9
      with:
        urls: |
          http://localhost:3000
        uploadArtifacts: true
        temporaryPublicStorage: true
    
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Production
      env:
        VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
      run: |
        npm i -g vercel
        vercel --prod --token=$VERCEL_TOKEN
```

### 9. 提交信息规范

```bash
# 创建提交模板
cat > .gitmessage << 'EOF'
# <类型>(<范围>): <主题>

# <正文>

# <页脚>

# 类型：
# feat:     新功能
# fix:      修复bug
# docs:     文档变更
# style:    代码格式（不影响代码运行的变动）
# refactor: 重构（既不是新增功能，也不是修改bug的代码变动）
# perf:     性能优化
# test:     增加测试
# chore:    构建过程或辅助工具的变动
#
# 范围：
# 可以是影响的文件、组件或功能模块
#
# 主题：
# 不超过50个字符，以动词开头，使用现在时
#
# 正文：
# 详细说明改动原因、改动内容、与之前行为的对比
#
# 页脚：
# 关闭的issue、BREAKING CHANGE等

# 示例：
# feat(navigation): add mobile menu toggle
# 
# Added a hamburger menu for mobile devices that toggles
# the navigation menu visibility. The menu slides in from
# the right side with a smooth animation.
# 
# Closes #123
EOF

# 设置提交模板
git config commit.template .gitmessage
```

这个Git Flow团队协作指南展示了真实开发场景中的完整工作流程，包括功能开发、代码审查、冲突解决、发布管理和最佳实践。