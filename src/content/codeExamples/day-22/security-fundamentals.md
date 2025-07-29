---
title: "安全基础实践"
category: "security"
language: "javascript"
---

# 安全基础实践

## XSS（跨站脚本）防护

```javascript
// 1. 输入验证和清理
class InputSanitizer {
    constructor() {
        // 危险HTML标签列表
        this.dangerousTags = [
            'script', 'iframe', 'object', 'embed', 'link',
            'style', 'meta', 'base', 'form'
        ];
        
        // 危险属性列表
        this.dangerousAttributes = [
            'onclick', 'onload', 'onerror', 'onmouseover',
            'javascript:', 'data:', 'vbscript:'
        ];
    }
    
    // HTML实体编码
    escapeHtml(str) {
        const htmlEntities = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;'
        };
        
        return String(str).replace(/[&<>"'\/]/g, s => htmlEntities[s]);
    }
    
    // 移除危险标签
    removeDangerousTags(html) {
        let cleaned = html;
        
        this.dangerousTags.forEach(tag => {
            const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>|<${tag}[^>]*>`, 'gi');
            cleaned = cleaned.replace(regex, '');
        });
        
        return cleaned;
    }
    
    // 清理属性
    cleanAttributes(html) {
        let cleaned = html;
        
        this.dangerousAttributes.forEach(attr => {
            if (attr.includes(':')) {
                // 清理协议类属性
                const regex = new RegExp(`(href|src)\\s*=\\s*["']?${attr}[^"'\\s>]*["']?`, 'gi');
                cleaned = cleaned.replace(regex, '');
            } else {
                // 清理事件处理器
                const regex = new RegExp(`${attr}\\s*=\\s*["'][^"']*["']`, 'gi');
                cleaned = cleaned.replace(regex, '');
            }
        });
        
        return cleaned;
    }
    
    // 综合清理方法
    sanitize(input, options = {}) {
        const {
            allowHtml = false,
            allowedTags = [],
            maxLength = 10000
        } = options;
        
        // 长度限制
        let cleaned = String(input).substring(0, maxLength);
        
        if (!allowHtml) {
            // 不允许HTML，进行完全转义
            return this.escapeHtml(cleaned);
        }
        
        // 允许部分HTML
        cleaned = this.removeDangerousTags(cleaned);
        cleaned = this.cleanAttributes(cleaned);
        
        // 白名单过滤
        if (allowedTags.length > 0) {
            const allowedTagsRegex = allowedTags.join('|');
            const regex = new RegExp(`<(?!\\/?(${allowedTagsRegex})(\\s|>))[^>]*>`, 'gi');
            cleaned = cleaned.replace(regex, '');
        }
        
        return cleaned;
    }
}

// 2. 安全的DOM操作
class SafeDOM {
    // 安全设置文本内容
    static setText(element, text) {
        if (element instanceof Element) {
            element.textContent = text;
        }
    }
    
    // 安全设置HTML（谨慎使用）
    static setHTML(element, html, sanitizer) {
        if (element instanceof Element && sanitizer) {
            element.innerHTML = sanitizer.sanitize(html, { allowHtml: true });
        }
    }
    
    // 创建安全的元素
    static createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        
        // 安全设置属性
        Object.entries(attributes).forEach(([key, value]) => {
            if (key.startsWith('on')) {
                // 跳过事件处理器
                console.warn(`Event handler ${key} ignored for security`);
                return;
            }
            
            if (key === 'href' || key === 'src') {
                // 验证URL
                if (this.isValidUrl(value)) {
                    element.setAttribute(key, value);
                }
            } else {
                element.setAttribute(key, String(value));
            }
        });
        
        // 安全设置内容
        if (content) {
            element.textContent = content;
        }
        
        return element;
    }
    
    // URL验证
    static isValidUrl(url) {
        try {
            const parsed = new URL(url);
            // 只允许http(s)协议
            return ['http:', 'https:'].includes(parsed.protocol);
        } catch {
            return false;
        }
    }
}

