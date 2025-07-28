// IndexedDB实战示例 - Day 17
// 构建一个完整的笔记应用，展示IndexedDB的所有核心功能

// ============================================
// 1. 数据库管理类
// ============================================

class NotesDB {
    constructor(dbName = 'NotesApp', version = 1) {
        this.dbName = dbName;
        this.version = version;
        this.db = null;
    }
    
    // 打开或创建数据库
    async open() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            
            // 数据库升级（创建或修改结构）
            request.onupgradeneeded = (event) => {
                console.log('数据库升级中...');
                const db = event.target.result;
                const oldVersion = event.oldVersion;
                
                // 版本1：创建基础结构
                if (oldVersion < 1) {
                    this.createV1Schema(db);
                }
                
                // 版本2：添加新功能（示例）
                if (oldVersion < 2) {
                    this.upgradeToV2(db);
                }
            };
            
            // 成功打开
            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('数据库已打开');
                
                // 处理数据库版本更新
                this.db.onversionchange = () => {
                    this.db.close();
                    console.log('数据库版本已更新，请刷新页面');
                };
                
                resolve(this.db);
            };
            
            // 错误处理
            request.onerror = (event) => {
                reject(`数据库打开失败: ${event.target.error}`);
            };
            
            // 阻塞处理
            request.onblocked = () => {
                console.warn('数据库升级被阻塞，请关闭其他标签页');
            };
        });
    }
    
    // 创建版本1的数据库结构
    createV1Schema(db) {
        // 笔记存储
        if (!db.objectStoreNames.contains('notes')) {
            const notesStore = db.createObjectStore('notes', { 
                keyPath: 'id', 
                autoIncrement: true 
            });
            
            // 创建索引
            notesStore.createIndex('title', 'title', { unique: false });
            notesStore.createIndex('category', 'category', { unique: false });
            notesStore.createIndex('createdAt', 'createdAt', { unique: false });
            notesStore.createIndex('updatedAt', 'updatedAt', { unique: false });
            notesStore.createIndex('tags', 'tags', { unique: false, multiEntry: true });
        }
        
        // 分类存储
        if (!db.objectStoreNames.contains('categories')) {
            const categoriesStore = db.createObjectStore('categories', { 
                keyPath: 'id', 
                autoIncrement: true 
            });
            categoriesStore.createIndex('name', 'name', { unique: true });
        }
        
        // 标签存储
        if (!db.objectStoreNames.contains('tags')) {
            const tagsStore = db.createObjectStore('tags', { 
                keyPath: 'name' 
            });
            tagsStore.createIndex('count', 'count', { unique: false });
        }
    }
    
    // 升级到版本2（示例）
    upgradeToV2(db) {
        // 添加附件存储
        if (!db.objectStoreNames.contains('attachments')) {
            const attachmentsStore = db.createObjectStore('attachments', { 
                keyPath: 'id', 
                autoIncrement: true 
            });
            attachmentsStore.createIndex('noteId', 'noteId', { unique: false });
        }
    }
    
    // 关闭数据库
    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
            console.log('数据库已关闭');
        }
    }
}

// ============================================
// 2. 笔记管理器
// ============================================

class NotesManager {
    constructor(db) {
        this.db = db;
    }
    
    // 创建新笔记
    async createNote(noteData) {
        const note = {
            title: noteData.title || '未命名笔记',
            content: noteData.content || '',
            category: noteData.category || '默认',
            tags: noteData.tags || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isArchived: false,
            isFavorite: false
        };
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['notes', 'tags'], 'readwrite');
            const notesStore = transaction.objectStore('notes');
            const tagsStore = transaction.objectStore('tags');
            
            // 添加笔记
            const request = notesStore.add(note);
            
            request.onsuccess = async (event) => {
                note.id = event.target.result;
                
                // 更新标签计数
                for (const tag of note.tags) {
                    await this.updateTagCount(tagsStore, tag, 1);
                }
                
                console.log('笔记创建成功:', note);
                resolve(note);
            };
            
            request.onerror = (event) => {
                reject(`创建笔记失败: ${event.target.error}`);
            };
            
