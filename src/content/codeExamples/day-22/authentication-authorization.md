---
title: "身份认证与授权"
description: "学习和掌握身份认证与授权的实际应用"
category: "security"
language: "javascript"
---

# 身份认证与授权

## JWT（JSON Web Token）实现

```javascript
// JWT工具类
class JWTManager {
    constructor() {
        // 注意：这里的密钥仅用于演示，生产环境应使用安全的密钥管理
        this.secret = 'your-256-bit-secret';
        this.algorithm = 'HS256';
        this.issuer = 'your-app';
        this.audience = 'your-app-users';
    }
    
    // Base64URL编码
    base64urlEncode(str) {
        return btoa(str)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }
    
    // Base64URL解码
    base64urlDecode(str) {
        str += '='.repeat((4 - str.length % 4) % 4);
        return atob(str.replace(/-/g, '+').replace(/_/g, '/'));
    }
    
    // 创建JWT（简化版，实际应使用crypto库）
    createToken(payload, options = {}) {
        const {
            expiresIn = 3600, // 1小时
            subject = null,
            jwtid = null
        } = options;
        
        // Header
        const header = {
            alg: this.algorithm,
            typ: 'JWT'
        };
        
        // Payload
        const now = Math.floor(Date.now() / 1000);
        const tokenPayload = {
            ...payload,
            iss: this.issuer,
            aud: this.audience,
            iat: now,
            exp: now + expiresIn,
            jti: jwtid || this.generateJTI()
        };
        
        if (subject) {
            tokenPayload.sub = subject;
        }
        
        // 编码
        const encodedHeader = this.base64urlEncode(JSON.stringify(header));
        const encodedPayload = this.base64urlEncode(JSON.stringify(tokenPayload));
        
        // 签名（简化版）
        const signature = this.createSignature(encodedHeader, encodedPayload);
        
        return `${encodedHeader}.${encodedPayload}.${signature}`;
    }
    
    // 创建签名（实际应使用Web Crypto API）
    createSignature(header, payload) {
        const data = `${header}.${payload}`;
        // 这是简化的签名，实际应使用HMAC-SHA256
        return this.base64urlEncode(btoa(data + this.secret));
    }
    
    // 验证JWT
    verifyToken(token) {
        try {
            const [header, payload, signature] = token.split('.');
            
            if (!header || !payload || !signature) {
                return { valid: false, error: 'Invalid token format' };
            }
            
            // 验证签名
            const expectedSignature = this.createSignature(header, payload);
            if (signature !== expectedSignature) {
                return { valid: false, error: 'Invalid signature' };
            }
            
            // 解码payload
            const decodedPayload = JSON.parse(this.base64urlDecode(payload));
            
            // 验证时间
            const now = Math.floor(Date.now() / 1000);
            if (decodedPayload.exp && decodedPayload.exp < now) {
                return { valid: false, error: 'Token expired' };
            }
            
            if (decodedPayload.nbf && decodedPayload.nbf > now) {
                return { valid: false, error: 'Token not yet valid' };
            }
            
            // 验证发行者和受众
            if (decodedPayload.iss !== this.issuer) {
                return { valid: false, error: 'Invalid issuer' };
            }
            
            if (decodedPayload.aud !== this.audience) {
                return { valid: false, error: 'Invalid audience' };
            }
            
            return { valid: true, payload: decodedPayload };
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }
    
    // 生成JWT ID
    generateJTI() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // 刷新token
    refreshToken(oldToken) {
        const verification = this.verifyToken(oldToken);
        
        if (!verification.valid) {
            throw new Error('Invalid token for refresh');
        }
        
        const { iss, aud, jti, ...userPayload } = verification.payload;
        
        return this.createToken(userPayload, {
            jwtid: this.generateJTI()
        });
    }
}

// Token存储管理
class TokenStorage {
    constructor() {
        this.accessTokenKey = 'access_token';
        this.refreshTokenKey = 'refresh_token';
        this.storage = window.localStorage;
    }
    
    // 安全存储token
    saveTokens(accessToken, refreshToken) {
        // 存储在内存中（最安全）
        this.accessTokenMemory = accessToken;
        
        // Refresh token可以存储在localStorage（HttpOnly cookie更好）
        if (refreshToken) {
            this.storage.setItem(this.refreshTokenKey, refreshToken);
        }
    }
    
    // 获取access token
    getAccessToken() {
        return this.accessTokenMemory;
    }
    
    // 获取refresh token
    getRefreshToken() {
        return this.storage.getItem(this.refreshTokenKey);
    }
    
    // 清除tokens
    clearTokens() {
        this.accessTokenMemory = null;
        this.storage.removeItem(this.refreshTokenKey);
    }
    
    // 自动刷新机制
    setupAutoRefresh(jwtManager, onRefresh) {
        setInterval(() => {
            const accessToken = this.getAccessToken();
            if (!accessToken) return;
            
            const verification = jwtManager.verifyToken(accessToken);
            if (!verification.valid) return;
            
            const timeUntilExpiry = verification.payload.exp - Math.floor(Date.now() / 1000);
            
            // 如果还有5分钟过期，刷新token
            if (timeUntilExpiry < 300) {
                const refreshToken = this.getRefreshToken();
                if (refreshToken) {
                    onRefresh(refreshToken);
                }
            }
        }, 60000); // 每分钟检查一次
    }
}
```

