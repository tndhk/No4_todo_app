import { create } from 'zustand';
import { taskApi, categoryApi } from '../api/client';

// タスク管理用のストア
const useTaskStore = create((set, get) => ({
  // 状態
  tasks: [],
  categories: [],
  loading: false,
  error: null,
  filters: {
    status: null,
    priority: null,
    categoryId: null,
  },
  activeTaskId: null,
  
  // タスク関連のアクション
  fetchTasks: async () => {
    set({ loading: true, error: null });
    try {
      const { status, priority, categoryId } = get().filters;
      const tasks = await taskApi.getTasks({ status, priority, category_id: categoryId });
      set({ tasks, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Failed to fetch tasks:', error);
    }
  },
  
  fetchTaskWithSubtasks: async (taskId) => {
    set({ loading: true, error: null });
    try {
      const taskWithSubtasks = await taskApi.getTaskWithSubtasks(taskId);
      
      // タスク一覧内の該当タスクを更新
      const updatedTasks = get().tasks.map(task => 
        task.id === taskId ? { ...task, subtasks: taskWithSubtasks.subtasks } : task
      );
      
      set({ 
        tasks: updatedTasks,
        activeTaskId: taskId,
        loading: false 
      });
      
      return taskWithSubtasks;
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Failed to fetch task with subtasks:', error);
    }
  },
  
  createTask: async (taskData) => {
    console.log('TaskStore.createTask 呼び出し:', taskData);
    set({ loading: true, error: null });
    try {
      console.log('taskApi.createTask を呼び出し中...');
      const createdTask = await taskApi.createTask(taskData);
      console.log('タスク作成成功:', createdTask);
      set(state => ({ 
        tasks: [...state.tasks, createdTask],
        loading: false 
      }));
      return createdTask;
    } catch (error) {
      console.error('タスク作成失敗:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  updateTask: async (taskId, taskData) => {
    set({ loading: true, error: null });
    try {
      const updatedTask = await taskApi.updateTask(taskId, taskData);
      
      // タスク一覧内の該当タスクを更新
      const updatedTasks = get().tasks.map(task => 
        task.id === taskId ? updatedTask : task
      );
      
      set({ tasks: updatedTasks, loading: false });
      return updatedTask;
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error(`Failed to update task ${taskId}:`, error);
    }
  },
  
  updateTaskStatus: async (taskId, status) => {
    try {
      const updatedTask = await taskApi.updateTaskStatus(taskId, status);
      
      // タスク一覧内の該当タスクを更新
      const updatedTasks = get().tasks.map(task => 
        task.id === taskId ? updatedTask : task
      );
      
      set({ tasks: updatedTasks });
      return updatedTask;
    } catch (error) {
      console.error(`Failed to update task status ${taskId}:`, error);
      // ステータス更新は頻繁に行われるため、エラー状態は設定しない
    }
  },
  
  deleteTask: async (taskId) => {
    set({ loading: true, error: null });
    try {
      await taskApi.deleteTask(taskId);
      
      // 削除したタスクを一覧から除外
      const filteredTasks = get().tasks.filter(task => task.id !== taskId);
      
      set({ 
        tasks: filteredTasks,
        activeTaskId: get().activeTaskId === taskId ? null : get().activeTaskId,
        loading: false 
      });
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error(`Failed to delete task ${taskId}:`, error);
    }
  },
  
  reorderTasks: async (taskIds) => {
    try {
      const reorderedTasks = await taskApi.reorderTasks(taskIds);
      
      // タスク一覧を更新
      set({ tasks: reorderedTasks });
    } catch (error) {
      console.error('Failed to reorder tasks:', error);
    }
  },
  
  // カテゴリ関連のアクション
  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const categories = await categoryApi.getCategories();
      set({ categories, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Failed to fetch categories:', error);
    }
  },
  
  createCategory: async (categoryData) => {
    set({ loading: true, error: null });
    try {
      const createdCategory = await categoryApi.createCategory(categoryData);
      set(state => ({ 
        categories: [...state.categories, createdCategory],
        loading: false 
      }));
      return createdCategory;
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Failed to create category:', error);
    }
  },
  
  updateCategory: async (categoryId, categoryData) => {
    set({ loading: true, error: null });
    try {
      const updatedCategory = await categoryApi.updateCategory(categoryId, categoryData);
      
      // カテゴリ一覧内の該当カテゴリを更新
      const updatedCategories = get().categories.map(category => 
        category.id === categoryId ? updatedCategory : category
      );
      
      set({ categories: updatedCategories, loading: false });
      return updatedCategory;
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error(`Failed to update category ${categoryId}:`, error);
    }
  },
  
  deleteCategory: async (categoryId) => {
    set({ loading: true, error: null });
    try {
      await categoryApi.deleteCategory(categoryId);
      
      // 削除したカテゴリを一覧から除外
      const filteredCategories = get().categories.filter(
        category => category.id !== categoryId
      );
      
      // カテゴリフィルターも更新
      const filters = { ...get().filters };
      if (filters.categoryId === categoryId) {
        filters.categoryId = null;
      }
      
      set({ 
        categories: filteredCategories,
        filters,
        loading: false 
      });
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error(`Failed to delete category ${categoryId}:`, error);
    }
  },
  
  // フィルター関連のアクション
  setFilter: (filterName, value) => {
    set(state => ({
      filters: {
        ...state.filters,
        [filterName]: value
      }
    }));
    
    // フィルター変更後にタスクを再取得
    get().fetchTasks();
  },
  
  clearFilters: () => {
    set({
      filters: {
        status: null,
        priority: null,
        categoryId: null,
      }
    });
    
    // フィルタークリア後にタスクを再取得
    get().fetchTasks();
  },
  
  // アクティブタスク関連のアクション
  setActiveTask: (taskId) => {
    set({ activeTaskId: taskId });
    if (taskId) {
      get().fetchTaskWithSubtasks(taskId);
    }
  },
  
  clearActiveTask: () => {
    set({ activeTaskId: null });
  }
}));

export default useTaskStore;