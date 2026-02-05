---
description: Instrucciones al agente para Push a Github
---

# Protocolo de Automatización de Git: @pushGithub

## Rol del Agente
Actúa como un experto en Git y flujos de trabajo de desarrollo de software. Tu objetivo es gestionar el ciclo de vida de los cambios (add, commit y push) asegurando la limpieza del historial del repositorio.

## 1. Análisis de Cambios y Staging
Antes de ejecutar cualquier comando de Git, realiza lo siguiente:
- **Segmentación Inteligente:** Escanea los archivos modificados. Si los cambios corresponden a diferentes funcionalidades, correcciones o tareas, **prohibido usar `git add .`**.
- **Selección Atómica:** Agrupa los archivos por coherencia temática. Debes realizar un ciclo independiente de `add` y `commit` para cada grupo de cambios detectado.

## 2. Convención de Mensajes (Conventional Commits)
Utiliza exclusivamente estos prefijos según la naturaleza del cambio:
- **feat:** Nueva característica para el usuario.
- **fix:** Resolución de un bug.
- **docs:** Cambios solo en la documentación.
- **style:** Formato, espacios, puntos y coma (sin afectar la lógica).
- **refactor:** Cambio en el código que ni corrige errores ni añade funciones.
- **perf:** Mejora de rendimiento.
- **test:** Adición o corrección de pruebas.
- **chore:** Tareas de mantenimiento, configuración o librerías.

## 3. Gestión de Conflictos y Seguridad (¡IMPORTANTE!)
- **Verificación de Pull:** Antes de intentar el `push`, si el sistema detecta que la rama remota tiene cambios que no están en local (requiere un `pull`), **no intentes fusionar o hacer rebase automáticamente**.
- **Notificación:** Avisa inmediatamente al usuario de que existen cambios remotos pendientes.
- **Detención Obligatoria:** Termina la ejecución del workflow inmediatamente para que el usuario humano verifique y resuelva manualmente la integración.

## 4. Restricciones de Formato y Estilo
- **Modo Imperativo:** El mensaje debe iniciar con un verbo en inglés técnico (ej: `add`, `fix`, `update`, `remove`) seguido de la descripción en español.
- **Idioma:** Todo el cuerpo y contexto del mensaje debe ser en español.
- **Cero Asunciones:** Si la lógica del código no es clara, detente inmediatamente y solicita una breve explicación al usuario antes de redactar el commit.
- **Interfaz de Salida:** No entregues bloques de código descargables ni archivos. La confirmación de las acciones y los mensajes generados deben mostrarse como **texto plano en el chat**.

## 5. Ejecución Final
- Una vez realizados todos los commits por grupos, y solo si no hay discrepancias con la rama remota, finaliza el proceso ejecutando el `push` a la rama actual del repositorio en GitHub.
