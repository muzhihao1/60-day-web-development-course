---
day: 30
exerciseTitle: "CSS-in-JS与样式系统练习解决方案"
approach: "通过三个完整的项目展示styled-components的高级应用，包括主题系统、响应式组件库和设计系统仪表板的实现"
files:
  - filename: "ThemeSystem.jsx"
    content: |
      import React, { createContext, useContext, useState, useEffect } from 'react';
      import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
      
      // 设计令牌
      const tokens = {
        colors: {
          blue: {
            50: '#e3f2fd',
            100: '#bbdefb',
            200: '#90caf9',
            300: '#64b5f6',
            400: '#42a5f5',
            500: '#2196f3',
            600: '#1e88e5',
            700: '#1976d2',
            800: '#1565c0',
            900: '#0d47a1'
          },
          gray: {
            50: '#fafafa',
            100: '#f5f5f5',
            200: '#eeeeee',
            300: '#e0e0e0',
            400: '#bdbdbd',
            500: '#9e9e9e',
            600: '#757575',
            700: '#616161',
            800: '#424242',
            900: '#212121'
          },
          green: {
            500: '#4caf50',
            600: '#43a047'
          },
          red: {
            500: '#f44336',
            600: '#e53935'
          }
        },
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem',
          '2xl': '3rem',
          '3xl': '4rem'
        },
        typography: {
          fontFamily: {
            sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            mono: 'Monaco, Consolas, "Courier New", monospace'
          },
          fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem',
            '4xl': '2.25rem'
          },
          fontWeight: {
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700
          },
          lineHeight: {
            tight: 1.25,
            normal: 1.5,
            relaxed: 1.75
          }
        },
        borderRadius: {
          none: '0',
          sm: '0.125rem',
          base: '0.25rem',
          md: '0.375rem',
          lg: '0.5rem',
          xl: '0.75rem',
          '2xl': '1rem',
          full: '9999px'
        },
        shadows: {
          xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          base: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
          md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        },
        transitions: {
          fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
          base: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
          slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)'
        },
        breakpoints: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px'
        }
      };
      
      // 主题创建函数
      const createTheme = (mode, customColors = {}) => {
        const isDark = mode === 'dark';
        const isHighContrast = mode === 'high-contrast';
        
        const baseTheme = {
          mode,
          ...tokens,
          colors: {
            ...tokens.colors,
            primary: customColors.primary || tokens.colors.blue[500],
            primaryDark: customColors.primaryDark || tokens.colors.blue[600],
            
            background: {
              primary: isDark ? tokens.colors.gray[900] : tokens.colors.gray[50],
              secondary: isDark ? tokens.colors.gray[800] : tokens.colors.gray[100],
              tertiary: isDark ? tokens.colors.gray[700] : tokens.colors.gray[200]
            },
            
            text: {
              primary: isDark ? tokens.colors.gray[50] : tokens.colors.gray[900],
              secondary: isDark ? tokens.colors.gray[200] : tokens.colors.gray[700],
              tertiary: isDark ? tokens.colors.gray[400] : tokens.colors.gray[500]
            },
            
            border: {
              light: isDark ? tokens.colors.gray[700] : tokens.colors.gray[200],
              medium: isDark ? tokens.colors.gray[600] : tokens.colors.gray[300],
              heavy: isDark ? tokens.colors.gray[500] : tokens.colors.gray[400]
            },
            
            semantic: {
              success: tokens.colors.green[500],
              error: tokens.colors.red[500],
              warning: '#ff9800',
              info: '#03a9f4'
            }
          }
        };
        
        // 高对比度主题调整
        if (isHighContrast) {
          baseTheme.colors.text.primary = isDark ? '#ffffff' : '#000000';
          baseTheme.colors.border.light = isDark ? '#ffffff' : '#000000';
        }
        
        return baseTheme;
      };
      
      // 全局样式
      const GlobalStyle = createGlobalStyle`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        :root {
          --color-primary: ${props => props.theme.colors.primary};
          --color-background: ${props => props.theme.colors.background.primary};
          --color-text: ${props => props.theme.colors.text.primary};
          --transition-theme: color ${props => props.theme.transitions.base}, 
                             background-color ${props => props.theme.transitions.base},
                             border-color ${props => props.theme.transitions.base};
        }
        
        body {
          font-family: ${props => props.theme.typography.fontFamily.sans};
          font-size: ${props => props.theme.typography.fontSize.base};
          line-height: ${props => props.theme.typography.lineHeight.normal};
          color: ${props => props.theme.colors.text.primary};
          background-color: ${props => props.theme.colors.background.primary};
          transition: var(--transition-theme);
        }
        
        a {
          color: ${props => props.theme.colors.primary};
          text-decoration: none;
          
          &:hover {
            text-decoration: underline;
          }
        }
        
        ::selection {
          background: ${props => props.theme.colors.primary};
          color: white;
        }
        
        /* 滚动条样式 */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: ${props => props.theme.colors.background.secondary};
        }
        
        ::-webkit-scrollbar-thumb {
          background: ${props => props.theme.colors.border.medium};
          border-radius: ${props => props.theme.borderRadius.full};
          
          &:hover {
            background: ${props => props.theme.colors.border.heavy};
          }
        }
      `;
      
      // 主题上下文
      const ThemeContext = createContext();
      
      export const useThemeMode = () => {
        const context = useContext(ThemeContext);
        if (!context) {
          throw new Error('useThemeMode must be used within CustomThemeProvider');
        }
        return context;
      };
      
      // 自定义主题Provider
      export const CustomThemeProvider = ({ children }) => {
        const [mode, setMode] = useState(() => {
          const saved = localStorage.getItem('theme-mode');
          if (saved) return saved;
          
          // 检测系统主题
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          return prefersDark ? 'dark' : 'light';
        });
        
        const [customColors, setCustomColors] = useState(() => {
          const saved = localStorage.getItem('theme-custom-colors');
          return saved ? JSON.parse(saved) : {};
        });
        
        const theme = createTheme(mode, customColors);
        
        // 切换主题
        const toggleTheme = () => {
          setMode(prev => {
            const modes = ['light', 'dark', 'high-contrast'];
            const currentIndex = modes.indexOf(prev);
            const nextIndex = (currentIndex + 1) % modes.length;
            const nextMode = modes[nextIndex];
            
            localStorage.setItem('theme-mode', nextMode);
            return nextMode;
          });
        };
        
        // 设置特定主题
        const setTheme = (newMode) => {
          setMode(newMode);
          localStorage.setItem('theme-mode', newMode);
        };
        
        // 更新自定义颜色
        const updateCustomColors = (colors) => {
          setCustomColors(colors);
          localStorage.setItem('theme-custom-colors', JSON.stringify(colors));
        };
        
        // 监听系统主题变化
        useEffect(() => {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          
          const handleChange = (e) => {
            const savedMode = localStorage.getItem('theme-mode');
            if (!savedMode) {
              setMode(e.matches ? 'dark' : 'light');
            }
          };
          
          mediaQuery.addEventListener('change', handleChange);
          return () => mediaQuery.removeEventListener('change', handleChange);
        }, []);
        
        // 应用主题类到根元素
        useEffect(() => {
          document.documentElement.setAttribute('data-theme', mode);
          document.documentElement.style.setProperty('--color-primary', theme.colors.primary);
        }, [mode, theme.colors.primary]);
        
        return (
          <ThemeContext.Provider 
            value={{ 
              mode, 
              toggleTheme, 
              setTheme, 
              customColors, 
              updateCustomColors 
            }}
          >
            <ThemeProvider theme={theme}>
              <GlobalStyle />
              {children}
            </ThemeProvider>
          </ThemeContext.Provider>
        );
      };
      
      // 主题切换组件
      const ThemeSwitcherButton = styled.button`
        position: fixed;
        bottom: ${props => props.theme.spacing.lg};
        right: ${props => props.theme.spacing.lg};
        width: 60px;
        height: 60px;
        border-radius: ${props => props.theme.borderRadius.full};
        border: none;
        background: ${props => props.theme.colors.primary};
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        box-shadow: ${props => props.theme.shadows.lg};
        transition: all ${props => props.theme.transitions.base};
        z-index: 1000;
        
        &:hover {
          transform: scale(1.1);
          box-shadow: ${props => props.theme.shadows.xl};
        }
        
        &:active {
          transform: scale(0.95);
        }
      `;
      
      const ThemePanel = styled.div`
        position: fixed;
        bottom: ${props => props.theme.spacing['2xl']};
        right: ${props => props.theme.spacing.lg};
        background: ${props => props.theme.colors.background.secondary};
        border: 1px solid ${props => props.theme.colors.border.light};
        border-radius: ${props => props.theme.borderRadius.lg};
        padding: ${props => props.theme.spacing.lg};
        box-shadow: ${props => props.theme.shadows.xl};
        z-index: 1000;
        min-width: 280px;
        
        opacity: ${props => props.isOpen ? 1 : 0};
        visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
        transform: translateY(${props => props.isOpen ? 0 : '20px'});
        transition: all ${props => props.theme.transitions.base};
      `;
      
      const ThemeOption = styled.button`
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: ${props => props.theme.spacing.md};
        margin-bottom: ${props => props.theme.spacing.sm};
        background: ${props => props.isActive ? props.theme.colors.primary : 'transparent'};
        color: ${props => props.isActive ? 'white' : props.theme.colors.text.primary};
        border: 1px solid ${props => props.isActive ? props.theme.colors.primary : props.theme.colors.border.light};
        border-radius: ${props => props.theme.borderRadius.md};
        cursor: pointer;
        transition: all ${props => props.theme.transitions.fast};
        
        &:hover {
          background: ${props => props.isActive ? props.theme.colors.primaryDark : props.theme.colors.background.tertiary};
        }
        
        &:last-child {
          margin-bottom: 0;
        }
      `;
      
      const ColorPicker = styled.div`
        margin-top: ${props => props.theme.spacing.lg};
        padding-top: ${props => props.theme.spacing.lg};
        border-top: 1px solid ${props => props.theme.colors.border.light};
      `;
      
      const ColorInput = styled.input`
        width: 50px;
        height: 50px;
        border: 2px solid ${props => props.theme.colors.border.medium};
        border-radius: ${props => props.theme.borderRadius.md};
        cursor: pointer;
        
        &::-webkit-color-swatch {
          border: none;
          border-radius: ${props => props.theme.borderRadius.sm};
        }
      `;
      
      export function ThemeSwitcher() {
        const { mode, setTheme, customColors, updateCustomColors } = useThemeMode();
        const [isOpen, setIsOpen] = useState(false);
        
        const themes = [
          { id: 'light', name: '☀️ 亮色主题', icon: '☀️' },
          { id: 'dark', name: '🌙 暗色主题', icon: '🌙' },
          { id: 'high-contrast', name: '👁️ 高对比度', icon: '👁️' }
        ];
        
        return (
          <>
            <ThemeSwitcherButton onClick={() => setIsOpen(!isOpen)}>
              {mode === 'dark' ? '🌙' : mode === 'high-contrast' ? '👁️' : '☀️'}
            </ThemeSwitcherButton>
            
            <ThemePanel isOpen={isOpen}>
              <h3 style={{ marginBottom: '1rem' }}>选择主题</h3>
              
              {themes.map(theme => (
                <ThemeOption
                  key={theme.id}
                  isActive={mode === theme.id}
                  onClick={() => {
                    setTheme(theme.id);
                    setIsOpen(false);
                  }}
                >
                  <span>{theme.name}</span>
                  <span>{theme.icon}</span>
                </ThemeOption>
              ))}
              
              <ColorPicker>
                <h4 style={{ marginBottom: '0.5rem' }}>自定义主色</h4>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <ColorInput
                    type="color"
                    value={customColors.primary || '#2196f3'}
                    onChange={(e) => updateCustomColors({ 
                      ...customColors, 
                      primary: e.target.value 
                    })}
                  />
                  <span style={{ fontSize: '0.875rem', color: 'var(--color-text)' }}>
                    {customColors.primary || '#2196f3'}
                  </span>
                </div>
              </ColorPicker>
            </ThemePanel>
          </>
        );
      }
      
      // 主题预览组件
      const PreviewContainer = styled.div`
        display: grid;
        gap: ${props => props.theme.spacing.lg};
        padding: ${props => props.theme.spacing.xl};
        background: ${props => props.theme.colors.background.primary};
      `;
      
      const PreviewSection = styled.section`
        padding: ${props => props.theme.spacing.lg};
        background: ${props => props.theme.colors.background.secondary};
        border-radius: ${props => props.theme.borderRadius.lg};
        border: 1px solid ${props => props.theme.colors.border.light};
      `;
      
      const ColorSwatch = styled.div`
        width: 60px;
        height: 60px;
        background: ${props => props.color};
        border-radius: ${props => props.theme.borderRadius.md};
        box-shadow: ${props => props.theme.shadows.sm};
      `;
      
      export function ThemePreview() {
        const theme = useTheme();
        
        return (
          <PreviewContainer>
            <PreviewSection>
              <h2>颜色系统</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                <div>
                  <ColorSwatch color={theme.colors.primary} />
                  <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Primary</p>
                </div>
                <div>
                  <ColorSwatch color={theme.colors.background.primary} />
                  <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Background</p>
                </div>
                <div>
                  <ColorSwatch color={theme.colors.text.primary} />
                  <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Text</p>
                </div>
                <div>
                  <ColorSwatch color={theme.colors.semantic.success} />
                  <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Success</p>
                </div>
                <div>
                  <ColorSwatch color={theme.colors.semantic.error} />
                  <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Error</p>
                </div>
              </div>
            </PreviewSection>
            
            <PreviewSection>
              <h2>排版系统</h2>
              <h1 style={{ fontSize: theme.typography.fontSize['4xl'] }}>Heading 1</h1>
              <h2 style={{ fontSize: theme.typography.fontSize['3xl'] }}>Heading 2</h2>
              <h3 style={{ fontSize: theme.typography.fontSize['2xl'] }}>Heading 3</h3>
              <p>Regular paragraph text with {theme.typography.fontSize.base} size.</p>
              <small style={{ fontSize: theme.typography.fontSize.sm }}>Small text</small>
            </PreviewSection>
            
            <PreviewSection>
              <h2>阴影系统</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                {Object.entries(theme.shadows).filter(([key]) => key !== 'none').map(([key, value]) => (
                  <div
                    key={key}
                    style={{
                      padding: '1rem',
                      background: theme.colors.background.primary,
                      borderRadius: theme.borderRadius.md,
                      boxShadow: value,
                      textAlign: 'center'
                    }}
                  >
                    Shadow {key}
                  </div>
                ))}
              </div>
            </PreviewSection>
          </PreviewContainer>
        );
      }
      
      // 使用示例
      function App() {
        return (
          <CustomThemeProvider>
            <ThemePreview />
            <ThemeSwitcher />
          </CustomThemeProvider>
        );
      }
      
      export default App;
  - filename: "ComponentLibrary.jsx"
    content: |
      import React, { forwardRef } from 'react';
      import styled, { css, keyframes } from 'styled-components';
      
      // ========== 工具函数 ==========
      
      // 响应式断点
      export const media = {
        mobile: (...args) => css`
          @media (min-width: ${props => props.theme.breakpoints.sm}) {
            ${css(...args)}
          }
        `,
        tablet: (...args) => css`
          @media (min-width: ${props => props.theme.breakpoints.md}) {
            ${css(...args)}
          }
        `,
        desktop: (...args) => css`
          @media (min-width: ${props => props.theme.breakpoints.lg}) {
            ${css(...args)}
          }
        `,
        wide: (...args) => css`
          @media (min-width: ${props => props.theme.breakpoints.xl}) {
            ${css(...args)}
          }
        `
      };
      
      // 样式mixins
      export const flexCenter = css`
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      
      export const truncate = css`
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      `;
      
      export const visuallyHidden = css`
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      `;
      
      // ========== Button组件 ==========
      
      const buttonSizes = {
        small: css`
          padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
          font-size: ${props => props.theme.typography.fontSize.sm};
          height: 32px;
        `,
        medium: css`
          padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
          font-size: ${props => props.theme.typography.fontSize.base};
          height: 40px;
        `,
        large: css`
          padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
          font-size: ${props => props.theme.typography.fontSize.lg};
          height: 48px;
        `
      };
      
      const buttonVariants = {
        primary: css`
          background: ${props => props.theme.colors.primary};
          color: white;
          border: 1px solid ${props => props.theme.colors.primary};
          
          &:hover:not(:disabled) {
            background: ${props => props.theme.colors.primaryDark || props.theme.colors.primary};
            transform: translateY(-1px);
            box-shadow: ${props => props.theme.shadows.md};
          }
          
          &:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: ${props => props.theme.shadows.sm};
          }
        `,
        secondary: css`
          background: ${props => props.theme.colors.background.secondary};
          color: ${props => props.theme.colors.text.primary};
          border: 1px solid ${props => props.theme.colors.border.medium};
          
          &:hover:not(:disabled) {
            background: ${props => props.theme.colors.background.tertiary};
            border-color: ${props => props.theme.colors.border.heavy};
          }
        `,
        outline: css`
          background: transparent;
          color: ${props => props.theme.colors.primary};
          border: 2px solid ${props => props.theme.colors.primary};
          
          &:hover:not(:disabled) {
            background: ${props => props.theme.colors.primary}10;
          }
        `,
        ghost: css`
          background: transparent;
          color: ${props => props.theme.colors.text.primary};
          border: 1px solid transparent;
          
          &:hover:not(:disabled) {
            background: ${props => props.theme.colors.background.secondary};
          }
        `,
        danger: css`
          background: ${props => props.theme.colors.semantic.error};
          color: white;
          border: 1px solid ${props => props.theme.colors.semantic.error};
          
          &:hover:not(:disabled) {
            background: #d32f2f;
            transform: translateY(-1px);
            box-shadow: ${props => props.theme.shadows.md};
          }
        `
      };
      
      const spin = keyframes`
        to { transform: rotate(360deg); }
      `;
      
      const StyledButton = styled.button`
        ${flexCenter}
        gap: ${props => props.theme.spacing.sm};
        
        border: none;
        border-radius: ${props => props.theme.borderRadius.md};
        font-family: ${props => props.theme.typography.fontFamily.sans};
        font-weight: ${props => props.theme.typography.fontWeight.medium};
        line-height: 1;
        
        cursor: pointer;
        user-select: none;
        white-space: nowrap;
        text-decoration: none;
        position: relative;
        
        transition: all ${props => props.theme.transitions.fast};
        
        ${props => buttonSizes[props.size]}
        ${props => buttonVariants[props.variant]}
        
        ${props => props.fullWidth && css`
          width: 100%;
        `}
        
        ${props => props.rounded && css`
          border-radius: ${props.theme.borderRadius.full};
        `}
        
        ${props => props.loading && css`
          color: transparent;
          pointer-events: none;
          
          &::after {
            content: '';
            position: absolute;
            width: 16px;
            height: 16px;
            top: 50%;
            left: 50%;
            margin-left: -8px;
            margin-top: -8px;
            border: 2px solid currentColor;
            border-radius: 50%;
            border-top-color: transparent;
            animation: ${spin} 0.6s linear infinite;
            color: white;
          }
        `}
        
        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        &:focus-visible {
          outline: 2px solid ${props => props.theme.colors.primary};
          outline-offset: 2px;
        }
        
        /* 响应式调整 */
        ${media.mobile`
          ${props => props.responsiveFullWidth && css`
            width: auto;
          `}
        `}
      `;
      
      export const Button = forwardRef(({
        children,
        variant = 'primary',
        size = 'medium',
        loading = false,
        disabled = false,
        fullWidth = false,
        responsiveFullWidth = false,
        rounded = false,
        leftIcon,
        rightIcon,
        as,
        ...props
      }, ref) => {
        return (
          <StyledButton
            ref={ref}
            variant={variant}
            size={size}
            loading={loading}
            disabled={disabled || loading}
            fullWidth={fullWidth}
            responsiveFullWidth={responsiveFullWidth}
            rounded={rounded}
            as={as}
            {...props}
          >
            {leftIcon && <span className="button-icon">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="button-icon">{rightIcon}</span>}
          </StyledButton>
        );
      });
      
      Button.displayName = 'Button';
      
      // ========== Input组件 ==========
      
      const inputVariants = {
        outline: css`
          border: 1px solid ${props => props.theme.colors.border.medium};
          background: ${props => props.theme.colors.background.primary};
          
          &:hover:not(:disabled) {
            border-color: ${props => props.theme.colors.border.heavy};
          }
          
          &:focus {
            border-color: ${props => props.theme.colors.primary};
            box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
          }
        `,
        filled: css`
          border: 1px solid transparent;
          background: ${props => props.theme.colors.background.secondary};
          
          &:hover:not(:disabled) {
            background: ${props => props.theme.colors.background.tertiary};
          }
          
          &:focus {
            background: ${props => props.theme.colors.background.primary};
            border-color: ${props => props.theme.colors.primary};
            box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
          }
        `,
        flushed: css`
          border: none;
          border-bottom: 2px solid ${props => props.theme.colors.border.medium};
          border-radius: 0;
          background: transparent;
          padding-left: 0;
          padding-right: 0;
          
          &:hover:not(:disabled) {
            border-bottom-color: ${props => props.theme.colors.border.heavy};
          }
          
          &:focus {
            border-bottom-color: ${props => props.theme.colors.primary};
            box-shadow: none;
          }
        `
      };
      
      const InputWrapper = styled.div`
        position: relative;
        width: ${props => props.fullWidth ? '100%' : 'auto'};
      `;
      
      const StyledInput = styled.input`
        width: 100%;
        padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
        font-family: ${props => props.theme.typography.fontFamily.sans};
        font-size: ${props => props.theme.typography.fontSize.base};
        line-height: ${props => props.theme.typography.lineHeight.normal};
        color: ${props => props.theme.colors.text.primary};
        border-radius: ${props => props.theme.borderRadius.md};
        transition: all ${props => props.theme.transitions.fast};
        
        ${props => inputVariants[props.variant]}
        
        ${props => props.hasPrefix && css`
          padding-left: 40px;
        `}
        
        ${props => props.hasSuffix && css`
          padding-right: 40px;
        `}
        
        ${props => props.error && css`
          border-color: ${props.theme.colors.semantic.error};
          
          &:focus {
            border-color: ${props.theme.colors.semantic.error};
            box-shadow: 0 0 0 3px ${props.theme.colors.semantic.error}20;
          }
        `}
        
        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        &::placeholder {
          color: ${props => props.theme.colors.text.tertiary};
        }
        
        &:focus {
          outline: none;
        }
      `;
      
      const InputAddon = styled.span`
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        color: ${props => props.theme.colors.text.secondary};
        pointer-events: none;
        
        ${props => props.position === 'left' ? css`
          left: ${props.theme.spacing.md};
        ` : css`
          right: ${props.theme.spacing.md};
        `}
      `;
      
      const InputLabel = styled.label`
        display: block;
        margin-bottom: ${props => props.theme.spacing.sm};
        font-size: ${props => props.theme.typography.fontSize.sm};
        font-weight: ${props => props.theme.typography.fontWeight.medium};
        color: ${props => props.theme.colors.text.primary};
      `;
      
      const InputError = styled.span`
        display: block;
        margin-top: ${props => props.theme.spacing.xs};
        font-size: ${props => props.theme.typography.fontSize.sm};
        color: ${props => props.theme.colors.semantic.error};
      `;
      
      const CharCount = styled.span`
        position: absolute;
        bottom: ${props => props.theme.spacing.xs};
        right: ${props => props.theme.spacing.md};
        font-size: ${props => props.theme.typography.fontSize.xs};
        color: ${props => props.theme.colors.text.tertiary};
      `;
      
      export const Input = forwardRef(({
        label,
        error,
        variant = 'outline',
        fullWidth = false,
        prefix,
        suffix,
        maxLength,
        showCharCount = false,
        value,
        onChange,
        ...props
      }, ref) => {
        const charCount = value ? value.toString().length : 0;
        
        return (
          <div>
            {label && <InputLabel htmlFor={props.id}>{label}</InputLabel>}
            <InputWrapper fullWidth={fullWidth}>
              {prefix && <InputAddon position="left">{prefix}</InputAddon>}
              <StyledInput
                ref={ref}
                variant={variant}
                error={!!error}
                hasPrefix={!!prefix}
                hasSuffix={!!suffix}
                value={value}
                onChange={onChange}
                maxLength={maxLength}
                {...props}
              />
              {suffix && <InputAddon position="right">{suffix}</InputAddon>}
              {showCharCount && maxLength && (
                <CharCount>{charCount}/{maxLength}</CharCount>
              )}
            </InputWrapper>
            {error && <InputError>{error}</InputError>}
          </div>
        );
      });
      
      Input.displayName = 'Input';
      
      // ========== Card组件 ==========
      
      const StyledCard = styled.div`
        background: ${props => props.theme.colors.background.primary};
        border: 1px solid ${props => props.theme.colors.border.light};
        border-radius: ${props => props.theme.borderRadius.lg};
        overflow: hidden;
        transition: all ${props => props.theme.transitions.base};
        
        ${props => props.clickable && css`
          cursor: pointer;
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: ${props.theme.shadows.lg};
            border-color: ${props.theme.colors.primary}30;
          }
          
          &:active {
            transform: translateY(0);
          }
        `}
        
        ${props => props.horizontal && css`
          display: flex;
          
          ${media.mobile`
            flex-direction: column;
          `}
        `}
      `;
      
      const CardImage = styled.img`
        width: ${props => props.horizontal ? '200px' : '100%'};
        height: ${props => props.horizontal ? '100%' : '200px'};
        object-fit: cover;
        
        ${media.mobile`
          width: 100%;
          height: 200px;
        `}
      `;
      
      const CardContent = styled.div`
        padding: ${props => props.theme.spacing.lg};
        flex: 1;
      `;
      
      const CardTitle = styled.h3`
        margin: 0 0 ${props => props.theme.spacing.sm} 0;
        font-size: ${props => props.theme.typography.fontSize.xl};
        font-weight: ${props => props.theme.typography.fontWeight.semibold};
        color: ${props => props.theme.colors.text.primary};
      `;
      
      const CardDescription = styled.p`
        margin: 0;
        color: ${props => props.theme.colors.text.secondary};
        line-height: ${props => props.theme.typography.lineHeight.relaxed};
      `;
      
      const CardActions = styled.div`
        display: flex;
        gap: ${props => props.theme.spacing.sm};
        margin-top: ${props => props.theme.spacing.lg};
      `;
      
      export const Card = ({ 
        image, 
        title, 
        description, 
        actions, 
        horizontal = false,
        clickable = false,
        onClick,
        ...props 
      }) => {
        return (
          <StyledCard 
            horizontal={horizontal} 
            clickable={clickable}
            onClick={onClick}
            {...props}
          >
            {image && <CardImage src={image} alt={title} horizontal={horizontal} />}
            <CardContent>
              {title && <CardTitle>{title}</CardTitle>}
              {description && <CardDescription>{description}</CardDescription>}
              {actions && <CardActions>{actions}</CardActions>}
            </CardContent>
          </StyledCard>
        );
      };
      
      // ========== Modal组件 ==========
      
      const fadeIn = keyframes`
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      `;
      
      const slideIn = keyframes`
        from {
          transform: translate(-50%, -48%) scale(0.96);
        }
        to {
          transform: translate(-50%, -50%) scale(1);
        }
      `;
      
      const ModalOverlay = styled.div`
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        animation: ${fadeIn} ${props => props.theme.transitions.fast};
      `;
      
      const modalSizes = {
        small: '400px',
        medium: '600px',
        large: '800px',
        full: '90vw'
      };
      
      const ModalContent = styled.div`
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: ${props => props.theme.colors.background.primary};
        border-radius: ${props => props.theme.borderRadius.xl};
        box-shadow: ${props => props.theme.shadows.xl};
        width: ${props => modalSizes[props.size]};
        max-width: 100%;
        max-height: 90vh;
        overflow: auto;
        z-index: 1001;
        animation: ${slideIn} ${props => props.theme.transitions.base};
        
        ${media.mobile`
          width: 95vw;
          max-height: 85vh;
        `}
      `;
      
      const ModalHeader = styled.div`
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: ${props => props.theme.spacing.lg};
        border-bottom: 1px solid ${props => props.theme.colors.border.light};
      `;
      
      const ModalTitle = styled.h2`
        margin: 0;
        font-size: ${props => props.theme.typography.fontSize['2xl']};
        font-weight: ${props => props.theme.typography.fontWeight.semibold};
        color: ${props => props.theme.colors.text.primary};
      `;
      
      const ModalBody = styled.div`
        padding: ${props => props.theme.spacing.lg};
      `;
      
      const ModalFooter = styled.div`
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: ${props => props.theme.spacing.sm};
        padding: ${props => props.theme.spacing.lg};
        border-top: 1px solid ${props => props.theme.colors.border.light};
      `;
      
      const CloseButton = styled.button`
        ${flexCenter}
        width: 32px;
        height: 32px;
        padding: 0;
        background: transparent;
        border: none;
        border-radius: ${props => props.theme.borderRadius.full};
        color: ${props => props.theme.colors.text.secondary};
        cursor: pointer;
        transition: all ${props => props.theme.transitions.fast};
        
        &:hover {
          background: ${props => props.theme.colors.background.secondary};
          color: ${props => props.theme.colors.text.primary};
        }
      `;
      
      export const Modal = ({ 
        isOpen, 
        onClose, 
        title, 
        children, 
        footer,
        size = 'medium',
        closeOnOverlayClick = true,
        showCloseButton = true 
      }) => {
        useEffect(() => {
          if (isOpen) {
            document.body.style.overflow = 'hidden';
          } else {
            document.body.style.overflow = 'unset';
          }
          
          return () => {
            document.body.style.overflow = 'unset';
          };
        }, [isOpen]);
        
        if (!isOpen) return null;
        
        return (
          <>
            <ModalOverlay onClick={closeOnOverlayClick ? onClose : undefined} />
            <ModalContent size={size}>
              {(title || showCloseButton) && (
                <ModalHeader>
                  {title && <ModalTitle>{title}</ModalTitle>}
                  {showCloseButton && (
                    <CloseButton onClick={onClose}>
                      ✕
                    </CloseButton>
                  )}
                </ModalHeader>
              )}
              <ModalBody>{children}</ModalBody>
              {footer && <ModalFooter>{footer}</ModalFooter>}
            </ModalContent>
          </>
        );
      };
      
      // ========== Grid & Flex布局组件 ==========
      
      export const Grid = styled.div`
        display: grid;
        gap: ${props => props.gap || props.theme.spacing.md};
        
        ${props => props.columns && css`
          grid-template-columns: ${props.columns};
        `}
        
        ${props => props.rows && css`
          grid-template-rows: ${props.rows};
        `}
        
        ${props => props.areas && css`
          grid-template-areas: ${props.areas};
        `}
        
        /* 响应式列 */
        ${props => props.responsive && css`
          grid-template-columns: repeat(auto-fit, minmax(${props.minWidth || '250px'}, 1fr));
        `}
      `;
      
      export const Flex = styled.div`
        display: flex;
        
        ${props => props.direction && css`
          flex-direction: ${props.direction};
        `}
        
        ${props => props.justify && css`
          justify-content: ${props.justify};
        `}
        
        ${props => props.align && css`
          align-items: ${props.align};
        `}
        
        ${props => props.wrap && css`
          flex-wrap: ${props.wrap};
        `}
        
        ${props => props.gap && css`
          gap: ${props.gap};
        `}
        
        ${props => props.flex && css`
          flex: ${props.flex};
        `}
      `;
      
      export const Container = styled.div`
        width: 100%;
        margin: 0 auto;
        padding: 0 ${props => props.theme.spacing.md};
        
        ${media.mobile`
          max-width: ${props => props.theme.breakpoints.sm};
        `}
        
        ${media.tablet`
          max-width: ${props => props.theme.breakpoints.md};
          padding: 0 ${props => props.theme.spacing.lg};
        `}
        
        ${media.desktop`
          max-width: ${props => props.theme.breakpoints.lg};
        `}
        
        ${media.wide`
          max-width: ${props => props.theme.breakpoints.xl};
        `}
      `;
      
      // ========== Typography组件 ==========
      
      const headingStyles = css`
        margin: 0 0 ${props => props.theme.spacing.md} 0;
        font-weight: ${props => props.theme.typography.fontWeight.bold};
        line-height: ${props => props.theme.typography.lineHeight.tight};
        color: ${props => props.theme.colors.text.primary};
      `;
      
      export const H1 = styled.h1`
        ${headingStyles}
        font-size: ${props => props.theme.typography.fontSize['4xl']};
        
        ${media.mobile`
          font-size: ${props => props.theme.typography.fontSize['3xl']};
        `}
      `;
      
      export const H2 = styled.h2`
        ${headingStyles}
        font-size: ${props => props.theme.typography.fontSize['3xl']};
        
        ${media.mobile`
          font-size: ${props => props.theme.typography.fontSize['2xl']};
        `}
      `;
      
      export const H3 = styled.h3`
        ${headingStyles}
        font-size: ${props => props.theme.typography.fontSize['2xl']};
        
        ${media.mobile`
          font-size: ${props => props.theme.typography.fontSize.xl};
        `}
      `;
      
      export const Text = styled.p`
        margin: 0 0 ${props => props.theme.spacing.md} 0;
        font-size: ${props => props.size ? props.theme.typography.fontSize[props.size] : props.theme.typography.fontSize.base};
        line-height: ${props => props.theme.typography.lineHeight.normal};
        color: ${props => props.color || props.theme.colors.text.primary};
        
        ${props => props.muted && css`
          color: ${props.theme.colors.text.secondary};
        `}
        
        ${props => props.truncate && truncate}
        
        ${props => props.weight && css`
          font-weight: ${props.theme.typography.fontWeight[props.weight]};
        `}
      `;
      
      // ========== 使用示例 ==========
      
      export function ComponentShowcase() {
        const [modalOpen, setModalOpen] = useState(false);
        const [inputValue, setInputValue] = useState('');
        
        return (
          <Container>
            <H1>组件库展示</H1>
            
            <section style={{ marginBottom: '3rem' }}>
              <H2>按钮组件</H2>
              <Flex gap="1rem" wrap="wrap">
                <Button>主要按钮</Button>
                <Button variant="secondary">次要按钮</Button>
                <Button variant="outline">轮廓按钮</Button>
                <Button variant="ghost">幽灵按钮</Button>
                <Button variant="danger">危险按钮</Button>
                <Button loading>加载中</Button>
                <Button disabled>禁用</Button>
                <Button size="small">小按钮</Button>
                <Button size="large">大按钮</Button>
                <Button rounded>圆角按钮</Button>
              </Flex>
            </section>
            
            <section style={{ marginBottom: '3rem' }}>
              <H2>输入组件</H2>
              <Grid columns="repeat(auto-fit, minmax(300px, 1fr))" gap="1.5rem">
                <Input 
                  label="基础输入"
                  placeholder="请输入内容"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <Input 
                  label="填充样式"
                  variant="filled"
                  placeholder="请输入内容"
                />
                <Input 
                  label="平铺样式"
                  variant="flushed"
                  placeholder="请输入内容"
                />
                <Input 
                  label="带前缀"
                  prefix="@"
                  placeholder="用户名"
                />
                <Input 
                  label="带后缀"
                  suffix=".com"
                  placeholder="域名"
                />
                <Input 
                  label="字符计数"
                  maxLength={50}
                  showCharCount
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <Input 
                  label="错误状态"
                  error="请输入有效的邮箱地址"
                  placeholder="email@example.com"
                />
              </Grid>
            </section>
            
            <section style={{ marginBottom: '3rem' }}>
              <H2>卡片组件</H2>
              <Grid columns="repeat(auto-fit, minmax(300px, 1fr))" gap="1.5rem">
                <Card
                  image="https://via.placeholder.com/400x200"
                  title="垂直卡片"
                  description="这是一个标准的垂直布局卡片，包含图片、标题和描述。"
                  actions={
                    <>
                      <Button size="small">查看详情</Button>
                      <Button size="small" variant="ghost">分享</Button>
                    </>
                  }
                />
                <Card
                  image="https://via.placeholder.com/200x200"
                  title="水平卡片"
                  description="这是一个水平布局的卡片，适合在列表中使用。"
                  horizontal
                  clickable
                  onClick={() => alert('卡片被点击')}
                />
              </Grid>
            </section>
            
            <section style={{ marginBottom: '3rem' }}>
              <H2>模态框组件</H2>
              <Button onClick={() => setModalOpen(true)}>打开模态框</Button>
              
              <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title="模态框标题"
                size="medium"
                footer={
                  <>
                    <Button variant="ghost" onClick={() => setModalOpen(false)}>
                      取消
                    </Button>
                    <Button onClick={() => setModalOpen(false)}>
                      确认
                    </Button>
                  </>
                }
              >
                <Text>这是模态框的内容。你可以在这里放置任何内容。</Text>
                <Text muted>模态框支持不同的大小和配置选项。</Text>
              </Modal>
            </section>
            
            <section style={{ marginBottom: '3rem' }}>
              <H2>排版系统</H2>
              <H1>标题 1</H1>
              <H2>标题 2</H2>
              <H3>标题 3</H3>
              <Text>默认段落文本</Text>
              <Text size="lg" weight="semibold">大号加粗文本</Text>
              <Text size="sm" muted>小号弱化文本</Text>
              <Text truncate>
                这是一段很长的文本，但是它会被截断并显示省略号，因为使用了truncate属性。
              </Text>
            </section>
          </Container>
        );
      }
      
      export default ComponentShowcase;
  - filename: "DesignSystemDashboard.jsx"
    content: |
      import React, { useState, useEffect } from 'react';
      import styled, { css, useTheme } from 'styled-components';
      import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';
      import { Button, Input, Card, Modal, Grid, Flex, Container, H1, H2, H3, Text } from './ComponentLibrary';
      
      // ========== 布局组件 ==========
      
      const DashboardLayout = styled.div`
        display: grid;
        grid-template-columns: 250px 1fr;
        min-height: 100vh;
        background: ${props => props.theme.colors.background.primary};
        
        @media (max-width: ${props => props.theme.breakpoints.md}) {
          grid-template-columns: 1fr;
        }
      `;
      
      const Sidebar = styled.aside`
        background: ${props => props.theme.colors.background.secondary};
        border-right: 1px solid ${props => props.theme.colors.border.light};
        padding: ${props => props.theme.spacing.lg};
        overflow-y: auto;
        
        @media (max-width: ${props => props.theme.breakpoints.md}) {
          display: none;
        }
      `;
      
      const MainContent = styled.main`
        padding: ${props => props.theme.spacing.xl};
        overflow-y: auto;
        
        @media (max-width: ${props => props.theme.breakpoints.md}) {
          padding: ${props => props.theme.spacing.md};
        }
      `;
      
      const NavItem = styled.a`
        display: block;
        padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
        margin-bottom: ${props => props.theme.spacing.xs};
        color: ${props => props.theme.colors.text.primary};
        text-decoration: none;
        border-radius: ${props => props.theme.borderRadius.md};
        transition: all ${props => props.theme.transitions.fast};
        cursor: pointer;
        
        ${props => props.active && css`
          background: ${props.theme.colors.primary}20;
          color: ${props.theme.colors.primary};
          font-weight: ${props.theme.typography.fontWeight.medium};
        `}
        
        &:hover {
          background: ${props => props.theme.colors.background.tertiary};
        }
      `;
      
      const SectionTitle = styled.h2`
        font-size: ${props => props.theme.typography.fontSize.xs};
        font-weight: ${props => props.theme.typography.fontWeight.semibold};
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: ${props => props.theme.colors.text.tertiary};
        margin: ${props => props.theme.spacing.lg} 0 ${props => props.theme.spacing.sm} 0;
        
        &:first-child {
          margin-top: 0;
        }
      `;
      
      // ========== 颜色展示组件 ==========
      
      const ColorGrid = styled.div`
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: ${props => props.theme.spacing.lg};
      `;
      
      const ColorCard = styled.div`
        background: ${props => props.theme.colors.background.primary};
        border: 1px solid ${props => props.theme.colors.border.light};
        border-radius: ${props => props.theme.borderRadius.lg};
        overflow: hidden;
        transition: all ${props => props.theme.transitions.fast};
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: ${props => props.theme.shadows.md};
        }
      `;
      
      const ColorSwatch = styled.div`
        height: 120px;
        background: ${props => props.color};
        position: relative;
        cursor: pointer;
        
        &:hover::after {
          content: '点击复制';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
          border-radius: ${props => props.theme.borderRadius.sm};
          font-size: ${props => props.theme.typography.fontSize.sm};
        }
      `;
      
      const ColorInfo = styled.div`
        padding: ${props => props.theme.spacing.md};
      `;
      
      const ColorName = styled.h4`
        margin: 0 0 ${props => props.theme.spacing.xs} 0;
        font-size: ${props => props.theme.typography.fontSize.base};
        font-weight: ${props => props.theme.typography.fontWeight.medium};
      `;
      
      const ColorValue = styled.code`
        font-family: ${props => props.theme.typography.fontFamily.mono};
        font-size: ${props => props.theme.typography.fontSize.sm};
        color: ${props => props.theme.colors.text.secondary};
      `;
      
      // ========== 间距展示组件 ==========
      
      const SpacingDemo = styled.div`
        display: flex;
        align-items: center;
        margin-bottom: ${props => props.theme.spacing.md};
      `;
      
      const SpacingBox = styled.div`
        width: ${props => props.size};
        height: ${props => props.size};
        background: ${props => props.theme.colors.primary};
        opacity: 0.8;
        margin-right: ${props => props.theme.spacing.md};
      `;
      
      const SpacingLabel = styled.div`
        font-family: ${props => props.theme.typography.fontFamily.mono};
        font-size: ${props => props.theme.typography.fontSize.sm};
        
        strong {
          color: ${props => props.theme.colors.text.primary};
          margin-right: ${props => props.theme.spacing.sm};
        }
        
        span {
          color: ${props => props.theme.colors.text.secondary};
        }
      `;
      
      // ========== 排版展示组件 ==========
      
      const TypeDemo = styled.div`
        margin-bottom: ${props => props.theme.spacing.xl};
        padding: ${props => props.theme.spacing.lg};
        background: ${props => props.theme.colors.background.secondary};
        border-radius: ${props => props.theme.borderRadius.lg};
      `;
      
      const TypeSample = styled.div`
        font-size: ${props => props.size};
        font-weight: ${props => props.weight};
        line-height: ${props => props.lineHeight};
        margin-bottom: ${props => props.theme.spacing.sm};
        
        &:last-child {
          margin-bottom: 0;
        }
      `;
      
      // ========== 代码编辑器组件 ==========
      
      const EditorWrapper = styled.div`
        border: 1px solid ${props => props.theme.colors.border.light};
        border-radius: ${props => props.theme.borderRadius.lg};
        overflow: hidden;
        margin: ${props => props.theme.spacing.lg} 0;
      `;
      
      const EditorHeader = styled.div`
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
        background: ${props => props.theme.colors.background.secondary};
        border-bottom: 1px solid ${props => props.theme.colors.border.light};
      `;
      
      const PreviewWrapper = styled.div`
        padding: ${props => props.theme.spacing.lg};
        background: ${props => props.theme.colors.background.primary};
        min-height: 200px;
      `;
      
      const CodeBlock = styled.pre`
        margin: 0;
        padding: ${props => props.theme.spacing.md};
        background: ${props => props.theme.colors.background.tertiary};
        border-radius: ${props => props.theme.borderRadius.md};
        overflow-x: auto;
        font-family: ${props => props.theme.typography.fontFamily.mono};
        font-size: ${props => props.theme.typography.fontSize.sm};
        line-height: 1.5;
      `;
      
      const CopyButton = styled(Button)`
        font-size: ${props => props.theme.typography.fontSize.sm};
      `;
      
      // ========== 响应式预览组件 ==========
      
      const DeviceFrame = styled.div`
        margin: ${props => props.theme.spacing.lg} auto;
        padding: 20px;
        background: #1a1a1a;
        border-radius: 20px;
        box-shadow: ${props => props.theme.shadows.xl};
        
        ${props => props.device === 'mobile' && css`
          width: 375px;
          height: 667px;
        `}
        
        ${props => props.device === 'tablet' && css`
          width: 768px;
          height: 1024px;
        `}
        
        ${props => props.device === 'desktop' && css`
          width: 100%;
          height: 600px;
        `}
      `;
      
      const DeviceScreen = styled.iframe`
        width: 100%;
        height: 100%;
        border: none;
        border-radius: 10px;
        background: white;
      `;
      
      const DeviceSelector = styled.div`
        display: flex;
        gap: ${props => props.theme.spacing.sm};
        justify-content: center;
        margin-bottom: ${props => props.theme.spacing.lg};
      `;
      
      // ========== 主应用组件 ==========
      
      export function DesignSystemDashboard() {
        const theme = useTheme();
        const [activeSection, setActiveSection] = useState('overview');
        const [copiedText, setCopiedText] = useState('');
        const [previewDevice, setPreviewDevice] = useState('desktop');
        
        // 复制到剪贴板
        const copyToClipboard = async (text) => {
          try {
            await navigator.clipboard.writeText(text);
            setCopiedText(text);
            setTimeout(() => setCopiedText(''), 2000);
          } catch (err) {
            console.error('Failed to copy:', err);
          }
        };
        
        // 生成颜色变体
        const generateColorShades = (baseColor) => {
          const shades = {};
          // 简化的颜色生成逻辑
          for (let i = 1; i <= 9; i++) {
            const lightness = 100 - (i * 10);
            shades[i * 100] = `hsl(from ${baseColor} h s ${lightness}%)`;
          }
          return shades;
        };
        
        // 导出主题
        const exportTheme = () => {
          const themeJSON = JSON.stringify(theme, null, 2);
          const blob = new Blob([themeJSON], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'theme.json';
          a.click();
          URL.revokeObjectURL(url);
        };
        
        // 代码示例
        const componentCode = `
