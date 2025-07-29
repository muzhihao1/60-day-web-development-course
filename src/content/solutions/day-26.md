---
day: 26
exerciseTitle: "高级组件模式实现"
approach: "使用复合组件、Context API、forwardRef等高级模式创建灵活可复用的组件系统"
files:
  - filename: "Form/Form.tsx"
    content: |
      // Form/Form.tsx - 表单容器组件
      import React, { createContext, useContext, useState, useRef, FormEvent } from 'react';
      import { Input } from './Input';
      import { Select } from './Select';
      import { Checkbox } from './Checkbox';
      
      interface FormContextType {
        values: Record<string, any>;
        errors: Record<string, string>;
        touched: Record<string, boolean>;
        setValue: (name: string, value: any) => void;
        setError: (name: string, error: string) => void;
        setTouched: (name: string) => void;
        validateField: (name: string, value: any, rules?: ValidationRules) => string | undefined;
      }
      
      interface ValidationRules {
        required?: boolean;
        minLength?: number;
        maxLength?: number;
        pattern?: RegExp;
        email?: boolean;
        custom?: (value: any) => string | undefined;
      }
      
      const FormContext = createContext<FormContextType | undefined>(undefined);
      
      export const useFormContext = () => {
        const context = useContext(FormContext);
        if (!context) {
          throw new Error('Form compound components must be used within Form');
        }
        return context;
      };
      
      interface FormProps {
        children: React.ReactNode;
        onSubmit: (values: Record<string, any>) => void | Promise<void>;
        initialValues?: Record<string, any>;
      }
      
      export const Form: React.FC<FormProps> & {
        Input: typeof Input;
        Select: typeof Select;
        Checkbox: typeof Checkbox;
        Submit: typeof Submit;
      } = ({ children, onSubmit, initialValues = {} }) => {
        const [values, setValues] = useState<Record<string, any>>(initialValues);
        const [errors, setErrors] = useState<Record<string, string>>({});
        const [touched, setTouched] = useState<Record<string, boolean>>({});
        const [isSubmitting, setIsSubmitting] = useState(false);
        
        const validateField = (name: string, value: any, rules?: ValidationRules): string | undefined => {
          if (!rules) return undefined;
          
          // Required validation
          if (rules.required && !value) {
            return '此字段是必填项';
          }
          
          // String validations
          if (typeof value === 'string') {
            if (rules.minLength && value.length < rules.minLength) {
              return `最少需要${rules.minLength}个字符`;
            }
            
            if (rules.maxLength && value.length > rules.maxLength) {
              return `最多允许${rules.maxLength}个字符`;
            }
            
            if (rules.pattern && !rules.pattern.test(value)) {
              return '格式不正确';
            }
            
            if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              return '请输入有效的邮箱地址';
            }
          }
          
          // Custom validation
          if (rules.custom) {
            return rules.custom(value);
          }
          
          return undefined;
        };
        
        const setValue = (name: string, value: any) => {
          setValues(prev => ({ ...prev, [name]: value }));
          // Clear error when value changes
          if (errors[name]) {
            setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors[name];
              return newErrors;
            });
          }
        };
        
        const setError = (name: string, error: string) => {
          setErrors(prev => ({ ...prev, [name]: error }));
        };
        
        const setTouchedField = (name: string) => {
          setTouched(prev => ({ ...prev, [name]: true }));
        };
        
        const handleSubmit = async (e: FormEvent) => {
          e.preventDefault();
          
          // Touch all fields
          const allTouched: Record<string, boolean> = {};
          Object.keys(values).forEach(key => {
            allTouched[key] = true;
          });
          setTouched(allTouched);
          
          // Validate all fields
          let hasErrors = false;
          const newErrors: Record<string, string> = {};
          
          // This is a simplified validation - in real app, you'd need to access field rules
          Object.entries(values).forEach(([name, value]) => {
            if (!value && name !== 'agree') { // Simple required check
              newErrors[name] = '此字段是必填项';
              hasErrors = true;
            }
          });
          
          setErrors(newErrors);
          
          if (!hasErrors) {
            setIsSubmitting(true);
            try {
              await onSubmit(values);
            } finally {
              setIsSubmitting(false);
            }
          }
        };
        
        const contextValue: FormContextType = {
          values,
          errors,
          touched,
          setValue,
          setError,
          setTouched: setTouchedField,
          validateField,
        };
        
        return (
          <FormContext.Provider value={contextValue}>
            <form onSubmit={handleSubmit} noValidate>
              {children}
            </form>
          </FormContext.Provider>
        );
      };
      
      // Submit Button
      const Submit: React.FC<{ children: React.ReactNode; disabled?: boolean }> = ({ 
        children, 
        disabled 
      }) => {
        return (
          <button
            type="submit"
            disabled={disabled}
            style={{
              padding: '10px 20px',
              backgroundColor: disabled ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              marginTop: '16px',
            }}
          >
            {children}
          </button>
        );
      };
      
      // Attach compound components
      Form.Input = Input;
      Form.Select = Select;
      Form.Checkbox = Checkbox;
      Form.Submit = Submit;
      
  - filename: "Form/Input.tsx"
    content: |
      // Form/Input.tsx - 输入框组件
      import React, { forwardRef } from 'react';
      import { useFormContext } from './Form';
      
      interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
        name: string;
        label?: string;
        required?: boolean;
        minLength?: number;
        maxLength?: number;
        pattern?: RegExp;
        email?: boolean;
      }
      
      export const Input = forwardRef<HTMLInputElement, InputProps>(
        ({ name, label, required, minLength, maxLength, pattern, email, type = 'text', ...props }, ref) => {
          const { values, errors, touched, setValue, setTouched, validateField } = useFormContext();
          
          const value = values[name] || '';
          const error = touched[name] ? errors[name] : '';
          
          const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;
            setValue(name, newValue);
            
            // Validate on change if field was touched
            if (touched[name]) {
              const validationError = validateField(name, newValue, {
                required,
                minLength,
                maxLength,
                pattern,
                email: email || type === 'email',
              });
              
              if (validationError) {
                errors[name] = validationError;
              }
            }
          };
          
          const handleBlur = () => {
            setTouched(name);
            
            // Validate on blur
            const validationError = validateField(name, value, {
              required,
              minLength,
              maxLength,
              pattern,
              email: email || type === 'email',
            });
            
            if (validationError) {
              errors[name] = validationError;
            }
          };
          
          return (
            <div style={{ marginBottom: '16px' }}>
              {label && (
                <label
                  htmlFor={name}
                  style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontWeight: 500,
                  }}
                >
                  {label}
                  {required && <span style={{ color: 'red' }}> *</span>}
                </label>
              )}
              <input
                ref={ref}
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: error ? '1px solid red' : '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                {...props}
              />
              {error && (
                <span style={{
                  display: 'block',
                  marginTop: '4px',
                  color: 'red',
                  fontSize: '14px',
                }}>
                  {error}
                </span>
              )}
            </div>
          );
        }
      );
      
      Input.displayName = 'Input';
      
  - filename: "Accordion/Accordion.tsx"
    content: |
      // Accordion/Accordion.tsx - 手风琴组件
      import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
      
      interface AccordionContextType {
        expandedItems: string[];
        toggleItem: (value: string) => void;
        allowMultiple: boolean;
      }
      
      const AccordionContext = createContext<AccordionContextType | undefined>(undefined);
      
      interface AccordionProps {
        children: React.ReactNode;
        defaultExpanded?: string[];
        allowMultiple?: boolean;
        onChange?: (expandedItems: string[]) => void;
      }
      
      export const Accordion: React.FC<AccordionProps> & {
        Item: typeof AccordionItem;
        Header: typeof AccordionHeader;
        Trigger: typeof AccordionTrigger;
        Content: typeof AccordionContent;
      } = ({ children, defaultExpanded = [], allowMultiple = false, onChange }) => {
        const [expandedItems, setExpandedItems] = useState<string[]>(defaultExpanded);
        
        const toggleItem = (value: string) => {
          setExpandedItems(prev => {
            let newExpanded: string[];
            
            if (prev.includes(value)) {
              // Collapse
              newExpanded = prev.filter(item => item !== value);
            } else {
              // Expand
              if (allowMultiple) {
                newExpanded = [...prev, value];
              } else {
                newExpanded = [value];
              }
            }
            
            onChange?.(newExpanded);
            return newExpanded;
          });
        };
        
        return (
          <AccordionContext.Provider value={{ expandedItems, toggleItem, allowMultiple }}>
            <div className="accordion" role="region">
              {children}
            </div>
          </AccordionContext.Provider>
        );
      };
      
      // Accordion Item
      interface ItemContextType {
        value: string;
        isExpanded: boolean;
      }
      
      const ItemContext = createContext<ItemContextType | undefined>(undefined);
      
      interface AccordionItemProps {
        value: string;
        children: React.ReactNode;
      }
      
      const AccordionItem: React.FC<AccordionItemProps> = ({ value, children }) => {
        const context = useContext(AccordionContext);
        if (!context) throw new Error('Accordion.Item must be used within Accordion');
        
        const isExpanded = context.expandedItems.includes(value);
        
        return (
          <ItemContext.Provider value={{ value, isExpanded }}>
            <div
              className="accordion-item"
              style={{
                borderBottom: '1px solid #e0e0e0',
              }}
            >
              {children}
            </div>
          </ItemContext.Provider>
        );
      };
      
      // Accordion Header
      const AccordionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        return <div className="accordion-header">{children}</div>;
      };
      
      // Accordion Trigger
      const AccordionTrigger: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        const accordionContext = useContext(AccordionContext);
        const itemContext = useContext(ItemContext);
        
        if (!accordionContext || !itemContext) {
          throw new Error('Accordion.Trigger must be used within Accordion.Item');
        }
        
        const { toggleItem } = accordionContext;
        const { value, isExpanded } = itemContext;
        const contentId = `accordion-content-${value}`;
        
        return (
          <button
            className="accordion-trigger"
            onClick={() => toggleItem(value)}
            aria-expanded={isExpanded}
            aria-controls={contentId}
            style={{
              width: '100%',
              padding: '16px',
              background: 'none',
              border: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 500,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f5f5f5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {children}
            <span
              style={{
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s',
              }}
            >
              ▼
            </span>
          </button>
        );
      };
      
      // Accordion Content
      const AccordionContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        const itemContext = useContext(ItemContext);
        if (!itemContext) {
          throw new Error('Accordion.Content must be used within Accordion.Item');
        }
        
        const { value, isExpanded } = itemContext;
        const contentRef = useRef<HTMLDivElement>(null);
        const [height, setHeight] = useState(0);
        
        useEffect(() => {
          if (contentRef.current) {
            setHeight(isExpanded ? contentRef.current.scrollHeight : 0);
          }
        }, [isExpanded]);
        
        return (
          <div
            id={`accordion-content-${value}`}
            className="accordion-content"
            aria-hidden={!isExpanded}
            style={{
              height: `${height}px`,
              overflow: 'hidden',
              transition: 'height 0.3s ease-out',
            }}
          >
            <div ref={contentRef} style={{ padding: '16px' }}>
              {children}
            </div>
          </div>
        );
      };
      
      // Attach compound components
      Accordion.Item = AccordionItem;
      Accordion.Header = AccordionHeader;
      Accordion.Trigger = AccordionTrigger;
      Accordion.Content = AccordionContent;
      
  - filename: "Modal/Modal.tsx"
    content: |
      // Modal/Modal.tsx - 模态对话框组件
      import React, { useEffect, useRef, useState } from 'react';
      import { createPortal } from 'react-dom';
      import { ModalManager } from './ModalManager';
      
      interface ModalProps {
        isOpen: boolean;
        onClose: () => void;
        children: React.ReactNode;
        size?: 'small' | 'medium' | 'large';
        closeOnOverlayClick?: boolean;
        closeOnEsc?: boolean;
      }
      
      export const Modal: React.FC<ModalProps> & {
        Header: typeof ModalHeader;
        Body: typeof ModalBody;
        Footer: typeof ModalFooter;
        confirm: typeof confirm;
        alert: typeof alert;
      } = ({
        isOpen,
        onClose,
        children,
        size = 'medium',
        closeOnOverlayClick = true,
        closeOnEsc = true,
      }) => {
        const modalRef = useRef<HTMLDivElement>(null);
        const previousFocusRef = useRef<HTMLElement | null>(null);
        
        // Handle ESC key
        useEffect(() => {
          if (!isOpen || !closeOnEsc) return;
          
          const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
              onClose();
            }
          };
          
          document.addEventListener('keydown', handleEsc);
          return () => document.removeEventListener('keydown', handleEsc);
        }, [isOpen, onClose, closeOnEsc]);
        
        // Focus management
        useEffect(() => {
          if (isOpen) {
            // Save current focus
            previousFocusRef.current = document.activeElement as HTMLElement;
            
            // Focus first focusable element in modal
            if (modalRef.current) {
              const focusableElements = modalRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
              );
              if (focusableElements.length > 0) {
                (focusableElements[0] as HTMLElement).focus();
              }
            }
            
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
          } else {
            // Restore body scroll
            document.body.style.overflow = '';
            
            // Restore previous focus
            if (previousFocusRef.current) {
              previousFocusRef.current.focus();
            }
          }
          
          return () => {
            document.body.style.overflow = '';
          };
        }, [isOpen]);
        
        if (!isOpen) return null;
        
        const sizeStyles = {
          small: { width: '400px' },
          medium: { width: '600px' },
          large: { width: '800px' },
        };
        
        return createPortal(
          <div
            className="modal-overlay"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              animation: 'fadeIn 0.2s ease-out',
            }}
            onClick={(e) => {
              if (closeOnOverlayClick && e.target === e.currentTarget) {
                onClose();
              }
            }}
          >
            <div
              ref={modalRef}
              className="modal"
              role="dialog"
              aria-modal="true"
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                maxWidth: '90vw',
                maxHeight: '90vh',
                overflow: 'auto',
                animation: 'slideIn 0.3s ease-out',
                ...sizeStyles[size],
              }}
            >
              {children}
            </div>
            
            <style jsx>{`
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              
              @keyframes slideIn {
                from {
                  opacity: 0;
                  transform: translateY(-20px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}</style>
          </div>,
          document.body
        );
      };
      
      // Modal Header
      const ModalHeader: React.FC<{ children: React.ReactNode; onClose?: () => void }> = ({ 
        children, 
        onClose 
      }) => {
        return (
          <div
            className="modal-header"
            style={{
              padding: '20px',
              borderBottom: '1px solid #e0e0e0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>{children}</div>
            {onClose && (
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '0',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                }}
                aria-label="关闭对话框"
              >
                ×
              </button>
            )}
          </div>
        );
      };
      
      // Modal Body
      const ModalBody: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        return (
          <div
            className="modal-body"
            style={{
              padding: '20px',
            }}
          >
            {children}
          </div>
        );
      };
      
      // Modal Footer
      const ModalFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        return (
          <div
            className="modal-footer"
            style={{
              padding: '20px',
              borderTop: '1px solid #e0e0e0',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
            }}
          >
            {children}
          </div>
        );
      };
      
      // Imperative API
      const confirm = (options: {
        title: string;
        content: string;
        confirmText?: string;
        cancelText?: string;
      }): Promise<boolean> => {
        return ModalManager.confirm(options);
      };
      
      const alert = (options: {
        title: string;
        content: string;
        confirmText?: string;
      }): Promise<void> => {
        return ModalManager.alert(options);
      };
      
      // Attach compound components and methods
      Modal.Header = ModalHeader;
      Modal.Body = ModalBody;
      Modal.Footer = ModalFooter;
      Modal.confirm = confirm;
      Modal.alert = alert;
      
keyTakeaways:
  - "复合组件模式通过Context共享状态，提供灵活的组件API"
  - "forwardRef允许父组件获取子组件的DOM引用"
  - "使用React Portal将Modal渲染到document.body，避免z-index问题"
  - "焦点管理和键盘导航对于可访问性至关重要"
  - "组件的命令式API可以通过全局管理器实现"
---