import pytest
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.crud import task_crud, category_crud
from app.schemas.task import TaskCreate, TaskUpdate
from app.schemas.category import CategoryCreate, CategoryUpdate
from app.models.task import Task
from app.models.category import Category
from .test_models import db_session  # db_sessionフィクスチャを再利用


def test_create_category(db_session: Session):
    """カテゴリ作成CRUDのテスト"""
    category_data = CategoryCreate(name="テストカテゴリ")
    category = category_crud.create_category(db_session, category_data)
    
    assert category.name == "テストカテゴリ"
    assert category.id is not None


def test_get_category(db_session: Session):
    """カテゴリ取得CRUDのテスト"""
    # カテゴリを作成
    category_data = CategoryCreate(name="テストカテゴリ2")
    created_category = category_crud.create_category(db_session, category_data)
    
    # IDで取得
    category = category_crud.get_category(db_session, created_category.id)
    assert category is not None
    assert category.name == "テストカテゴリ2"
    
    # 存在しないIDで取得
    non_existent = category_crud.get_category(db_session, 999)
    assert non_existent is None


def test_get_categories(db_session: Session):
    """全カテゴリ取得CRUDのテスト"""
    # カテゴリを複数作成
    category_crud.create_category(db_session, CategoryCreate(name="カテゴリA"))
    category_crud.create_category(db_session, CategoryCreate(name="カテゴリB"))
    category_crud.create_category(db_session, CategoryCreate(name="カテゴリC"))
    
    # 全て取得
    categories = category_crud.get_categories(db_session)
    assert len(categories) >= 3
    # カテゴリ名を抽出
    category_names = [c.name for c in categories]
    assert "カテゴリA" in category_names
    assert "カテゴリB" in category_names
    assert "カテゴリC" in category_names


def test_update_category(db_session: Session):
    """カテゴリ更新CRUDのテスト"""
    # カテゴリを作成
    category = category_crud.create_category(db_session, CategoryCreate(name="古いカテゴリ名"))
    
    # 更新
    updated = category_crud.update_category(
        db_session,
        category.id,
        CategoryUpdate(name="新しいカテゴリ名")
    )
    
    assert updated is not None
    assert updated.name == "新しいカテゴリ名"
    
    # データベースから再取得して確認
    db_category = category_crud.get_category(db_session, category.id)
    assert db_category.name == "新しいカテゴリ名"


def test_create_task(db_session: Session):
    """タスク作成CRUDのテスト"""
    # カテゴリを作成
    category = category_crud.create_category(db_session, CategoryCreate(name="タスクテスト用"))
    
    # タスクを作成
    task_data = TaskCreate(
        title="テストタスク",
        description="これはテスト用のタスクです",
        priority="high",
        due_date=datetime.now() + timedelta(days=1),
        category_id=category.id
    )
    
    task = task_crud.create_task(db_session, task_data)
    
    assert task.title == "テストタスク"
    assert task.priority == "high"
    assert task.category_id == category.id


def test_get_tasks(db_session: Session):
    """タスク取得CRUDのテスト"""
    # カテゴリを作成
    category = category_crud.create_category(db_session, CategoryCreate(name="タスク一覧テスト用"))
    
    # タスクを複数作成
    task_crud.create_task(db_session, TaskCreate(
        title="タスク1", priority="high", category_id=category.id
    ))
    task_crud.create_task(db_session, TaskCreate(
        title="タスク2", priority="medium", category_id=category.id
    ))
    task_crud.create_task(db_session, TaskCreate(
        title="タスク3", priority="low", category_id=category.id, status=True
    ))
    
    # タスク一覧を取得
    tasks = task_crud.get_tasks(db_session)
    assert len(tasks) >= 3
    
    # フィルタリングをテスト
    high_priority_tasks = task_crud.get_tasks(db_session, priority="high")
    assert all(task.priority == "high" for task in high_priority_tasks)
    
    completed_tasks = task_crud.get_tasks(db_session, status=True)
    assert all(task.status is True for task in completed_tasks)
    
    category_tasks = task_crud.get_tasks(db_session, category_id=category.id)
    assert all(task.category_id == category.id for task in category_tasks)


def test_update_task(db_session: Session):
    """タスク更新CRUDのテスト"""
    # カテゴリを作成
    category = category_crud.create_category(db_session, CategoryCreate(name="更新テスト用"))
    
    # タスクを作成
    task = task_crud.create_task(db_session, TaskCreate(
        title="更新前タスク", 
        description="これは更新されます",
        priority="low",
        category_id=category.id
    ))
    
    # タスクを更新
    updated = task_crud.update_task(
        db_session,
        task.id,
        TaskUpdate(
            title="更新後タスク",
            description="これは更新されました",
            priority="high"
        )
    )
    
    assert updated is not None
    assert updated.title == "更新後タスク"
    assert updated.description == "これは更新されました"
    assert updated.priority == "high"
    
    # 部分更新もテスト
    partially_updated = task_crud.update_task(
        db_session,
        task.id,
        TaskUpdate(
            status=True
        )
    )
    
    assert partially_updated.status is True
    assert partially_updated.title == "更新後タスク"  # 他のフィールドは変わらない


def test_delete_task(db_session: Session):
    """タスク削除CRUDのテスト"""
    # カテゴリを作成
    category = category_crud.create_category(db_session, CategoryCreate(name="削除テスト用"))
    
    # タスクを作成
    task = task_crud.create_task(db_session, TaskCreate(
        title="削除対象タスク", 
        category_id=category.id
    ))
    
    # IDで取得できることを確認
    assert task_crud.get_task(db_session, task.id) is not None
    
    # 削除
    task_crud.delete_task(db_session, task.id)
    
    # 削除後は取得できないことを確認
    assert task_crud.get_task(db_session, task.id) is None


def test_create_subtask(db_session: Session):
    """サブタスク作成CRUDのテスト"""
    # カテゴリを作成
    category = category_crud.create_category(db_session, CategoryCreate(name="サブタスクテスト用"))
    
    # 親タスクを作成
    parent_task = task_crud.create_task(db_session, TaskCreate(
        title="親タスク", 
        category_id=category.id
    ))
    
    # サブタスクを作成
    subtask = task_crud.create_task(db_session, TaskCreate(
        title="サブタスク",
        parent_task_id=parent_task.id,
        category_id=category.id
    ))
    
    assert subtask.parent_task_id == parent_task.id
    
    # 親タスクを取得して関連するサブタスクを確認
    parent_with_subtasks = task_crud.get_task_with_subtasks(db_session, parent_task.id)
    assert len(parent_with_subtasks.subtasks) == 1
    assert parent_with_subtasks.subtasks[0].title == "サブタスク"