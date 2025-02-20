import os
import sys
from dotenv import load_dotenv
from pymongo import MongoClient

class Database:
    def __init__(self):
        load_dotenv()
        self.client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017/"))
        self.db = self.client["vecem"]
        self.userprofile = self.db["userprofiles"]
        self.dataset = self.db["datasets"]
        self.connect()

    def connect(self):
        self.client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017/"))
        self.db = self.client["mydatabase"]
        self.userprofile = self.db["userprofiles"]
        self.dataset = self.db["datasets"]