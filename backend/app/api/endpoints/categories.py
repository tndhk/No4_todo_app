from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.crud import category_crud
from app.schemas.category import Category, CategoryCreate, CategoryUpdate, CategoryWithTasks

router = APIRouter()


@router.get("/", response_model=List[Category])
def read_categories(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    """
    カテゴリ一覧を取得する
    """
    categories = category_crud.get_categories(db, skip=skip, limit=limit)
    return categories


@router.post("/", response_model=Category)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    """
    新しいカテゴリを作成する
    - **name**: カテゴリ名（必須）
    """
    # 同名のカテゴリが存在するかチェック
    db_category = category_crud.get_category_by_name(db, name=category.name)
    if db_category:
        raise HTTPException(status_code=400, detail="Category already exists")
    
    return category_crud.create_category(db=db, category=category)


@router.get("/{category_id}", response_model=Category)
def read_category(category_id: int, db: Session = Depends(get_db)):
    """
    指定されたIDのカテゴリを取得する
    """
    db_category = category_crud.get_category(db, category_id=category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_category


@router.get("/{category_id}/tasks", response_model=CategoryWithTasks)
def read_category_with_tasks(category_id: int, db: Session = Depends(get_db)):
    """
    指定されたIDのカテゴリとそのタスクを取得する
    """
    db_category = category_crud.get_category(db, category_id=category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_category


@router.put("/{category_id}", response_model=Category)
def update_category(category_id: int, category: CategoryUpdate, db: Session = Depends(get_db)):
    """
    カテゴリを更新する
    """
    # カテゴリの存在確認
    db_category = category_crud.get_category(db, category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # 名前の更新時は重複チェック
    if category.name is not None and db_category.name != category.name:
        existing_category = category_crud.get_category_by_name(db, name=category.name)
        if existing_category:
            raise HTTPException(status_code=400, detail="Category name already exists")
    
    updated_category = category_crud.update_category(
        db=db, category_id=category_id, category_update=category
    )
    return updated_category


@router.delete("/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):
    """
    カテゴリを削除する
    """
    db_category = category_crud.get_category(db, category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # カテゴリに関連するタスクがあるか確認し、警告
    if db_category.tasks:
        raise HTTPException(
            status_code=400, 
            detail="Category has associated tasks. Please delete or reassign tasks first."
        )
    
    category_crud.delete_category(db=db, category_id=category_id)
    return {"message": "Category deleted successfully"}