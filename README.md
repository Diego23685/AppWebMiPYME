# Business Plan Simulator ERP

Plataforma integral para la formulación, costeo, proyección y evaluación financiera de planes de negocio.

**Business Plan Simulator ERP** permite gestionar de forma centralizada el ciclo completo de formulación de un plan de negocio, desde la definición de parámetros operativos y el costeo de producción hasta la generación de proyecciones financieras a cinco años y el análisis de viabilidad mediante indicadores financieros.

El sistema automatiza procesos como el cálculo de nómina, cargas patronales, provisiones de ley, costeo por lote, proyección de demanda, gestión de inventarios, amortización de préstamos y generación de estados financieros proyectados.

---

## Características principales

### Gestión de usuarios y seguridad

* Autenticación mediante JWT.
* Control de acceso basado en roles.
* Roles disponibles:

  * Administrador
  * Gerente
  * Secretario
* Cifrado de contraseñas mediante BCrypt.
* Bajas lógicas mediante Soft Deletes.
* Protección de endpoints mediante autorización basada en roles.

### Gestión de planes de negocio

* Banco institucional de macroplanes.
* Administración de expedientes de planes de negocio.
* Registro y seguimiento de información empresarial.
* Gestión de directrices operativas.
* Configuración de parámetros económicos y financieros.
* Trazabilidad de modificaciones y operaciones.

### Parámetros operativos y económicos

Permite definir los parámetros necesarios para construir las proyecciones del negocio:

* Parámetros salariales.
* Cargas patronales.
* Provisiones laborales.
* Productos.
* Materias primas.
* Costos indirectos.
* Variables macroeconómicas.
* Tasas de crecimiento.
* Inflación.
* Proyecciones quinquenales.

### Costeo de producción

El sistema permite determinar el costo de producción mediante un esquema de materiales directos e indirectos.

Incluye:

* Costeo por lote.
* Bill of Materials (BOM).
* Materia prima directa.
* Materiales indirectos.
* Mano de obra.
* Costos indirectos de fabricación (CIF).
* Determinación del costo total del lote.
* Cálculo del costo unitario base.

### Proyección quinquenal

El motor financiero permite proyectar el comportamiento del negocio durante cinco años.

Incluye:

* Proyección de demanda.
* Demanda indexada mediante variables macroeconómicas.
* Proyección de ventas.
* Dinámica de inventarios.
* Inventario de materia prima.
* Inventario de productos terminados.
* Costos de producción.
* Gastos operativos.
* Ingresos y egresos proyectados.

### Gestión de financiamiento

El sistema permite modelar obligaciones financieras y calcular su comportamiento durante el período proyectado.

Incluye:

* Registro de pasivos.
* Amortización mediante sistema francés.
* Cálculo de cuotas.
* Intereses.
* Abonos a capital.
* Saldo pendiente.
* Proyección de obligaciones financieras.

### Nómina y provisiones laborales

El sistema automatiza la liquidación de nómina para las proyecciones financieras.

Considera:

* Salarios.
* Cargas patronales.
* INSS.
* INATEC.
* Aguinaldo.
* Provisiones laborales.
* Costos anuales de personal.
* Proyección multianual de la nómina.

### Estados financieros

A partir de los datos operativos y financieros registrados, el sistema genera estados financieros proyectados a cinco años.

Incluye:

* Estado de Resultados.
* Flujo de Caja.
* Balance General.
* Flujo de Caja Libre.
* Indicadores financieros.

### Evaluación de viabilidad

El sistema determina la viabilidad financiera del plan de negocio utilizando indicadores de evaluación de inversiones.

Incluye:

* Flujo de Caja Libre (FCL).
* Valor Presente Neto (VPN).
* Tasa Interna de Retorno (TIR).
* WACC.
* TMAR.
* Análisis de rentabilidad.
* Dictamen formal de viabilidad financiera.

El resultado permite determinar si el proyecto genera valor bajo los criterios financieros establecidos.

### Auditoría y trazabilidad

El sistema mantiene un registro de las operaciones relevantes realizadas por los usuarios.

Incluye:

* Registro de acciones.
* Usuario responsable.
* Fecha y hora.
* Operación realizada.
* Trazabilidad de cambios.
* Seguimiento de modificaciones.

### Retroalimentación

