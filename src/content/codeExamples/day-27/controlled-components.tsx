// controlled-components.tsx - 受控组件完全指南

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';

// 1. 基础受控输入组件
function BasicControlledInputs() {
  const [text, setText] = useState('');
  const [number, setNumber] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  return (
    <div style={{ padding: '20px' }}>
      <h3>基础受控输入</h3>
      
      {/* 文本输入 */}
      <div style={{ marginBottom: '10px' }}>
        <label>
          文本输入:
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="输入文本"
          />
        </label>
        <p>当前值: {text}</p>
      </div>
      
      {/* 数字输入 */}
      <div style={{ marginBottom: '10px' }}>
        <label>
          数字输入:
          <input
            type="number"
            value={number}
            onChange={(e) => setNumber(Number(e.target.value))}
          />
        </label>
        <p>当前值: {number} (类型: {typeof number})</p>
      </div>
      
      {/* 邮箱输入 */}
      <div style={{ marginBottom: '10px' }}>
        <label>
          邮箱输入:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
          />
        </label>
        <p>有效邮箱: {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '✓' : '✗'}</p>
      </div>
      
      {/* 密码输入 */}
      <div style={{ marginBottom: '10px' }}>
        <label>
          密码输入:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <p>密码强度: {password.length < 6 ? '弱' : password.length < 10 ? '中' : '强'}</p>
      </div>
    </div>
  );
}

// 2. 高级输入控制
function AdvancedInputControl() {
  const [phone, setPhone] = useState('');
  const [creditCard, setCreditCard] = useState('');
  const [amount, setAmount] = useState('');
  
  // 格式化电话号码
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };
  
  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };
  
  // 格式化信用卡号
  const formatCreditCard = (value: string) => {
    const numbers = value.replace(/\s/g, '');
    const groups = numbers.match(/.{1,4}/g) || [];
    return groups.join(' ').substr(0, 19);
  };
  
  const handleCreditCardChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCreditCard(e.target.value);
    setCreditCard(formatted);
  };
  
  // 格式化金额
  const formatAmount = (value: string) => {
    const numbers = value.replace(/[^\d.]/g, '');
    const parts = numbers.split('.');
    if (parts.length > 2) return amount; // 防止多个小数点
    if (parts[1] && parts[1].length > 2) {
      parts[1] = parts[1].slice(0, 2); // 限制两位小数
    }
    return parts.join('.');
  };
  
  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAmount(e.target.value);
    setAmount(formatted);
  };
  
  return (
    <div style={{ padding: '20px' }}>
      <h3>高级输入控制</h3>
      
      {/* 电话号码格式化 */}
      <div style={{ marginBottom: '10px' }}>
        <label>
          电话号码:
          <input
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="123-456-7890"
            maxLength={12}
          />
        </label>
      </div>
      
      {/* 信用卡号格式化 */}
      <div style={{ marginBottom: '10px' }}>
        <label>
          信用卡号:
          <input
            type="text"
            value={creditCard}
            onChange={handleCreditCardChange}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
          />
        </label>
      </div>
      
      {/* 金额格式化 */}
      <div style={{ marginBottom: '10px' }}>
        <label>
          金额:
          <input
            type="text"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0.00"
          />
        </label>
        <p>格式化金额: ${amount || '0.00'}</p>
      </div>
    </div>
  );
}