## OAuth 2.0集成

```javascript
// OAuth 2.0客户端
class OAuth2Client {
    constructor(config) {
        this.clientId = config.clientId;
        this.redirectUri = config.redirectUri;
        this.authorizationEndpoint = config.authorizationEndpoint;
        this.tokenEndpoint = config.tokenEndpoint;
        this.scope = config.scope || 'openid profile email';
        this.responseType = config.responseType || 'code';
        this.grantType = config.grantType || 'authorization_code';
    }
    
    // 生成随机字符串
    generateRandomString(length = 32) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        
        for (let i = 0; i < length; i++) {
            result += chars[array[i] % chars.length];
        }
        
        return result;
    }
    
    // 生成PKCE challenge
    async generatePKCEChallenge() {
        const verifier = this.generateRandomString(128);
        const encoder = new TextEncoder();
        const data = encoder.encode(verifier);
        const hash = await crypto.subtle.digest('SHA-256', data);
        
        const challenge = btoa(String.fromCharCode.apply(null, new Uint8Array(hash)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
        
        return { verifier, challenge };
    }
    
    // 开始授权流程
    async authorize() {
        // 生成state防止CSRF
        const state = this.generateRandomString();
        sessionStorage.setItem('oauth_state', state);
        
        // 生成PKCE
        const pkce = await this.generatePKCEChallenge();
        sessionStorage.setItem('oauth_verifier', pkce.verifier);
        
        // 构建授权URL
        const params = new URLSearchParams({
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            response_type: this.responseType,
            scope: this.scope,
            state: state,
            code_challenge: pkce.challenge,
            code_challenge_method: 'S256'
        });
        
        const authUrl = `${this.authorizationEndpoint}?${params.toString()}`;
        
        // 重定向到授权服务器
        window.location.href = authUrl;
    }
    
    // 处理回调
    async handleCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');
        
        if (error) {
            throw new Error(`OAuth error: ${error} - ${urlParams.get('error_description')}`);
        }
        
        // 验证state
        const savedState = sessionStorage.getItem('oauth_state');
        if (!state || state !== savedState) {
            throw new Error('Invalid state parameter');
        }
        
        // 获取verifier
        const verifier = sessionStorage.getItem('oauth_verifier');
        if (!verifier) {
            throw new Error('Missing PKCE verifier');
        }
        
        // 清理临时数据
        sessionStorage.removeItem('oauth_state');
        sessionStorage.removeItem('oauth_verifier');
        
        // 交换code获取token
        return await this.exchangeCodeForToken(code, verifier);
    }
    
    // 交换授权码
    async exchangeCodeForToken(code, verifier) {
        const params = new URLSearchParams({
            grant_type: this.grantType,
            code: code,
            redirect_uri: this.redirectUri,
            client_id: this.clientId,
            code_verifier: verifier
        });
        
        try {
            const response = await fetch(this.tokenEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params.toString()
            });
            
            if (!response.ok) {
                throw new Error('Token exchange failed');
            }
            
            const data = await response.json();
            
            return {
                accessToken: data.access_token,
                idToken: data.id_token,
                refreshToken: data.refresh_token,
                expiresIn: data.expires_in,
                tokenType: data.token_type
            };
        } catch (error) {
            console.error('Token exchange error:', error);
            throw error;
        }
    }
    
    // 刷新访问令牌
    async refreshAccessToken(refreshToken) {
        const params = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: this.clientId
        });
        
        const response = await fetch(this.tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
        });
        
        if (!response.ok) {
            throw new Error('Token refresh failed');
        }
        
        return await response.json();
    }
}

// 使用示例
const oauth2Client = new OAuth2Client({
    clientId: 'your-client-id',
    redirectUri: 'https://yourapp.com/callback',
    authorizationEndpoint: 'https://oauth.provider.com/authorize',
    tokenEndpoint: 'https://oauth.provider.com/token',
    scope: 'openid profile email'
});

// 开始登录
document.getElementById('login-button')?.addEventListener('click', () => {
    oauth2Client.authorize();
});

// 处理回调（在回调页面）
if (window.location.pathname === '/callback') {
    oauth2Client.handleCallback()
        .then(tokens => {
            console.log('Login successful:', tokens);
            // 存储tokens并重定向到应用
        })
        .catch(error => {
            console.error('Login failed:', error);
        });
}
```

