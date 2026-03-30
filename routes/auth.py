from fastapi import APIRouter

router = APIRouter()

# Base de datos simulada en memoria
usuarios_db = []


@router.post("/register")
def register(datos: dict):
    usuario = {
        "correo": datos.get("correo"),
        "contrasena": datos.get("contrasena")
    }
    usuarios_db.append(usuario)

    return {
        "mensaje": "Usuario registrado con éxito",
        "datos": usuario
    }


@router.post("/login")
def login(datos: dict):
    correo = datos.get("correo")
    contrasena = datos.get("contrasena")

    return {
        "mensaje": "Login exitoso",
        "datos": {
            "correo": correo,
            "contrasena": contrasena
        }
    }
    