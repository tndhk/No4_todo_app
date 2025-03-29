from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(String(10), nullable=False, default="medium")  # low, medium, high
    due_date = Column(DateTime, nullable=True)
    status = Column(Boolean, default=False)  # False: 未完了, True: 完了
    order_index = Column(Integer, default=0)
    category_id = Column(Integer, ForeignKey("categories.id"))
    parent_task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # リレーションシップ
    category = relationship("Category", back_populates="tasks")
    subtasks = relationship("Task", 
                           backref=relationship("Task", remote_side=[id]),
                           cascade="all, delete-orphan")