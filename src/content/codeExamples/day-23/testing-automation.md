---
title: "测试与自动化"
category: "testing"
language: "javascript"
---

# 测试与自动化

## Jest高级配置

```javascript
// jest.config.js - 企业级Jest配置
module.exports = {
    // 测试环境
    testEnvironment: 'jsdom',
    testEnvironmentOptions: {
        url: 'http://localhost:3000'
    },
    
    // 根目录
    roots: ['<rootDir>/src'],
    
    // 模块目录
    moduleDirectories: ['node_modules', 'src'],
    
    // 文件扩展名
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
    
    // 测试文件匹配
    testMatch: [
        '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
        '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}'
    ],
    
    // 忽略路径
    testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        '/build/',
        '/.next/',
        '/.cache/'
    ],
    
    // 转换配置
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
            presets: [
                ['@babel/preset-env', { targets: { node: 'current' } }],
                '@babel/preset-react',
                '@babel/preset-typescript'
            ]
        }],
        '^.+\\.css$': '<rootDir>/config/jest/cssTransform.js',
        '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '<rootDir>/config/jest/fileTransform.js'
    },
    
    // 转换忽略
    transformIgnorePatterns: [
        '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|ts|tsx)$',
        '^.+\\.module\\.(css|sass|scss)$'
    ],
    
    // 模块名映射
    moduleNameMapper: {
        // 静态资源模拟
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 
            '<rootDir>/__mocks__/fileMock.js',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        
        // 路径别名
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@components/(.*)$': '<rootDir>/src/components/$1',
        '^@utils/(.*)$': '<rootDir>/src/utils/$1',
        '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
        '^@services/(.*)$': '<rootDir>/src/services/$1',
        '^@types/(.*)$': '<rootDir>/src/types/$1'
    },
    
    // 设置文件
    setupFilesAfterEnv: [
        '<rootDir>/src/setupTests.ts',
        '@testing-library/jest-dom/extend-expect'
    ],
    
    // 覆盖率配置
    collectCoverage: false,
    collectCoverageFrom: [
        'src/**/*.{js,jsx,ts,tsx}',
        '!src/**/*.d.ts',
        '!src/index.tsx',
        '!src/serviceWorker.ts',
        '!src/**/*.stories.{js,jsx,ts,tsx}',
        '!src/**/__tests__/**',
        '!src/**/*.{spec,test}.{js,jsx,ts,tsx}'
    ],
    coverageDirectory: '<rootDir>/coverage',
    coverageReporters: ['json', 'lcov', 'text', 'html', 'cobertura'],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        },
        './src/components/': {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: 90
        },
        './src/utils/': {
            branches: 95,
            functions: 95,
            lines: 95,
            statements: 95
        }
    },
    
    // 全局配置
    globals: {
        'ts-jest': {
            tsconfig: {
                jsx: 'react'
            }
        }
    },
    
    // 监听插件
    watchPlugins: [
        'jest-watch-typeahead/filename',
        'jest-watch-typeahead/testname'
    ],
    
    // 其他配置
    clearMocks: true,
    restoreMocks: true,
    resetMocks: true,
    timers: 'fake',
    maxWorkers: '50%',
    verbose: true,
    errorOnDeprecated: true,
    
    // 项目配置
    projects: [
        {
            displayName: 'dom',
            testEnvironment: 'jsdom',
            testMatch: ['<rootDir>/src/**/*.test.{js,jsx,ts,tsx}']
        },
        {
            displayName: 'node',
            testEnvironment: 'node',
            testMatch: ['<rootDir>/server/**/*.test.{js,ts}']
        }
    ],
    
    // 报告器
    reporters: [
        'default',
        [
            'jest-junit',
            {
                outputDirectory: '<rootDir>/test-results/jest',
                outputName: 'junit.xml',
                classNameTemplate: '{classname}',
                titleTemplate: '{title}',
                ancestorSeparator: ' › ',
                usePathForSuiteName: true
            }
        ],
        [
            'jest-html-reporter',
            {
                pageTitle: 'Test Report',
                outputPath: '<rootDir>/test-results/jest/index.html',
                includeFailureMsg: true,
                includeConsoleLog: true
            }
        ]
    ]
};

// src/setupTests.ts - 测试环境设置
import '@testing-library/jest-dom';
import 'jest-canvas-mock';
import { configure } from '@testing-library/react';
import { server } from './mocks/server';

// 配置Testing Library
configure({ 
    testIdAttribute: 'data-testid',
    asyncUtilTimeout: 2000
});

// 设置MSW
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// 全局Mock
global.matchMedia = global.matchMedia || function() {
    return {
        matches: false,
        addListener: jest.fn(),
        removeListener: jest.fn()
    };
};

// IntersectionObserver Mock
global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
};

// 环境变量
process.env.NODE_ENV = 'test';
process.env.PUBLIC_URL = '';
```

