import React, { useState, useEffect } from 'react';
import useUIStore from '../store/uiStore';
import useTaskStore from '../store/taskStore';
import { format } from 'date-fns';

export const TaskModal = () => {
  const { closeTaskModal, taskModalMode, taskModalData } = useUIStore();
  const { createTask, updateTask, deleteTask, categories, tasks } = useTaskStore();
  
  // フォームの状態
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
    status: false,
    order_index: 0,
    category_id: null,
    parent_task_id: null
  });
  
  // エラーメッセージ
  const [error, setError] = useState('');
  
  // 初期値のセット
  useEffect(() => {
    if (taskModalMode === 'edit' && taskModalData) {
      // 日付のフォーマット
      let formattedDueDate = '';
      if (taskModalData.due_date) {
        try {
          formattedDueDate = format(new Date(taskModalData.due_date), 'yyyy-MM-dd');
        } catch (e) {
          console.error('Invalid date:', e);
        }
      }
      
      setFormData({
        title: taskModalData.title || '',
        description: taskModalData.description || '',
        priority: taskModalData.priority || 'medium',
        due_date: formattedDueDate,
        status: taskModalData.status || false,
        order_index: taskModalData.order_index || 0,
        category_id: taskModalData.category_id || null,
        parent_task_id: taskModalData.parent_task_id || null
      });
    } else if (taskModalMode === 'create' && taskModalData) {
      // 新規作成時に初期値がある場合（例：親タスクIDなど）
      setFormData(prev => ({
        ...prev,
        ...taskModalData
      }));
    }
  }, [taskModalMode, taskModalData]);
  
  // 入力値の変更ハンドラ
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? (name === 'category_id' || name === 'parent_task_id' ? null : '') : value
    }));
  };
  
  // フォーム送信ハンドラ
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 安全なデータのみをログに出力（循環参照を避ける）
    console.log('フォーム送信:', {
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      due_date: formData.due_date,
      category_id: formData.category_id,
      parent_task_id: formData.parent_task_id
    });
    
    // バリデーション
    if (!formData.title.trim()) {
      setError('タイトルを入力してください');
      return;
    }
    
    try {
      console.log('API呼び出し開始', taskModalMode);
      
    // 純粋なデータオブジェクトを作成（DOMノードなどを除外）
    const cleanedTaskData = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
      status: false, // 新規作成時は未完了
      order_index: 0, // デフォルト値
      category_id: formData.category_id === '' || formData.category_id === null 
        ? null 
        : Number(formData.category_id),
      parent_task_id: formData.parent_task_id === '' || formData.parent_task_id === null 
        ? null 
        : Number(formData.parent_task_id)
    };
      
      console.log('タスク作成データ:', cleanedTaskData);
      
      if (taskModalMode === 'create') {
        // タスク作成
        await createTask(cleanedTaskData);
      } else {
        // タスク更新
        await updateTask(taskModalData.id, cleanedTaskData);
      }
      
      closeTaskModal();
    } catch (error) {
      console.error('タスク作成/更新エラー:', error.toString());
      setError('操作に失敗しました: ' + error.toString());
    }
  };
  
  // タスク削除ハンドラ
  const handleDelete = async () => {
    if (!window.confirm('このタスクを削除してもよろしいですか？')) {
      return;
    }
    
    try {
      await deleteTask(taskModalData.id);
      closeTaskModal();
    } catch (error) {
      setError('削除に失敗しました: ' + error.message);
    }
  };
  
  // 親タスク候補リストを生成（現在のタスク自身と子タスクを除く）
  const getParentTaskOptions = () => {
    if (taskModalMode === 'create') {
      return tasks;
    }
    
    // 編集モードの場合、自分自身と子孫タスクは選択できないようにする
    const currentTaskId = taskModalData.id;
    
    // 子孫タスクのIDを再帰的に収集する関数
    const collectDescendantIds = (taskId) => {
      const directChildren = tasks.filter(t => t.parent_task_id === taskId);
      let allDescendants = [taskId];
      
      directChildren.forEach(child => {
        allDescendants = [...allDescendants, ...collectDescendantIds(child.id)];
      });
      
      return allDescendants;
    };
    
    const excludeIds = collectDescendantIds(currentTaskId);
    
    return tasks.filter(task => !excludeIds.includes(task.id));
  };
  
  return (
    <div className="modal-backdrop" onClick={closeTaskModal}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            {taskModalMode === 'create' ? 'タスクの作成' : 'タスクの編集'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">
                {error}
              </div>
            )}
            
            {/* タイトル */}
            <div className="mb-4">
              <label htmlFor="title" className="form-label">タイトル *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            
            {/* 説明 */}
            <div className="mb-4">
              <label htmlFor="description" className="form-label">説明</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="form-input"
              ></textarea>
            </div>
            
            {/* 優先度 */}
            <div className="mb-4">
              <label htmlFor="priority" className="form-label">優先度</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="form-select"
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
            </div>
            
            {/* 期限日 */}
            <div className="mb-4">
              <label htmlFor="due_date" className="form-label">期限日</label>
              <input
                type="date"
                id="due_date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            
            {/* カテゴリ */}
            <div className="mb-4">
              <label htmlFor="category_id" className="form-label">カテゴリ</label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id || ''}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">カテゴリなし</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* 親タスク */}
            <div className="mb-4">
              <label htmlFor="parent_task_id" className="form-label">親タスク</label>
              <select
                id="parent_task_id"
                name="parent_task_id"
                value={formData.parent_task_id || ''}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">親タスクなし</option>
                {getParentTaskOptions().map(task => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="modal-footer">
            {taskModalMode === 'edit' && (
              <button
                type="button"
                onClick={handleDelete}
                className="btn btn-danger"
              >
                削除
              </button>
            )}
            <button
              type="button"
              onClick={closeTaskModal}
              className="btn btn-secondary"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {taskModalMode === 'create' ? '作成' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};