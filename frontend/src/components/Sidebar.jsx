import React from 'react';
import useUIStore from '../store/uiStore';
import useTaskStore from '../store/taskStore';

export const Sidebar = () => {
  const { sidebarOpen, openCreateCategoryModal } = useUIStore();
  const { categories, setFilter, filters } = useTaskStore();
  
  // サイドバーが閉じている場合は何も表示しない
  if (!sidebarOpen) {
    return null;
  }
  
  return (
    <aside className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">フィルター</h2>
        </div>
        
        {/* ステータスフィルター */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">ステータス</h3>
          <div className="space-y-2">
            <button
              onClick={() => setFilter('status', null)}
              className={`w-full text-left px-3 py-2 rounded-md ${
                filters.status === null
                  ? 'bg-primary-light text-white'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              すべて
            </button>
            <button
              onClick={() => setFilter('status', false)}
              className={`w-full text-left px-3 py-2 rounded-md ${
                filters.status === false
                  ? 'bg-primary-light text-white'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              未完了
            </button>
            <button
              onClick={() => setFilter('status', true)}
              className={`w-full text-left px-3 py-2 rounded-md ${
                filters.status === true
                  ? 'bg-primary-light text-white'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              完了済み
            </button>
          </div>
        </div>
        
        {/* 優先度フィルター */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">優先度</h3>
          <div className="space-y-2">
            <button
              onClick={() => setFilter('priority', null)}
              className={`w-full text-left px-3 py-2 rounded-md ${
                filters.priority === null
                  ? 'bg-primary-light text-white'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              すべて
            </button>
            <button
              onClick={() => setFilter('priority', 'low')}
              className={`w-full text-left px-3 py-2 rounded-md ${
                filters.priority === 'low'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              低
            </button>
            <button
              onClick={() => setFilter('priority', 'medium')}
              className={`w-full text-left px-3 py-2 rounded-md ${
                filters.priority === 'medium'
                  ? 'bg-yellow-600 text-white'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              中
            </button>
            <button
              onClick={() => setFilter('priority', 'high')}
              className={`w-full text-left px-3 py-2 rounded-md ${
                filters.priority === 'high'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              高
            </button>
          </div>
        </div>
        
        {/* カテゴリフィルター */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">カテゴリ</h3>
            <button
              onClick={openCreateCategoryModal}
              className="text-primary-light hover:text-primary dark:hover:text-primary-light"
              aria-label="Add category"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={() => setFilter('categoryId', null)}
              className={`w-full text-left px-3 py-2 rounded-md ${
                filters.categoryId === null
                  ? 'bg-primary-light text-white'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              すべて
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setFilter('categoryId', category.id)}
                className={`w-full text-left px-3 py-2 rounded-md ${
                  filters.categoryId === category.id
                    ? 'bg-primary-light text-white'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};