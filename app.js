 Crea el JavaScript para PetCare. El backend es FastAPI corriendo en http://127.0.0.1:8000 con estos  
  endpoints:      

  - GET / → { mensaje }
  - GET /bienvenido/{nombre} → { mensaje }
  - POST /register → body: { correo, contrasena }
  - POST /login → body: { correo, contrasena }
  - GET /servicios → { servicios: [{nombre, precio}] }
  - POST /agregar-servicio → body: { nombre, precio }
  - POST /registrar-mascota → body: { correo, nombre, tipo_servicio, fecha }
  - GET /mascotas/{correo} → { mascotas: [...] }
  - GET /reporte/{correo} → { cantidad_servicios, total_gastado, servicios, correo }

  El JS debe manejar:
  - switchTab(name): cambia la sección activa. Los tabs "Inicio" y "Acceso" son siempre accesibles sin 
  login. Los tabs "Servicios", "Mascotas" y "Reporte" están bloqueados hasta que el usuario inicie     
  sesión.
  - Al hacer login exitoso: desbloquear los tabs protegidos (Servicios, Mascotas, Reporte), mostrar    
  badge con correo, mostrar botón salir
  - logout(): volver a bloquear los tabs protegidos, regresar al tab "Acceso"
  - Mostrar alertas temporales de éxito/error en cada formulario
  - Cargar servicios en lista y en <select> del formulario de mascotas
  - Renderizar mascotas como cards con los detalles
  - Renderizar reporte como 3 stat-boxes (cantidad, total, correo) + tags de servicios usados
  - Al entrar al tab de reporte, pre-llenar el correo del usuario logueado
  - switchTab debe: (1) quitar clase "active" de todos los .section, (2) agregar "active" solo al      
  section del tab seleccionado

  Genera únicamente el archivo app.js. No modifiques index.html ni style.css.
  