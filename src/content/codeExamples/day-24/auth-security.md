---
title: "认证与安全实现"
category: "advanced"
language: "javascript"
---

# 认证与安全实现

## 完整的认证系统

```javascript
// src/services/AuthService.js - 认证服务
export class AuthService {
    constructor(store, eventBus) {
        this.store = store;
        this.eventBus = eventBus;
        this.api = new APIService('/auth');
        this.tokenRefreshTimer = null;
        this.sessionTimeout = 30 * 60 * 1000; // 30分钟
        this.lastActivity = Date.now();
        
        // 初始化活动监听
        this.initActivityListeners();
    }
    
    initActivityListeners() {
        const updateActivity = () => {
            this.lastActivity = Date.now();
        };
        
        // 监听用户活动
        ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, updateActivity, { passive: true });
        });
        
        // 定期检查会话
        setInterval(() => {
            if (this.isAuthenticated() && Date.now() - this.lastActivity > this.sessionTimeout) {
                this.logout('会话已超时，请重新登录');
            }
        }, 60000); // 每分钟检查一次
    }
    
    async login(username, password) {
        try {
            // 验证输入
            if (!username || !password) {
                throw new Error('用户名和密码不能为空');
            }
            
            // 清理输入
            const sanitizedUsername = this.sanitizeInput(username);
            
            // 生成设备指纹
            const deviceFingerprint = await this.generateDeviceFingerprint();
            
            // 发送登录请求
            const response = await this.api.post('/login', {
                username: sanitizedUsername,
                password: password, // 应该在传输前加密
                deviceFingerprint,
                timestamp: Date.now()
            });
            
            // 验证响应
            if (!response.token || !response.user) {
                throw new Error('无效的服务器响应');
            }
            
            // 保存认证信息
            this.saveAuthData(response);
            
            // 设置token刷新
            this.scheduleTokenRefresh();
            
            // 更新应用状态
            this.store.setState({
                user: response.user,
                isAuthenticated: true
            });
            
            // 触发登录事件
            this.eventBus.emit('auth:login', response.user);
            
            return response.user;
            
        } catch (error) {
            // 记录失败尝试
            await this.logFailedAttempt(username);
            throw error;
        }
    }
    
    async register(userData) {
        try {
            // 验证用户数据
            const errors = this.validateRegistration(userData);
            if (errors.length > 0) {
                throw new Error(errors.join(', '));
            }
            
            // 清理和准备数据
            const sanitizedData = {
                username: this.sanitizeInput(userData.username),
                email: this.sanitizeInput(userData.email),
                password: userData.password, // 应该在客户端加密
                confirmPassword: userData.confirmPassword
            };
            
            // 检查密码强度
            const passwordStrength = this.checkPasswordStrength(userData.password);
            if (passwordStrength.score < 3) {
                throw new Error('密码强度不足：' + passwordStrength.feedback);
            }
            
            // 发送注册请求
            const response = await this.api.post('/register', sanitizedData);
            
            // 自动登录
            if (response.token) {
                this.saveAuthData(response);
                this.store.setState({
                    user: response.user,
                    isAuthenticated: true
                });
            }
            
            return response.user;
            
        } catch (error) {
            throw error;
        }
    }
    
    async logout(message = null) {
        try {
            // 通知服务器
            if (this.isAuthenticated()) {
                await this.api.post('/logout').catch(() => {});
            }
        } finally {
            // 清理本地数据
            this.clearAuthData();
            
            // 清理定时器
            if (this.tokenRefreshTimer) {
                clearTimeout(this.tokenRefreshTimer);
                this.tokenRefreshTimer = null;
            }
            
            // 更新应用状态
            this.store.setState({
                user: null,
                isAuthenticated: false
            });
            
            // 触发登出事件
            this.eventBus.emit('auth:logout', { message });
            
            // 跳转到登录页
            window.location.href = '/login';
        }
    }
    
    async refreshToken() {
        try {
            const refreshToken = this.getRefreshToken();
            if (!refreshToken) {
                throw new Error('No refresh token');
            }
            
            const response = await this.api.post('/refresh', {
                refreshToken
            });
            
            // 更新token
            this.api.setAuth(response.token, response.refreshToken);
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('refreshToken', response.refreshToken);
            
            // 重新安排下次刷新
            this.scheduleTokenRefresh();
            
            return response.token;
            
        } catch (error) {
            // 刷新失败，执行登出
            this.logout('会话已过期，请重新登录');
            throw error;
        }
    }
    
    scheduleTokenRefresh() {
        // 清除现有定时器
        if (this.tokenRefreshTimer) {
            clearTimeout(this.tokenRefreshTimer);
        }
        
        // 解析token获取过期时间
        const token = this.getToken();
        if (!token) return;
        
        try {
            const payload = this.parseJWT(token);
            const expiresIn = payload.exp * 1000 - Date.now();
            
            // 在过期前5分钟刷新
            const refreshIn = Math.max(0, expiresIn - 5 * 60 * 1000);
            
            this.tokenRefreshTimer = setTimeout(() => {
                this.refreshToken();
            }, refreshIn);
            
        } catch (error) {
            console.error('Failed to parse token:', error);
        }
    }
    
    async verifyTwoFactor(code) {
        const response = await this.api.post('/2fa/verify', { code });
        this.saveAuthData(response);
        return response.user;
    }
    
    async enableTwoFactor() {
        const response = await this.api.post('/2fa/enable');
        return response; // { secret, qrCode }
    }
    
    async disableTwoFactor(password) {
        await this.api.post('/2fa/disable', { password });
    }
    
    // 辅助方法
    isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;
        
        try {
            const payload = this.parseJWT(token);
            return payload.exp * 1000 > Date.now();
        } catch {
            return false;
        }
    }
    
    getToken() {
        return localStorage.getItem('authToken');
    }
    
    getRefreshToken() {
        return localStorage.getItem('refreshToken');
    }
    
    getCurrentUser() {
        return this.store.getState().user;
    }
    
    parseJWT(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64).split('').map(c => 
                '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join('')
        );
        return JSON.parse(jsonPayload);
    }
    
    saveAuthData(data) {
        this.api.setAuth(data.token, data.refreshToken);
        
        // 保存用户信息（不包含敏感数据）
        const safeUser = {
            id: data.user.id,
            username: data.user.username,
            email: data.user.email,
            preferences: data.user.preferences
        };
        
        localStorage.setItem('user', JSON.stringify(safeUser));
    }
    
    clearAuthData() {
        this.api.clearAuth();
        localStorage.removeItem('user');
        sessionStorage.clear();
    }
    
    async restoreSession() {
        const token = this.getToken();
        if (!token) return null;
        
        try {
            // 验证token有效性
            const response = await this.api.get('/me');
            
            // 恢复用户状态
            this.store.setState({
                user: response.user,
                isAuthenticated: true
            });
            
            // 安排token刷新
            this.scheduleTokenRefresh();
            
            return response.user;
            
        } catch (error) {
            // Token无效，清理
            this.clearAuthData();
            return null;
        }
    }
    
    // 安全相关方法
    sanitizeInput(input) {
        if (typeof input !== 'string') return '';
        
        // 移除HTML标签
        let sanitized = input.replace(/<[^>]*>/g, '');
        
        // 转义特殊字符
        sanitized = sanitized
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
        
        // 限制长度
        return sanitized.substring(0, 1000);
    }
    
    validateRegistration(data) {
        const errors = [];
        
        // 用户名验证
        if (!data.username || data.username.length < 3) {
            errors.push('用户名至少需要3个字符');
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(data.username)) {
            errors.push('用户名只能包含字母、数字、下划线和连字符');
        }
        
        // 邮箱验证
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!data.email || !emailRegex.test(data.email)) {
            errors.push('请输入有效的邮箱地址');
        }
        
        // 密码验证
        if (!data.password || data.password.length < 8) {
            errors.push('密码至少需要8个字符');
        }
        if (data.password !== data.confirmPassword) {
            errors.push('两次输入的密码不一致');
        }
        
        return errors;
    }
    
    checkPasswordStrength(password) {
        let score = 0;
        const feedback = [];
        
        // 长度检查
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        else feedback.push('建议使用至少12个字符');
        
        // 复杂度检查
        if (/[a-z]/.test(password)) score++;
        else feedback.push('添加小写字母');
        
        if (/[A-Z]/.test(password)) score++;
        else feedback.push('添加大写字母');
        
        if (/[0-9]/.test(password)) score++;
        else feedback.push('添加数字');
        
        if (/[^a-zA-Z0-9]/.test(password)) score++;
        else feedback.push('添加特殊字符');
        
        // 常见密码检查
        const commonPasswords = ['password', '123456', 'qwerty', 'abc123'];
        if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
            score = Math.max(0, score - 2);
            feedback.push('避免使用常见密码');
        }
        
        return {
            score: Math.min(5, score),
            feedback: feedback.join('，')
        };
    }
    
    async generateDeviceFingerprint() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('fingerprint', 2, 2);
        
        const canvasData = canvas.toDataURL();
        const screenData = `${screen.width}x${screen.height}x${screen.colorDepth}`;
        const timezone = new Date().getTimezoneOffset();
        const language = navigator.language;
        const platform = navigator.platform;
        
        const fingerprint = `${canvasData}-${screenData}-${timezone}-${language}-${platform}`;
        
        // 生成哈希
        const encoder = new TextEncoder();
        const data = encoder.encode(fingerprint);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    async logFailedAttempt(username) {
        const attempts = JSON.parse(localStorage.getItem('failedAttempts') || '{}');
        const key = `${username}_${new Date().toDateString()}`;
        
        attempts[key] = (attempts[key] || 0) + 1;
        
        // 清理旧记录
        const cutoff = Date.now() - 24 * 60 * 60 * 1000;
        Object.keys(attempts).forEach(k => {
            const date = new Date(k.split('_')[1]);
            if (date.getTime() < cutoff) delete attempts[k];
        });
        
        localStorage.setItem('failedAttempts', JSON.stringify(attempts));
        
        // 检查是否需要临时锁定
        if (attempts[key] >= 5) {
            throw new Error('登录尝试次数过多，请稍后再试');
        }
    }
}
```