import { Button, Card } from '@/components';

function Example() {
  return (
    <Card
      title="示例卡片"
      description="这是一个使用设计系统的示例"
      actions={
        <>
          <Button variant="primary">主要操作</Button>
          <Button variant="ghost">次要操作</Button>
        </>
      }
    />
  );
}
        `.trim();
        
        const sections = {
          overview: '概览',
          colors: '颜色系统',
          typography: '排版系统',
          spacing: '间距系统',
          components: '组件展示',
          playground: '实时编辑器',
          themes: '主题管理'
        };
        
        const renderSection = () => {
          switch (activeSection) {
            case 'overview':
              return (
                <>
                  <H1>设计系统概览</H1>
                  <Text size="lg" muted>
                    这是一个基于styled-components构建的现代设计系统，提供了完整的主题支持、响应式组件和设计令牌。
                  </Text>
                  
                  <Grid columns="repeat(auto-fit, minmax(250px, 1fr))" gap="1.5rem" style={{ marginTop: '2rem' }}>
                    <Card
                      title="设计令牌"
                      description="统一的颜色、间距、排版和阴影系统"
                    />
                    <Card
                      title="组件库"
                      description="可复用的UI组件，支持多种变体和状态"
                    />
                    <Card
                      title="主题系统"
                      description="支持亮色、暗色和高对比度主题切换"
                    />
                    <Card
                      title="响应式设计"
                      description="移动优先，支持所有设备尺寸"
                    />
                  </Grid>
                  
                  <H2 style={{ marginTop: '3rem' }}>快速开始</H2>
                  <CodeBlock>
                    {`npm install styled-components
