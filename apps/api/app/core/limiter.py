from slowapi import Limiter
from slowapi.util import get_remote_address

# Initialize limiter
# In a real distributed environment, this would use a RedisBackend
limiter = Limiter(key_func=get_remote_address)