// 3. Content Security Policy (CSP) 助手
class CSPBuilder {
    constructor() {
        this.directives = new Map();
    }
    
    // 设置默认源
    defaultSrc(...sources) {
        this.directives.set('default-src', sources);
        return this;
    }
    
    // 设置脚本源
    scriptSrc(...sources) {
        this.directives.set('script-src', sources);
        return this;
    }
    
    // 设置样式源
    styleSrc(...sources) {
        this.directives.set('style-src', sources);
        return this;
    }
    
    // 设置图片源
    imgSrc(...sources) {
        this.directives.set('img-src', sources);
        return this;
    }
    
    // 设置连接源
    connectSrc(...sources) {
        this.directives.set('connect-src', sources);
        return this;
    }
    
    // 设置字体源
    fontSrc(...sources) {
        this.directives.set('font-src', sources);
        return this;
    }
    
    // 设置frame源
    frameSrc(...sources) {
        this.directives.set('frame-src', sources);
        return this;
    }
    
    // 添加nonce支持
    addNonce(nonce) {
        this.nonce = nonce;
        return this;
    }
    
    // 构建CSP字符串
    build() {
        const policies = [];
        
        this.directives.forEach((sources, directive) => {
            let sourcesStr = sources.join(' ');
            
            // 添加nonce
            if (this.nonce && (directive === 'script-src' || directive === 'style-src')) {
                sourcesStr += ` 'nonce-${this.nonce}'`;
            }
            
            policies.push(`${directive} ${sourcesStr}`);
        });
        
        return policies.join('; ');
    }
    
    // 应用到meta标签
    applyToMeta() {
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = this.build();
        document.head.appendChild(meta);
    }
}

// 使用示例
const sanitizer = new InputSanitizer();

// 处理用户输入
function handleUserInput(input) {
    // 清理输入
    const cleaned = sanitizer.sanitize(input, {
        allowHtml: true,
        allowedTags: ['p', 'br', 'strong', 'em', 'a'],
        maxLength: 5000
    });
    
    // 安全显示
    const outputElement = document.getElementById('output');
    SafeDOM.setHTML(outputElement, cleaned, sanitizer);
}

// 构建CSP策略
const csp = new CSPBuilder()
    .defaultSrc("'self'")
    .scriptSrc("'self'", "'strict-dynamic'")
    .styleSrc("'self'", "'unsafe-inline'")
    .imgSrc("'self'", "data:", "https:")
    .connectSrc("'self'", "https://api.example.com")
    .fontSrc("'self'", "https://fonts.gstatic.com")
    .frameSrc("'none'")
    .build();

console.log('CSP Policy:', csp);
```

## CSRF（跨站请求伪造）防护

```javascript
// 1. CSRF Token管理
class CSRFProtection {
    constructor() {
        this.tokenLength = 32;
        this.tokenHeader = 'X-CSRF-Token';
        this.tokenCookie = 'csrf_token';
        this.tokens = new Map();
    }
    
    // 生成安全随机token
    generateToken() {
        const array = new Uint8Array(this.tokenLength);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
    
    // 创建并存储token
    createToken(sessionId) {
        const token = this.generateToken();
        this.tokens.set(sessionId, {
            token,
            createdAt: Date.now(),
            used: false
        });
        
        // 设置过期时间（1小时）
        setTimeout(() => {
            this.tokens.delete(sessionId);
        }, 3600000);
        
        return token;
    }
    
    // 验证token
    verifyToken(sessionId, token) {
        const storedData = this.tokens.get(sessionId);
        
        if (!storedData) {
            return { valid: false, reason: 'Token not found' };
        }
        
        if (storedData.token !== token) {
            return { valid: false, reason: 'Token mismatch' };
        }
        
        if (storedData.used) {
            return { valid: false, reason: 'Token already used' };
        }
        
        // 检查过期（1小时）
        if (Date.now() - storedData.createdAt > 3600000) {
            this.tokens.delete(sessionId);
            return { valid: false, reason: 'Token expired' };
        }
        
        // 标记为已使用（单次使用）
        storedData.used = true;
        
        return { valid: true };
    }
    
    // 中间件：注入token到表单
    injectTokenToForm(form, token) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = '_csrf';
        input.value = token;
        form.appendChild(input);
    }
    