Permite la interacción entre los responsables de los planes y los usuarios encargados de su revisión.

Incluye:

* Observaciones.
* Retroalimentación docente.
* Comentarios gerenciales.
* Seguimiento de revisiones.
* Estado de revisión del plan.

### Reportes

Generación de reportes ejecutivos en formato Excel.

Los reportes pueden incluir:

* Información general del plan.
* Costos de producción.
* Proyecciones de ventas.
* Nómina.
* Estados financieros.
* Flujo de caja.
* Indicadores financieros.
* Evaluación de viabilidad.

---

# Arquitectura

El proyecto está dividido en dos aplicaciones principales:

```text
business-plan-simulator/
│
├── backend/
│   ├── Controllers/
│   ├── Data/
│   ├── DTOs/
│   ├── Models/
│   ├── Services/
│   ├── Migrations/
│   ├── Properties/
│   ├── appsettings.json
│   └── BusinessPlanSimulator.Api.csproj
│
└── frontend/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   └── types/
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts
```

## Backend

API REST desarrollada con ASP.NET Core Web API.

Responsabilidades principales:

* Autenticación y autorización.
* Gestión de usuarios.
* Gestión de planes.
* Gestión de productos y costos.
* Cálculos financieros.
* Proyecciones quinquenales.
* Gestión de nómina.
* Persistencia de información.
* Auditoría.
* Generación de reportes.

## Frontend

Aplicación web SPA desarrollada con React y TypeScript.

Responsabilidades principales:

* Interfaz de usuario.
* Autenticación.
* Gestión de sesiones.
* Formularios.
* Dashboards.
* Visualización de proyecciones.
* Administración de planes.
* Consulta de indicadores.
* Generación y descarga de reportes.

---

# Stack tecnológico

## Backend

