from fastapi import Depends, HTTPException, Header
from jose import jwt
from sqlalchemy.orm import Session
from auth import SECRET_KEY, ALGORITHM
from db import get_db
from models import User

def get_current_user(
    authorization: str = Header(...),
    db: Session = Depends(get_db)
):
    try:
        token = authorization.split(" ")[1]
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
    except:
        raise HTTPException(401, "Invalid token")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(401, "User not found")

    return user
