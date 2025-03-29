from fastapi.testclient import TestClient
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta

from app.core.database import Base, get_db
from app.main import app
from app.models.task import Task
from app.models.category import Category


# テスト用のデータベース設定
TEST_SQLALCHEMY_DATABASE_URL = "sqlite:///./test_api.db"
engine = create_engine(
    TEST_SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# テスト用DB依存関係のオーバーライド
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="module")
def client():
    # テスト用のデータベースを作成
    Base.metadata.create_all(bind=engine)
    
    # テストクライアントを作成
    with TestClient(app) as test_client:
        yield test_client
    
    # テスト後にテーブルを削除
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="module")
def db():
    # テスト用のデータベースセッション
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_create_category(client, db):
    """カテゴリ作成APIのテスト"""
    response = client.post(
        "/api/v1/categories/",
        json={"name": "APIテスト用カテゴリ"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "APIテスト用カテゴリ"
    assert "id" in data

    # データベースに正しく保存されたか確認
    db_category = db.query(Category).filter(Category.name == "APIテスト用カテゴリ").first()
    assert db_category is not None
    assert db_category.name == "APIテスト用カテゴリ"


def test_get_categories(client, db):
    """カテゴリ一覧取得APIのテスト"""
    # いくつかのカテゴリを追加
    client.post("/api/v1/categories/", json={"name": "カテゴリA"})
    client.post("/api/v1/categories/", json={"name": "カテゴリB"})
    
    response = client.get("/api/v1/categories/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2
    
    # 作成したカテゴリが含まれているか確認
    category_names = [cat["name"] for cat in data]
    assert "カテゴリA" in category_names
    assert "カテゴリB" in category_names


def test_create_task(client, db):
    """タスク作成APIのテスト"""
    # カテゴリを作成
    category_response = client.post(
        "/api/v1/categories/",
        json={"name": "タスクAPIテスト用"}
    )
    category_id = category_response.json()["id"]
    
    # タスクを作成
    due_date = (datetime.now() + timedelta(days=1)).isoformat()
    response = client.post(
        "/api/v1/tasks/",
        json={
            "title": "APIテスト用タスク",
            "description": "これはAPIテスト用のタスクです",
            "priority": "high",
            "due_date": due_date,
            "category_id": category_id
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "APIテスト用タスク"
    assert data["priority"] == "high"
    assert data["category_id"] == category_id
    
    # データベースに正しく保存されたか確認
    db_task = db.query(Task).filter(Task.title == "APIテスト用タスク").first()
    assert db_task is not None
    assert db_task.description == "これはAPIテスト用のタスクです"


def test_get_tasks(client, db):
    """タスク一覧取得APIのテスト"""
    # カテゴリを作成
    category_response = client.post(
        "/api/v1/categories/",
        json={"name": "タスク一覧テスト用"}
    )
    category_id = category_response.json()["id"]
    
    # タスクを作成
    client.post(
        "/api/v1/tasks/",
        json={
            "title": "タスク1",
            "priority": "high",
            "category_id": category_id
        }
    )
    client.post(
        "/api/v1/tasks/",
        json={
            "title": "タスク2",
            "priority": "medium",
            "category_id": category_id
        }
    )
    
    # タスク一覧を取得
    response = client.get("/api/v1/tasks/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2
    
    # フィルタリングをテスト
    # 優先度で絞り込み
    response = client.get(f"/api/v1/tasks/?priority=high")
    assert response.status_code == 200
    data = response.json()
    assert all(task["priority"] == "high" for task in data)
    
    # カテゴリで絞り込み
    response = client.get(f"/api/v1/tasks/?category_id={category_id}")
    assert response.status_code == 200
    data = response.json()
    assert all(task["category_id"] == category_id for task in data)


def test_update_task(client, db):
    """タスク更新APIのテスト"""
    # タスクを作成
    task_response = client.post(
        "/api/v1/tasks/",
        json={"title": "更新前のタスク", "priority": "low"}
    )
    task_id = task_response.json()["id"]
    
    # タスクを更新
    response = client.put(
        f"/api/v1/tasks/{task_id}",
        json={
            "title": "更新後のタスク",
            "priority": "high",
            "description": "説明を追加"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "更新後のタスク"
    assert data["priority"] == "high"
    assert data["description"] == "説明を追加"


def test_update_task_status(client, db):
    """タスクステータス更新APIのテスト"""
    # タスクを作成
    task_response = client.post(
        "/api/v1/tasks/",
        json={"title": "ステータステスト", "status": False}
    )
    task_id = task_response.json()["id"]
    
    # ステータスを更新（完了に）
    response = client.patch(
        f"/api/v1/tasks/{task_id}/status",
        json={"status": True}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] is True
    
    # ステータスを再度更新（未完了に）
    response = client.patch(
        f"/api/v1/tasks/{task_id}/status",
        json={"status": False}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] is False


def test_delete_task(client, db):
    """タスク削除APIのテスト"""
    # タスクを作成
    task_response = client.post(
        "/api/v1/tasks/",
        json={"title": "削除対象タスク"}
    )
    task_id = task_response.json()["id"]
    
    # 作成できたか確認
    response = client.get(f"/api/v1/tasks/{task_id}")
    assert response.status_code == 200
    
    # 削除
    response = client.delete(f"/api/v1/tasks/{task_id}")
    assert response.status_code == 200
    
    # 削除後は404になることを確認
    response = client.get(f"/api/v1/tasks/{task_id}")
    assert response.status_code == 404


def test_create_subtask(client, db):
    """サブタスク作成APIのテスト"""
    # 親タスクを作成
    parent_response = client.post(
        "/api/v1/tasks/",
        json={"title": "親タスク"}
    )
    parent_id = parent_response.json()["id"]
    
    # サブタスクを作成
    response = client.post(
        "/api/v1/tasks/",
        json={
            "title": "サブタスク",
            "parent_task_id": parent_id
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "サブタスク"
    assert data["parent_task_id"] == parent_id
    
    # 親タスクを詳細取得して、サブタスクが含まれているか確認
    response = client.get(f"/api/v1/tasks/{parent_id}/subtasks")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data["subtasks"], list)
    assert len(data["subtasks"]) >= 1
    assert any(subtask["title"] == "サブタスク" for subtask in data["subtasks"])