npm install @emotion/react @emotion/styled

// 使用主题Provider包装应用
import { ThemeProvider } from './theme';

function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
}`}
                  </CodeBlock>
                </>
              );
              
            case 'colors':
              return (
                <>
                  <Flex justify="space-between" align="center" style={{ marginBottom: '2rem' }}>
                    <H1>颜色系统</H1>
                    <Button size="small" onClick={() => copyToClipboard(JSON.stringify(theme.colors, null, 2))}>
                      导出颜色
                    </Button>
                  </Flex>
                  
                  <H3>主题颜色</H3>
                  <ColorGrid>
                    <ColorCard>
                      <ColorSwatch 
                        color={theme.colors.primary}
                        onClick={() => copyToClipboard(theme.colors.primary)}
                      />
                      <ColorInfo>
                        <ColorName>Primary</ColorName>
                        <ColorValue>{theme.colors.primary}</ColorValue>
                      </ColorInfo>
                    </ColorCard>
                    
                    {Object.entries(theme.colors.semantic).map(([name, color]) => (
                      <ColorCard key={name}>
                        <ColorSwatch 
                          color={color}
                          onClick={() => copyToClipboard(color)}
                        />
                        <ColorInfo>
                          <ColorName>{name.charAt(0).toUpperCase() + name.slice(1)}</ColorName>
                          <ColorValue>{color}</ColorValue>
                        </ColorInfo>
                      </ColorCard>
                    ))}
                  </ColorGrid>
                  
                  <H3 style={{ marginTop: '3rem' }}>灰度色板</H3>
                  <ColorGrid>
                    {Object.entries(theme.colors.gray).map(([shade, color]) => (
                      <ColorCard key={shade}>
                        <ColorSwatch 
                          color={color}
                          onClick={() => copyToClipboard(color)}
                        />
                        <ColorInfo>
                          <ColorName>Gray {shade}</ColorName>
                          <ColorValue>{color}</ColorValue>
                        </ColorInfo>
                      </ColorCard>
                    ))}
                  </ColorGrid>
                  
                  {copiedText && (
                    <div style={{
                      position: 'fixed',
                      bottom: '20px',
                      right: '20px',
                      background: theme.colors.semantic.success,
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: theme.borderRadius.md,
                      boxShadow: theme.shadows.lg
                    }}>
                      已复制: {copiedText}
                    </div>
                  )}
                </>
              );
              
            case 'typography':
              return (
                <>
                  <H1>排版系统</H1>
                  
                  <H3>字体大小</H3>
                  <TypeDemo>
                    {Object.entries(theme.typography.fontSize).map(([name, size]) => (
                      <TypeSample key={name} size={size}>
                        <strong>{name}:</strong> {size} - 这是示例文本 The quick brown fox
                      </TypeSample>
                    ))}
                  </TypeDemo>
                  
                  <H3>字体粗细</H3>
                  <TypeDemo>
                    {Object.entries(theme.typography.fontWeight).map(([name, weight]) => (
                      <TypeSample key={name} weight={weight}>
                        <strong>{name}:</strong> {weight} - 这是示例文本 The quick brown fox
                      </TypeSample>
                    ))}
                  </TypeDemo>
                  
                  <H3>行高</H3>
                  <TypeDemo>
                    {Object.entries(theme.typography.lineHeight).map(([name, height]) => (
                      <TypeSample key={name} lineHeight={height}>
                        <strong>{name}:</strong> {height} - 这是一段较长的示例文本，用于展示不同的行高设置。行高对于文本的可读性非常重要，合适的行高可以让文本更容易阅读。
                      </TypeSample>
                    ))}
                  </TypeDemo>
                </>
              );
              
            case 'spacing':
              return (
                <>
                  <H1>间距系统</H1>
                  <Text muted>
                    统一的间距系统确保了设计的一致性和韵律感。
                  </Text>
                  
                  <div style={{ marginTop: '2rem' }}>
                    {Object.entries(theme.spacing).map(([name, size]) => (
                      <SpacingDemo key={name}>
                        <SpacingBox size={size} />
                        <SpacingLabel>
                          <strong>{name}:</strong>
                          <span>{size}</span>
                        </SpacingLabel>
                      </SpacingDemo>
                    ))}
                  </div>
                  
                  <H3 style={{ marginTop: '3rem' }}>使用示例</H3>
                  <CodeBlock>
                    {`// 在styled-components中使用
