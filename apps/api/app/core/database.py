from supabase import create_client, Client, ClientOptions
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)
_supabase: Client = None

def get_supabase() -> Client:
    global _supabase
    if _supabase is None:
        # HARDENED: Inject apikey and Accept headers to prevent 406 Not Acceptable
        _supabase = create_client(
            settings.SUPABASE_URL, 
            settings.SUPABASE_SERVICE_KEY,
            options=ClientOptions(
                headers={
                    "apikey": settings.SUPABASE_SERVICE_KEY,
                    "Accept": "application/json"
                }
            )
        )
    return _supabase

async def init_db():
    """Run migrations and seed data on startup."""
    supabase = get_supabase()
    logger.info("Database connection established.")
    # Seed CDSCO checklist templates if not present
    from app.core.seeds import seed_checklists
    await seed_checklists(supabase)
