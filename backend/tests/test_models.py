import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta

from app.core.database import Base
from app.models.task import Task
from app.models.category import Category


# テスト用のデータベース設定
TEST_SQLALCHEMY_DATABASE_URL = "sqlite:///./test_todo.db"
engine = create_engine(
    TEST_SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    # テスト用のデータベースを作成
    Base.metadata.create_all(bind=engine)
    
    # セッションを作成
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
    
    # テスト後にテーブルを削除
    Base.metadata.drop_all(bind=engine)


def test_create_category(db_session):
    """カテゴリの作成と取得をテスト"""
    # カテゴリを作成
    category = Category(name="仕事")
    db_session.add(category)
    db_session.commit()
    
    # データベースから取得して検証
    db_category = db_session.query(Category).filter(Category.name == "仕事").first()
    assert db_category is not None
    assert db_category.name == "仕事"


def test_create_task(db_session):
    """タスクの作成と取得をテスト"""
    # カテゴリを作成
    category = Category(name="個人")
    db_session.add(category)
    db_session.commit()
    
    # タスクを作成
    due_date = datetime.now() + timedelta(days=1)
    task = Task(
        title="テストタスク",
        description="これはテスト用のタスクです",
        priority="high",
        due_date=due_date,
        status=False,  # 未完了
        order_index=1,
        category_id=category.id,
        parent_task_id=None,  # サブタスクではない
    )
    db_session.add(task)
    db_session.commit()
    
    # データベースから取得して検証
    db_task = db_session.query(Task).filter(Task.title == "テストタスク").first()
    assert db_task is not None
    assert db_task.title == "テストタスク"
    assert db_task.priority == "high"
    assert db_task.status is False
    assert db_task.category_id == category.id


def test_create_subtask(db_session):
    """親タスクとサブタスクの関係をテスト"""
    # カテゴリを作成
    category = Category(name="プロジェクト")
    db_session.add(category)
    db_session.commit()
    
    # 親タスクを作成
    parent_task = Task(
        title="親タスク",
        description="これは親タスクです",
        priority="medium",
        due_date=datetime.now() + timedelta(days=7),
        status=False,
        order_index=1,
        category_id=category.id,
    )
    db_session.add(parent_task)
    db_session.commit()
    
    # サブタスクを作成
    subtask = Task(
        title="サブタスク",
        description="これはサブタスクです",
        priority="low",
        due_date=datetime.now() + timedelta(days=3),
        status=False,
        order_index=1,
        category_id=category.id,
        parent_task_id=parent_task.id,
    )
    db_session.add(subtask)
    db_session.commit()
    
    # 関係を検証
    db_subtask = db_session.query(Task).filter(Task.title == "サブタスク").first()
    assert db_subtask is not None
    assert db_subtask.parent_task_id == parent_task.id


def test_task_relationships(db_session):
    """タスクとカテゴリのリレーションシップをテスト"""
    # カテゴリを作成
    category = Category(name="勉強")
    db_session.add(category)
    db_session.commit()
    
    # タスクを作成
    task = Task(
        title="Pythonの勉強",
        description="Pythonの基礎を学ぶ",
        priority="medium",
        due_date=datetime.now() + timedelta(days=5),
        status=False,
        order_index=1,
        category_id=category.id,
    )
    db_session.add(task)
    db_session.commit()
    
    # リレーションシップを検証
    db_task = db_session.query(Task).filter(Task.title == "Pythonの勉強").first()
    assert db_task is not None
    assert db_task.category.name == "勉強"