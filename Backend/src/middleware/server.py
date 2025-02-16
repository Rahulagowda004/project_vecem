from fastapi import FastAPI

app = FastAPI()

@app.get("/userprofile/{name}/{email}/{description}/{dimension}/{vector_dimension}/")
def read_user_profile(name: str, email: str):
    return f"Hello, {name}, {email}!"

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
