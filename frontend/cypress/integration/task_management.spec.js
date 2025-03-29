describe('Task Management', () => {
    // テスト前にモックサーバーをセットアップする
    beforeEach(() => {
      // サーバーレスポンスのモック化
      cy.intercept('GET', '/api/v1/tasks', { 
        statusCode: 200, 
        body: [
          { 
            id: 1, 
            title: 'テストタスク1', 
            description: 'テスト用の説明文1', 
            priority: 'high', 
            status: false, 
            due_date: '2023-12-31T00:00:00.000Z' 
          },
          { 
            id: 2, 
            title: 'テストタスク2', 
            description: 'テスト用の説明文2', 
            priority: 'medium', 
            status: true, 
            due_date: null 
          }
        ]
      }).as('getTasks');
      
      cy.intercept('GET', '/api/v1/categories', { 
        statusCode: 200, 
        body: [
          { id: 1, name: 'テストカテゴリ1' },
          { id: 2, name: 'テストカテゴリ2' }
        ]
      }).as('getCategories');
      
      cy.intercept('POST', '/api/v1/tasks', (req) => {
        req.reply({
          statusCode: 200,
          body: {
            id: 3,
            ...req.body,
            created_at: new Date().toISOString(),
            updated_at: null
          }
        });
      }).as('createTask');
      
      cy.intercept('PATCH', '/api/v1/tasks/1/status', (req) => {
        req.reply({
          statusCode: 200,
          body: {
            id: 1,
            title: 'テストタスク1',
            description: 'テスト用の説明文1',
            priority: 'high',
            status: req.body.status,
            due_date: '2023-12-31T00:00:00.000Z',
            created_at: '2023-01-01T00:00:00.000Z',
            updated_at: new Date().toISOString()
          }
        });
      }).as('updateTaskStatus');
      
      // アプリにアクセス
      cy.visit('/');
      
      // API リクエストが完了するのを待つ
      cy.wait(['@getTasks', '@getCategories']);
    });
    
    it('should display tasks correctly', () => {
      // タスク一覧が表示されていることを確認
      cy.contains('タスク一覧').should('be.visible');
      
      // タスク1が表示されていることを確認
      cy.contains('テストタスク1').should('be.visible');
      cy.contains('テスト用の説明文1').should('be.visible');
      
      // タスク2が表示されていることを確認
      cy.contains('テストタスク2').should('be.visible');
      cy.contains('テスト用の説明文2').should('be.visible');
      
      // タスク1は未完了、タスク2は完了済みであることを確認
      cy.contains('テストタスク1')
        .closest('.task-card')
        .find('button[aria-label="Mark as complete"]')
        .should('exist');
      
      cy.contains('テストタスク2')
        .closest('.task-card')
        .find('button[aria-label="Mark as incomplete"]')
        .should('exist');
    });
    
    it('should toggle task status', () => {
      // タスク1のステータスを切り替え
      cy.contains('テストタスク1')
        .closest('.task-card')
        .find('button[aria-label="Mark as complete"]')
        .click();
      
      // API リクエストが完了するのを待つ
      cy.wait('@updateTaskStatus');
      
      // タスク1が完了状態になったことを確認
      cy.contains('テストタスク1')
        .closest('.task-card')
        .find('button[aria-label="Mark as incomplete"]')
        .should('exist');
    });
    
    it('should create a new task', () => {
      // 新規タスク作成ボタンをクリック
      cy.contains('新規タスク').click();
      
      // モーダルが表示されていることを確認
      cy.contains('タスクの作成').should('be.visible');
      
      // タスク情報を入力
      cy.get('input[name="title"]').type('新しいタスク');
      cy.get('textarea[name="description"]').type('これは新しいタスクの説明です');
      cy.get('select[name="priority"]').select('high');
      
      // 作成ボタンをクリック
      cy.contains('作成').click();
      
      // API リクエストが完了するのを待つ
      cy.wait('@createTask');
      
      // 新しいタスクが一覧に追加されていることを確認
      cy.contains('新しいタスク').should('be.visible');
      cy.contains('これは新しいタスクの説明です').should('be.visible');
    });
    
    it('should filter tasks by status', () => {
      // サイドバーの「完了済み」フィルターをクリック
      cy.contains('完了済み').click();
      
      // 完了済みのタスクのみが表示されていることを確認
      cy.contains('テストタスク2').should('be.visible');
      cy.contains('テストタスク1').should('not.exist');
      
      // サイドバーの「未完了」フィルターをクリック
      cy.contains('未完了').click();
      
      // 未完了のタスクのみが表示されていることを確認
      cy.contains('テストタスク1').should('be.visible');
      cy.contains('テストタスク2').should('not.exist');
      
      // サイドバーの「すべて」フィルターをクリック
      cy.contains('すべて').first().click();
      
      // すべてのタスクが表示されていることを確認
      cy.contains('テストタスク1').should('be.visible');
      cy.contains('テストタスク2').should('be.visible');
    });
    
    it('should display dashboard statistics correctly', () => {
      // ダッシュボードが表示されていることを確認
      cy.contains('ダッシュボード').should('be.visible');
      
      // 完了タスク数が1、未完了タスク数が1であることを確認
      cy.contains('完了済み').next().contains('1');
      cy.contains('未完了').next().contains('1');
      
      // 優先度別のタスク数が正しいことを確認
      cy.contains('高').parent().contains('1');
      cy.contains('中').parent().contains('1');
      cy.contains('低').parent().contains('0');
    });
    
    it('should toggle dark mode', () => {
      // 初期状態ではライトモード
      cy.get('body').should('not.have.class', 'dark');
      
      // ダークモードトグルをクリック
      cy.get('button[aria-label="Toggle dark mode"]').click();
      
      // ダークモードになったことを確認
      cy.get('html').should('have.class', 'dark');
      
      // 再度ダークモードトグルをクリック
      cy.get('button[aria-label="Toggle dark mode"]').click();
      
      // ライトモードに戻ったことを確認
      cy.get('html').should('not.have.class', 'dark');
    });
  });