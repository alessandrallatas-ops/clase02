from fastapi import FastAPI
from datetime import datetime
app = FastAPI()
@app.get("/")
def saludar():
    return {"mensaje": "¡Hola! Bienvenido a mi API"}
@app.get("/bienvenido/{nombre}")
def saludar_persona(nombre: str):
    return {"mensaje": f"Hola {nombre}, ¡qué bueno verte por aquí!"}
def fecha():
    return datetime.now()
@app.get("/fecha")
def dame_la_hora():
    ahora = datetime.now()
    return {
        "fecha": ahora.strftime("%Y-%m-%d"),
        "hora": ahora.strftime("%H:%M:%S"),
        "iso": ahora.isoformat()
    }