## CSRF和XSS防护

```javascript
// src/security/CSRFProtection.js - CSRF防护
export class CSRFProtection {
    constructor() {
        this.tokenKey = 'csrfToken';
        this.headerName = 'X-CSRF-Token';
    }
    
    generateToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        
        // 存储token
        sessionStorage.setItem(this.tokenKey, token);
        
        // 设置到meta标签
        let meta = document.querySelector('meta[name="csrf-token"]');
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = 'csrf-token';
            document.head.appendChild(meta);
        }
        meta.content = token;
        
        return token;
    }
    
    getToken() {
        return sessionStorage.getItem(this.tokenKey) || this.generateToken();
    }
    
    validateToken(token) {
        const storedToken = sessionStorage.getItem(this.tokenKey);
        return storedToken && storedToken === token;
    }
    
    addToRequest(config) {
        const token = this.getToken();
        if (!config.headers) {
            config.headers = {};
        }
        config.headers[this.headerName] = token;
        return config;
    }
    
    // 自动为所有表单添加CSRF token
    protectForms() {
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.tagName === 'FORM' && !form.querySelector('input[name="_csrf"]')) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = '_csrf';
                input.value = this.getToken();
                form.appendChild(input);
            }
        });
    }
}

// src/security/XSSProtection.js - XSS防护
export class XSSProtection {
    // 转义HTML特殊字符
    static escapeHtml(unsafe) {
        if (typeof unsafe !== 'string') return '';
        
        return unsafe
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')
            .replace(/\//g, '&#x2F;');
    }
    
    // 清理HTML内容
    static sanitizeHtml(html, allowedTags = []) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const walker = document.createTreeWalker(
            doc.body,
            NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT
        );
        
        const nodesToRemove = [];
        let node;
        
        while (node = walker.nextNode()) {
            if (node.nodeType === Node.ELEMENT_NODE) {
                // 检查标签是否允许
                if (!allowedTags.includes(node.tagName.toLowerCase())) {
                    nodesToRemove.push(node);
                    continue;
                }
                
                // 移除危险属性
                const attributes = Array.from(node.attributes);
                attributes.forEach(attr => {
                    if (this.isDangerousAttribute(attr.name, attr.value)) {
                        node.removeAttribute(attr.name);
                    }
                });
            }
        }
        
        // 移除不允许的节点
        nodesToRemove.forEach(node => node.remove());
        
        return doc.body.innerHTML;
    }
    
    static isDangerousAttribute(name, value) {
        // 危险属性名
        const dangerousAttrs = ['onclick', 'onload', 'onerror', 'onmouseover'];
        if (dangerousAttrs.some(attr => name.toLowerCase().startsWith(attr))) {
            return true;
        }
        
        // 危险属性值
        if (name === 'href' || name === 'src') {
            return value.toLowerCase().includes('javascript:') || 
                   value.toLowerCase().includes('data:text/html');
        }
        
        return false;
    }
    
    // 创建安全的DOM元素
    static createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        
        // 安全设置属性
        Object.entries(attributes).forEach(([key, value]) => {
            if (!this.isDangerousAttribute(key, value)) {
                element.setAttribute(key, value);
            }
        });
        
        // 安全设置内容
        if (content) {
            element.textContent = content; // 使用textContent而非innerHTML
        }
        
        return element;
    }
    
    // 安全的模板渲染
    static renderTemplate(template, data) {
        return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return this.escapeHtml(data[key] || '');
        });
    }
}

// src/security/SecurityHeaders.js - 安全头设置
export class SecurityHeaders {
    static getHeaders() {
        return {
            // 内容安全策略
            'Content-Security-Policy': [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                "font-src 'self' https://fonts.gstatic.com",
                "img-src 'self' data: https:",
                "connect-src 'self' https://api.example.com wss://ws.example.com",
                "frame-ancestors 'none'",
                "base-uri 'self'",
                "form-action 'self'"
            ].join('; '),
            
            // 其他安全头
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
        };
    }
    
    static applyToResponse(response) {
        const headers = this.getHeaders();
        Object.entries(headers).forEach(([key, value]) => {
            response.headers.set(key, value);
        });
        return response;
    }
}
```

