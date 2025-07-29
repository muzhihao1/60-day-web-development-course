---
title: "开发工作流配置"
category: "workflow"
language: "javascript"
---

# 开发工作流配置

## ESLint完整配置

```javascript
// .eslintrc.js - 企业级ESLint配置
module.exports = {
    root: true,
    
    env: {
        browser: true,
        es2021: true,
        node: true,
        jest: true
    },
    
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:jsx-a11y/recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',
        'plugin:promise/recommended',
        'plugin:sonarjs/recommended',
        'plugin:unicorn/recommended',
        'airbnb',
        'airbnb-typescript',
        'prettier'
    ],
    
    parser: '@typescript-eslint/parser',
    
    parserOptions: {
        ecmaFeatures: {
            jsx: true
        },
        ecmaVersion: 2021,
        sourceType: 'module',
        project: ['./tsconfig.json', './tsconfig.node.json'],
        tsconfigRootDir: __dirname
    },
    
    plugins: [
        'react',
        'react-hooks',
        '@typescript-eslint',
        'jsx-a11y',
        'import',
        'promise',
        'sonarjs',
        'unicorn',
        'prettier'
    ],
    
    settings: {
        react: {
            version: 'detect'
        },
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts', '.tsx']
        },
        'import/resolver': {
            typescript: {
                alwaysTryTypes: true,
                project: './tsconfig.json'
            },
            node: {
                extensions: ['.js', '.jsx', '.ts', '.tsx']
            }
        }
    },
    
    rules: {
        // TypeScript规则
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': ['error', {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_'
        }],
        '@typescript-eslint/naming-convention': [
            'error',
            {
                selector: 'interface',
                format: ['PascalCase']
            },
            {
                selector: 'typeAlias',
                format: ['PascalCase']
            },
            {
                selector: 'enum',
                format: ['PascalCase']
            },
            {
                selector: 'variable',
                types: ['boolean'],
                format: ['PascalCase'],
                prefix: ['is', 'should', 'has', 'can', 'did', 'will']
            }
        ],
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/no-misused-promises': 'error',
        '@typescript-eslint/await-thenable': 'error',
        '@typescript-eslint/no-unnecessary-type-assertion': 'error',
        '@typescript-eslint/prefer-nullish-coalescing': 'error',
        '@typescript-eslint/prefer-optional-chain': 'error',
        
        // React规则
        'react/jsx-filename-extension': ['error', { 
            extensions: ['.tsx', '.jsx'] 
        }],
        'react/jsx-props-no-spreading': 'off',
        'react/prop-types': 'off',
        'react/require-default-props': 'off',
        'react/react-in-jsx-scope': 'off',
        'react/function-component-definition': ['error', {
            namedComponents: 'arrow-function',
            unnamedComponents: 'arrow-function'
        }],
        'react/jsx-sort-props': ['error', {
            callbacksLast: true,
            shorthandFirst: true,
            ignoreCase: true,
            reservedFirst: true
        }],
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
        
        // Import规则
        'import/prefer-default-export': 'off',
        'import/no-default-export': 'error',
        'import/order': ['error', {
            groups: [
                'builtin',
                'external',
                'internal',
                ['parent', 'sibling'],
                'index',
                'object',
                'type'
            ],
            pathGroups: [
                {
                    pattern: 'react',
                    group: 'external',
                    position: 'before'
                },
                {
                    pattern: '@/**',
                    group: 'internal',
                    position: 'after'
                }
            ],
            pathGroupsExcludedImportTypes: ['react'],
            'newlines-between': 'always',
            alphabetize: {
                order: 'asc',
                caseInsensitive: true
            }
        }],
        'import/no-cycle': 'error',
        'import/no-unused-modules': 'error',
        
        // 通用规则
        'no-console': ['warn', { 
            allow: ['warn', 'error', 'info'] 
        }],
        'no-debugger': 'error',
        'no-alert': 'error',
        'no-var': 'error',
        'prefer-const': 'error',
        'prefer-destructuring': ['error', {
            array: true,
            object: true
        }],
        'no-nested-ternary': 'error',
        'no-unneeded-ternary': 'error',
        'no-param-reassign': ['error', {
            props: true,
            ignorePropertyModificationsFor: ['state']
        }],
        
        // Promise规则
        'promise/always-return': 'error',
        'promise/no-return-wrap': 'error',
        'promise/param-names': 'error',
        'promise/catch-or-return': 'error',
        'promise/no-native': 'off',
        'promise/no-nesting': 'warn',
        'promise/no-promise-in-callback': 'warn',
        'promise/no-callback-in-promise': 'warn',
        
        // 代码质量规则
        'sonarjs/cognitive-complexity': ['error', 15],
        'sonarjs/no-duplicate-string': ['error', 3],
        'sonarjs/no-identical-functions': 'error',
        'sonarjs/no-collapsible-if': 'error',
        
        // Unicorn规则
        'unicorn/filename-case': ['error', {
            cases: {
                camelCase: true,
                pascalCase: true,
                kebabCase: true
            }
        }],
        'unicorn/prevent-abbreviations': 'off',
        'unicorn/no-null': 'off',
        'unicorn/no-array-reduce': 'off',
        
        // 可访问性规则
        'jsx-a11y/anchor-is-valid': ['error', {
            components: ['Link'],
            specialLink: ['to']
        }],
        'jsx-a11y/click-events-have-key-events': 'error',
        'jsx-a11y/no-static-element-interactions': 'error',
        
        // 性能规则
        'react/jsx-no-bind': ['error', {
            allowArrowFunctions: true,
            allowBind: false,
            ignoreRefs: true
        }],
        'react/no-array-index-key': 'warn',
        
        // Prettier集成
        'prettier/prettier': ['error', {}, {
            usePrettierrc: true
        }]
    },
    
    overrides: [
        // 测试文件规则
        {
            files: ['**/__tests__/**/*', '**/*.{test,spec}.{js,jsx,ts,tsx}'],
            env: {
                jest: true
            },
            rules: {
                '@typescript-eslint/no-explicit-any': 'off',
                'import/no-extraneous-dependencies': 'off',
                'sonarjs/no-duplicate-string': 'off'
            }
        },
        
        // 配置文件规则
        {
            files: ['*.config.{js,ts}', '.*rc.js'],
            rules: {
                'import/no-default-export': 'off',
                'unicorn/prefer-module': 'off'
            }
        }
    ]
};
```

