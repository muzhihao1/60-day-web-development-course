---
day: 22
title: "JavaScript安全性"
description: "学习前端安全最佳实践，防范常见的安全威胁"
date: 2024-01-22
tags: ["JavaScript", "安全", "Web安全", "最佳实践"]
duration: "6小时"
difficulty: "高级"
---

# Day 22: JavaScript安全性 🔐

## 学习目标

今天我们将深入学习JavaScript安全性的各个方面：

1. **常见安全威胁**
   - XSS (跨站脚本攻击)
   - CSRF (跨站请求伪造)
   - 注入攻击
   - 安全漏洞分析

2. **防御技术**
   - 输入验证与清理
   - 输出编码
   - CSP (内容安全策略)
   - 安全头部配置

3. **身份认证与授权**
   - JWT安全实践
   - OAuth 2.0
   - 会话管理
   - 权限控制

4. **数据保护**
   - 加密技术
   - 安全存储
   - 传输安全
   - 隐私保护

## 常见安全威胁

### XSS (跨站脚本攻击)

```javascript
// XSS攻击类型和防御

// 1. 反射型XSS
// 危险示例 - 永远不要这样做！
// const searchQuery = new URLSearchParams(window.location.search).get('q');
// document.getElementById('results').innerHTML = `搜索结果: ${searchQuery}`;
// 如果URL是: ?q=<script>alert('XSS')</script>

// 安全的做法
function safeDisplaySearch() {
    const searchQuery = new URLSearchParams(window.location.search).get('q');
    const resultsElement = document.getElementById('results');
    
    // 使用textContent而不是innerHTML
    resultsElement.textContent = `搜索结果: ${searchQuery}`;
    
    // 或者使用适当的编码
    resultsElement.innerHTML = `搜索结果: ${escapeHtml(searchQuery)}`;
}

// HTML编码函数
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// 2. 存储型XSS防御
class SecureCommentSystem {
    constructor() {
        this.comments = [];
        this.validator = new DOMPurify();
    }
    
    // 添加评论时进行清理
    addComment(userInput) {
        // 验证输入
        if (!this.validateInput(userInput)) {
            throw new Error('Invalid input');
        }
        
        // 清理HTML
        const cleanHtml = DOMPurify.sanitize(userInput, {
            ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p'],
            ALLOWED_ATTR: []
        });
        
        const comment = {
            id: this.generateId(),
            content: cleanHtml,
            timestamp: new Date(),
            // 存储原始内容的哈希用于验证
            contentHash: this.hashContent(userInput)
        };
        
        this.comments.push(comment);
        return comment;
    }
    
    validateInput(input) {
        // 基本验证
        if (!input || typeof input !== 'string') return false;
        if (input.length > 5000) return false;
        
        // 检测潜在的恶意模式
        const dangerousPatterns = [
            /<script[\s\S]*?<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<iframe/gi,
            /<object/gi,
            /<embed/gi
        ];
        
        return !dangerousPatterns.some(pattern => pattern.test(input));
    }
    
    hashContent(content) {
        // 简单的哈希实现（实际应使用crypto API）
        return btoa(content).substring(0, 16);
    }
    
    generateId() {
        return `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

// 3. DOM型XSS防御
class SecureRouter {
    constructor() {
        this.routes = new Map();
    }
    
    navigate(path) {
        // 验证路径
        if (!this.isValidPath(path)) {
            console.error('Invalid navigation path');
            return;
        }
        
        // 安全地更新URL
        history.pushState(null, '', this.sanitizePath(path));
        
        // 安全地渲染内容
        this.renderRoute(path);
    }
    
    isValidPath(path) {
        // 白名单验证
        const validPaths = /^\/[a-zA-Z0-9\-_\/]*$/;
        return validPaths.test(path);
    }
    
