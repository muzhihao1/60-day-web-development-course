---
day: 18
title: "Fetch API基础用法"
description: "学习和掌握Fetch API基础用法的实际应用"
category: "basic"
language: "javascript"
---

# Fetch API基础用法

## 基本GET请求

```javascript
// 最简单的GET请求
fetch('https://jsonplaceholder.typicode.com/users/1')
  .then(response => response.json())
  .then(user => {
    console.log('用户信息:', user);
  })
  .catch(error => {
    console.error('请求失败:', error);
  });

// 使用async/await
async function getUser(userId) {
  try {
    const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const user = await response.json();
    return user;
  } catch (error) {
    console.error('获取用户失败:', error);
    throw error;
  }
}

// 调用函数
getUser(1).then(user => console.log(user));
```

## POST请求示例

```javascript
// 创建新用户
async function createUser(userData) {
  const response = await fetch('https://jsonplaceholder.typicode.com/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData)
  });
  
  if (!response.ok) {
    throw new Error('创建用户失败');
  }
  
  return response.json();
}

// 使用示例
createUser({
  name: 'John Doe',
  username: 'johndoe',
  email: 'john@example.com'
})
.then(newUser => {
  console.log('新用户创建成功:', newUser);
})
.catch(error => {
  console.error('错误:', error);
});
```

## 处理不同的响应类型

```javascript
// 获取JSON数据
async function fetchJSON(url) {
  const response = await fetch(url);
  return response.json();
}

// 获取文本数据
async function fetchText(url) {
  const response = await fetch(url);
  return response.text();
}

// 获取图片并显示
async function fetchAndDisplayImage(imageUrl) {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  
  // 创建对象URL
  const objectURL = URL.createObjectURL(blob);
  
  // 创建img元素并显示
  const img = document.createElement('img');
  img.src = objectURL;
  document.body.appendChild(img);
  
  // 记得在不需要时释放对象URL
  // URL.revokeObjectURL(objectURL);
}

// 下载文件
async function downloadFile(url, filename) {
  const response = await fetch(url);
  const blob = await response.blob();
  
  // 创建下载链接
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  
  // 清理
  URL.revokeObjectURL(a.href);
}
```

## 设置请求头

```javascript
// 带认证的请求
async function fetchWithAuth(url, token) {
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Custom-Header': 'custom-value'
    }
  });
  
  return response.json();
}

// 发送表单数据
async function submitForm(formData) {
  const response = await fetch('/api/submit', {
    method: 'POST',
    body: formData  // FormData自动设置正确的Content-Type
  });
  
  return response.json();
}

// 使用URLSearchParams
async function sendUrlEncodedData(data) {
  const params = new URLSearchParams();
  Object.keys(data).forEach(key => {
    params.append(key, data[key]);
  });
  
  const response = await fetch('/api/form', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params
  });
  
  return response.json();
}
```

## 完整的错误处理示例

```javascript
class FetchError extends Error {
  constructor(response) {
    super(`HTTP ${response.status}: ${response.statusText}`);
    this.name = 'FetchError';
    this.response = response;
  }
}

async function robustFetch(url, options = {}) {
  try {
    const response = await fetch(url, options);
    
    // 检查响应状态
    if (!response.ok) {
      throw new FetchError(response);
    }
    
    // 检查响应类型
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else if (contentType && contentType.includes('text/')) {
      return await response.text();
    } else {
      return response;
    }
    
  } catch (error) {
    if (error instanceof TypeError) {
      // 网络错误
      console.error('网络错误:', error.message);
      throw new Error('网络连接失败');
    } else if (error instanceof FetchError) {
      // HTTP错误
      console.error('HTTP错误:', error.message);
      
      // 尝试获取错误详情
      try {
        const errorBody = await error.response.json();
        throw new Error(errorBody.message || error.message);
      } catch {
        throw error;
      }
    } else {
      // 其他错误
      throw error;
    }
  }
}

// 使用示例
robustFetch('https://api.example.com/data')
  .then(data => console.log('成功:', data))
  .catch(error => console.error('失败:', error.message));
```