## Prettier & EditorConfig

```javascript
// .prettierrc.js - Prettier配置
module.exports = {
    // 基础格式化规则
    printWidth: 100,
    tabWidth: 4,
    useTabs: false,
    semi: true,
    singleQuote: true,
    quoteProps: 'as-needed',
    jsxSingleQuote: false,
    trailingComma: 'all',
    bracketSpacing: true,
    bracketSameLine: false,
    arrowParens: 'always',
    rangeStart: 0,
    rangeEnd: Infinity,
    requirePragma: false,
    insertPragma: false,
    proseWrap: 'preserve',
    htmlWhitespaceSensitivity: 'css',
    vueIndentScriptAndStyle: false,
    endOfLine: 'lf',
    embeddedLanguageFormatting: 'auto',
    singleAttributePerLine: false,
    
    // 文件特定配置
    overrides: [
        {
            files: '*.md',
            options: {
                printWidth: 80,
                proseWrap: 'always',
                tabWidth: 2
            }
        },
        {
            files: ['*.json', '*.yml', '*.yaml'],
            options: {
                tabWidth: 2
            }
        },
        {
            files: '*.css',
            options: {
                singleQuote: false
            }
        },
        {
            files: ['*.tsx', '*.jsx'],
            options: {
                jsxSingleQuote: true
            }
        }
    ]
};

// .prettierignore
// # Dependencies
// node_modules/
// pnpm-lock.yaml
// yarn.lock
// package-lock.json
// 
// # Production
// dist/
// build/
// out/
// .next/
// .nuxt/
// 
// # Testing
// coverage/
// .nyc_output/
// 
// # Misc
// .DS_Store
// *.pem
// 
// # Debug
// npm-debug.log*
// yarn-debug.log*
// yarn-error.log*
// 
// # Local env files
// .env*.local
// 
// # Generated files
// *.generated.*
// CHANGELOG.md

// .editorconfig - 编辑器配置
`root = true

