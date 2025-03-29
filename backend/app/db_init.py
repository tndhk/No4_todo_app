from app.core.database import Base, engine
from app.models.task import Task
from app.models.category import Category
from app.schemas.category import CategoryCreate
from app.schemas.task import TaskCreate
from app.crud import category_crud, task_crud
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
import datetime

# データベースのテーブルを作成
def create_tables():
    print("データベーステーブルを作成しています...")
    Base.metadata.create_all(bind=engine)
    print("テーブル作成完了")

# 初期データを投入する
def create_initial_data():
    print("初期データを投入しています...")
    db = SessionLocal()
    try:
        # カテゴリデータ
        categories = [
            {"name": "仕事"},
            {"name": "プライベート"},
            {"name": "勉強"},
            {"name": "買い物"}
        ]
        
        created_categories = []
        for cat_data in categories:
            # 既存のカテゴリがなければ作成
            existing = db.query(Category).filter(Category.name == cat_data["name"]).first()
            if not existing:
                category = category_crud.create_category(db, CategoryCreate(**cat_data))
                created_categories.append(category)
                print(f"カテゴリ '{category.name}' を作成しました。")
            else:
                print(f"カテゴリ '{cat_data['name']}' は既に存在します。")
        
        # タスクデータ
        if created_categories:
            work_category = next((c for c in created_categories if c.name == "仕事"), None)
            study_category = next((c for c in created_categories if c.name == "勉強"), None)
            
            today = datetime.datetime.now()
            tomorrow = today + datetime.timedelta(days=1)
            next_week = today + datetime.timedelta(days=7)
            
            # サンプルタスク
            tasks = [
                {
                    "title": "アプリの開発",
                    "description": "ToDo アプリの開発をする",
                    "priority": "high",
                    "due_date": tomorrow,
                    "category_id": work_category.id if work_category else None
                },
                {
                    "title": "ミーティングの準備",
                    "description": "明日のミーティング資料を作成する",
                    "priority": "medium",
                    "due_date": today,
                    "category_id": work_category.id if work_category else None
                },
                {
                    "title": "Python学習",
                    "description": "FastAPIのチュートリアルを完了させる",
                    "priority": "medium",
                    "due_date": next_week,
                    "category_id": study_category.id if study_category else None
                }
            ]
            
            for task_data in tasks:
                task = task_crud.create_task(db, TaskCreate(**task_data))
                print(f"タスク '{task.title}' を作成しました。")
        
        print("初期データ投入完了")
        
    finally:
        db.close()

if __name__ == "__main__":
    create_tables()
    create_initial_data()