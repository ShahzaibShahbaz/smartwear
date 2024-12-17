from fastapi import Request, HTTPException, Depends
from jose import JWTError, jwt

SECRET_KEY = "secret_key"
ALGORITHM = "HS256"

async def verify_admin_token(request: Request):
    token = request.headers.get("Authorization")
    if not token:
        raise HTTPException(status_code=401, detail="No token provided.")

    try:
        # Extract and decode the JWT
        token = token.split(" ")[1]  # Remove 'Bearer ' prefix
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        role = payload.get("role")
        if role != "admin":
            raise HTTPException(status_code=403, detail="Not authorized.")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token.")

    return True
