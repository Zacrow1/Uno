# UNO Game Frontend

Frontend simple para la API del juego UNO, construido con HTML, CSS y JavaScript vanilla.

## Características

### 🎮 Funcionalidades del Juego
- **Autenticación de Usuarios**: Registro, inicio de sesión y cierre de sesión
- **Sala de Juego**: Crear, unirse y ver juegos disponibles
- **Juego UNO Completo**:
  - Reparto de cartas
  - Gestión de turnos
  - Cartas especiales (Skip, Reverse, Draw 2, Wild, Wild Draw 4)
  - Sistema UNO y retos
  - Estado del juego en tiempo real

### 🎨 Interfaz de Usuario
- **Diseño Responsivo**: Funciona en desktop y móviles
- **Interfaz Moderna**: Gradientes, animaciones y efectos visuales
- **Mensajes en Tiempo Real**: Notificaciones de estado del juego
- **Modales Interactivos**: Formularios de autenticación elegantes

### 🔧 Características Técnicas
- **Arquitectura Modular**: Servicios separados para API, autenticación, juego y UI
- **Manejo de Errores**: Sistema robusto de manejo de errores
- **Gestión de Estado**: Estado centralizado del juego y usuario
- **Atajos de Teclado**: Accesos rápidos para acciones comunes
- **Monitoreo de Conexión**: Detección de estado online/offline

## Estructura del Proyecto

```
frontend/
├── index.html              # Página principal
├── css/
│   └── styles.css          # Estilos principales
├── js/
│   ├── api.js             # Servicio de API
│   ├── auth.js            # Servicio de autenticación
│   ├── game.js            # Servicio de juego
│   ├── ui.js              # Servicio de interfaz
│   └── main.js            # Controlador principal
├── images/                # Imágenes y assets
└── README.md              # Este archivo
```

## Instalación y Uso

### Prerrequisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Servidor backend UNO corriendo en `http://localhost:3000`

### Configuración

1. **Clonar el repositorio**:
   ```bash
   git clone <repository-url>
   cd uno-project/frontend
   ```

2. **Iniciar el servidor backend**:
   Asegúrate de que el servidor backend esté corriendo en el puerto 3000.

3. **Abrir el frontend**:
   - Opción 1: Abrir `index.html` directamente en el navegador
   - Opción 2: Usar un servidor local (Live Server, Python Simple HTTP Server, etc.)

### Configuración de la API

La URL base de la API está configurada en `js/api.js`:

```javascript
const API = {
    BASE_URL: 'http://localhost:3000/api',
    // ... otros endpoints
};
```

Si tu backend está en otra URL o puerto, modifica este valor.

## Uso de la Aplicación

### 1. Autenticación
- **Registro**: Crea una nueva cuenta de usuario
- **Inicio de Sesión**: Accede con tus credenciales
- **Cierre de Sesión**: Sal de tu cuenta actual

### 2. Sala de Juego
- **Crear Juego**: Inicia una nueva partida de UNO
- **Unirse a Juego**: Entra a una partida existente
- **Ver Juegos**: Consulta el estado de partidas en curso

### 3. Juego UNO
- **Reparto Automático**: Las cartas se reparten al iniciar el juego
- **Turnos**: Sistema de turnos con indicadores visuales
- **Jugar Cartas**: Haz clic en tus cartas para jugarlas
- **Robar Cartas**: Haz clic en el mazo o botón de robar
- **UNO**: Presiona el botón UNO cuando te quede una carta
- **Cartas Especiales**: Soporte completo para todas las cartas especiales

## Atajos de Teclado

| Combinación | Acción |
|-------------|--------|
| `Ctrl/Cmd + L` | Abrir modal de inicio de sesión |
| `Ctrl/Cmd + R` | Refrescar datos del juego |
| `Ctrl/Cmd + G` | Crear nuevo juego |
| `Ctrl/Cmd + U` | Decir UNO |
| `Escape` | Cerrar modales y menús abiertos |
| `Enter` | Activar botón enfocado |

## Arquitectura

### Servicios

#### ApiService (`js/api.js`)
- Maneja todas las comunicaciones con el backend
- Gestiona tokens de autenticación
- Proporciona métodos para todos los endpoints de la API

#### AuthService (`js/auth.js`)
- Gestiona el estado de autenticación
- Maneja formularios de login/registro
- Actualiza la interfaz según el estado del usuario

#### GameService (`js/game.js`)
- Controla toda la lógica del juego
- Gestiona el estado de partidas
- Maneja acciones del juego (jugar cartas, robar, etc.)

#### UIService (`js/ui.js`)
- Gestiona la interfaz de usuario
- Maneja mensajes y notificaciones
- Proporciona utilidades de UI

#### App (`js/main.js`)
- Controlador principal de la aplicación
- Inicializa todos los servicios
- Maneja eventos globales y errores

### Flujo de Datos

```
Usuario → Interfaz → UIService → GameService/AuthService → ApiService → Backend
```

## Personalización

### Colores y Estilos
Los colores principales están definidos en `css/styles.css`:
- **Primario**: `#667eea` a `#764ba2` (gradiente morado)
- **Secundario**: `#f093fb` a `#f5576c` (gradiente rosa)
- **Éxito**: `#4facfe` a `#00f2fe` (gradiente azul)
- **Peligro**: `#fa709a` a `#fee140` (gradiente naranja)

### Iconos
La aplicación usa Font Awesome para los iconos. Puedes personalizar los iconos modificando las clases `fas` en el HTML.

## Desarrollo

### Agregar Nuevas Funcionalidades

1. **Nuevo Endpoint API**:
   - Agregar el endpoint en `js/api.js`
   - Crear método en el servicio correspondiente
   - Actualizar la interfaz para usar la nueva funcionalidad

2. **Nueva Característica de UI**:
   - Agregar elementos HTML en `index.html`
   - Estilos en `css/styles.css`
   - Lógica en el servicio correspondiente

### Depuración

La aplicación incluye console.log para depuración. Para ver los mensajes:
- Abre las herramientas de desarrollador del navegador (F12)
- Ve a la pestaña "Console"
- Busca mensajes que comienzan con "UNO Game" o "API Error"

## Errores Comunes

### 1. "No se puede conectar al servidor"
- Verifica que el backend esté corriendo en `http://localhost:3000`
- Comprueba que no haya firewalls bloqueando el puerto

### 2. "Error de autenticación"
- Verifica tus credenciales
- Asegúrate de que el usuario esté registrado en el backend

### 3. "El juego no responde"
- Refresca la página (F5)
- Verifica tu conexión a internet
- Revisa la consola para errores específicos

## Contribuir

1. Haz un fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE para detalles.

## Soporte

Si encuentras algún problema o tienes sugerencias:
1. Revisa la sección de errores comunes
2. Busca issues existentes en el repositorio
3. Crea un nuevo issue con una descripción detallada

---

**¡Disfruta jugando UNO!** 🎮