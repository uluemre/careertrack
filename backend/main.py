from fastapi import FastAPI

from database import engine, Base
import models

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CareerTrack API",
    description="Job and internship application tracking API",
    version="1.0.0",
)


@app.get("/")
def root():
    return {
        "message": "CareerTrack API is running!"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }