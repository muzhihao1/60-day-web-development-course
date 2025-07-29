---
title: "数据保护技术"
category: "security"
language: "javascript"
---

# 数据保护技术

## Web Crypto API加密实践

```javascript
// 现代加密工具类
class CryptoManager {
    constructor() {
        this.algorithm = 'AES-GCM';
        this.keyLength = 256;
        this.ivLength = 12; // 96 bits for GCM
        this.saltLength = 16; // 128 bits
        this.iterations = 100000;
    }
    
    // 生成加密密钥
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
    
    // 从密码派生密钥
    async deriveKeyFromPassword(password, salt) {
        // 将密码转换为密钥材料
        const encoder = new TextEncoder();
        const passwordKey = await crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );
        
        // 使用PBKDF2派生密钥
        return await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: this.iterations,
                hash: 'SHA-256'
            },
            passwordKey,
            {
                name: this.algorithm,
                length: this.keyLength
            },
            true,
            ['encrypt', 'decrypt']
        );
    }
    
    // 加密数据
    async encrypt(data, key) {
        // 生成随机IV
        const iv = crypto.getRandomValues(new Uint8Array(this.ivLength));
        
        // 编码数据
        const encoder = new TextEncoder();
        const encodedData = encoder.encode(JSON.stringify(data));
        
        // 执行加密
        const encryptedData = await crypto.subtle.encrypt(
            {
                name: this.algorithm,
                iv: iv
            },
            key,
            encodedData
        );
        
        // 组合IV和加密数据
        const combined = new Uint8Array(iv.length + encryptedData.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encryptedData), iv.length);
        
        // 返回base64编码
        return btoa(String.fromCharCode.apply(null, combined));
    }
    
    // 解密数据
    async decrypt(encryptedString, key) {
        // Base64解码
        const combined = Uint8Array.from(atob(encryptedString), c => c.charCodeAt(0));
        
        // 提取IV和加密数据
        const iv = combined.slice(0, this.ivLength);
        const encryptedData = combined.slice(this.ivLength);
        
        // 执行解密
        const decryptedData = await crypto.subtle.decrypt(
            {
                name: this.algorithm,
                iv: iv
            },
            key,
            encryptedData
        );
        
        // 解码并解析JSON
        const decoder = new TextDecoder();
        return JSON.parse(decoder.decode(decryptedData));
    }
    
    // 生成密钥对（用于非对称加密）
    async generateKeyPair() {
        return await crypto.subtle.generateKey(
            {
                name: 'RSA-OAEP',
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: 'SHA-256'
            },
            true,
            ['encrypt', 'decrypt']
        );
    }
    
    // 导出密钥
    async exportKey(key) {
        const exported = await crypto.subtle.exportKey('jwk', key);
        return JSON.stringify(exported);
    }
    
    // 导入密钥
    async importKey(jwkString, keyUsages) {
        const jwk = JSON.parse(jwkString);
        return await crypto.subtle.importKey(
            'jwk',
            jwk,
            {
                name: this.algorithm,
                length: this.keyLength
            },
            true,
            keyUsages
        );
    }
    
    // 生成数字签名
    async sign(data, privateKey) {
        const encoder = new TextEncoder();
        const encoded = encoder.encode(JSON.stringify(data));
        
        const signature = await crypto.subtle.sign(
            {
                name: 'RSA-PSS',
                saltLength: 32
            },
            privateKey,
            encoded
        );
        
        return btoa(String.fromCharCode.apply(null, new Uint8Array(signature)));
    }
    
    // 验证签名
    async verify(data, signature, publicKey) {
        const encoder = new TextEncoder();
        const encoded = encoder.encode(JSON.stringify(data));
        const sig = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
        
        return await crypto.subtle.verify(
            {
                name: 'RSA-PSS',
                saltLength: 32
            },
            publicKey,
            sig,
            encoded
        );
    }
}

// 安全存储管理器
class SecureStorageManager {
    constructor() {
        this.crypto = new CryptoManager();
        this.masterKeyName = 'master_key';
    }
    
    // 初始化主密钥
    async init(password) {
        // 检查是否已有主密钥
        let masterKey = await this.getMasterKey();
        
        if (!masterKey) {
            // 生成新的主密钥
            const salt = crypto.getRandomValues(new Uint8Array(this.crypto.saltLength));
            masterKey = await this.crypto.deriveKeyFromPassword(password, salt);
            
            // 存储主密钥信息（实际应用中应更安全地存储）
            localStorage.setItem('master_salt', btoa(String.fromCharCode.apply(null, salt)));
        }
        
        this.masterKey = masterKey;
    }
    
    // 获取主密钥
    async getMasterKey() {
        // 这里简化处理，实际应用中应该有更安全的密钥管理
        return this.masterKey;
    }
    
    // 安全存储数据
    async secureStore(key, data, options = {}) {
        const {
            encrypt = true,
            sign = false,
            expires = null
        } = options;
        
        const storageData = {
            data,
            timestamp: Date.now(),
            expires
        };
        
        let finalData = storageData;
        
        if (encrypt && this.masterKey) {
            finalData = await this.crypto.encrypt(storageData, this.masterKey);
        }
        
        localStorage.setItem(key, JSON.stringify({
            encrypted: encrypt,
            signed: sign,
            data: finalData
        }));
    }
    
    // 安全获取数据
    async secureRetrieve(key) {
        const stored = localStorage.getItem(key);
        if (!stored) return null;
        
        try {
            const wrapper = JSON.parse(stored);
            let data = wrapper.data;
            
            if (wrapper.encrypted && this.masterKey) {
                data = await this.crypto.decrypt(data, this.masterKey);
            }
            
            // 检查过期
            if (data.expires && Date.now() > data.expires) {
                localStorage.removeItem(key);
                return null;
            }
            
            return data.data;
        } catch (error) {
            console.error('Failed to retrieve secure data:', error);
            return null;
        }
    }
    
    // 清理过期数据
    async cleanup() {
        const keys = Object.keys(localStorage);
        
        for (const key of keys) {
            try {
                await this.secureRetrieve(key); // 这会自动删除过期项
            } catch (error) {
                // 忽略错误
            }
        }
    }
}
```

