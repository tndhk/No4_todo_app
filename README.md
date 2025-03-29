# Todo App

個人向けタスク管理Webアプリケーション。シンプルで直感的なUIを提供し、タスクの管理・整理を容易にすることを目的としています。

## 機能

- タスクの作成・編集・削除
- タスクの完了・未完了の切り替え
- タスクの優先度設定（低・中・高）
- タスクの期日設定
- カテゴリ機能によるタスクの整理
- サブタスク機能（タスクの階層化）
- 進捗管理ダッシュボード
- ダークモード対応
- レスポンシブデザイン
- ドラッグ＆ドロップでのタスク並び替え

## 技術スタック

### フロントエンド
- React
- Zustand（状態管理）
- Tailwind CSS
- React Beautiful DnD（ドラッグ＆ドロップ）
- Jest & React Testing Library（テスト）
- Cypress（E2Eテスト）

### バックエンド
- FastAPI (Python)
- SQLite（開発環境）
- PostgreSQL（本番環境）
- SQLAlchemy（ORM）
- Pydantic（バリデーション）
- Pytest（テスト）

### インフラ
- Docker / Docker Compose
- GitHub Actions（CI/CD）

## ローカル開発環境のセットアップ

### 前提条件
- Docker および Docker Compose がインストールされていること
- Git がインストールされていること

### 手順

1. リポジトリをクローン
```bash
git clone https://github.com/yourusername/todo-app.git
cd todo-app
```

2. Docker Composeでコンテナを起動
```bash
docker-compose up -d
```

3. ブラウザでアプリにアクセス
- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:8000
- API ドキュメント: http://localhost:8000/docs

### 開発モード

バックエンド開発:
```bash
# コンテナ内でコマンド実行
docker-compose exec backend bash

# テスト実行
cd app
pytest
```

フロントエンド開発:
```bash
# コンテナ内でコマンド実行
docker-compose exec frontend bash

# テスト実行
npm test

# Cypressテスト実行
npm run cypress:open
```

## テスト駆動開発（TDD）

本プロジェクトではTDDアプローチを採用しています：

1. 各機能の要件に基づくテストを先に書く
2. テストが失敗することを確認
3. テストを通過する最小限の実装を行う
4. コードをリファクタリングする
5. 1-4のサイクルを繰り返す

## フォルダ構造

```
todo-app/
├── backend/              # バックエンドコード
│   ├── app/
│   │   ├── api/          # API エンドポイント
│   │   ├── core/         # 設定、DB接続など
│   │   ├── crud/         # DBとのやり取り
│   │   ├── models/       # DB モデル
│   │   └── schemas/      # Pydantic スキーマ
│   └── tests/            # バックエンドテスト
├── frontend/             # フロントエンドコード
│   ├── public/
│   ├── src/
│   │   ├── api/          # API クライアント
│   │   ├── components/   # React コンポーネント
│   │   ├── store/        # Zustand ストア
│   │   ├── tests/        # フロントエンドテスト
│   │   └── utils/        # ユーティリティ関数
│   └── cypress/          # E2E テスト
├── docker/               # Docker 設定
├── .github/workflows/    # GitHub Actions CI/CD
└── docker-compose.yml    # Docker Compose 設定
```

## ライセンス

MIT