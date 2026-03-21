from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    # App
    APP_NAME: str = "NitiSetu"
    SECRET_KEY: str
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "https://nitisetu.acolyte.ai"]
    
    # Supabase
    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str
    DATABASE_URL: str
    
    # Anthropic
    ANTHROPIC_API_KEY: str
    CLAUDE_MODEL: str = "claude-sonnet-4-20250514"
    CLAUDE_MAX_TOKENS: int = 8192
    
    # Redis/Celery
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Processing
    MAX_FILE_SIZE_MB: int = 50
    WHISPER_MODEL: str = "base"
    
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

settings = Settings()
