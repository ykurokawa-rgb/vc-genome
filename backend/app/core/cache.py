import json
import hashlib
from typing import Any
import redis.asyncio as aioredis
from app.core.config import settings

redis_client: aioredis.Redis | None = None

async def get_redis() -> aioredis.Redis:
    global redis_client
    if redis_client is None:
        try:
            redis_client = aioredis.from_url(settings.redis_url, decode_responses=True)
            await redis_client.ping()
        except Exception:
            redis_client = None
    return redis_client

def make_cache_key(prefix: str, data: dict) -> str:
    content = json.dumps(data, sort_keys=True)
    h = hashlib.md5(content.encode()).hexdigest()[:12]
    return f"vcgenome:{prefix}:{h}"

async def get_cached(key: str) -> Any | None:
    r = await get_redis()
    if r is None:
        return None
    try:
        val = await r.get(key)
        return json.loads(val) if val else None
    except Exception:
        return None

async def set_cached(key: str, value: Any, ttl_seconds: int = 86400) -> None:
    r = await get_redis()
    if r is None:
        return
    try:
        await r.setex(key, ttl_seconds, json.dumps(value, ensure_ascii=False))
    except Exception:
        pass

async def invalidate(key: str) -> None:
    r = await get_redis()
    if r is None:
        return
    try:
        await r.delete(key)
    except Exception:
        pass
