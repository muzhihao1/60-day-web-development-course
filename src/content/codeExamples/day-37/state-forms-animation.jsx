// Day 37: 状态管理、表单和动画库示例

import React, { useState, useEffect } from 'react';

// ==========================================
// 1. Zustand 状态管理
// ==========================================

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// 简单的计数器 Store
const useCounterStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  incrementBy: (amount) => set((state) => ({ count: state.count + amount })),
  reset: () => set({ count: 0 }),
}));

// 复杂的购物车 Store（使用 immer）
const useCartStore = create(
  devtools(
    persist(
      immer((set) => ({
        items: [],
        totalAmount: 0,
        
        addItem: (product) =>
          set((state) => {
            const existingItem = state.items.find(item => item.id === product.id);
            
            if (existingItem) {
              existingItem.quantity += 1;
            } else {
              state.items.push({ ...product, quantity: 1 });
            }
            
            state.totalAmount = state.items.reduce(
              (total, item) => total + item.price * item.quantity,
              0
            );
          }),
        
        removeItem: (productId) =>
          set((state) => {
            const index = state.items.findIndex(item => item.id === productId);
            if (index !== -1) {
              state.items.splice(index, 1);
            }
            
            state.totalAmount = state.items.reduce(
              (total, item) => total + item.price * item.quantity,
              0
            );
          }),
        
        updateQuantity: (productId, quantity) =>
          set((state) => {
            const item = state.items.find(item => item.id === productId);
            if (item) {
              item.quantity = quantity;
              if (quantity === 0) {
                const index = state.items.indexOf(item);
                state.items.splice(index, 1);
              }
            }
            
            state.totalAmount = state.items.reduce(
              (total, item) => total + item.price * item.quantity,
              0
            );
          }),
        
        clearCart: () =>
          set((state) => {
            state.items = [];
            state.totalAmount = 0;
          }),
      })),
      {
        name: 'cart-storage',
      }
    )
  )
);

// Todo Store with async actions
const useTodoStore = create((set, get) => ({
  todos: [],
  loading: false,
  error: null,
  filter: 'all',
  
  fetchTodos: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/todos');
      const todos = await response.json();
      set({ todos, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  addTodo: async (text) => {
    const tempId = Date.now();
    const newTodo = { id: tempId, text, completed: false, pending: true };
    
    set((state) => ({ todos: [...state.todos, newTodo] }));
    
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      
      const savedTodo = await response.json();
      
      set((state) => ({
        todos: state.todos.map(todo =>
          todo.id === tempId ? { ...savedTodo, pending: false } : todo
        ),
      }));
    } catch (error) {
      set((state) => ({
        todos: state.todos.filter(todo => todo.id !== tempId),
        error: error.message,
      }));
    }
  },
  
  toggleTodo: (id) =>
    set((state) => ({
      todos: state.todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ),
    })),
  
  deleteTodo: (id) =>
    set((state) => ({
      todos: state.todos.filter(todo => todo.id !== id),
    })),
  
  setFilter: (filter) => set({ filter }),
  
  get filteredTodos() {
    const { todos, filter } = get();
    switch (filter) {
      case 'active':
        return todos.filter(todo => !todo.completed);
      case 'completed':
        return todos.filter(todo => todo.completed);
      default:
        return todos;
    }
  },
}));

