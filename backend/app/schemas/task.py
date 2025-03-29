from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


# 共通のプロパティ
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = Field(default="medium", regex="^(low|medium|high)$")
    due_date: Optional[datetime] = None
    status: bool = False
    order_index: int = 0
    category_id: Optional[int] = None
    parent_task_id: Optional[int] = None


# タスク作成時に使用
class TaskCreate(TaskBase):
    pass


# タスク更新時に使用（全てのフィールドをオプションに）
class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = Field(default=None, regex="^(low|medium|high)$")
    due_date: Optional[datetime] = None
    status: Optional[bool] = None
    order_index: Optional[int] = None
    category_id: Optional[int] = None
    parent_task_id: Optional[int] = None


# APIレスポンスで返すタスクのスキーマ
class Task(TaskBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True


# サブタスクを含むタスクの詳細スキーマ
class TaskWithSubtasks(Task):
    subtasks: List[Task] = []

    class Config:
        orm_mode = True


# タスクのステータス更新用スキーマ
class TaskStatusUpdate(BaseModel):
    status: bool