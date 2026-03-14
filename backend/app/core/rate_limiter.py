import time
from collections import defaultdict
from fastapi import Request, HTTPException

# In-memory fallback
_request_counts: dict = defaultdict(list)

def check_rate_limit(identifier: str, max_requests: int = 10, window_seconds: int = 60) -> None:
    now = time.time()
    window_start = now - window_seconds
    # Clean old entries
    _request_counts[identifier] = [t for t in _request_counts[identifier] if t > window_start]
    if len(_request_counts[identifier]) >= max_requests:
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded. Max {max_requests} requests per {window_seconds}s."
        )
    _request_counts[identifier].append(now)

def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"
