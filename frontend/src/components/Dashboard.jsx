import React, { useMemo } from 'react';
import useTaskStore from '../store/taskStore';

export const Dashboard = () => {
  const { tasks } = useTaskStore();
  
  // タスクの統計情報を計算
  const stats = useMemo(() => {
    const completedTasks = tasks.filter(task => task.status).length;
    const incompleteTasks = tasks.length - completedTasks;
    
    const highPriorityTasks = tasks.filter(task => task.priority === 'high').length;
    const mediumPriorityTasks = tasks.filter(task => task.priority === 'medium').length;
    const lowPriorityTasks = tasks.filter(task => task.priority === 'low').length;
    
    // 今日期限のタスク
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayDueTasks = tasks.filter(task => {
      if (!task.due_date) return false;
      const dueDate = new Date(task.due_date);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime() && !task.status;
    }).length;
    
    // 期限切れのタスク
    const overdueTasks = tasks.filter(task => {
      if (!task.due_date) return false;
      const dueDate = new Date(task.due_date);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today && !task.status;
    }).length;
    
    return {
      completedTasks,
      incompleteTasks,
      highPriorityTasks,
      mediumPriorityTasks,
      lowPriorityTasks,
      todayDueTasks,
      overdueTasks
    };
  }, [tasks]);
  
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">ダッシュボード</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* タスク完了状況 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">タスク進捗</h3>
          <div className="flex justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completedTasks}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">完了済み</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.incompleteTasks}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">未完了</p>
            </div>
          </div>
          {/* シンプルなプログレスバー */}
          {tasks.length > 0 && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-primary-light h-2.5 rounded-full"
                  style={{ width: `${(stats.completedTasks / tasks.length) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-right mt-1 text-gray-500 dark:text-gray-400">
                {Math.round((stats.completedTasks / tasks.length) * 100)}% 完了
              </p>
            </div>
          )}
        </div>
        
        {/* 優先度別タスク数 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">優先度別タスク</h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="inline-block w-3 h-3 rounded-full bg-priority-low mb-1"></div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.lowPriorityTasks}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">低</p>
            </div>
            <div className="text-center">
              <div className="inline-block w-3 h-3 rounded-full bg-priority-medium mb-1"></div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.mediumPriorityTasks}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">中</p>
            </div>
            <div className="text-center">
              <div className="inline-block w-3 h-3 rounded-full bg-priority-high mb-1"></div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.highPriorityTasks}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">高</p>
            </div>
          </div>
        </div>
        
        {/* 今日期限のタスク */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">今日期限のタスク</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.todayDueTasks}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">残り</p>
        </div>
        
        {/* 期限切れタスク */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">期限切れタスク</h3>
          <p className={`text-2xl font-bold ${stats.overdueTasks > 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
            {stats.overdueTasks}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">未完了</p>
        </div>
      </div>
    </div>
  );
};