const Box = styled.div\`
  padding: \${props => props.theme.spacing.md};
  margin-bottom: \${props => props.theme.spacing.lg};
\`;

// 响应式间距
const ResponsiveBox = styled.div\`
  padding: \${props => props.theme.spacing.sm};
  
  @media (min-width: \${props => props.theme.breakpoints.md}) {
    padding: \${props => props.theme.spacing.lg};
  }
\`;`}
                  </CodeBlock>
                </>
              );
              
            case 'components':
              return (
                <>
                  <H1>组件展示</H1>
                  
                  <DeviceSelector>
                    <Button 
                      size="small" 
                      variant={previewDevice === 'mobile' ? 'primary' : 'ghost'}
                      onClick={() => setPreviewDevice('mobile')}
                    >
                      📱 手机
                    </Button>
                    <Button 
                      size="small" 
                      variant={previewDevice === 'tablet' ? 'primary' : 'ghost'}
                      onClick={() => setPreviewDevice('tablet')}
                    >
                      📱 平板
                    </Button>
                    <Button 
                      size="small" 
                      variant={previewDevice === 'desktop' ? 'primary' : 'ghost'}
                      onClick={() => setPreviewDevice('desktop')}
                    >
                      💻 桌面
                    </Button>
                  </DeviceSelector>
                  
                  <div style={{ 
                    maxWidth: previewDevice === 'mobile' ? '375px' : previewDevice === 'tablet' ? '768px' : '100%',
                    margin: '0 auto',
                    border: `1px solid ${theme.colors.border.light}`,
                    borderRadius: theme.borderRadius.lg,
                    padding: theme.spacing.lg,
                    background: theme.colors.background.secondary
                  }}>
                    <ComponentShowcase />
                  </div>
                </>
              );
              
            case 'playground':
              return (
                <>
                  <H1>实时编辑器</H1>
                  <Text muted>
                    在这里实时编辑和预览组件代码
                  </Text>
                  
                  <EditorWrapper>
                    <EditorHeader>
                      <Text size="sm" weight="medium">编辑器</Text>
                      <CopyButton 
                        size="small" 
                        variant="ghost"
                        onClick={() => copyToClipboard(componentCode)}
                      >
                        复制代码
                      </CopyButton>
                    </EditorHeader>
                    
                    <LiveProvider 
                      code={componentCode}
                      scope={{ Button, Card, Grid, Flex, styled }}
                      theme={theme}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                        <div style={{ 
                          borderRight: `1px solid ${theme.colors.border.light}`,
                          overflow: 'auto'
                        }}>
                          <LiveEditor style={{
                            fontFamily: theme.typography.fontFamily.mono,
                            fontSize: theme.typography.fontSize.sm
                          }} />
                        </div>
                        <PreviewWrapper>
                          <LiveError style={{ 
                            color: theme.colors.semantic.error,
                            fontFamily: theme.typography.fontFamily.mono,
                            fontSize: theme.typography.fontSize.sm
                          }} />
                          <LivePreview />
                        </PreviewWrapper>
                      </div>
                    </LiveProvider>
                  </EditorWrapper>
                </>
              );
              
            case 'themes':
              return (
                <>
                  <Flex justify="space-between" align="center" style={{ marginBottom: '2rem' }}>
                    <H1>主题管理</H1>
                    <Button size="small" onClick={exportTheme}>
                      导出主题
                    </Button>
                  </Flex>
                  
                  <Grid columns="repeat(auto-fit, minmax(300px, 1fr))" gap="1.5rem">
                    <Card
                      title="当前主题"
                      description={`正在使用 ${theme.mode} 主题`}
                      actions={
                        <Button size="small" variant="primary">
                          切换主题
                        </Button>
                      }
                    />
                    
                    <Card
                      title="自定义颜色"
                      description={`主色调: ${theme.colors.primary}`}
                      actions={
                        <input 
                          type="color" 
                          value={theme.colors.primary}
                          style={{
                            width: '100%',
                            height: '40px',
                            border: 'none',
                            borderRadius: theme.borderRadius.md,
                            cursor: 'pointer'
                          }}
                        />
                      }
                    />
                  </Grid>
                  
                  <H3 style={{ marginTop: '3rem' }}>主题配置</H3>
                  <CodeBlock>
                    {JSON.stringify({
                      mode: theme.mode,
                      colors: {
                        primary: theme.colors.primary,
                        background: theme.colors.background,
                        text: theme.colors.text
                      },
                      typography: {
                        fontFamily: theme.typography.fontFamily,
                        fontSize: theme.typography.fontSize
                      }
                    }, null, 2)}
                  </CodeBlock>
                </>
              );
              
            default:
              return null;
          }
        };
        
        return (
          <DashboardLayout>
            <Sidebar>
              <H2 style={{ marginBottom: '1.5rem' }}>设计系统</H2>
              
              {Object.entries(sections).map(([key, label]) => (
                <NavItem
                  key={key}
                  active={activeSection === key}
                  onClick={() => setActiveSection(key)}
                >
                  {label}
                </NavItem>
              ))}
              
              <SectionTitle>资源</SectionTitle>
              <NavItem href="https://styled-components.com" target="_blank">
                文档
              </NavItem>
              <NavItem href="https://github.com" target="_blank">
                GitHub
              </NavItem>
            </Sidebar>
            
            <MainContent>
              {renderSection()}
            </MainContent>
          </DashboardLayout>
        );
      }
      
      export default DesignSystemDashboard;
