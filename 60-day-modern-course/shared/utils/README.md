# 工具函数库

本目录存放可复用的工具函数和辅助代码。

## 工具分类

### 数据处理
- `formatters.ts` - 格式化函数（日期、货币、数字等）
- `validators.ts` - 验证函数（邮箱、手机号、表单等）
- `transformers.ts` - 数据转换函数

### API相关
- `api-client.ts` - API请求封装
- `auth.ts` - 认证相关工具
- `error-handler.ts` - 错误处理

### DOM操作
- `dom-utils.ts` - DOM辅助函数
- `events.ts` - 事件处理工具
- `storage.ts` - 本地存储封装

### 性能优化
- `debounce.ts` - 防抖函数
- `throttle.ts` - 节流函数
- `memo.ts` - 记忆化函数

## 使用示例

```typescript
// 导入格式化函数
import { formatDate, formatCurrency } from '@shared/utils/formatters';

// 使用
const formattedDate = formatDate(new Date());
const price = formatCurrency(99.99);

// 导入验证函数
import { validateEmail } from '@shared/utils/validators';

if (validateEmail(email)) {
  // 处理有效邮箱
}
```

## 编写规范

1. 每个函数都应有JSDoc注释
2. 包含TypeScript类型定义
3. 编写单元测试
4. 保持函数纯净，避免副作用
5. 合理组织相关函数到同一文件