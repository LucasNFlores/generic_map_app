# 🗺️ Open Source Map App: Hoja de Ruta y Planificación

Este documento detalla la estrategia para transformar este proyecto en una herramienta **Open Source** robusta, democratizando el acceso a la recopilación y visualización de datos geoespaciales sin costes operativos iniciales (Free Tier de Supabase + Vercel).

---

## 🎯 Visión del Proyecto
Crear una plataforma "Zero-Config" donde investigadores, ONGs y entes públicos puedan desplegar su propio sistema de mapeo y encuestas de forma sencilla. El objetivo es minimizar la fricción técnica: una vez configuradas las cuentas base (GitHub, Supabase, Vercel), el despliegue de la solución no debería requerir conocimientos de programación.

---

## 👥 Público Objetivo & Casos de Uso

| Perfil | Caso de Uso | Necesidad Clave |
| :--- | :--- | :--- |
| **Investigadores** | Censo de fauna, mapeo de contaminación, encuestas sociales. | Recopilación fácil desde móvil y exportación de datos. |
| **Entes Públicos/Privados** | MAPA de servicios, zonas de mantenimiento, puntos de reciclaje. | Visualización clara y panel de administración sencillo. |
| **Desarrolladores** | Base para apps de delivery, tracking o redes sociales locales. | Código limpio, modular y fácil de extender. |

---

## 🛠️ Fases de Desarrollo

### Fase 1: Estabilización y "Generización" (Corto Plazo)
*Objetivo: Que el código no dependa de un caso de uso específico (como residuos).*

- [ ] **Configuración Dinámica:** Mover categorías (vidrio, plástico, etc.) de ENUMs rígidos en la base de datos a una tabla de configuración o variables de entorno.
- [ ] **Instalador de SQL Automatizado:** Crear un script único o una sección en el dashboard para ejecutar todo el esquema inicial en Supabase con un clic.
- [ ] **Traducción (i18n):** Implementar base para multi-lenguaje (Español/Inglés) desde el inicio.
- [ ] **Mobile UX:** Optimizar la captura de puntos GPS desde el navegador móvil (PWA/Responsive).

### Fase 2: Experiencia de Usuario & Setup "One-Click" (Medio Plazo)
*Objetivo: Facilitar el tutorial para personas no técnicas.*

- [ ] **Plantilla de Despliegue en Vercel:** Configurar botones de "Deploy to Vercel" que soliciten automáticamente las claves de Supabase.
- [ ] **Dashboard de Administración:** Crear una interfaz protegida (SuperAdmin) para gestionar los puntos sin entrar a la base de datos.
- [ ] **Tutorial Interactivo:** Un "tour" guiado al entrar por primera vez para configurar el centro del mapa y el nombre del proyecto.

### Fase 3: Funcionalidades Avanzadas (Largo Plazo)
*Objetivo: Competir con herramientas pagas.*

- [ ] **Creador de Formularios (Encuestas):** Integrar la posibilidad de añadir preguntas personalizadas (texto, fotos, selección) a cada punto/shape.
- [ ] **Capas Personalizadas:** Permitir subir archivos GeoJSON o KML para mostrar zonas pre-existentes sobre el mapa.
- [ ] **Exportación de Datos:** Botones para descargar los datos recolectados en CSV, Excel o GeoJSON.
- [ ] **Sistema de Validación:** Flujo donde los supervisores aprueben los puntos antes de que sean públicos.

---

## 💰 Estrategia de Coste Cero

Para garantizar que el proyecto se mantenga gratuito para los usuarios:

1.  **Supabase:** Uso de PostgreSQL + PostGIS (vía extensiones) dentro de la cuota gratuita (500MB).
2.  **Vercel:** Despliegue de la app Next.js en el plan Hobby.
3.  **MapLibre + OpenStreetMap:** Uso de librerías y mapas open-source para evitar las costosas APIs de Google Maps o Mapbox.

---

## 📘 Preparación para el Tutorial
Para el video tutorial, el repositorio debe contar con:
1.  **README.md visual:** Con capturas de pantalla y el botón de despliegue.
2.  **Carpeta `/setup`:** Con los scripts SQL limpios y comentados.
3.  **Variables de Entorno Claras:** `.env.example` perfectamente documentado.

---

## 🤝 Contribución
Como proyecto Open Source, definiremos:
*   `CONTRIBUTING.md`: Guía para que otros devs aporten.
*   `LICENSE`: Licencia MIT (recomendada por su permisividad para entes públicos/privados).