    // 中间件：为所有AJAX请求添加token
    setupAjaxProtection(token) {
        // 拦截fetch
        const originalFetch = window.fetch;
        window.fetch = function(url, options = {}) {
            // 只为同源请求添加token
            if (CSRFProtection.isSameOrigin(url)) {
                options.headers = {
                    ...options.headers,
                    [this.tokenHeader]: token
                };
            }
            
            return originalFetch.call(this, url, options);
        }.bind(this);
        
        // 拦截XMLHttpRequest
        const originalOpen = XMLHttpRequest.prototype.open;
        const self = this;
        
        XMLHttpRequest.prototype.open = function(method, url, ...args) {
            this._url = url;
            this._method = method;
            return originalOpen.apply(this, [method, url, ...args]);
        };
        
        const originalSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.send = function(...args) {
            if (CSRFProtection.isSameOrigin(this._url) && 
                !['GET', 'HEAD', 'OPTIONS'].includes(this._method)) {
                this.setRequestHeader(self.tokenHeader, token);
            }
            
            return originalSend.apply(this, args);
        };
    }
    
    // 检查是否同源
    static isSameOrigin(url) {
        try {
            const parsed = new URL(url, window.location.href);
            return parsed.origin === window.location.origin;
        } catch {
            return true; // 相对URL视为同源
        }
    }
}

// 2. 双重提交Cookie模式
class DoubleSubmitCookie {
    constructor() {
        this.cookieName = 'csrf_token';
        this.headerName = 'X-CSRF-Token';
    }
    
    // 设置CSRF cookie
    setCookie(token, options = {}) {
        const {
            path = '/',
            sameSite = 'Strict',
            secure = true,
            httpOnly = false  // 需要JS访问
        } = options;
        
        let cookie = `${this.cookieName}=${token}`;
        cookie += `; Path=${path}`;
        cookie += `; SameSite=${sameSite}`;
        
        if (secure && window.location.protocol === 'https:') {
            cookie += '; Secure';
        }
        
        if (httpOnly) {
            console.warn('httpOnly cannot be set from JavaScript');
        }
        
        document.cookie = cookie;
    }
    
    // 获取cookie值
    getCookie() {
        const match = document.cookie.match(new RegExp(`${this.cookieName}=([^;]+)`));
        return match ? match[1] : null;
    }
    
    // 为请求添加header
    addToRequest(request) {
        const token = this.getCookie();
        if (token) {
            if (request instanceof Request) {
                request.headers.append(this.headerName, token);
            } else if (request instanceof XMLHttpRequest) {
                request.setRequestHeader(this.headerName, token);
            }
        }
    }
    
    // 服务端验证逻辑（示例）
    serverSideVerify(cookieToken, headerToken) {
        if (!cookieToken || !headerToken) {
            return { valid: false, reason: 'Missing token' };
        }
        
        if (cookieToken !== headerToken) {
            return { valid: false, reason: 'Token mismatch' };
        }
        
        return { valid: true };
    }
}