[*]
indent_style = space
indent_size = 4
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
max_line_length = 100

[*.{md,markdown}]
trim_trailing_whitespace = false
max_line_length = 80

[*.{yml,yaml,json}]
indent_size = 2

[*.{js,jsx,ts,tsx}]
quote_type = single

[Makefile]
indent_style = tab`;
```

## Git Hooks配置

```javascript
// .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# 运行lint-staged
npx lint-staged

# 运行类型检查
npm run type-check

# .husky/commit-msg
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# 运行commitlint
npx --no -- commitlint --edit "$1"

// .husky/pre-push
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# 运行测试
npm test -- --passWithNoTests

# 检查构建
npm run build

// lint-staged.config.js
module.exports = {
    // JavaScript/TypeScript文件
    '*.{js,jsx,ts,tsx}': [
        'eslint --fix --max-warnings=0',
        'prettier --write',
        'jest --bail --findRelatedTests --passWithNoTests'
    ],
    
    // 样式文件
    '*.{css,scss,sass,less}': [
        'stylelint --fix',
        'prettier --write'
    ],
    
    // JSON文件
    '*.json': [
        'prettier --write'
    ],
    
    // Markdown文件
    '*.md': [
        'markdownlint --fix',
        'prettier --write'
    ],
    
    // YAML文件
    '*.{yml,yaml}': [
        'prettier --write'
    ],
    
    // 包文件
    'package.json': [
        'npm-package-json-lint',
        'prettier --write'
    ]
};

// commitlint.config.js
module.exports = {
    extends: ['@commitlint/config-conventional'],
    
    rules: {
        // 类型枚举
        'type-enum': [2, 'always', [
            'feat',       // 新功能
            'fix',        // 修复bug
            'docs',       // 文档修改
            'style',      // 代码格式修改
            'refactor',   // 代码重构
            'perf',       // 性能优化
            'test',       // 测试
            'build',      // 构建系统或依赖项修改
            'ci',         // CI配置修改
            'chore',      // 其他修改
            'revert',     // 回滚提交
            'wip',        // 开发中
            'types'       // 类型定义文件修改
        ]],
        
        // 类型格式
        'type-case': [2, 'always', 'lower-case'],
        
        // 主题规则
        'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
        'subject-empty': [2, 'never'],
        'subject-full-stop': [2, 'never', '.'],
        'subject-max-length': [2, 'always', 100],
        
        // 正文规则
        'body-leading-blank': [1, 'always'],
        'body-max-line-length': [2, 'always', 100],
        
        // 页脚规则
        'footer-leading-blank': [1, 'always'],
        'footer-max-line-length': [2, 'always', 100],
        
        // 自定义规则
        'header-max-length': [2, 'always', 100],
        'scope-case': [2, 'always', 'lower-case'],
        'scope-enum': [2, 'always', [
            'components',
            'hooks',
            'utils',
            'styles',
            'types',
            'config',
            'deps',
            'other'
        ]]
    },
    
    prompt: {
        questions: {
            type: {
                description: '请选择提交类型:',
                enum: {
                    feat: {
                        description: '新功能',
                        title: 'Features',
                        emoji: '✨'
                    },
                    fix: {
                        description: '修复bug',
                        title: 'Bug Fixes',
                        emoji: '🐛'
                    },
                    docs: {
                        description: '文档修改',
                        title: 'Documentation',
                        emoji: '📚'
                    },
                    style: {
                        description: '代码格式（不影响功能）',
                        title: 'Styles',
                        emoji: '💎'
                    },
                    refactor: {
                        description: '重构（既不是新功能也不是修复bug）',
                        title: 'Code Refactoring',
                        emoji: '📦'
                    },
                    perf: {
                        description: '性能优化',
                        title: 'Performance Improvements',
                        emoji: '🚀'
                    },
                    test: {
                        description: '增加测试',
                        title: 'Tests',
                        emoji: '🚨'
                    },
                    build: {
                        description: '影响构建系统或外部依赖项的更改',
                        title: 'Builds',
                        emoji: '🛠'
                    },
                    ci: {
                        description: 'CI配置文件和脚本的更改',
                        title: 'Continuous Integrations',
                        emoji: '⚙️'
                    },
                    chore: {
                        description: '其他不修改src或测试文件的更改',
                        title: 'Chores',
                        emoji: '♻️'
                    },
                    revert: {
                        description: '回滚之前的提交',
                        title: 'Reverts',
                        emoji: '🗑'
                    }
                }
            },
            scope: {
                description: '此更改的范围是什么（例如组件或文件名）:'
            },
            subject: {
                description: '写一个简短的、命令式的更改描述:'
            },
            body: {
                description: '提供更详细的更改描述（可选）。使用"|"换行:'
            },
            isBreaking: {
                description: '是否有任何重大更改？'
            },
            breakingBody: {
                description: '重大更改提交需要一个正文。请输入提交本身的更详细描述:'
            },
            breaking: {
                description: '描述重大更改:'
            },
            isIssueAffected: {
                description: '此更改是否影响任何未解决的问题？'
            },
            issuesBody: {
                description: '如果问题已解决，提交需要一个正文。请输入提交本身的更详细描述:'
            },
            issues: {
                description: '添加问题引用（例如"fix #123", "re #123"）:'
            }
        }
    }
};
```