// Zustand 组件示例
export function ZustandExample() {
  const { count, increment, decrement, reset } = useCounterStore();
  const cart = useCartStore();
  const todos = useTodoStore();
  
  const products = [
    { id: 1, name: 'React Course', price: 99 },
    { id: 2, name: 'TypeScript Guide', price: 79 },
    { id: 3, name: 'Node.js Mastery', price: 89 },
  ];
  
  return (
    <div className="zustand-example">
      <h2>Zustand State Management</h2>
      
      {/* 简单计数器 */}
      <section>
        <h3>Counter Store</h3>
        <div>
          <p>Count: {count}</p>
          <button onClick={increment}>+</button>
          <button onClick={decrement}>-</button>
          <button onClick={reset}>Reset</button>
        </div>
      </section>
      
      {/* 购物车 */}
      <section>
        <h3>Shopping Cart (Persisted)</h3>
        <div className="products">
          {products.map(product => (
            <div key={product.id} className="product-card">
              <h4>{product.name}</h4>
              <p>${product.price}</p>
              <button onClick={() => cart.addItem(product)}>
                Add to Cart
              </button>
            </div>
          ))}
        </div>
        
        <div className="cart">
          <h4>Cart Items ({cart.items.length})</h4>
          {cart.items.map(item => (
            <div key={item.id} className="cart-item">
              <span>{item.name}</span>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => cart.updateQuantity(item.id, parseInt(e.target.value))}
                min="0"
              />
              <span>${item.price * item.quantity}</span>
              <button onClick={() => cart.removeItem(item.id)}>×</button>
            </div>
          ))}
          <p>Total: ${cart.totalAmount.toFixed(2)}</p>
          <button onClick={cart.clearCart}>Clear Cart</button>
        </div>
      </section>
      
      {/* Todo List */}
      <section>
        <h3>Todo List with Async Actions</h3>
        <div className="todo-filters">
          <button
            className={todos.filter === 'all' ? 'active' : ''}
            onClick={() => todos.setFilter('all')}
          >
            All
          </button>
          <button
            className={todos.filter === 'active' ? 'active' : ''}
            onClick={() => todos.setFilter('active')}
          >
            Active
          </button>
          <button
            className={todos.filter === 'completed' ? 'active' : ''}
            onClick={() => todos.setFilter('completed')}
          >
            Completed
          </button>
        </div>
        
        {todos.loading && <p>Loading...</p>}
        {todos.error && <p>Error: {todos.error}</p>}
        
        <ul className="todo-list">
          {todos.filteredTodos.map(todo => (
            <li key={todo.id} className={todo.pending ? 'pending' : ''}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => todos.toggleTodo(todo.id)}
              />
              <span className={todo.completed ? 'completed' : ''}>
                {todo.text}
              </span>
              <button onClick={() => todos.deleteTodo(todo.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

// ==========================================
// 2. React Hook Form 高级示例
// ==========================================

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// 验证schema
const schema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  age: yup
    .number()
    .positive('Age must be positive')
    .integer('Age must be an integer')
    .min(18, 'Must be at least 18')
    .required('Age is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
      'Password must contain uppercase, lowercase and number'
    )
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  preferences: yup.object({
    newsletter: yup.boolean(),
    notifications: yup.boolean(),
  }),
  skills: yup.array().of(
    yup.object({
      name: yup.string().required('Skill name is required'),
      level: yup.number().min(1).max(10).required('Skill level is required'),
    })
  ),
  country: yup.string().required('Country is required'),
  bio: yup.string().max(500, 'Bio must be less than 500 characters'),
}).required();

export function ReactHookFormExample() {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      age: '',
      password: '',
      confirmPassword: '',
      preferences: {
        newsletter: false,
        notifications: true,
      },
      skills: [{ name: '', level: 5 }],
      country: '',
      bio: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'skills',
  });

  const watchPassword = watch('password');
  const watchAllFields = watch();

  const onSubmit = async (data) => {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Form Data:', data);
    alert('Form submitted successfully!');
  };

  return (
    <div className="react-hook-form-example">
      <h2>React Hook Form Advanced Example</h2>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* 基本输入 */}
        <div className="form-row">
          <div className="form-group">
            <label>First Name</label>
            <input {...register('firstName')} />
            {errors.firstName && (
              <span className="error">{errors.firstName.message}</span>
            )}
          </div>
          
          <div className="form-group">
            <label>Last Name</label>
            <input {...register('lastName')} />
            {errors.lastName && (
              <span className="error">{errors.lastName.message}</span>
            )}
          </div>
        </div>
        
        <div className="form-group">
          <label>Email</label>
          <input type="email" {...register('email')} />
          {errors.email && (
            <span className="error">{errors.email.message}</span>
          )}
        </div>
        
        <div className="form-group">
          <label>Age</label>
          <input type="number" {...register('age')} />
          {errors.age && (
            <span className="error">{errors.age.message}</span>
          )}
        </div>
        
        {/* 密码验证 */}
        <div className="form-group">
          <label>Password</label>
          <input type="password" {...register('password')} />
          {errors.password && (
            <span className="error">{errors.password.message}</span>
          )}
          {watchPassword && (
            <div className="password-strength">
              <div
                className={`strength-bar ${
                  watchPassword.length >= 8 ? 'strong' : 'weak'
                }`}
              />
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label>Confirm Password</label>
          <input type="password" {...register('confirmPassword')} />
          {errors.confirmPassword && (
            <span className="error">{errors.confirmPassword.message}</span>
          )}
        </div>
        
        {/* 复选框 */}
        <div className="form-group">
          <label>
            <input type="checkbox" {...register('preferences.newsletter')} />
            Subscribe to newsletter
          </label>
          <label>
            <input type="checkbox" {...register('preferences.notifications')} />
            Enable notifications
          </label>
        </div>
        
        {/* 动态字段数组 */}
        <div className="form-group">
          <label>Skills</label>
          {fields.map((field, index) => (
            <div key={field.id} className="skill-row">
              <input
                {...register(`skills.${index}.name`)}
                placeholder="Skill name"
              />
              <input
                type="number"
                {...register(`skills.${index}.level`)}
                placeholder="Level (1-10)"
                min="1"
                max="10"
              />
              <button type="button" onClick={() => remove(index)}>
                Remove
              </button>
              {errors.skills?.[index]?.name && (
                <span className="error">
                  {errors.skills[index].name.message}
                </span>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ name: '', level: 5 })}
          >
            Add Skill
          </button>
        </div>
        
        {/* 受控组件 */}
        <div className="form-group">
          <label>Country</label>
          <Controller
            name="country"
            control={control}
            render={({ field }) => (
              <select {...field}>
                <option value="">Select a country</option>
                <option value="us">United States</option>
                <option value="uk">United Kingdom</option>
                <option value="ca">Canada</option>
                <option value="au">Australia</option>
              </select>
            )}
          />
          {errors.country && (
            <span className="error">{errors.country.message}</span>
          )}
        </div>
        
        {/* 文本域 */}
        <div className="form-group">
          <label>Bio</label>
          <textarea {...register('bio')} rows="4" />
          {errors.bio && (
            <span className="error">{errors.bio.message}</span>
          )}
          <span className="char-count">
            {watchAllFields.bio?.length || 0}/500
          </span>
        </div>
        
        {/* 提交按钮 */}
        <div className="form-actions">
          <button type="submit" disabled={isSubmitting || !isValid}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
          <button type="button" onClick={() => reset()}>
            Reset
          </button>
        </div>
      </form>
      
      {/* 实时表单数据显示（开发时有用） */}
      <div className="form-debug">
        <h4>Form Data (Debug)</h4>
        <pre>{JSON.stringify(watchAllFields, null, 2)}</pre>
      </div>
    </div>
  );
}

// ==========================================
// 3. Framer Motion 动画示例
// ==========================================

import {
  motion,
  AnimatePresence,
  useAnimation,
  useInView,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useCycle,
} from 'framer-motion';
import { useRef } from 'react';

// 动画变体
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

// 页面过渡动画
const pageVariants = {
  initial: {
    opacity: 0,
    x: '-100vw',
  },
  in: {
    opacity: 1,
    x: 0,
  },
  out: {
    opacity: 0,
    x: '100vw',
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5,
};

export function FramerMotionExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  
  const controls = useAnimation();
  const scrollRef = useRef(null);
  const isInView = useInView(scrollRef);
  
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1.2]);
  
  const x = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 30 });
  
  const [animate, cycle] = useCycle(
    { scale: 1, rotate: 0 },
    { scale: 1.2, rotate: 180 }
  );
  
  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [controls, isInView]);
  
  const cards = [
    { id: 1, title: 'Card 1', subtitle: 'Subtitle 1', color: '#ff6b6b' },
    { id: 2, title: 'Card 2', subtitle: 'Subtitle 2', color: '#4ecdc4' },
    { id: 3, title: 'Card 3', subtitle: 'Subtitle 3', color: '#45b7d1' },
  ];
  
  return (
    <div className="framer-motion-example">
      <h2>Framer Motion Animations</h2>
      
      {/* 基础动画 */}
      <section>
        <h3>Basic Animations</h3>
        <div className="animation-grid">
          <motion.div
            className="animation-box"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            Hover & Tap Me
          </motion.div>
          
          <motion.div
            className="animation-box"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            Rotating
          </motion.div>
          
          <motion.div
            className="animation-box"
            animate={animate}
            onClick={() => cycle()}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            Click to Cycle
          </motion.div>
        </div>
      </section>
      
      {/* 手势动画 */}
      <section>
        <h3>Gesture Animations</h3>
        <motion.div
          className="draggable-box"
          drag
          dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
          dragElastic={0.2}
          whileDrag={{ scale: 1.2 }}
          style={{ x: springX }}
          onDrag={(event, info) => x.set(info.point.x)}
        >
          Drag Me!
        </motion.div>
      </section>
      
      {/* 列表动画 */}
      <section>
        <h3>Stagger Animation</h3>
        <motion.ul
          className="stagger-list"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {['Item 1', 'Item 2', 'Item 3', 'Item 4'].map((item, index) => (
            <motion.li key={index} variants={itemVariants}>
              {item}
            </motion.li>
          ))}
        </motion.ul>
      </section>
      
      {/* 布局动画 */}
      <section>
        <h3>Layout Animation</h3>
        <div className="layout-grid">
          {cards.map(card => (
            <motion.div
              key={card.id}
              layoutId={card.id}
              onClick={() => setSelectedId(card.id)}
              className="layout-card"
              style={{ backgroundColor: card.color }}
              whileHover={{ y: -10 }}
            >
              <motion.h4>{card.title}</motion.h4>
              <motion.p>{card.subtitle}</motion.p>
            </motion.div>
          ))}
        </div>
        
        <AnimatePresence>
          {selectedId && (
            <>
              <motion.div
                className="modal-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedId(null)}
              />
              <motion.div
                layoutId={selectedId}
                className="modal-card"
                style={{
                  backgroundColor: cards.find(c => c.id === selectedId)?.color,
                }}
              >
                <motion.h2>
                  {cards.find(c => c.id === selectedId)?.title}
                </motion.h2>
                <motion.p>
                  This is the expanded content for{' '}
                  {cards.find(c => c.id === selectedId)?.subtitle}
                </motion.p>
                <motion.button onClick={() => setSelectedId(null)}>
                  Close
                </motion.button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </section>
      
      {/* 滚动动画 */}
      <section>
        <h3>Scroll Animation</h3>
        <motion.div
          className="scroll-indicator"
          style={{ scale }}
        >
          <p>Scroll to see me scale!</p>
        </motion.div>
        
        <motion.div
          ref={scrollRef}
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0, y: 100 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.5, ease: 'easeOut' },
            },
          }}
          className="scroll-reveal"
        >
          <h4>Scroll-triggered Animation</h4>
          <p>This content appears when scrolled into view</p>
        </motion.div>
      </section>
      
      {/* 页面过渡 */}
      <section>
        <h3>Page Transitions</h3>
        <div className="page-container">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="page-content"
            >
              <h4>Page {currentPage + 1}</h4>
              <p>This is the content for page {currentPage + 1}</p>
            </motion.div>
          </AnimatePresence>
          
          <div className="page-controls">
            <button
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(2, prev + 1))}
              disabled={currentPage === 2}
            >
              Next
            </button>
          </div>
        </div>
      </section>
      
      {/* SVG动画 */}
      <section>
        <h3>SVG Path Animation</h3>
        <motion.svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          initial="hidden"
          animate="visible"
        >
          <motion.circle
            cx="100"
            cy="100"
            r="80"
            stroke="#ff6b6b"
            strokeWidth="3"
            fill="none"
            variants={{
              hidden: {
                pathLength: 0,
                opacity: 0,
              },
              visible: {
                pathLength: 1,
                opacity: 1,
                transition: {
                  pathLength: { duration: 2, ease: 'easeInOut' },
                  opacity: { duration: 0.5 },
                },
              },
            }}
          />
          <motion.path
            d="M 50 100 Q 100 50 150 100 T 250 100"
            stroke="#4ecdc4"
            strokeWidth="3"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 0.5 }}
          />
        </motion.svg>
      </section>
      
      {/* 复杂组合动画 */}
      <section>
        <h3>Complex Animation</h3>
        <motion.div
          className="complex-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="orbit-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          >
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="orbit-item"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${i * 120}deg) translateX(60px)`,
                }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}

// ==========================================
// 4. MobX 状态管理示例
// ==========================================

import { makeObservable, observable, action, computed, runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';

// MobX Store
class TaskStore {
  tasks = [];
  filter = 'all';
  isLoading = false;
  
  constructor() {
    makeObservable(this, {
      tasks: observable,
      filter: observable,
      isLoading: observable,
      addTask: action,
      toggleTask: action,
      deleteTask: action,
      setFilter: action,
      loadTasks: action,
      completedCount: computed,
      activeCount: computed,
      filteredTasks: computed,
    });
  }
  
  addTask(text) {
    this.tasks.push({
      id: Date.now(),
      text,
      completed: false,
      createdAt: new Date(),
    });
  }
  
  toggleTask(id) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
    }
  }
  
  deleteTask(id) {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index > -1) {
      this.tasks.splice(index, 1);
    }
  }
  
  setFilter(filter) {
    this.filter = filter;
  }
  
  async loadTasks() {
    this.isLoading = true;
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      runInAction(() => {
        this.tasks = [
          { id: 1, text: 'Learn MobX', completed: true, createdAt: new Date() },
          { id: 2, text: 'Build an app', completed: false, createdAt: new Date() },
        ];
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }
  
  get completedCount() {
    return this.tasks.filter(task => task.completed).length;
  }
  
  get activeCount() {
    return this.tasks.filter(task => !task.completed).length;
  }
  
  get filteredTasks() {
    switch (this.filter) {
      case 'active':
        return this.tasks.filter(task => !task.completed);
      case 'completed':
        return this.tasks.filter(task => task.completed);
      default:
        return this.tasks;
    }
  }
}

const taskStore = new TaskStore();

// MobX组件
const TaskList = observer(() => {
  const [newTask, setNewTask] = useState('');
  
  useEffect(() => {
    taskStore.loadTasks();
  }, []);
  
  const handleAddTask = (e) => {
    e.preventDefault();
    if (newTask.trim()) {
      taskStore.addTask(newTask);
      setNewTask('');
    }
  };
  
  return (
    <div className="mobx-example">
      <h3>MobX Task Manager</h3>
      
      <form onSubmit={handleAddTask}>
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
        />
        <button type="submit">Add</button>
      </form>
      
      <div className="task-stats">
        <span>Active: {taskStore.activeCount}</span>
        <span>Completed: {taskStore.completedCount}</span>
        <span>Total: {taskStore.tasks.length}</span>
      </div>
      
      <div className="task-filters">
        <button
          className={taskStore.filter === 'all' ? 'active' : ''}
          onClick={() => taskStore.setFilter('all')}
        >
          All
        </button>
        <button
          className={taskStore.filter === 'active' ? 'active' : ''}
          onClick={() => taskStore.setFilter('active')}
        >
          Active
        </button>
        <button
          className={taskStore.filter === 'completed' ? 'active' : ''}
          onClick={() => taskStore.setFilter('completed')}
        >
          Completed
        </button>
      </div>
      
      {taskStore.isLoading ? (
        <p>Loading tasks...</p>
      ) : (
        <ul className="task-list">
          {taskStore.filteredTasks.map(task => (
            <li key={task.id}>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => taskStore.toggleTask(task.id)}
              />
              <span className={task.completed ? 'completed' : ''}>
                {task.text}
              </span>
              <button onClick={() => taskStore.deleteTask(task.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

export function MobXExample() {
  return <TaskList />;
}