    sanitizePath(path) {
        // 移除潜在的危险字符
        return path.replace(/[<>'"]/g, '');
    }
    
    renderRoute(path) {
        const container = document.getElementById('app');
        const route = this.routes.get(path);
        
        if (route) {
            // 使用安全的渲染方法
            container.innerHTML = '';
            const content = route.render();
            if (content instanceof Node) {
                container.appendChild(content);
            } else {
                container.textContent = content;
            }
        }
    }
}
```

### CSRF防御

```javascript
// CSRF Token管理
class CSRFProtection {
    constructor() {
        this.tokenKey = 'csrf-token';
        this.headerName = 'X-CSRF-Token';
    }
    
    // 生成CSRF令牌
    generateToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        
        // 存储在内存中，不要存储在localStorage
        sessionStorage.setItem(this.tokenKey, token);
        
        return token;
    }
    
    // 获取当前令牌
    getToken() {
        let token = sessionStorage.getItem(this.tokenKey);
        if (!token) {
            token = this.generateToken();
        }
        return token;
    }
    
    // 为请求添加CSRF保护
    protectRequest(options = {}) {
        const token = this.getToken();
        
        return {
            ...options,
            headers: {
                ...options.headers,
                [this.headerName]: token
            },
            credentials: 'same-origin' // 重要：限制跨域请求
        };
    }
    
    // 安全的表单提交
    createSecureForm() {
        const form = document.createElement('form');
        
        // 添加CSRF令牌字段
        const tokenInput = document.createElement('input');
        tokenInput.type = 'hidden';
        tokenInput.name = '_csrf';
        tokenInput.value = this.getToken();
        form.appendChild(tokenInput);
        
        // 防止重复提交
        form.addEventListener('submit', (e) => {
            if (form.dataset.submitted === 'true') {
                e.preventDefault();
                return;
            }
            form.dataset.submitted = 'true';
            
            // 禁用提交按钮
            const submitButton = form.querySelector('[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
            }
        });
        
        return form;
    }
}

// 安全的API客户端
class SecureAPIClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
        this.csrf = new CSRFProtection();
    }
    
    async request(endpoint, options = {}) {
        const url = new URL(endpoint, this.baseURL);
        
        // 添加CSRF保护
        const secureOptions = this.csrf.protectRequest({
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        try {
            const response = await fetch(url, secureOptions);
            
            // 验证响应
            if (!response.ok) {
                throw new SecurityError(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            // 验证内容类型
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new SecurityError('Invalid content type');
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }
    
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }
    
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
}

class SecurityError extends Error {
    constructor(message) {
        super(message);
        this.name = 'SecurityError';
    }
}
```

### 输入验证和清理

```javascript
// 综合输入验证器
class InputValidator {
    constructor() {
        this.rules = new Map();
        this.setupDefaultRules();
    }
    
    setupDefaultRules() {
        // Email验证
        this.addRule('email', {
            pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            maxLength: 254,
            message: '请输入有效的邮箱地址'
        });
        
        // 用户名验证
        this.addRule('username', {
            pattern: /^[a-zA-Z0-9_-]{3,20}$/,
            message: '用户名只能包含字母、数字、下划线和横线，长度3-20位'
        });
        
        // 密码验证
        this.addRule('password', {
            minLength: 8,
            maxLength: 128,
            custom: (value) => {
                const checks = [
                    /[a-z]/.test(value), // 小写字母
                    /[A-Z]/.test(value), // 大写字母
                    /[0-9]/.test(value), // 数字
                    /[^a-zA-Z0-9]/.test(value) // 特殊字符
                ];
                
                const strength = checks.filter(Boolean).length;
                
                if (strength < 3) {
                    return '密码必须包含大小写字母、数字和特殊字符中的至少三种';
                }
                
                return null;
            }
        });
        
        // URL验证
        this.addRule('url', {
            custom: (value) => {
                try {
                    const url = new URL(value);
                    // 只允许http和https协议
                    if (!['http:', 'https:'].includes(url.protocol)) {
                        return '只支持HTTP或HTTPS协议';
                    }
                    return null;
                } catch {
                    return '请输入有效的URL';
                }
            }
        });
        
        // 手机号验证（中国）
        this.addRule('phone', {
            pattern: /^1[3-9]\d{9}$/,
            message: '请输入有效的手机号码'
        });
    }
    
    addRule(name, rule) {
        this.rules.set(name, rule);
    }
    
    validate(value, ruleName, options = {}) {
        const rule = this.rules.get(ruleName);
        if (!rule) {
            throw new Error(`未知的验证规则: ${ruleName}`);
        }
        
        const errors = [];
        
        // 检查必填
        if (options.required && !value) {
            errors.push('此字段为必填项');
            return errors;
        }
        
        // 空值且非必填，跳过验证
        if (!value && !options.required) {
            return errors;
        }
        
        // 长度验证
        if (rule.minLength && value.length < rule.minLength) {
            errors.push(`最少需要${rule.minLength}个字符`);
        }
        
        if (rule.maxLength && value.length > rule.maxLength) {
            errors.push(`最多允许${rule.maxLength}个字符`);
        }
        
        // 正则验证
        if (rule.pattern && !rule.pattern.test(value)) {
            errors.push(rule.message || '格式不正确');
        }
        
        // 自定义验证
        if (rule.custom) {
            const customError = rule.custom(value);
            if (customError) {
                errors.push(customError);
            }
        }
        
        return errors;
    }
    
    // 清理输入
    sanitize(value, type) {
        if (!value) return value;
        
        switch (type) {
            case 'text':
                // 移除控制字符
                return value.replace(/[\x00-\x1F\x7F]/g, '');
                
            case 'html':
                // 基本HTML清理
                return value
                    .replace(/<script[\s\S]*?<\/script>/gi, '')
                    .replace(/<style[\s\S]*?<\/style>/gi, '')
                    .replace(/on\w+\s*=/gi, '');
                    
            case 'sql':
                // 基本SQL注入防护（应该使用参数化查询）
                return value.replace(/['";\\]/g, '');
                
            case 'filename':
                // 文件名清理
                return value.replace(/[^a-zA-Z0-9._-]/g, '');
                
            default:
                return value;
        }
    }
}

// 表单验证器
class FormValidator {
    constructor(form, rules) {
        this.form = form;
        this.rules = rules;
        this.validator = new InputValidator();
        this.errors = new Map();
        
        this.init();
    }
    
    init() {
        // 实时验证
        this.form.addEventListener('input', (e) => {
            if (this.rules[e.target.name]) {
                this.validateField(e.target);
            }
        });
        
        // 表单提交验证
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (this.validateAll()) {
                this.handleSubmit();
            }
        });
    }
    
    validateField(field) {
        const rule = this.rules[field.name];
        const errors = this.validator.validate(field.value, rule.type, rule.options);
        
        if (errors.length > 0) {
            this.errors.set(field.name, errors);
            this.showFieldError(field, errors[0]);
        } else {
            this.errors.delete(field.name);
            this.clearFieldError(field);
        }
        
        return errors.length === 0;
    }
    
    validateAll() {
        let isValid = true;
        
        Object.keys(this.rules).forEach(fieldName => {
            const field = this.form.elements[fieldName];
            if (field && !this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    showFieldError(field, error) {
        const errorElement = this.getErrorElement(field);
        errorElement.textContent = error;
        errorElement.style.display = 'block';
        field.classList.add('error');
    }
    
    clearFieldError(field) {
        const errorElement = this.getErrorElement(field);
        errorElement.textContent = '';
        errorElement.style.display = 'none';
        field.classList.remove('error');
    }
    
    getErrorElement(field) {
        let errorElement = field.nextElementSibling;
        
        if (!errorElement || !errorElement.classList.contains('field-error')) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            field.parentNode.insertBefore(errorElement, field.nextSibling);
        }
        
        return errorElement;
    }
    
    async handleSubmit() {
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);
        
        // 清理数据
        Object.keys(data).forEach(key => {
            if (this.rules[key] && this.rules[key].sanitize) {
                data[key] = this.validator.sanitize(data[key], this.rules[key].sanitize);
            }
        });
        
        // 提交处理
        try {
            await this.submitData(data);
        } catch (error) {
            console.error('Form submission failed:', error);
        }
    }
    
    async submitData(data) {
        // 实现具体的提交逻辑
        console.log('Submitting data:', data);
    }
}
```

## 身份认证与授权

### JWT安全实践

```javascript
// JWT安全管理
class JWTManager {
    constructor() {
        this.tokenKey = 'auth-token';
        this.refreshKey = 'refresh-token';
        this.tokenExpiry = 15 * 60 * 1000; // 15分钟
    }
    
    // 安全存储令牌
    storeTokens(accessToken, refreshToken) {
        // 访问令牌存储在内存中
        this.accessToken = accessToken;
        
        // 刷新令牌使用httpOnly cookie（需要后端配合）
        // 这里模拟存储
        this.storeRefreshToken(refreshToken);
        
        // 设置过期定时器
        this.scheduleTokenRefresh();
    }
    
    storeRefreshToken(token) {
        // 实际应该通过httpOnly cookie
        // 这里使用加密的sessionStorage作为示例
        const encrypted = this.encrypt(token);
        sessionStorage.setItem(this.refreshKey, encrypted);
    }
    
    // 简单的加密示例（实际应使用更强的加密）
    encrypt(data) {
        // 使用Web Crypto API进行真正的加密
        return btoa(data); // 仅作示例
    }
    
    decrypt(data) {
        return atob(data); // 仅作示例
    }
    
    // 获取访问令牌
    getAccessToken() {
        return this.accessToken;
    }
    
    // 刷新令牌
    async refreshAccessToken() {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }
        
        try {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken }),
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Token refresh failed');
            }
            
            const { accessToken } = await response.json();
            this.accessToken = accessToken;
            this.scheduleTokenRefresh();
            
            return accessToken;
        } catch (error) {
            // 刷新失败，清除认证状态
            this.clearTokens();
            throw error;
        }
    }
    
    getRefreshToken() {
        const encrypted = sessionStorage.getItem(this.refreshKey);
        return encrypted ? this.decrypt(encrypted) : null;
    }
    
    // 定时刷新
    scheduleTokenRefresh() {
        clearTimeout(this.refreshTimer);
        
        // 在过期前5分钟刷新
        const refreshTime = this.tokenExpiry - 5 * 60 * 1000;
        
        this.refreshTimer = setTimeout(() => {
            this.refreshAccessToken().catch(error => {
                console.error('Auto refresh failed:', error);
                // 触发重新登录
                window.dispatchEvent(new Event('auth:expired'));
            });
        }, refreshTime);
    }
    
    // 清除令牌
    clearTokens() {
        this.accessToken = null;
        sessionStorage.removeItem(this.refreshKey);
        clearTimeout(this.refreshTimer);
    }
    
    // 验证令牌格式
    isValidJWT(token) {
        if (!token) return false;
        
        const parts = token.split('.');
        if (parts.length !== 3) return false;
        
        try {
            // 验证是否可以解码
            const payload = JSON.parse(atob(parts[1]));
            
            // 检查过期时间
            if (payload.exp && payload.exp < Date.now() / 1000) {
                return false;
            }
            
            return true;
        } catch {
            return false;
        }
    }
}

// 安全的HTTP客户端
class SecureHTTPClient {
    constructor() {
        this.jwtManager = new JWTManager();
        this.baseURL = '/api';
    }
    
    async request(url, options = {}) {
        const token = this.jwtManager.getAccessToken();
        
        const secureOptions = {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': token ? `Bearer ${token}` : ''
            },
            credentials: 'include' // 包含cookies
        };
        
        try {
            let response = await fetch(this.baseURL + url, secureOptions);
            
            // 如果是401，尝试刷新令牌
            if (response.status === 401) {
                await this.jwtManager.refreshAccessToken();
                
                // 重试请求
                secureOptions.headers.Authorization = `Bearer ${this.jwtManager.getAccessToken()}`;
                response = await fetch(this.baseURL + url, secureOptions);
            }
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Request failed:', error);
            throw error;
        }
    }
}
```

### 权限控制

```javascript
// 基于角色的访问控制 (RBAC)
class AccessControl {
    constructor() {
        this.permissions = new Map();
        this.roles = new Map();
        this.userRoles = new Map();
    }
    
