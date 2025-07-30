import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
// ========== 自定义Hooks ==========

// useForm - 通用表单管理Hook
const useForm = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  
  // 验证单个字段
  const validateField = useCallback((name, value) => {
    const rules = validationRules[name];
    if (!rules) return '';
    
    for (const rule of rules) {
      const error = rule(value, values);
      if (error) return error;
    }
    
    return '';
  }, [validationRules, values]);
  
  // 验证所有字段
  const validateForm = useCallback(() => {
    const newErrors = {};
    let hasError = false;
    
    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        hasError = true;
      }
    });
    
    setErrors(newErrors);
    return !hasError;
  }, [validationRules, values, validateField]);
  
  // 处理字段变化
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setValues(prev => ({
      ...prev,
      [name]: fieldValue
    }));
    
    // 如果字段已被触碰，实时验证
    if (touched[name]) {
      const error = validateField(name, fieldValue);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  }, [touched, validateField]);
  
  // 处理字段失焦
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    const error = validateField(name, values[name]);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, [values, validateField]);
  
  // 重置表单
  const resetForm = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
    setSubmitCount(0);
  }, [initialValues]);
  
  // 设置字段值
  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  }, [touched, validateField]);
  
  // 设置多个字段值
  const setFieldValues = useCallback((fields) => {
    setValues(prev => ({
      ...prev,
      ...fields
    }));
  }, []);
  
  // 提交处理
  const handleSubmit = useCallback((onSubmit) => async (e) => {
    e.preventDefault();
    
    setSubmitCount(prev => prev + 1);
    setTouched(Object.keys(values).reduce((acc, key) => ({
      ...acc,
      [key]: true
    }), {}));
    
    const isValid = validateForm();
    
    if (isValid) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
        resetForm();
      } catch (error) {
        console.error('Submit error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [values, validateForm, resetForm]);
  
  // 计算表单状态
  const formState = useMemo(() => ({
    isDirty: JSON.stringify(values) !== JSON.stringify(initialValues),
    isValid: Object.keys(errors).length === 0,
    touchedFields: Object.keys(touched).filter(key => touched[key])
  }), [values, initialValues, errors, touched]);
  
  return {
    values,
    errors,
    touched,
    isSubmitting,
    submitCount,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldValues,
    validateForm,
    formState
  };
};
// useFieldArray - 动态表单数组管理
const useFieldArray = (name, { control }) => {
  const [fields, setFields] = useState([]);
  
  const append = useCallback((value) => {
    const newField = {
      id: Date.now().toString(),
      ...value
    };
    setFields(prev => [...prev, newField]);
    control.setFieldValue(name, [...control.values[name] || [], value]);
  }, [name, control]);
  
  const remove = useCallback((index) => {
    setFields(prev => prev.filter((_, i) => i !== index));
    const newArray = [...(control.values[name] || [])];
    newArray.splice(index, 1);
    control.setFieldValue(name, newArray);
  }, [name, control]);
  
  const move = useCallback((from, to) => {
    setFields(prev => {
      const newFields = [...prev];
      const [removed] = newFields.splice(from, 1);
      newFields.splice(to, 0, removed);
      return newFields;
    });
    
    const newArray = [...(control.values[name] || [])];
    const [removed] = newArray.splice(from, 1);
    newArray.splice(to, 0, removed);
    control.setFieldValue(name, newArray);
  }, [name, control]);
  
  const update = useCallback((index, value) => {
    setFields(prev => {
      const newFields = [...prev];
      newFields[index] = { ...newFields[index], ...value };
      return newFields;
    });
    
    const newArray = [...(control.values[name] || [])];
    newArray[index] = value;
    control.setFieldValue(name, newArray);
  }, [name, control]);
  
  return {
    fields,
    append,
    remove,
    move,
    update
  };
};
// useDebounce - 防抖Hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
};
// useAsyncValidation - 异步验证Hook
const useAsyncValidation = (value, validator, delay = 500) => {
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const debouncedValue = useDebounce(value, delay);
  const abortControllerRef = useRef(null);
  
  useEffect(() => {
    if (!debouncedValue) {
      setError('');
      return;
    }
    
    const validate = async () => {
      // 取消之前的请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      setIsValidating(true);
      
      try {
        const result = await validator(debouncedValue, {
          signal: abortControllerRef.current.signal
        });
        
        if (result) {
          setError(result);
        } else {
          setError('');
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          setError('验证失败');
        }
      } finally {
        setIsValidating(false);
      }
    };
    
    validate();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedValue, validator]);
  
  return { isValidating, error };
};
// ========== 验证规则 ==========
const validators = {
  required: (message = '此字段必填') => (value) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return message;
    }
    return '';
  },
  
  minLength: (min, message) => (value) => {
    if (value && value.length < min) {
      return message || `最少需要${min}个字符`;
    }
    return '';
  },
  
  maxLength: (max, message) => (value) => {
    if (value && value.length > max) {
      return message || `最多${max}个字符`;
    }
    return '';
  },
  
  pattern: (regex, message = '格式不正确') => (value) => {
    if (value && !regex.test(value)) {
      return message;
    }
    return '';
  },
  
  email: (message = '请输入有效的邮箱地址') => (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return message;
    }
    return '';
  },
  
  match: (fieldName, message) => (value, formValues) => {
    if (value !== formValues[fieldName]) {
      return message || `与${fieldName}不匹配`;
    }
    return '';
  },
  
  custom: (validator) => validator
};
// ========== 表单组件 ==========