## 权限控制系统

```javascript
// src/security/PermissionSystem.js - 权限系统
export class PermissionSystem {
    constructor(authService) {
        this.authService = authService;
        this.permissions = new Map();
        this.roles = new Map();
        
        // 定义默认角色
        this.defineDefaultRoles();
    }
    
    defineDefaultRoles() {
        // 管理员角色
        this.defineRole('admin', {
            permissions: [
                'tasks:create',
                'tasks:read',
                'tasks:update',
                'tasks:delete',
                'users:manage',
                'settings:manage'
            ]
        });
        
        // 普通用户角色
        this.defineRole('user', {
            permissions: [
                'tasks:create',
                'tasks:read',
                'tasks:update',
                'tasks:delete:own'
            ]
        });
        
        // 访客角色
        this.defineRole('guest', {
            permissions: [
                'tasks:read:public'
            ]
        });
    }
    
    defineRole(name, config) {
        this.roles.set(name, config);
    }
    
    definePermission(name, config) {
        this.permissions.set(name, config);
    }
    
    getUserRoles() {
        const user = this.authService.getCurrentUser();
        return user?.roles || ['guest'];
    }
    
    getUserPermissions() {
        const roles = this.getUserRoles();
        const permissions = new Set();
        
        roles.forEach(roleName => {
            const role = this.roles.get(roleName);
            if (role) {
                role.permissions.forEach(perm => permissions.add(perm));
            }
        });
        
        return Array.from(permissions);
    }
    
    hasPermission(permission, context = {}) {
        const user = this.authService.getCurrentUser();
        const userPermissions = this.getUserPermissions();
        
        // 检查精确权限
        if (userPermissions.includes(permission)) {
            return true;
        }
        
        // 检查通配符权限
        const permissionParts = permission.split(':');
        for (let i = permissionParts.length; i > 0; i--) {
            const wildcardPermission = permissionParts.slice(0, i).join(':') + ':*';
            if (userPermissions.includes(wildcardPermission)) {
                return true;
            }
        }
        
        // 检查上下文权限（如 :own）
        if (context.ownerId && user?.id === context.ownerId) {
            const ownPermission = permission + ':own';
            if (userPermissions.includes(ownPermission)) {
                return true;
            }
        }
        
        return false;
    }
    
    hasRole(role) {
        const userRoles = this.getUserRoles();
        return userRoles.includes(role);
    }
    
    hasAnyRole(roles) {
        const userRoles = this.getUserRoles();
        return roles.some(role => userRoles.includes(role));
    }
    
    hasAllRoles(roles) {
        const userRoles = this.getUserRoles();
        return roles.every(role => userRoles.includes(role));
    }
    
    // UI权限控制
    can(permission, context = {}) {
        return this.hasPermission(permission, context);
    }
    
    cannot(permission, context = {}) {
        return !this.hasPermission(permission, context);
    }
    
    // 权限守卫装饰器
    requirePermission(permission) {
        return (target, propertyKey, descriptor) => {
            const originalMethod = descriptor.value;
            
            descriptor.value = function(...args) {
                if (!this.permissionSystem.hasPermission(permission)) {
                    throw new Error(`权限不足：需要 ${permission} 权限`);
                }
                return originalMethod.apply(this, args);
            };
            
            return descriptor;
        };
    }
    
    // 组件权限控制
    protectComponent(component, requiredPermission) {
        return {
            render() {
                if (this.hasPermission(requiredPermission)) {
                    return component.render();
                }
                return null;
            }
        };
    }
}

// src/security/RateLimiter.js - 速率限制
export class RateLimiter {
    constructor() {
        this.limits = new Map();
    }
    
    configure(key, options) {
        this.limits.set(key, {
            maxRequests: options.maxRequests || 10,
            windowMs: options.windowMs || 60000, // 1分钟
            requests: new Map()
        });
    }
    
    check(key, identifier = 'global') {
        const limit = this.limits.get(key);
        if (!limit) return true;
        
        const now = Date.now();
        const windowStart = now - limit.windowMs;
        
        // 清理过期的请求记录
        const requests = limit.requests.get(identifier) || [];
        const validRequests = requests.filter(time => time > windowStart);
        
        // 检查是否超限
        if (validRequests.length >= limit.maxRequests) {
            const oldestRequest = validRequests[0];
            const resetTime = oldestRequest + limit.windowMs;
            const retryAfter = Math.ceil((resetTime - now) / 1000);
            
            throw new Error(`请求过于频繁，请在 ${retryAfter} 秒后重试`);
        }
        
        // 记录新请求
        validRequests.push(now);
        limit.requests.set(identifier, validRequests);
        
        return true;
    }
    
    reset(key, identifier = 'global') {
        const limit = this.limits.get(key);
        if (limit) {
            limit.requests.delete(identifier);
        }
    }
}

// 使用示例
const rateLimiter = new RateLimiter();

// 配置API速率限制
rateLimiter.configure('api', {
    maxRequests: 100,
    windowMs: 60000 // 1分钟100次
});

// 配置登录速率限制
rateLimiter.configure('login', {
    maxRequests: 5,
    windowMs: 300000 // 5分钟5次
});
```