    // 定义权限
    definePermission(name, description) {
        this.permissions.set(name, {
            name,
            description,
            createdAt: new Date()
        });
    }
    
    // 定义角色
    defineRole(name, permissions = []) {
        this.roles.set(name, {
            name,
            permissions: new Set(permissions),
            createdAt: new Date()
        });
    }
    
    // 给角色添加权限
    grantPermissionToRole(roleName, permissionName) {
        const role = this.roles.get(roleName);
        if (!role) {
            throw new Error(`Role ${roleName} not found`);
        }
        
        if (!this.permissions.has(permissionName)) {
            throw new Error(`Permission ${permissionName} not found`);
        }
        
        role.permissions.add(permissionName);
    }
    
    // 给用户分配角色
    assignRoleToUser(userId, roleName) {
        if (!this.roles.has(roleName)) {
            throw new Error(`Role ${roleName} not found`);
        }
        
        if (!this.userRoles.has(userId)) {
            this.userRoles.set(userId, new Set());
        }
        
        this.userRoles.get(userId).add(roleName);
    }
    
    // 检查用户权限
    hasPermission(userId, permissionName) {
        const userRoles = this.userRoles.get(userId);
        if (!userRoles) return false;
        
        for (const roleName of userRoles) {
            const role = this.roles.get(roleName);
            if (role && role.permissions.has(permissionName)) {
                return true;
            }
        }
        
        return false;
    }
    