// 3. 受控选择组件
function ControlledSelections() {
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedFruits, setSelectedFruits] = useState<string[]>([]);
  const [selectedSize, setSelectedSize] = useState('medium');
  const [agreement, setAgreement] = useState(false);
  
  // 处理多选
  const handleFruitChange = (fruit: string) => {
    setSelectedFruits(prev => 
      prev.includes(fruit)
        ? prev.filter(f => f !== fruit)
        : [...prev, fruit]
    );
  };
  
  const colors = ['红色', '蓝色', '绿色', '黄色'];
  const fruits = ['苹果', '香蕉', '橙子', '葡萄'];
  const sizes = ['small', 'medium', 'large'];
  
  return (
    <div style={{ padding: '20px' }}>
      <h3>受控选择组件</h3>
      
      {/* 下拉选择 */}
      <div style={{ marginBottom: '10px' }}>
        <label>
          选择颜色:
          <select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)}>
            <option value="">请选择</option>
            {colors.map(color => (
              <option key={color} value={color}>{color}</option>
            ))}
          </select>
        </label>
        <p>选中: {selectedColor || '未选择'}</p>
      </div>
      
      {/* 复选框组 */}
      <div style={{ marginBottom: '10px' }}>
        <p>选择水果:</p>
        {fruits.map(fruit => (
          <label key={fruit} style={{ display: 'block' }}>
            <input
              type="checkbox"
              checked={selectedFruits.includes(fruit)}
              onChange={() => handleFruitChange(fruit)}
            />
            {fruit}
          </label>
        ))}
        <p>选中: {selectedFruits.join(', ') || '无'}</p>
      </div>
      
      {/* 单选按钮组 */}
      <div style={{ marginBottom: '10px' }}>
        <p>选择尺寸:</p>
        {sizes.map(size => (
          <label key={size} style={{ marginRight: '10px' }}>
            <input
              type="radio"
              name="size"
              value={size}
              checked={selectedSize === size}
              onChange={(e) => setSelectedSize(e.target.value)}
            />
            {size}
          </label>
        ))}
        <p>选中: {selectedSize}</p>
      </div>
      
      {/* 单个复选框 */}
      <div style={{ marginBottom: '10px' }}>
        <label>
          <input
            type="checkbox"
            checked={agreement}
            onChange={(e) => setAgreement(e.target.checked)}
          />
          我同意服务条款
        </label>
        <p>状态: {agreement ? '已同意' : '未同意'}</p>
      </div>
    </div>
  );
}

// 4. 表单验证和错误处理
interface FormData {
  username: string;
  email: string;
  age: string;
  bio: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  age?: string;
  bio?: string;
}

function FormValidation() {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    age: '',
    bio: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 验证规则
  const validate = (name: keyof FormData, value: string): string | undefined => {
    switch (name) {
      case 'username':
        if (!value) return '用户名是必填项';
        if (value.length < 3) return '用户名至少3个字符';
        if (value.length > 20) return '用户名最多20个字符';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return '用户名只能包含字母、数字和下划线';
        break;
        
      case 'email':
        if (!value) return '邮箱是必填项';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return '请输入有效的邮箱地址';
        break;
        
      case 'age':
        if (!value) return '年龄是必填项';
        const age = Number(value);
        if (isNaN(age)) return '请输入有效的数字';
        if (age < 1 || age > 150) return '请输入合理的年龄';
        break;
        
      case 'bio':
        if (value.length > 200) return '个人简介最多200个字符';
        break;
    }
    return undefined;
  };
  
  // 处理输入变化
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // 如果字段已经被触摸过，立即验证
    if (touched[name]) {
      const error = validate(name as keyof FormData, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };
  
  // 处理失焦
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validate(name as keyof FormData, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };
  
  // 处理提交
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // 标记所有字段为已触摸
    const allTouched = Object.keys(formData).reduce((acc, key) => ({
      ...acc,
      [key]: true,
    }), {});
    setTouched(allTouched);
    
    // 验证所有字段
    const newErrors: FormErrors = {};
    Object.entries(formData).forEach(([key, value]) => {
      const error = validate(key as keyof FormData, value);
      if (error) {
        newErrors[key as keyof FormErrors] = error;
      }
    });
    
    setErrors(newErrors);
    
    // 如果有错误，不提交
    if (Object.keys(newErrors).length > 0) {
      return;
    }
    
    // 模拟提交
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    alert('表单提交成功！');
    setIsSubmitting(false);
    
    // 重置表单
    setFormData({ username: '', email: '', age: '', bio: '' });
    setTouched({});
    setErrors({});
  };
  
  return (
    <div style={{ padding: '20px' }}>
      <h3>表单验证</h3>
      <form onSubmit={handleSubmit} style={{ maxWidth: '400px' }}>
        {/* 用户名 */}
        <div style={{ marginBottom: '15px' }}>
          <label>
            用户名 *
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onBlur={handleBlur}
              style={{
                width: '100%',
                padding: '8px',
                border: errors.username && touched.username ? '1px solid red' : '1px solid #ccc',
              }}
            />
          </label>
          {errors.username && touched.username && (
            <span style={{ color: 'red', fontSize: '12px' }}>{errors.username}</span>
          )}
        </div>
        
        {/* 邮箱 */}
        <div style={{ marginBottom: '15px' }}>
          <label>
            邮箱 *
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              style={{
                width: '100%',
                padding: '8px',
                border: errors.email && touched.email ? '1px solid red' : '1px solid #ccc',
              }}
            />
          </label>
          {errors.email && touched.email && (
            <span style={{ color: 'red', fontSize: '12px' }}>{errors.email}</span>
          )}
        </div>
        
        {/* 年龄 */}
        <div style={{ marginBottom: '15px' }}>
          <label>
            年龄 *
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              onBlur={handleBlur}
              style={{
                width: '100%',
                padding: '8px',
                border: errors.age && touched.age ? '1px solid red' : '1px solid #ccc',
              }}
            />
          </label>
          {errors.age && touched.age && (
            <span style={{ color: 'red', fontSize: '12px' }}>{errors.age}</span>
          )}
        </div>
        
        {/* 个人简介 */}
        <div style={{ marginBottom: '15px' }}>
          <label>
            个人简介
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={4}
              style={{
                width: '100%',
                padding: '8px',
                border: errors.bio && touched.bio ? '1px solid red' : '1px solid #ccc',
              }}
            />
          </label>
          <span style={{ fontSize: '12px', color: '#666' }}>
            {formData.bio.length}/200
          </span>
          {errors.bio && touched.bio && (
            <span style={{ color: 'red', fontSize: '12px', display: 'block' }}>
              {errors.bio}
            </span>
          )}
        </div>
        
        {/* 提交按钮 */}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '10px 20px',
            backgroundColor: isSubmitting ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
          }}
        >
          {isSubmitting ? '提交中...' : '提交'}
        </button>
      </form>
    </div>
  );
}

