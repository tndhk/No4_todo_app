import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TaskItem } from '../components/TaskItem';
import useTaskStore from '../store/taskStore';
import useUIStore from '../store/uiStore';

// ストアのモック化
jest.mock('../store/taskStore', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../store/uiStore', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('TaskItem', () => {
  const mockTask = {
    id: 1,
    title: 'Test Task',
    description: 'This is a test task',
    priority: 'high',
    due_date: '2023-01-01T00:00:00.000Z',
    status: false,
  };
  
  const mockUpdateTaskStatus = jest.fn();
  const mockSetActiveTask = jest.fn();
  const mockOpenEditTaskModal = jest.fn();
  
  beforeEach(() => {
    useTaskStore.mockReturnValue({
      updateTaskStatus: mockUpdateTaskStatus,
      setActiveTask: mockSetActiveTask,
    });
    
    useUIStore.mockReturnValue({
      openEditTaskModal: mockOpenEditTaskModal,
    });
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders task details correctly', () => {
    render(<TaskItem task={mockTask} />);
    
    // タスクのタイトルが表示されていることを確認
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    
    // タスクの説明が表示されていることを確認
    expect(screen.getByText('This is a test task')).toBeInTheDocument();
    
    // 優先度が表示されていることを確認
    expect(screen.getByText('高')).toBeInTheDocument();
    
    // 期限日が表示されていることを確認
    expect(screen.getByText('2023/01/01')).toBeInTheDocument();
  });
  
  it('calls updateTaskStatus when checkbox is clicked', () => {
    render(<TaskItem task={mockTask} />);
    
    // チェックボックスをクリック
    const checkbox = screen.getByRole('button', { name: /Mark as complete/i });
    fireEvent.click(checkbox);
    
    // updateTaskStatusが呼ばれることを確認
    expect(mockUpdateTaskStatus).toHaveBeenCalledWith(mockTask.id, true);
  });
  
  it('calls setActiveTask and openEditTaskModal when task card is clicked', () => {
    render(<TaskItem task={mockTask} />);
    
    // タスクカードをクリック
    const taskCard = screen.getByText('Test Task').closest('.task-card');
    fireEvent.click(taskCard);
    
    // setActiveTaskとopenEditTaskModalが呼ばれることを確認
    expect(mockSetActiveTask).toHaveBeenCalledWith(mockTask.id);
    expect(mockOpenEditTaskModal).toHaveBeenCalledWith(mockTask);
  });
  
  it('renders completed task with line-through style', () => {
    const completedTask = { ...mockTask, status: true };
    render(<TaskItem task={completedTask} />);
    
    // 完了タスクのタイトルに取り消し線スタイルが適用されていることを確認
    const titleElement = screen.getByText('Test Task');
    expect(titleElement).toHaveClass('line-through');
    
    // チェックマークアイコンが表示されていることを確認
    const checkboxWithIcon = screen.getByRole('button', { name: /Mark as incomplete/i });
    const svg = checkboxWithIcon.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
  
  it('applies proper style for overdue task', () => {
    // 期限切れのタスク（過去の日付）
    const overdueTask = {
      ...mockTask,
      due_date: '2020-01-01T00:00:00.000Z', // 過去の日付
    };
    
    render(<TaskItem task={overdueTask} />);
    
    // 期限日が赤色で表示されていることを確認（クラス名で判断）
    const dateElement = screen.getByText('2020/01/01');
    expect(dateElement).toHaveClass('text-red-600');
    
    // 警告アイコンが表示されていることを確認
    const svg = dateElement.parentElement.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});