* [.NET 10](https://dotnet.microsoft.com/)
* ASP.NET Core Web API
* Entity Framework Core
* Pomelo.EntityFrameworkCore.MySql
* MySQL 8.0+
* JWT
* BCrypt
* ClosedXML

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Axios
* Lucide React

## Base de datos

* MySQL 8.0+

---

# Requisitos previos

Antes de ejecutar el proyecto, asegúrate de tener instaladas las siguientes herramientas:

* .NET SDK 10.0
* Node.js 18 LTS o superior
* npm
* MySQL 8.0 o superior
* Entity Framework Core CLI

Para instalar Entity Framework Core CLI:

```bash
dotnet tool install --global dotnet-ef
```

Verifica la instalación:

```bash
dotnet --version
node --version
npm --version
mysql --version
dotnet ef --version
```

---

# Instalación

## 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/business-plan-simulator.git](https://github.com/Diego23685/AppWebMiPYME
cd business-plan-simulator
```

---

# Configuración del Backend

Accede al directorio:

```bash
cd backend
```

Configura la conexión a MySQL en `appsettings.json`.

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Port=3306;Database=business_plan_db;User=root;Password=TU_PASSWORD_AQUI;TreatTinyAsBoolean=true;"
  },
  "Jwt": {
    "Key": "CLAVE_SECRETA_SUPER_SEGURA_DE_AL_MENOS_32_CARACTERES_12345",
    "Issuer": "BusinessPlanSimulatorApi",
    "Audience": "BusinessPlanSimulatorApp",
    "DurationInDays": 7
  }
}
```

### Restaurar dependencias

```bash
dotnet restore
```

### Aplicar migraciones

```bash
dotnet ef database update
```

Este comando creará la estructura de la base de datos a partir de las migraciones existentes.

### Ejecutar el backend

```bash
dotnet run
```

Por defecto, la API estará disponible en:

```text
http://localhost:5206
```

El puerto puede variar dependiendo de la configuración de `launchSettings.json`.

---

# Configuración del Frontend

Abre una nueva terminal y accede al directorio:

```bash
cd frontend
```

Instala las dependencias:

```bash
npm install
```

Configura la URL de la API en:

```text
src/api/client.ts
```

Ejemplo:

```typescript
export const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});
```

Ejecuta el servidor de desarrollo:

```bash
npm run dev
```

El frontend estará disponible normalmente en:

```text
http://localhost:5173
```

---

# Usuario inicial

Al ejecutar el proyecto por primera vez, el inicializador de la base de datos puede crear automáticamente el usuario administrador inicial cuando la tabla de usuarios se encuentra vacía.

Credenciales iniciales:

| Campo      | Valor                 |
| ---------- | --------------------- |
| Correo     | `admin@sistema.local` |
| Contraseña | `Admin123*`           |
| Rol        | Administrador         |

Por seguridad, se recomienda cambiar las credenciales iniciales después del primer acceso y no utilizar estas credenciales en un entorno de producción.

---

# Flujo general del sistema

El proceso principal de formulación y evaluación de un plan de negocio puede representarse de la siguiente manera:

```text
Macroplan institucional
        |
        v
Plan de negocio
        |
        v
Directrices operativas
        |
        v
Parámetros económicos
        |
        v
Productos y materias primas
        |
        v
Costeo por lote
        |
        v
Costo unitario
        |
        v
Proyección de demanda
        |
        v
Proyección de ventas
        |
        v
Inventarios
        |
        v
Nómina y gastos
        |
        v
Financiamiento
        |
        v
Estados financieros
        |
        v
Flujo de Caja Libre
        |
        v
VPN / TIR / WACC / TMAR
        |
        v
Dictamen de viabilidad
```

---

# Modelo de evaluación financiera

El sistema utiliza el Flujo de Caja Libre como base para evaluar la generación de valor del proyecto.

Los principales indicadores son:

### Valor Presente Neto

El VPN permite determinar el valor generado por el proyecto considerando una tasa de descuento determinada.

```text
VPN > 0
```

Indica que el proyecto genera valor bajo la tasa de descuento utilizada.

### Tasa Interna de Retorno

La TIR representa la tasa de rendimiento implícita del proyecto.

Su interpretación se realiza comparándola con la tasa de corte correspondiente:

```text
TIR > TMAR
```

o con el criterio financiero definido para el proyecto.

### WACC

El costo promedio ponderado de capital puede utilizarse como tasa de descuento cuando la estructura de financiamiento del proyecto lo requiere.

### TMAR

La Tasa Mínima Aceptable de Rendimiento permite establecer el rendimiento mínimo esperado para considerar financieramente atractivo un proyecto.

---

# Base de datos

El sistema utiliza MySQL como motor de persistencia y Entity Framework Core como ORM.

La estructura de datos contempla entidades relacionadas con:

* Usuarios.
* Roles.
* Planes de negocio.
* Macroplanes.
* Productos.
* Materias primas.
* Costos.
* Lotes de producción.
* Inventarios.
* Empleados.
* Nómina.
* Pasivos.
* Amortizaciones.
* Proyecciones.
* Estados financieros.
* Auditoría.
* Retroalimentación.

Las modificaciones estructurales de la base de datos se gestionan mediante migraciones de Entity Framework Core.

Para crear una nueva migración:

```bash
dotnet ef migrations add NombreDeLaMigracion
```

Para aplicarla:

```bash
dotnet ef database update
```

---

# API

La API está organizada mediante controladores REST.

Ejemplos de áreas funcionales:

```text
/api/auth
/api/usuarios
/api/roles
/api/macroplanes
/api/planes
/api/productos
/api/costos
/api/inventarios
/api/nomina
/api/pasivos
/api/proyecciones
/api/finanzas
/api/reportes
/api/auditoria
```

Los endpoints concretos pueden variar según la versión actual del proyecto.

---

# Seguridad

El sistema implementa diferentes mecanismos de seguridad:

* Autenticación mediante JWT.
* Autorización basada en roles.
* Contraseñas almacenadas mediante BCrypt.
* Protección de endpoints.
* Soft Deletes para preservar registros históricos.
* Auditoría de operaciones.
* Separación entre frontend y backend.

Para entornos de producción se recomienda:

* Utilizar variables de entorno para secretos.
* No almacenar claves JWT directamente en el repositorio.
* No utilizar credenciales predeterminadas.
* Utilizar HTTPS.
* Configurar correctamente CORS.
* Proteger las credenciales de la base de datos.
* Utilizar una clave JWT suficientemente larga y aleatoria.

---

# Variables de configuración

Para producción, se recomienda configurar los valores sensibles mediante variables de entorno o mecanismos seguros de configuración.

Entre los valores que deben protegerse se encuentran:

```text
Database connection string
JWT Secret
Database password
API credentials
External service credentials
```

No se deben subir al repositorio archivos que contengan credenciales reales.

Se recomienda utilizar:

```text
appsettings.Development.json
```

para configuraciones locales y mecanismos seguros de secretos para producción.

---

# Generación de reportes

Los reportes ejecutivos se generan utilizando **ClosedXML**.

Los archivos `.xlsx` pueden contener información relacionada con:

* Datos generales del proyecto.
* Costos.
* Producción.
* Ventas.
* Nómina.
* Proyecciones.
* Flujo de caja.
* Estados financieros.
* Indicadores de rentabilidad.
* Dictamen financiero.

---

# Roles del sistema

| Rol           | Descripción                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------- |
| Administrador | Administración general del sistema, usuarios, roles y configuración institucional.          |
| Gerente       | Gestión y revisión de planes de negocio, información financiera y evaluación de resultados. |
| Secretario    | Registro y gestión operativa de información de los planes según los permisos asignados.     |

El acceso a las diferentes funcionalidades está controlado mediante autorización basada en roles.

---

# Entornos de desarrollo

El proyecto puede ejecutarse localmente utilizando:

```text
Frontend
http://localhost:5173

Backend
http://localhost:5000

Database
localhost:3306
```

La configuración puede modificarse según las necesidades del entorno.

---

# Comandos útiles

## Backend

Restaurar dependencias:

```bash
dotnet restore
```

Compilar:

```bash
dotnet build
```

Ejecutar:

```bash
dotnet run
```

Crear migración:

```bash
dotnet ef migrations add NombreDeLaMigracion
```

Actualizar base de datos:

```bash
dotnet ef database update
```

## Frontend

Instalar dependencias:

```bash
npm install
```

Ejecutar en desarrollo:

```bash
npm run dev
```

Construir para producción:

```bash
npm run build
```

Previsualizar la compilación:

```bash
npm run preview
```

---

# Estructura conceptual del sistema

```text
                    BUSINESS PLAN SIMULATOR ERP
                               |
          +--------------------+--------------------+
          |                    |                    |
       Seguridad          Gestión de Planes     Parámetros
          |                    |                    |
      Usuarios             Macroplanes          Salarios
      Roles                Expedientes          Productos
      JWT                  Directrices          Macroeconomía
          |                    |                    |
          +--------------------+--------------------+
                               |
                         Motor de Costos
                               |
                    +----------+----------+
                    |                     |
                Costeo BOM             CIF
                    |                     |
                    +----------+----------+
                               |
                         Costo Unitario
                               |
                               v
                     Motor de Proyección
                               |
             +-----------------+-----------------+
             |                 |                 |
          Demanda          Inventarios       Nómina
             |                 |                 |
             +-----------------+-----------------+
                               |
                               v
                    Estados Financieros
                               |
             +-----------------+-----------------+
             |                 |                 |
        Resultados        Flujo de Caja    Balance General
             |                 |
             +-----------------+
                               |
                               v
                    Flujo de Caja Libre
                               |
                               v
                       VPN / TIR / WACC
                               |
                               v
                    Dictamen de Viabilidad
```

---

# Estado del proyecto

El proyecto se encuentra en desarrollo y está orientado a la digitalización y automatización del proceso de formulación y evaluación financiera de planes de negocio.

Las funcionalidades pueden evolucionar durante el desarrollo y algunas características pueden encontrarse sujetas a cambios en la arquitectura, reglas de negocio o interfaz.

---

# Contribuciones

Las contribuciones son bienvenidas.

Para contribuir:

1. Realiza un fork del repositorio.
2. Crea una rama para tu funcionalidad:

```bash
git checkout -b feature/nueva-funcionalidad
```

3. Realiza los cambios correspondientes.
4. Ejecuta las pruebas y verifica que el proyecto compile correctamente.
5. Realiza un commit:

```bash
git commit -m "feat: agregar nueva funcionalidad"
```

6. Envía los cambios a tu fork:

```bash
git push origin feature/nueva-funcionalidad
```

7. Abre un Pull Request.

---

# Licencia

Este proyecto se encuentra actualmente en desarrollo.

La licencia definitiva será definida posteriormente.

---

# Autor

**Business Plan Simulator ERP**

Sistema desarrollado como plataforma para la formulación, simulación, proyección y evaluación financiera de planes de negocio.
