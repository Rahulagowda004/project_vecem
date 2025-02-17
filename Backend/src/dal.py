from pymongo import MongoClient
import sys
from utils.logger import logging
from utils.exception import CustomException

class Database:
    def __init__(self):
        pass
    
    def Mongoconnector(self,):
        try:
            client = MongoClient("mongodb://localhost:27017/")
            db = client["mydatabase"]
            collection = db["mycollection"]
            print("Connected to MongoDB successfully!")
            return collection
        except Exception as e:
            raise CustomException(e,sys)
    
    def push_dataset(self,user_id,name, email, data_id, ):
        self.collection.insert()
