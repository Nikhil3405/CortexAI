from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"
EXPIRE_MIN = 60 * 24  # 24 hours

# 🔐 Use Argon2 (modern, secure, no length limits)
pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto",
)


# --------------------------------------------------
# Password helpers
# --------------------------------------------------

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)


# --------------------------------------------------
# JWT helpers
# --------------------------------------------------

def create_access_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.utcnow() + timedelta(minutes=EXPIRE_MIN),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
