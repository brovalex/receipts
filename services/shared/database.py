# from sqlalchemy import create_engine
# from sqlalchemy.orm import sessionmaker
# from .models import Base  # Import your existing Base with models

# # Create engine and session factory
# engine = create_engine('sqlite:///db_test.db')
# SessionLocal = sessionmaker(bind=engine)

# # Create all tables
# Base.metadata.create_all(engine)

# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()