// 5. 文件上传控制
function FileUploadControl() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  
  // 处理文件选择
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };
  
  // 处理文件
  const processFile = (file: File) => {
    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('请选择图片文件（JPG、PNG、GIF）');
      return;
    }
    
    // 验证文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      alert('文件大小不能超过5MB');
      return;
    }
    
    setSelectedFile(file);
    
    // 创建预览
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  // 处理拖放
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };
  
  // 模拟上传
  const handleUpload = () => {
    if (!selectedFile) return;
    
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          alert('上传完成！');
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };
  
  return (
    <div style={{ padding: '20px' }}>
      <h3>文件上传控制</h3>
      
      {/* 拖放区域 */}
      <div
        style={{
          border: `2px dashed ${dragActive ? '#007bff' : '#ccc'}`,
          borderRadius: '8px',
          padding: '40px',
          textAlign: 'center',
          backgroundColor: dragActive ? '#f0f8ff' : 'transparent',
          marginBottom: '20px',
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <p>拖放文件到这里，或者</p>
        <input
          type="file"
          id="fileInput"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <label
          htmlFor="fileInput"
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          选择文件
        </label>
      </div>
      
      {/* 文件信息和预览 */}
      {selectedFile && (
        <div>
          <h4>文件信息</h4>
          <p>文件名: {selectedFile.name}</p>
          <p>大小: {(selectedFile.size / 1024).toFixed(2)} KB</p>
          <p>类型: {selectedFile.type}</p>
          
          {preview && (
            <div>
              <h4>预览</h4>
              <img
                src={preview}
                alt="预览"
                style={{ maxWidth: '200px', maxHeight: '200px' }}
              />
            </div>
          )}
          
          <button
            onClick={handleUpload}
            style={{
              marginTop: '10px',
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            上传文件
          </button>
          
          {uploadProgress > 0 && (
            <div style={{ marginTop: '10px' }}>
              <div
                style={{
                  width: '100%',
                  height: '20px',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '10px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${uploadProgress}%`,
                    height: '100%',
                    backgroundColor: '#28a745',
                    transition: 'width 0.3s',
                  }}
                />
              </div>
              <p>{uploadProgress}%</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 6. 动态表单字段
function DynamicFormFields() {
  interface Field {
    id: string;
    type: 'text' | 'number' | 'email';
    label: string;
    value: string;
  }
  
  const [fields, setFields] = useState<Field[]>([
    { id: '1', type: 'text', label: '字段1', value: '' },
  ]);
  
  // 添加字段
  const addField = () => {
    const newField: Field = {
      id: Date.now().toString(),
      type: 'text',
      label: `字段${fields.length + 1}`,
      value: '',
    };
    setFields([...fields, newField]);
  };
  
  // 删除字段
  const removeField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
  };
  
  // 更新字段
  const updateField = (id: string, updates: Partial<Field>) => {
    setFields(fields.map(field =>
      field.id === id ? { ...field, ...updates } : field
    ));
  };
  
  return (
    <div style={{ padding: '20px' }}>
      <h3>动态表单字段</h3>
      
      {fields.map((field, index) => (
        <div key={field.id} style={{ marginBottom: '15px', border: '1px solid #eee', padding: '10px' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="字段标签"
              value={field.label}
              onChange={(e) => updateField(field.id, { label: e.target.value })}
            />
            <select
              value={field.type}
              onChange={(e) => updateField(field.id, { type: e.target.value as Field['type'] })}
            >
              <option value="text">文本</option>
              <option value="number">数字</option>
              <option value="email">邮箱</option>
            </select>
            <button onClick={() => removeField(field.id)}>删除</button>
          </div>
          
          <label>
            {field.label}:
            <input
              type={field.type}
              value={field.value}
              onChange={(e) => updateField(field.id, { value: e.target.value })}
              style={{ marginLeft: '10px' }}
            />
          </label>
        </div>
      ))}
      
      <button onClick={addField}>添加字段</button>
      
      <div style={{ marginTop: '20px' }}>
        <h4>表单数据:</h4>
        <pre>{JSON.stringify(fields, null, 2)}</pre>
      </div>
    </div>
  );
}

// 7. 受控与非受控组件对比
function ControlledVsUncontrolled() {
  // 受控组件
  const [controlledValue, setControlledValue] = useState('');
  
  // 非受控组件引用
  const uncontrolledRef = React.useRef<HTMLInputElement>(null);
  const [uncontrolledDisplay, setUncontrolledDisplay] = useState('');
  
  const handleUncontrolledSubmit = () => {
    if (uncontrolledRef.current) {
      setUncontrolledDisplay(uncontrolledRef.current.value);
    }
  };
  
  return (
    <div style={{ padding: '20px' }}>
      <h3>受控 vs 非受控组件</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>受控组件</h4>
        <input
          type="text"
          value={controlledValue}
          onChange={(e) => setControlledValue(e.target.value)}
          placeholder="受控输入"
        />
        <p>实时值: {controlledValue}</p>
        <p>特点:</p>
        <ul>
          <li>值由React state控制</li>
          <li>每次输入都触发重新渲染</li>
          <li>可以实时验证和格式化</li>
          <li>表单数据集中管理</li>
        </ul>
      </div>
      
      <div>
        <h4>非受控组件</h4>
        <input
          type="text"
          ref={uncontrolledRef}
          defaultValue="默认值"
          placeholder="非受控输入"
        />
        <button onClick={handleUncontrolledSubmit}>获取值</button>
        <p>提交的值: {uncontrolledDisplay}</p>
        <p>特点:</p>
        <ul>
          <li>值由DOM自己管理</li>
          <li>通过ref获取值</li>
          <li>减少重新渲染</li>
          <li>更接近传统HTML表单</li>
        </ul>
      </div>
    </div>
  );
}

// 导出所有组件
export {
  BasicControlledInputs,
  AdvancedInputControl,
  ControlledSelections,
  FormValidation,
  FileUploadControl,
  DynamicFormFields,
  ControlledVsUncontrolled,
};