import { act } from 'react-dom/test-utils';
import { renderHook, waitFor } from '@testing-library/react';
import useTaskStore from '../store/taskStore';
import { taskApi, categoryApi } from '../api/client';

// APIのモック化
jest.mock('../api/client', () => ({
  taskApi: {
    getTasks: jest.fn(),
    getTask: jest.fn(),
    getTaskWithSubtasks: jest.fn(),
    createTask: jest.fn(),
    updateTask: jest.fn(),
    updateTaskStatus: jest.fn(),
    deleteTask: jest.fn(),
    reorderTasks: jest.fn(),
  },
  categoryApi: {
    getCategories: jest.fn(),
    createCategory: jest.fn(),
    updateCategory: jest.fn(),
    deleteCategory: jest.fn(),
  },
}));

describe('TaskStore', () => {
  beforeEach(() => {
    // 各テスト前にストアとモックをリセット
    useTaskStore.getState().tasks = [];
    useTaskStore.getState().categories = [];
    useTaskStore.getState().loading = false;
    useTaskStore.getState().error = null;
    useTaskStore.getState().filters = { status: null, priority: null, categoryId: null };
    
    jest.clearAllMocks();
  });
  
  describe('fetchTasks', () => {
    it('should fetch tasks successfully', async () => {
      const mockTasks = [
        { id: 1, title: 'Task 1', priority: 'high' },
        { id: 2, title: 'Task 2', priority: 'medium' },
      ];
      
      taskApi.getTasks.mockResolvedValue(mockTasks);
      
      const { result } = renderHook(() => useTaskStore());
      
      act(() => {
        result.current.fetchTasks();
      });
      
      expect(result.current.loading).toBe(true);
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.tasks).toEqual(mockTasks);
      expect(result.current.error).toBeNull();
      expect(taskApi.getTasks).toHaveBeenCalledWith({
        status: null,
        priority: null,
        category_id: null,
      });
    });
    
    it('should handle fetch tasks error', async () => {
      const error = new Error('Failed to fetch tasks');
      taskApi.getTasks.mockRejectedValue(error);
      
      const { result } = renderHook(() => useTaskStore());
      
      act(() => {
        result.current.fetchTasks();
      });
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.error).toBe(error.message);
    });
  });
  
  describe('createTask', () => {
    it('should create a task successfully', async () => {
      const taskData = { title: 'New Task', priority: 'high' };
      const createdTask = { id: 1, ...taskData };
      
      taskApi.createTask.mockResolvedValue(createdTask);
      
      const { result } = renderHook(() => useTaskStore());
      
      act(() => {
        result.current.createTask(taskData);
      });
      
      expect(result.current.loading).toBe(true);
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.tasks).toContainEqual(createdTask);
      expect(taskApi.createTask).toHaveBeenCalledWith(taskData);
    });
  });
  
  describe('updateTaskStatus', () => {
    it('should update task status successfully', async () => {
      // 初期状態としてタスクをセット
      const initialTasks = [
        { id: 1, title: 'Task 1', status: false },
        { id: 2, title: 'Task 2', status: false },
      ];
      
      useTaskStore.setState({ tasks: initialTasks });
      
      const updatedTask = { id: 1, title: 'Task 1', status: true };
      taskApi.updateTaskStatus.mockResolvedValue(updatedTask);
      
      const { result } = renderHook(() => useTaskStore());
      
      act(() => {
        result.current.updateTaskStatus(1, true);
      });
      
      await waitFor(() => {
        expect(result.current.tasks).toContainEqual(updatedTask);
      });
      
      expect(result.current.tasks.find(t => t.id === 2).status).toBe(false);
      expect(taskApi.updateTaskStatus).toHaveBeenCalledWith(1, true);
    });
  });
  
  describe('filters', () => {
    it('should update filters and fetch tasks', async () => {
      taskApi.getTasks.mockResolvedValue([]);
      
      const { result } = renderHook(() => useTaskStore());
      
      act(() => {
        result.current.setFilter('status', true);
      });
      
      await waitFor(() => {
        expect(result.current.filters.status).toBe(true);
      });
      
      expect(taskApi.getTasks).toHaveBeenCalledWith({
        status: true,
        priority: null,
        category_id: null,
      });
      
      jest.clearAllMocks();
      
      act(() => {
        result.current.setFilter('priority', 'high');
      });
      
      await waitFor(() => {
        expect(result.current.filters.priority).toBe('high');
      });
      
      expect(taskApi.getTasks).toHaveBeenCalledWith({
        status: true,
        priority: 'high',
        category_id: null,
      });
    });
    
    it('should clear filters and fetch tasks', async () => {
      useTaskStore.setState({
        filters: { status: true, priority: 'high', categoryId: 1 }
      });
      
      taskApi.getTasks.mockResolvedValue([]);
      
      const { result } = renderHook(() => useTaskStore());
      
      act(() => {
        result.current.clearFilters();
      });
      
      await waitFor(() => {
        expect(result.current.filters).toEqual({
          status: null,
          priority: null,
          categoryId: null,
        });
      });
      
      expect(taskApi.getTasks).toHaveBeenCalledWith({
        status: null,
        priority: null,
        category_id: null,
      });
    });
  });
});