    // 获取用户所有权限
    getUserPermissions(userId) {
        const permissions = new Set();
        const userRoles = this.userRoles.get(userId);
        
        if (userRoles) {
            userRoles.forEach(roleName => {
                const role = this.roles.get(roleName);
                if (role) {
                    role.permissions.forEach(permission => {
                        permissions.add(permission);
                    });
                }
            });
        }
        
        return Array.from(permissions);
    }
}

// UI权限控制
class UIPermissionControl {
    constructor(accessControl, currentUserId) {
        this.accessControl = accessControl;
        this.currentUserId = currentUserId;
    }
    
    // 根据权限显示/隐藏元素
    applyPermissions() {
        const elements = document.querySelectorAll('[data-permission]');
        
        elements.forEach(element => {
            const requiredPermission = element.dataset.permission;
            const hasPermission = this.accessControl.hasPermission(
                this.currentUserId, 
                requiredPermission
            );
            
            if (!hasPermission) {
                element.style.display = 'none';
                element.setAttribute('aria-hidden', 'true');
            }
        });
    }
    
    // 权限指令
    createPermissionDirective() {
        return {
            // v-permission="'edit-user'"
            mounted(el, binding) {
                const permission = binding.value;
                const hasPermission = this.accessControl.hasPermission(
                    this.currentUserId,
                    permission
                );
                
                if (!hasPermission) {
                    el.style.display = 'none';
                }
            }
        };
    }
    
