from __future__ import annotations

from typing import Any

import structlog
from fastapi import WebSocket
from starlette.websockets import WebSocketState

logger = structlog.get_logger()


class ConnectionManager:
    """Manage active websocket connections by exercise."""

    def __init__(self) -> None:
        self.active_connections: dict[str, dict[str, WebSocket]] = {}
        self.client_metadata: dict[str, dict[str, Any]] = {}

    async def connect(self, websocket: WebSocket, exercise_id: str) -> str:
        """Accept and register a new websocket client."""
        await websocket.accept()

        exercise_connections = self.active_connections.setdefault(exercise_id, {})
        client_id = f"{exercise_id}_{len(exercise_connections)}"
        exercise_connections[client_id] = websocket

        server = websocket.scope.get("server")
        connected_at = server[1] if isinstance(server, tuple) and len(server) > 1 else None
        self.client_metadata[client_id] = {
            "exercise_id": exercise_id,
            "connected_at": connected_at,
            "client": websocket.client,
        }

        logger.info(
            "Client connected",
            client_id=client_id,
            exercise_id=exercise_id,
            total_connections=len(exercise_connections),
        )
        return client_id

    async def disconnect(self, websocket: WebSocket, exercise_id: str) -> None:
        """Remove a websocket connection from the manager."""
        exercise_connections = self.active_connections.get(exercise_id)
        if exercise_connections is None:
            return

        client_id = next(
            (connection_id for connection_id, active_socket in exercise_connections.items() if active_socket == websocket),
            None,
        )
        if client_id is None:
            return

        del exercise_connections[client_id]
        self.client_metadata.pop(client_id, None)

        if not exercise_connections:
            del self.active_connections[exercise_id]

        logger.info(
            "Client disconnected",
            client_id=client_id,
            exercise_id=exercise_id,
            remaining_connections=len(self.active_connections.get(exercise_id, {})),
        )

    async def send_personal_message(self, message: dict[str, Any], websocket: WebSocket) -> None:
        """Send a JSON message to a single client."""
        try:
            await websocket.send_json(message)
        except Exception as exc:
            logger.error("Error sending personal message", error=str(exc))

    async def broadcast_to_exercise(self, message: dict[str, Any], exercise_id: str) -> None:
        """Broadcast a JSON message to all clients for one exercise."""
        exercise_connections = self.active_connections.get(exercise_id)
        if exercise_connections is None:
            return

        disconnected_clients: list[str] = []
        for client_id, websocket in exercise_connections.items():
            try:
                await websocket.send_json(message)
            except Exception as exc:
                logger.error(
                    "Error broadcasting to client",
                    client_id=client_id,
                    error=str(exc),
                )
                disconnected_clients.append(client_id)

        for client_id in disconnected_clients:
            disconnected_websocket = exercise_connections.get(client_id)
            if disconnected_websocket is not None:
                await self.disconnect(disconnected_websocket, exercise_id)

    async def disconnect_all(self) -> None:
        """Close and remove all active websocket connections."""
        for exercise_connections in list(self.active_connections.values()):
            for websocket in list(exercise_connections.values()):
                try:
                    if websocket.client_state != WebSocketState.DISCONNECTED:
                        await websocket.close()
                except Exception:
                    logger.debug("Ignoring websocket close failure during shutdown")

        self.active_connections.clear()
        self.client_metadata.clear()
        logger.info("All clients disconnected")

    def get_connection_stats(self) -> dict[str, Any]:
        """Return aggregate connection metrics for health/debug endpoints."""
        exercise_counts = {
            exercise_id: len(connections)
            for exercise_id, connections in self.active_connections.items()
        }
        total_clients = sum(exercise_counts.values())
        return {
            "total_clients": total_clients,
            "active_exercises": len(self.active_connections),
            "exercise_counts": exercise_counts,
        }

    def is_client_connected(self, client_id: str) -> bool:
        return client_id in self.client_metadata

    def get_exercise_clients(self, exercise_id: str) -> list[str]:
        return list(self.active_connections.get(exercise_id, {}).keys())
