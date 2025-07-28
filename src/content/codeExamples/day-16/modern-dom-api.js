// 现代DOM操作API - Day 16

// ============================================
// 1. 查询选择器的进化
// ============================================

console.log('=== 现代DOM查询 ===\n');

// 创建测试HTML结构
document.body.innerHTML = `
    <div class="container">
        <header id="main-header">
            <h1>现代DOM操作示例</h1>
            <nav>
                <ul class="nav-list">
                    <li class="nav-item active" data-page="home">首页</li>
                    <li class="nav-item" data-page="about">关于</li>
                    <li class="nav-item" data-page="contact">联系</li>
                </ul>
            </nav>
        </header>
        <main>
            <section class="content">
                <article class="post" data-id="1">
                    <h2>文章标题</h2>
                    <p>文章内容...</p>
                </article>
            </section>
            <aside class="sidebar">
                <div class="widget">小部件</div>
            </aside>
        </main>
    </div>
`;

// 现代查询方法
const modernQueries = () => {
    // 单个元素查询
    const header = document.querySelector('#main-header');
    const firstNavItem = document.querySelector('.nav-item');
    
    // 多个元素查询
    const allNavItems = document.querySelectorAll('.nav-item');
    const activeItems = document.querySelectorAll('.nav-item.active');
    
    // 属性选择器
    const homeLink = document.querySelector('[data-page="home"]');
    const allDataPages = document.querySelectorAll('[data-page]');
    
    // 复杂选择器
    const navItemsInHeader = document.querySelectorAll('header .nav-item');
    const directChildren = document.querySelectorAll('.nav-list > li');
    const nthChild = document.querySelector('.nav-item:nth-child(2)');
    
    console.log('查询结果：');
    console.log('导航项数量:', allNavItems.length);
    console.log('激活项:', activeItems[0]?.textContent);
    console.log('第二个导航项:', nthChild?.textContent);
    
    // 作用域查询
    const container = document.querySelector('.container');
    const scopedQuery = container.querySelectorAll('.nav-item');
    console.log('容器内导航项:', scopedQuery.length);
};

modernQueries();

// ============================================
// 2. 元素创建和操作
// ============================================

console.log('\n=== 元素创建和操作 ===\n');

const createAndManipulate = () => {
    // 创建新元素
    const card = document.createElement('div');
    card.className = 'card';
    card.id = 'card-1';
    
    // 设置属性
    card.setAttribute('data-type', 'info');
    card.dataset.priority = 'high'; // 更简洁的data属性设置
    card.setAttribute('aria-label', '信息卡片');
    
    // 设置内容
    card.innerHTML = `
        <h3 class="card-title">卡片标题</h3>
        <p class="card-content">卡片内容</p>
        <button class="card-action">操作</button>
    `;
    
    // 添加到DOM
    const container = document.querySelector('.content');
    container.appendChild(card);
    
    console.log('创建的卡片:', card);
    
    // classList操作
    const classListDemo = () => {
        card.classList.add('highlighted', 'new');
        console.log('添加类后:', card.className);
        
        card.classList.remove('new');
        console.log('移除类后:', card.className);
        
        card.classList.toggle('expanded');
        console.log('切换类后:', card.className);
        
        console.log('包含highlighted?', card.classList.contains('highlighted'));
        
        card.classList.replace('highlighted', 'featured');
        console.log('替换类后:', card.className);
    };
    
    classListDemo();
};

createAndManipulate();

// ============================================
// 3. 现代插入方法
// ============================================

console.log('\n=== 现代插入方法 ===\n');

const modernInsertions = () => {
    const container = document.querySelector('.content');
    
    // insertAdjacentHTML - 在不同位置插入HTML
    container.insertAdjacentHTML('beforebegin', '<div class="before">Before Container</div>');
    container.insertAdjacentHTML('afterbegin', '<div class="first">First Child</div>');
    container.insertAdjacentHTML('beforeend', '<div class="last">Last Child</div>');
    container.insertAdjacentHTML('afterend', '<div class="after">After Container</div>');
    
    // insertAdjacentElement - 插入元素
    const newElement = document.createElement('div');
    newElement.textContent = '新插入的元素';
    container.insertAdjacentElement('afterbegin', newElement);
    
    // append/prepend - 可以插入多个节点和文本
    const elem1 = document.createElement('span');
    elem1.textContent = '元素1';
    const elem2 = document.createElement('span');
    elem2.textContent = '元素2';
    
    container.append(elem1, ' 文本内容 ', elem2);
    container.prepend('开头文本 ');
    
    console.log('插入操作完成');
};

