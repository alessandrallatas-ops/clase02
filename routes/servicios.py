from fastapi import APIRouter

router = APIRouter()

# Base de datos simulada en memoria
servicios_db = [
    {"id": 1, "nombre": "Baño", "precio": 30},
    {"id": 2, "nombre": "Corte de pelo", "precio": 45},
    {"id": 3, "nombre": "Consulta veterinaria", "precio": 80}
]

# Nueva base de datos simulada para mascotas registradas
mascotas_db = []


@router.get("/servicios")
def listar_servicios():
    return {
        "servicios": servicios_db
    }


@router.post("/agregar-servicio")
def agregar_servicio(nuevo: dict):
    servicios_db.append(nuevo)
    return {
        "mensaje": "¡Servicio guardado!",
        "servicio": nuevo
    }


@router.post("/registrar-mascota")
def registrar_mascota(datos: dict):
    correo = datos.get("correo")
    nombre_mascota = datos.get("nombre_mascota")
    tipo_servicio = datos.get("tipo_servicio")
    fecha = datos.get("fecha")

    registro = {
        "correo": correo,
        "nombre_mascota": nombre_mascota,
        "tipo_servicio": tipo_servicio,
        "fecha": fecha
    }

    mascotas_db.append(registro)

    return {
        "mensaje": "Mascota y servicio registrados con éxito",
        "registro": registro
    }


@router.get("/mascotas/{correo}")
def listar_mascotas_usuario(correo: str):
    registros_usuario = [registro for registro in mascotas_db if registro["correo"] == correo]

    return {
        "correo": correo,
        "total_registros": len(registros_usuario),
        "mascotas": registros_usuario
    }


@router.get("/reporte/{correo}")
def reporte_usuario(correo: str):
    registros_usuario = [registro for registro in mascotas_db if registro["correo"] == correo]

    total_servicios = len(registros_usuario)
    servicios_registrados = []
    total_gastado = 0

    for registro in registros_usuario:
        tipo_servicio = registro["tipo_servicio"]
        servicios_registrados.append(tipo_servicio)

        servicio_encontrado = next(
            (servicio for servicio in servicios_db if servicio["nombre"].lower() == tipo_servicio.lower()),
            None
        )

        if servicio_encontrado:
            total_gastado += servicio_encontrado["precio"]

    return {
        "correo": correo,
        "cantidad_servicios": total_servicios,
        "servicios": servicios_registrados,
        "total_gastado": total_gastado
    }
    