// 3. SameSite Cookie配置
class SecureCookieManager {
    // 设置安全cookie
    static set(name, value, options = {}) {
        const {
            expires = null,
            maxAge = null,
            path = '/',
            domain = null,
            secure = true,
            httpOnly = true,
            sameSite = 'Strict'
        } = options;
        
        let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
        
        if (expires) {
            cookie += `; Expires=${expires.toUTCString()}`;
        }
        
        if (maxAge !== null) {
            cookie += `; Max-Age=${maxAge}`;
        }
        
        cookie += `; Path=${path}`;
        
        if (domain) {
            cookie += `; Domain=${domain}`;
        }
        
        if (secure && window.location.protocol === 'https:') {
            cookie += '; Secure';
        }
        
        if (httpOnly) {
            console.warn('httpOnly cannot be set from JavaScript - set it on server side');
        }
        
        cookie += `; SameSite=${sameSite}`;
        
        document.cookie = cookie;
    }
    
    // 获取cookie
    static get(name) {
        const nameEQ = encodeURIComponent(name) + '=';
        const ca = document.cookie.split(';');
        
        for (let c of ca) {
            c = c.trim();
            if (c.indexOf(nameEQ) === 0) {
                return decodeURIComponent(c.substring(nameEQ.length));
            }
        }
        
        return null;
    }
    
    // 删除cookie
    static delete(name, options = {}) {
        this.set(name, '', {
            ...options,
            maxAge: 0
        });
    }
}

// 使用示例
const csrfProtection = new CSRFProtection();
const sessionId = 'user-session-123';
const csrfToken = csrfProtection.createToken(sessionId);

// 为表单添加CSRF token
const form = document.getElementById('sensitive-form');
if (form) {
    csrfProtection.injectTokenToForm(form, csrfToken);
}

// 设置AJAX保护
csrfProtection.setupAjaxProtection(csrfToken);

// 双重提交模式
const doubleSubmit = new DoubleSubmitCookie();
doubleSubmit.setCookie(csrfToken, {
    sameSite: 'Strict',
    secure: true
});

// 安全的表单提交
async function submitSecureForm(formData) {
    const token = doubleSubmit.getCookie();
    
    try {
        const response = await fetch('/api/secure-endpoint', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': token
            },
            body: JSON.stringify(formData),
            credentials: 'same-origin' // 包含cookie
        });
        
        if (!response.ok) {
            throw new Error('Request failed');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Secure form submission failed:', error);
        throw error;
    }
}
```

## 点击劫持防护

```javascript
// 点击劫持防护
class ClickjackingProtection {
    constructor() {
        this.frameOptions = 'DENY'; // DENY, SAMEORIGIN, ALLOW-FROM
        this.protectionEnabled = true;
    }
    
    // 框架破坏脚本
    bustFrame() {
        if (this.protectionEnabled) {
            // 检测是否在iframe中
            if (window.top !== window.self) {
                // 尝试跳出框架
                try {
                    window.top.location = window.self.location;
                } catch (e) {
                    // 如果跨域无法访问top，则显示警告
                    document.body.innerHTML = '';
                    document.body.style.backgroundColor = '#ff0000';
                    document.body.innerHTML = `
                        <div style="position: fixed; top: 50%; left: 50%; 
                                    transform: translate(-50%, -50%); 
                                    background: white; padding: 20px; 
                                    border: 2px solid black; z-index: 9999;">
                            <h1>安全警告</h1>
                            <p>此页面不允许在框架中显示。</p>
                            <p>请<a href="${window.location.href}" target="_top">
                               点击这里</a>在新窗口中打开。</p>
                        </div>
                    `;
                }
            }
        }
    }
    