modernInsertions();

// ============================================
// 4. DOM遍历
// ============================================

console.log('\n=== DOM遍历 ===\n');

const domTraversal = () => {
    const navItem = document.querySelector('.nav-item.active');
    
    // 父级遍历
    console.log('父元素:', navItem.parentElement.tagName);
    console.log('最近的nav:', navItem.closest('nav'));
    console.log('最近的.container:', navItem.closest('.container'));
    
    // 兄弟遍历
    console.log('下一个兄弟:', navItem.nextElementSibling?.textContent);
    console.log('上一个兄弟:', navItem.previousElementSibling?.textContent);
    
    // 子元素遍历
    const navList = document.querySelector('.nav-list');
    console.log('子元素数量:', navList.children.length);
    console.log('第一个子元素:', navList.firstElementChild?.textContent);
    console.log('最后一个子元素:', navList.lastElementChild?.textContent);
    
    // 遍历所有子元素
    console.log('\n所有导航项:');
    [...navList.children].forEach((child, index) => {
        console.log(`${index + 1}. ${child.textContent}`);
    });
};

domTraversal();

// ============================================
// 5. 元素位置和尺寸
// ============================================

console.log('\n=== 元素位置和尺寸 ===\n');

const measureElements = () => {
    const card = document.querySelector('.card');
    
    if (card) {
        // 获取元素位置和尺寸
        const rect = card.getBoundingClientRect();
        console.log('相对视口位置:', {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
        });
        
        // 获取计算后的样式
        const styles = window.getComputedStyle(card);
        console.log('计算后的样式:', {
            display: styles.display,
            padding: styles.padding,
            margin: styles.margin
        });
        
        // 滚动相关
        console.log('滚动位置:', {
            scrollTop: card.scrollTop,
            scrollHeight: card.scrollHeight,
            clientHeight: card.clientHeight
        });
    }
};

measureElements();

// ============================================
// 6. 模板和克隆
// ============================================

console.log('\n=== 模板和克隆 ===\n');

const templatingDemo = () => {
    // 创建模板
    const template = document.createElement('template');
    template.innerHTML = `
        <div class="user-card">
            <img class="avatar" src="" alt="">
            <h4 class="username"></h4>
            <p class="bio"></p>
        </div>
    `;
    
    // 使用模板创建多个实例
    const users = [
        { name: '张三', bio: '前端开发者', avatar: 'avatar1.jpg' },
        { name: '李四', bio: '设计师', avatar: 'avatar2.jpg' },
        { name: '王五', bio: '产品经理', avatar: 'avatar3.jpg' }
    ];
    
    const userContainer = document.createElement('div');
    userContainer.className = 'users';
    
    users.forEach(user => {
        // 克隆模板内容
        const userCard = template.content.cloneNode(true);
        
        // 填充数据
        userCard.querySelector('.username').textContent = user.name;
        userCard.querySelector('.bio').textContent = user.bio;
        userCard.querySelector('.avatar').src = user.avatar;
        userCard.querySelector('.avatar').alt = user.name;
        
        userContainer.appendChild(userCard);
    });
    
    document.body.appendChild(userContainer);
    console.log('使用模板创建了', users.length, '个用户卡片');
};

templatingDemo();

// ============================================
// 7. 自定义数据属性
// ============================================

console.log('\n=== 自定义数据属性 ===\n');

const dataAttributesDemo = () => {
    const element = document.createElement('div');
    
    // 设置data属性
    element.dataset.userId = '123';
    element.dataset.userName = 'John Doe';
    element.dataset.userRole = 'admin';
    element.dataset.lastLogin = new Date().toISOString();
    
    console.log('所有data属性:', element.dataset);
    
    // 读取data属性
    console.log('用户ID:', element.dataset.userId);
    console.log('用户角色:', element.dataset.userRole);
    
    // 修改data属性
    element.dataset.userRole = 'super-admin';
    console.log('更新后的角色:', element.dataset.userRole);
    
    // 删除data属性
    delete element.dataset.lastLogin;
    console.log('删除lastLogin后:', element.dataset);
    
    // 在CSS中使用data属性
    element.textContent = '管理员面板';
    element.style.cssText = `
        padding: 10px;
        background: ${element.dataset.userRole === 'super-admin' ? 'red' : 'blue'};
        color: white;
    `;
    
    document.body.appendChild(element);
};

