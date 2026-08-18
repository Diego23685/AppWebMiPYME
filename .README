# Business Plan Simulator

Plataforma integral para la **formulación, evaluación, simulación financiera, dictamen y exportación de planes de negocio a 5 años**.

El proyecto está diseñado bajo una arquitectura desacoplada y orientada a servicios, utilizando **Clean Architecture** en el backend y una **Single Page Application (SPA)** en el frontend.

---

## Tabla de contenidos

* [Descripción](#descripción)
* [Arquitectura](#arquitectura)
* [Tecnologías](#tecnologías)
* [Estructura del proyecto](#estructura-del-proyecto)
* [Funcionalidades](#funcionalidades)
* [Roles y permisos](#roles-y-permisos)
* [Requisitos](#requisitos)
* [Instalación y configuración](#instalación-y-configuración)
* [Backend](#1-configuración-del-backend)
* [Frontend](#2-configuración-del-frontend)
* [Endpoints principales](#endpoints-principales)
* [Motor financiero](#motor-financiero)
* [Exportación de reportes](#exportación-de-reportes)
* [Seguridad](#seguridad)
* [Contribución](#contribución)
* [Licencia](#licencia)

---

## Descripción

**Business Plan Simulator** es una plataforma web orientada a la creación y gestión de planes de negocio, permitiendo parametrizar información empresarial, realizar proyecciones financieras a cinco años y evaluar la viabilidad de diferentes proyectos.

El sistema permite:

* Gestionar usuarios y roles.
* Crear y administrar cursos.
* Formular planes de negocio.
* Configurar supuestos financieros.
* Realizar simulaciones financieras a 5 años.
* Evaluar la viabilidad de proyectos.
* Mantener un banco de proyectos consultable.
* Exportar información en formatos PDF y Excel.
* Mantener trazabilidad histórica mediante eliminación lógica (*soft delete*).

---

## Arquitectura

El proyecto está dividido en diferentes capas siguiendo los principios de **Clean Architecture**.

### Backend — .NET 10 Web API

#### Domain

Contiene el núcleo del sistema y las reglas fundamentales del dominio:

* Entidades:

  * `User`
  * `Course`
  * `BusinessPlan`
  * `FinancialAssumption`
* Enumeraciones.
* Contratos y modelos fundamentales del dominio.

#### Application

Contiene la lógica de aplicación:

* DTOs utilizando `record`.
* Interfaces de servicios.
* Casos de uso.
* Lógica de negocio.
* Motor de cálculo financiero determinista.
* Cálculo de indicadores como:

  * VAN.
  * TIR.
  * Payback.

#### Infrastructure

Implementa los servicios externos y la persistencia:

* Entity Framework Core.
* PostgreSQL.
* Migraciones.
* `DbContext`.
* Generación de archivos Excel mediante ClosedXML.
* Generación de documentos PDF mediante QuestPDF.

#### Api

Capa de presentación y exposición de servicios REST:

* `AuthController`
* `CoursesController`
* `BusinessPlansController`
* `SimulationController`
* Autenticación mediante JWT.
* Bearer Tokens.
* Middlewares de seguridad.
* Configuración de la aplicación.

---

## Tecnologías

### Backend

| Tecnología            | Uso                     |
| --------------------- | ----------------------- |
| .NET 10               | Framework principal     |
| ASP.NET Core Web API  | API REST                |
| Entity Framework Core | ORM y persistencia      |
| PostgreSQL            | Base de datos           |
| JWT                   | Autenticación           |
| BCrypt                | Hash de contraseñas     |
| ClosedXML             | Exportación a Excel     |
| QuestPDF              | Generación de PDF       |
| Swagger / OpenAPI     | Documentación de la API |

### Frontend

| Tecnología          | Uso                               |
| ------------------- | --------------------------------- |
| React 19            | Framework de interfaz             |
| TypeScript          | Tipado estático                   |
| Vite                | Herramienta de desarrollo y build |
| Tailwind CSS v4     | Estilos y diseño responsive       |
| React Router DOM v7 | Enrutamiento                      |
| Axios               | Cliente HTTP                      |
| AuthContext         | Gestión global de autenticación   |

---

## Estructura del proyecto

```text
BusinessPlanSimulator/
│
├── BusinessPlanSimulator.slnx
│
├── BusinessPlanSimulator.Api/
│   ├── Controllers/
│   ├── Middleware/
│   ├── Program.cs
│   └── appsettings.json
│
├── BusinessPlanSimulator.Application/
│   ├── DTOs/
│   ├── Interfaces/
│   ├── Services/
│   └── FinancialEngine/
│
├── BusinessPlanSimulator.Domain/
│   ├── Entities/
│   ├── Enums/
│   └── Contracts/
│
├── BusinessPlanSimulator.Infrastructure/
│   ├── Data/
│   ├── Migrations/
│   ├── Repositories/
│   ├── Exporters/
│   └── Services/
│
└── client/
    ├── src/
    ├── public/
    ├── package.json
    ├── vite.config.ts
    └── tailwind.config.*
```

---

## Funcionalidades

| Ref.     | Módulo                 | Descripción                                                                                                                                                 |
| -------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **R1.1** | Gestión de usuarios    | Registro exclusivo por administrador y asignación de roles: `Admin`, `Teacher` y `Student`.                                                                 |
| **R1.2** | Autenticación segura   | Inicio y cierre de sesión mediante JWT y contraseñas protegidas con BCrypt.                                                                                 |
| **R1.3** | Recuperación de acceso | Flujo mediante token criptográfico temporal con expiración de 15 minutos.                                                                                   |
| **R1.4** | Perfil y seguridad     | Actualización de información personal y cambio de contraseña mediante validación de la clave actual.                                                        |
| **R1.5** | Formulación de planes  | Creación de planes de negocio asociados a cursos académicos o entidades empresariales.                                                                      |
| **R1.6** | Banco de proyectos     | Repositorio público filtrable por sector, tipo de sociedad, rango de inversión y viabilidad.                                                                |
| **R1.7** | Edición de parámetros  | Modificación integral de planes en estado borrador y recálculo inmediato de las proyecciones.                                                               |
| **R1.8** | Eliminación lógica     | Implementación de *soft delete* para planes y cursos, conservando la trazabilidad histórica.                                                                |
| **R1.9** | Estructura básica      | Parametrización laboral y financiera: SMMLV, transporte, seguridad social, parafiscales, prestaciones, cartera, proveedores, vida útil, deuda y comisiones. |
| **R3.1** | Exportación integral   | Generación y descarga de informes y matrices en formatos PDF y Excel.                                                                                       |

---

## Roles y permisos

### Administrador — `Admin`

Responsable de la administración general de la plataforma.

**Permisos principales:**

* Gestión y activación de usuarios.
* Asignación de roles.
* Creación y administración de cursos.
* Eliminación lógica de registros.
* Visualización de todos los planes de negocio.
* Gestión general del sistema.

### Gerente / Docente — `Teacher`

Responsable de la gestión académica y evaluación de los estudiantes.

**Permisos principales:**

* Crear y administrar sus propios cursos.
* Matricular estudiantes.
* Gestionar participantes.
* Revisar planes de negocio.
* Evaluar y calificar proyectos.
* Proporcionar retroalimentación.

### Secretario / Estudiante — `Student`

Responsable de la formulación y simulación de planes de negocio.

**Permisos principales:**

* Crear planes de negocio.
* Editar planes en borrador.
* Configurar supuestos financieros.
* Ejecutar simulaciones financieras a 5 años.
* Consultar resultados de viabilidad.
* Exportar reportes.
* Consultar el banco de proyectos.

---

## Motor financiero

El sistema incorpora un motor de cálculo financiero determinista para realizar proyecciones y evaluar la viabilidad de los planes de negocio.

Entre los principales indicadores se encuentran:

* **VAN — Valor Actual Neto**
* **TIR — Tasa Interna de Retorno**
* **Payback — Período de recuperación de la inversión**
* Proyecciones financieras a 5 años.
* Flujo de caja proyectado.
* Parámetros laborales y operativos.
* Supuestos financieros configurables.

Los cálculos se realizan a partir de los parámetros definidos en cada plan de negocio, permitiendo recalcular las proyecciones cuando se modifican los supuestos.

---

## Exportación de reportes

La plataforma permite generar reportes formales a partir de la información almacenada en cada plan de negocio.

### Formatos disponibles

* **PDF** mediante `QuestPDF`.
* **Excel** mediante `ClosedXML`.

La exportación permite generar informes y matrices con la información financiera y administrativa del proyecto.

---

## Requisitos

Antes de ejecutar el proyecto, asegúrate de tener instaladas las siguientes herramientas:

* [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
* [Node.js 18 o superior](https://nodejs.org/)
* [PostgreSQL](https://www.postgresql.org/)
* Git

---

# Instalación y configuración

## 1. Configuración del Backend

### Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd BusinessPlanSimulator
```

### Configurar PostgreSQL

Edita:

```text
BusinessPlanSimulator.Api/appsettings.json
```

Configura la cadena de conexión:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=BusinessPlanSimulatorDb;Username=tu_usuario;Password=tu_password"
  },
  "JwtSettings": {
    "Secret": "TU_CLAVE_SECRETA_SUPER_SEGURA_DE_AL_MENOS_32_CARACTERES_12345",
    "Issuer": "BusinessPlanSimulatorApi",
    "Audience": "BusinessPlanSimulatorApp"
  }
}
```

> **Importante:** No subas contraseñas, claves JWT u otros secretos reales al repositorio. Utiliza variables de entorno o archivos de configuración locales para información sensible.

### Aplicar las migraciones

Desde la raíz del proyecto:

```bash
dotnet ef database update \
  --project BusinessPlanSimulator.Infrastructure \
  --startup-project BusinessPlanSimulator.Api
```

### Ejecutar la API

```bash
dotnet run --project BusinessPlanSimulator.Api
```

La API estará disponible en:

```text
http://localhost:5028
```

La documentación de Swagger estará disponible en:

```text
http://localhost:5028/swagger
```

---

## 2. Configuración del Frontend

Accede al directorio del cliente:

```bash
cd client
```

Instala las dependencias:

```bash
npm install
```

Inicia el servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible normalmente en:

```text
http://localhost:5173
```

---

## Endpoints principales

La API está organizada mediante controladores RESTful:

| Controlador               | Responsabilidad                                  |
| ------------------------- | ------------------------------------------------ |
| `AuthController`          | Registro, autenticación y recuperación de acceso |
| `CoursesController`       | Gestión de cursos                                |
| `BusinessPlansController` | Creación, edición y gestión de planes            |
| `SimulationController`    | Simulación y cálculos financieros                |

La documentación completa de los endpoints puede consultarse mediante **Swagger** al ejecutar la API.

---

## Seguridad

El sistema implementa diferentes mecanismos de seguridad:

* Autenticación mediante JWT Bearer Tokens.
* Contraseñas almacenadas mediante BCrypt.
* Tokens temporales para recuperación de contraseña.
* Expiración de tokens de recuperación después de 15 minutos.
* Validación de permisos según rol.
* Middlewares de seguridad.
* Eliminación lógica para preservar la trazabilidad.
* Validación de la contraseña actual antes de permitir cambios de credenciales.

---

## Persistencia

La aplicación utiliza la siguiente arquitectura de comunicación:

```text
┌─────────────────────┐
│      Frontend       │
│ React + TypeScript  │
└──────────┬──────────┘
           │
           │ HTTP / REST
           ▼
┌─────────────────────┐
│      API .NET 10    │
│ Controllers + JWT   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│    Application      │
│ Business Logic      │
│ Financial Engine    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Infrastructure    │
│ EF Core + Exporters │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│     PostgreSQL      │
└─────────────────────┘
```

---

## Desarrollo

Para trabajar en el proyecto se recomienda ejecutar el backend y frontend simultáneamente.

### Terminal 1 — Backend

```bash
dotnet run --project BusinessPlanSimulator.Api
```

### Terminal 2 — Frontend

```bash
cd client
npm run dev
```

---

## Build para producción

### Backend

```bash
dotnet publish BusinessPlanSimulator.Api -c Release
```

### Frontend

```bash
cd client
npm run build
```

Los archivos generados del frontend estarán disponibles en:

```text
client/dist/
```

---

## Contribución

Las contribuciones son bienvenidas.

Para contribuir:

1. Realiza un *fork* del repositorio.
2. Crea una rama para tu funcionalidad:

```bash
git checkout -b feature/nueva-funcionalidad
```

3. Realiza tus cambios.
4. Haz *commit*:

```bash
git commit -m "feat: agregar nueva funcionalidad"
```

5. Envía la rama al repositorio:

```bash
git push origin feature/nueva-funcionalidad
```

6. Abre un **Pull Request**.

---

## Licencia

Este proyecto se encuentra bajo una licencia que deberá ser definida por los responsables del repositorio.

---

## Business Plan Simulator

Plataforma para la formulación, simulación y evaluación financiera de planes de negocio a cinco años.

**Planifica · Simula · Evalúa · Decide**
