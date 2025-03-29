import React, { useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { TaskList } from './components/TaskList';
import { Dashboard } from './components/Dashboard';
import { TaskModal } from './components/TaskModal';
import { CategoryModal } from './components/CategoryModal';
import useTaskStore from './store/taskStore';
import useUIStore from './store/uiStore';

const App = () => {
  const { fetchTasks, fetchCategories } = useTaskStore();
  const { initializeDarkMode, taskModalOpen, categoryModalOpen } = useUIStore();
  
  // 初期データ読み込みとダークモード初期化
  useEffect(() => {
    initializeDarkMode();
    fetchTasks();
    fetchCategories();
  }, [initializeDarkMode, fetchTasks, fetchCategories]);
  
  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-auto p-4">
          <Dashboard />
          <TaskList />
        </main>
      </div>
      
      {taskModalOpen && <TaskModal />}
      {categoryModalOpen && <CategoryModal />}
    </div>
  );
};

export default App;