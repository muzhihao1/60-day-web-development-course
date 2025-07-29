---
day: 27
exerciseTitle: "State与事件处理练习"
approach: "通过构建实际的交互组件来掌握React的State管理和事件处理。重点关注状态设计、性能优化和用户体验细节。"
files:
  - filename: "ShoppingCart.tsx"
    content: |
      import React, { useState, useMemo, useEffect } from 'react';
      
      // 商品类型定义
      interface Product {
        id: number;
        name: string;
        price: number;
        image: string;
        stock: number;
      }
      
      // 购物车项类型
      interface CartItem {
        product: Product;
        quantity: number;
      }
      
      // 模拟商品数据
      const products: Product[] = [
        { id: 1, name: "React入门书籍", price: 79.99, image: "📚", stock: 10 },
        { id: 2, name: "TypeScript高级编程", price: 89.99, image: "📘", stock: 5 },
        { id: 3, name: "JavaScript设计模式", price: 69.99, image: "📙", stock: 8 },
        { id: 4, name: "CSS权威指南", price: 59.99, image: "📗", stock: 15 },
        { id: 5, name: "前端架构设计", price: 99.99, image: "📕", stock: 3 }
      ];
      
      function ShoppingCart() {
        // 从localStorage初始化购物车
        const [cart, setCart] = useState<Record<number, number>>(() => {
          const saved = localStorage.getItem('shopping-cart');
          return saved ? JSON.parse(saved) : {};
        });
      
        // 保存到localStorage
        useEffect(() => {
          localStorage.setItem('shopping-cart', JSON.stringify(cart));
        }, [cart]);
      
        // 添加到购物车
        const addToCart = (productId: number) => {
          const product = products.find(p => p.id === productId);
          if (!product) return;
      
          setCart(prevCart => {
            const currentQty = prevCart[productId] || 0;
            if (currentQty >= product.stock) {
              alert(`库存不足！最多只能购买 ${product.stock} 件`);
              return prevCart;
            }
            return {
              ...prevCart,
              [productId]: currentQty + 1
            };
          });
        };
      
        // 更新数量
        const updateQuantity = (productId: number, quantity: number) => {
          const product = products.find(p => p.id === productId);
          if (!product) return;
      
          setCart(prevCart => {
            if (quantity <= 0) {
              const { [productId]: _, ...rest } = prevCart;
              return rest;
            }
            if (quantity > product.stock) {
              alert(`库存不足！最多只能购买 ${product.stock} 件`);
              return prevCart;
            }
            return {
              ...prevCart,
              [productId]: quantity
            };
          });
        };
      
        // 删除商品
        const removeFromCart = (productId: number) => {
          setCart(prevCart => {
            const { [productId]: _, ...rest } = prevCart;
            return rest;
          });
        };
      
        // 清空购物车
        const clearCart = () => {
          if (window.confirm('确定要清空购物车吗？')) {
            setCart({});
          }
        };
      
        // 计算购物车数据
        const { cartItems, totalPrice, totalItems } = useMemo(() => {
          const items: CartItem[] = [];
          let price = 0;
          let count = 0;
      
          Object.entries(cart).forEach(([productId, quantity]) => {
            const product = products.find(p => p.id === Number(productId));
            if (product && quantity > 0) {
              items.push({ product, quantity });
              price += product.price * quantity;
              count += quantity;
            }
          });
      
          return {
            cartItems: items,
            totalPrice: price,
            totalItems: count
          };
        }, [cart]);
      
        return (
          <div className="shopping-cart">
            <h1>🛒 购物车示例</h1>
            
            {/* 商品列表 */}
            <div className="products">
              <h2>商品列表</h2>
              <div className="product-grid">
                {products.map(product => (
                  <div key={product.id} className="product-card">
                    <div className="product-image">{product.image}</div>
                    <h3>{product.name}</h3>
                    <p className="price">¥{product.price}</p>
                    <p className="stock">库存: {product.stock}</p>
                    <button 
                      onClick={() => addToCart(product.id)}
                      disabled={cart[product.id] >= product.stock}
                    >
                      {cart[product.id] >= product.stock ? '库存不足' : '加入购物车'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
      
            {/* 购物车 */}
            <div className="cart">
              <h2>
                购物车 
                {totalItems > 0 && <span className="badge">{totalItems}</span>}
              </h2>
              
              {cartItems.length === 0 ? (
                <div className="empty-cart">
                  <p>购物车是空的</p>
                  <p>快去选择你喜欢的商品吧！</p>
                </div>
              ) : (
                <>
                  <div className="cart-items">
                    {cartItems.map(({ product, quantity }) => (
                      <div key={product.id} className="cart-item">
                        <div className="item-info">
                          <span className="item-image">{product.image}</span>
                          <span className="item-name">{product.name}</span>
                        </div>
                        <div className="item-controls">
                          <button 
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="qty-btn"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              updateQuantity(product.id, val);
                            }}
                            min="0"
                            max={product.stock}
                            className="qty-input"
                          />
                          <button 
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            className="qty-btn"
                            disabled={quantity >= product.stock}
                          >
                            +
                          </button>
                          <span className="item-price">
                            ¥{(product.price * quantity).toFixed(2)}
                          </span>
                          <button 
                            onClick={() => removeFromCart(product.id)}
                            className="remove-btn"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="cart-summary">
                    <div className="total">
                      <span>总计：</span>
                      <span className="total-price">¥{totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="cart-actions">
                      <button onClick={clearCart} className="clear-btn">
                        清空购物车
                      </button>
                      <button className="checkout-btn">
                        结算 ({totalItems}件商品)
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
      
            <style jsx>{`
              .shopping-cart {
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
              }
      
              .product-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 40px;
              }
      
              .product-card {
                border: 1px solid #ddd;
                border-radius: 8px;
                padding: 15px;
                text-align: center;
              }
      
              .product-image {
                font-size: 48px;
                margin-bottom: 10px;
              }
      
              .price {
                font-size: 20px;
                color: #e74c3c;
                font-weight: bold;
              }
      
              .stock {
                color: #666;
                font-size: 14px;
              }
      
              .cart {
                border-top: 2px solid #333;
                padding-top: 20px;
              }
      
              .badge {
                background: #e74c3c;
                color: white;
                border-radius: 12px;
                padding: 2px 8px;
                font-size: 14px;
                margin-left: 10px;
              }
      
              .empty-cart {
                text-align: center;
                padding: 60px 20px;
                color: #666;
              }
      
              .cart-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                border-bottom: 1px solid #eee;
              }
      
              .item-info {
                display: flex;
                align-items: center;
                gap: 15px;
              }
      
              .item-controls {
                display: flex;
                align-items: center;
                gap: 10px;
              }
      
              .qty-btn {
                width: 30px;
                height: 30px;
                border: 1px solid #ddd;
                background: white;
                cursor: pointer;
              }
      
              .qty-input {
                width: 50px;
                text-align: center;
                border: 1px solid #ddd;
                padding: 5px;
              }
      
              .cart-summary {
                margin-top: 20px;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 8px;
              }
      
              .total {
                display: flex;
                justify-content: space-between;
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 20px;
              }
      
              .cart-actions {
                display: flex;
                gap: 10px;
              }
      
              .checkout-btn {
                flex: 1;
                background: #27ae60;
                color: white;
                border: none;
                padding: 12px;
                border-radius: 4px;
                font-size: 16px;
                cursor: pointer;
              }
      
              .clear-btn {
                background: #e74c3c;
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 4px;
                cursor: pointer;
              }
      
              button:disabled {
                opacity: 0.6;
                cursor: not-allowed;
              }
            `}</style>
          </div>
        );
      }
      
      export default ShoppingCart;

  - filename: "MultiStepForm.tsx"
    content: |
      import React, { useState, useEffect } from 'react';
      
      // 表单数据类型
      interface FormData {
        // 步骤1：个人信息
        firstName: string;
        lastName: string;
        birthDate: string;
        gender: string;
        // 步骤2：联系方式
        email: string;
        phone: string;
        address: string;
        city: string;
        zipCode: string;
        // 步骤3：账户设置
        username: string;
        password: string;
        confirmPassword: string;
        newsletter: boolean;
        terms: boolean;
      }
      
      // 验证错误类型
      type ValidationErrors = Partial<Record<keyof FormData, string>>;
      
      // 初始表单数据
      const initialFormData: FormData = {
        firstName: '',
        lastName: '',
        birthDate: '',
        gender: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        zipCode: '',
        username: '',
        password: '',
        confirmPassword: '',
        newsletter: false,
        terms: false
      };
      
      function MultiStepForm() {
        const [currentStep, setCurrentStep] = useState(1);
        const [formData, setFormData] = useState<FormData>(initialFormData);
        const [errors, setErrors] = useState<ValidationErrors>({});
        const [touched, setTouched] = useState<Set<keyof FormData>>(new Set());
        const [isSubmitted, setIsSubmitted] = useState(false);
      
        // 检测未保存的更改
        useEffect(() => {
          const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (JSON.stringify(formData) !== JSON.stringify(initialFormData) && !isSubmitted) {
              e.preventDefault();
              e.returnValue = '';
            }
          };
      
          window.addEventListener('beforeunload', handleBeforeUnload);
          return () => window.removeEventListener('beforeunload', handleBeforeUnload);
        }, [formData, isSubmitted]);
      
        // 验证函数
        const validateStep = (step: number): boolean => {
          const newErrors: ValidationErrors = {};
      
          switch (step) {
            case 1:
              if (!formData.firstName.trim()) {
                newErrors.firstName = '请输入名字';
              }
              if (!formData.lastName.trim()) {
                newErrors.lastName = '请输入姓氏';
              }
              if (!formData.birthDate) {
                newErrors.birthDate = '请选择出生日期';
              } else {
                const age = new Date().getFullYear() - new Date(formData.birthDate).getFullYear();
                if (age < 18) {
                  newErrors.birthDate = '必须年满18岁';
                }
              }
              if (!formData.gender) {
                newErrors.gender = '请选择性别';
              }
              break;
      
            case 2:
              if (!formData.email.trim()) {
                newErrors.email = '请输入邮箱';
              } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                newErrors.email = '邮箱格式不正确';
              }
              if (!formData.phone.trim()) {
                newErrors.phone = '请输入电话号码';
              } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
                newErrors.phone = '请输入有效的手机号码';
              }
              if (!formData.address.trim()) {
                newErrors.address = '请输入地址';
              }
              if (!formData.city.trim()) {
                newErrors.city = '请输入城市';
              }
              if (!formData.zipCode.trim()) {
                newErrors.zipCode = '请输入邮编';
              } else if (!/^\d{6}$/.test(formData.zipCode)) {
                newErrors.zipCode = '邮编格式不正确';
              }
              break;
      
            case 3:
              if (!formData.username.trim()) {
                newErrors.username = '请输入用户名';
              } else if (formData.username.length < 4) {
                newErrors.username = '用户名至少4个字符';
              }
              if (!formData.password) {
                newErrors.password = '请输入密码';
              } else if (formData.password.length < 8) {
                newErrors.password = '密码至少8个字符';
              }
              if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = '两次密码不一致';
              }
              if (!formData.terms) {
                newErrors.terms = '请同意服务条款';
              }
              break;
          }
      
          setErrors(newErrors);
          return Object.keys(newErrors).length === 0;
        };
      
        // 处理输入变化
        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
          const { name, value, type } = e.target;
          const checked = (e.target as HTMLInputElement).checked;
      
          setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
          }));
      
          // 标记字段已被触碰
          setTouched(prev => new Set(prev).add(name as keyof FormData));
      
          // 清除该字段的错误
          if (errors[name as keyof FormData]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
          }
        };
      
        // 下一步
        const handleNext = () => {
          if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 3));
          }
        };
      
        // 上一步
        const handlePrev = () => {
          setCurrentStep(prev => Math.max(prev - 1, 1));
        };
      
        // 跳转到步骤
        const goToStep = (step: number) => {
          // 只能跳转到已完成的步骤或当前步骤
          if (step <= currentStep) {
            setCurrentStep(step);
          }
        };
      
        // 提交表单
        const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          if (validateStep(3)) {
            setIsSubmitted(true);
            console.log('提交的数据：', formData);
            alert('注册成功！');
          }
        };
      
        // 步骤是否完成
        const isStepCompleted = (step: number): boolean => {
          if (step >= currentStep) return false;
          
          // 简化验证，只检查必填字段
          switch (step) {
            case 1:
              return !!(formData.firstName && formData.lastName && formData.birthDate && formData.gender);
            case 2:
              return !!(formData.email && formData.phone && formData.address && formData.city && formData.zipCode);
            default:
              return false;
          }
        };
      
        return (
          <div className="multi-step-form">
            <h1>用户注册</h1>
            
            {/* 步骤指示器 */}
            <div className="step-indicator">
              {[1, 2, 3].map(step => (
                <div
                  key={step}
                  className={`step ${step === currentStep ? 'active' : ''} ${isStepCompleted(step) ? 'completed' : ''}`}
                  onClick={() => goToStep(step)}
                >
                  <div className="step-number">{isStepCompleted(step) ? '✓' : step}</div>
                  <div className="step-label">
                    {step === 1 ? '个人信息' : step === 2 ? '联系方式' : '账户设置'}
                  </div>
                </div>
              ))}
            </div>
      
            <form onSubmit={handleSubmit}>
              {/* 步骤1：个人信息 */}
              {currentStep === 1 && (
                <div className="form-step">
                  <h2>个人信息</h2>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>名字 *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={errors.firstName ? 'error' : ''}
                      />
                      {errors.firstName && <span className="error-msg">{errors.firstName}</span>}
                    </div>
                    
                    <div className="form-group">
                      <label>姓氏 *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={errors.lastName ? 'error' : ''}
                      />
                      {errors.lastName && <span className="error-msg">{errors.lastName}</span>}
                    </div>
                  </div>
      
                  <div className="form-group">
                    <label>出生日期 *</label>
                    <input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleChange}
                      max={new Date().toISOString().split('T')[0]}
                      className={errors.birthDate ? 'error' : ''}
                    />
                    {errors.birthDate && <span className="error-msg">{errors.birthDate}</span>}
                  </div>
      
                  <div className="form-group">
                    <label>性别 *</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className={errors.gender ? 'error' : ''}
                    >
                      <option value="">请选择</option>
                      <option value="male">男</option>
                      <option value="female">女</option>
                      <option value="other">其他</option>
                    </select>
                    {errors.gender && <span className="error-msg">{errors.gender}</span>}
                  </div>
                </div>
              )}
      
              {/* 步骤2：联系方式 */}
              {currentStep === 2 && (
                <div className="form-step">
                  <h2>联系方式</h2>
                  
                  <div className="form-group">
                    <label>邮箱 *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <span className="error-msg">{errors.email}</span>}
                  </div>
      
                  <div className="form-group">
                    <label>手机号码 *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="例：13812345678"
                      className={errors.phone ? 'error' : ''}
                    />
                    {errors.phone && <span className="error-msg">{errors.phone}</span>}
                  </div>
      
                  <div className="form-group">
                    <label>地址 *</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className={errors.address ? 'error' : ''}
                    />
                    {errors.address && <span className="error-msg">{errors.address}</span>}
                  </div>
      
                  <div className="form-row">
                    <div className="form-group">
                      <label>城市 *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className={errors.city ? 'error' : ''}
                      />
                      {errors.city && <span className="error-msg">{errors.city}</span>}
                    </div>
      
                    <div className="form-group">
                      <label>邮编 *</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        placeholder="6位数字"
                        className={errors.zipCode ? 'error' : ''}
                      />
                      {errors.zipCode && <span className="error-msg">{errors.zipCode}</span>}
                    </div>
                  </div>
                </div>
              )}
      
              {/* 步骤3：账户设置 */}
              {currentStep === 3 && (
                <div className="form-step">
                  <h2>账户设置</h2>
                  
                  <div className="form-group">
                    <label>用户名 *</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={errors.username ? 'error' : ''}
                    />
                    {errors.username && <span className="error-msg">{errors.username}</span>}
                  </div>
      
                  <div className="form-group">
                    <label>密码 *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={errors.password ? 'error' : ''}
                    />
                    {errors.password && <span className="error-msg">{errors.password}</span>}
                  </div>
      
                  <div className="form-group">
                    <label>确认密码 *</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={errors.confirmPassword ? 'error' : ''}
                    />
                    {errors.confirmPassword && <span className="error-msg">{errors.confirmPassword}</span>}
                  </div>
      
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="newsletter"
                        checked={formData.newsletter}
                        onChange={handleChange}
                      />
                      <span>订阅新闻通讯</span>
                    </label>
                  </div>
      
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="terms"
                        checked={formData.terms}
                        onChange={handleChange}
                      />
                      <span>我同意服务条款 *</span>
                    </label>
                    {errors.terms && <span className="error-msg">{errors.terms}</span>}
                  </div>
      
                  {/* 数据预览 */}
                  <div className="data-preview">
                    <h3>信息确认</h3>
                    <div className="preview-item">
                      <strong>姓名：</strong> {formData.firstName} {formData.lastName}
                    </div>
                    <div className="preview-item">
                      <strong>邮箱：</strong> {formData.email}
                    </div>
                    <div className="preview-item">
                      <strong>电话：</strong> {formData.phone}
                    </div>
                    <div className="preview-item">
                      <strong>地址：</strong> {formData.address}, {formData.city} {formData.zipCode}
                    </div>
                  </div>
                </div>
              )}
      
              {/* 导航按钮 */}
              <div className="form-navigation">
                {currentStep > 1 && (
                  <button type="button" onClick={handlePrev} className="btn-secondary">
                    上一步
                  </button>
                )}
                
                {currentStep < 3 ? (
                  <button type="button" onClick={handleNext} className="btn-primary">
                    下一步
                  </button>
                ) : (
                  <button type="submit" className="btn-primary">
                    提交注册
                  </button>
                )}
              </div>
            </form>
      
            <style jsx>{`
              .multi-step-form {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
      
              .step-indicator {
                display: flex;
                justify-content: space-between;
                margin-bottom: 40px;
              }
      
              .step {
                flex: 1;
                text-align: center;
                cursor: pointer;
                opacity: 0.5;
                transition: opacity 0.3s;
              }
      
              .step.active,
              .step.completed {
                opacity: 1;
              }
      
              .step-number {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: #ddd;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 8px;
                font-weight: bold;
              }
      
              .step.active .step-number {
                background: #3498db;
                color: white;
              }
      
              .step.completed .step-number {
                background: #27ae60;
                color: white;
              }
      
              .form-step {
                min-height: 400px;
              }
      
              .form-group {
                margin-bottom: 20px;
              }
      
              .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
              }
      
              label {
                display: block;
                margin-bottom: 5px;
                font-weight: 500;
              }
      
              input,
              select {
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 16px;
              }
      
              input.error,
              select.error {
                border-color: #e74c3c;
              }
      
              .error-msg {
                color: #e74c3c;
                font-size: 14px;
                display: block;
                margin-top: 5px;
              }
      
              .checkbox-group label {
                display: flex;
                align-items: center;
              }
      
              .checkbox-group input {
                width: auto;
                margin-right: 10px;
              }
      
              .data-preview {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin-top: 20px;
              }
      
              .preview-item {
                margin-bottom: 10px;
              }
      
              .form-navigation {
                display: flex;
                justify-content: space-between;
                margin-top: 40px;
              }
      
              .btn-primary,
              .btn-secondary {
                padding: 12px 30px;
                border: none;
                border-radius: 4px;
                font-size: 16px;
                cursor: pointer;
              }
      
              .btn-primary {
                background: #3498db;
                color: white;
              }
      
              .btn-secondary {
                background: #95a5a6;
                color: white;
              }
      
              button:hover {
                opacity: 0.9;
              }
            `}</style>
          </div>
        );
      }
      
      export default MultiStepForm;

  - filename: "RealTimeSearch.tsx"
    content: |
      import React, { useState, useEffect, useRef, useCallback } from 'react';
      
      // 模拟搜索数据
      const mockData = [
        { id: 1, title: "React Hooks完全指南", category: "教程" },
        { id: 2, title: "JavaScript异步编程", category: "文章" },
        { id: 3, title: "TypeScript入门到精通", category: "教程" },
        { id: 4, title: "前端性能优化技巧", category: "文章" },
        { id: 5, title: "CSS Grid布局详解", category: "教程" },
        { id: 6, title: "Vue3组合式API", category: "教程" },
        { id: 7, title: "Node.js后端开发", category: "文章" },
        { id: 8, title: "前端工程化实践", category: "文章" },
        { id: 9, title: "React状态管理方案", category: "教程" },
        { id: 10, title: "移动端适配方案", category: "文章" }
      ];
      
      // 热门搜索
      const hotSearches = ["React", "TypeScript", "性能优化", "Hooks", "异步编程"];
      
      function RealTimeSearch() {
        const [query, setQuery] = useState('');
        const [results, setResults] = useState<typeof mockData>([]);
        const [isLoading, setIsLoading] = useState(false);
        const [showDropdown, setShowDropdown] = useState(false);
        const [selectedIndex, setSelectedIndex] = useState(-1);
        const [searchHistory, setSearchHistory] = useState<string[]>(() => {
          const saved = localStorage.getItem('search-history');
          return saved ? JSON.parse(saved) : [];
        });
      
        const searchInputRef = useRef<HTMLInputElement>(null);
        const dropdownRef = useRef<HTMLDivElement>(null);
        const debounceTimerRef = useRef<NodeJS.Timeout>();
      
        // 模拟异步搜索
        const performSearch = useCallback(async (searchTerm: string) => {
          setIsLoading(true);
          
          // 模拟网络延迟
          await new Promise(resolve => setTimeout(resolve, 500));
          
          if (searchTerm.trim()) {
            const filtered = mockData.filter(item =>
              item.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setResults(filtered);
          } else {
            setResults([]);
          }
          
          setIsLoading(false);
        }, []);
      
        // 防抖搜索
        useEffect(() => {
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
          }
      
          if (query.trim()) {
            debounceTimerRef.current = setTimeout(() => {
              performSearch(query);
            }, 300);
          } else {
            setResults([]);
            setIsLoading(false);
          }
      
          return () => {
            if (debounceTimerRef.current) {
              clearTimeout(debounceTimerRef.current);
            }
          };
        }, [query, performSearch]);
      
        // 处理键盘导航
        useEffect(() => {
          const handleKeyDown = (e: KeyboardEvent) => {
            if (!showDropdown) return;
      
            switch (e.key) {
              case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => {
                  const maxIndex = results.length + (searchHistory.length > 0 ? searchHistory.length : 0) + hotSearches.length - 1;
                  return prev < maxIndex ? prev + 1 : 0;
                });
                break;
      
              case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => {
                  const maxIndex = results.length + (searchHistory.length > 0 ? searchHistory.length : 0) + hotSearches.length - 1;
                  return prev > 0 ? prev - 1 : maxIndex;
                });
                break;
      
              case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0) {
                  handleSelectItem(selectedIndex);
                } else if (query.trim()) {
                  addToHistory(query);
                }
                break;
      
              case 'Escape':
                setShowDropdown(false);
                searchInputRef.current?.blur();
                break;
            }
          };
      
          document.addEventListener('keydown', handleKeyDown);
          return () => document.removeEventListener('keydown', handleKeyDown);
        }, [showDropdown, selectedIndex, results.length, searchHistory.length, query]);
      
        // 处理点击外部关闭
        useEffect(() => {
          const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
              setShowDropdown(false);
            }
          };
      
          document.addEventListener('mousedown', handleClickOutside);
          return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);
      
        // 添加到历史记录
        const addToHistory = (term: string) => {
          const newHistory = [term, ...searchHistory.filter(h => h !== term)].slice(0, 10);
          setSearchHistory(newHistory);
          localStorage.setItem('search-history', JSON.stringify(newHistory));
        };
      
        // 清除历史记录
        const clearHistory = () => {
          setSearchHistory([]);
          localStorage.removeItem('search-history');
        };
      
        // 处理选择项目
        const handleSelectItem = (index: number) => {
          let currentIndex = 0;
          
          // 搜索结果
          if (index < results.length) {
            const selected = results[index];
            setQuery(selected.title);
            addToHistory(selected.title);
            setShowDropdown(false);
            return;
          }
          currentIndex += results.length;
      
          // 历史记录
          if (searchHistory.length > 0 && index < currentIndex + searchHistory.length) {
            const historyIndex = index - currentIndex;
            setQuery(searchHistory[historyIndex]);
            setShowDropdown(false);
            return;
          }
          currentIndex += searchHistory.length;
      
          // 热门搜索
          if (index < currentIndex + hotSearches.length) {
            const hotIndex = index - currentIndex;
            setQuery(hotSearches[hotIndex]);
            performSearch(hotSearches[hotIndex]);
          }
        };
      
        // 高亮匹配文本
        const highlightMatch = (text: string, search: string) => {
          if (!search.trim()) return text;
          
          const regex = new RegExp(`(${search})`, 'gi');
          const parts = text.split(regex);
          
          return parts.map((part, index) => 
            regex.test(part) ? <mark key={index}>{part}</mark> : part
          );
        };
      
        // 计算当前项目的索引
        const getItemIndex = (section: 'results' | 'history' | 'hot', index: number) => {
          let baseIndex = 0;
          
          if (section === 'history') {
            baseIndex = results.length;
          } else if (section === 'hot') {
            baseIndex = results.length + (searchHistory.length > 0 ? searchHistory.length : 0);
          }
          
          return baseIndex + index;
        };
      
        return (
          <div className="search-container">
            <h1>实时搜索示例</h1>
            
            <div className="search-wrapper" ref={dropdownRef}>
              <div className="search-box">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="搜索文章、教程..."
                  className="search-input"
                />
                {isLoading && <span className="loading-spinner">⏳</span>}
              </div>
      
              {showDropdown && (
                <div className="search-dropdown">
                  {/* 搜索结果 */}
                  {results.length > 0 && (
                    <div className="dropdown-section">
                      <h3>搜索结果</h3>
                      {results.map((result, index) => (
                        <div
                          key={result.id}
                          className={`dropdown-item ${getItemIndex('results', index) === selectedIndex ? 'selected' : ''}`}
                          onClick={() => handleSelectItem(getItemIndex('results', index))}
                          onMouseEnter={() => setSelectedIndex(getItemIndex('results', index))}
                        >
                          <span className="item-title">
                            {highlightMatch(result.title, query)}
                          </span>
                          <span className="item-category">{result.category}</span>
                        </div>
                      ))}
                    </div>
                  )}
      
                  {/* 无结果提示 */}
                  {query.trim() && !isLoading && results.length === 0 && (
                    <div className="no-results">
                      没有找到 "{query}" 相关的结果
                    </div>
                  )}
      
                  {/* 搜索历史 */}
                  {searchHistory.length > 0 && !query.trim() && (
                    <div className="dropdown-section">
                      <div className="section-header">
                        <h3>搜索历史</h3>
                        <button onClick={clearHistory} className="clear-btn">
                          清除
                        </button>
                      </div>
                      {searchHistory.map((term, index) => (
                        <div
                          key={term}
                          className={`dropdown-item ${getItemIndex('history', index) === selectedIndex ? 'selected' : ''}`}
                          onClick={() => handleSelectItem(getItemIndex('history', index))}
                          onMouseEnter={() => setSelectedIndex(getItemIndex('history', index))}
                        >
                          <span className="history-icon">🕐</span>
                          <span>{term}</span>
                        </div>
                      ))}
                    </div>
                  )}
      
                  {/* 热门搜索 */}
                  {!query.trim() && (
                    <div className="dropdown-section">
                      <h3>热门搜索</h3>
                      <div className="hot-searches">
                        {hotSearches.map((term, index) => (
                          <span
                            key={term}
                            className={`hot-tag ${getItemIndex('hot', index) === selectedIndex ? 'selected' : ''}`}
                            onClick={() => handleSelectItem(getItemIndex('hot', index))}
                            onMouseEnter={() => setSelectedIndex(getItemIndex('hot', index))}
                          >
                            {term}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
      
            <div className="tips">
              <p>💡 提示：</p>
              <ul>
                <li>输入关键词进行搜索，支持300ms防抖</li>
                <li>使用↑↓键导航，Enter键选择</li>
                <li>按ESC键关闭搜索结果</li>
                <li>搜索历史会自动保存（最多10条）</li>
              </ul>
            </div>
      
            <style jsx>{`
              .search-container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
      
              .search-wrapper {
                position: relative;
              }
      
              .search-box {
                position: relative;
              }
      
              .search-input {
                width: 100%;
                padding: 12px 40px 12px 20px;
                font-size: 16px;
                border: 2px solid #ddd;
                border-radius: 8px;
                outline: none;
                transition: border-color 0.3s;
              }
      
              .search-input:focus {
                border-color: #3498db;
              }
      
              .loading-spinner {
                position: absolute;
                right: 15px;
                top: 50%;
                transform: translateY(-50%);
                font-size: 20px;
              }
      
              .search-dropdown {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                margin-top: 5px;
                background: white;
                border: 1px solid #ddd;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                max-height: 400px;
                overflow-y: auto;
                z-index: 1000;
              }
      
              .dropdown-section {
                padding: 10px 0;
                border-bottom: 1px solid #eee;
              }
      
              .dropdown-section:last-child {
                border-bottom: none;
              }
      
              .section-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0 15px;
              }
      
              .dropdown-section h3 {
                margin: 0 0 10px;
                padding: 0 15px;
                font-size: 14px;
                color: #666;
                font-weight: normal;
              }
      
              .dropdown-item {
                padding: 10px 15px;
                cursor: pointer;
                display: flex;
                justify-content: space-between;
                align-items: center;
                transition: background-color 0.2s;
              }
      
              .dropdown-item:hover,
              .dropdown-item.selected {
                background-color: #f5f5f5;
              }
      
              .item-title {
                flex: 1;
              }
      
              .item-category {
                font-size: 12px;
                color: #999;
                margin-left: 10px;
              }
      
              .history-icon {
                margin-right: 10px;
              }
      
              .no-results {
                padding: 20px;
                text-align: center;
                color: #666;
              }
      
              .hot-searches {
                padding: 0 15px 10px;
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
              }
      
              .hot-tag {
                padding: 5px 12px;
                background: #f0f0f0;
                border-radius: 20px;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s;
              }
      
              .hot-tag:hover,
              .hot-tag.selected {
                background: #3498db;
                color: white;
              }
      
              .clear-btn {
                background: none;
                border: none;
                color: #3498db;
                cursor: pointer;
                font-size: 14px;
              }
      
              .tips {
                margin-top: 40px;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 8px;
              }
      
              .tips ul {
                margin: 10px 0 0 20px;
              }
      
              .tips li {
                margin-bottom: 5px;
              }
      
              mark {
                background: #ffd700;
                padding: 0 2px;
                border-radius: 2px;
              }
      
              /* 滚动条样式 */
              .search-dropdown::-webkit-scrollbar {
                width: 6px;
              }
      
              .search-dropdown::-webkit-scrollbar-track {
                background: #f1f1f1;
              }
      
              .search-dropdown::-webkit-scrollbar-thumb {
                background: #888;
                border-radius: 3px;
              }
      
              .search-dropdown::-webkit-scrollbar-thumb:hover {
                background: #555;
              }
            `}</style>
          </div>
        );
      }
      
      export default RealTimeSearch;

keyTakeaways:
  - "State更新是异步的，需要使用函数式更新或useEffect处理依赖前一个state的逻辑"
  - "受控组件提供更精确的控制，适合需要实时验证的场景；非受控组件更简单，适合一次性获取值"
  - "防抖技术可以显著提升搜索性能，避免频繁的API调用"
  - "键盘导航增强了用户体验，但需要正确处理焦点管理和preventDefault"
  - "localStorage是保存用户偏好和历史记录的好方法，但要注意容量限制"
  - "状态提升是React中共享状态的基本模式，适用于兄弟组件间的通信"
  - "使用useMemo优化计算密集型操作，避免不必要的重复计算"

commonMistakes:
  - "直接修改state对象而不是创建新对象"
  - "在事件处理函数中忘记使用e.preventDefault()"
  - "过度使用受控组件，导致代码复杂度增加"
  - "忘记清理副作用（如定时器、事件监听器）"
  - "在循环中创建事件处理函数，影响性能"

extensions:
  - "添加商品图片上传功能"
  - "实现购物车数据与后端同步"
  - "添加优惠券和折扣功能"
  - "实现搜索结果的分页加载"
  - "添加语音搜索功能"
  - "集成第三方表单验证库如Formik或React Hook Form"
---