## Testing Library最佳实践

```javascript
// __tests__/components/UserProfile.test.tsx
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter } from 'react-router-dom';
import { UserProfile } from '@/components/UserProfile';
import { AuthProvider } from '@/contexts/AuthContext';
import { createMockUser } from '@/test-utils/factories';

// MSW服务器设置
const server = setupServer(
    rest.get('/api/users/:id', (req, res, ctx) => {
        const { id } = req.params;
        return res(
            ctx.json(createMockUser({ id }))
        );
    }),
    
    rest.put('/api/users/:id', async (req, res, ctx) => {
        const body = await req.json();
        return res(
            ctx.json({ ...createMockUser(), ...body })
        );
    })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// 测试工具函数
const renderWithProviders = (ui: React.ReactElement, options = {}) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                cacheTime: 0
            }
        }
    });
    
    const AllProviders = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <MemoryRouter>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </MemoryRouter>
        </QueryClientProvider>
    );
    
    return render(ui, { wrapper: AllProviders, ...options });
};

describe('UserProfile', () => {
    const user = userEvent.setup();
    
    it('应该正确显示用户信息', async () => {
        renderWithProviders(<UserProfile userId="123" />);
        
        // 等待数据加载
        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /john doe/i })).toBeInTheDocument();
        });
        
        // 验证显示内容
        expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByLabelText('用户头像')).toHaveAttribute('src', expect.stringContaining('avatar'));
    });
    
    it('应该处理编辑模式', async () => {
        renderWithProviders(<UserProfile userId="123" />);
        
        // 等待加载完成
        await screen.findByRole('heading', { name: /john doe/i });
        
        // 点击编辑按钮
        const editButton = screen.getByRole('button', { name: /编辑/i });
        await user.click(editButton);
        
        // 验证进入编辑模式
        expect(screen.getByLabelText('姓名')).toBeInTheDocument();
        expect(screen.getByLabelText('邮箱')).toBeInTheDocument();
        
        // 修改内容
        const nameInput = screen.getByLabelText('姓名');
        await user.clear(nameInput);
        await user.type(nameInput, 'Jane Smith');
        
        // 保存更改
        const saveButton = screen.getByRole('button', { name: /保存/i });
        await user.click(saveButton);
        
        // 验证更新成功
        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /jane smith/i })).toBeInTheDocument();
        });
    });
    
    it('应该处理加载错误', async () => {
        // 模拟错误响应
        server.use(
            rest.get('/api/users/:id', (req, res, ctx) => {
                return res(ctx.status(500), ctx.json({ error: '服务器错误' }));
            })
        );
        
        renderWithProviders(<UserProfile userId="123" />);
        
        // 验证错误提示
        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent('加载失败');
        });
        
        // 验证重试按钮
        const retryButton = screen.getByRole('button', { name: /重试/i });
        expect(retryButton).toBeInTheDocument();
    });
    
    it('应该支持键盘导航', async () => {
        renderWithProviders(<UserProfile userId="123" />);
        
        await screen.findByRole('heading', { name: /john doe/i });
        
        // Tab导航测试
        await user.tab();
        expect(screen.getByRole('button', { name: /编辑/i })).toHaveFocus();
        
        // Enter键测试
        await user.keyboard('{Enter}');
        expect(screen.getByLabelText('姓名')).toBeInTheDocument();
        
        // Escape键测试
        await user.keyboard('{Escape}');
        expect(screen.queryByLabelText('姓名')).not.toBeInTheDocument();
    });
    
    it('应该满足可访问性要求', async () => {
        const { container } = renderWithProviders(<UserProfile userId="123" />);
        
        await screen.findByRole('heading', { name: /john doe/i });
        
        // 运行可访问性测试
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});

// 自定义测试工具
// test-utils/index.tsx
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter, MemoryRouterProps } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import { theme } from '@/styles/theme';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
    routerProps?: MemoryRouterProps;
    queryClient?: QueryClient;
}

const customRender = (
    ui: ReactElement,
    options?: CustomRenderOptions
) => {
    const {
        routerProps = {},
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false }
            }
        }),
        ...renderOptions
    } = options || {};
    
    const AllTheProviders = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <MemoryRouter {...routerProps}>
                <ThemeProvider theme={theme}>
                    {children}
                </ThemeProvider>
            </MemoryRouter>
        </QueryClientProvider>
    );
    
    return render(ui, { wrapper: AllTheProviders, ...renderOptions });
};

// 重新导出所有内容
export * from '@testing-library/react';
export { customRender as render };
```

