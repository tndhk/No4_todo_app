import React, { useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import useTaskStore from '../store/taskStore';
import { TaskItem } from './TaskItem';

export const TaskList = () => {
  const { tasks, fetchTasks, reorderTasks, filters } = useTaskStore();
  
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);
  
  // フィルター適用中のラベルを生成
  const getFilterLabel = () => {
    const labels = [];
    
    if (filters.status === true) {
      labels.push('完了済み');
    } else if (filters.status === false) {
      labels.push('未完了');
    }
    
    if (filters.priority) {
      const priorityLabels = {
        high: '高優先度',
        medium: '中優先度',
        low: '低優先度'
      };
      labels.push(priorityLabels[filters.priority]);
    }
    
    return labels.length > 0 ? `(${labels.join(', ')})` : '';
  };
  
  // ドラッグ終了時の処理
  const handleDragEnd = (result) => {
    const { destination, source } = result;
    
    // ドロップ先がない場合や同じ位置の場合は何もしない
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }
    
    // タスクの並び替え
    const reorderedTasks = Array.from(tasks);
    const [removed] = reorderedTasks.splice(source.index, 1);
    reorderedTasks.splice(destination.index, 0, removed);
    
    // 並び替え後のタスクIDリストを作成し、APIに送信
    const taskIds = reorderedTasks.map(task => task.id);
    reorderTasks(taskIds);
  };
  
  // タスクが存在しない場合
  if (tasks.length === 0) {
    return (
      <div className="mt-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
          タスク一覧 {getFilterLabel()}
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center border border-gray-200 dark:border-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-600 dark:text-gray-300">タスクが見つかりません。</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            新しいタスクを作成するか、フィルター条件を変更してください。
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mt-4">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
        タスク一覧 {getFilterLabel()}
      </h2>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="tasks">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-3"
            >
              {tasks.map((task, index) => (
                <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <TaskItem task={task} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};