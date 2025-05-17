from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime

from .database import Base, engine
from .dependencies import get_db
from . import crud, models, schemas

Base.metadata.create_all(bind=engine)

app = FastAPI()

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
