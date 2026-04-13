from pymongo import MongoClient
import os
from datetime import datetime

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = "ethix_ai"

class MongoDB:
    def __init__(self):
        try:
            self.client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
            self.db = self.client[DB_NAME]
            self.client.server_info()
            self.connected = True
        except Exception as e:
            print(f"MongoDB connection failed: {e}. Falling back to simulation.")
            self.connected = False
            self.mock_db = []

    def log_prediction(self, data: dict):
        log_entry = {**data, "timestamp": datetime.utcnow()}
        if self.connected:
            self.db.logs.insert_one(log_entry)
        else:
            self.mock_db.append(log_entry)
        return True

    def get_logs(self, limit=100):
        if self.connected:
            return list(self.db.logs.find().sort("timestamp", -1).limit(limit))
        return sorted(self.mock_db, key=lambda x: x["timestamp"], reverse=True)[:limit]

db = MongoDB()
