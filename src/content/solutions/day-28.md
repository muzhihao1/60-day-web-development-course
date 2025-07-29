---
day: 28
exerciseTitle: "React Hooks深入解决方案"
approach: "通过三个完整的项目展示React Hooks的高级应用，包括表单管理系统、音乐播放器和实时聊天应用"
files:
  - filename: "FormSystem.jsx"
    content: |
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
  - filename: "MusicPlayer.jsx"
    content: |
      import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

      // ========== 自定义Hooks ==========
      
      // useAudio - 音频控制Hook
      const useAudio = () => {
        const audioRef = useRef(null);
        const [isPlaying, setIsPlaying] = useState(false);
        const [currentTime, setCurrentTime] = useState(0);
        const [duration, setDuration] = useState(0);
        const [volume, setVolume] = useState(1);
        const [isMuted, setIsMuted] = useState(false);
        const [playbackRate, setPlaybackRate] = useState(1);
        const [isLoading, setIsLoading] = useState(false);
        const [error, setError] = useState(null);
        
        // 播放/暂停
        const togglePlay = useCallback(() => {
          if (!audioRef.current) return;
          
          if (isPlaying) {
            audioRef.current.pause();
          } else {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
              playPromise.catch(error => {
                console.error('播放失败:', error);
                setError('播放失败，请重试');
              });
            }
          }
        }, [isPlaying]);
        
        // 跳转到指定时间
        const seek = useCallback((time) => {
          if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
          }
        }, []);
        
        // 设置音量
        const changeVolume = useCallback((newVolume) => {
          if (audioRef.current) {
            audioRef.current.volume = newVolume;
            setVolume(newVolume);
            if (newVolume > 0 && isMuted) {
              setIsMuted(false);
            }
          }
        }, [isMuted]);
        
        // 静音切换
        const toggleMute = useCallback(() => {
          if (audioRef.current) {
            const newMutedState = !isMuted;
            audioRef.current.muted = newMutedState;
            setIsMuted(newMutedState);
          }
        }, [isMuted]);
        
        // 设置播放速度
        const changePlaybackRate = useCallback((rate) => {
          if (audioRef.current) {
            audioRef.current.playbackRate = rate;
            setPlaybackRate(rate);
          }
        }, []);
        
        // 设置音频源
        const setAudioSource = useCallback((src) => {
          if (audioRef.current) {
            audioRef.current.src = src;
            audioRef.current.load();
            setCurrentTime(0);
            setIsPlaying(false);
            setError(null);
          }
        }, []);
        
        // 事件处理
        useEffect(() => {
          const audio = audioRef.current;
          if (!audio) return;
          
          const handlePlay = () => setIsPlaying(true);
          const handlePause = () => setIsPlaying(false);
          const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
          const handleLoadedMetadata = () => setDuration(audio.duration);
          const handleVolumeChange = () => {
            setVolume(audio.volume);
            setIsMuted(audio.muted);
          };
          const handleLoadStart = () => setIsLoading(true);
          const handleCanPlay = () => setIsLoading(false);
          const handleError = (e) => {
            setIsLoading(false);
            setError('音频加载失败');
            console.error('Audio error:', e);
          };
          const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
          };
          
          audio.addEventListener('play', handlePlay);
          audio.addEventListener('pause', handlePause);
          audio.addEventListener('timeupdate', handleTimeUpdate);
          audio.addEventListener('loadedmetadata', handleLoadedMetadata);
          audio.addEventListener('volumechange', handleVolumeChange);
          audio.addEventListener('loadstart', handleLoadStart);
          audio.addEventListener('canplay', handleCanPlay);
          audio.addEventListener('error', handleError);
          audio.addEventListener('ended', handleEnded);
          
          return () => {
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('volumechange', handleVolumeChange);
            audio.removeEventListener('loadstart', handleLoadStart);
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('error', handleError);
            audio.removeEventListener('ended', handleEnded);
          };
        }, []);
        
        return {
          audioRef,
          isPlaying,
          currentTime,
          duration,
          volume,
          isMuted,
          playbackRate,
          isLoading,
          error,
          togglePlay,
          seek,
          changeVolume,
          toggleMute,
          changePlaybackRate,
          setAudioSource
        };
      };

      // usePlaylist - 播放列表管理Hook
      const usePlaylist = (initialSongs = []) => {
        const [songs, setSongs] = useState(initialSongs);
        const [currentIndex, setCurrentIndex] = useState(0);
        const [shuffle, setShuffle] = useState(false);
        const [repeat, setRepeat] = useState('none'); // 'none', 'all', 'one'
        const [history, setHistory] = useState([]);
        const [queue, setQueue] = useState([]);
        
        // 获取当前歌曲
        const currentSong = useMemo(() => {
          if (queue.length > 0) {
            return queue[0];
          }
          return songs[currentIndex] || null;
        }, [songs, currentIndex, queue]);
        
        // 播放指定歌曲
        const playSong = useCallback((index) => {
          if (index >= 0 && index < songs.length) {
            setHistory(prev => [...prev, currentIndex]);
            setCurrentIndex(index);
          }
        }, [songs.length, currentIndex]);
        
        // 下一首
        const playNext = useCallback(() => {
          // 如果有队列，播放队列中的下一首
          if (queue.length > 0) {
            const [nextSong, ...restQueue] = queue;
            setQueue(restQueue);
            const songIndex = songs.findIndex(s => s.id === nextSong.id);
            if (songIndex !== -1) {
              playSong(songIndex);
            }
            return;
          }
          
          let nextIndex;
          
          if (repeat === 'one') {
            // 单曲循环，保持当前索引
            return;
          } else if (shuffle) {
            // 随机播放
            const availableIndices = Array.from(
              { length: songs.length },
              (_, i) => i
            ).filter(i => i !== currentIndex);
            
            if (availableIndices.length > 0) {
              nextIndex = availableIndices[
                Math.floor(Math.random() * availableIndices.length)
              ];
            } else {
              nextIndex = currentIndex;
            }
          } else {
            // 顺序播放
            nextIndex = currentIndex + 1;
            
            if (nextIndex >= songs.length) {
              if (repeat === 'all') {
                nextIndex = 0;
              } else {
                // 播放结束
                return;
              }
            }
          }
          
          playSong(nextIndex);
        }, [songs, currentIndex, shuffle, repeat, queue, playSong]);
        
        // 上一首
        const playPrevious = useCallback(() => {
          if (history.length > 0) {
            const prevIndex = history[history.length - 1];
            setHistory(prev => prev.slice(0, -1));
            setCurrentIndex(prevIndex);
          } else {
            const prevIndex = currentIndex - 1;
            if (prevIndex >= 0) {
              playSong(prevIndex);
            } else if (repeat === 'all') {
              playSong(songs.length - 1);
            }
          }
        }, [history, currentIndex, songs.length, repeat, playSong]);
        
        // 添加到队列
        const addToQueue = useCallback((song) => {
          setQueue(prev => [...prev, song]);
        }, []);
        
        // 从队列移除
        const removeFromQueue = useCallback((index) => {
          setQueue(prev => prev.filter((_, i) => i !== index));
        }, []);
        
        // 清空队列
        const clearQueue = useCallback(() => {
          setQueue([]);
        }, []);
        
        // 切换随机播放
        const toggleShuffle = useCallback(() => {
          setShuffle(prev => !prev);
        }, []);
        
        // 切换循环模式
        const toggleRepeat = useCallback(() => {
          setRepeat(prev => {
            switch (prev) {
              case 'none':
                return 'all';
              case 'all':
                return 'one';
              case 'one':
                return 'none';
              default:
                return 'none';
            }
          });
        }, []);
        
        // 添加歌曲到播放列表
        const addSong = useCallback((song) => {
          setSongs(prev => [...prev, song]);
        }, []);
        
        // 移除歌曲
        const removeSong = useCallback((index) => {
          setSongs(prev => prev.filter((_, i) => i !== index));
          
          // 调整当前索引
          if (index < currentIndex) {
            setCurrentIndex(prev => prev - 1);
          } else if (index === currentIndex && currentIndex === songs.length - 1) {
            setCurrentIndex(prev => Math.max(0, prev - 1));
          }
        }, [currentIndex, songs.length]);
        
        // 清空播放列表
        const clearPlaylist = useCallback(() => {
          setSongs([]);
          setCurrentIndex(0);
          setHistory([]);
          clearQueue();
        }, [clearQueue]);
        
        return {
          songs,
          currentSong,
          currentIndex,
          shuffle,
          repeat,
          queue,
          history,
          playSong,
          playNext,
          playPrevious,
          addToQueue,
          removeFromQueue,
          clearQueue,
          toggleShuffle,
          toggleRepeat,
          addSong,
          removeSong,
          clearPlaylist
        };
      };

      // useMediaSession - 媒体会话API Hook
      const useMediaSession = (song, handlers) => {
        useEffect(() => {
          if (!('mediaSession' in navigator) || !song) return;
          
          // 设置元数据
          navigator.mediaSession.metadata = new MediaMetadata({
            title: song.title,
            artist: song.artist,
            album: song.album,
            artwork: song.artwork ? [
              { src: song.artwork, sizes: '96x96', type: 'image/png' },
              { src: song.artwork, sizes: '128x128', type: 'image/png' },
              { src: song.artwork, sizes: '192x192', type: 'image/png' },
              { src: song.artwork, sizes: '256x256', type: 'image/png' },
              { src: song.artwork, sizes: '384x384', type: 'image/png' },
              { src: song.artwork, sizes: '512x512', type: 'image/png' }
            ] : []
          });
          
          // 设置操作处理器
          const actionHandlers = {
            play: handlers.onPlay,
            pause: handlers.onPause,
            previoustrack: handlers.onPrevious,
            nexttrack: handlers.onNext,
            seekbackward: () => handlers.onSeek(-10),
            seekforward: () => handlers.onSeek(10)
          };
          
          for (const [action, handler] of Object.entries(actionHandlers)) {
            try {
              navigator.mediaSession.setActionHandler(action, handler);
            } catch (error) {
              console.warn(`不支持 "${action}" 操作`);
            }
          }
          
          return () => {
            // 清理
            for (const action of Object.keys(actionHandlers)) {
              try {
                navigator.mediaSession.setActionHandler(action, null);
              } catch (error) {
                // 忽略错误
              }
            }
          };
        }, [song, handlers]);
      };

      // useKeyboardShortcuts - 键盘快捷键Hook
      const useKeyboardShortcuts = (handlers) => {
        useEffect(() => {
          const handleKeyDown = (e) => {
            // 忽略输入框中的按键
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
              return;
            }
            
            switch (e.key) {
              case ' ':
                e.preventDefault();
                handlers.onPlayPause();
                break;
              case 'ArrowLeft':
                e.preventDefault();
                if (e.shiftKey) {
                  handlers.onPrevious();
                } else {
                  handlers.onSeekBackward();
                }
                break;
              case 'ArrowRight':
                e.preventDefault();
                if (e.shiftKey) {
                  handlers.onNext();
                } else {
                  handlers.onSeekForward();
                }
                break;
              case 'ArrowUp':
                e.preventDefault();
                handlers.onVolumeUp();
                break;
              case 'ArrowDown':
                e.preventDefault();
                handlers.onVolumeDown();
                break;
              case 'm':
                e.preventDefault();
                handlers.onMute();
                break;
              case 's':
                e.preventDefault();
                handlers.onShuffle();
                break;
              case 'r':
                e.preventDefault();
                handlers.onRepeat();
                break;
            }
          };
          
          window.addEventListener('keydown', handleKeyDown);
          return () => window.removeEventListener('keydown', handleKeyDown);
        }, [handlers]);
      };

      // useLyrics - 歌词同步Hook
      const useLyrics = (lyricsUrl, currentTime) => {
        const [lyrics, setLyrics] = useState([]);
        const [currentLine, setCurrentLine] = useState(-1);
        
        // 解析LRC格式歌词
        const parseLyrics = useCallback((lrcText) => {
          const lines = lrcText.split('\n');
          const parsed = [];
          
          lines.forEach(line => {
            const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
            if (match) {
              const minutes = parseInt(match[1]);
              const seconds = parseInt(match[2]);
              const milliseconds = parseInt(match[3]);
              const text = match[4].trim();
              
              const time = minutes * 60 + seconds + milliseconds / 1000;
              parsed.push({ time, text });
            }
          });
          
          return parsed.sort((a, b) => a.time - b.time);
        }, []);
        
        // 加载歌词
        useEffect(() => {
          if (!lyricsUrl) {
            setLyrics([]);
            return;
          }
          
          fetch(lyricsUrl)
            .then(res => res.text())
            .then(text => {
              const parsed = parseLyrics(text);
              setLyrics(parsed);
            })
            .catch(error => {
              console.error('加载歌词失败:', error);
              setLyrics([]);
            });
        }, [lyricsUrl, parseLyrics]);
        
        // 更新当前歌词行
        useEffect(() => {
          if (lyrics.length === 0) {
            setCurrentLine(-1);
            return;
          }
          
          let line = -1;
          for (let i = 0; i < lyrics.length; i++) {
            if (currentTime >= lyrics[i].time) {
              line = i;
            } else {
              break;
            }
          }
          
          setCurrentLine(line);
        }, [currentTime, lyrics]);
        
        return { lyrics, currentLine };
      };

      // ========== 组件 ==========
      
      // 进度条组件
      const ProgressBar = ({ currentTime, duration, onSeek }) => {
        const progressRef = useRef(null);
        const [isDragging, setIsDragging] = useState(false);
        
        const percentage = duration > 0 ? (currentTime / duration) * 100 : 0;
        
        const handleMouseDown = (e) => {
          setIsDragging(true);
          handleSeek(e);
        };
        
        const handleMouseMove = (e) => {
          if (isDragging) {
            handleSeek(e);
          }
        };
        
        const handleMouseUp = () => {
          setIsDragging(false);
        };
        
        const handleSeek = (e) => {
          const rect = progressRef.current.getBoundingClientRect();
          const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
          const percentage = x / rect.width;
          const time = percentage * duration;
          onSeek(time);
        };
        
        useEffect(() => {
          if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            
            return () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };
          }
        }, [isDragging]);
        
        const formatTime = (time) => {
          const minutes = Math.floor(time / 60);
          const seconds = Math.floor(time % 60);
          return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        };
        
        return (
          <div className="progress-container">
            <span className="time current-time">{formatTime(currentTime)}</span>
            <div
              ref={progressRef}
              className="progress-bar"
              onMouseDown={handleMouseDown}
            >
              <div
                className="progress-fill"
                style={{ width: `${percentage}%` }}
              />
              <div
                className="progress-handle"
                style={{ left: `${percentage}%` }}
              />
            </div>
            <span className="time duration">{formatTime(duration)}</span>
          </div>
        );
      };

      // 音量控制组件
      const VolumeControl = ({ volume, isMuted, onVolumeChange, onMute }) => {
        const volumeRef = useRef(null);
        
        const handleVolumeChange = (e) => {
          const rect = volumeRef.current.getBoundingClientRect();
          const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
          const newVolume = x / rect.width;
          onVolumeChange(newVolume);
        };
        
        const getVolumeIcon = () => {
          if (isMuted || volume === 0) return '🔇';
          if (volume < 0.3) return '🔈';
          if (volume < 0.7) return '🔉';
          return '🔊';
        };
        
        return (
          <div className="volume-control">
            <button onClick={onMute} className="volume-icon">
              {getVolumeIcon()}
            </button>
            <div
              ref={volumeRef}
              className="volume-bar"
              onClick={handleVolumeChange}
            >
              <div
                className="volume-fill"
                style={{ width: `${isMuted ? 0 : volume * 100}%` }}
              />
              <div
                className="volume-handle"
                style={{ left: `${isMuted ? 0 : volume * 100}%` }}
              />
            </div>
          </div>
        );
      };

      // 播放列表组件
      const Playlist = ({ songs, currentIndex, onSongSelect, onRemove }) => {
        return (
          <div className="playlist">
            <h3>播放列表</h3>
            <div className="playlist-items">
              {songs.map((song, index) => (
                <div
                  key={song.id}
                  className={`playlist-item ${index === currentIndex ? 'active' : ''}`}
                >
                  <div
                    className="song-info"
                    onClick={() => onSongSelect(index)}
                  >
                    <span className="song-index">{index + 1}</span>
                    <img src={song.artwork} alt={song.title} />
                    <div className="song-details">
                      <div className="song-title">{song.title}</div>
                      <div className="song-artist">{song.artist}</div>
                    </div>
                    <span className="song-duration">{song.duration}</span>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(index);
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      };

      // 歌词显示组件
      const LyricsDisplay = ({ lyrics, currentLine }) => {
        const lyricsRef = useRef(null);
        
        useEffect(() => {
          if (currentLine >= 0 && lyricsRef.current) {
            const activeElement = lyricsRef.current.children[currentLine];
            if (activeElement) {
              activeElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
              });
            }
          }
        }, [currentLine]);
        
        if (lyrics.length === 0) {
          return (
            <div className="lyrics-display empty">
              <p>暂无歌词</p>
            </div>
          );
        }
        
        return (
          <div className="lyrics-display" ref={lyricsRef}>
            {lyrics.map((line, index) => (
              <p
                key={index}
                className={`lyrics-line ${index === currentLine ? 'active' : ''}`}
              >
                {line.text}
              </p>
            ))}
          </div>
        );
      };

      // ========== 主播放器组件 ==========
      function MusicPlayer() {
        // 示例歌曲数据
        const sampleSongs = [
          {
            id: 1,
            title: '夜曲',
            artist: '周杰伦',
            album: '十一月的萧邦',
            duration: '3:46',
            url: '/music/song1.mp3',
            artwork: '/images/album1.jpg',
            lyrics: '/lyrics/song1.lrc'
          },
          {
            id: 2,
            title: '烟花易冷',
            artist: '周杰伦',
            album: '跨时代',
            duration: '4:22',
            url: '/music/song2.mp3',
            artwork: '/images/album2.jpg',
            lyrics: '/lyrics/song2.lrc'
          },
          {
            id: 3,
            title: '青花瓷',
            artist: '周杰伦',
            album: '我很忙',
            duration: '3:59',
            url: '/music/song3.mp3',
            artwork: '/images/album3.jpg',
            lyrics: '/lyrics/song3.lrc'
          }
        ];
        
        // Hooks
        const audio = useAudio();
        const playlist = usePlaylist(sampleSongs);
        const { lyrics, currentLine } = useLyrics(
          playlist.currentSong?.lyrics,
          audio.currentTime
        );
        
        // 显示模式
        const [showLyrics, setShowLyrics] = useState(false);
        const [showPlaylist, setShowPlaylist] = useState(true);
        
        // 当歌曲改变时更新音频源
        useEffect(() => {
          if (playlist.currentSong) {
            audio.setAudioSource(playlist.currentSong.url);
            
            // 保存播放历史
            localStorage.setItem('lastPlayedSong', JSON.stringify({
              songId: playlist.currentSong.id,
              position: 0
            }));
          }
        }, [playlist.currentSong, audio.setAudioSource]);
        
        // 自动播放下一首
        useEffect(() => {
          const audioElement = audio.audioRef.current;
          if (!audioElement) return;
          
          const handleEnded = () => {
            if (playlist.repeat === 'one') {
              audio.seek(0);
              audio.togglePlay();
            } else {
              playlist.playNext();
            }
          };
          
          audioElement.addEventListener('ended', handleEnded);
          return () => audioElement.removeEventListener('ended', handleEnded);
        }, [audio, playlist]);
        
        // 媒体会话
        useMediaSession(playlist.currentSong, {
          onPlay: audio.togglePlay,
          onPause: audio.togglePlay,
          onPrevious: playlist.playPrevious,
          onNext: playlist.playNext,
          onSeek: (seconds) => audio.seek(audio.currentTime + seconds)
        });
        
        // 键盘快捷键
        useKeyboardShortcuts({
          onPlayPause: audio.togglePlay,
          onPrevious: playlist.playPrevious,
          onNext: playlist.playNext,
          onSeekBackward: () => audio.seek(Math.max(0, audio.currentTime - 10)),
          onSeekForward: () => audio.seek(Math.min(audio.duration, audio.currentTime + 10)),
          onVolumeUp: () => audio.changeVolume(Math.min(1, audio.volume + 0.1)),
          onVolumeDown: () => audio.changeVolume(Math.max(0, audio.volume - 0.1)),
          onMute: audio.toggleMute,
          onShuffle: playlist.toggleShuffle,
          onRepeat: playlist.toggleRepeat
        });
        
        // 恢复上次播放位置
        useEffect(() => {
          const lastPlayed = localStorage.getItem('lastPlayedSong');
          if (lastPlayed) {
            try {
              const { songId, position } = JSON.parse(lastPlayed);
              const songIndex = sampleSongs.findIndex(s => s.id === songId);
              if (songIndex !== -1) {
                playlist.playSong(songIndex);
                setTimeout(() => {
                  audio.seek(position);
                }, 100);
              }
            } catch (error) {
              console.error('恢复播放位置失败:', error);
            }
          }
        }, []);
        
        // 保存播放位置
        useEffect(() => {
          const interval = setInterval(() => {
            if (playlist.currentSong && audio.currentTime > 0) {
              localStorage.setItem('lastPlayedSong', JSON.stringify({
                songId: playlist.currentSong.id,
                position: audio.currentTime
              }));
            }
          }, 5000);
          
          return () => clearInterval(interval);
        }, [playlist.currentSong, audio.currentTime]);
        
        const repeatIcons = {
          none: '🔁',
          all: '🔁',
          one: '🔂'
        };
        
        return (
          <div className="music-player">
            <audio ref={audio.audioRef} />
            
            <div className="player-main">
              {/* 专辑封面和信息 */}
              <div className="now-playing">
                {playlist.currentSong ? (
                  <>
                    <img
                      src={playlist.currentSong.artwork}
                      alt={playlist.currentSong.title}
                      className="album-art"
                    />
                    <div className="song-info">
                      <h2>{playlist.currentSong.title}</h2>
                      <h3>{playlist.currentSong.artist}</h3>
                      <p>{playlist.currentSong.album}</p>
                    </div>
                  </>
                ) : (
                  <div className="no-song">
                    <p>请选择一首歌曲</p>
                  </div>
                )}
              </div>
              
              {/* 播放控制 */}
              <div className="player-controls">
                <ProgressBar
                  currentTime={audio.currentTime}
                  duration={audio.duration}
                  onSeek={audio.seek}
                />
                
                <div className="control-buttons">
                  <button
                    onClick={playlist.toggleShuffle}
                    className={`shuffle-btn ${playlist.shuffle ? 'active' : ''}`}
                  >
                    🔀
                  </button>
                  
                  <button onClick={playlist.playPrevious} className="prev-btn">
                    ⏮️
                  </button>
                  
                  <button
                    onClick={audio.togglePlay}
                    className="play-pause-btn"
                    disabled={!playlist.currentSong}
                  >
                    {audio.isPlaying ? '⏸️' : '▶️'}
                  </button>
                  
                  <button onClick={playlist.playNext} className="next-btn">
                    ⏭️
                  </button>
                  
                  <button
                    onClick={playlist.toggleRepeat}
                    className={`repeat-btn ${playlist.repeat !== 'none' ? 'active' : ''}`}
                  >
                    {repeatIcons[playlist.repeat]}
                  </button>
                </div>
                
                <div className="extra-controls">
                  <VolumeControl
                    volume={audio.volume}
                    isMuted={audio.isMuted}
                    onVolumeChange={audio.changeVolume}
                    onMute={audio.toggleMute}
                  />
                  
                  <select
                    value={audio.playbackRate}
                    onChange={(e) => audio.changePlaybackRate(parseFloat(e.target.value))}
                    className="playback-rate"
                  >
                    <option value="0.5">0.5x</option>
                    <option value="0.75">0.75x</option>
                    <option value="1">1x</option>
                    <option value="1.25">1.25x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2">2x</option>
                  </select>
                  
                  <button
                    onClick={() => setShowLyrics(!showLyrics)}
                    className={`lyrics-toggle ${showLyrics ? 'active' : ''}`}
                  >
                    📝
                  </button>
                  
                  <button
                    onClick={() => setShowPlaylist(!showPlaylist)}
                    className={`playlist-toggle ${showPlaylist ? 'active' : ''}`}
                  >
                    📋
                  </button>
                </div>
              </div>
              
              {/* 错误提示 */}
              {audio.error && (
                <div className="error-message">
                  {audio.error}
                </div>
              )}
              
              {/* 加载提示 */}
              {audio.isLoading && (
                <div className="loading-indicator">
                  加载中...
                </div>
              )}
            </div>
            
            {/* 侧边栏 */}
            <div className="player-sidebar">
              {showLyrics && (
                <LyricsDisplay
                  lyrics={lyrics}
                  currentLine={currentLine}
                />
              )}
              
              {showPlaylist && (
                <>
                  <Playlist
                    songs={playlist.songs}
                    currentIndex={playlist.currentIndex}
                    onSongSelect={playlist.playSong}
                    onRemove={playlist.removeSong}
                  />
                  
                  {playlist.queue.length > 0 && (
                    <div className="play-queue">
                      <h3>播放队列</h3>
                      <div className="queue-items">
                        {playlist.queue.map((song, index) => (
                          <div key={`queue-${index}`} className="queue-item">
                            <span>{song.title} - {song.artist}</span>
                            <button
                              onClick={() => playlist.removeFromQueue(index)}
                              className="remove-btn"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={playlist.clearQueue}
                        className="clear-queue-btn"
                      >
                        清空队列
                      </button>
                    </div>
                  )}
                  
                  {playlist.history.length > 0 && (
                    <div className="play-history">
                      <h3>播放历史</h3>
                      <p>已播放 {playlist.history.length} 首歌曲</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        );
      }

      export default MusicPlayer;
  - filename: "RealtimeChat.jsx"
    content: |
      import React, { useState, useEffect, useRef, useCallback, useReducer, useMemo } from 'react';

      // ========== WebSocket Hook ==========
      const useWebSocket = (url, options = {}) => {
        const {
          onOpen,
          onMessage,
          onError,
          onClose,
          reconnectInterval = 5000,
          maxReconnectAttempts = 5,
          heartbeatInterval = 30000
        } = options;
        
        const wsRef = useRef(null);
        const reconnectTimeoutRef = useRef(null);
        const heartbeatIntervalRef = useRef(null);
        const reconnectAttemptsRef = useRef(0);
        const [readyState, setReadyState] = useState(WebSocket.CONNECTING);
        const [error, setError] = useState(null);
        
        // 连接WebSocket
        const connect = useCallback(() => {
          try {
            wsRef.current = new WebSocket(url);
            
            wsRef.current.onopen = (event) => {
              console.log('WebSocket连接成功');
              setReadyState(WebSocket.OPEN);
              setError(null);
              reconnectAttemptsRef.current = 0;
              
              // 开始心跳
              startHeartbeat();
              
              if (onOpen) onOpen(event);
            };
            
            wsRef.current.onmessage = (event) => {
              if (onMessage) {
                try {
                  const data = JSON.parse(event.data);
                  onMessage(data);
                } catch (error) {
                  console.error('解析消息失败:', error);
                  onMessage(event.data);
                }
              }
            };
            
            wsRef.current.onerror = (event) => {
              console.error('WebSocket错误:', event);
              setError('连接错误');
              if (onError) onError(event);
            };
            
            wsRef.current.onclose = (event) => {
              console.log('WebSocket连接关闭');
              setReadyState(WebSocket.CLOSED);
              stopHeartbeat();
              
              if (onClose) onClose(event);
              
              // 尝试重连
              if (reconnectAttemptsRef.current < maxReconnectAttempts) {
                reconnectAttemptsRef.current++;
                console.log(`尝试重连 (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
                
                reconnectTimeoutRef.current = setTimeout(() => {
                  connect();
                }, reconnectInterval);
              } else {
                setError('连接失败，已达到最大重连次数');
              }
            };
          } catch (error) {
            console.error('创建WebSocket失败:', error);
            setError('创建连接失败');
          }
        }, [url, onOpen, onMessage, onError, onClose, reconnectInterval, maxReconnectAttempts]);
        
        // 发送消息
        const sendMessage = useCallback((message) => {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            const data = typeof message === 'string' ? message : JSON.stringify(message);
            wsRef.current.send(data);
            return true;
          }
          console.warn('WebSocket未连接，无法发送消息');
          return false;
        }, []);
        
        // 心跳机制
        const startHeartbeat = useCallback(() => {
          heartbeatIntervalRef.current = setInterval(() => {
            sendMessage({ type: 'ping' });
          }, heartbeatInterval);
        }, [heartbeatInterval, sendMessage]);
        
        const stopHeartbeat = useCallback(() => {
          if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
            heartbeatIntervalRef.current = null;
          }
        }, []);
        
        // 断开连接
        const disconnect = useCallback(() => {
          reconnectAttemptsRef.current = maxReconnectAttempts; // 防止自动重连
          
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
          }
          
          stopHeartbeat();
          
          if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
          }
        }, [maxReconnectAttempts, stopHeartbeat]);
        
        // 手动重连
        const reconnect = useCallback(() => {
          disconnect();
          reconnectAttemptsRef.current = 0;
          connect();
        }, [disconnect, connect]);
        
        // 初始连接
        useEffect(() => {
          connect();
          
          return () => {
            disconnect();
          };
        }, []);
        
        return {
          sendMessage,
          readyState,
          error,
          reconnect,
          disconnect
        };
      };

      // ========== 聊天状态管理 ==========
      const chatReducer = (state, action) => {
        switch (action.type) {
          case 'ADD_MESSAGE':
            return {
              ...state,
              messages: [...state.messages, {
                ...action.payload,
                id: action.payload.id || Date.now().toString(),
                timestamp: action.payload.timestamp || new Date().toISOString()
              }]
            };
            
          case 'ADD_MESSAGES':
            return {
              ...state,
              messages: [...action.payload, ...state.messages]
            };
            
          case 'UPDATE_MESSAGE':
            return {
              ...state,
              messages: state.messages.map(msg =>
                msg.id === action.payload.id
                  ? { ...msg, ...action.payload.updates }
                  : msg
              )
            };
            
          case 'DELETE_MESSAGE':
            return {
              ...state,
              messages: state.messages.filter(msg => msg.id !== action.payload)
            };
            
          case 'SET_USERS':
            return {
              ...state,
              users: action.payload
            };
            
          case 'ADD_USER':
            return {
              ...state,
              users: [...state.users, action.payload]
            };
            
          case 'REMOVE_USER':
            return {
              ...state,
              users: state.users.filter(user => user.id !== action.payload)
            };
            
          case 'UPDATE_USER':
            return {
              ...state,
              users: state.users.map(user =>
                user.id === action.payload.id
                  ? { ...user, ...action.payload.updates }
                  : user
              )
            };
            
          case 'SET_TYPING_USERS':
            return {
              ...state,
              typingUsers: action.payload
            };
            
          case 'ADD_TYPING_USER':
            return {
              ...state,
              typingUsers: [...new Set([...state.typingUsers, action.payload])]
            };
            
          case 'REMOVE_TYPING_USER':
            return {
              ...state,
              typingUsers: state.typingUsers.filter(id => id !== action.payload)
            };
            
          case 'SET_LOADING':
            return {
              ...state,
              isLoading: action.payload
            };
            
          case 'SET_ERROR':
            return {
              ...state,
              error: action.payload
            };
            
          case 'MARK_AS_READ':
            return {
              ...state,
              messages: state.messages.map(msg =>
                msg.id === action.payload
                  ? { ...msg, read: true }
                  : msg
              )
            };
            
          case 'MARK_ALL_AS_READ':
            return {
              ...state,
              messages: state.messages.map(msg => ({ ...msg, read: true }))
            };
            
          default:
            return state;
        }
      };

      const initialChatState = {
        messages: [],
        users: [],
        typingUsers: [],
        isLoading: false,
        error: null
      };

      // ========== 自定义Hooks ==========
      
      // useNotifications - 浏览器通知Hook
      const useNotifications = () => {
        const [permission, setPermission] = useState(Notification.permission);
        
        const requestPermission = useCallback(async () => {
          if ('Notification' in window) {
            const result = await Notification.requestPermission();
            setPermission(result);
            return result;
          }
          return 'denied';
        }, []);
        
        const showNotification = useCallback((title, options = {}) => {
          if (permission === 'granted' && document.hidden) {
            const notification = new Notification(title, {
              icon: '/icon.png',
              badge: '/badge.png',
              ...options
            });
            
            notification.onclick = () => {
              window.focus();
              notification.close();
            };
            
            // 自动关闭
            setTimeout(() => notification.close(), 5000);
          }
        }, [permission]);
        
        return {
          permission,
          requestPermission,
          showNotification
        };
      };

      // useVirtualScroll - 虚拟滚动Hook
      const useVirtualScroll = (items, itemHeight, containerHeight) => {
        const [scrollTop, setScrollTop] = useState(0);
        
        const visibleRange = useMemo(() => {
          const start = Math.floor(scrollTop / itemHeight);
          const end = Math.ceil((scrollTop + containerHeight) / itemHeight);
          
          return {
            start: Math.max(0, start - 5), // 缓冲区
            end: Math.min(items.length, end + 5)
          };
        }, [scrollTop, itemHeight, containerHeight, items.length]);
        
        const visibleItems = useMemo(() => {
          return items.slice(visibleRange.start, visibleRange.end);
        }, [items, visibleRange]);
        
        const totalHeight = items.length * itemHeight;
        const offsetY = visibleRange.start * itemHeight;
        
        return {
          visibleItems,
          totalHeight,
          offsetY,
          onScroll: (e) => setScrollTop(e.target.scrollTop)
        };
      };

      // useMessageSearch - 消息搜索Hook
      const useMessageSearch = (messages) => {
        const [searchTerm, setSearchTerm] = useState('');
        const [searchResults, setSearchResults] = useState([]);
        
        useEffect(() => {
          if (!searchTerm.trim()) {
            setSearchResults([]);
            return;
          }
          
          const searchLower = searchTerm.toLowerCase();
          const results = messages.filter(msg =>
            msg.content.toLowerCase().includes(searchLower) ||
            msg.user.name.toLowerCase().includes(searchLower)
          );
          
          setSearchResults(results);
        }, [searchTerm, messages]);
        
        return {
          searchTerm,
          setSearchTerm,
          searchResults
        };
      };

      // useImageUpload - 图片上传Hook
      const useImageUpload = (onUpload) => {
        const [isUploading, setIsUploading] = useState(false);
        const [preview, setPreview] = useState(null);
        const fileInputRef = useRef(null);
        
        const handleFileSelect = useCallback(async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          
          // 验证文件类型
          if (!file.type.startsWith('image/')) {
            alert('请选择图片文件');
            return;
          }
          
          // 验证文件大小 (5MB)
          if (file.size > 5 * 1024 * 1024) {
            alert('图片大小不能超过5MB');
            return;
          }
          
          // 创建预览
          const reader = new FileReader();
          reader.onload = (e) => {
            setPreview(e.target.result);
          };
          reader.readAsDataURL(file);
          
          // 上传文件
          setIsUploading(true);
          try {
            const formData = new FormData();
            formData.append('image', file);
            
            // 模拟上传
            await new Promise(resolve => setTimeout(resolve, 1000));
            const imageUrl = URL.createObjectURL(file); // 实际应该是服务器返回的URL
            
            if (onUpload) {
              onUpload(imageUrl);
            }
            
            setPreview(null);
          } catch (error) {
            console.error('上传失败:', error);
            alert('图片上传失败');
          } finally {
            setIsUploading(false);
          }
        }, [onUpload]);
        
        const triggerFileSelect = useCallback(() => {
          fileInputRef.current?.click();
        }, []);
        
        const cancelUpload = useCallback(() => {
          setPreview(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }, []);
        
        return {
          fileInputRef,
          isUploading,
          preview,
          handleFileSelect,
          triggerFileSelect,
          cancelUpload
        };
      };

      // ========== 组件 ==========
      
      // 消息组件
      const Message = ({ message, currentUserId, onImageClick }) => {
        const isOwn = message.userId === currentUserId;
        const messageRef = useRef(null);
        
        useEffect(() => {
          if (message.isNew) {
            messageRef.current?.scrollIntoView({ behavior: 'smooth' });
          }
        }, [message.isNew]);
        
        return (
          <div
            ref={messageRef}
            className={`message ${isOwn ? 'own' : 'other'} ${message.isNew ? 'new' : ''}`}
          >
            {!isOwn && (
              <img
                src={message.user.avatar}
                alt={message.user.name}
                className="user-avatar"
              />
            )}
            
            <div className="message-content">
              {!isOwn && (
                <div className="message-header">
                  <span className="user-name">{message.user.name}</span>
                  <span className="message-time">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              )}
              
              {message.type === 'text' && (
                <div className="message-text">{message.content}</div>
              )}
              
              {message.type === 'image' && (
                <img
                  src={message.content}
                  alt="分享的图片"
                  className="message-image"
                  onClick={() => onImageClick(message.content)}
                />
              )}
              
              {message.type === 'system' && (
                <div className="message-system">{message.content}</div>
              )}
              
              <div className="message-status">
                {isOwn && (
                  <>
                    {message.sending && <span>发送中...</span>}
                    {message.error && <span className="error">发送失败</span>}
                    {message.read && <span className="read">已读</span>}
                  </>
                )}
              </div>
            </div>
          </div>
        );
      };

      // 用户列表组件
      const UserList = ({ users, typingUsers, currentUserId }) => {
        return (
          <div className="user-list">
            <h3>在线用户 ({users.length})</h3>
            <div className="users">
              {users.map(user => (
                <div
                  key={user.id}
                  className={`user-item ${user.id === currentUserId ? 'current' : ''}`}
                >
                  <img src={user.avatar} alt={user.name} />
                  <div className="user-info">
                    <span className="user-name">{user.name}</span>
                    {typingUsers.includes(user.id) && (
                      <span className="typing-indicator">正在输入...</span>
                    )}
                  </div>
                  <span className={`status ${user.status}`} />
                </div>
              ))}
            </div>
          </div>
        );
      };

      // 输入框组件
      const MessageInput = ({ onSendMessage, onTyping, disabled }) => {
        const [message, setMessage] = useState('');
        const [isTyping, setIsTyping] = useState(false);
        const typingTimeoutRef = useRef(null);
        const inputRef = useRef(null);
        
        const imageUpload = useImageUpload((imageUrl) => {
          onSendMessage({
            type: 'image',
            content: imageUrl
          });
        });
        
        const handleSubmit = (e) => {
          e.preventDefault();
          
          if (message.trim() && !disabled) {
            onSendMessage({
              type: 'text',
              content: message.trim()
            });
            setMessage('');
            inputRef.current?.focus();
          }
        };
        
        const handleTyping = (e) => {
          setMessage(e.target.value);
          
          if (!isTyping) {
            setIsTyping(true);
            onTyping(true);
          }
          
          // 重置typing超时
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          
          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            onTyping(false);
          }, 1000);
        };
        
        useEffect(() => {
          return () => {
            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current);
            }
          };
        }, []);
        
        return (
          <form onSubmit={handleSubmit} className="message-input-form">
            <input
              ref={imageUpload.fileInputRef}
              type="file"
              accept="image/*"
              onChange={imageUpload.handleFileSelect}
              style={{ display: 'none' }}
            />
            
            {imageUpload.preview && (
              <div className="image-preview">
                <img src={imageUpload.preview} alt="预览" />
                <button
                  type="button"
                  onClick={imageUpload.cancelUpload}
                  disabled={imageUpload.isUploading}
                >
                  ×
                </button>
              </div>
            )}
            
            <div className="input-container">
              <button
                type="button"
                onClick={imageUpload.triggerFileSelect}
                disabled={disabled || imageUpload.isUploading}
                className="attach-btn"
              >
                📎
              </button>
              
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={handleTyping}
                placeholder="输入消息..."
                disabled={disabled}
                className="message-input"
              />
              
              <button
                type="submit"
                disabled={disabled || !message.trim()}
                className="send-btn"
              >
                发送
              </button>
            </div>
          </form>
        );
      };

      // 搜索组件
      const SearchBar = ({ searchTerm, onSearchChange, resultCount }) => {
        return (
          <div className="search-bar">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="搜索消息..."
              className="search-input"
            />
            {searchTerm && (
              <span className="search-results">
                找到 {resultCount} 条消息
              </span>
            )}
          </div>
        );
      };

      // 图片查看器组件
      const ImageViewer = ({ imageUrl, onClose }) => {
        if (!imageUrl) return null;
        
        return (
          <div className="image-viewer" onClick={onClose}>
            <img
              src={imageUrl}
              alt="查看图片"
              onClick={(e) => e.stopPropagation()}
            />
            <button className="close-btn" onClick={onClose}>
              ×
            </button>
          </div>
        );
      };

      // ========== 主聊天应用 ==========
      function RealtimeChat() {
        // 当前用户信息（实际应该从认证系统获取）
        const currentUser = {
          id: 'user-1',
          name: '我',
          avatar: '/avatars/me.jpg'
        };
        
        // 聊天状态
        const [state, dispatch] = useReducer(chatReducer, initialChatState);
        const messagesEndRef = useRef(null);
        const [viewingImage, setViewingImage] = useState(null);
        const [hasMore, setHasMore] = useState(true);
        const [isLoadingMore, setIsLoadingMore] = useState(false);
        
        // Hooks
        const notifications = useNotifications();
        const { searchTerm, setSearchTerm, searchResults } = useMessageSearch(state.messages);
        
        // WebSocket连接
        const ws = useWebSocket('ws://localhost:8080/chat', {
          onOpen: () => {
            console.log('已连接到聊天服务器');
            // 发送用户信息
            ws.sendMessage({
              type: 'join',
              user: currentUser
            });
          },
          
          onMessage: (data) => {
            switch (data.type) {
              case 'message':
                dispatch({ type: 'ADD_MESSAGE', payload: data.message });
                
                // 显示通知
                if (data.message.userId !== currentUser.id) {
                  notifications.showNotification(
                    `${data.message.user.name}发来新消息`,
                    {
                      body: data.message.content,
                      tag: 'chat-message'
                    }
                  );
                }
                break;
                
              case 'users':
                dispatch({ type: 'SET_USERS', payload: data.users });
                break;
                
              case 'user_joined':
                dispatch({ type: 'ADD_USER', payload: data.user });
                dispatch({
                  type: 'ADD_MESSAGE',
                  payload: {
                    type: 'system',
                    content: `${data.user.name} 加入了聊天室`
                  }
                });
                break;
                
              case 'user_left':
                dispatch({ type: 'REMOVE_USER', payload: data.userId });
                dispatch({
                  type: 'ADD_MESSAGE',
                  payload: {
                    type: 'system',
                    content: `${data.userName} 离开了聊天室`
                  }
                });
                break;
                
              case 'typing':
                if (data.isTyping) {
                  dispatch({ type: 'ADD_TYPING_USER', payload: data.userId });
                } else {
                  dispatch({ type: 'REMOVE_TYPING_USER', payload: data.userId });
                }
                break;
                
              case 'message_read':
                dispatch({
                  type: 'UPDATE_MESSAGE',
                  payload: {
                    id: data.messageId,
                    updates: { read: true }
                  }
                });
                break;
                
              case 'history':
                dispatch({ type: 'ADD_MESSAGES', payload: data.messages });
                setHasMore(data.hasMore);
                break;
                
              case 'error':
                dispatch({ type: 'SET_ERROR', payload: data.message });
                break;
            }
          },
          
          onError: (error) => {
            dispatch({ type: 'SET_ERROR', payload: '连接错误' });
          },
          
          onClose: () => {
            dispatch({ type: 'SET_ERROR', payload: '连接已断开' });
          }
        });
        
        // 发送消息
        const sendMessage = useCallback((messageData) => {
          const message = {
            ...messageData,
            userId: currentUser.id,
            user: currentUser,
            timestamp: new Date().toISOString(),
            sending: true,
            isNew: true
          };
          
          // 乐观更新
          dispatch({ type: 'ADD_MESSAGE', payload: message });
          
          // 发送到服务器
          const sent = ws.sendMessage({
            type: 'message',
            message: messageData
          });
          
          if (!sent) {
            // 标记发送失败
            dispatch({
              type: 'UPDATE_MESSAGE',
              payload: {
                id: message.id,
                updates: { sending: false, error: true }
              }
            });
          }
        }, [ws, currentUser]);
        
        // 处理输入状态
        const handleTyping = useCallback((isTyping) => {
          ws.sendMessage({
            type: 'typing',
            isTyping
          });
        }, [ws]);
        
        // 加载更多消息
        const loadMoreMessages = useCallback(async () => {
          if (!hasMore || isLoadingMore) return;
          
          setIsLoadingMore(true);
          const oldestMessage = state.messages[0];
          
          ws.sendMessage({
            type: 'load_history',
            before: oldestMessage?.timestamp
          });
          
          setTimeout(() => setIsLoadingMore(false), 1000);
        }, [hasMore, isLoadingMore, state.messages, ws]);
        
        // 标记消息已读
        useEffect(() => {
          const unreadMessages = state.messages.filter(
            msg => !msg.read && msg.userId !== currentUser.id
          );
          
          unreadMessages.forEach(msg => {
            ws.sendMessage({
              type: 'mark_read',
              messageId: msg.id
            });
          });
        }, [state.messages, currentUser.id, ws]);
        
        // 自动滚动到底部
        useEffect(() => {
          if (!searchTerm) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }
        }, [state.messages, searchTerm]);
        
        // 请求通知权限
        useEffect(() => {
          if (notifications.permission === 'default') {
            notifications.requestPermission();
          }
        }, [notifications]);
        
        // 缓存消息到localStorage
        useEffect(() => {
          if (state.messages.length > 0) {
            const recentMessages = state.messages.slice(-100); // 只缓存最近100条
            localStorage.setItem('chat-messages', JSON.stringify(recentMessages));
          }
        }, [state.messages]);
        
        // 从缓存恢复消息
        useEffect(() => {
          const cached = localStorage.getItem('chat-messages');
          if (cached) {
            try {
              const messages = JSON.parse(cached);
              dispatch({ type: 'ADD_MESSAGES', payload: messages });
            } catch (error) {
              console.error('恢复缓存消息失败:', error);
            }
          }
        }, []);
        
        // 处理滚动加载更多
        const handleScroll = useCallback((e) => {
          const { scrollTop } = e.target;
          if (scrollTop === 0 && hasMore && !isLoadingMore) {
            loadMoreMessages();
          }
        }, [hasMore, isLoadingMore, loadMoreMessages]);
        
        const displayMessages = searchTerm ? searchResults : state.messages;
        
        return (
          <div className="realtime-chat">
            <div className="chat-header">
              <h1>实时聊天室</h1>
              <div className="connection-status">
                {ws.readyState === WebSocket.OPEN ? (
                  <span className="status online">在线</span>
                ) : ws.readyState === WebSocket.CONNECTING ? (
                  <span className="status connecting">连接中...</span>
                ) : (
                  <span className="status offline">离线</span>
                )}
              </div>
            </div>
            
            <div className="chat-container">
              <UserList
                users={state.users}
                typingUsers={state.typingUsers}
                currentUserId={currentUser.id}
              />
              
              <div className="chat-main">
                <SearchBar
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  resultCount={searchResults.length}
                />
                
                <div
                  className="messages-container"
                  onScroll={handleScroll}
                >
                  {isLoadingMore && (
                    <div className="loading-more">加载更多消息...</div>
                  )}
                  
                  {displayMessages.map(message => (
                    <Message
                      key={message.id}
                      message={message}
                      currentUserId={currentUser.id}
                      onImageClick={setViewingImage}
                    />
                  ))}
                  
                  <div ref={messagesEndRef} />
                </div>
                
                {state.typingUsers.length > 0 && (
                  <div className="typing-users">
                    {state.typingUsers.map(userId => {
                      const user = state.users.find(u => u.id === userId);
                      return user ? `${user.name} ` : '';
                    }).join(', ')}
                    正在输入...
                  </div>
                )}
                
                <MessageInput
                  onSendMessage={sendMessage}
                  onTyping={handleTyping}
                  disabled={ws.readyState !== WebSocket.OPEN}
                />
                
                {state.error && (
                  <div className="error-message">
                    {state.error}
                    <button onClick={ws.reconnect}>重新连接</button>
                  </div>
                )}
              </div>
            </div>
            
            <ImageViewer
              imageUrl={viewingImage}
              onClose={() => setViewingImage(null)}
            />
          </div>
        );
      }

      export default RealtimeChat;
keyTakeaways:
  - "自定义Hooks是复用逻辑的强大方式"
  - "useReducer适合管理复杂的状态逻辑"
  - "useRef用于访问DOM和保存可变值"
  - "useCallback和useMemo对性能优化至关重要"
  - "WebSocket集成需要考虑重连和错误处理"
  - "表单验证逻辑应该抽离为可复用的Hook"
  - "媒体控制需要处理各种浏览器兼容性问题"
commonMistakes:
  - "在依赖数组中遗漏依赖项"
  - "过度使用useCallback和useMemo"
  - "在循环或条件语句中调用Hooks"
  - "忘记清理副作用（如定时器、订阅）"
  - "直接修改state而不是返回新对象"
extensions:
  - "添加表单字段的条件显示逻辑"
  - "实现音乐可视化效果"
  - "添加视频聊天功能"
  - "实现消息加密"
  - "添加AI聊天机器人"
---

# React Hooks深入解决方案

## 🎯 实现方案概述

本解决方案展示了React Hooks的三个高级应用场景：

1. **表单系统** - 完整的表单管理Hook，支持验证、异步验证、动态字段
2. **音乐播放器** - 音频控制、播放列表管理、歌词同步等功能
3. **实时聊天** - WebSocket封装、状态管理、消息缓存等

## 📝 关键技术亮点

### 1. 表单系统特性

- **useForm Hook**：统一的表单状态管理
- **验证系统**：支持同步和异步验证
- **动态字段**：useFieldArray管理数组字段
- **性能优化**：防抖验证，避免频繁渲染
- **多步骤表单**：步骤间状态保持

### 2. 音乐播放器设计

- **useAudio Hook**：完整的音频控制封装
- **播放列表管理**：支持随机、循环等模式
- **媒体会话API**：系统级媒体控制
- **键盘快捷键**：全局快捷键支持
- **歌词同步**：LRC格式解析和同步显示

### 3. 实时聊天架构

- **useWebSocket Hook**：自动重连、心跳机制
- **useReducer管理**：复杂状态的集中管理
- **消息缓存**：离线消息和历史记录
- **虚拟滚动**：优化长列表性能
- **通知系统**：浏览器通知API集成

## 🔧 性能优化策略

1. **合理使用useMemo和useCallback**
2. **防抖和节流处理用户输入**
3. **虚拟滚动优化长列表**
4. **懒加载和代码分割**
5. **避免不必要的重渲染**

## 💡 最佳实践总结

1. **Hook设计原则**
   - 单一职责，功能专注
   - 提供清晰的API接口
   - 处理边界情况和错误
   - 支持TypeScript类型

2. **状态管理策略**
   - 简单状态用useState
   - 复杂逻辑用useReducer
   - 跨组件共享用Context
   - 性能敏感场景用useRef

3. **副作用处理**
   - 始终清理副作用
   - 正确设置依赖数组
   - 避免无限循环
   - 处理竞态条件

这些解决方案展示了如何使用React Hooks构建复杂的交互式应用，可以作为实际项目的参考模板。