## 内容安全策略（CSP）高级实现

```javascript
// CSP管理器
class CSPManager {
    constructor() {
        this.policies = new Map();
        this.nonces = new Map();
        this.reportUri = '/csp-report';
        this.reportOnly = false;
    }
    
    // 创建策略构建器
    createPolicy(name) {
        const policy = new CSPPolicy(name);
        this.policies.set(name, policy);
        return policy;
    }
    
    // 生成nonce
    generateNonce() {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        const nonce = btoa(String.fromCharCode.apply(null, array));
        this.nonces.set(nonce, Date.now());
        
        // 清理旧nonce（5分钟后过期）
        this.cleanupNonces();
        
        return nonce;
    }
    
    // 清理过期nonce
    cleanupNonces() {
        const now = Date.now();
        const timeout = 5 * 60 * 1000; // 5分钟
        
        for (const [nonce, timestamp] of this.nonces) {
            if (now - timestamp > timeout) {
                this.nonces.delete(nonce);
            }
        }
    }
    
    // 应用策略到页面
    applyPolicy(policyName) {
        const policy = this.policies.get(policyName);
        if (!policy) {
            throw new Error(`Policy ${policyName} not found`);
        }
        
        const meta = document.createElement('meta');
        meta.httpEquiv = this.reportOnly ? 
            'Content-Security-Policy-Report-Only' : 
            'Content-Security-Policy';
        meta.content = policy.build(this.reportUri);
        
        // 移除旧策略
        const oldMeta = document.querySelector('meta[http-equiv*="Content-Security-Policy"]');
        if (oldMeta) {
            oldMeta.remove();
        }
        
        document.head.appendChild(meta);
    }
    
    // 为脚本添加nonce
    addNonceToScript(script) {
        const nonce = this.generateNonce();
        script.setAttribute('nonce', nonce);
        return nonce;
    }
    
    // 处理CSP违规报告
    handleViolation(report) {
        console.error('CSP Violation:', {
            documentUri: report['document-uri'],
            violatedDirective: report['violated-directive'],
            blockedUri: report['blocked-uri'],
            lineNumber: report['line-number'],
            columnNumber: report['column-number'],
            sourceFile: report['source-file']
        });
        
        // 发送到服务器
        this.sendReport(report);
    }
    
    // 发送违规报告
    async sendReport(report) {
        try {
            await fetch(this.reportUri, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/csp-report'
                },
                body: JSON.stringify({ 'csp-report': report })
            });
        } catch (error) {
            console.error('Failed to send CSP report:', error);
        }
    }
}

// CSP策略类
class CSPPolicy {
    constructor(name) {
        this.name = name;
        this.directives = new Map();
        this.upgradeInsecureRequests = false;
        this.blockAllMixedContent = false;
    }
    
    // 添加指令
    addDirective(directive, ...sources) {
        if (!this.directives.has(directive)) {
            this.directives.set(directive, new Set());
        }
        
        sources.forEach(source => {
            this.directives.get(directive).add(source);
        });
        
        return this;
    }
    
    // 常用指令方法
    defaultSrc(...sources) {
        return this.addDirective('default-src', ...sources);
    }
    
    scriptSrc(...sources) {
        return this.addDirective('script-src', ...sources);
    }
    
    styleSrc(...sources) {
        return this.addDirective('style-src', ...sources);
    }
    
    imgSrc(...sources) {
        return this.addDirective('img-src', ...sources);
    }
    
    connectSrc(...sources) {
        return this.addDirective('connect-src', ...sources);
    }
    
    fontSrc(...sources) {
        return this.addDirective('font-src', ...sources);
    }
    
    objectSrc(...sources) {
        return this.addDirective('object-src', ...sources);
    }
    
    mediaSrc(...sources) {
        return this.addDirective('media-src', ...sources);
    }
    
    frameSrc(...sources) {
        return this.addDirective('frame-src', ...sources);
    }
    
    sandbox(...values) {
        return this.addDirective('sandbox', ...values);
    }
    
    reportUri(uri) {
        return this.addDirective('report-uri', uri);
    }
    
    // 启用HTTPS升级
    enableUpgradeInsecureRequests() {
        this.upgradeInsecureRequests = true;
        return this;
    }
    
    // 阻止所有混合内容
    enableBlockAllMixedContent() {
        this.blockAllMixedContent = true;
        return this;
    }
    
    // 构建策略字符串
    build(reportUri) {
        const parts = [];
        
        // 添加指令
        for (const [directive, sources] of this.directives) {
            const sourceList = Array.from(sources).join(' ');
            parts.push(`${directive} ${sourceList}`);
        }
        
        // 添加特殊指令
        if (this.upgradeInsecureRequests) {
            parts.push('upgrade-insecure-requests');
        }
        
        if (this.blockAllMixedContent) {
            parts.push('block-all-mixed-content');
        }
        
        // 添加报告URI
        if (reportUri && !this.directives.has('report-uri')) {
            parts.push(`report-uri ${reportUri}`);
        }
        
        return parts.join('; ');
    }
}

// 使用示例
const cspManager = new CSPManager();

// 创建严格策略
const strictPolicy = cspManager.createPolicy('strict')
    .defaultSrc("'self'")
    .scriptSrc("'self'", "'strict-dynamic'")
    .styleSrc("'self'", "'unsafe-inline'")
    .imgSrc("'self'", "data:", "https:")
    .connectSrc("'self'", "https://api.example.com")
    .fontSrc("'self'", "https://fonts.gstatic.com")
    .objectSrc("'none'")
    .frameSrc("'none'")
    .enableUpgradeInsecureRequests()
    .enableBlockAllMixedContent();

// 应用策略
cspManager.applyPolicy('strict');

// 动态添加脚本
function addSecureScript(src) {
    const script = document.createElement('script');
    const nonce = cspManager.addNonceToScript(script);
    
    // 更新CSP以包含nonce
    strictPolicy.scriptSrc(`'nonce-${nonce}'`);
    cspManager.applyPolicy('strict');
    
    script.src = src;
    document.head.appendChild(script);
}
```