// 输入框组件
const Input = ({ name, label, type = 'text', placeholder, form, ...props }) => {
  const { values, errors, touched, handleChange, handleBlur } = form;
  const hasError = touched[name] && errors[name];
  
  return (
    <div className="form-field">
      {label && <label htmlFor={name}>{label}</label>}
      <input
        id={name}
        name={name}
        type={type}
        value={values[name] || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`form-input ${hasError ? 'error' : ''}`}
        {...props}
      />
      {hasError && <span className="error-message">{errors[name]}</span>}
    </div>
  );
};
// 选择框组件
const Select = ({ name, label, options, form, ...props }) => {
  const { values, errors, touched, handleChange, handleBlur } = form;
  const hasError = touched[name] && errors[name];
  
  return (
    <div className="form-field">
      {label && <label htmlFor={name}>{label}</label>}
      <select
        id={name}
        name={name}
        value={values[name] || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`form-select ${hasError ? 'error' : ''}`}
        {...props}
      >
        <option value="">请选择...</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hasError && <span className="error-message">{errors[name]}</span>}
    </div>
  );
};
// 复选框组件
const Checkbox = ({ name, label, form, ...props }) => {
  const { values, handleChange } = form;
  
  return (
    <div className="form-field checkbox">
      <label>
        <input
          type="checkbox"
          name={name}
          checked={values[name] || false}
          onChange={handleChange}
          {...props}
        />
        <span>{label}</span>
      </label>
    </div>
  );
};
// 文本域组件
const Textarea = ({ name, label, rows = 4, form, ...props }) => {
  const { values, errors, touched, handleChange, handleBlur } = form;
  const hasError = touched[name] && errors[name];
  
  return (
    <div className="form-field">
      {label && <label htmlFor={name}>{label}</label>}
      <textarea
        id={name}
        name={name}
        value={values[name] || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        rows={rows}
        className={`form-textarea ${hasError ? 'error' : ''}`}
        {...props}
      />
      {hasError && <span className="error-message">{errors[name]}</span>}
    </div>
  );
};
// ========== 使用示例 ==========

// 注册表单示例
function RegistrationForm() {
  const form = useForm(
    {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      age: '',
      country: '',
      bio: '',
      agreeToTerms: false,
      skills: []
    },
    {
      username: [
        validators.required('用户名必填'),
        validators.minLength(3, '用户名至少3个字符'),
        validators.maxLength(20, '用户名最多20个字符'),
        validators.pattern(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线')
      ],
      email: [
        validators.required('邮箱必填'),
        validators.email()
      ],
      password: [
        validators.required('密码必填'),
        validators.minLength(8, '密码至少8个字符'),
        validators.pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          '密码必须包含大小写字母和数字'
        )
      ],
      confirmPassword: [
        validators.required('请确认密码'),
        validators.match('password', '密码不匹配')
      ],
      age: [
        validators.required('年龄必填'),
        validators.custom((value) => {
          const age = parseInt(value);
          if (isNaN(age) || age < 18 || age > 100) {
            return '年龄必须在18-100之间';
          }
          return '';
        })
      ],
      country: [
        validators.required('请选择国家')
      ],
      agreeToTerms: [
        validators.custom((value) => {
          if (!value) {
            return '请同意服务条款';
          }
          return '';
        })
      ]
    }
  );
  
  // 异步验证用户名
  const { error: usernameAsyncError, isValidating } = useAsyncValidation(
    form.values.username,
    async (username, { signal }) => {
      // 模拟API调用检查用户名是否存在
      const response = await fetch(`/api/check-username?username=${username}`, {
        signal
      });
      const data = await response.json();
      
      if (data.exists) {
        return '用户名已存在';
      }
      return '';
    }
  );
  
  // 技能字段数组
  const skillsArray = useFieldArray('skills', { control: form });
  
  const handleSubmit = async (values) => {
    console.log('Form submitted:', values);
    // 实际提交逻辑
    await new Promise(resolve => setTimeout(resolve, 2000));
    alert('注册成功！');
  };
  
  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="registration-form">
      <h2>用户注册</h2>
      
      <div className="form-section">
        <h3>基本信息</h3>
        
        <Input
          name="username"
          label="用户名"
          placeholder="请输入用户名"
          form={form}
        />
        {isValidating && <span className="validating">验证中...</span>}
        {usernameAsyncError && !form.errors.username && (
          <span className="error-message">{usernameAsyncError}</span>
        )}
        
        <Input
          name="email"
          label="邮箱"
          type="email"
          placeholder="your@email.com"
          form={form}
        />
        
        <Input
          name="password"
          label="密码"
          type="password"
          placeholder="请输入密码"
          form={form}
        />
        
        <Input
          name="confirmPassword"
          label="确认密码"
          type="password"
          placeholder="再次输入密码"
          form={form}
        />
      </div>
      
      <div className="form-section">
        <h3>个人资料</h3>
        
        <Input
          name="age"
          label="年龄"
          type="number"
          placeholder="18"
          form={form}
        />
        
        <Select
          name="country"
          label="国家"
          options={[
            { value: 'cn', label: '中国' },
            { value: 'us', label: '美国' },
            { value: 'uk', label: '英国' },
            { value: 'jp', label: '日本' }
          ]}
          form={form}
        />
        
        <Textarea
          name="bio"
          label="个人简介"
          placeholder="介绍一下自己..."
          rows={3}
          form={form}
        />
      </div>
      
      <div className="form-section">
        <h3>技能列表</h3>
        
        {skillsArray.fields.map((field, index) => (
          <div key={field.id} className="skill-item">
            <input
              value={form.values.skills?.[index] || ''}
              onChange={(e) => skillsArray.update(index, e.target.value)}
              placeholder="技能名称"
            />
            <button
              type="button"
              onClick={() => skillsArray.remove(index)}
              className="remove-btn"
            >
              删除
            </button>
          </div>
        ))}
        
        <button
          type="button"
          onClick={() => skillsArray.append('')}
          className="add-btn"
        >
          添加技能
        </button>
      </div>
      
      <Checkbox
        name="agreeToTerms"
        label="我同意服务条款和隐私政策"
        form={form}
      />
      
      <div className="form-actions">
        <button
          type="button"
          onClick={() => form.resetForm()}
          className="reset-btn"
        >
          重置
        </button>
        
        <button
          type="submit"
          disabled={
            form.isSubmitting ||
            !form.formState.isValid ||
            isValidating ||
            !!usernameAsyncError
          }
          className="submit-btn"
        >
          {form.isSubmitting ? '提交中...' : '注册'}
        </button>
      </div>
      
      {form.submitCount > 0 && !form.formState.isValid && (
        <div className="form-errors">
          请修正以上错误后再提交
        </div>
      )}
      
      {/* 表单状态调试信息 */}
      <div className="form-debug">
        <h4>表单状态</h4>
        <pre>{JSON.stringify(form.formState, null, 2)}</pre>
      </div>
    </form>
  );
}
// 多步骤表单示例
function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    { title: '个人信息', fields: ['firstName', 'lastName', 'email'] },
    { title: '联系方式', fields: ['phone', 'address', 'city', 'zipCode'] },
    { title: '账户设置', fields: ['username', 'password', 'notifications'] }
  ];
  
  const form = useForm(
    {
      // 步骤1
      firstName: '',
      lastName: '',
      email: '',
      // 步骤2
      phone: '',
      address: '',
      city: '',
      zipCode: '',
      // 步骤3
      username: '',
      password: '',
      notifications: false
    },
    {
      firstName: [validators.required('名字必填')],
      lastName: [validators.required('姓氏必填')],
      email: [validators.required('邮箱必填'), validators.email()],
      phone: [
        validators.required('电话必填'),
        validators.pattern(/^\d{11}$/, '请输入11位手机号')
      ],
      address: [validators.required('地址必填')],
      city: [validators.required('城市必填')],
      zipCode: [
        validators.required('邮编必填'),
        validators.pattern(/^\d{6}$/, '请输入6位邮编')
      ],
      username: [
        validators.required('用户名必填'),
        validators.minLength(3)
      ],
      password: [
        validators.required('密码必填'),
        validators.minLength(8)
      ]
    }
  );
  
  // 验证当前步骤
  const validateStep = useCallback(() => {
    const currentFields = steps[currentStep].fields;
    let isValid = true;
    
    currentFields.forEach(field => {
      const error = form.validateField(field, form.values[field]);
      if (error) {
        isValid = false;
        form.setErrors(prev => ({ ...prev, [field]: error }));
        form.setTouched(prev => ({ ...prev, [field]: true }));
      }
    });
    
    return isValid;
  }, [currentStep, form]);
  
  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };
  
  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };
  
  const handleSubmit = async (values) => {
    console.log('Multi-step form submitted:', values);
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('表单提交成功！');
  };
  
  return (
    <div className="multi-step-form">
      <div className="step-indicators">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`step-indicator ${
              index === currentStep ? 'active' : ''
            } ${index < currentStep ? 'completed' : ''}`}
          >
            <span className="step-number">{index + 1}</span>
            <span className="step-title">{step.title}</span>
          </div>
        ))}
      </div>
      
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="step-content">
          <h3>{steps[currentStep].title}</h3>
          
          {/* 步骤1：个人信息 */}
          {currentStep === 0 && (
            <>
              <Input
                name="firstName"
                label="名字"
                placeholder="请输入名字"
                form={form}
              />
              <Input
                name="lastName"
                label="姓氏"
                placeholder="请输入姓氏"
                form={form}
              />
              <Input
                name="email"
                label="邮箱"
                type="email"
                placeholder="your@email.com"
                form={form}
              />
            </>
          )}
          
          {/* 步骤2：联系方式 */}
          {currentStep === 1 && (
            <>
              <Input
                name="phone"
                label="电话"
                placeholder="请输入11位手机号"
                form={form}
              />
              <Input
                name="address"
                label="地址"
                placeholder="请输入详细地址"
                form={form}
              />
              <Input
                name="city"
                label="城市"
                placeholder="请输入城市"
                form={form}
              />
              <Input
                name="zipCode"
                label="邮编"
                placeholder="请输入6位邮编"
                form={form}
              />
            </>
          )}
          
          {/* 步骤3：账户设置 */}
          {currentStep === 2 && (
            <>
              <Input
                name="username"
                label="用户名"
                placeholder="请输入用户名"
                form={form}
              />
              <Input
                name="password"
                label="密码"
                type="password"
                placeholder="请输入密码"
                form={form}
              />
              <Checkbox
                name="notifications"
                label="接收邮件通知"
                form={form}
              />
            </>
          )}
        </div>
        
        <div className="step-actions">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="prev-btn"
          >
            上一步
          </button>
          
          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="next-btn"
            >
              下一步
            </button>
          ) : (
            <button
              type="submit"
              disabled={form.isSubmitting}
              className="submit-btn"
            >
              {form.isSubmitting ? '提交中...' : '提交'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
// 主应用
export default function FormSystem() {
  const [activeDemo, setActiveDemo] = useState('registration');
  
  return (
    <div className="form-system">
      <h1>高级表单系统</h1>
      
      <div className="demo-selector">
        <button
          onClick={() => setActiveDemo('registration')}
          className={activeDemo === 'registration' ? 'active' : ''}
        >
          注册表单
        </button>
        <button
          onClick={() => setActiveDemo('multistep')}
          className={activeDemo === 'multistep' ? 'active' : ''}
        >
          多步骤表单
        </button>
      </div>
      
      <div className="demo-content">
        {activeDemo === 'registration' && <RegistrationForm />}
        {activeDemo === 'multistep' && <MultiStepForm />}
      </div>
    </div>
  );
}