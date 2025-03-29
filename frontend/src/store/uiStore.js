import { create } from 'zustand';

// UI状態管理用のストア
const useUIStore = create((set) => ({
  // 状態
  sidebarOpen: true,
  darkMode: false,
  taskModalOpen: false,
  taskModalMode: 'create', // create, edit
  taskModalData: null,
  categoryModalOpen: false,
  categoryModalData: null,
  
  // サイドバー表示/非表示トグル
  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
  
  // ダークモードトグル
  toggleDarkMode: () => {
    set(state => {
      const newDarkMode = !state.darkMode;
      
      // bodyタグにdarkクラスを追加/削除
      if (newDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // ローカルストレージに保存
      localStorage.setItem('darkMode', newDarkMode);
      
      return { darkMode: newDarkMode };
    });
  },
  
  // ローカルストレージからダークモード設定を読み込む
  initializeDarkMode: () => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    
    // システム設定のダークモード検出
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // ローカルストレージの設定がなければシステム設定を使用
    const darkMode = savedDarkMode !== null ? savedDarkMode : prefersDarkMode;
    
    // bodyタグにdarkクラスを追加
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
    
    set({ darkMode });
  },
  
  // タスクモーダル関連
  openCreateTaskModal: (initialData = {}) => {
    set({ 
      taskModalOpen: true, 
      taskModalMode: 'create',
      taskModalData: initialData
    });
  },
  
  openEditTaskModal: (task) => {
    set({ 
      taskModalOpen: true, 
      taskModalMode: 'edit',
      taskModalData: task
    });
  },
  
  closeTaskModal: () => {
    set({ 
      taskModalOpen: false,
      taskModalData: null
    });
  },
  
  // カテゴリモーダル関連
  openCreateCategoryModal: () => {
    set({ 
      categoryModalOpen: true,
      categoryModalData: null
    });
  },
  
  openEditCategoryModal: (category) => {
    set({ 
      categoryModalOpen: true,
      categoryModalData: category
    });
  },
  
  closeCategoryModal: () => {
    set({ 
      categoryModalOpen: false,
      categoryModalData: null
    });
  }
}));

export default useUIStore;