## CI/CD自动化配置

```yaml
# .github/workflows/ci-cd.yml - GitHub Actions完整配置
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop, release/*]
  pull_request:
    branches: [main, develop]
  schedule:
    - cron: '0 0 * * 0' # 每周日午夜运行
  workflow_dispatch: # 允许手动触发

env:
  NODE_VERSION: '18.x'
  PNPM_VERSION: 8

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  # 依赖安装和缓存
  setup:
    name: Setup
    runs-on: ubuntu-latest
    outputs:
      cache-key: ${{ steps.cache-key.outputs.key }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Get pnpm store directory
        id: pnpm-cache
        shell: bash
        run: |
          echo "STORE_PATH=$(pnpm store path)" >> $GITHUB_OUTPUT

      - name: Setup pnpm cache
        uses: actions/cache@v3
        with:
          path: ${{ steps.pnpm-cache.outputs.STORE_PATH }}
          key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-store-

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Generate cache key
        id: cache-key
        run: echo "key=${{ runner.os }}-${{ hashFiles('**/pnpm-lock.yaml') }}" >> $GITHUB_OUTPUT

  # 代码质量检查
  quality:
    name: Code Quality
    needs: setup
    runs-on: ubuntu-latest
    strategy:
      matrix:
        task: [lint, type-check, format]
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup environment
        uses: ./.github/actions/setup-env
        with:
          node-version: ${{ env.NODE_VERSION }}
          pnpm-version: ${{ env.PNPM_VERSION }}

      - name: Run ${{ matrix.task }}
        run: pnpm run ${{ matrix.task }}

      - name: Upload ${{ matrix.task }} results
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: ${{ matrix.task }}-results
          path: |
            .eslintcache
            tsconfig.tsbuildinfo

  # 测试
  test:
    name: Test
    needs: setup
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node: [16, 18, 20]
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup environment
        uses: ./.github/actions/setup-env
        with:
          node-version: ${{ matrix.node }}
          pnpm-version: ${{ env.PNPM_VERSION }}

      - name: Run unit tests
        run: pnpm test:ci

      - name: Upload coverage
        if: matrix.os == 'ubuntu-latest' && matrix.node == '18'
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results-${{ matrix.os }}-node${{ matrix.node }}
          path: |
            coverage/
            test-results/

  # E2E测试
  e2e:
    name: E2E Tests
    needs: [quality, test]
    runs-on: ubuntu-latest
    container:
      image: mcr.microsoft.com/playwright:v1.40.0-focal
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup environment
        uses: ./.github/actions/setup-env
        with:
          node-version: ${{ env.NODE_VERSION }}
          pnpm-version: ${{ env.PNPM_VERSION }}

      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

  # 构建
  build:
    name: Build
    needs: [quality, test]
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup environment
        uses: ./.github/actions/setup-env
        with:
          node-version: ${{ env.NODE_VERSION }}
          pnpm-version: ${{ env.PNPM_VERSION }}

      - name: Build application
        run: pnpm build
        env:
          NODE_ENV: production

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-artifacts
          path: dist/

      - name: Analyze bundle
        run: pnpm analyze

      - name: Upload bundle report
        uses: actions/upload-artifact@v3
        with:
          name: bundle-report
          path: dist/report.html

  # 安全扫描
  security:
    name: Security Scan
    needs: setup
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Run security audit
        run: pnpm audit

      - name: Run Snyk scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

      - name: Run SAST scan
        uses: github/super-linter@v5
        env:
          DEFAULT_BRANCH: main
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  # 部署到预发布环境
  deploy-staging:
    name: Deploy to Staging
    needs: [build, e2e, security]
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://staging.example.com
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-artifacts
          path: dist/

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Staging deployment ${{ job.status }}'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        if: always()

  # 部署到生产环境
  deploy-production:
    name: Deploy to Production
    needs: [build, e2e, security]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://example.com
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-artifacts
          path: dist/

      - name: Deploy to AWS S3
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_DEFAULT_REGION: us-east-1
        run: |
          aws s3 sync dist/ s3://${{ secrets.S3_BUCKET }} --delete
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"

      - name: Run smoke tests
        run: pnpm test:smoke
        env:
          BASE_URL: https://example.com

      - name: Create release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: v${{ github.run_number }}
          release_name: Release v${{ github.run_number }}
          draft: false
          prerelease: false

# .gitlab-ci.yml - GitLab CI配置
stages:
  - setup
  - quality
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "18"
  PNPM_VERSION: "8"
  FF_USE_FASTZIP: "true"
  ARTIFACT_COMPRESSION_LEVEL: "fast"
  CACHE_COMPRESSION_LEVEL: "fast"

.base:
  image: node:${NODE_VERSION}-alpine
  before_script:
    - apk add --no-cache git
    - npm install -g pnpm@${PNPM_VERSION}
    - pnpm config set store-dir .pnpm-store
    - pnpm install --frozen-lockfile

cache:
  key:
    files:
      - pnpm-lock.yaml
  paths:
    - .pnpm-store
    - node_modules

# 设置阶段
setup:
  stage: setup
  extends: .base
  script:
    - echo "Dependencies installed"
  artifacts:
    expire_in: 1 hour
    paths:
      - node_modules
      - .pnpm-store

# 质量检查
lint:
  stage: quality
  extends: .base
  needs: [setup]
  script:
    - pnpm lint
  artifacts:
    when: on_failure
    reports:
      junit: lint-results.xml

type-check:
  stage: quality
  extends: .base
  needs: [setup]
  script:
    - pnpm type-check

# 测试阶段
test:unit:
  stage: test
  extends: .base
  needs: [setup]
  script:
    - pnpm test:ci
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'
  artifacts:
    when: always
    reports:
      junit: test-results/jest/junit.xml
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
    paths:
      - coverage

test:e2e:
  stage: test
  image: mcr.microsoft.com/playwright:v1.40.0-focal
  needs: [setup]
  script:
    - pnpm test:e2e
  artifacts:
    when: always
    paths:
      - playwright-report
    expire_in: 30 days

# 构建阶段
build:
  stage: build
  extends: .base
  needs: [lint, type-check, "test:unit"]
  script:
    - pnpm build
  artifacts:
    paths:
      - dist
    expire_in: 1 week

# 部署阶段
deploy:staging:
  stage: deploy
  needs: [build]
  environment:
    name: staging
    url: https://staging.example.com
  only:
    - develop
  script:
    - echo "Deploying to staging..."

deploy:production:
  stage: deploy
  needs: [build]
  environment:
    name: production
    url: https://example.com
  only:
    - main
  when: manual
  script:
    - echo "Deploying to production..."
```