## StyleLint配置

```javascript
// .stylelintrc.js
module.exports = {
    extends: [
        'stylelint-config-standard',
        'stylelint-config-standard-scss',
        'stylelint-config-recommended-vue',
        'stylelint-config-prettier'
    ],
    
    plugins: [
        'stylelint-order',
        'stylelint-declaration-block-no-ignored-properties',
        'stylelint-scss'
    ],
    
    rules: {
        // 基础规则
        'color-hex-case': 'lower',
        'color-hex-length': 'short',
        'color-named': 'never',
        'color-no-invalid-hex': true,
        
        // 字体规则
        'font-family-name-quotes': 'always-where-recommended',
        'font-weight-notation': 'numeric',
        
        // 函数规则
        'function-calc-no-unspaced-operator': true,
        'function-comma-space-after': 'always-single-line',
        'function-comma-space-before': 'never',
        'function-name-case': 'lower',
        'function-url-quotes': 'always',
        
        // 数字规则
        'number-leading-zero': 'always',
        'number-no-trailing-zeros': true,
        'length-zero-no-unit': true,
        
        // 字符串规则
        'string-quotes': 'single',
        
        // 单位规则
        'unit-case': 'lower',
        'unit-no-unknown': true,
        
        // 值规则
        'value-keyword-case': 'lower',
        'value-list-comma-space-after': 'always-single-line',
        'value-list-comma-space-before': 'never',
        
        // 属性规则
        'property-case': 'lower',
        'property-no-unknown': [true, {
            ignoreProperties: ['composes']
        }],
        
        // 声明规则
        'declaration-colon-space-after': 'always-single-line',
        'declaration-colon-space-before': 'never',
        'declaration-block-trailing-semicolon': 'always',
        'declaration-block-no-duplicate-properties': true,
        'declaration-block-no-shorthand-property-overrides': true,
        
        // 选择器规则
        'selector-attribute-brackets-space-inside': 'never',
        'selector-attribute-operator-space-after': 'never',
        'selector-attribute-operator-space-before': 'never',
        'selector-combinator-space-after': 'always',
        'selector-combinator-space-before': 'always',
        'selector-pseudo-class-case': 'lower',
        'selector-pseudo-element-case': 'lower',
        'selector-type-case': 'lower',
        'selector-max-id': 0,
        'selector-class-pattern': '^[a-z][a-zA-Z0-9]+$',
        
        // 规则规则
        'rule-empty-line-before': ['always', {
            except: ['first-nested'],
            ignore: ['after-comment']
        }],
        
        // 媒体查询规则
        'media-feature-colon-space-after': 'always',
        'media-feature-colon-space-before': 'never',
        'media-feature-parentheses-space-inside': 'never',
        
        // 注释规则
        'comment-whitespace-inside': 'always',
        'comment-empty-line-before': ['always', {
            except: ['first-nested'],
            ignore: ['stylelint-commands']
        }],
        
        // 通用规则
        'indentation': 4,
        'max-empty-lines': 2,
        'no-eol-whitespace': true,
        'no-missing-end-of-source-newline': true,
        
        // SCSS规则
        'scss/at-import-no-partial-leading-underscore': true,
        'scss/at-mixin-pattern': '^[a-z][a-zA-Z0-9]+$',
        'scss/at-function-pattern': '^[a-z][a-zA-Z0-9]+$',
        'scss/dollar-variable-pattern': '^[a-z][a-zA-Z0-9]+$',
        'scss/percent-placeholder-pattern': '^[a-z][a-zA-Z0-9]+$',
        
        // 顺序规则
        'order/order': [
            'custom-properties',
            'dollar-variables',
            {
                type: 'at-rule',
                name: 'extend'
            },
            {
                type: 'at-rule',
                name: 'include',
                hasBlock: false
            },
            'declarations',
            {
                type: 'at-rule',
                name: 'include',
                hasBlock: true
            },
            'rules'
        ],
        
        'order/properties-order': [
            // 布局属性
            'position',
            'z-index',
            'top',
            'right',
            'bottom',
            'left',
            
            // 盒模型
            'display',
            'visibility',
            'float',
            'clear',
            'overflow',
            'overflow-x',
            'overflow-y',
            'clip',
            'zoom',
            
            // Flexbox
            'flex',
            'flex-direction',
            'flex-order',
            'flex-pack',
            'flex-align',
            
            // Grid
            'grid',
            'grid-template',
            'grid-template-columns',
            'grid-template-rows',
            
            // 尺寸
            'width',
            'min-width',
            'max-width',
            'height',
            'min-height',
            'max-height',
            
            // 间距
            'padding',
            'padding-top',
            'padding-right',
            'padding-bottom',
            'padding-left',
            'margin',
            'margin-top',
            'margin-right',
            'margin-bottom',
            'margin-left',
            
            // 文本
            'font',
            'font-family',
            'font-size',
            'font-weight',
            'font-style',
            'font-variant',
            'font-size-adjust',
            'font-stretch',
            'font-effect',
            'font-emphasize',
            'font-emphasize-position',
            'font-emphasize-style',
            'font-smooth',
            'line-height',
            'text-align',
            'text-align-last',
            'vertical-align',
            'white-space',
            'text-decoration',
            'text-emphasis',
            'text-emphasis-color',
            'text-emphasis-style',
            'text-emphasis-position',
            'text-indent',
            'text-justify',
            'letter-spacing',
            'word-spacing',
            'text-outline',
            'text-transform',
            'text-wrap',
            'text-overflow',
            'text-overflow-ellipsis',
            'text-overflow-mode',
            'word-wrap',
            'word-break',
            
            // 视觉
            'color',
            'background',
            'background-color',
            'background-image',
            'background-repeat',
            'background-attachment',
            'background-position',
            'background-position-x',
            'background-position-y',
            'background-clip',
            'background-origin',
            'background-size',
            'border',
            'border-width',
            'border-style',
            'border-color',
            'border-top',
            'border-top-width',
            'border-top-style',
            'border-top-color',
            'border-right',
            'border-right-width',
            'border-right-style',
            'border-right-color',
            'border-bottom',
            'border-bottom-width',
            'border-bottom-style',
            'border-bottom-color',
            'border-left',
            'border-left-width',
            'border-left-style',
            'border-left-color',
            'border-radius',
            'border-top-left-radius',
            'border-top-right-radius',
            'border-bottom-right-radius',
            'border-bottom-left-radius',
            'border-image',
            'border-image-source',
            'border-image-slice',
            'border-image-width',
            'border-image-outset',
            'border-image-repeat',
            'outline',
            'outline-width',
            'outline-style',
            'outline-color',
            'outline-offset',
            'box-shadow',
            'box-decoration-break',
            'transform',
            'transform-origin',
            'transform-style',
            'backface-visibility',
            'perspective',
            'perspective-origin',
            'visibility',
            'cursor',
            'opacity',
            'filter',
            'backdrop-filter',
            
            // 动画
            'transition',
            'transition-delay',
            'transition-timing-function',
            'transition-duration',
            'transition-property',
            'animation',
            'animation-name',
            'animation-duration',
            'animation-play-state',
            'animation-timing-function',
            'animation-delay',
            'animation-iteration-count',
            'animation-direction',
            'animation-fill-mode',
            
            // 其他
            'content',
            'quotes',
            'counter-reset',
            'counter-increment',
            'resize',
            'user-select',
            'nav-index',
            'nav-up',
            'nav-right',
            'nav-down',
            'nav-left',
            'pointer-events',
            'will-change',
            'clip-path',
            'mask'
        ]
    },
    
    ignoreFiles: [
        '**/*.js',
        '**/*.jsx',
        '**/*.tsx',
        '**/*.ts',
        '**/*.json',
        '**/*.md',
        'node_modules/**/*',
        'dist/**/*',
        'build/**/*'
    ]
};
```

