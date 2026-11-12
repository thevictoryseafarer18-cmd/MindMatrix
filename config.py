import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "MINDMATRIX AI"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./mindmatrix.db")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "mindmatrix_super_secret_jwt_key_2026")
    DEMO_MODE: bool = True

settings = Settings()
