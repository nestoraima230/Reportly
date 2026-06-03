# Reportly

Sistema móvil de reportes ciudadanos con sincronización distribuida utilizando React Native, Node.js, MongoDB Replica Set y SQLite.

---

## Descripción

Reportly es una aplicación móvil que permite a los usuarios crear, consultar y sincronizar reportes de incidencias de forma distribuida.

La aplicación funciona de manera híbrida:

- **SQLite** almacena los datos localmente en el dispositivo (offline-first).
- **MongoDB Replica Set** almacena los datos de forma distribuida en el servidor (3 nodos).
- **Node.js + Express** actúa como middleware entre la aplicación móvil y la base de datos.
- **Firebase Authentication** gestiona el registro e inicio de sesión de usuarios.

---

## Tecnologías utilizadas

### Frontend
- React Native
- Expo
- SQLite
- Firebase Authentication

### Backend
- Node.js
- Express
- Docker
- Docker Compose

### Base de Datos
- MongoDB Replica Set

---

## Requisitos Previos

Antes de instalar el sistema, asegúrate de contar con:

| Herramienta | Versión | Verificar |
|-------------|---------|-----------|
| Node.js | 18 o superior | `node -v` |
| npm | 9 o superior | `npm -v` |
| Docker Desktop | Última | `docker -v` |
| Git | Cualquiera | `git -v` |
| Expo Go | Última | (en el teléfono) |

---

## Instalación del Backend

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd Reportly
```

### 2. Instalar dependencias del backend

```bash
cd backend
npm install
```

### 3. Iniciar MongoDB Replica Set

```bash
cd ../docker
docker compose up -d
```

Verificar contenedores:

```bash
docker ps
```

Debes ver 4 contenedores: `mongo1`, `mongo2`, `mongo3`, `backend`

### 4. Verificar estado del replica set

```bash
docker exec -it mongo1 mongosh --eval "rs.status()"
```

**Resultado esperado:** 1 PRIMARY, 2 SECONDARY

### 5. Ejecutar servidor

```bash
cd ../backend
npm start
```

Servidor disponible en:

```
http://localhost:3000
```

Verificar:

```bash
curl http://localhost:3000/health
```

**Respuesta esperada:**

```json
{"status":"healthy","mongodb":"connected","replicaSet":"rs0"}
```

---

## Instalación de la Aplicación Móvil

### 1. Instalar dependencias del frontend

```bash
cd ..  # Si estás en backend/
npm install
```

### 2. Configurar URL del Backend

Edita `services/SyncService.js`:

```javascript
// Reemplaza con la IP de tu computadora en la red local
const API_URL = 'http://192.168.1.X:3000';
```

> **Obtener tu IP:** `ipconfig | findstr "IPv4"` (Windows) o `ifconfig` (Linux/Mac)

### 3. Iniciar Expo

```bash
npx expo start -c
```

Escanear el código QR con **Expo Go** (Android/iOS) o ejecutar en emulador.

---

## Usuarios

Los usuarios pueden:

- Registrarse e iniciar sesión (Firebase Auth)
- Crear reportes con imagen y ubicación
- Consultar reportes en feed y mapa
- Sincronizar información con el servidor
- Usar la aplicación sin conexión (SQLite)
- Crear reportes offline con imagen

---

## Sincronización Distribuida

La sincronización funciona de la siguiente manera:

1. Los reportes se almacenan localmente en SQLite.
2. Cuando existe conexión a internet:
   - **PUSH**: Los reportes pendientes se envían al backend.
   - **PULL**: Los reportes nuevos del servidor se descargan.
3. El timestamp original se preserva en todo momento.
4. La sincronización puede ser manual o automática (cada 10 minutos).

---

## Estructura General

```
Reportly/
│
├── backend/
│   ├── config/
│   ├── scripts/
│   ├── src/
│   │   └── app.js
│   ├── Dockerfile
│   └── package.json
│
├── docker/
│   └── docker-compose.yml
│
├── services/
│   ├── LocalDB.js
│   └── SyncService.js
│
├── screens/
│   ├── CreateReport.js
│   ├── Feed.js
│   └── ...
│
├── data/                    (temporal - archivos JSON)
│
└── package.json
```

---

## Pruebas recomendadas

| Prueba | Pasos |
|--------|-------|
| **Online** | Crear reporte con internet → debe aparecer en el feed |
| **Offline** | Modo avión → crear reporte con imagen → aparece "pendiente" |
| **Sincronización** | Conectar internet → presionar "Sincronizar" |
| **Failover** | `docker stop mongo1` → el sistema sigue funcionando |

---

## Detener el Sistema

Backend:

```bash
CTRL + C
```

Contenedores Docker:

```bash
cd docker
docker compose down
```

> Los datos se guardan en volúmenes Docker. No se pierden al detener.

---

## Posibles errores y soluciones

| Error | Solución |
|-------|----------|
| `getaddrinfo ENOTFOUND mongo1` | Ejecutar scripts dentro del contenedor: `docker exec -it backend node scripts/import.js` |
| Backend no responde | `docker restart backend` |
| Expo no conecta | Verificar IP en `SyncService.js` y que el firewall permita el puerto 3000 |

---

## Autores

Proyecto desarrollado para la materia de Sistemas Distribuidos.

**Equipo:**

- Néstor Aimar Arce Nuñez
- Jose Humberto Castro Garcia
- Jesus Daniel Vega Olachea
