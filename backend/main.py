from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from contextlib import asynccontextmanager
from app.core.database import init_db
from app.core.middleware import logging_middleware, security_headers_middleware
from app.routers import genome, agents, match, calendar

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(
    title="VC Genome API",
    description="AI-powered VC capitalist profiling engine",
    version="0.3.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://vcgenome.startpass.jp"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
app.add_middleware(BaseHTTPMiddleware, dispatch=logging_middleware)
app.add_middleware(BaseHTTPMiddleware, dispatch=security_headers_middleware)

app.include_router(genome.router, prefix="/api/genome", tags=["genome"])
app.include_router(agents.router, prefix="/api/agents", tags=["agents"])
app.include_router(match.router, prefix="/api/match", tags=["match"])
app.include_router(calendar.router, prefix="/api/calendar", tags=["calendar"])

@app.get("/health")
async def health():
    return {"status": "ok", "service": "vc-genome-api", "version": "0.3.0"}