    // 添加样式保护
    addStyleProtection() {
        const style = document.createElement('style');
        style.textContent = `
            /* 防止透明覆盖 */
            body {
                position: relative;
                z-index: 1;
            }
            
            /* 检测可疑的覆盖层 */
            iframe, object, embed {
                visibility: visible !important;
                opacity: 1 !important;
            }
            
            /* 禁用指针事件穿透 */
            .clickjacking-protected {
                pointer-events: auto !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    // 监测可疑行为
    detectSuspiciousActivity() {
        // 监听可疑的iframe创建
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.tagName === 'IFRAME' || 
                        node.tagName === 'OBJECT' || 
                        node.tagName === 'EMBED') {
                        
                        // 检查是否透明或定位可疑
                        const styles = window.getComputedStyle(node);
                        const opacity = parseFloat(styles.opacity);
                        const position = styles.position;
                        
                        if (opacity < 0.5 || 
                            (position === 'absolute' || position === 'fixed')) {
                            console.warn('Suspicious iframe detected:', node);
                            
                            // 可选：移除可疑元素
                            if (this.protectionEnabled) {
                                node.remove();
                            }
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // 初始化所有保护
    init() {
        // 破坏框架
        this.bustFrame();
        
        // 添加样式保护
        this.addStyleProtection();
        
        // 监测可疑活动
        this.detectSuspiciousActivity();
        
        // 定期检查
        setInterval(() => this.bustFrame(), 1000);
    }
}

// 使用
const clickjackingProtection = new ClickjackingProtection();
clickjackingProtection.init();
```

## 安全的客户端存储

```javascript
// 加密存储包装器
class SecureStorage {
    constructor(storageType = 'localStorage') {
        this.storage = window[storageType];
        this.encryptionKey = this.deriveKey();
    }
    
    // 从环境派生密钥（示例）
    deriveKey() {
        // 实际应用中应使用更安全的密钥管理
        const baseKey = 'your-app-secret-key';
        const userAgent = navigator.userAgent;
        
        return btoa(baseKey + userAgent).substring(0, 32);
    }
    
    // 简单的XOR加密（仅用于演示，生产环境应使用Web Crypto API）
    encrypt(data) {
        const json = JSON.stringify(data);
        let encrypted = '';
        
        for (let i = 0; i < json.length; i++) {
            encrypted += String.fromCharCode(
                json.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
            );
        }
        
        return btoa(encrypted);
    }
    
    // 解密
    decrypt(encrypted) {
        try {
            const decoded = atob(encrypted);
            let decrypted = '';
            
            for (let i = 0; i < decoded.length; i++) {
                decrypted += String.fromCharCode(
                    decoded.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
                );
            }
            
            return JSON.parse(decrypted);
        } catch (error) {
            console.error('Decryption failed:', error);
            return null;
        }
    }
    
    // 安全存储
    setItem(key, value, options = {}) {
        const {
            encrypt = true,
            expires = null
        } = options;
        
        const data = {
            value,
            timestamp: Date.now(),
            expires
        };
        
        const stored = encrypt ? this.encrypt(data) : JSON.stringify(data);
        this.storage.setItem(key, stored);
    }
    
    // 安全获取
    getItem(key, options = {}) {
        const {
            decrypt = true
        } = options;
        
        const stored = this.storage.getItem(key);
        if (!stored) return null;
        
        const data = decrypt ? this.decrypt(stored) : JSON.parse(stored);
        if (!data) return null;
        
        // 检查过期
        if (data.expires && Date.now() > data.expires) {
            this.storage.removeItem(key);
            return null;
        }
        
        return data.value;
    }
    
    // 清理过期项
    cleanup() {
        const keys = Object.keys(this.storage);
        
        keys.forEach(key => {
            try {
                const item = this.getItem(key);
                // 如果返回null，说明已过期并被删除
            } catch (error) {
                // 如果解密失败，删除损坏的数据
                this.storage.removeItem(key);
            }
        });
    }
}

// 使用示例
const secureStorage = new SecureStorage();

// 存储敏感数据
secureStorage.setItem('user_session', {
    token: 'sensitive-token',
    userId: 12345
}, {
    encrypt: true,
    expires: Date.now() + 3600000 // 1小时后过期
});

// 获取数据
const session = secureStorage.getItem('user_session');
console.log('Session:', session);

// 定期清理
setInterval(() => secureStorage.cleanup(), 300000); // 每5分钟清理一次
```