    // 路由守卫
    createRouteGuard(router) {
        router.beforeEach((to, from, next) => {
            if (to.meta.requiresAuth) {
                if (!this.isAuthenticated()) {
                    next('/login');
                    return;
                }
            }
            
            if (to.meta.permission) {
                if (!this.accessControl.hasPermission(this.currentUserId, to.meta.permission)) {
                    next('/403'); // 无权限页面
                    return;
                }
            }
            
            next();
        });
    }
    
    isAuthenticated() {
        // 检查是否已认证
        return !!this.currentUserId;
    }
}
```

## 数据保护

### 加密和哈希

```javascript
// 使用Web Crypto API
class CryptoService {
    constructor() {
        this.algorithm = 'AES-GCM';
        this.keyLength = 256;
    }
    
    // 生成密钥
    async generateKey() {
        return await crypto.subtle.generateKey(
            {
                name: this.algorithm,
                length: this.keyLength
            },
            true, // 可导出
            ['encrypt', 'decrypt']
        );
    }
    
    // 导出密钥
    async exportKey(key) {
        const exported = await crypto.subtle.exportKey('raw', key);
        return this.arrayBufferToBase64(exported);
    }
    
    // 导入密钥
    async importKey(keyString) {
        const keyData = this.base64ToArrayBuffer(keyString);
        
        return await crypto.subtle.importKey(
            'raw',
            keyData,
            {
                name: this.algorithm,
                length: this.keyLength
            },
            false,
            ['encrypt', 'decrypt']
        );
    }
    
    // 加密数据
    async encrypt(data, key) {
        const encoder = new TextEncoder();
        const encodedData = encoder.encode(data);
        
        // 生成随机IV
        const iv = crypto.getRandomValues(new Uint8Array(12));
        
        const encryptedData = await crypto.subtle.encrypt(
            {
                name: this.algorithm,
                iv: iv
            },
            key,
            encodedData
        );
        
        // 合并IV和加密数据
        const combined = new Uint8Array(iv.length + encryptedData.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encryptedData), iv.length);
        
