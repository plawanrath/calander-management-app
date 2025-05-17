from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime
from typing import List

from .database import Base, engine
from .dependencies import get_db
from . import crud, models, schemas

Base.metadata.create_all(bind=engine)

app = FastAPI()

# Enable CORS so the React frontend can communicate with the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

fake_tokens = {}

@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_username(db, form_data.username)
    if not user or not crud.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    token = f"token-{user.id}"
    fake_tokens[token] = user.id
    return {"access_token": token, "token_type": "bearer"}


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user_id = fake_tokens.get(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid authentication")
    user = db.query(models.User).get(user_id)
    return user


@app.post("/admin/users", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db), current: models.User = Depends(get_current_user)):
    if current.type != models.UserType.admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    return crud.create_user(db, user)

@app.post("/admin/customers/{customer_id}/specialists/{specialist_id}")
def select_specialist(customer_id: int, specialist_id: int, db: Session = Depends(get_db), current: models.User = Depends(get_current_user)):
    if current.type != models.UserType.admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    return crud.assign_specialist(db, customer_id, specialist_id)

@app.post("/admin/customers/{customer_id}/weekly_plan")
def create_plan(customer_id: int, description: str, db: Session = Depends(get_db), current: models.User = Depends(get_current_user)):
    if current.type != models.UserType.admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    return crud.create_weekly_plan(db, customer_id, description)

@app.post("/customers/{customer_id}/appointments")
def create_customer_appointment(customer_id: int, specialist_id: int, time: datetime, db: Session = Depends(get_db), current: models.User = Depends(get_current_user)):
    if current.type != models.UserType.customer or current.customer.id != customer_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return crud.create_appointment(db, customer_id, specialist_id, time)

@app.get("/me", response_model=schemas.User)
def read_me(current: models.User = Depends(get_current_user)):
    return current


@app.get("/admin/specialists/appointments", response_model=List[schemas.Appointment])
def read_all_appointments(db: Session = Depends(get_db), current: models.User = Depends(get_current_user)):
    if current.type != models.UserType.admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    return crud.get_all_specialist_appointments(db)


@app.get("/specialists/{specialist_id}/appointments", response_model=List[schemas.Appointment])
def read_specialist_appointments(specialist_id: int, db: Session = Depends(get_db), current: models.User = Depends(get_current_user)):
    if current.type not in [models.UserType.specialist, models.UserType.admin]:
        raise HTTPException(status_code=403, detail="Not authorized")
    if current.type == models.UserType.specialist and current.specialist.id != specialist_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return crud.get_specialist_appointments(db, specialist_id)


@app.get("/customers/{customer_id}/appointments", response_model=List[schemas.Appointment])
def read_customer_appointments(customer_id: int, db: Session = Depends(get_db), current: models.User = Depends(get_current_user)):
    if current.type not in [models.UserType.customer, models.UserType.admin]:
        raise HTTPException(status_code=403, detail="Not authorized")
    if current.type == models.UserType.customer and current.customer.id != customer_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return crud.get_customer_appointments(db, customer_id)


@app.get("/customers/{customer_id}/weekly_plans", response_model=List[schemas.WeeklyPlan])
def read_customer_plans(customer_id: int, db: Session = Depends(get_db), current: models.User = Depends(get_current_user)):
    if current.type not in [models.UserType.customer, models.UserType.admin]:
        raise HTTPException(status_code=403, detail="Not authorized")
    if current.type == models.UserType.customer and current.customer.id != customer_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return crud.get_customer_weekly_plans(db, customer_id)
