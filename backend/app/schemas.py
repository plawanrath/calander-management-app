from __future__ import annotations

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

class CustomerInfo(BaseModel):
    id: int

    class Config:
        orm_mode = True

class SpecialistInfo(BaseModel):
    id: int
    working_hours: str

    class Config:
        orm_mode = True

class UserProfile(User):
    customer: Optional[CustomerInfo] = None
    specialist: Optional[SpecialistInfo] = None

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
    end_time: datetime
    title: Optional[str] = None
    customer_id: int
    specialist_id: int
    customer: Optional[Customer] = None

    class Config:
        orm_mode = True

class WeeklyPlan(BaseModel):
    id: int
    description: str

    class Config:
        orm_mode = True
