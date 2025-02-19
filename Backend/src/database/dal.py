import sys
from dotenv import load_dotenv
from pymongo import MongoClient
from utils.logger import logging
from utils.exception import CustomException

class Database:
    def __init__(self):
        load_dotenv()
        self.client = None
        self.db = None
        self.userprofile = None
        self.dataset = None
        self.connect()

    def connect(self):
        self.client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017/"))
        self.db = self.client["mydatabase"]
        self.userprofile = self.db["userprofiles"]
        self.dataset = self.db["datasets"]