            transaction.onerror = (event) => {
                reject(`事务失败: ${event.target.error}`);
            };
        });
    }
    
    // 更新标签计数
    async updateTagCount(tagsStore, tagName, delta) {
        return new Promise((resolve, reject) => {
            const getRequest = tagsStore.get(tagName);
            
            getRequest.onsuccess = (event) => {
                const tag = event.target.result;
                
                if (tag) {
                    tag.count += delta;
                    if (tag.count <= 0) {
                        tagsStore.delete(tagName);
                    } else {
                        tagsStore.put(tag);
                    }
                } else if (delta > 0) {
                    tagsStore.add({ name: tagName, count: delta });
                }
                
                resolve();
            };
        });
    }
    
    // 获取单个笔记
    async getNote(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['notes'], 'readonly');
            const store = transaction.objectStore('notes');
            const request = store.get(id);
            
            request.onsuccess = (event) => {
                const note = event.target.result;
                if (note) {
                    console.log('获取笔记成功:', note);
                    resolve(note);
                } else {
                    reject(`笔记不存在: ID ${id}`);
                }
            };
            
            request.onerror = (event) => {
                reject(`获取笔记失败: ${event.target.error}`);
            };
        });
    }
    
    // 更新笔记
    async updateNote(id, updates) {
        const note = await this.getNote(id);
        const oldTags = note.tags || [];
        
        // 合并更新
        Object.assign(note, updates, {
            updatedAt: new Date().toISOString()
        });
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['notes', 'tags'], 'readwrite');
            const notesStore = transaction.objectStore('notes');
            const tagsStore = transaction.objectStore('tags');
            
            const request = notesStore.put(note);
            
            request.onsuccess = async () => {
                // 更新标签计数
                const newTags = note.tags || [];
                const removedTags = oldTags.filter(t => !newTags.includes(t));
                const addedTags = newTags.filter(t => !oldTags.includes(t));
                
                for (const tag of removedTags) {
                    await this.updateTagCount(tagsStore, tag, -1);
                }
                
                for (const tag of addedTags) {
                    await this.updateTagCount(tagsStore, tag, 1);
                }
                
                console.log('笔记更新成功:', note);
                resolve(note);
            };
            
            request.onerror = (event) => {
                reject(`更新笔记失败: ${event.target.error}`);
            };
        });
    }
    
    // 删除笔记
    async deleteNote(id) {
        const note = await this.getNote(id);
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['notes', 'tags'], 'readwrite');
            const notesStore = transaction.objectStore('notes');
            const tagsStore = transaction.objectStore('tags');
            
            const request = notesStore.delete(id);
            
            request.onsuccess = async () => {
                // 更新标签计数
                for (const tag of note.tags || []) {
                    await this.updateTagCount(tagsStore, tag, -1);
                }
                
                console.log('笔记删除成功:', id);
                resolve(id);
            };
            
            request.onerror = (event) => {
                reject(`删除笔记失败: ${event.target.error}`);
            };
        });
    }
    
    // 获取所有笔记
    async getAllNotes(options = {}) {
        const { 
            category = null, 
            tag = null, 
            archived = false,
            favorite = null,
            sortBy = 'updatedAt',
            sortOrder = 'desc',
            limit = null,
            offset = 0
        } = options;
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['notes'], 'readonly');
            const store = transaction.objectStore('notes');
            
            let request;
            if (category) {
                const index = store.index('category');
                request = index.openCursor(IDBKeyRange.only(category));
            } else if (tag) {
                const index = store.index('tags');
                request = index.openCursor(IDBKeyRange.only(tag));
            } else {
                request = store.openCursor();
            }
            
            const notes = [];
            let count = 0;
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                
                if (cursor) {
                    const note = cursor.value;
                    
                    // 应用过滤器
                    if (archived !== null && note.isArchived !== archived) {
                        cursor.continue();
                        return;
                    }
                    
                    if (favorite !== null && note.isFavorite !== favorite) {
                        cursor.continue();
                        return;
                    }
                    
                    // 应用分页
                    if (count >= offset) {
                        notes.push(note);
                    }
                    
                    count++;
                    
                    if (limit && notes.length >= limit) {
                        // 排序并返回结果
                        this.sortNotes(notes, sortBy, sortOrder);
                        resolve({ notes, total: count });
                        return;
                    }
                    
                    cursor.continue();
                } else {
                    // 排序并返回结果
                    this.sortNotes(notes, sortBy, sortOrder);
                    resolve({ notes, total: count });
                }
            };
            
            request.onerror = (event) => {
                reject(`获取笔记列表失败: ${event.target.error}`);
            };
        });
    }
    
    // 排序笔记
    sortNotes(notes, sortBy, sortOrder) {
        notes.sort((a, b) => {
            let comparison = 0;
            
            switch (sortBy) {
                case 'title':
                    comparison = a.title.localeCompare(b.title);
                    break;
                case 'createdAt':
                case 'updatedAt':
                    comparison = new Date(a[sortBy]) - new Date(b[sortBy]);
                    break;
                default:
                    comparison = 0;
            }
            
            return sortOrder === 'asc' ? comparison : -comparison;
        });
    }
    
    // 搜索笔记（模拟全文搜索）
    async searchNotes(query) {
        const allNotes = await this.getAllNotes();
        const searchTerm = query.toLowerCase();
        
        const results = allNotes.notes.filter(note => {
            const titleMatch = note.title.toLowerCase().includes(searchTerm);
            const contentMatch = note.content.toLowerCase().includes(searchTerm);
            const tagMatch = note.tags.some(tag => 
                tag.toLowerCase().includes(searchTerm)
            );
            
            return titleMatch || contentMatch || tagMatch;
        });
        
        // 按相关性排序
        results.sort((a, b) => {
            const aScore = this.calculateRelevance(a, searchTerm);
            const bScore = this.calculateRelevance(b, searchTerm);
            return bScore - aScore;
        });
        
        return results;
    }
    
    // 计算搜索相关性
    calculateRelevance(note, searchTerm) {
        let score = 0;
        
        // 标题匹配权重最高
        if (note.title.toLowerCase().includes(searchTerm)) {
            score += 10;
        }
        
        // 内容匹配
        const contentMatches = (note.content.toLowerCase().match(
            new RegExp(searchTerm, 'g')
        ) || []).length;
        score += contentMatches * 2;
        
        // 标签匹配
        note.tags.forEach(tag => {
            if (tag.toLowerCase().includes(searchTerm)) {
                score += 5;
            }
        });
        
        return score;
    }
    
    // 批量操作
    async bulkOperation(noteIds, operation) {
        const results = {
            success: [],
            failed: []
        };
        
        for (const id of noteIds) {
            try {
                switch (operation.type) {
                    case 'delete':
                        await this.deleteNote(id);
                        results.success.push(id);
                        break;
                        
                    case 'archive':
                        await this.updateNote(id, { isArchived: true });
                        results.success.push(id);
                        break;
                        
                    case 'unarchive':
                        await this.updateNote(id, { isArchived: false });
                        results.success.push(id);
                        break;
                        
                    case 'favorite':
                        await this.updateNote(id, { isFavorite: true });
                        results.success.push(id);
                        break;
                        
                    case 'unfavorite':
                        await this.updateNote(id, { isFavorite: false });
                        results.success.push(id);
                        break;
                        
                    case 'changeCategory':
                        await this.updateNote(id, { category: operation.category });
                        results.success.push(id);
                        break;
                        
                    case 'addTags':
                        const note = await this.getNote(id);
                        const newTags = [...new Set([...note.tags, ...operation.tags])];
                        await this.updateNote(id, { tags: newTags });
                        results.success.push(id);
                        break;
                }
            } catch (error) {
                results.failed.push({ id, error: error.message });
            }
        }
        
        console.log('批量操作完成:', results);
        return results;
    }
}

