import os
import chromadb
from pathlib import Path
import numpy as np
from langchain.vectorstores import FAISS,Chroma
from langchain_huggingface import HuggingFaceEmbeddings

embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        
class top_k():
    def __init__(self,folder_path: Path,query_vector: list, top_k : int):
        self.folder_path = folder_path
        self.query_vector = query_vector
        self.top_k = top_k
    
    def load_vectors(self,):
        file_path=self.folder_path
        ext = os.path.splitext(file_path)[1]
        if ext == ".npy":
            return np.load(file_path)
        elif ext == ".csv":
            return np.loadtxt(file_path, delimiter=",")
        elif ext == ".json":
            import json
            with open(file_path, "r") as f:
                return np.array(json.load(f))
        elif ext == ".faiss":
            vector_store = FAISS.load_local(file_path, embeddings)
            retriever = vector_store.as_retriever()
            return retriever
        elif "chroma" in file_path.lower():
            vector_store = Chroma(
            persist_directory=file_path,
            embedding_function=embeddings
            )
            retriever = vector_store.as_retriever()
            return retriever
        else:
            raise ValueError("Unsupported format. Use .npy, .csv, .json, FAISS, or ChromaDB.")
        
    def query(self,):
        retriever = self.load_vectors()
        results = retriever.query(query_embeddings=[self.query_vector.tolist()], n_results=self.top_k)
        return results