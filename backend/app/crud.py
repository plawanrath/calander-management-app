from sqlalchemy.orm import Session
from . import models
from . import schemas
from datetime import datetime
from typing import List
from passlib.context import CryptContext
from passlib.exc import UnknownHashError

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    db_user = models.User(
        username=user.username,
        hashed_password=get_password_hash(user.password),
        type=user.type,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    if user.type == "customer":
        customer = models.Customer(user_id=db_user.id)
        db.add(customer)
    elif user.type == "specialist":
        specialist = models.Specialist(user_id=db_user.id)
        db.add(specialist)
    db.commit()
    return db_user


def assign_specialist(db: Session, customer_id: int, specialist_id: int):
    link = models.SpecialistCustomer(customer_id=customer_id, specialist_id=specialist_id)
    db.add(link)
    db.commit()
    return link


def create_weekly_plan(db: Session, customer_id: int, description: str):
    plan = models.WeeklyPlan(customer_id=customer_id, description=description)
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan


def create_appointment(db: Session, customer_id: int, specialist_id: int, time: datetime):
    appt = models.Appointment(customer_id=customer_id, specialist_id=specialist_id, time=time)
    db.add(appt)
    db.commit()
    db.refresh(appt)
    return appt


def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()


def verify_password(plain: str, hashed: str) -> bool:
    """Return True if ``plain`` matches the bcrypt ``hashed`` value."""
    if not hashed:
        return False
    try:
        return pwd_context.verify(plain, hashed.strip())
    except (ValueError, UnknownHashError):
        return False


def get_specialist_appointments(db: Session, specialist_id: int) -> List[models.Appointment]:
    return (
        db.query(models.Appointment)
        .filter(models.Appointment.specialist_id == specialist_id)
        .all()
    )


def get_customer_appointments(db: Session, customer_id: int) -> List[models.Appointment]:
    return (
        db.query(models.Appointment)
        .filter(models.Appointment.customer_id == customer_id)
        .all()
    )


def get_all_specialist_appointments(db: Session) -> List[models.Appointment]:
    return db.query(models.Appointment).all()


def get_customer_weekly_plans(db: Session, customer_id: int) -> List[models.WeeklyPlan]:
    return (
        db.query(models.WeeklyPlan)
        .filter(models.WeeklyPlan.customer_id == customer_id)
        .all()
    )


def get_all_customers(db: Session) -> List[models.Customer]:
    return db.query(models.Customer).all()


def get_all_specialists(db: Session) -> List[models.Specialist]:
    return db.query(models.Specialist).all()


def get_customer_specialists(db: Session, customer_id: int) -> List[models.Specialist]:
    return (
        db.query(models.Specialist)
        .join(models.SpecialistCustomer, models.Specialist.id == models.SpecialistCustomer.specialist_id)
        .filter(models.SpecialistCustomer.customer_id == customer_id)
        .all()
    )
