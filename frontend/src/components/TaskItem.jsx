import React from 'react';
import { format } from 'date-fns';
import useTaskStore from '../store/taskStore';
import useUIStore from '../store/uiStore';

export const TaskItem = ({ task }) => {
  const { updateTaskStatus, setActiveTask } = useTaskStore();
  const { openEditTaskModal } = useUIStore();
  
  // タスクの優先度に応じたスタイルを取得
  const getPriorityBadgeClass = () => {
    switch (task.priority) {
      case 'high':
        return 'priority-badge priority-badge-high';
      case 'medium':
        return 'priority-badge priority-badge-medium';
      case 'low':
        return 'priority-badge priority-badge-low';
      default:
        return 'priority-badge priority-badge-medium';
    }
  };
  
  // 日付のフォーマット
  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      return format(new Date(dateString), 'yyyy/MM/dd');
    } catch (error) {
      console.error('Invalid date format:', error);
      return null;
    }
  };
  
  // 期限切れかどうかをチェック
  const isOverdue = () => {
    if (!task.due_date || task.status) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.due_date);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  };
  
  // タスクのステータス切り替え
  const handleStatusToggle = (e) => {
    e.stopPropagation();
    updateTaskStatus(task.id, !task.status);
  };
  
  // タスク編集モーダルを開く
  const handleEditClick = () => {
    setActiveTask(task.id);
    openEditTaskModal(task);
  };
  
  return (
    <div 
      className={`task-card ${task.status ? 'opacity-70' : ''}`}
      onClick={handleEditClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {/* タスク完了チェックボックス */}
          <button
            className={`mt-1 w-5 h-5 rounded-full border ${
              task.status
                ? 'bg-primary-light border-primary-light'
                : 'border-gray-300 dark:border-gray-600'
            } flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light`}
            onClick={handleStatusToggle}
            aria-label={task.status ? "Mark as incomplete" : "Mark as complete"}
          >
            {task.status && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          
          {/* タスク情報 */}
          <div>
            <h3 className={`text-base font-medium ${
              task.status
                ? 'text-gray-500 dark:text-gray-400 line-through'
                : 'text-gray-900 dark:text-white'
            }`}>
              {task.title}
            </h3>
            
            {task.description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                {task.description}
              </p>
            )}
            
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {/* 優先度バッジ */}
              <span className={getPriorityBadgeClass()}>
                {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
              </span>
              
              {/* 期限日 */}
              {task.due_date && (
                <span className={`text-xs ${
                  isOverdue()
                    ? 'text-red-600 dark:text-red-400 font-medium'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {isOverdue() && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="inline h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                  {formatDate(task.due_date)}
                </span>
              )}
              
              {/* カテゴリがあれば表示 */}
              {task.category && (
                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                  {task.category.name}
                </span>
              )}
              
              {/* サブタスクがあれば表示 */}
              {task.subtasks && task.subtasks.length > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="inline h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  {task.subtasks.length}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};