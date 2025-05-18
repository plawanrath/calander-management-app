from sqlalchemy import Column, Integer, String, Enum, ForeignKey, DateTime, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship
from .database import Base
import enum

class UserType(str, enum.Enum):
    admin = "admin"
    customer = "customer"
    specialist = "specialist"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    type = Column(Enum(UserType))

    customer = relationship("Customer", back_populates="user", uselist=False)
    specialist = relationship("Specialist", back_populates="user", uselist=False)

class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="customer")
    weekly_plans = relationship("WeeklyPlan", back_populates="customer")
    appointments = relationship("Appointment", back_populates="customer")

class Specialist(Base):
    __tablename__ = "specialists"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    working_hours = Column(String, default="09:00-17:00")

    user = relationship("User", back_populates="specialist")
    appointments = relationship("Appointment", back_populates="specialist")

class SpecialistCustomer(Base):
    __tablename__ = "specialist_customer"
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    specialist_id = Column(Integer, ForeignKey("specialists.id"))
    __table_args__ = (
        UniqueConstraint("customer_id", "specialist_id"),
    )

class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, index=True)
    specialist_id = Column(Integer, ForeignKey("specialists.id"))
    customer_id = Column(Integer, ForeignKey("customers.id"))
    time = Column(DateTime)
    end_time = Column(DateTime)
    title = Column(String)

    specialist = relationship("Specialist", back_populates="appointments")
    customer = relationship("Customer", back_populates="appointments")

class WeeklyPlan(Base):
    __tablename__ = "weekly_plans"
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    description = Column(String)

    customer = relationship("Customer", back_populates="weekly_plans")
