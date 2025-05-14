import motor.motor_asyncio
import os
from typing import Any
from functools import lru_cache

# MongoDB connection settings
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB", "bioinformatics")


@lru_cache()
def get_db() -> Any:
    """Get database connection (cached to prevent multiple connections)"""
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
    db = client[MONGO_DB]
    return db