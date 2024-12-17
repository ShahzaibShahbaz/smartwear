from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
import re

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr

    @validator('username')
    def username_alphanumeric(cls, v):
        if not re.match("^[a-zA-Z0-9_-]+$", v):
            raise ValueError('Username must be alphanumeric')
        return v

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    confirm_password: str
    is_admin: Optional[bool] = Field(False, description="Admin status of the user")  

    @validator('password')
    def password_strength(cls, v):
        if not re.match(r"^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$", v):
            raise ValueError('Password must contain at least 8 characters, one letter and one number')
        return v

    @validator('confirm_password')
    def passwords_match(cls, v, values, **kwargs):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    is_admin: bool

    class Config:
        from_attributes = True