## 安全通信模式

```javascript
// 安全WebSocket通信
class SecureWebSocket {
    constructor(url, options = {}) {
        this.url = url;
        this.options = {
            reconnectInterval: 5000,
            maxReconnectAttempts: 5,
            heartbeatInterval: 30000,
            encryptMessages: true,
            ...options
        };
        
        this.ws = null;
        this.reconnectAttempts = 0;
        this.messageQueue = [];
        this.crypto = new CryptoManager();
        this.sessionKey = null;
        this.callbacks = new Map();
        
        this.connect();
    }
    
    // 建立连接
    async connect() {
        try {
            // 确保使用WSS协议
            const secureUrl = this.url.replace('ws://', 'wss://');
            this.ws = new WebSocket(secureUrl);
            
            this.ws.onopen = () => this.handleOpen();
            this.ws.onmessage = (event) => this.handleMessage(event);
            this.ws.onerror = (error) => this.handleError(error);
            this.ws.onclose = () => this.handleClose();
            
        } catch (error) {
            console.error('WebSocket connection failed:', error);
            this.scheduleReconnect();
        }
    }
    
    // 连接打开处理
    async handleOpen() {
        console.log('Secure WebSocket connected');
        this.reconnectAttempts = 0;
        
        // 执行握手和密钥交换
        await this.performHandshake();
        
        // 开始心跳
        this.startHeartbeat();
        
        // 发送队列中的消息
        this.flushMessageQueue();
        
        this.emit('open');
    }
    
    // 执行安全握手
    async performHandshake() {
        // 生成会话密钥
        this.sessionKey = await this.crypto.generateKey();
        
        // 发送握手消息（实际应用中应使用更复杂的密钥交换）
        const handshake = {
            type: 'handshake',
            version: '1.0',
            timestamp: Date.now()
        };
        
        this.sendRaw(handshake);
    }
    
    // 处理消息
    async handleMessage(event) {
        try {
            let data = JSON.parse(event.data);
            
            // 解密消息（如果启用）
            if (this.options.encryptMessages && data.encrypted) {
                data = await this.decryptMessage(data);
            }
            
            // 验证消息完整性
            if (!this.verifyMessage(data)) {
                console.error('Message integrity check failed');
                return;
            }
            
            // 处理不同类型的消息
            switch (data.type) {
                case 'handshake-ack':
                    this.handleHandshakeAck(data);
                    break;
                case 'heartbeat':
                    this.handleHeartbeat(data);
                    break;
                case 'message':
                    this.emit('message', data.payload);
                    break;
                case 'error':
                    this.emit('error', data.error);
                    break;
                default:
                    this.emit(data.type, data);
            }
            
        } catch (error) {
            console.error('Failed to process message:', error);
        }
    }
    
    // 发送消息
    async send(message) {
        if (this.ws?.readyState !== WebSocket.OPEN) {
            // 添加到队列
            this.messageQueue.push(message);
            return;
        }
        
        const envelope = {
            type: 'message',
            payload: message,
            timestamp: Date.now(),
            id: this.generateMessageId()
        };
        
        // 加密消息（如果启用）
        if (this.options.encryptMessages && this.sessionKey) {
            envelope.encrypted = true;
            envelope.payload = await this.crypto.encrypt(message, this.sessionKey);
        }
        
        // 添加消息签名
        envelope.signature = this.signMessage(envelope);
        
        this.sendRaw(envelope);
    }
    
    // 发送原始消息
    sendRaw(data) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }
    
    // 加密消息
    async encryptMessage(message) {
        if (!this.sessionKey) {
            throw new Error('No session key available');
        }
        
        return await this.crypto.encrypt(message, this.sessionKey);
    }
    
    // 解密消息
    async decryptMessage(envelope) {
        if (!this.sessionKey) {
            throw new Error('No session key available');
        }
        
        const decrypted = await this.crypto.decrypt(envelope.payload, this.sessionKey);
        return {
            ...envelope,
            payload: decrypted,
            encrypted: false
        };
    }
    
    // 签名消息
    signMessage(message) {
        // 简化的签名实现
        const data = JSON.stringify({
            payload: message.payload,
            timestamp: message.timestamp,
            id: message.id
        });
        
        return btoa(data); // 实际应使用真正的签名算法
    }
    
    // 验证消息
    verifyMessage(message) {
        // 验证时间戳（防止重放攻击）
        const now = Date.now();
        const maxAge = 5 * 60 * 1000; // 5分钟
        
        if (Math.abs(now - message.timestamp) > maxAge) {
            return false;
        }
        
        // 验证签名（简化版）
        // 实际应用中应进行真正的签名验证
        return true;
    }
    
    // 心跳机制
    startHeartbeat() {
        this.heartbeatTimer = setInterval(() => {
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.sendRaw({
                    type: 'heartbeat',
                    timestamp: Date.now()
                });
            }
        }, this.options.heartbeatInterval);
    }
    
    // 停止心跳
    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }
    
    // 重连逻辑
    scheduleReconnect() {
        if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            this.emit('maxReconnectAttemptsReached');
            return;
        }
        
        this.reconnectAttempts++;
        const delay = this.options.reconnectInterval * this.reconnectAttempts;
        
        console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
        
        setTimeout(() => {
            this.connect();
        }, delay);
    }
    
    // 清空消息队列
    flushMessageQueue() {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            this.send(message);
        }
    }
    
    // 生成消息ID
    generateMessageId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // 关闭连接
    close() {
        this.stopHeartbeat();
        if (this.ws) {
            this.ws.close();
        }
    }
    
    // 错误处理
    handleError(error) {
        console.error('WebSocket error:', error);
        this.emit('error', error);
    }
    
    // 连接关闭处理
    handleClose() {
        console.log('WebSocket closed');
        this.stopHeartbeat();
        this.emit('close');
        this.scheduleReconnect();
    }
    
    // 事件管理
    on(event, callback) {
        if (!this.callbacks.has(event)) {
            this.callbacks.set(event, new Set());
        }
        this.callbacks.get(event).add(callback);
    }
    
    off(event, callback) {
        const callbacks = this.callbacks.get(event);
        if (callbacks) {
            callbacks.delete(callback);
        }
    }
    
    emit(event, data) {
        const callbacks = this.callbacks.get(event);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${event} callback:`, error);
                }
            });
        }
    }
}

