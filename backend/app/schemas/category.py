from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel


# 共通のプロパティ
class CategoryBase(BaseModel):
    name: str


# カテゴリ作成時に使用
class CategoryCreate(CategoryBase):
    pass


# カテゴリ更新時に使用
class CategoryUpdate(BaseModel):
    name: Optional[str] = None


# APIレスポンスで返すカテゴリのスキーマ
class Category(CategoryBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True


# タスク付きカテゴリ（リレーションを含む）
class CategoryWithTasks(Category):
    tasks: List['Task'] = []

    class Config:
        orm_mode = True


# 循環インポートを避けるために後で型をインポート
from app.schemas.task import Task
CategoryWithTasks.update_forward_refs()