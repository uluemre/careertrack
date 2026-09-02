from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, Base, SessionLocal
import models
from schemas import UserCreate, UserLogin, Token
from auth import (
    hash_password,
    verify_password,
    create_access_token,
)
from dependencies import get_current_user


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="CareerTrack API",
    description="Job and internship application tracking API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


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


@app.post("/users/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(
        models.User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    password_hash = hash_password(user.password)

    new_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=password_hash,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "is_active": new_user.is_active,
        }
    }


@app.post("/users/login", response_model=Token)
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(
        models.User.email == user.email
    ).first()

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        user.password,
        existing_user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        data={"sub": str(existing_user.id)}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@app.get("/users/me")
def get_me(
    current_user: models.User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "is_active": current_user.is_active,
    }


from routers.applications import router as applications_router

app.include_router(applications_router)