// 安全的API客户端
class SecureAPIClient {
    constructor(baseURL, options = {}) {
        this.baseURL = baseURL;
        this.options = {
            timeout: 30000,
            retries: 3,
            backoffMultiplier: 2,
            ...options
        };
        
        this.interceptors = {
            request: [],
            response: []
        };
        
        this.setupSecurityHeaders();
    }
    
    // 设置安全头
    setupSecurityHeaders() {
        this.defaultHeaders = {
            'X-Requested-With': 'XMLHttpRequest',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
        };
    }
    
    // 添加请求拦截器
    addRequestInterceptor(interceptor) {
        this.interceptors.request.push(interceptor);
    }
    
    // 添加响应拦截器
    addResponseInterceptor(interceptor) {
        this.interceptors.response.push(interceptor);
    }
    
    // 执行请求
    async request(method, endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        let config = {
            method,
            headers: {
                ...this.defaultHeaders,
                ...options.headers
            },
            credentials: 'same-origin',
            timeout: this.options.timeout,
            ...options
        };
        
        // 执行请求拦截器
        for (const interceptor of this.interceptors.request) {
            config = await interceptor(config);
        }
        
        // 添加请求体
        if (options.data) {
            config.body = JSON.stringify(options.data);
            config.headers['Content-Type'] = 'application/json';
        }
        
        // 执行请求（带重试）
        let lastError;
        for (let attempt = 0; attempt <= this.options.retries; attempt++) {
            try {
                const response = await this.fetchWithTimeout(url, config);
                
                // 执行响应拦截器
                let processedResponse = response;
                for (const interceptor of this.interceptors.response) {
                    processedResponse = await interceptor(processedResponse);
                }
                
                return processedResponse;
                
            } catch (error) {
                lastError = error;
                
                if (attempt < this.options.retries) {
                    const delay = Math.pow(this.options.backoffMultiplier, attempt) * 1000;
                    await this.sleep(delay);
                }
            }
        }
        
        throw lastError;
    }
    
