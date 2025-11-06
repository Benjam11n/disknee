from fastapi import WebSocket
from typing import Dict, List
import structlog

logger = structlog.get_logger()

class ConnectionManager:
    """Manages WebSocket connections for pose detection sessions"""

    def __init__(self):
        # Store active connections: {exercise_id: {client_id: websocket}}
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}
        # Store client metadata
        self.client_metadata: Dict[str, Dict[str, any]] = {}

    async def connect(self, websocket: WebSocket, exercise_id: str):
        """Accept and store a new WebSocket connection"""
        await websocket.accept()

        # Generate unique client ID
        client_id = f"{exercise_id}_{len(self.active_connections.get(exercise_id, {}))}"

        # Store connection
        if exercise_id not in self.active_connections:
            self.active_connections[exercise_id] = {}

        self.active_connections[exercise_id][client_id] = websocket

        # Store client metadata
        self.client_metadata[client_id] = {
            "exercise_id": exercise_id,
            "connected_at": websocket.scope.get("server", (None, None))[1],
            "client": websocket.client
        }

        logger.info(
            "Client connected",
            client_id=client_id,
            exercise_id=exercise_id,
            total_connections=len(self.active_connections[exercise_id])
        )

        return client_id

    async def disconnect(self, websocket: WebSocket, exercise_id: str):
        """Remove a WebSocket connection"""
        # Find the client ID
        client_id = None
        if exercise_id in self.active_connections:
            for cid, ws in self.active_connections[exercise_id].items():
                if ws == websocket:
                    client_id = cid
                    break

        if client_id:
            # Remove from active connections
            del self.active_connections[exercise_id][client_id]

            # Remove metadata
            if client_id in self.client_metadata:
                del self.client_metadata[client_id]

            # Clean up empty exercise groups
            if not self.active_connections[exercise_id]:
                del self.active_connections[exercise_id]

            logger.info(
                "Client disconnected",
                client_id=client_id,
                exercise_id=exercise_id,
                remaining_connections=len(self.active_connections.get(exercise_id, {}))
            )

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send a message to a specific client"""
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error("Error sending personal message", error=str(e))

    async def broadcast_to_exercise(self, message: dict, exercise_id: str):
        """Broadcast a message to all clients doing a specific exercise"""
        if exercise_id in self.active_connections:
            disconnected_clients = []

            for client_id, websocket in self.active_connections[exercise_id].items():
                try:
                    await websocket.send_json(message)
                except Exception as e:
                    logger.error(
                        "Error broadcasting to client",
                        client_id=client_id,
                        error=str(e)
                    )
                    disconnected_clients.append(client_id)

            # Remove disconnected clients
            for client_id in disconnected_clients:
                await self.disconnect(
                    self.active_connections[exercise_id][client_id],
                    exercise_id
                )

    async def disconnect_all(self):
        """Disconnect all clients"""
        for exercise_id in list(self.active_connections.keys()):
            for client_id in list(self.active_connections[exercise_id].keys()):
                websocket = self.active_connections[exercise_id][client_id]
                try:
                    await websocket.close()
                except:
                    pass

        self.active_connections.clear()
        self.client_metadata.clear()
        logger.info("All clients disconnected")

    def get_connection_stats(self) -> dict:
        """Get connection statistics"""
        total_clients = sum(
            len(clients)
            for clients in self.active_connections.values()
        )

        exercise_counts = {
            exercise_id: len(clients)
            for exercise_id, clients in self.active_connections.items()
        }

        return {
            "total_clients": total_clients,
            "active_exercises": len(self.active_connections),
            "exercise_counts": exercise_counts
        }

    def is_client_connected(self, client_id: str) -> bool:
        """Check if a client is still connected"""
        return client_id in self.client_metadata

    def get_exercise_clients(self, exercise_id: str) -> List[str]:
        """Get all client IDs for a specific exercise"""
        return list(self.active_connections.get(exercise_id, {}).keys())