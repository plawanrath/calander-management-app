from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str
    type: str

class User(UserBase):
    id: int
    type: str

    class Config:
        orm_mode = True

class Customer(BaseModel):
    id: int
    user: User

    class Config:
        orm_mode = True

class Specialist(BaseModel):
    id: int
    user: User
    working_hours: str

    class Config:
        orm_mode = True

class Appointment(BaseModel):
    id: int
    time: datetime

    class Config:
        orm_mode = True

class WeeklyPlan(BaseModel):
    id: int
    description: str

    class Config:
        orm_mode = True