    // 带超时的fetch
    async fetchWithTimeout(url, options) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), options.timeout);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            
            clearTimeout(timeout);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return response;
        } catch (error) {
            clearTimeout(timeout);
            
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            
            throw error;
        }
    }
    
    // 辅助方法
    async get(endpoint, options) {
        return this.request('GET', endpoint, options);
    }
    
    async post(endpoint, data, options) {
        return this.request('POST', endpoint, { ...options, data });
    }
    
    async put(endpoint, data, options) {
        return this.request('PUT', endpoint, { ...options, data });
    }
    
    async delete(endpoint, options) {
        return this.request('DELETE', endpoint, options);
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 使用示例
// 初始化加密管理器
const cryptoManager = new CryptoManager();

// 创建安全存储
const secureStorage = new SecureStorageManager();
await secureStorage.init('user-password');

// 存储敏感数据
await secureStorage.secureStore('sensitive-data', {
    apiKey: 'secret-key',
    userToken: 'auth-token'
}, {
    encrypt: true,
    expires: Date.now() + 24 * 60 * 60 * 1000 // 24小时
});

// 创建安全WebSocket连接
const secureWS = new SecureWebSocket('wss://secure-api.example.com/ws', {
    encryptMessages: true,
    heartbeatInterval: 30000
});

secureWS.on('open', () => {
    console.log('Secure connection established');
    secureWS.send({ type: 'subscribe', channel: 'updates' });
});

secureWS.on('message', (data) => {
    console.log('Received secure message:', data);
});

// 创建安全API客户端
const apiClient = new SecureAPIClient('https://api.example.com', {
    timeout: 30000,
    retries: 3
});

// 添加认证拦截器
apiClient.addRequestInterceptor(async (config) => {
    const token = await secureStorage.secureRetrieve('auth-token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 发起安全请求
try {
    const response = await apiClient.get('/secure-data');
    const data = await response.json();
    console.log('Secure data:', data);
} catch (error) {
    console.error('Secure request failed:', error);
}
```