        return this.arrayBufferToBase64(combined);
    }
    
    // 解密数据
    async decrypt(encryptedString, key) {
        const combined = this.base64ToArrayBuffer(encryptedString);
        
        // 提取IV和加密数据
        const iv = combined.slice(0, 12);
        const encryptedData = combined.slice(12);
        
        const decryptedData = await crypto.subtle.decrypt(
            {
                name: this.algorithm,
                iv: iv
            },
            key,
            encryptedData
        );
        
        const decoder = new TextDecoder();
        return decoder.decode(decryptedData);
    }
    
    // 生成哈希
    async hash(data) {
        const encoder = new TextEncoder();
        const encodedData = encoder.encode(data);
        
        const hashBuffer = await crypto.subtle.digest('SHA-256', encodedData);
        return this.arrayBufferToHex(hashBuffer);
    }
    
    // 密码哈希（使用PBKDF2）
    async hashPassword(password, salt = null) {
        const encoder = new TextEncoder();
        
        // 生成或使用提供的盐
        if (!salt) {
            salt = crypto.getRandomValues(new Uint8Array(16));
        } else if (typeof salt === 'string') {
            salt = this.base64ToArrayBuffer(salt);
        }
        
        const passwordKey = await crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveBits']
        );
        
        const derivedBits = await crypto.subtle.deriveBits(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            passwordKey,
            256
        );
        
        return {
            hash: this.arrayBufferToBase64(derivedBits),
            salt: this.arrayBufferToBase64(salt)
        };
    }
    
    // 验证密码
    async verifyPassword(password, storedHash, storedSalt) {
        const { hash } = await this.hashPassword(password, storedSalt);
        return hash === storedHash;
    }
    
    // 辅助函数
    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        
        bytes.forEach(byte => {
            binary += String.fromCharCode(byte);
        });
        
        return btoa(binary);
    }
    
    base64ToArrayBuffer(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        
        return bytes.buffer;
    }
    
    arrayBufferToHex(buffer) {
        const bytes = new Uint8Array(buffer);
        return Array.from(bytes)
            .map(byte => byte.toString(16).padStart(2, '0'))
            .join('');
    }
}

// 安全存储
class SecureStorage {
    constructor() {
        this.crypto = new CryptoService();
        this.storageKey = null;
    }
    
    // 初始化存储密钥
    async init() {
        // 尝试从会话中恢复密钥
        const savedKey = sessionStorage.getItem('storage-key');
        
        if (savedKey) {
            this.storageKey = await this.crypto.importKey(savedKey);
        } else {
            // 生成新密钥
            this.storageKey = await this.crypto.generateKey();
            const exportedKey = await this.crypto.exportKey(this.storageKey);
            sessionStorage.setItem('storage-key', exportedKey);
        }
    }
    
    // 安全存储数据
    async setItem(key, value) {
        if (!this.storageKey) {
            await this.init();
        }
        
        const jsonValue = JSON.stringify(value);
        const encrypted = await this.crypto.encrypt(jsonValue, this.storageKey);
        
        localStorage.setItem(key, encrypted);
    }
    
    // 安全读取数据
    async getItem(key) {
        if (!this.storageKey) {
            await this.init();
        }
        
        const encrypted = localStorage.getItem(key);
        if (!encrypted) return null;
        
        try {
            const decrypted = await this.crypto.decrypt(encrypted, this.storageKey);
            return JSON.parse(decrypted);
        } catch (error) {
            console.error('Decryption failed:', error);
            return null;
        }
    }
    
    // 删除数据
    removeItem(key) {
        localStorage.removeItem(key);
    }
    
    // 清空所有数据
    clear() {
        localStorage.clear();
        sessionStorage.removeItem('storage-key');
        this.storageKey = null;
    }
}
```

## CSP和安全头部

```javascript
// Content Security Policy管理
class CSPManager {
    constructor() {
        this.policies = {
            'default-src': ["'self'"],
            'script-src': ["'self'", "'nonce-'"],
            'style-src': ["'self'", "'unsafe-inline'"],
            'img-src': ["'self'", 'data:', 'https:'],
            'font-src': ["'self'"],
            'connect-src': ["'self'"],
            'frame-ancestors': ["'none'"],
            'base-uri': ["'self'"],
            'form-action': ["'self'"]
        };
        
        this.nonce = this.generateNonce();
    }
    
    generateNonce() {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return btoa(String.fromCharCode.apply(null, array));
    }
    
