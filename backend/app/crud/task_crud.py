from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate


def get_task(db: Session, task_id: int) -> Optional[Task]:
    """指定されたIDのタスクを取得する"""
    return db.query(Task).filter(Task.id == task_id).first()


def get_task_with_subtasks(db: Session, task_id: int) -> Optional[Task]:
    """サブタスクを含むタスクを取得する"""
    return db.query(Task).filter(Task.id == task_id).first()


def get_tasks(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    status: Optional[bool] = None,
    priority: Optional[str] = None,
    category_id: Optional[int] = None,
    parent_task_id: Optional[int] = None
) -> List[Task]:
    """
    タスク一覧を取得する
    フィルタリングオプション:
    - status: 完了/未完了
    - priority: 優先度
    - category_id: カテゴリID
    - parent_task_id: 親タスクID (Noneの場合はルートタスクのみ)
    """
    query = db.query(Task)
    
    # フィルタリング条件を適用
    if status is not None:
        query = query.filter(Task.status == status)
    
    if priority is not None:
        query = query.filter(Task.priority == priority)
    
    if category_id is not None:
        query = query.filter(Task.category_id == category_id)
    
    if parent_task_id is not None:
        query = query.filter(Task.parent_task_id == parent_task_id)
    elif parent_task_id is None:
        # 親タスクIDが指定されていない場合はルートタスクのみを取得
        pass
    
    # 並び順はorder_indexを優先し、次にdue_date、最後にcreated_atで並べる
    query = query.order_by(Task.order_index, Task.due_date, Task.created_at)
    
    return query.offset(skip).limit(limit).all()


def create_task(db: Session, task: TaskCreate) -> Task:
    """タスクを作成する"""
    db_task = Task(
        title=task.title,
        description=task.description,
        priority=task.priority,
        due_date=task.due_date,
        status=task.status,
        order_index=task.order_index,
        category_id=task.category_id,
        parent_task_id=task.parent_task_id,
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def update_task(db: Session, task_id: int, task_update: TaskUpdate) -> Optional[Task]:
    """タスクを更新する"""
    db_task = get_task(db, task_id)
    if db_task is None:
        return None
    
    # モデル辞書に変換し、Noneでないフィールドのみを更新
    update_data = task_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_task, key, value)
    
    db.commit()
    db.refresh(db_task)
    return db_task


def update_task_status(db: Session, task_id: int, status: bool) -> Optional[Task]:
    """タスクのステータスを更新する"""
    db_task = get_task(db, task_id)
    if db_task is None:
        return None
    
    db_task.status = status
    db.commit()
    db.refresh(db_task)
    return db_task


def delete_task(db: Session, task_id: int) -> bool:
    """タスクを削除する"""
    db_task = get_task(db, task_id)
    if db_task is None:
        return False
    
    db.delete(db_task)
    db.commit()
    return True


def reorder_tasks(db: Session, task_ids: List[int]) -> List[Task]:
    """タスクの並び順を更新する"""
    tasks = []
    for index, task_id in enumerate(task_ids):
        db_task = get_task(db, task_id)
        if db_task:
            db_task.order_index = index
            tasks.append(db_task)
    
    db.commit()
    return tasks