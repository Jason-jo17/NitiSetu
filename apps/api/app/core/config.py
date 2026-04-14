from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional

class Settings(BaseSettings):
    # App
    APP_NAME: str = "NitiSetu"
    ENVIRONMENT: str = "development"
    SECRET_KEY: str
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "https://nitisetu.acolyte.ai"]
    
    # Supabase
    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str
    SUPABASE_JWT_SECRET: Optional[str] = None
    DATABASE_URL: str
    
    # Anthropic
    ANTHROPIC_API_KEY: str
    CLAUDE_MODEL: str = "claude-3-5-sonnet-20241022"
    CLAUDE_MAX_TOKENS: int = 8192
    
    # Redis/Celery
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Processing
    MAX_FILE_SIZE_MB: int = 50
    WHISPER_MODEL: str = "base"
    
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

settings = Settings()
