from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # IMPORTANTE
from routes.servicios import router as servicios_router
from routes.auth import router as auth_router
from datetime import datetime

app = FastAPI()

# --- CONFIGURACIÓN DE CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # En producción, cambia "*" por la URL de tu frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def saludar():
    return {"mensaje": "¡Hola! Bienvenido a mi API"}

@app.get("/bienvenido/{nombre}")
def saludar_persona(nombre: str):
    return {"mensaje": f"Hola {nombre}, ¡qué bueno verte por aquí!"}

app.include_router(servicios_router)
app.include_router(auth_router)
