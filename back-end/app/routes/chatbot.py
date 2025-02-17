from fastapi import APIRouter, HTTPException
import google.generativeai as genai
from pydantic import BaseModel

genai.configure(api_key="AIzaSyBRIGGMMSA8pyAUuwUfnXf9qdc98whmxyc")
PINECONEAPI = "pcsk_47vN4a_NjrVmWVbv7PADwBu4ie87mYELUzkGvLo7DYmqxxqoHdpxSoVsY9xPqw7c52dVCu"

class ChatRequest(BaseModel):
    message: str

router = APIRouter()

@router.post("/chat") 
async def chat_with_gemini(request: ChatRequest):
    
    try:
        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(request.message)

        if response and hasattr(response, "text"):
            return {"reply": response.text}
        else:
            return {"reply": "Sorry, I couldn't process that request."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
