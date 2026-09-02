from datetime import date, datetime

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)


class Token(BaseModel):
    access_token: str
    token_type: str


class ApplicationCreate(BaseModel):
    company: str = Field(min_length=1, max_length=200)
    position: str = Field(min_length=1, max_length=200)
    status: str = Field(default="Applied", min_length=1, max_length=50)
    application_date: date | None = None
    notes: str | None = None


class ApplicationUpdate(BaseModel):
    company: str = Field(min_length=1, max_length=200)
    position: str = Field(min_length=1, max_length=200)
    status: str = Field(min_length=1, max_length=50)
    application_date: date | None = None
    notes: str | None = None


class ApplicationResponse(BaseModel):
    id: int
    user_id: int
    company: str
    position: str
    status: str
    application_date: date | None
    notes: str | None
    created_at: datetime

    class Config:
        from_attributes = True

class ApplicationUpdate(BaseModel):
    company: str
    position: str
    status: str
    application_date: date
    notes: str | None = None