from abc import ABC, abstractmethod
from typing import Any
import anthropic
from app.core.config import settings

client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

class BaseAgent(ABC):
    name: str
    role: str

    @abstractmethod
    async def analyze(self, input_data: dict) -> dict:
        pass

    def call_claude(self, system_prompt: str, user_message: str, max_tokens: int = 2000) -> str:
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=max_tokens,
            system=system_prompt,
            messages=[{"role": "user", "content": user_message}]
        )
        return message.content[0].text

    def log(self, message: str):
        print(f"[{self.name}] {message}")