dataAttributesDemo();

// ============================================
// 8. 文档片段优化
// ============================================

console.log('\n=== 文档片段优化 ===\n');

const fragmentDemo = () => {
    const list = document.createElement('ul');
    list.className = 'item-list';
    
    console.time('使用DocumentFragment');
    
    // 创建文档片段
    const fragment = document.createDocumentFragment();
    
    // 批量创建元素
    for (let i = 0; i < 1000; i++) {
        const li = document.createElement('li');
        li.textContent = `列表项 ${i + 1}`;
        li.dataset.index = i;
        fragment.appendChild(li);
    }
    
    // 一次性添加到DOM
    list.appendChild(fragment);
    document.body.appendChild(list);
    
    console.timeEnd('使用DocumentFragment');
    console.log('创建了1000个列表项');
};

fragmentDemo();

// ============================================
// 9. IntersectionObserver示例
// ============================================

console.log('\n=== IntersectionObserver示例 ===\n');

const observerDemo = () => {
    // 创建一些需要观察的元素
    const observedElements = [];
    for (let i = 0; i < 5; i++) {
        const box = document.createElement('div');
        box.className = 'observed-box';
        box.textContent = `观察框 ${i + 1}`;
        box.style.cssText = `
            height: 200px;
            margin: 20px;
            background: #f0f0f0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
        `;
        document.body.appendChild(box);
        observedElements.push(box);
    }
    
    // 创建观察器
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.background = '#4CAF50';
                entry.target.style.color = 'white';
                console.log(`${entry.target.textContent} 进入视口`);
            } else {
                entry.target.style.background = '#f0f0f0';
                entry.target.style.color = 'black';
                console.log(`${entry.target.textContent} 离开视口`);
            }
        });
    }, {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    });
    
    // 开始观察
    observedElements.forEach(element => {
        observer.observe(element);
    });
    
    console.log('IntersectionObserver已设置，滚动页面查看效果');
};

observerDemo();

// ============================================
// 10. 实用工具函数
// ============================================

console.log('\n=== DOM实用工具函数 ===\n');

// DOM工具类
class DOMUtils {
    // 等待元素出现
    static waitForElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }
            
            const observer = new MutationObserver((mutations, obs) => {
                const element = document.querySelector(selector);
                if (element) {
                    obs.disconnect();
                    resolve(element);
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`元素 ${selector} 未找到`));
            }, timeout);
        });
    }
    
    // 批量设置样式
    static setStyles(element, styles) {
        Object.entries(styles).forEach(([key, value]) => {
            element.style[key] = value;
        });
    }
    
    // 创建元素的快捷方法
    static createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'class') {
                element.className = value;
            } else if (key === 'style' && typeof value === 'object') {
                this.setStyles(element, value);
            } else if (key.startsWith('data-')) {
                element.dataset[key.slice(5)] = value;
            } else {
                element.setAttribute(key, value);
            }
        });
        
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else {
                element.appendChild(child);
            }
        });
        
        return element;
    }
    
    // 安全的innerHTML
    static setHTML(element, html) {
        element.innerHTML = '';
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        element.appendChild(template.content);
    }
}

// 使用工具函数
const utilsDemo = async () => {
    // 创建元素
    const button = DOMUtils.createElement('button', {
        class: 'custom-button',
        'data-action': 'submit',
        style: {
            padding: '10px 20px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
        }
    }, ['点击我']);
    
    document.body.appendChild(button);
    console.log('使用工具函数创建了按钮');
    
    // 等待元素
    try {
        const element = await DOMUtils.waitForElement('.custom-button');
        console.log('找到元素:', element);
    } catch (error) {
        console.error(error.message);
    }
};

utilsDemo();

// 导出工具函数
module.exports = { DOMUtils };