## 基于角色的访问控制（RBAC）

```javascript
// RBAC实现
class RBACManager {
    constructor() {
        this.roles = new Map();
        this.permissions = new Map();
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
    
    // 为角色添加权限
    addPermissionToRole(roleName, permissionName) {
        const role = this.roles.get(roleName);
        if (role && this.permissions.has(permissionName)) {
            role.permissions.add(permissionName);
            return true;
        }
        return false;
    }
    
    // 分配角色给用户
    assignRole(userId, roleName) {
        if (!this.roles.has(roleName)) {
            throw new Error(`Role ${roleName} does not exist`);
        }
        
        if (!this.userRoles.has(userId)) {
            this.userRoles.set(userId, new Set());
        }
        
        this.userRoles.get(userId).add(roleName);
    }
    
    // 撤销用户角色
    revokeRole(userId, roleName) {
        const userRoles = this.userRoles.get(userId);
        if (userRoles) {
            userRoles.delete(roleName);
        }
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
        
        if (!userRoles) return permissions;
        
        for (const roleName of userRoles) {
            const role = this.roles.get(roleName);
            if (role) {
                role.permissions.forEach(perm => permissions.add(perm));
            }
        }
        
        return permissions;
    }
    
    // 创建权限检查中间件
    requirePermission(permission) {
        return (userId) => {
            if (!this.hasPermission(userId, permission)) {
                throw new Error(`Access denied: Missing permission ${permission}`);
            }
            return true;
        };
    }
    
    // 创建角色检查中间件
    requireRole(role) {
        return (userId) => {
            const userRoles = this.userRoles.get(userId);
            if (!userRoles || !userRoles.has(role)) {
                throw new Error(`Access denied: Missing role ${role}`);
            }
            return true;
        };
    }
}

// 权限装饰器（用于方法级别的访问控制）
function RequirePermission(permission) {
    return function(target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        
        descriptor.value = function(...args) {
            // 假设第一个参数是context，包含userId
            const context = args[0];
            if (!context || !context.userId) {
                throw new Error('Missing user context');
            }
            
            // 获取全局RBAC实例
            const rbac = window.rbacManager || new RBACManager();
            
            if (!rbac.hasPermission(context.userId, permission)) {
                throw new Error(`Access denied: Missing permission ${permission}`);
            }
            
            return originalMethod.apply(this, args);
        };
        
        return descriptor;
    };
}

// 资源级别访问控制
class ResourceAccessControl {
    constructor(rbacManager) {
        this.rbac = rbacManager;
        this.resourceOwners = new Map();
        this.resourcePermissions = new Map();
    }
    
    // 设置资源所有者
    setResourceOwner(resourceId, ownerId) {
        this.resourceOwners.set(resourceId, ownerId);
    }
    
    // 检查资源访问权限
    canAccess(userId, resourceId, action) {
        // 检查是否是所有者
        if (this.resourceOwners.get(resourceId) === userId) {
            return true;
        }
        
        // 检查是否有相应权限
        const permission = `${resourceId}:${action}`;
        return this.rbac.hasPermission(userId, permission);
    }
    
    // 授予资源权限
    grantResourcePermission(userId, resourceId, actions) {
        const key = `${userId}:${resourceId}`;
        if (!this.resourcePermissions.has(key)) {
            this.resourcePermissions.set(key, new Set());
        }
        
        actions.forEach(action => {
            this.resourcePermissions.get(key).add(action);
        });
    }
}

// 使用示例
const rbac = new RBACManager();

// 定义权限
rbac.definePermission('read', '读取权限');
rbac.definePermission('write', '写入权限');
rbac.definePermission('delete', '删除权限');
rbac.definePermission('admin', '管理员权限');

// 定义角色
rbac.defineRole('viewer', ['read']);
rbac.defineRole('editor', ['read', 'write']);
rbac.defineRole('admin', ['read', 'write', 'delete', 'admin']);

// 分配角色
rbac.assignRole('user123', 'editor');
rbac.assignRole('admin456', 'admin');

// 检查权限
console.log('User can read:', rbac.hasPermission('user123', 'read')); // true
console.log('User can delete:', rbac.hasPermission('user123', 'delete')); // false

// 使用装饰器的示例类
class DocumentService {
    @RequirePermission('read')
    readDocument(context, documentId) {
        return `Reading document ${documentId}`;
    }
    
    @RequirePermission('write')
    updateDocument(context, documentId, data) {
        return `Updating document ${documentId}`;
    }
    
    @RequirePermission('delete')
    deleteDocument(context, documentId) {
        return `Deleting document ${documentId}`;
    }
}
```

