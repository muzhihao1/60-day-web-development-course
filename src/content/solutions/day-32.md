---
day: 32
exerciseTitle: "Redux和Redux Toolkit解决方案"
approach: "通过三个完整的项目展示Redux Toolkit的最佳实践，包括任务管理系统、实时协作白板和电商后台管理"
files:
  - filename: "TaskManager.jsx"
    content: |
      // store/index.js
      import { configureStore } from '@reduxjs/toolkit';
      import { setupListeners } from '@reduxjs/toolkit/query';
      import projectsReducer from './slices/projectsSlice';
      import tasksReducer from './slices/tasksSlice';
      import usersReducer from './slices/usersSlice';
      import uiReducer from './slices/uiSlice';
      import { apiSlice } from './api/apiSlice';
      import { persistReducer, persistStore } from 'redux-persist';
      import storage from 'redux-persist/lib/storage';

      // 持久化配置
      const persistConfig = {
        key: 'root',
        storage,
        whitelist: ['ui'] // 只持久化UI状态
      };

      const rootReducer = {
        projects: projectsReducer,
        tasks: tasksReducer,
        users: usersReducer,
        ui: persistReducer(persistConfig, uiReducer),
        [apiSlice.reducerPath]: apiSlice.reducer
      };

      export const store = configureStore({
        reducer: rootReducer,
        middleware: (getDefaultMiddleware) =>
          getDefaultMiddleware({
            serializableCheck: {
              ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
            }
          }).concat(apiSlice.middleware)
      });

      setupListeners(store.dispatch);

      export const persistor = persistStore(store);
      export type RootState = ReturnType<typeof store.getState>;
      export type AppDispatch = typeof store.dispatch;

      // slices/projectsSlice.js
      import { createSlice, createAsyncThunk, createEntityAdapter, createSelector } from '@reduxjs/toolkit';
      import { projectsAPI } from '../../api/projectsAPI';

      // Entity adapter for normalized state
      const projectsAdapter = createEntityAdapter({
        selectId: (project) => project.id,
        sortComparer: (a, b) => b.updatedAt.localeCompare(a.updatedAt)
      });

      // Async thunks
      export const fetchProjects = createAsyncThunk(
        'projects/fetchProjects',
        async (filters, { rejectWithValue }) => {
          try {
            const response = await projectsAPI.getProjects(filters);
            return response.data;
          } catch (error) {
            return rejectWithValue(error.response.data);
          }
        }
      );

      export const createProject = createAsyncThunk(
        'projects/createProject',
        async (projectData, { dispatch }) => {
          const response = await projectsAPI.createProject(projectData);
          
          // 创建默认看板列
          const defaultColumns = ['待办', '进行中', '已完成'];
          for (const columnName of defaultColumns) {
            await dispatch(createColumn({ 
              projectId: response.data.id, 
              name: columnName 
            }));
          }
          
          return response.data;
        }
      );

      export const updateProject = createAsyncThunk(
        'projects/updateProject',
        async ({ id, updates }, { getState, rejectWithValue }) => {
          try {
            // 乐观更新
            const originalProject = selectProjectById(getState(), id);
            const response = await projectsAPI.updateProject(id, updates);
            return response.data;
          } catch (error) {
            return rejectWithValue({ error: error.response.data, originalProject });
          }
        }
      );

      export const deleteProject = createAsyncThunk(
        'projects/deleteProject',
        async (projectId, { dispatch }) => {
          await projectsAPI.deleteProject(projectId);
          // 清理相关任务
          dispatch(tasksSlice.actions.removeProjectTasks(projectId));
          return projectId;
        }
      );

      // Slice定义
      const projectsSlice = createSlice({
        name: 'projects',
        initialState: projectsAdapter.getInitialState({
          status: 'idle',
          error: null,
          filters: {
            search: '',
            status: 'all',
            owner: null
          }
        }),
        reducers: {
          setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
          },
          clearFilters: (state) => {
            state.filters = {
              search: '',
              status: 'all',
              owner: null
            };
          },
          updateProjectLocal: projectsAdapter.updateOne
        },
        extraReducers: (builder) => {
          builder
            // Fetch projects
            .addCase(fetchProjects.pending, (state) => {
              state.status = 'loading';
            })
            .addCase(fetchProjects.fulfilled, (state, action) => {
              state.status = 'succeeded';
              projectsAdapter.setAll(state, action.payload);
            })
            .addCase(fetchProjects.rejected, (state, action) => {
              state.status = 'failed';
              state.error = action.payload?.message || 'Failed to fetch projects';
            })
            
            // Create project
            .addCase(createProject.fulfilled, (state, action) => {
              projectsAdapter.addOne(state, action.payload);
            })
            
            // Update project
            .addCase(updateProject.pending, (state, action) => {
              // 乐观更新
              const { id, updates } = action.meta.arg;
              projectsAdapter.updateOne(state, { id, changes: updates });
            })
            .addCase(updateProject.rejected, (state, action) => {
              // 回滚
              if (action.payload?.originalProject) {
                projectsAdapter.updateOne(state, {
                  id: action.meta.arg.id,
                  changes: action.payload.originalProject
                });
              }
            })
            
            // Delete project
            .addCase(deleteProject.fulfilled, (state, action) => {
              projectsAdapter.removeOne(state, action.payload);
            });
        }
      });

      export const { setFilters, clearFilters, updateProjectLocal } = projectsSlice.actions;
      export default projectsSlice.reducer;

      // Selectors
      export const {
        selectAll: selectAllProjects,
        selectById: selectProjectById,
        selectIds: selectProjectIds
      } = projectsAdapter.getSelectors((state) => state.projects);

      export const selectProjectsStatus = (state) => state.projects.status;
      export const selectProjectsError = (state) => state.projects.error;
      export const selectProjectFilters = (state) => state.projects.filters;

      // Memoized selectors
      export const selectFilteredProjects = createSelector(
        [selectAllProjects, selectProjectFilters],
        (projects, filters) => {
          let filtered = projects;
          
          // 搜索过滤
          if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(project =>
              project.name.toLowerCase().includes(searchLower) ||
              project.description?.toLowerCase().includes(searchLower)
            );
          }
          
          // 状态过滤
          if (filters.status !== 'all') {
            filtered = filtered.filter(project => project.status === filters.status);
          }
          
          // 负责人过滤
          if (filters.owner) {
            filtered = filtered.filter(project => project.ownerId === filters.owner);
          }
          
          return filtered;
        }
      );

      export const selectProjectWithStats = createSelector(
        [
          (state, projectId) => selectProjectById(state, projectId),
          (state, projectId) => selectTasksByProject(state, projectId),
          selectAllUsers
        ],
        (project, tasks, users) => {
          if (!project) return null;
          
          const stats = {
            totalTasks: tasks.length,
            completedTasks: tasks.filter(t => t.status === 'completed').length,
            inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
            overdueTasks: tasks.filter(t => 
              t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed'
            ).length
          };
          
          const members = project.memberIds
            ?.map(id => users.find(u => u.id === id))
            .filter(Boolean) || [];
          
          return {
            ...project,
            stats,
            members,
            progress: stats.totalTasks > 0 
              ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
              : 0
          };
        }
      );

      // slices/tasksSlice.js
      import { createSlice, createAsyncThunk, createEntityAdapter, createSelector } from '@reduxjs/toolkit';
      import { tasksAPI } from '../../api/tasksAPI';

      const tasksAdapter = createEntityAdapter({
        selectId: (task) => task.id,
        sortComparer: (a, b) => {
          // 按优先级排序，然后按创建时间
          if (a.priority !== b.priority) {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          }
          return b.createdAt.localeCompare(a.createdAt);
        }
      });

      // 异步操作
      export const fetchTasksByProject = createAsyncThunk(
        'tasks/fetchByProject',
        async (projectId) => {
          const response = await tasksAPI.getTasksByProject(projectId);
          return { projectId, tasks: response.data };
        }
      );

      export const createTask = createAsyncThunk(
        'tasks/createTask',
        async (taskData, { dispatch, getState }) => {
          const response = await tasksAPI.createTask(taskData);
          
          // 更新项目的最后活动时间
          dispatch(updateProjectLocal({
            id: taskData.projectId,
            changes: { lastActivityAt: new Date().toISOString() }
          }));
          
          // 发送通知给被分配人
          if (taskData.assigneeId) {
            const currentUser = selectCurrentUser(getState());
            dispatch(sendNotification({
              userId: taskData.assigneeId,
              type: 'task_assigned',
              title: '新任务分配',
              message: `${currentUser.name} 给你分配了任务：${taskData.title}`,
              taskId: response.data.id
            }));
          }
          
          return response.data;
        }
      );

      export const updateTask = createAsyncThunk(
        'tasks/updateTask',
        async ({ id, updates }, { dispatch, getState }) => {
          const originalTask = selectTaskById(getState(), id);
          const response = await tasksAPI.updateTask(id, updates);
          
          // 检查状态变化
          if (originalTask.status !== response.data.status) {
            // 触发工作流
            dispatch(triggerWorkflow({
              taskId: id,
              trigger: `status_${response.data.status}`,
              context: { task: response.data, previousStatus: originalTask.status }
            }));
          }
          
          return response.data;
        }
      );

      export const batchUpdateTasks = createAsyncThunk(
        'tasks/batchUpdate',
        async ({ taskIds, updates }) => {
          const response = await tasksAPI.batchUpdate(taskIds, updates);
          return response.data;
        }
      );

      export const moveTask = createAsyncThunk(
        'tasks/moveTask',
        async ({ taskId, targetStatus, targetIndex }) => {
          const response = await tasksAPI.moveTask(taskId, {
            status: targetStatus,
            sortIndex: targetIndex
          });
          return response.data;
        }
      );

      const tasksSlice = createSlice({
        name: 'tasks',
        initialState: tasksAdapter.getInitialState({
          status: 'idle',
          error: null,
          selectedTaskIds: [],
          viewMode: 'board', // 'board' | 'list' | 'calendar'
          groupBy: 'status', // 'status' | 'assignee' | 'priority'
          filters: {
            search: '',
            status: [],
            assignee: [],
            priority: [],
            tags: [],
            dueDate: null
          }
        }),
        reducers: {
          setViewMode: (state, action) => {
            state.viewMode = action.payload;
          },
          setGroupBy: (state, action) => {
            state.groupBy = action.payload;
          },
          setTaskFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
          },
          toggleTaskSelection: (state, action) => {
            const taskId = action.payload;
            const index = state.selectedTaskIds.indexOf(taskId);
            if (index >= 0) {
              state.selectedTaskIds.splice(index, 1);
            } else {
              state.selectedTaskIds.push(taskId);
            }
          },
          clearTaskSelection: (state) => {
            state.selectedTaskIds = [];
          },
          removeProjectTasks: (state, action) => {
            const projectId = action.payload;
            const taskIds = Object.values(state.entities)
              .filter(task => task.projectId === projectId)
              .map(task => task.id);
            tasksAdapter.removeMany(state, taskIds);
          }
        },
        extraReducers: (builder) => {
          builder
            .addCase(fetchTasksByProject.fulfilled, (state, action) => {
              const { tasks } = action.payload;
              tasksAdapter.upsertMany(state, tasks);
            })
            .addCase(createTask.fulfilled, (state, action) => {
              tasksAdapter.addOne(state, action.payload);
            })
            .addCase(updateTask.fulfilled, (state, action) => {
              tasksAdapter.updateOne(state, {
                id: action.payload.id,
                changes: action.payload
              });
            })
            .addCase(batchUpdateTasks.fulfilled, (state, action) => {
              const updates = action.payload.map(task => ({
                id: task.id,
                changes: task
              }));
              tasksAdapter.updateMany(state, updates);
            })
            .addCase(moveTask.fulfilled, (state, action) => {
              tasksAdapter.updateOne(state, {
                id: action.payload.id,
                changes: action.payload
              });
            });
        }
      });

      export const {
        setViewMode,
        setGroupBy,
        setTaskFilters,
        toggleTaskSelection,
        clearTaskSelection,
        removeProjectTasks
      } = tasksSlice.actions;

      export default tasksSlice.reducer;

      // Selectors
      export const {
        selectAll: selectAllTasks,
        selectById: selectTaskById,
        selectIds: selectTaskIds
      } = tasksAdapter.getSelectors((state) => state.tasks);

      export const selectTaskFilters = (state) => state.tasks.filters;
      export const selectSelectedTaskIds = (state) => state.tasks.selectedTaskIds;
      export const selectTaskViewMode = (state) => state.tasks.viewMode;

      export const selectTasksByProject = createSelector(
        [selectAllTasks, (state, projectId) => projectId],
        (tasks, projectId) => tasks.filter(task => task.projectId === projectId)
      );

      export const selectFilteredTasks = createSelector(
        [selectAllTasks, selectTaskFilters],
        (tasks, filters) => {
          let filtered = tasks;
          
          if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(task =>
              task.title.toLowerCase().includes(searchLower) ||
              task.description?.toLowerCase().includes(searchLower)
            );
          }
          
          if (filters.status.length > 0) {
            filtered = filtered.filter(task => filters.status.includes(task.status));
          }
          
          if (filters.assignee.length > 0) {
            filtered = filtered.filter(task => 
              task.assigneeId && filters.assignee.includes(task.assigneeId)
            );
          }
          
          if (filters.priority.length > 0) {
            filtered = filtered.filter(task => filters.priority.includes(task.priority));
          }
          
          if (filters.tags.length > 0) {
            filtered = filtered.filter(task =>
              task.tags?.some(tag => filters.tags.includes(tag))
            );
          }
          
          if (filters.dueDate) {
            const filterDate = new Date(filters.dueDate);
            filtered = filtered.filter(task => {
              if (!task.dueDate) return false;
              const taskDate = new Date(task.dueDate);
              return taskDate <= filterDate;
            });
          }
          
          return filtered;
        }
      );

      export const selectTasksByStatus = createSelector(
        [selectFilteredTasks],
        (tasks) => {
          const byStatus = {
            todo: [],
            in_progress: [],
            completed: [],
            archived: []
          };
          
          tasks.forEach(task => {
            if (byStatus[task.status]) {
              byStatus[task.status].push(task);
            }
          });
          
          return byStatus;
        }
      );

      // 主应用组件
      import React, { useState, useEffect } from 'react';
      import { useSelector, useDispatch } from 'react-redux';
      import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
      import {
        selectFilteredProjects,
        selectProjectWithStats,
        fetchProjects,
        createProject,
        setFilters
      } from './store/slices/projectsSlice';
      import {
        selectTasksByStatus,
        selectTaskViewMode,
        fetchTasksByProject,
        createTask,
        updateTask,
        moveTask,
        batchUpdateTasks,
        toggleTaskSelection,
        clearTaskSelection
      } from './store/slices/tasksSlice';

      function TaskManager() {
        const dispatch = useDispatch();
        const projects = useSelector(selectFilteredProjects);
        const [selectedProjectId, setSelectedProjectId] = useState(null);
        const selectedProject = useSelector(state => 
          selectProjectWithStats(state, selectedProjectId)
        );
        const tasksByStatus = useSelector(selectTasksByStatus);
        const viewMode = useSelector(selectTaskViewMode);
        const [isCreatingProject, setIsCreatingProject] = useState(false);
        const [isCreatingTask, setIsCreatingTask] = useState(false);

        // 加载项目
        useEffect(() => {
          dispatch(fetchProjects());
        }, [dispatch]);

        // 加载任务
        useEffect(() => {
          if (selectedProjectId) {
            dispatch(fetchTasksByProject(selectedProjectId));
          }
        }, [selectedProjectId, dispatch]);

        // 处理拖拽
        const handleDragEnd = (result) => {
          if (!result.destination) return;

          const { source, destination, draggableId } = result;
          
          if (source.droppableId === destination.droppableId && 
              source.index === destination.index) {
            return;
          }

          dispatch(moveTask({
            taskId: draggableId,
            targetStatus: destination.droppableId,
            targetIndex: destination.index
          }));
        };

        // 批量操作
        const handleBatchAction = async (action) => {
          const selectedTaskIds = useSelector(selectSelectedTaskIds);
          
          switch (action) {
            case 'complete':
              await dispatch(batchUpdateTasks({
                taskIds: selectedTaskIds,
                updates: { status: 'completed' }
              }));
              break;
            case 'archive':
              await dispatch(batchUpdateTasks({
                taskIds: selectedTaskIds,
                updates: { status: 'archived' }
              }));
              break;
            case 'delete':
              if (confirm('确定要删除选中的任务吗？')) {
                await dispatch(batchDeleteTasks(selectedTaskIds));
              }
              break;
          }
          
          dispatch(clearTaskSelection());
        };

        // 创建新项目
        const handleCreateProject = async (projectData) => {
          try {
            const result = await dispatch(createProject(projectData)).unwrap();
            setSelectedProjectId(result.id);
            setIsCreatingProject(false);
          } catch (error) {
            console.error('Failed to create project:', error);
          }
        };

        // 创建新任务
        const handleCreateTask = async (taskData) => {
          try {
            await dispatch(createTask({
              ...taskData,
              projectId: selectedProjectId
            })).unwrap();
            setIsCreatingTask(false);
          } catch (error) {
            console.error('Failed to create task:', error);
          }
        };

        return (
          <div className="task-manager">
            {/* 侧边栏 - 项目列表 */}
            <aside className="projects-sidebar">
              <div className="sidebar-header">
                <h2>项目</h2>
                <button onClick={() => setIsCreatingProject(true)}>
                  + 新建项目
                </button>
              </div>
              
              <ProjectFilters />
              
              <div className="projects-list">
                {projects.map(project => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    isSelected={selectedProjectId === project.id}
                    onClick={() => setSelectedProjectId(project.id)}
                  />
                ))}
              </div>
            </aside>

            {/* 主内容区 */}
            <main className="main-content">
              {selectedProject ? (
                <>
                  <ProjectHeader project={selectedProject} />
                  
                  <div className="tasks-toolbar">
                    <TaskFilters />
                    <ViewModeSelector />
                    <button onClick={() => setIsCreatingTask(true)}>
                      + 新建任务
                    </button>
                  </div>

                  {/* 看板视图 */}
                  {viewMode === 'board' && (
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <div className="kanban-board">
                        {Object.entries(tasksByStatus).map(([status, tasks]) => (
                          <TaskColumn
                            key={status}
                            status={status}
                            tasks={tasks}
                            projectId={selectedProjectId}
                          />
                        ))}
                      </div>
                    </DragDropContext>
                  )}

                  {/* 列表视图 */}
                  {viewMode === 'list' && (
                    <TaskList tasks={Object.values(tasksByStatus).flat()} />
                  )}

                  {/* 日历视图 */}
                  {viewMode === 'calendar' && (
                    <TaskCalendar tasks={Object.values(tasksByStatus).flat()} />
                  )}
                </>
              ) : (
                <EmptyState message="选择一个项目开始" />
              )}
            </main>

            {/* 弹窗 */}
            {isCreatingProject && (
              <ProjectModal
                onClose={() => setIsCreatingProject(false)}
                onSubmit={handleCreateProject}
              />
            )}

            {isCreatingTask && (
              <TaskModal
                projectId={selectedProjectId}
                onClose={() => setIsCreatingTask(false)}
                onSubmit={handleCreateTask}
              />
            )}
          </div>
        );
      }

      // 任务列组件
      function TaskColumn({ status, tasks, projectId }) {
        const statusLabels = {
          todo: '待办',
          in_progress: '进行中',
          completed: '已完成',
          archived: '已归档'
        };

        return (
          <Droppable droppableId={status}>
            {(provided, snapshot) => (
              <div
                className={`task-column ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <div className="column-header">
                  <h3>{statusLabels[status]}</h3>
                  <span className="task-count">{tasks.length}</span>
                </div>

                <div className="tasks-container">
                  {tasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`task-card-wrapper ${
                            snapshot.isDragging ? 'dragging' : ''
                          }`}
                        >
                          <TaskCard task={task} projectId={projectId} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        );
      }

      // 任务卡片组件
      function TaskCard({ task, projectId }) {
        const dispatch = useDispatch();
        const [isEditing, setIsEditing] = useState(false);
        const assignee = useSelector(state => selectUserById(state, task.assigneeId));

        const priorityColors = {
          high: '#ef4444',
          medium: '#f59e0b',
          low: '#10b981'
        };

        const handleStatusChange = async (newStatus) => {
          await dispatch(updateTask({
            id: task.id,
            updates: { status: newStatus }
          }));
        };

        return (
          <div className={`task-card priority-${task.priority}`}>
            <div className="task-header">
              <input
                type="checkbox"
                checked={task.status === 'completed'}
                onChange={(e) => handleStatusChange(
                  e.target.checked ? 'completed' : 'todo'
                )}
              />
              <span
                className="priority-indicator"
                style={{ backgroundColor: priorityColors[task.priority] }}
              />
            </div>

            <h4 onClick={() => setIsEditing(true)}>{task.title}</h4>
            
            {task.description && (
              <p className="task-description">{task.description}</p>
            )}

            <div className="task-meta">
              {task.tags?.map(tag => (
                <span key={tag} className="task-tag">{tag}</span>
              ))}
              
              {task.dueDate && (
                <span className={`due-date ${
                  new Date(task.dueDate) < new Date() ? 'overdue' : ''
                }`}>
                  📅 {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
              
              {assignee && (
                <span className="assignee">
                  <img src={assignee.avatar} alt={assignee.name} />
                  {assignee.name}
                </span>
              )}
            </div>

            <div className="task-actions">
              <button onClick={() => dispatch(toggleTaskSelection(task.id))}>
                选择
              </button>
              <button onClick={() => setIsEditing(true)}>编辑</button>
            </div>

            {isEditing && (
              <TaskEditModal
                task={task}
                onClose={() => setIsEditing(false)}
                onSave={async (updates) => {
                  await dispatch(updateTask({ id: task.id, updates }));
                  setIsEditing(false);
                }}
              />
            )}
          </div>
        );
      }

      export default TaskManager;
  - filename: "CollaborativeWhiteboard.jsx"
    content: |
      // WebSocket中间件
      const createWebSocketMiddleware = (wsUrl) => {
        let socket = null;
        let reconnectTimer = null;
        let messageQueue = [];
        let isConnected = false;

        const connect = (store) => {
          socket = new WebSocket(wsUrl);

          socket.onopen = () => {
            console.log('WebSocket connected');
            isConnected = true;
            store.dispatch({ type: 'ws/connected' });
            
            // 发送排队的消息
            while (messageQueue.length > 0) {
              const message = messageQueue.shift();
              socket.send(JSON.stringify(message));
            }
          };

          socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            // 根据消息类型分发不同的actions
            switch (data.type) {
              case 'user_joined':
                store.dispatch(userJoined(data.payload));
                break;
              case 'user_left':
                store.dispatch(userLeft(data.payload));
                break;
              case 'cursor_moved':
                store.dispatch(updateCursor(data.payload));
                break;
              case 'shape_added':
                store.dispatch(addShapeFromRemote(data.payload));
                break;
              case 'shape_updated':
                store.dispatch(updateShapeFromRemote(data.payload));
                break;
              case 'shape_deleted':
                store.dispatch(deleteShapeFromRemote(data.payload));
                break;
              case 'sync_state':
                store.dispatch(syncState(data.payload));
                break;
              default:
                store.dispatch(data);
            }
          };

          socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            store.dispatch({ type: 'ws/error', payload: error });
          };

          socket.onclose = () => {
            console.log('WebSocket disconnected');
            isConnected = false;
            store.dispatch({ type: 'ws/disconnected' });
            
            // 自动重连
            reconnectTimer = setTimeout(() => connect(store), 5000);
          };
        };

        return (store) => (next) => (action) => {
          // 拦截需要同步的actions
          if (action.meta?.sync) {
            const message = {
              type: action.type,
              payload: action.payload,
              meta: {
                userId: store.getState().user.currentUser.id,
                timestamp: Date.now()
              }
            };

            if (isConnected && socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify(message));
            } else {
              messageQueue.push(message);
            }
          }

          // WebSocket控制actions
          switch (action.type) {
            case 'ws/connect':
              if (!socket || socket.readyState === WebSocket.CLOSED) {
                connect(store);
              }
              break;
            case 'ws/disconnect':
              if (socket) {
                clearTimeout(reconnectTimer);
                socket.close();
                socket = null;
              }
              break;
            case 'ws/send':
              if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify(action.payload));
              } else {
                messageQueue.push(action.payload);
              }
              break;
          }

          return next(action);
        };
      };

      // Store配置
      import { configureStore } from '@reduxjs/toolkit';
      import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
      import whiteboardReducer from './slices/whiteboardSlice';
      import collaborationReducer from './slices/collaborationSlice';
      import historyReducer from './slices/historySlice';

      // RTK Query API
      export const whiteboardApi = createApi({
        reducerPath: 'whiteboardApi',
        baseQuery: fetchBaseQuery({
          baseUrl: '/api/whiteboard',
          prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.token;
            if (token) {
              headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
          }
        }),
        tagTypes: ['Whiteboard', 'User'],
        endpoints: (builder) => ({
          getWhiteboard: builder.query({
            query: (id) => `/${id}`,
            providesTags: (result, error, id) => [{ type: 'Whiteboard', id }]
          }),
          saveWhiteboard: builder.mutation({
            query: ({ id, data }) => ({
              url: `/${id}`,
              method: 'PUT',
              body: data
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Whiteboard', id }]
          }),
          getCollaborators: builder.query({
            query: (whiteboardId) => `/${whiteboardId}/collaborators`,
            providesTags: ['User']
          })
        })
      });

      export const store = configureStore({
        reducer: {
          whiteboard: whiteboardReducer,
          collaboration: collaborationReducer,
          history: historyReducer,
          [whiteboardApi.reducerPath]: whiteboardApi.reducer
        },
        middleware: (getDefaultMiddleware) =>
          getDefaultMiddleware()
            .concat(whiteboardApi.middleware)
            .concat(createWebSocketMiddleware('ws://localhost:8080'))
      });

      // whiteboardSlice.js
      import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
      import { nanoid } from '@reduxjs/toolkit';

      // CRDT-like操作ID生成
      const generateOperationId = () => ({
        id: nanoid(),
        timestamp: Date.now(),
        userId: store.getState().user.currentUser.id
      });

      const whiteboardSlice = createSlice({
        name: 'whiteboard',
        initialState: {
          shapes: {},
          selectedShapeIds: [],
          tool: 'select', // select, pen, rectangle, circle, text
          toolOptions: {
            color: '#000000',
            strokeWidth: 2,
            fillColor: 'transparent',
            fontSize: 16,
            fontFamily: 'Arial'
          },
          viewport: {
            x: 0,
            y: 0,
            zoom: 1
          },
          isDirty: false
        },
        reducers: {
          // 本地操作（会触发同步）
          addShape: {
            reducer: (state, action) => {
              const shape = action.payload;
              state.shapes[shape.id] = shape;
              state.isDirty = true;
            },
            prepare: (shapeData) => ({
              payload: {
                ...shapeData,
                ...generateOperationId()
              },
              meta: { sync: true }
            })
          },

          updateShape: {
            reducer: (state, action) => {
              const { id, updates } = action.payload;
              if (state.shapes[id]) {
                // CRDT合并策略
                const currentShape = state.shapes[id];
                const newShape = { ...currentShape, ...updates };
                
                // 使用timestamp解决冲突
                if (!updates.timestamp || updates.timestamp > currentShape.timestamp) {
                  state.shapes[id] = newShape;
                  state.isDirty = true;
                }
              }
            },
            prepare: (id, updates) => ({
              payload: {
                id,
                updates: {
                  ...updates,
                  ...generateOperationId()
                }
              },
              meta: { sync: true }
            })
          },

          deleteShape: {
            reducer: (state, action) => {
              const id = action.payload;
              delete state.shapes[id];
              state.selectedShapeIds = state.selectedShapeIds.filter(sid => sid !== id);
              state.isDirty = true;
            },
            prepare: (id) => ({
              payload: id,
              meta: { sync: true }
            })
          },

          // 远程操作（不触发同步）
          addShapeFromRemote: (state, action) => {
            const shape = action.payload;
            state.shapes[shape.id] = shape;
          },

          updateShapeFromRemote: (state, action) => {
            const { id, updates } = action.payload;
            if (state.shapes[id]) {
              state.shapes[id] = { ...state.shapes[id], ...updates };
            }
          },

          deleteShapeFromRemote: (state, action) => {
            const id = action.payload;
            delete state.shapes[id];
            state.selectedShapeIds = state.selectedShapeIds.filter(sid => sid !== id);
          },

          // 工具和选项
          setTool: (state, action) => {
            state.tool = action.payload;
            state.selectedShapeIds = [];
          },

          setToolOptions: (state, action) => {
            state.toolOptions = { ...state.toolOptions, ...action.payload };
          },

          selectShapes: (state, action) => {
            state.selectedShapeIds = action.payload;
          },

          // 视口操作
          setViewport: (state, action) => {
            state.viewport = { ...state.viewport, ...action.payload };
          },

          // 批量操作
          batchUpdate: (state, action) => {
            const operations = action.payload;
            operations.forEach(op => {
              switch (op.type) {
                case 'add':
                  state.shapes[op.shape.id] = op.shape;
                  break;
                case 'update':
                  if (state.shapes[op.id]) {
                    state.shapes[op.id] = { ...state.shapes[op.id], ...op.updates };
                  }
                  break;
                case 'delete':
                  delete state.shapes[op.id];
                  break;
              }
            });
            state.isDirty = true;
          },

          // 状态同步
          syncState: (state, action) => {
            const { shapes, version } = action.payload;
            // 三路合并
            const merged = mergeStates(state.shapes, shapes, version);
            state.shapes = merged;
            state.isDirty = false;
          }
        }
      });

      export const {
        addShape,
        updateShape,
        deleteShape,
        addShapeFromRemote,
        updateShapeFromRemote,
        deleteShapeFromRemote,
        setTool,
        setToolOptions,
        selectShapes,
        setViewport,
        batchUpdate,
        syncState
      } = whiteboardSlice.actions;

      export default whiteboardSlice.reducer;

      // collaborationSlice.js
      const collaborationSlice = createSlice({
        name: 'collaboration',
        initialState: {
          users: {},
          cursors: {},
          selections: {},
          permissions: {},
          connectionStatus: 'disconnected'
        },
        reducers: {
          userJoined: (state, action) => {
            const user = action.payload;
            state.users[user.id] = user;
            state.cursors[user.id] = { x: 0, y: 0, visible: false };
            state.selections[user.id] = [];
          },

          userLeft: (state, action) => {
            const userId = action.payload;
            delete state.users[userId];
            delete state.cursors[userId];
            delete state.selections[userId];
          },

          updateCursor: (state, action) => {
            const { userId, x, y, visible } = action.payload;
            if (state.cursors[userId]) {
              state.cursors[userId] = { x, y, visible };
            }
          },

          updateSelection: (state, action) => {
            const { userId, shapeIds } = action.payload;
            if (state.selections[userId]) {
              state.selections[userId] = shapeIds;
            }
          },

          setPermissions: (state, action) => {
            state.permissions = action.payload;
          },

          setConnectionStatus: (state, action) => {
            state.connectionStatus = action.payload;
          }
        }
      });

      // historySlice.js - 撤销/重做
      const historySlice = createSlice({
        name: 'history',
        initialState: {
          past: [],
          future: [],
          maxHistorySize: 50
        },
        reducers: {
          recordChange: (state, action) => {
            state.past.push(action.payload);
            state.future = [];
            
            // 限制历史记录大小
            if (state.past.length > state.maxHistorySize) {
              state.past.shift();
            }
          },

          undo: (state) => {
            if (state.past.length > 0) {
              const change = state.past.pop();
              state.future.unshift(change);
              return change;
            }
          },

          redo: (state) => {
            if (state.future.length > 0) {
              const change = state.future.shift();
              state.past.push(change);
              return change;
            }
          },

          clearHistory: (state) => {
            state.past = [];
            state.future = [];
          }
        }
      });

      // 主应用组件
      import React, { useEffect, useRef, useState } from 'react';
      import { useSelector, useDispatch } from 'react-redux';
      import { 
        useGetWhiteboardQuery,
        useSaveWhiteboardMutation 
      } from './store/whiteboardApi';

      function CollaborativeWhiteboard({ whiteboardId }) {
        const dispatch = useDispatch();
        const canvasRef = useRef(null);
        const [isDrawing, setIsDrawing] = useState(false);
        const [currentPath, setCurrentPath] = useState([]);
        
        // Redux状态
        const shapes = useSelector(state => state.whiteboard.shapes);
        const tool = useSelector(state => state.whiteboard.tool);
        const toolOptions = useSelector(state => state.whiteboard.toolOptions);
        const selectedShapeIds = useSelector(state => state.whiteboard.selectedShapeIds);
        const viewport = useSelector(state => state.whiteboard.viewport);
        
        // 协作状态
        const users = useSelector(state => state.collaboration.users);
        const cursors = useSelector(state => state.collaboration.cursors);
        const selections = useSelector(state => state.collaboration.selections);
        const connectionStatus = useSelector(state => state.collaboration.connectionStatus);
        
        // RTK Query
        const { data: whiteboardData, isLoading } = useGetWhiteboardQuery(whiteboardId);
        const [saveWhiteboard] = useSaveWhiteboardMutation();

        // 连接WebSocket
        useEffect(() => {
          dispatch({ type: 'ws/connect' });
          
          return () => {
            dispatch({ type: 'ws/disconnect' });
          };
        }, [dispatch]);

        // 加载白板数据
        useEffect(() => {
          if (whiteboardData) {
            dispatch(syncState(whiteboardData));
          }
        }, [whiteboardData, dispatch]);

        // 自动保存
        useEffect(() => {
          const saveTimer = setTimeout(() => {
            if (store.getState().whiteboard.isDirty) {
              saveWhiteboard({
                id: whiteboardId,
                data: { shapes }
              });
            }
          }, 5000);

          return () => clearTimeout(saveTimer);
        }, [shapes, whiteboardId, saveWhiteboard]);

        // 鼠标事件处理
        const handleMouseDown = (e) => {
          const point = getRelativePoint(e, canvasRef.current, viewport);
          
          switch (tool) {
            case 'select':
              handleSelection(point);
              break;
            case 'pen':
              setIsDrawing(true);
              setCurrentPath([point]);
              break;
            case 'rectangle':
            case 'circle':
            case 'text':
              createShape(tool, point);
              break;
          }
        };

        const handleMouseMove = (e) => {
          const point = getRelativePoint(e, canvasRef.current, viewport);
          
          // 发送光标位置
          dispatch({
            type: 'ws/send',
            payload: {
              type: 'cursor_moved',
              payload: {
                userId: currentUserId,
                x: point.x,
                y: point.y,
                visible: true
              }
            }
          });

          if (isDrawing && tool === 'pen') {
            setCurrentPath(prev => [...prev, point]);
            // 实时绘制
            drawPath(canvasRef.current.getContext('2d'), currentPath);
          }
        };

        const handleMouseUp = (e) => {
          if (isDrawing && tool === 'pen') {
            // 创建路径形状
            dispatch(addShape({
              type: 'path',
              points: currentPath,
              ...toolOptions
            }));
            setIsDrawing(false);
            setCurrentPath([]);
          }
        };

        // 形状创建
        const createShape = (type, startPoint) => {
          const shape = {
            type,
            x: startPoint.x,
            y: startPoint.y,
            width: 0,
            height: 0,
            ...toolOptions
          };

          const shapeId = nanoid();
          let isCreating = true;

          const handleMove = (e) => {
            if (!isCreating) return;
            const currentPoint = getRelativePoint(e, canvasRef.current, viewport);
            
            dispatch(updateShape(shapeId, {
              width: currentPoint.x - startPoint.x,
              height: currentPoint.y - startPoint.y
            }));
          };

          const handleUp = () => {
            isCreating = false;
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
          };

          window.addEventListener('mousemove', handleMove);
          window.addEventListener('mouseup', handleUp);

          dispatch(addShape({ ...shape, id: shapeId }));
        };

        // 渲染
        useEffect(() => {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          
          // 清空画布
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // 应用视口变换
          ctx.save();
          ctx.translate(viewport.x, viewport.y);
          ctx.scale(viewport.zoom, viewport.zoom);
          
          // 绘制所有形状
          Object.values(shapes).forEach(shape => {
            drawShape(ctx, shape);
            
            // 绘制选中状态
            if (selectedShapeIds.includes(shape.id)) {
              drawSelection(ctx, shape);
            }
          });
          
          // 绘制其他用户的选择
          Object.entries(selections).forEach(([userId, shapeIds]) => {
            if (userId !== currentUserId) {
              const userColor = users[userId]?.color || '#999';
              shapeIds.forEach(shapeId => {
                const shape = shapes[shapeId];
                if (shape) {
                  drawSelection(ctx, shape, userColor);
                }
              });
            }
          });
          
          ctx.restore();
          
          // 绘制光标
          Object.entries(cursors).forEach(([userId, cursor]) => {
            if (userId !== currentUserId && cursor.visible) {
              drawCursor(ctx, cursor, users[userId]);
            }
          });
        }, [shapes, selectedShapeIds, selections, cursors, viewport]);

        // 键盘快捷键
        useEffect(() => {
          const handleKeyDown = (e) => {
            if (e.ctrlKey || e.metaKey) {
              switch (e.key) {
                case 'z':
                  e.preventDefault();
                  if (e.shiftKey) {
                    dispatch(redo());
                  } else {
                    dispatch(undo());
                  }
                  break;
                case 'c':
                  e.preventDefault();
                  handleCopy();
                  break;
                case 'v':
                  e.preventDefault();
                  handlePaste();
                  break;
                case 'x':
                  e.preventDefault();
                  handleCut();
                  break;
                case 'Delete':
                  e.preventDefault();
                  handleDelete();
                  break;
              }
            }
          };

          window.addEventListener('keydown', handleKeyDown);
          return () => window.removeEventListener('keydown', handleKeyDown);
        }, [selectedShapeIds]);

        return (
          <div className="whiteboard-container">
            {/* 工具栏 */}
            <Toolbar 
              tool={tool}
              toolOptions={toolOptions}
              onToolChange={(tool) => dispatch(setTool(tool))}
              onOptionsChange={(options) => dispatch(setToolOptions(options))}
            />

            {/* 用户列表 */}
            <UserList users={Object.values(users)} connectionStatus={connectionStatus} />

            {/* 画布 */}
            <div className="canvas-container">
              <canvas
                ref={canvasRef}
                width={window.innerWidth}
                height={window.innerHeight}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => {
                  dispatch({
                    type: 'ws/send',
                    payload: {
                      type: 'cursor_moved',
                      payload: {
                        userId: currentUserId,
                        visible: false
                      }
                    }
                  });
                }}
              />
              
              {/* 文字输入层 */}
              {tool === 'text' && (
                <TextInput
                  onSubmit={(text, position) => {
                    dispatch(addShape({
                      type: 'text',
                      text,
                      x: position.x,
                      y: position.y,
                      ...toolOptions
                    }));
                  }}
                />
              )}
            </div>

            {/* 属性面板 */}
            {selectedShapeIds.length > 0 && (
              <PropertiesPanel
                shapes={selectedShapeIds.map(id => shapes[id]).filter(Boolean)}
                onUpdate={(updates) => {
                  selectedShapeIds.forEach(id => {
                    dispatch(updateShape(id, updates));
                  });
                }}
              />
            )}

            {/* 状态栏 */}
            <StatusBar
              connectionStatus={connectionStatus}
              userCount={Object.keys(users).length}
              shapeCount={Object.keys(shapes).length}
            />
          </div>
        );
      }

      // 绘制函数
      function drawShape(ctx, shape) {
        ctx.save();
        
        // 设置样式
        ctx.strokeStyle = shape.color || '#000';
        ctx.lineWidth = shape.strokeWidth || 1;
        ctx.fillStyle = shape.fillColor || 'transparent';
        
        switch (shape.type) {
          case 'path':
            ctx.beginPath();
            shape.points.forEach((point, index) => {
              if (index === 0) {
                ctx.moveTo(point.x, point.y);
              } else {
                ctx.lineTo(point.x, point.y);
              }
            });
            ctx.stroke();
            break;
            
          case 'rectangle':
            ctx.beginPath();
            ctx.rect(shape.x, shape.y, shape.width, shape.height);
            if (shape.fillColor !== 'transparent') ctx.fill();
            ctx.stroke();
            break;
            
          case 'circle':
            ctx.beginPath();
            const radius = Math.min(Math.abs(shape.width), Math.abs(shape.height)) / 2;
            ctx.arc(
              shape.x + shape.width / 2,
              shape.y + shape.height / 2,
              radius,
              0,
              2 * Math.PI
            );
            if (shape.fillColor !== 'transparent') ctx.fill();
            ctx.stroke();
            break;
            
          case 'text':
            ctx.font = `${shape.fontSize || 16}px ${shape.fontFamily || 'Arial'}`;
            ctx.fillStyle = shape.color || '#000';
            ctx.fillText(shape.text, shape.x, shape.y);
            break;
        }
        
        ctx.restore();
      }

      function drawCursor(ctx, cursor, user) {
        if (!user) return;
        
        ctx.save();
        ctx.fillStyle = user.color;
        
        // 绘制光标
        ctx.beginPath();
        ctx.moveTo(cursor.x, cursor.y);
        ctx.lineTo(cursor.x + 12, cursor.y + 12);
        ctx.lineTo(cursor.x + 5, cursor.y + 12);
        ctx.lineTo(cursor.x, cursor.y + 17);
        ctx.closePath();
        ctx.fill();
        
        // 绘制用户名
        ctx.fillStyle = 'white';
        ctx.fillRect(cursor.x + 12, cursor.y + 10, user.name.length * 8 + 10, 20);
        ctx.fillStyle = user.color;
        ctx.fillText(user.name, cursor.x + 17, cursor.y + 23);
        
        ctx.restore();
      }

      export default CollaborativeWhiteboard;
  - filename: "EcommerceAdmin.jsx"
    content: |
      // RTK Query API定义
      import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

      export const ecommerceApi = createApi({
        reducerPath: 'ecommerceApi',
        baseQuery: fetchBaseQuery({
          baseUrl: '/api/admin',
          prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.token;
            if (token) {
              headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
          }
        }),
        tagTypes: ['Product', 'Order', 'Customer', 'Inventory'],
        endpoints: (builder) => ({
          // 产品管理
          getProducts: builder.query({
            query: (params) => ({
              url: 'products',
              params
            }),
            transformResponse: (response) => ({
              products: response.data,
              total: response.total,
              page: response.page,
              pageSize: response.pageSize
            }),
            providesTags: (result) =>
              result
                ? [
                    ...result.products.map(({ id }) => ({ type: 'Product', id })),
                    { type: 'Product', id: 'LIST' }
                  ]
                : [{ type: 'Product', id: 'LIST' }]
          }),

          getProduct: builder.query({
            query: (id) => `products/${id}`,
            providesTags: (result, error, id) => [{ type: 'Product', id }]
          }),

          createProduct: builder.mutation({
            query: (product) => ({
              url: 'products',
              method: 'POST',
              body: product
            }),
            invalidatesTags: [{ type: 'Product', id: 'LIST' }]
          }),

          updateProduct: builder.mutation({
            query: ({ id, ...patch }) => ({
              url: `products/${id}`,
              method: 'PATCH',
              body: patch
            }),
            invalidatesTags: (result, error, { id }) => [
              { type: 'Product', id },
              { type: 'Product', id: 'LIST' }
            ],
            // 乐观更新
            async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
              const patchResult = dispatch(
                ecommerceApi.util.updateQueryData('getProduct', id, (draft) => {
                  Object.assign(draft, patch);
                })
              );
              try {
                await queryFulfilled;
              } catch {
                patchResult.undo();
              }
            }
          }),

          deleteProduct: builder.mutation({
            query: (id) => ({
              url: `products/${id}`,
              method: 'DELETE'
            }),
            invalidatesTags: (result, error, id) => [
              { type: 'Product', id },
              { type: 'Product', id: 'LIST' }
            ]
          }),

          // 批量操作
          batchUpdateProducts: builder.mutation({
            query: ({ ids, updates }) => ({
              url: 'products/batch',
              method: 'PATCH',
              body: { ids, updates }
            }),
            invalidatesTags: (result, error, { ids }) => [
              ...ids.map(id => ({ type: 'Product', id })),
              { type: 'Product', id: 'LIST' }
            ]
          }),

          // 库存管理
          getInventory: builder.query({
            query: (productId) => `inventory/${productId}`,
            providesTags: (result, error, productId) => [
              { type: 'Inventory', id: productId }
            ]
          }),

          updateInventory: builder.mutation({
            query: ({ productId, updates }) => ({
              url: `inventory/${productId}`,
              method: 'PATCH',
              body: updates
            }),
            invalidatesTags: (result, error, { productId }) => [
              { type: 'Inventory', id: productId },
              { type: 'Product', id: productId }
            ]
          }),

          // 订单管理
          getOrders: builder.query({
            query: (params) => ({
              url: 'orders',
              params
            }),
            providesTags: (result) =>
              result
                ? [
                    ...result.orders.map(({ id }) => ({ type: 'Order', id })),
                    { type: 'Order', id: 'LIST' }
                  ]
                : [{ type: 'Order', id: 'LIST' }]
          }),

          getOrder: builder.query({
            query: (id) => `orders/${id}`,
            providesTags: (result, error, id) => [{ type: 'Order', id }]
          }),

          updateOrderStatus: builder.mutation({
            query: ({ id, status }) => ({
              url: `orders/${id}/status`,
              method: 'PATCH',
              body: { status }
            }),
            invalidatesTags: (result, error, { id }) => [
              { type: 'Order', id },
              { type: 'Order', id: 'LIST' }
            ]
          }),

          // 实时数据
          subscribeToOrderUpdates: builder.query({
            query: () => 'orders/stream',
            async onCacheEntryAdded(
              arg,
              { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
            ) {
              // 创建WebSocket连接
              const ws = new WebSocket('ws://localhost:8080/orders');
              
              try {
                await cacheDataLoaded;
                
                ws.addEventListener('message', (event) => {
                  const data = JSON.parse(event.data);
                  updateCachedData((draft) => {
                    // 更新缓存数据
                    if (data.type === 'order_created') {
                      draft.orders.unshift(data.order);
                    } else if (data.type === 'order_updated') {
                      const index = draft.orders.findIndex(o => o.id === data.order.id);
                      if (index >= 0) {
                        draft.orders[index] = data.order;
                      }
                    }
                  });
                });
              } catch {
                // 处理错误
              }
              
              await cacheEntryRemoved;
              ws.close();
            }
          }),

          // 数据分析
          getDashboardStats: builder.query({
            query: (period) => `stats/dashboard?period=${period}`,
            providesTags: ['Stats']
          }),

          getSalesReport: builder.query({
            query: (params) => ({
              url: 'stats/sales',
              params
            }),
            providesTags: ['Stats']
          }),

          getInventoryReport: builder.query({
            query: () => 'stats/inventory',
            providesTags: ['Stats', 'Inventory']
          })
        })
      });

      export const {
        useGetProductsQuery,
        useGetProductQuery,
        useCreateProductMutation,
        useUpdateProductMutation,
        useDeleteProductMutation,
        useBatchUpdateProductsMutation,
        useGetInventoryQuery,
        useUpdateInventoryMutation,
        useGetOrdersQuery,
        useGetOrderQuery,
        useUpdateOrderStatusMutation,
        useSubscribeToOrderUpdatesQuery,
        useGetDashboardStatsQuery,
        useGetSalesReportQuery,
        useGetInventoryReportQuery
      } = ecommerceApi;

      // Store配置
      import { configureStore } from '@reduxjs/toolkit';
      import { setupListeners } from '@reduxjs/toolkit/query';
      import uiReducer from './slices/uiSlice';
      import filtersReducer from './slices/filtersSlice';
      import batchOperationsReducer from './slices/batchOperationsSlice';

      export const store = configureStore({
        reducer: {
          [ecommerceApi.reducerPath]: ecommerceApi.reducer,
          ui: uiReducer,
          filters: filtersReducer,
          batchOperations: batchOperationsReducer
        },
        middleware: (getDefaultMiddleware) =>
          getDefaultMiddleware().concat(ecommerceApi.middleware)
      });

      setupListeners(store.dispatch);

      // 主应用组件
      import React, { useState, useMemo } from 'react';
      import { useSelector, useDispatch } from 'react-redux';
      import { Routes, Route, Navigate } from 'react-router-dom';
      import {
        DataGrid,
        GridToolbar,
        GridActionsCellItem
      } from '@mui/x-data-grid';
      import {
        Dashboard as DashboardIcon,
        Inventory as InventoryIcon,
        ShoppingCart as OrdersIcon,
        People as CustomersIcon,
        BarChart as ReportsIcon,
        Edit as EditIcon,
        Delete as DeleteIcon,
        ContentCopy as DuplicateIcon
      } from '@mui/icons-material';

      function EcommerceAdmin() {
        const dispatch = useDispatch();
        const [selectedTab, setSelectedTab] = useState('dashboard');

        return (
          <div className="admin-container">
            <Sidebar selectedTab={selectedTab} onTabChange={setSelectedTab} />
            
            <main className="admin-main">
              <Header />
              
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/products" element={<ProductsManager />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/orders" element={<OrdersManager />} />
                <Route path="/orders/:id" element={<OrderDetail />} />
                <Route path="/customers" element={<CustomersManager />} />
                <Route path="/inventory" element={<InventoryManager />} />
                <Route path="/reports" element={<Reports />} />
              </Routes>
            </main>
          </div>
        );
      }

      // 仪表板组件
      function Dashboard() {
        const [period, setPeriod] = useState('week');
        const { data: stats, isLoading } = useGetDashboardStatsQuery(period);
        const { data: realtimeOrders } = useSubscribeToOrderUpdatesQuery();

        if (isLoading) return <LoadingSpinner />;

        return (
          <div className="dashboard">
            <div className="dashboard-header">
              <h1>仪表板</h1>
              <PeriodSelector value={period} onChange={setPeriod} />
            </div>

            <div className="stats-grid">
              <StatCard
                title="总销售额"
                value={`¥${stats.totalSales.toLocaleString()}`}
                change={stats.salesChange}
                icon={<BarChartIcon />}
              />
              <StatCard
                title="订单数"
                value={stats.orderCount}
                change={stats.orderChange}
                icon={<OrdersIcon />}
              />
              <StatCard
                title="平均订单价值"
                value={`¥${stats.avgOrderValue.toFixed(2)}`}
                change={stats.avgOrderChange}
                icon={<TrendingUpIcon />}
              />
              <StatCard
                title="转化率"
                value={`${stats.conversionRate.toFixed(2)}%`}
                change={stats.conversionChange}
                icon={<PercentIcon />}
              />
            </div>

            <div className="dashboard-content">
              <div className="chart-section">
                <SalesChart data={stats.salesData} />
                <CategoryChart data={stats.categoryData} />
              </div>

              <div className="recent-section">
                <RecentOrders orders={realtimeOrders?.orders || []} />
                <LowStockAlert />
              </div>
            </div>
          </div>
        );
      }

      // 产品管理组件
      function ProductsManager() {
        const dispatch = useDispatch();
        const filters = useSelector(state => state.filters.products);
        const [page, setPage] = useState(0);
        const [pageSize, setPageSize] = useState(25);
        const [sortModel, setSortModel] = useState([]);
        const [selectedRows, setSelectedRows] = useState([]);
        const [isCreating, setIsCreating] = useState(false);

        const { data, isLoading, isFetching } = useGetProductsQuery({
          page: page + 1,
          pageSize,
          sort: sortModel[0]?.field,
          order: sortModel[0]?.sort,
          ...filters
        });

        const [deleteProduct] = useDeleteProductMutation();
        const [batchUpdate] = useBatchUpdateProductsMutation();

        const columns = useMemo(() => [
          { field: 'id', headerName: 'ID', width: 90 },
          {
            field: 'image',
            headerName: '图片',
            width: 100,
            renderCell: (params) => (
              <img
                src={params.value}
                alt={params.row.name}
                style={{ width: 50, height: 50, objectFit: 'cover' }}
              />
            )
          },
          { field: 'name', headerName: '商品名称', flex: 1, minWidth: 200 },
          { field: 'sku', headerName: 'SKU', width: 120 },
          {
            field: 'price',
            headerName: '价格',
            width: 120,
            valueFormatter: (params) => `¥${params.value.toFixed(2)}`
          },
          {
            field: 'stock',
            headerName: '库存',
            width: 100,
            renderCell: (params) => (
              <StockIndicator value={params.value} />
            )
          },
          {
            field: 'category',
            headerName: '分类',
            width: 120
          },
          {
            field: 'status',
            headerName: '状态',
            width: 100,
            renderCell: (params) => (
              <StatusChip status={params.value} />
            )
          },
          {
            field: 'actions',
            type: 'actions',
            headerName: '操作',
            width: 100,
            getActions: (params) => [
              <GridActionsCellItem
                icon={<EditIcon />}
                label="编辑"
                onClick={() => handleEdit(params.row)}
              />,
              <GridActionsCellItem
                icon={<DuplicateIcon />}
                label="复制"
                onClick={() => handleDuplicate(params.row)}
              />,
              <GridActionsCellItem
                icon={<DeleteIcon />}
                label="删除"
                onClick={() => handleDelete(params.row.id)}
                color="error"
              />
            ]
          }
        ], []);

        const handleEdit = (product) => {
          // 导航到编辑页面
        };

        const handleDuplicate = async (product) => {
          const { id, ...productData } = product;
          await createProduct({
            ...productData,
            name: `${productData.name} (副本)`,
            sku: `${productData.sku}-COPY`
          });
        };

        const handleDelete = async (id) => {
          if (confirm('确定要删除这个商品吗？')) {
            await deleteProduct(id);
          }
        };

        const handleBatchAction = async (action) => {
          switch (action) {
            case 'activate':
              await batchUpdate({
                ids: selectedRows,
                updates: { status: 'active' }
              });
              break;
            case 'deactivate':
              await batchUpdate({
                ids: selectedRows,
                updates: { status: 'inactive' }
              });
              break;
            case 'delete':
              if (confirm(`确定要删除 ${selectedRows.length} 个商品吗？`)) {
                await Promise.all(selectedRows.map(id => deleteProduct(id)));
              }
              break;
          }
          setSelectedRows([]);
        };

        return (
          <div className="products-manager">
            <div className="page-header">
              <h1>商品管理</h1>
              <button
                className="btn-primary"
                onClick={() => setIsCreating(true)}
              >
                + 新建商品
              </button>
            </div>

            <ProductFilters />

            {selectedRows.length > 0 && (
              <BatchActions
                count={selectedRows.length}
                onAction={handleBatchAction}
              />
            )}

            <DataGrid
              rows={data?.products || []}
              columns={columns}
              rowCount={data?.total || 0}
              loading={isLoading || isFetching}
              pageSizeOptions={[25, 50, 100]}
              paginationModel={{ page, pageSize }}
              onPaginationModelChange={(model) => {
                setPage(model.page);
                setPageSize(model.pageSize);
              }}
              sortingModel={sortModel}
              onSortingModelChange={setSortModel}
              checkboxSelection
              disableRowSelectionOnClick
              rowSelectionModel={selectedRows}
              onRowSelectionModelChange={setSelectedRows}
              slots={{
                toolbar: GridToolbar
              }}
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                  quickFilterProps: { debounceMs: 500 }
                }
              }}
            />

            {isCreating && (
              <ProductModal
                onClose={() => setIsCreating(false)}
                onSubmit={async (data) => {
                  await createProduct(data);
                  setIsCreating(false);
                }}
              />
            )}
          </div>
        );
      }

      // 库存管理组件
      function InventoryManager() {
        const { data: inventoryReport, isLoading } = useGetInventoryReportQuery();
        const [updateInventory] = useUpdateInventoryMutation();
        const [selectedWarehouse, setSelectedWarehouse] = useState('all');
        const [alertThreshold, setAlertThreshold] = useState(10);

        if (isLoading) return <LoadingSpinner />;

        const lowStockItems = inventoryReport.items.filter(
          item => item.stock <= alertThreshold
        );

        const handleStockAdjustment = async (productId, adjustment) => {
          await updateInventory({
            productId,
            updates: {
              adjustment,
              reason: prompt('调整原因：')
            }
          });
        };

        return (
          <div className="inventory-manager">
            <div className="inventory-header">
              <h1>库存管理</h1>
              <div className="inventory-controls">
                <WarehouseSelector
                  value={selectedWarehouse}
                  onChange={setSelectedWarehouse}
                />
                <AlertThresholdInput
                  value={alertThreshold}
                  onChange={setAlertThreshold}
                />
              </div>
            </div>

            <div className="inventory-stats">
              <StatCard
                title="总库存价值"
                value={`¥${inventoryReport.totalValue.toLocaleString()}`}
                icon={<InventoryIcon />}
              />
              <StatCard
                title="低库存商品"
                value={lowStockItems.length}
                variant="warning"
                icon={<WarningIcon />}
              />
              <StatCard
                title="缺货商品"
                value={inventoryReport.outOfStock}
                variant="error"
                icon={<ErrorIcon />}
              />
              <StatCard
                title="库存周转率"
                value={`${inventoryReport.turnoverRate.toFixed(2)}x`}
                icon={<SpeedIcon />}
              />
            </div>

            <div className="inventory-content">
              <InventoryTable
                items={inventoryReport.items}
                warehouse={selectedWarehouse}
                onAdjustStock={handleStockAdjustment}
              />
              
              <StockMovementHistory />
            </div>

            <StockPrediction items={inventoryReport.items} />
          </div>
        );
      }

      export default EcommerceAdmin;
keyTakeaways:
  - "Redux Toolkit大大简化了Redux的使用，是现代Redux开发的标准"
  - "createEntityAdapter提供了规范化状态管理的最佳实践"
  - "RTK Query是数据获取和缓存的完整解决方案"
  - "WebSocket中间件可以优雅地处理实时通信"
  - "乐观更新和错误回滚提升用户体验"
  - "选择器模式和memoization对性能优化至关重要"
  - "批量操作和事务处理在企业应用中很常见"
commonMistakes:
  - "直接修改state而不是返回新对象（RTK使用Immer但仍要注意）"
  - "在组件中执行复杂计算而不是使用选择器"
  - "忘记处理异步操作的loading和error状态"
  - "过度使用Redux，简单状态也全局化"
  - "不合理的state结构导致频繁的深层更新"
extensions:
  - "实现离线支持with背景同步"
  - "添加Redux持久化和数据迁移"
  - "集成Redux与Service Worker"
  - "实现时间旅行调试功能"
  - "创建Redux DevTools插件"
---

# Redux和Redux Toolkit解决方案

## 🎯 实现方案概述

本解决方案展示了Redux Toolkit在实际项目中的应用：

1. **任务管理系统** - 完整的项目和任务管理，包含拖拽、批量操作、实时更新
2. **实时协作白板** - WebSocket集成、CRDT冲突解决、多用户协作
3. **电商后台管理** - RTK Query数据管理、实时订单、库存预警

## 📝 关键技术亮点

### 1. 任务管理系统特性

- **规范化数据结构**：使用createEntityAdapter管理关联数据
- **高级选择器**：createSelector实现性能优化
- **乐观更新**：提升用户体验的更新策略
- **批量操作**：事务性的批量更新
- **拖拽排序**：react-beautiful-dnd集成

### 2. 协作白板架构

- **WebSocket中间件**：优雅的实时通信处理
- **CRDT策略**：基于时间戳的冲突解决
- **性能优化**：Canvas渲染和批量更新
- **历史管理**：撤销/重做功能实现
- **权限控制**：细粒度的协作权限

### 3. 电商后台设计

- **RTK Query**：完整的服务端状态管理
- **缓存策略**：智能的数据缓存和更新
- **实时通知**：WebSocket订阅模式
- **数据分析**：仪表板和报表系统
- **批量处理**：高效的批量操作

## 🔧 性能优化策略

1. **选择器优化**
   - 使用createSelector缓存计算结果
   - 参数化选择器避免重复创建
   - 浅比较优化组件重渲染

2. **数据结构设计**
   - 规范化避免深层嵌套
   - 使用ID引用而非嵌套对象
   - 分离频繁更新的数据

3. **异步优化**
   - 请求去重和缓存
   - 条件请求避免不必要的API调用
   - 批量请求减少网络开销

4. **实时通信**
   - 消息队列处理离线场景
   - 自动重连机制
   - 批量同步减少消息数量

## 💡 最佳实践总结

1. **使用Redux Toolkit而非传统Redux**
2. **优先使用RTK Query管理服务端状态**
3. **合理设计state结构，避免深层嵌套**
4. **使用createEntityAdapter管理集合数据**
5. **实现选择器缓存优化性能**
6. **处理好异步操作的各种状态**
7. **考虑离线场景和错误恢复**

这些解决方案可以作为构建大型Redux应用的参考，展示了如何正确使用Redux Toolkit构建可维护、高性能的应用。