from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# SQLAlchemyエンジン作成
engine = create_engine(
    settings.DATABASE_URL, connect_args={"check_same_thread": False}
)

# セッションローカル作成
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# モデル用ベースクラス
Base = declarative_base()


# DB依存関係用のヘルパー関数
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()