## 会话管理

```javascript
// 安全会话管理器
class SessionManager {
    constructor(options = {}) {
        this.sessionTimeout = options.sessionTimeout || 30 * 60 * 1000; // 30分钟
        this.warningTime = options.warningTime || 5 * 60 * 1000; // 5分钟警告
        this.storage = options.storage || sessionStorage;
        this.sessionKey = 'user_session';
        this.listeners = new Map();
        
        this.init();
    }
    
    init() {
        // 监听用户活动
        this.setupActivityListeners();
        
        // 检查会话状态
        this.checkSession();
        
        // 定期检查
        setInterval(() => this.checkSession(), 60000); // 每分钟检查
    }
    
    // 创建会话
    createSession(userData) {
        const session = {
            id: this.generateSessionId(),
            userId: userData.userId,
            createdAt: Date.now(),
            lastActivity: Date.now(),
            expires: Date.now() + this.sessionTimeout,
            data: userData
        };
        
        this.storage.setItem(this.sessionKey, JSON.stringify(session));
        this.emit('sessionCreated', session);
        
        return session;
    }
    
    // 获取当前会话
    getSession() {
        const stored = this.storage.getItem(this.sessionKey);
        if (!stored) return null;
        
        try {
            const session = JSON.parse(stored);
            
            // 检查是否过期
            if (Date.now() > session.expires) {
                this.destroySession();
                return null;
            }
            
            return session;
        } catch (error) {
            console.error('Invalid session data:', error);
            return null;
        }
    }
    
    // 更新会话活动时间
    updateActivity() {
        const session = this.getSession();
        if (!session) return;
        
        session.lastActivity = Date.now();
        session.expires = Date.now() + this.sessionTimeout;
        
        this.storage.setItem(this.sessionKey, JSON.stringify(session));
    }
    
    // 销毁会话
    destroySession() {
        const session = this.getSession();
        
        this.storage.removeItem(this.sessionKey);
        this.emit('sessionDestroyed', session);
        
        // 清理其他存储
        this.clearUserData();
    }
    
    // 检查会话状态
    checkSession() {
        const session = this.getSession();
        if (!session) return;
        
        const now = Date.now();
        const timeLeft = session.expires - now;
        
        if (timeLeft <= 0) {
            // 会话已过期
            this.destroySession();
        } else if (timeLeft <= this.warningTime) {
            // 即将过期警告
            this.emit('sessionWarning', {
                timeLeft,
                session
            });
        }
    }
    
    // 设置活动监听器
    setupActivityListeners() {
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        
        const activityHandler = throttle(() => {
            this.updateActivity();
        }, 60000); // 最多每分钟更新一次
        
        events.forEach(event => {
            document.addEventListener(event, activityHandler, { passive: true });
        });
    }
    
    // 生成会话ID
    generateSessionId() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
    
    // 清理用户数据
    clearUserData() {
        // 清理localStorage
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('user_')) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // 清理sessionStorage
        sessionStorage.clear();
        
        // 清理cookies
        document.cookie.split(';').forEach(cookie => {
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        });
    }
    
    // 事件管理
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
    }
    
    off(event, callback) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.delete(callback);
        }
    }
    
    emit(event, data) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${event} listener:`, error);
                }
            });
        }
    }
}

