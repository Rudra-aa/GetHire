"""
app/core/event_bus.py
---------------------
Async Event Bus for Domain-Driven Events in GetHire V2.5.
Enables event-driven architecture and asynchronous domain subscriber notifications.

LOC Constraint: < 300 LOC
Single Responsibility: Async Domain Event Subscription & Dispatching
"""

from __future__ import annotations

from typing import Dict, Any, List, Callable, Awaitable
import asyncio
from app.core.logging import get_logger

logger = get_logger(__name__)

EventHandler = Callable[[Dict[str, Any]], Awaitable[None]]


class EventBus:
    """Async event bus managing subscriptions and non-blocking event dispatches."""

    def __init__(self) -> None:
        self._subscribers: Dict[str, List[EventHandler]] = {}

    def subscribe(self, event_type: str, handler: EventHandler) -> None:
        """Subscribes an async handler function to a domain event."""
        if event_type not in self._subscribers:
            self._subscribers[event_type] = []
        self._subscribers[event_type].append(handler)
        logger.debug("Subscribed to event", event_type=event_type, handler=handler.__name__)

    async def publish(self, event_type: str, payload: Dict[str, Any]) -> None:
        """Publishes an event to all subscribed async handlers in parallel."""
        handlers = self._subscribers.get(event_type, [])
        if not handlers:
            logger.debug("No subscribers for event", event_type=event_type)
            return

        logger.info("Publishing domain event", event_type=event_type, subscriber_count=len(handlers))

        tasks = [asyncio.create_task(h(payload)) for h in handlers]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        for res in results:
            if isinstance(res, Exception):
                logger.error("Event handler raised error", event_type=event_type, error=str(res))


# Global Singleton Instance
event_bus = EventBus()
