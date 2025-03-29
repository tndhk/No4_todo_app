from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.crud import task_crud, category_crud
from app.schemas.task import Task, TaskCreate, TaskUpdate, TaskWithSubtasks, TaskStatusUpdate

router = APIRouter()


@router.get("/", response_model=List[Task])
def read_tasks(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    status: Optional[bool] = None,
    priority: Optional[str] = None,
    category_id: Optional[int] = None,
    parent_task_id: Optional[int] = None,
):
    """
    タスク一覧を取得する
    - **status**: タスクのステータス（完了/未完了）でフィルタリング
    - **priority**: 優先度（low/medium/high）でフィルタリング
    - **category_id**: カテゴリIDでフィルタリング
    - **parent_task_id**: 親タスクIDでフィルタリング（指定しない場合はルートタスクのみ取得）
    """
    tasks = task_crud.get_tasks(
        db, 
        skip=skip, 
        limit=limit,
        status=status,
        priority=priority,
        category_id=category_id,
        parent_task_id=parent_task_id
    )
    return tasks


@router.post("/", response_model=Task)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    """
    新しいタスクを作成する
    - **title**: タスクのタイトル（必須）
    - **description**: タスクの詳細説明
    - **priority**: 優先度（low/medium/high）
    - **due_date**: 期限
    - **status**: 完了ステータス（デフォルトはFalse）
    - **category_id**: カテゴリID
    - **parent_task_id**: 親タスクID（サブタスクの場合）
    """
    # カテゴリIDが指定されている場合は存在確認
    if task.category_id is not None:
        db_category = category_crud.get_category(db, task.category_id)
        if db_category is None:
            raise HTTPException(status_code=404, detail="Category not found")
    
    # 親タスクIDが指定されている場合は存在確認
    if task.parent_task_id is not None:
        parent_task = task_crud.get_task(db, task.parent_task_id)
        if parent_task is None:
            raise HTTPException(status_code=404, detail="Parent task not found")
    
    return task_crud.create_task(db=db, task=task)


@router.get("/{task_id}", response_model=Task)
def read_task(task_id: int, db: Session = Depends(get_db)):
    """
    指定されたIDのタスクを取得する
    """
    db_task = task_crud.get_task(db, task_id=task_id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task


@router.get("/{task_id}/subtasks", response_model=TaskWithSubtasks)
def read_task_with_subtasks(task_id: int, db: Session = Depends(get_db)):
    """
    指定されたIDのタスクとそのサブタスクを取得する
    """
    db_task = task_crud.get_task_with_subtasks(db, task_id=task_id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task


@router.put("/{task_id}", response_model=Task)
def update_task(task_id: int, task: TaskUpdate, db: Session = Depends(get_db)):
    """
    タスクを更新する
    """
    # タスクの存在確認
    db_task = task_crud.get_task(db, task_id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # カテゴリIDが指定されている場合は存在確認
    if task.category_id is not None:
        db_category = category_crud.get_category(db, task.category_id)
        if db_category is None:
            raise HTTPException(status_code=404, detail="Category not found")
    
    # 親タスクIDが指定されている場合は存在確認
    if task.parent_task_id is not None:
        parent_task = task_crud.get_task(db, task.parent_task_id)
        if parent_task is None:
            raise HTTPException(status_code=404, detail="Parent task not found")
        
        # 自分自身を親にはできない
        if parent_task.id == task_id:
            raise HTTPException(status_code=400, detail="Task cannot be its own parent")
    
    updated_task = task_crud.update_task(db=db, task_id=task_id, task_update=task)
    return updated_task


@router.patch("/{task_id}/status", response_model=Task)
def update_task_status(task_id: int, status_update: TaskStatusUpdate, db: Session = Depends(get_db)):
    """
    タスクのステータスを更新する
    """
    db_task = task_crud.get_task(db, task_id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    updated_task = task_crud.update_task_status(db=db, task_id=task_id, status=status_update.status)
    return updated_task


@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    """
    タスクを削除する
    """
    db_task = task_crud.get_task(db, task_id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task_crud.delete_task(db=db, task_id=task_id)
    return {"message": "Task deleted successfully"}


@router.post("/reorder", response_model=List[Task])
def reorder_tasks(task_ids: List[int], db: Session = Depends(get_db)):
    """
    タスクの並び順を更新する
    タスクIDのリストを順番通りに並べ替える
    """
    # すべてのタスクが存在するか確認
    for task_id in task_ids:
        if task_crud.get_task(db, task_id) is None:
            raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
    
    tasks = task_crud.reorder_tasks(db=db, task_ids=task_ids)
    return tasks