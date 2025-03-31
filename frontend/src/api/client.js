import axios from 'axios';

// APIクライアントの設定
const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10秒
  withCredentials: false
});

// タスク関連のAPI
export const taskApi = {
  // タスク一覧取得
  getTasks: async (params = {}) => {
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  // タスク詳細取得
  getTask: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  // サブタスクを含むタスク取得
  getTaskWithSubtasks: async (id) => {
    const response = await api.get(`/tasks/${id}/subtasks`);
    return response.data;
  },

  // タスク作成
  createTask: async (taskData) => {
    console.log('API createTask 呼び出し:', taskData);
    console.log('API URL:', api.defaults.baseURL + '/tasks');
    
    const options = {
      method: 'POST',
      url: '/tasks',
      data: taskData,
      headers: { 'Content-Type': 'application/json' }
    };
    
    console.log('API リクエスト設定:', options);
    
    try {
      const response = await api.request(options);
      console.log('API レスポンス:', response.data);
      return response.data;
    } catch (error) {
      console.error('API エラー:', {
        message: error.message,
        status: error.response?.status,
        response: error.response?.data,
        request: error.request ? 'リクエストは送信されたがレスポンスがありません' : 'リクエスト未送信'
      });
      throw error;
    }
  },

  // タスク更新
  updateTask: async (id, taskData) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  // タスクステータス更新
  updateTaskStatus: async (id, status) => {
    const response = await api.patch(`/tasks/${id}/status`, { status });
    return response.data;
  },

  // タスク削除
  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  // タスク並び替え
  reorderTasks: async (taskIds) => {
    const response = await api.post('/tasks/reorder', taskIds);
    return response.data;
  }
};

// カテゴリ関連のAPI
export const categoryApi = {
  // カテゴリ一覧取得
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  // カテゴリ詳細取得
  getCategory: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  // カテゴリ内のタスク取得
  getCategoryWithTasks: async (id) => {
    const response = await api.get(`/categories/${id}/tasks`);
    return response.data;
  },

  // カテゴリ作成
  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  // カテゴリ更新
  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  // カテゴリ削除
  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  }
};

export default {
  task: taskApi,
  category: categoryApi
};