    // 构建CSP头部
    buildPolicy() {
        const policyStrings = [];
        
        Object.entries(this.policies).forEach(([directive, sources]) => {
            let sourcesString = sources.join(' ');
            
            // 替换nonce占位符
            if (sourcesString.includes("'nonce-'")) {
                sourcesString = sourcesString.replace("'nonce-'", `'nonce-${this.nonce}'`);
            }
            
            policyStrings.push(`${directive} ${sourcesString}`);
        });
        
        return policyStrings.join('; ');
    }
    
    // 应用CSP到页面
    applyToPage() {
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = this.buildPolicy();
        document.head.appendChild(meta);
        
        // 为内联脚本添加nonce
        document.querySelectorAll('script:not([src])').forEach(script => {
            script.nonce = this.nonce;
        });
    }
    
    // 报告CSP违规
    setupReporting() {
        document.addEventListener('securitypolicyviolation', (e) => {
            const violation = {
                documentUri: e.documentURI,
                referrer: e.referrer,
                violatedDirective: e.violatedDirective,
                effectiveDirective: e.effectiveDirective,
                originalPolicy: e.originalPolicy,
                blockedUri: e.blockedURI,
                lineNumber: e.lineNumber,
                columnNumber: e.columnNumber,
                sourceFile: e.sourceFile,
                timestamp: new Date().toISOString()
            };
            
            // 发送违规报告
            this.reportViolation(violation);
        });
    }
    
    async reportViolation(violation) {
        try {
            await fetch('/api/csp-report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(violation)
            });
        } catch (error) {
            console.error('Failed to report CSP violation:', error);
        }
    }
}

// 安全头部配置（服务器端配置示例）
const securityHeaders = {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-site'
};
```

## 安全最佳实践总结

```javascript
// 安全检查清单
class SecurityChecklist {
    constructor() {
        this.checks = [
            {
                name: 'HTTPS使用',
                check: () => location.protocol === 'https:',
                severity: 'critical',
                fix: '确保所有页面都使用HTTPS'
            },
            {
                name: 'CSP配置',
                check: () => !!document.querySelector('meta[http-equiv="Content-Security-Policy"]'),
                severity: 'high',
                fix: '配置Content Security Policy'
            },
            {
                name: '敏感数据加密',
                check: () => !localStorage.getItem('password') && !localStorage.getItem('token'),
                severity: 'critical',
                fix: '不要在localStorage中存储敏感数据'
            },
            {
                name: 'XSS防护',
                check: () => {
                    // 检查是否有直接使用innerHTML
                    const scripts = Array.from(document.scripts);
                    return !scripts.some(script => 
                        script.textContent.includes('innerHTML') && 
                        !script.textContent.includes('DOMPurify')
                    );
                },
                severity: 'high',
                fix: '使用textContent或DOMPurify清理HTML'
            }
        ];
    }
    
    runChecks() {
        const results = [];
        
        this.checks.forEach(check => {
            const passed = check.check();
            results.push({
                name: check.name,
                passed,
                severity: check.severity,
                fix: passed ? null : check.fix
            });
        });
        
        return results;
    }
    
    generateReport() {
        const results = this.runChecks();
        const failed = results.filter(r => !r.passed);
        
        console.group('🔒 Security Checklist Report');
        
        if (failed.length === 0) {
            console.log('✅ All security checks passed!');
        } else {
            console.warn(`⚠️ ${failed.length} security issues found:`);
            
            failed.forEach(issue => {
                console.group(`❌ ${issue.name} (${issue.severity})`);
                console.log(`Fix: ${issue.fix}`);
                console.groupEnd();
            });
        }
        
        console.groupEnd();
        
        return results;
    }
}

// 运行安全检查
const securityChecklist = new SecurityChecklist();
securityChecklist.generateReport();
```

## 今日总结

今天我们学习了JavaScript安全性的核心概念和实践。记住，安全是一个持续的过程，需要在开发的每个阶段都保持警惕。始终遵循最小权限原则，验证所有输入，编码所有输出，使用安全的通信方式。

## 作业

1. 实现一个安全的用户认证系统
2. 创建输入验证和XSS防护工具
3. 实现基于角色的权限控制系统
4. 配置CSP并测试安全头部

明天我们将学习现代开发工具链！