## E2E测试配置

```javascript
// playwright.config.ts - Playwright配置
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [
        ['html', { outputFolder: 'playwright-report' }],
        ['junit', { outputFile: 'test-results/e2e/junit.xml' }],
        ['list'],
        ['github']
    ],
    
    use: {
        actionTimeout: 0,
        baseURL: process.env.BASE_URL || 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        
        // 认证状态
        storageState: 'e2e/.auth/user.json'
    },
    
    projects: [
        // 设置项目
        {
            name: 'setup',
            testMatch: /.*\.setup\.ts/
        },
        
        // 桌面浏览器
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
            dependencies: ['setup']
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
            dependencies: ['setup']
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
            dependencies: ['setup']
        },
        
        // 移动设备
        {
            name: 'Mobile Chrome',
            use: { ...devices['Pixel 5'] },
            dependencies: ['setup']
        },
        {
            name: 'Mobile Safari',
            use: { ...devices['iPhone 12'] },
            dependencies: ['setup']
        }
    ],
    
    webServer: {
        command: 'pnpm dev',
        port: 3000,
        reuseExistingServer: !process.env.CI
    }
});

// e2e/auth.setup.ts - 认证设置
import { test as setup, expect } from '@playwright/test';

const authFile = 'e2e/.auth/user.json';

setup('authenticate', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    await expect(page).toHaveURL('/dashboard');
    
    await page.context().storageState({ path: authFile });
});

// e2e/dashboard.spec.ts - E2E测试示例
import { test, expect } from '@playwright/test';
import { DashboardPage } from './pages/dashboard';

test.describe('Dashboard', () => {
    let dashboardPage: DashboardPage;
    
    test.beforeEach(async ({ page }) => {
        dashboardPage = new DashboardPage(page);
        await dashboardPage.goto();
    });
    
    test('should display user data', async () => {
        await expect(dashboardPage.welcomeMessage).toContainText('Welcome back');
        await expect(dashboardPage.dataTable).toBeVisible();
    });
    
    test('should filter data', async ({ page }) => {
        await dashboardPage.searchFor('test');
        
        const rows = await dashboardPage.getTableRows();
        expect(rows.length).toBeGreaterThan(0);
        
        for (const row of rows) {
            await expect(row).toContainText('test');
        }
    });
    
    test('should export data', async ({ page }) => {
        const downloadPromise = page.waitForEvent('download');
        await dashboardPage.exportData();
        
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toBe('data.csv');
    });
});
```

