---
title: "package.json完整参考"
description: "package.json所有字段的详细说明和最佳实践"
---

# package.json完整参考

## 基本信息字段

```json
{
  // 包的唯一标识符，必须是小写，不能有空格
  "name": "my-awesome-package",
  
  // 版本号，必须遵循语义化版本规范 (semver)
  "version": "1.0.0",
  
  // 简短的包描述，会显示在npm搜索结果中
  "description": "一个很棒的JavaScript工具库",
  
  // 关键词数组，帮助用户在npm上搜索到你的包
  "keywords": ["utility", "helper", "javascript", "tools"],
  
  // 项目主页URL
  "homepage": "https://github.com/username/repo#readme",
  
  // Bug报告地址
  "bugs": {
    "url": "https://github.com/username/repo/issues",
    "email": "bugs@example.com"
  },
  
  // 开源许可证
  "license": "MIT"
}
```

## 人员信息

```json
{
  // 作者信息（单个人）
  "author": {
    "name": "张三",
    "email": "zhangsan@example.com",
    "url": "https://zhangsan.com"
  },
  
  // 或者简写形式
  "author": "张三 <zhangsan@example.com> (https://zhangsan.com)",
  
  // 贡献者列表（多人）
  "contributors": [
    {
      "name": "李四",
      "email": "lisi@example.com"
    },
    "王五 <wangwu@example.com>"
  ],
  
  // 维护者列表
  "maintainers": [
    {
      "name": "维护者",
      "email": "maintainer@example.com"
    }
  ]
}
```

## 文件和目录配置

```json
{
  // 发布时包含的文件和目录
  "files": [
    "dist",
    "lib",
    "src",
    "!src/test",     // 排除test目录
    "index.js",
    "README.md"
  ],
  
  // CommonJS主入口
  "main": "./dist/index.js",
  
  // ES模块主入口
  "module": "./dist/index.esm.js",
  
  // 浏览器环境入口
  "browser": "./dist/index.browser.js",
  
  // TypeScript类型定义文件
  "types": "./dist/index.d.ts",
  "typings": "./dist/index.d.ts", // types的别名
  
  // 可执行文件映射
  "bin": {
    "my-cli": "./bin/cli.js",
    "my-tool": "./bin/tool.js"
  },
  
  // 单个可执行文件
  "bin": "./bin/cli.js",
  
  // man手册页面
  "man": "./man/my-cli.1",
  "man": ["./man/my-cli.1", "./man/my-cli-config.5"],
  
  // 目录结构说明
  "directories": {
    "lib": "lib",
    "bin": "bin",
    "man": "man",
    "doc": "doc",
    "example": "examples",
    "test": "test"
  }
}
```

## 依赖管理

```json
{
  // 生产依赖：运行时需要的包
  "dependencies": {
    "express": "^4.18.2",    // 兼容4.x.x的最新版本
    "lodash": "~4.17.21",    // 兼容4.17.x的最新版本
    "axios": "0.27.2",       // 精确版本
    "react": ">=16.8.0"      // 16.8.0或更高版本
  },
  
  // 开发依赖：仅开发时需要的包
  "devDependencies": {
    "jest": "^29.0.0",
    "eslint": "^8.0.0",
    "webpack": "^5.0.0",
    "@types/node": "^18.0.0"
  },
  
  // 同级依赖：要求宿主环境提供的包
  "peerDependencies": {
    "react": "^16.8.0 || ^17.0.0 || ^18.0.0",
    "react-dom": "^16.8.0 || ^17.0.0 || ^18.0.0"
  },
  
  // 同级依赖的元数据
  "peerDependenciesMeta": {
    "react-dom": {
      "optional": true  // 标记为可选
    }
  },
  
  // 可选依赖：安装失败不会导致npm install失败
  "optionalDependencies": {
    "fsevents": "^2.3.2"
  },
  
  // 打包依赖：发布时一起打包的依赖
  "bundledDependencies": [
    "internal-module"
  ],
  // 或使用别名
  "bundleDependencies": ["internal-module"]
}
```

## 脚本配置

```json
{
  "scripts": {
    // 常用脚本
    "start": "node server.js",
    "dev": "nodemon server.js",
    "build": "webpack --mode production",
    "test": "jest",
    "lint": "eslint src/**/*.js",
    
    // 生命周期脚本
    "preinstall": "echo 安装前执行",
    "install": "echo 安装时执行",
    "postinstall": "echo 安装后执行",
    "prepublishOnly": "npm test && npm run build",
    "prepare": "husky install",
    
    // 自定义脚本的pre和post钩子
    "prebuild": "npm run clean",
    "build": "webpack",
    "postbuild": "npm run compress",
    
    // 传递参数
    "test:watch": "jest --watch",
    "start:prod": "NODE_ENV=production node server.js"
  },
  
  // 脚本可以访问的配置
  "config": {
    "port": 3000,
    "reporter": "spec"
  }
}
```