// 节流函数
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 使用示例
const sessionManager = new SessionManager({
    sessionTimeout: 30 * 60 * 1000, // 30分钟
    warningTime: 5 * 60 * 1000 // 5分钟警告
});

// 监听会话事件
sessionManager.on('sessionWarning', ({ timeLeft }) => {
    const minutes = Math.floor(timeLeft / 60000);
    console.warn(`Session expiring in ${minutes} minutes`);
    
    // 显示警告对话框
    if (confirm(`您的会话将在${minutes}分钟后过期，是否继续？`)) {
        sessionManager.updateActivity();
    }
});

sessionManager.on('sessionDestroyed', () => {
    console.log('Session destroyed, redirecting to login...');
    window.location.href = '/login';
});

// 创建会话
const session = sessionManager.createSession({
    userId: 'user123',
    username: 'john.doe',
    roles: ['user', 'editor']
});

// 模拟API请求拦截器
class AuthInterceptor {
    constructor(tokenStorage, sessionManager) {
        this.tokenStorage = tokenStorage;
        this.sessionManager = sessionManager;
    }
    
    // 请求拦截
    async beforeRequest(config) {
        const session = this.sessionManager.getSession();
        if (!session) {
            throw new Error('No active session');
        }
        
        const token = this.tokenStorage.getAccessToken();
        if (!token) {
            throw new Error('No access token');
        }
        
        // 添加认证头
        config.headers = {
            ...config.headers,
            'Authorization': `Bearer ${token}`,
            'X-Session-ID': session.id
        };
        
        return config;
    }
    
    // 响应拦截
    async afterResponse(response) {
        // 检查是否需要刷新token
        if (response.status === 401) {
            const refreshToken = this.tokenStorage.getRefreshToken();
            if (refreshToken) {
                // 尝试刷新token
                // ... 刷新逻辑
            } else {
                // 会话过期，销毁会话
                this.sessionManager.destroySession();
            }
        }
        
        return response;
    }
}
```