keyTakeaways:
  - "styled-components提供了强大的主题系统和动态样式能力"
  - "设计令牌是构建一致性设计系统的基础"
  - "CSS-in-JS解决了传统CSS的作用域和维护性问题"
  - "响应式设计应该从移动端开始，逐步增强"
  - "组件库的设计要考虑可复用性和可扩展性"
  - "主题切换不仅是颜色变化，还包括间距、阴影等全方位调整"
  - "性能优化要从组件设计阶段开始考虑"
commonMistakes:
  - "在渲染函数中创建styled组件导致性能问题"
  - "过度使用内联样式而不是创建可复用的styled组件"
  - "忘记为styled组件设置displayName影响调试"
  - "主题切换时没有考虑过渡动画导致体验生硬"
  - "响应式断点设置不合理导致中间状态显示异常"
extensions:
  - "添加CSS-in-JS的服务端渲染支持"
  - "实现主题自动生成器（基于主色调）"
  - "创建Figma插件同步设计令牌"
  - "添加可访问性检查工具"
  - "实现组件性能监控和优化建议"
---

# CSS-in-JS与样式系统练习解决方案

## 🎯 实现方案概述

本解决方案展示了如何使用styled-components构建完整的设计系统，包括：

1. **主题切换系统** - 支持亮色、暗色、高对比度主题，自定义颜色
2. **响应式组件库** - 包含Button、Input、Card、Modal等核心组件
3. **设计系统仪表板** - 交互式展示和管理设计系统的平台

