import React, { useState, useEffect } from 'react';
import useUIStore from '../store/uiStore';
import useTaskStore from '../store/taskStore';

export const CategoryModal = () => {
  const { closeCategoryModal, categoryModalData } = useUIStore();
  const { createCategory, updateCategory, deleteCategory } = useTaskStore();
  
  // フォームの状態
  const [name, setName] = useState('');
  // エラーメッセージ
  const [error, setError] = useState('');
  
  // 初期値のセット
  useEffect(() => {
    if (categoryModalData) {
      setName(categoryModalData.name || '');
    } else {
      setName('');
    }
  }, [categoryModalData]);
  
  // フォーム送信ハンドラ
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // バリデーション
    if (!name.trim()) {
      setError('カテゴリ名を入力してください');
      return;
    }
    
    try {
      if (categoryModalData) {
        // カテゴリ更新
        await updateCategory(categoryModalData.id, { name });
      } else {
        // カテゴリ作成
        await createCategory({ name });
      }
      
      closeCategoryModal();
    } catch (error) {
      // サーバーからのエラーメッセージがある場合はそれを表示
      if (error.response && error.response.data && error.response.data.detail) {
        setError(error.response.data.detail);
      } else {
        setError('操作に失敗しました: ' + error.message);
      }
    }
  };
  
  // カテゴリ削除ハンドラ
  const handleDelete = async () => {
    if (!window.confirm('このカテゴリを削除してもよろしいですか？このカテゴリに属するタスクがある場合、削除できません。')) {
      return;
    }
    
    try {
      await deleteCategory(categoryModalData.id);
      closeCategoryModal();
    } catch (error) {
      // 関連するタスクがある場合のエラーメッセージ
      if (error.response && error.response.data && error.response.data.detail) {
        setError(error.response.data.detail);
      } else {
        setError('削除に失敗しました: ' + error.message);
      }
    }
  };
  
  return (
    <div className="modal-backdrop" onClick={closeCategoryModal}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            {categoryModalData ? 'カテゴリの編集' : 'カテゴリの作成'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">
                {error}
              </div>
            )}
            
            {/* カテゴリ名 */}
            <div>
              <label htmlFor="name" className="form-label">カテゴリ名 *</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>
          
          <div className="modal-footer">
            {categoryModalData && (
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
              onClick={closeCategoryModal}
              className="btn btn-secondary"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {categoryModalData ? '保存' : '作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};