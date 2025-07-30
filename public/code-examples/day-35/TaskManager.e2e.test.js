// cypress/e2e/task-manager.cy.js
describe('任务管理应用E2E测试', () => {
  // 测试数据
  const testUser = {
    email: 'e2e@example.com',
    password: 'e2ePassword123!',
    name: 'E2E Test User'
  };
  const testProject = {
    name: 'E2E测试项目',
  };
  beforeEach(() => {
    // 重置数据库
    cy.task('db:reset');
    
    // 创建测试用户
    cy.task('db:seed', { users: [testUser] });
    
    // 访问应用
    cy.visit('/');
  });
  describe('用户认证', () => {
    it('应该完成注册-登录-登出流程', () => {
      // 注册新用户
      cy.get('[data-testid="register-link"]').click();
      cy.get('[data-testid="name-input"]').type('New User');
      cy.get('[data-testid="email-input"]').type('newuser@example.com');
      cy.get('[data-testid="password-input"]').type('NewPassword123!');
      cy.get('[data-testid="confirm-password-input"]').type('NewPassword123!');
      cy.get('[data-testid="register-button"]').click();
      // 验证注册成功
      cy.url().should('include', '/dashboard');
      cy.contains('欢迎, New User').should('be.visible');
      // 登出
      cy.get('[data-testid="user-menu"]').click();
      cy.get('[data-testid="logout-button"]').click();
      cy.url().should('include', '/login');
      // 重新登录
      cy.get('[data-testid="email-input"]').type('newuser@example.com');
      cy.get('[data-testid="password-input"]').type('NewPassword123!');
      cy.get('[data-testid="login-button"]').click();
      cy.url().should('include', '/dashboard');
    });
    it('应该记住用户登录状态', () => {
      cy.login(testUser.email, testUser.password);
      
      // 刷新页面
      cy.reload();
      
      // 应该仍然登录
      cy.url().should('include', '/dashboard');
      cy.contains(testUser.name).should('be.visible');
    });
  });
  describe('项目管理', () => {
    beforeEach(() => {
      cy.login(testUser.email, testUser.password);
    });
    it('应该创建新项目', () => {
      cy.get('[data-testid="create-project-button"]').click();
      
      // 填写项目信息
      cy.get('[data-testid="project-name-input"]').type(testProject.name);
      cy.get('[data-testid="project-description-input"]').type(testProject.description);
      cy.get('[data-testid="project-color-picker"]').click();
      cy.get('[data-color="#3b82f6"]').click();
      
      // 提交
      cy.get('[data-testid="save-project-button"]').click();
      
      // 验证项目创建
      cy.contains(testProject.name).should('be.visible');
      cy.get('[data-testid="project-card"]').should('have.length', 1);
    });
    it('应该邀请团队成员', () => {
      // 创建项目
      cy.createProject(testProject);
      
      // 进入项目
      cy.contains(testProject.name).click();
      
      // 打开成员管理
      cy.get('[data-testid="project-settings"]').click();
      cy.get('[data-testid="members-tab"]').click();
      
      // 邀请成员
      cy.get('[data-testid="invite-member-input"]').type('member@example.com');
      cy.get('[data-testid="role-select"]').select('编辑者');
      cy.get('[data-testid="invite-button"]').click();
      
      // 验证邀请发送
      cy.contains('邀请已发送').should('be.visible');
      cy.get('[data-testid="pending-invite"]').should('contain', 'member@example.com');
    });
  });
  describe('任务工作流', () => {
    beforeEach(() => {
      cy.login(testUser.email, testUser.password);
      cy.createProject(testProject);
    });
    it('应该完成创建-分配-完成任务流程', () => {
      // 进入项目
      cy.contains(testProject.name).click();
      
      // 创建任务
      cy.get('[data-testid="add-task-button"]').click();
      cy.get('[data-testid="task-title-input"]').type('E2E测试任务');
      cy.get('[data-testid="task-description-input"]').type('这是一个E2E测试任务');
      cy.get('[data-testid="priority-select"]').select('高');
      cy.get('[data-testid="due-date-input"]').type('2024-12-31');
      cy.get('[data-testid="save-task-button"]').click();
      
      // 验证任务创建
      cy.get('[data-testid="task-card"]').should('contain', 'E2E测试任务');
      
      // 分配任务
      cy.get('[data-testid="task-card"]').first().click();
      cy.get('[data-testid="assignee-select"]').click();
      cy.get('[data-testid="assignee-option"]').first().click();
      
      // 添加标签
      cy.get('[data-testid="add-tag-button"]').click();
      cy.get('[data-testid="tag-input"]').type('测试{enter}');
      
      // 更新状态
      cy.get('[data-testid="status-select"]').select('进行中');
      cy.contains('任务已更新').should('be.visible');
      
      // 添加评论
      cy.get('[data-testid="comment-input"]').type('开始处理这个任务');
      cy.get('[data-testid="add-comment-button"]').click();
      
      // 完成任务
      cy.get('[data-testid="status-select"]').select('已完成');
      cy.get('[data-testid="task-completed-badge"]').should('be.visible');
    });
    it('应该支持拖拽排序任务', () => {
      // 创建多个任务
      const tasks = ['任务1', '任务2', '任务3'];
      tasks.forEach(task => {
        cy.createTask({ title: task, projectId: testProject.id });
      });
      
      // 刷新以加载任务
      cy.reload();
      
      // 拖拽第三个任务到第一位
      cy.get('[data-testid="task-card"]').eq(2).as('draggedTask');
      cy.get('[data-testid="task-card"]').eq(0).as('targetTask');
      
      cy.get('@draggedTask').drag('@targetTask', {
        source: { x: 10, y: 10 },
        target: { position: 'top' }
      });
      
      // 验证新顺序
      cy.get('[data-testid="task-card"]').first().should('contain', '任务3');
    });
  });
  describe('实时协作', () => {
    it('应该实时同步任务更新', () => {
      cy.login(testUser.email, testUser.password);
      cy.createProject(testProject);
      cy.contains(testProject.name).click();
      
      // 在第一个标签页创建任务
      cy.createTask({ 
        title: '实时同步测试', 
        projectId: testProject.id 
      });
      
      // 打开第二个标签页
      cy.window().then(win => {
        cy.stub(win, 'open').as('newWindow');
      });
      
      cy.visit(`/projects/${testProject.id}`, { 
        onBeforeLoad(win) {
          // 模拟第二个用户
          win.sessionStorage.setItem('userId', 'user2');
        }
      });
      
      // 验证任务在第二个标签页可见
      cy.contains('实时同步测试').should('be.visible');
      
      // 在原标签页更新任务
      cy.window().then(win => {
        win.sessionStorage.setItem('userId', 'user1');
      });
      
      cy.get('[data-testid="task-card"]').first().click();
      cy.get('[data-testid="status-select"]').select('进行中');
      
      // 切换到第二个标签页验证更新
      cy.window().then(win => {
        win.sessionStorage.setItem('userId', 'user2');
      });
      cy.reload();
      
      cy.get('[data-testid="task-status"]').should('contain', '进行中');
    });
    it('应该显示其他用户的实时光标', () => {
      // 模拟多用户环境
      cy.login(testUser.email, testUser.password);
      cy.visit('/projects/shared-board');
      
      // 模拟其他用户的光标移动
      cy.window().then(win => {
        win.dispatchEvent(new CustomEvent('remote-cursor', {
          detail: {
            userId: 'other-user',
            x: 200,
            y: 300,
            name: 'Other User'
          }
        }));
      });
      
      // 验证远程光标显示
      cy.get('[data-testid="remote-cursor-other-user"]').should('be.visible');
      cy.get('[data-testid="remote-cursor-other-user"]').should(
        'have.css', 
        'transform', 
        'matrix(1, 0, 0, 1, 200, 300)'
      );
    });
  });
  describe('文件管理', () => {
    beforeEach(() => {
      cy.login(testUser.email, testUser.password);
      cy.createProject(testProject);
      cy.createTask({ 
        title: '文件测试任务', 
        projectId: testProject.id 
      });
    });
    it('应该上传和预览文件', () => {
      cy.contains('文件测试任务').click();
      
      // 上传文件
      const fileName = 'test-document.pdf';
      cy.fixture(fileName).then(fileContent => {
        cy.get('[data-testid="file-upload"]').attachFile({
          fileContent: fileContent.toString(),
          fileName: fileName,
          mimeType: 'application/pdf'
        });
      });
      
      // 验证上传成功
      cy.contains(fileName).should('be.visible');
      cy.get('[data-testid="file-size"]').should('contain', 'KB');
      
      // 预览文件
      cy.get('[data-testid="preview-button"]').click();
      cy.get('[data-testid="file-preview-modal"]').should('be.visible');
      
      // 下载文件
      cy.get('[data-testid="download-button"]').click();
      cy.readFile(`cypress/downloads/${fileName}`).should('exist');
    });
    it('应该支持拖拽上传多个文件', () => {
      cy.contains('文件测试任务').click();
      
      const files = ['image1.png', 'image2.jpg', 'document.txt'];
      
      cy.get('[data-testid="dropzone"]').selectFiles(
        files.map(f => `cypress/fixtures/${f}`),
        { action: 'drag-drop' }
      );
      
      // 验证所有文件上传
      files.forEach(file => {
        cy.contains(file).should('be.visible');
      });
      
      // 验证文件数量
      cy.get('[data-testid="file-list-item"]').should('have.length', 3);
    });
  });
  describe('搜索和过滤', () => {
    beforeEach(() => {
      cy.login(testUser.email, testUser.password);
      cy.createProject(testProject);
      
      // 创建多个任务用于测试
      const tasks = [
        { title: '紧急Bug修复', priority: '高', status: '进行中' },
        { title: '新功能开发', priority: '中', status: '待办' },
        { title: '代码重构', priority: '低', status: '待办' },
        { title: '文档更新', priority: '低', status: '已完成' }
      ];
      
      tasks.forEach(task => {
        cy.createTask({ ...task, projectId: testProject.id });
      });
    });
    it('应该搜索任务', () => {
      cy.visit(`/projects/${testProject.id}`);
      
      // 搜索关键词
      cy.get('[data-testid="search-input"]').type('Bug');
      
      // 验证搜索结果
      cy.get('[data-testid="task-card"]').should('have.length', 1);
      cy.contains('紧急Bug修复').should('be.visible');
      
      // 清空搜索
      cy.get('[data-testid="search-clear"]').click();
      cy.get('[data-testid="task-card"]').should('have.length', 4);
    });
    it('应该按多个条件过滤', () => {
      cy.visit(`/projects/${testProject.id}`);
      
      // 按优先级过滤
      cy.get('[data-testid="priority-filter"]').click();
      cy.get('[data-testid="priority-high"]').click();
      cy.get('[data-testid="task-card"]').should('have.length', 1);
      
      // 添加状态过滤
      cy.get('[data-testid="status-filter"]').click();
      cy.get('[data-testid="status-in-progress"]').click();
      cy.get('[data-testid="task-card"]').should('have.length', 1);
      cy.contains('紧急Bug修复').should('be.visible');
      
      // 保存过滤器
      cy.get('[data-testid="save-filter-button"]').click();
      cy.get('[data-testid="filter-name-input"]').type('高优先级进行中');
      cy.get('[data-testid="confirm-save-filter"]').click();
      
      // 验证保存的过滤器
      cy.get('[data-testid="saved-filters"]').click();
      cy.contains('高优先级进行中').should('be.visible');
    });
  });
  describe('批量操作', () => {
    beforeEach(() => {
      cy.login(testUser.email, testUser.password);
      cy.createProject(testProject);
      
      // 创建多个任务
      for (let i = 1; i <= 5; i++) {
        cy.createTask({ 
          title: `批量测试任务 ${i}`, 
          projectId: testProject.id 
        });
      }
    });
    it('应该批量更新任务状态', () => {
      cy.visit(`/projects/${testProject.id}`);
      
      // 进入批量选择模式
      cy.get('[data-testid="bulk-select-toggle"]').click();
      
      // 选择前三个任务
      cy.get('[data-testid="task-checkbox"]').eq(0).click();
      cy.get('[data-testid="task-checkbox"]').eq(1).click();
      cy.get('[data-testid="task-checkbox"]').eq(2).click();
      
      // 批量更新状态
      cy.get('[data-testid="bulk-actions-menu"]').click();
      cy.get('[data-testid="bulk-update-status"]').click();
      cy.get('[data-testid="status-select-bulk"]').select('进行中');
      cy.get('[data-testid="apply-bulk-update"]').click();
      
      // 验证更新
      cy.get('[data-testid="task-status"]').then($statuses => {
        expect($statuses.eq(0).text()).to.contain('进行中');
        expect($statuses.eq(1).text()).to.contain('进行中');
        expect($statuses.eq(2).text()).to.contain('进行中');
      });
    });
    it('应该批量分配任务', () => {
      // 添加团队成员
      cy.addTeamMember('member@example.com', testProject.id);
      
      cy.visit(`/projects/${testProject.id}`);
      
      // 选择所有任务
      cy.get('[data-testid="select-all-checkbox"]').click();
      
      // 批量分配
      cy.get('[data-testid="bulk-actions-menu"]').click();
      cy.get('[data-testid="bulk-assign"]').click();
      cy.get('[data-testid="assignee-select-bulk"]').select('member@example.com');
      cy.get('[data-testid="apply-bulk-assign"]').click();
      
      // 验证分配
      cy.get('[data-testid="task-assignee"]').each($el => {
        expect($el.text()).to.contain('member@example.com');
      });
    });
  });
  describe('通知系统', () => {
    it('应该接收实时通知', () => {
      cy.login(testUser.email, testUser.password);
      
      // 模拟接收通知
      cy.window().then(win => {
        win.postMessage({
          type: 'notification',
          data: {
            id: 'notif-1',
            title: '新任务分配',
            message: '您被分配了一个新任务',
            type: 'task_assigned'
          }
        }, '*');
      });
      
      // 验证通知显示
      cy.get('[data-testid="notification-toast"]').should('be.visible');
      cy.contains('新任务分配').should('be.visible');
      
      // 点击通知
      cy.get('[data-testid="notification-toast"]').click();
      cy.url().should('include', '/tasks');
    });
    it('应该管理通知偏好', () => {
      cy.login(testUser.email, testUser.password);
      cy.visit('/settings/notifications');
      
      // 配置通知偏好
      cy.get('[data-testid="email-notifications"]').uncheck();
      cy.get('[data-testid="push-notifications"]').check();
      cy.get('[data-testid="notification-sound"]').uncheck();
      
      // 选择特定通知类型
      cy.get('[data-testid="notify-task-assigned"]').check();
      cy.get('[data-testid="notify-comment-mention"]').check();
      cy.get('[data-testid="notify-due-date"]').uncheck();
      
      // 保存设置
      cy.get('[data-testid="save-notification-settings"]').click();
      cy.contains('设置已保存').should('be.visible');
      
      // 验证设置持久化
      cy.reload();
      cy.get('[data-testid="email-notifications"]').should('not.be.checked');
      cy.get('[data-testid="push-notifications"]').should('be.checked');
    });
  });
  describe('性能测试', () => {
    it('应该快速加载大量任务', () => {
      cy.login(testUser.email, testUser.password);
      
      // 创建包含大量任务的项目
      cy.task('db:seed', {
        projects: [{ ...testProject, taskCount: 1000 }]
      });
      
      // 测量加载时间
      cy.visit(`/projects/${testProject.id}`, {
        onBeforeLoad: (win) => {
          win.performance.mark('tasks-load-start');
        }
      });
      
      // 等待任务加载
      cy.get('[data-testid="task-card"]').should('have.length.at.least', 20);
      
      cy.window().then(win => {
        win.performance.mark('tasks-load-end');
        win.performance.measure(
          'tasks-load-time',
          'tasks-load-start',
          'tasks-load-end'
        );
        
        const measure = win.performance.getEntriesByName('tasks-load-time')[0];
        expect(measure.duration).to.be.lessThan(2000); // 小于2秒
      });
    });
    it('应该流畅处理实时更新', () => {
      cy.login(testUser.email, testUser.password);
      cy.visit(`/projects/${testProject.id}`);
      
      // 监控帧率
      let frameCount = 0;
      cy.window().then(win => {
        const countFrames = () => {
          frameCount++;
          win.requestAnimationFrame(countFrames);
        };
        win.requestAnimationFrame(countFrames);
      });
      
      // 模拟高频更新
      for (let i = 0; i < 50; i++) {
        cy.window().then(win => {
          win.postMessage({
            type: 'task-update',
            data: {
              id: `task-${i}`,
              status: ['待办', '进行中', '已完成'][i % 3]
            }
          }, '*');
        });
        cy.wait(20); // 50fps
      }
      
      // 检查帧率
      cy.wait(1000).then(() => {
        expect(frameCount).to.be.greaterThan(45); // 至少45fps
      });
    });
  });
  describe('错误处理', () => {
    it('应该优雅处理网络错误', () => {
      cy.login(testUser.email, testUser.password);
      
      // 模拟网络断开
      cy.intercept('GET', '/api/tasks', { forceNetworkError: true });
      
      cy.visit(`/projects/${testProject.id}`);
      
      // 验证错误提示
      cy.contains('网络连接失败').should('be.visible');
      cy.get('[data-testid="retry-button"]').should('be.visible');
      
      // 恢复网络并重试
      cy.intercept('GET', '/api/tasks', { 
        body: { tasks: [] } 
      });
      cy.get('[data-testid="retry-button"]').click();
      
      cy.contains('网络连接失败').should('not.exist');
    });
    it('应该处理并发编辑冲突', () => {
      cy.login(testUser.email, testUser.password);
      cy.createTask({ 
        title: '冲突测试任务', 
        projectId: testProject.id 
      });
      
      // 打开任务编辑
      cy.contains('冲突测试任务').click();
      cy.get('[data-testid="edit-task-button"]').click();
      
      // 模拟其他用户的更新
      cy.intercept('PUT', '/api/tasks/*', {
        statusCode: 409,
        body: {
          error: 'Conflict',
          message: '任务已被其他用户更新',
          latestVersion: {
            title: '冲突测试任务 - 已更新',
            version: 2
          }
        }
      });
      
      // 尝试保存
      cy.get('[data-testid="task-title-input"]').clear().type('我的更新');
      cy.get('[data-testid="save-task-button"]').click();
      
      // 验证冲突处理
      cy.contains('任务已被其他用户更新').should('be.visible');
      cy.get('[data-testid="merge-changes-button"]').click();
      
      // 验证合并界面
      cy.get('[data-testid="conflict-resolver"]').should('be.visible');
      cy.get('[data-testid="their-version"]').should('contain', '已更新');
      cy.get('[data-testid="your-version"]').should('contain', '我的更新');
    });
  });
});
// Cypress命令扩展
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="login-button"]').click();
  cy.url().should('include', '/dashboard');
});
Cypress.Commands.add('createProject', (project) => {
  cy.request('POST', '/api/projects', project).then(response => {
    expect(response.status).to.eq(201);
    return response.body;
  });
});
Cypress.Commands.add('createTask', (task) => {
  cy.request('POST', '/api/tasks', task).then(response => {
    expect(response.status).to.eq(201);
    return response.body;
  });
});
Cypress.Commands.add('addTeamMember', (email, projectId) => {
  cy.request('POST', `/api/projects/${projectId}/members`, {
    email,
    role: 'member'
  });
});
// 拖拽支持
Cypress.Commands.add('drag', { prevSubject: 'element' }, 
  (subject, target, options) => {
    cy.wrap(subject)
      .trigger('dragstart', options.source)
      .then(() => {
        cy.get(target)
          .trigger('dragenter', options.target)
          .trigger('dragover', options.target)
          .trigger('drop', options.target);
      });
    
    cy.wrap(subject).trigger('dragend');
  }
);