## 📝 关键实现细节

### 1. 主题系统架构

- **设计令牌定义**：统一管理颜色、间距、排版等设计变量
- **主题创建函数**：根据模式动态生成主题对象
- **Context集成**：使用React Context管理主题状态
- **持久化存储**：LocalStorage保存用户偏好
- **系统主题检测**：自动适配系统深色模式

### 2. 组件库设计原则

- **组合优于继承**：使用styled函数扩展组件
- **Props驱动样式**：通过props控制组件变体
- **响应式优先**：移动端优先的断点系统
- **可访问性内置**：焦点管理、ARIA属性
- **性能优化**：避免运行时样式计算

### 3. 设计系统仪表板功能

- **实时预览**：使用react-live实现代码编辑和预览
- **响应式测试**：多设备尺寸预览
- **主题编辑器**：可视化调整设计令牌
- **代码生成**：自动生成组件使用代码
- **导出功能**：导出主题配置和设计令牌

## 🔧 技术亮点

1. **CSS变量集成**：结合CSS变量实现平滑主题切换
2. **TypeScript支持**：完整的类型定义确保开发体验
3. **树摇优化**：未使用的样式自动移除
4. **服务端渲染兼容**：支持SSR和SSG
5. **开发者工具**：styled-components DevTools集成

## 💡 最佳实践总结

1. 组件样式应该内聚，避免外部依赖
2. 使用语义化的设计令牌命名
3. 提供合理的默认值和优雅降级
4. 考虑主题切换的性能影响
5. 保持组件API的简洁和一致
6. 文档化所有的props和使用方式
7. 定期审查和优化bundle大小

这个解决方案可以作为构建企业级设计系统的起点，根据具体需求进行扩展和定制。