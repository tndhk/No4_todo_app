from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate


def get_category(db: Session, category_id: int) -> Optional[Category]:
    """指定されたIDのカテゴリを取得する"""
    return db.query(Category).filter(Category.id == category_id).first()


def get_category_by_name(db: Session, name: str) -> Optional[Category]:
    """指定された名前のカテゴリを取得する"""
    return db.query(Category).filter(Category.name == name).first()


def get_categories(db: Session, skip: int = 0, limit: int = 100) -> List[Category]:
    """カテゴリ一覧を取得する"""
    return db.query(Category).offset(skip).limit(limit).all()


def create_category(db: Session, category: CategoryCreate) -> Category:
    """カテゴリを作成する"""
    db_category = Category(name=category.name)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def update_category(db: Session, category_id: int, category_update: CategoryUpdate) -> Optional[Category]:
    """カテゴリを更新する"""
    db_category = get_category(db, category_id)
    if db_category is None:
        return None
    
    # モデル辞書に変換し、Noneでないフィールドのみを更新
    update_data = category_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_category, key, value)
    
    db.commit()
    db.refresh(db_category)
    return db_category


def delete_category(db: Session, category_id: int) -> bool:
    """カテゴリを削除する"""
    db_category = get_category(db, category_id)
    if db_category is None:
        return False
    
    db.delete(db_category)
    db.commit()
    return True