// ============================================
// 3. 分类管理器
// ============================================

class CategoryManager {
    constructor(db) {
        this.db = db;
    }
    
    // 创建分类
    async createCategory(name, description = '') {
        const category = {
            name,
            description,
            color: this.generateColor(),
            createdAt: new Date().toISOString()
        };
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['categories'], 'readwrite');
            const store = transaction.objectStore('categories');
            const request = store.add(category);
            
            request.onsuccess = (event) => {
                category.id = event.target.result;
                console.log('分类创建成功:', category);
                resolve(category);
            };
            
            request.onerror = (event) => {
                if (event.target.error.name === 'ConstraintError') {
                    reject('分类名称已存在');
                } else {
                    reject(`创建分类失败: ${event.target.error}`);
                }
            };
        });
    }
    
    // 生成随机颜色
    generateColor() {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
            '#FECA57', '#DDA0DD', '#98D8C8', '#F7DC6F'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // 获取所有分类
    async getAllCategories() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['categories'], 'readonly');
            const store = transaction.objectStore('categories');
            const request = store.getAll();
            
            request.onsuccess = (event) => {
                resolve(event.target.result);
            };
            
            request.onerror = (event) => {
                reject(`获取分类失败: ${event.target.error}`);
            };
        });
    }
    
    // 更新分类
    async updateCategory(id, updates) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['categories'], 'readwrite');
            const store = transaction.objectStore('categories');
            
            const getRequest = store.get(id);
            
            getRequest.onsuccess = (event) => {
                const category = event.target.result;
                if (!category) {
                    reject('分类不存在');
                    return;
                }
                
                Object.assign(category, updates);
                const putRequest = store.put(category);
                
                putRequest.onsuccess = () => {
                    console.log('分类更新成功:', category);
                    resolve(category);
                };
                
                putRequest.onerror = (event) => {
                    reject(`更新分类失败: ${event.target.error}`);
                };
            };
        });
    }
    
    // 删除分类（需要处理相关笔记）
    async deleteCategory(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(
                ['categories', 'notes'], 
                'readwrite'
            );
            
            const categoriesStore = transaction.objectStore('categories');
            const notesStore = transaction.objectStore('notes');
            
            // 获取分类信息
            const getRequest = categoriesStore.get(id);
            
            getRequest.onsuccess = async (event) => {
                const category = event.target.result;
                if (!category) {
                    reject('分类不存在');
                    return;
                }
                
                // 更新所有使用该分类的笔记
                const index = notesStore.index('category');
                const range = IDBKeyRange.only(category.name);
                const cursor = index.openCursor(range);
                
                cursor.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        const note = cursor.value;
                        note.category = '默认';
                        cursor.update(note);
                        cursor.continue();
                    } else {
                        // 删除分类
                        categoriesStore.delete(id);
                        console.log('分类删除成功:', category.name);
                        resolve(category);
                    }
                };
            };
            
            transaction.onerror = (event) => {
                reject(`删除分类失败: ${event.target.error}`);
            };
        });
    }
}