## npm Scripts最佳实践

```json
{
  "scripts": {
    // 开发脚本
    "dev": "vite",
    "start": "npm run dev",
    "serve": "vite preview",
    
    // 构建脚本
    "build": "run-s clean type-check build:client",
    "build:client": "vite build",
    "build:analyze": "cross-env ANALYZE=true npm run build",
    "clean": "rimraf dist coverage .turbo",
    
    // 代码质量脚本
    "lint": "run-p lint:*",
    "lint:js": "eslint . --ext .js,.jsx,.ts,.tsx --cache --cache-location node_modules/.cache/eslint/",
    "lint:css": "stylelint \"src/**/*.{css,scss,sass}\" --cache --cache-location node_modules/.cache/stylelint/",
    "lint:md": "markdownlint \"**/*.md\" --ignore node_modules --ignore dist",
    "lint:fix": "run-p \"lint:* -- --fix\"",
    
    // 格式化脚本
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    
    // 类型检查
    "type-check": "tsc --noEmit",
    "type-check:watch": "tsc --noEmit --watch",
    
    // 测试脚本
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    
    // Git Hooks
    "prepare": "husky install",
    "pre-commit": "lint-staged",
    "commit": "cz",
    
    // 发布脚本
    "release": "standard-version",
    "release:minor": "standard-version --release-as minor",
    "release:patch": "standard-version --release-as patch",
    "release:major": "standard-version --release-as major",
    
    // 工具脚本
    "deps:check": "npm-check-updates",
    "deps:update": "npm-check-updates -u && npm install",
    "size": "size-limit",
    "analyze": "source-map-explorer 'dist/**/*.js'",
    
    // 复合脚本
    "ci": "run-s clean lint type-check test:ci build",
    "validate": "run-p lint type-check test",
    "preinstall": "npx only-allow pnpm"
  },
  
  "config": {
    "commitizen": {
      "path": "./node_modules/cz-conventional-changelog"
    }
  },
  
  "size-limit": [
    {
      "path": "dist/**/*.js",
      "limit": "500 KB"
    }
  ]
}
```