## 环境和平台

```json
{
  // Node.js版本要求
  "engines": {
    "node": ">=14.0.0",
    "npm": ">=6.0.0",
    "yarn": ">=1.22.0"
  },
  
  // 操作系统限制
  "os": ["darwin", "linux", "!win32"],
  
  // CPU架构限制
  "cpu": ["x64", "arm64", "!ia32"]
}
```

## 发布配置

```json
{
  // 标记为私有包，防止意外发布
  "private": true,
  
  // 发布配置
  "publishConfig": {
    "registry": "https://registry.npmjs.org/",
    "tag": "latest",
    "access": "public"  // 对于作用域包
  }
}
```

## 高级配置

```json
{
  // Git仓库信息
  "repository": {
    "type": "git",
    "url": "git+https://github.com/username/repo.git",
    "directory": "packages/subpackage"  // monorepo中的子目录
  },
  
  // 简写形式
  "repository": "github:username/repo",
  
  // 工作空间配置（monorepo）
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  
  // 或使用对象形式
  "workspaces": {
    "packages": [
      "packages/*"
    ],
    "nohoist": [
      "**/react-native",
      "**/react-native/**"
    ]
  },
  
  // 用于tree shaking
  "sideEffects": false,
  "sideEffects": [
    "*.css",
    "*.scss"
  ],
  
  // CDN入口配置
  "unpkg": "./dist/index.umd.js",
  "jsdelivr": "./dist/index.min.js",
  
  // 浏览器兼容性配置
  "browserslist": [
    "> 1%",
    "last 2 versions",
    "not dead",
    "not ie <= 11"
  ],
  
  // ES模块导出映射
  "exports": {
    ".": {
      "import": "./dist/index.esm.js",
      "require": "./dist/index.cjs.js",
      "browser": "./dist/index.browser.js"
    },
    "./package.json": "./package.json",
    "./feature": {
      "import": "./dist/feature.esm.js",
      "require": "./dist/feature.cjs.js"
    }
  }
}
```

## 完整示例

```json
{
  "name": "@mycompany/awesome-utils",
  "version": "2.1.0",
  "description": "企业级JavaScript工具库",
  "keywords": ["utils", "helpers", "enterprise"],
  "homepage": "https://github.com/mycompany/awesome-utils",
  "bugs": "https://github.com/mycompany/awesome-utils/issues",
  "license": "MIT",
  "author": "MyCompany <dev@mycompany.com>",
  "files": [
    "dist",
    "src",
    "!src/**/*.test.js"
  ],
  "main": "./dist/index.js",
  "module": "./dist/index.esm.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.esm.js",
      "require": "./dist/index.js"
    }
  },
  "bin": {
    "awesome-cli": "./bin/cli.js"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/mycompany/awesome-utils.git"
  },
  "scripts": {
    "build": "rollup -c",
    "test": "jest",
    "lint": "eslint src",
    "prepublishOnly": "npm run lint && npm test && npm run build"
  },
  "dependencies": {
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "@rollup/plugin-node-resolve": "^15.0.0",
    "eslint": "^8.0.0",
    "jest": "^29.0.0",
    "rollup": "^3.0.0"
  },
  "peerDependencies": {
    "react": ">=16.8.0"
  },
  "peerDependenciesMeta": {
    "react": {
      "optional": true
    }
  },
  "engines": {
    "node": ">=14.0.0"
  },
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/"
  },
  "sideEffects": false
}
```

## 版本号规范

```json
{
  "dependencies": {
    // 精确版本
    "exact": "1.2.3",
    
    // 补丁版本范围 (>=1.2.3 <1.3.0)
    "patch": "~1.2.3",
    
    // 次版本范围 (>=1.2.3 <2.0.0)
    "minor": "^1.2.3",
    
    // 主版本范围 (>=1.0.0 <2.0.0)
    "major": "1.x",
    
    // 任意版本
    "any": "*",
    
    // 最新版本
    "latest": "latest",
    
    // 范围组合
    "range": ">=1.2.3 <2.0.0",
    
    // 或条件
    "or": "1.2.3 || >=2.0.0",
    
    // Git依赖
    "git": "git://github.com/user/repo.git#branch",
    
    // 本地文件
    "file": "file:../local-module",
    
    // 本地链接
    "link": "link:../local-module"
  }
}
```

## 最佳实践

1. **必填字段**：name和version是必须的
2. **描述清晰**：description要简洁明了
3. **关键词准确**：keywords有助于包的发现
4. **版本规范**：严格遵循语义化版本
5. **依赖精简**：只添加必要的依赖
6. **文件控制**：使用files字段控制发布内容
7. **脚本规范**：保持脚本命名的一致性
8. **文档完善**：确保README和文档的完整性