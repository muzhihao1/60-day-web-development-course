// component-composition.tsx - 组件组合和设计模式

import React, { ReactNode, createContext, useContext } from 'react';

// 1. 基础组件组合
interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`card ${className}`} style={{
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px',
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }}>
      {children}
    </div>
  );
};

const CardHeader: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div style={{
      borderBottom: '1px solid #e0e0e0',
      paddingBottom: '12px',
      marginBottom: '12px',
    }}>
      {children}
    </div>
  );
};

const CardBody: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <div style={{ marginBottom: '12px' }}>{children}</div>;
};

const CardFooter: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div style={{
      borderTop: '1px solid #e0e0e0',
      paddingTop: '12px',
      marginTop: '12px',
    }}>
      {children}
    </div>
  );
};

// 使用示例
function CardExample() {
  return (
    <Card>
      <CardHeader>
        <h3>卡片标题</h3>
      </CardHeader>
      <CardBody>
        <p>这是卡片的主要内容区域。</p>
      </CardBody>
      <CardFooter>
        <button>操作按钮</button>
      </CardFooter>
    </Card>
  );
}

// 2. 复合组件模式
interface TabsContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

interface TabsProps {
  children: ReactNode;
  defaultTab: string;
}

const Tabs: React.FC<TabsProps> & {
  List: typeof TabsList;
  Tab: typeof Tab;
  Panels: typeof TabsPanels;
  Panel: typeof TabPanel;
} = ({ children, defaultTab }) => {
  const [activeTab, setActiveTab] = React.useState(defaultTab);
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
};

const TabsList: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div style={{
      display: 'flex',
      borderBottom: '2px solid #e0e0e0',
      marginBottom: '16px',
    }}>
      {children}
    </div>
  );
};

interface TabProps {
  value: string;
  children: ReactNode;
}

const Tab: React.FC<TabProps> = ({ value, children }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Tab must be used within Tabs');
  
  const { activeTab, setActiveTab } = context;
  const isActive = activeTab === value;
  
  return (
    <button
      style={{
        padding: '8px 16px',
        border: 'none',
        background: 'none',
        borderBottom: isActive ? '2px solid blue' : 'none',
        color: isActive ? 'blue' : '#666',
        cursor: 'pointer',
        fontWeight: isActive ? 'bold' : 'normal',
      }}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
};

const TabsPanels: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <div>{children}</div>;
};

interface TabPanelProps {
  value: string;
  children: ReactNode;
}

const TabPanel: React.FC<TabPanelProps> = ({ value, children }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabPanel must be used within Tabs');
  
  const { activeTab } = context;
  
  if (activeTab !== value) return null;
  
  return <div>{children}</div>;
};

// 将子组件附加到主组件
Tabs.List = TabsList;
Tabs.Tab = Tab;
Tabs.Panels = TabsPanels;
Tabs.Panel = TabPanel;

// 使用示例
function TabsExample() {
  return (
    <Tabs defaultTab="tab1">
      <Tabs.List>
        <Tabs.Tab value="tab1">标签1</Tabs.Tab>
        <Tabs.Tab value="tab2">标签2</Tabs.Tab>
        <Tabs.Tab value="tab3">标签3</Tabs.Tab>
      </Tabs.List>
      
      <Tabs.Panels>
        <Tabs.Panel value="tab1">
          <p>这是标签1的内容</p>
        </Tabs.Panel>
        <Tabs.Panel value="tab2">
          <p>这是标签2的内容</p>
        </Tabs.Panel>
        <Tabs.Panel value="tab3">
          <p>这是标签3的内容</p>
        </Tabs.Panel>
      </Tabs.Panels>
    </Tabs>
  );
}

// 3. 高阶组件（HOC）模式
interface WithLoadingProps {
  isLoading: boolean;
}

function withLoading<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P & WithLoadingProps> {
  return ({ isLoading, ...props }) => {
    if (isLoading) {
      return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div>加载中...</div>
        </div>
      );
    }
    
    return <WrappedComponent {...(props as P)} />;
  };
}

// 使用HOC
interface UserProfileProps {
  name: string;
  email: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ name, email }) => {
  return (
    <div>
      <h3>{name}</h3>
      <p>{email}</p>
    </div>
  );
};

const UserProfileWithLoading = withLoading(UserProfile);

// 4. 组合 vs 继承
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'large';
  children: ReactNode;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'small', 
  children, 
  onClick 
}) => {
  const baseStyles = {
    padding: size === 'small' ? '5px 10px' : '10px 20px',
    fontSize: size === 'small' ? '14px' : '18px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  };
  
  const variantStyles = {
    primary: { backgroundColor: '#007bff', color: 'white' },
    secondary: { backgroundColor: '#6c757d', color: 'white' },
  };
  
  return (
    <button
      style={{ ...baseStyles, ...variantStyles[variant] }}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// 特殊按钮通过组合实现
const IconButton: React.FC<{ icon: string; label: string; onClick?: () => void }> = ({ 
  icon, 
  label, 
  onClick 
}) => {
  return (
    <Button onClick={onClick}>
      <span style={{ marginRight: '8px' }}>{icon}</span>
      {label}
    </Button>
  );
};

// 5. Slot模式
interface LayoutProps {
  header?: ReactNode;
  sidebar?: ReactNode;
  content: ReactNode;
  footer?: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ header, sidebar, content, footer }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {header && (
        <header style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '16px',
          borderBottom: '1px solid #dee2e6',
        }}>
          {header}
        </header>
      )}
      
      <div style={{ flex: 1, display: 'flex' }}>
        {sidebar && (
          <aside style={{ 
            width: '250px', 
            backgroundColor: '#f8f9fa',
            padding: '16px',
            borderRight: '1px solid #dee2e6',
          }}>
            {sidebar}
          </aside>
        )}
        
        <main style={{ flex: 1, padding: '16px' }}>
          {content}
        </main>
      </div>
      
      {footer && (
        <footer style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '16px',
          borderTop: '1px solid #dee2e6',
          textAlign: 'center',
        }}>
          {footer}
        </footer>
      )}
    </div>
  );
};

// 6. Render Props进阶
interface MousePosition {
  x: number;
  y: number;
}

interface MouseTrackerProps {
  render: (position: MousePosition) => ReactNode;
}

const MouseTracker: React.FC<MouseTrackerProps> = ({ render }) => {
  const [position, setPosition] = React.useState<MousePosition>({ x: 0, y: 0 });
  
  const handleMouseMove = (e: React.MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY });
  };
  
  return (
    <div 
      style={{ height: '200px', border: '1px solid #ddd' }}
      onMouseMove={handleMouseMove}
    >
      {render(position)}
    </div>
  );
};

// 使用示例
function MouseTrackerExample() {
  return (
    <MouseTracker
      render={({ x, y }) => (
        <div>
          鼠标位置: ({x}, {y})
        </div>
      )}
    />
  );
}

// 导出所有组件和示例
export {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardExample,
  Tabs,
  TabsExample,
  withLoading,
  UserProfile,
  UserProfileWithLoading,
  Button,
  IconButton,
  Layout,
  MouseTracker,
  MouseTrackerExample,
};