// ============================================
// 4. 导入导出功能
// ============================================

class DataPorter {
    constructor(db) {
        this.db = db;
    }
    
    // 导出所有数据
    async exportData() {
        const data = {
            version: 1,
            exportDate: new Date().toISOString(),
            notes: [],
            categories: [],
            tags: []
        };
        
        try {
            // 导出笔记
            const notesTransaction = this.db.transaction(['notes'], 'readonly');
            const notesStore = notesTransaction.objectStore('notes');
            data.notes = await this.getAll(notesStore);
            
            // 导出分类
            const categoriesTransaction = this.db.transaction(['categories'], 'readonly');
            const categoriesStore = categoriesTransaction.objectStore('categories');
            data.categories = await this.getAll(categoriesStore);
            
            // 导出标签
            const tagsTransaction = this.db.transaction(['tags'], 'readonly');
            const tagsStore = tagsTransaction.objectStore('tags');
            data.tags = await this.getAll(tagsStore);
            
            // 创建下载
            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `notes-backup-${Date.now()}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            
            console.log('数据导出成功');
            return data;
        } catch (error) {
            console.error('导出失败:', error);
            throw error;
        }
    }
    
    // 导入数据
    async importData(jsonData) {
        try {
            const data = typeof jsonData === 'string' ? 
                JSON.parse(jsonData) : jsonData;
            
            if (!data.version || !data.notes) {
                throw new Error('无效的导入文件格式');
            }
            
            const result = {
                notes: { imported: 0, failed: 0 },
                categories: { imported: 0, failed: 0 },
                tags: { imported: 0, failed: 0 }
            };
            
            // 导入分类
            if (data.categories) {
                for (const category of data.categories) {
                    try {
                        const transaction = this.db.transaction(['categories'], 'readwrite');
                        const store = transaction.objectStore('categories');
                        delete category.id; // 使用新ID
                        await this.putData(store, category);
                        result.categories.imported++;
                    } catch (error) {
                        result.categories.failed++;
                    }
                }
            }
            
            // 导入笔记
            if (data.notes) {
                for (const note of data.notes) {
                    try {
                        const transaction = this.db.transaction(['notes'], 'readwrite');
                        const store = transaction.objectStore('notes');
                        delete note.id; // 使用新ID
                        await this.putData(store, note);
                        result.notes.imported++;
                    } catch (error) {
                        result.notes.failed++;
                    }
                }
            }
            
            // 重建标签索引
            await this.rebuildTagIndex();
            
            console.log('数据导入完成:', result);
            return result;
        } catch (error) {
            console.error('导入失败:', error);
            throw error;
        }
    }
    
    // 获取存储中的所有数据
    getAll(store) {
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    // 添加数据到存储
    putData(store, data) {
        return new Promise((resolve, reject) => {
            const request = store.add(data);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    // 重建标签索引
    async rebuildTagIndex() {
        const transaction = this.db.transaction(['notes', 'tags'], 'readwrite');
        const notesStore = transaction.objectStore('notes');
        const tagsStore = transaction.objectStore('tags');
        
        // 清空标签
        await this.clearStore(tagsStore);
        
        // 重新计算标签
        const notes = await this.getAll(notesStore);
        const tagCounts = {};
        
        notes.forEach(note => {
            (note.tags || []).forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });
        
        // 保存标签
        for (const [name, count] of Object.entries(tagCounts)) {
            await this.putData(tagsStore, { name, count });
        }
    }
    
    // 清空存储
    clearStore(store) {
        return new Promise((resolve, reject) => {
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

// ============================================
// 5. 统计分析
// ============================================

class NotesAnalytics {
    constructor(db) {
        this.db = db;
    }
    
    // 获取统计信息
    async getStatistics() {
        const stats = {
            totalNotes: 0,
            totalCategories: 0,
            totalTags: 0,
            notesByCategory: {},
            notesByMonth: {},
            favoriteNotes: 0,
            archivedNotes: 0,
            averageNoteLength: 0,
            mostUsedTags: []
        };
        
        try {
            // 获取所有笔记
            const notesTransaction = this.db.transaction(['notes'], 'readonly');
            const notesStore = notesTransaction.objectStore('notes');
            const notes = await this.getAll(notesStore);
            
            stats.totalNotes = notes.length;
            
            let totalLength = 0;
            
            notes.forEach(note => {
                // 分类统计
                stats.notesByCategory[note.category] = 
                    (stats.notesByCategory[note.category] || 0) + 1;
                
                // 月份统计
                const month = note.createdAt.substring(0, 7);
                stats.notesByMonth[month] = 
                    (stats.notesByMonth[month] || 0) + 1;
                
                // 收藏和归档统计
                if (note.isFavorite) stats.favoriteNotes++;
                if (note.isArchived) stats.archivedNotes++;
                
                // 内容长度
                totalLength += note.content.length;
            });
            
            stats.averageNoteLength = stats.totalNotes > 0 ? 
                Math.round(totalLength / stats.totalNotes) : 0;
            
            // 获取分类数量
            const categoriesTransaction = this.db.transaction(['categories'], 'readonly');
            const categoriesStore = categoriesTransaction.objectStore('categories');
            const categories = await this.getAll(categoriesStore);
            stats.totalCategories = categories.length;
            
            // 获取标签统计
            const tagsTransaction = this.db.transaction(['tags'], 'readonly');
            const tagsStore = tagsTransaction.objectStore('tags');
            const tags = await this.getAll(tagsStore);
            
            stats.totalTags = tags.length;
            stats.mostUsedTags = tags
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);
            
            return stats;
        } catch (error) {
            console.error('获取统计信息失败:', error);
            throw error;
        }
    }
    
    // 获取活动热力图数据
    async getActivityHeatmap(days = 365) {
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
        
        const activity = {};
        
        const transaction = this.db.transaction(['notes'], 'readonly');
        const store = transaction.objectStore('notes');
        const index = store.index('createdAt');
        
        const range = IDBKeyRange.bound(
            startDate.toISOString(),
            endDate.toISOString()
        );
        
        return new Promise((resolve, reject) => {
            const request = index.openCursor(range);
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                
                if (cursor) {
                    const date = cursor.value.createdAt.substring(0, 10);
                    activity[date] = (activity[date] || 0) + 1;
                    cursor.continue();
                } else {
                    resolve(activity);
                }
            };
            
            request.onerror = () => reject(request.error);
        });
    }
    
    // 辅助方法
    getAll(store) {
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}

// ============================================
// 6. 使用示例和测试
// ============================================

async function demonstrateIndexedDB() {
    console.log('=== IndexedDB 笔记应用示例 ===\n');
    
    // 初始化数据库
    const db = new NotesDB('NotesApp', 1);
    
    try {
        await db.open();
        
        // 创建管理器实例
        const notesManager = new NotesManager(db.db);
        const categoryManager = new CategoryManager(db.db);
        const dataPorter = new DataPorter(db.db);
        const analytics = new NotesAnalytics(db.db);
        
        // 1. 创建分类
        console.log('\n1. 创建分类:');
        const workCategory = await categoryManager.createCategory('工作', '工作相关笔记');
        const personalCategory = await categoryManager.createCategory('个人', '个人生活记录');
        const studyCategory = await categoryManager.createCategory('学习', '学习笔记');
        
        // 2. 创建笔记
        console.log('\n2. 创建笔记:');
        const note1 = await notesManager.createNote({
            title: 'IndexedDB学习笔记',
            content: '今天学习了IndexedDB的基本概念和使用方法...',
            category: '学习',
            tags: ['JavaScript', 'Web存储', 'IndexedDB']
        });
        
        const note2 = await notesManager.createNote({
            title: '项目进度会议',
            content: '讨论了下周的开发计划和任务分配...',
            category: '工作',
            tags: ['会议', '项目管理']
        });
        
        const note3 = await notesManager.createNote({
            title: '周末计划',
            content: '1. 看电影\n2. 健身\n3. 阅读',
            category: '个人',
            tags: ['计划', '周末']
        });
        
        // 3. 更新笔记
        console.log('\n3. 更新笔记:');
        await notesManager.updateNote(note1.id, {
            content: note1.content + '\n\n更新：完成了CRUD操作的实现！',
            isFavorite: true
        });
        
        // 4. 搜索笔记
        console.log('\n4. 搜索笔记:');
        const searchResults = await notesManager.searchNotes('学习');
        console.log(`搜索"学习"找到 ${searchResults.length} 条结果`);
        
        // 5. 获取分类下的笔记
        console.log('\n5. 获取工作分类的笔记:');
        const workNotes = await notesManager.getAllNotes({ category: '工作' });
        console.log(`工作分类下有 ${workNotes.notes.length} 条笔记`);
        
        // 6. 批量操作
        console.log('\n6. 批量收藏笔记:');
        const bulkResult = await notesManager.bulkOperation(
            [note2.id, note3.id], 
            { type: 'favorite' }
        );
        console.log(`成功收藏 ${bulkResult.success.length} 条笔记`);
        
        // 7. 获取统计信息
        console.log('\n7. 统计分析:');
        const stats = await analytics.getStatistics();
        console.log('统计信息:', {
            总笔记数: stats.totalNotes,
            总分类数: stats.totalCategories,
            总标签数: stats.totalTags,
            收藏笔记: stats.favoriteNotes,
            平均笔记长度: stats.averageNoteLength + ' 字符'
        });
        
        // 8. 导出数据
        console.log('\n8. 导出数据:');
        console.log('准备导出所有数据...');
        // 实际应用中会触发下载
        // await dataPorter.exportData();
        
        // 9. 高级查询示例
        console.log('\n9. 高级查询:');
        
        // 获取最近更新的笔记
        const recentNotes = await notesManager.getAllNotes({
            sortBy: 'updatedAt',
            sortOrder: 'desc',
            limit: 5
        });
        console.log(`最近更新的 ${recentNotes.notes.length} 条笔记`);
        
        // 获取收藏的笔记
        const favoriteNotes = await notesManager.getAllNotes({
            favorite: true
        });
        console.log(`收藏的笔记: ${favoriteNotes.notes.length} 条`);
        
        // 10. 清理演示数据
        console.log('\n10. 清理演示数据:');
        await notesManager.deleteNote(note1.id);
        await notesManager.deleteNote(note2.id);
        await notesManager.deleteNote(note3.id);
        await categoryManager.deleteCategory(workCategory.id);
        await categoryManager.deleteCategory(personalCategory.id);
        await categoryManager.deleteCategory(studyCategory.id);
        
        console.log('演示数据已清理');
        
    } catch (error) {
        console.error('操作失败:', error);
    } finally {
        // 关闭数据库
        db.close();
    }
}

// ============================================
// 7. 性能优化技巧
// ============================================

class PerformanceOptimizer {
    // 使用游标进行大数据集分页
    static async *paginatedCursor(store, pageSize = 100) {
        let lastKey = null;
        
        while (true) {
            const range = lastKey ? 
                IDBKeyRange.lowerBound(lastKey, true) : null;
            
            const items = [];
            const request = store.openCursor(range);
            
            await new Promise((resolve, reject) => {
                request.onsuccess = (event) => {
                    const cursor = event.target.result;
                    
                    if (cursor && items.length < pageSize) {
                        items.push(cursor.value);
                        lastKey = cursor.key;
                        cursor.continue();
                    } else {
                        resolve();
                    }
                };
                
                request.onerror = () => reject(request.error);
            });
            
            if (items.length === 0) break;
            
            yield items;
            
            if (items.length < pageSize) break;
        }
    }
    
    // 批量写入优化
    static async batchWrite(store, items, batchSize = 1000) {
        console.log(`开始批量写入 ${items.length} 条数据...`);
        
        for (let i = 0; i < items.length; i += batchSize) {
            const batch = items.slice(i, i + batchSize);
            
            await new Promise((resolve, reject) => {
                const transaction = store.transaction.db.transaction(
                    [store.name], 'readwrite'
                );
                const objectStore = transaction.objectStore(store.name);
                
                batch.forEach(item => objectStore.add(item));
                
                transaction.oncomplete = () => {
                    console.log(`已写入 ${i + batch.length}/${items.length}`);
                    resolve();
                };
                
                transaction.onerror = () => reject(transaction.error);
            });
        }
        
        console.log('批量写入完成');
    }
}

// ============================================
// 8. 错误处理和恢复
// ============================================

class ErrorHandler {
    static async handleQuotaExceeded(error) {
        console.error('存储配额超出:', error);
        
        // 请求持久化存储
        if ('storage' in navigator && 'persist' in navigator.storage) {
            const isPersisted = await navigator.storage.persist();
            console.log('存储持久化状态:', isPersisted);
        }
        
        // 获取存储使用情况
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            const estimate = await navigator.storage.estimate();
            console.log('存储使用情况:', {
                使用: (estimate.usage / 1024 / 1024).toFixed(2) + ' MB',
                配额: (estimate.quota / 1024 / 1024).toFixed(2) + ' MB',
                使用率: ((estimate.usage / estimate.quota) * 100).toFixed(2) + '%'
            });
        }
        
        // 清理建议
        console.log('建议：清理不需要的数据或请求更多存储空间');
    }
    
    static handleVersionConflict(error) {
        console.error('数据库版本冲突:', error);
        console.log('建议：刷新页面以使用最新版本');
        
        // 可以显示用户友好的提示
        if (confirm('数据库版本已更新，是否刷新页面？')) {
            location.reload();
        }
    }
    
    static async repairDatabase(dbName) {
        console.log('尝试修复数据库...');
        
        try {
            // 尝试打开数据库
            const db = await new Promise((resolve, reject) => {
                const request = indexedDB.open(dbName);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
            
            // 检查对象存储
            const objectStoreNames = db.objectStoreNames;
            console.log('发现对象存储:', Array.from(objectStoreNames));
            
            // 验证数据完整性
            // ... 实现具体的验证逻辑
            
            db.close();
            console.log('数据库检查完成');
        } catch (error) {
            console.error('数据库修复失败:', error);
            
            // 最后的手段：删除并重建
            if (confirm('数据库可能已损坏，是否重置？（将丢失所有数据）')) {
                await indexedDB.deleteDatabase(dbName);
                console.log('数据库已重置');
            }
        }
    }
}

// 运行演示
console.log('IndexedDB笔记应用已加载');
console.log('运行 demonstrateIndexedDB() 查看完整演示');
console.log('提示：打开开发者工具 > Application > IndexedDB 查看数据');

// 自动运行演示（可选）
// demonstrateIndexedDB();