## 性能测试

```javascript
// performance/lighthouse.config.js
module.exports = {
    ci: {
        collect: {
            url: [
                'http://localhost:3000/',
                'http://localhost:3000/dashboard',
                'http://localhost:3000/profile'
            ],
            numberOfRuns: 3,
            settings: {
                preset: 'desktop',
                throttling: {
                    cpuSlowdownMultiplier: 1
                }
            }
        },
        assert: {
            preset: 'lighthouse:recommended',
            assertions: {
                'categories:performance': ['error', { minScore: 0.9 }],
                'categories:accessibility': ['error', { minScore: 0.95 }],
                'categories:best-practices': ['error', { minScore: 0.9 }],
                'categories:seo': ['error', { minScore: 0.9 }],
                'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
                'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
                'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
                'total-blocking-time': ['error', { maxNumericValue: 300 }]
            }
        },
        upload: {
            target: 'temporary-public-storage'
        }
    }
};

// performance/load-test.js - k6负载测试
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
    stages: [
        { duration: '2m', target: 10 },   // 预热
        { duration: '5m', target: 50 },   // 爬升
        { duration: '10m', target: 100 }, // 峰值
        { duration: '5m', target: 50 },   // 下降
        { duration: '2m', target: 0 }     // 冷却
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95%的请求必须在500ms内完成
        errors: ['rate<0.1']              // 错误率必须低于10%
    }
};

export default function() {
    const res = http.get('https://example.com/api/data');
    
    const success = check(res, {
        'status is 200': (r) => r.status === 200,
        'response time < 500ms': (r) => r.timings.duration < 500
    });
    
    errorRate.add(!success);
    
    sleep(1);
}