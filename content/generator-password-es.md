---
title: "Arquitectura de Seguridad: Diseño de un Generador de Credenciales Offline"
description: "Análisis técnico de una extensión basada en CSPRNG, Zero-Knowledge y Manifest V3."
date: "2025-01-19"
category: "Cybersecurity & Engineering"
slug: "secure-password-generator-architecture"
translationKey: "generator-password"
lang: "es"
---

## 1. Introducción: Hacia la Soberanía de la Identidad Digital

Esta extensión ha sido diseñada para generar contraseñas mediante un algoritmo criptográfico robusto. Surge como respuesta a la problemática actual de las herramientas web de terceros (SaaS), las cuales, aunque capaces de generar claves complejas, presentan vulnerabilidades arquitectónicas inherentes al ser susceptibles de interceptación y persistencia no deseada en registros (*logs*).

Este proyecto aborda y resuelve dos vulnerabilidades sistémicas en las soluciones convencionales:

1. **Baja Entropía y Determinismo:** La dependencia común de algoritmos pseudoaleatorios estándar facilita la predicción estadística, permitiendo a un atacante deducir la contraseña mediante criptoanálisis básico.
2. **Riesgo de Interceptación y Persistencia (Data Exposure):**
    El uso de generadores basados en servidor ("Server-Side") obliga a transmitir las credenciales recién generadas a través de la red. Esto expone el dato en dos puntos críticos de fallo:
    * **Interceptación en Tránsito:** Vulnerabilidad ante ataques *Man-in-the-Middle* (MitM) o compromiso de certificados TLS.
    * **Persistencia en Logs:** La posibilidad técnica de que el servidor remoto almacene la contraseña en sus registros de acceso o bases de datos, ya sea por malicia o por configuraciones de depuración negligentes.

### Propuesta Arquitectónica: Ejecución Local Estricta

Para erradicar la dependencia de terceros, proponemos una arquitectura de **ejecución exclusiva en el cliente ("Client-Side Only")**. A diferencia de las soluciones web tradicionales que delegan el procesamiento a un *backend*, esta extensión transfiere la integridad de la carga computacional al entorno local del navegador.

Esta autonomía se consigue mediante la implementación de un entorno de ejecución aislado que gestiona la lógica de la aplicación:

1. **Privacidad por Diseño (Privacy by Design):** Se garantiza un ciclo de vida efímero para los datos. La contraseña se genera y visualiza en la interfaz temporalmente; una vez que el elemento visual (Popup) se cierra, la información se purga inmediatamente de la memoria RAM del dispositivo, impidiendo la recuperación de datos residuales (Forensic RAM scraping mitigation).
2. **Ausencia de Telemetría:** Se elimina cualquier comunicación con APIs externas. El software opera bajo el principio de **"Conocimiento Cero" (Zero-Knowledge)**; ni el desarrollador ni el proveedor del navegador poseen acceso a las credenciales generadas. De este modo, el navegador evoluciona de un simple visualizador a un entorno de ejecución criptográfico seguro y autosuficiente.

## 2. Arquitectura Criptográfica y Calidad de la Aleatoriedad

El diseño de este sistema rompe con las implementaciones de software convencionales para adherirse a estándares de seguridad ofensiva. El núcleo del desarrollo se centra no solo en obtener números al azar, sino en asegurar que estos sean matemáticamente imposibles de anticipar.

### 2.1. Definición de Estándares: PRNG vs CSPRNG

Para comprender la justificación técnica de esta extensión, es fundamental distinguir entre los dos mecanismos de generación disponibles en los motores JavaScript modernos:

* **Math.random() (PRNG):** Es un Generador de Números Pseudoaleatorios. Funciona mediante una fórmula matemática fija. Si un atacante descubre el estado interno del algoritmo (la "semilla"), puede calcular matemáticamente todos los valores futuros. Es rápido, pero inseguro por diseño.
* **window.crypto (CSPRNG):** Es un Generador de Números Aleatorios Criptográficamente Seguro. No depende de una fórmula aislada, sino que actúa como una interfaz hacia el **recolector de entropía del sistema operativo**. Se alimenta de datos físicos impredecibles (como el movimiento milimétrico del ratón, las interrupciones del hardware o el ruido térmico de la CPU) para generar aleatoriedad real.

### 2.2. Análisis Comparativo

La siguiente tabla detalla por qué abandonar el estándar `Math.random` es la decisión arquitectónica más crítica del proyecto:

#### Tabla 1. Comparativa de Algoritmos de Generación

| Característica Técnica | Enfoque Estándar (Inseguro) | Enfoque Implementado (Seguro) |
| :--- | :--- | :--- |
| **Función Base** | `Math.random()` | `window.crypto.getRandomValues()` |
| **Clasificación** | PRNG (Pseudo-Aleatorio) | CSPRNG (Criptográficamente Seguro) |
| **Fuente de Entropía** | Algoritmo matemático + Semilla | Ruido de Hardware (Caos del sistema) |
| **Predictibilidad** | **Alta.** Si se conoce la semilla. | **Nula.** Estadísticamente impredecible. |
| **Vector de Ataque** | Predicción de secuencia. | Ninguno conocido factible actualmente. |

### 2.3. Distribución Uniforme y Eliminación de Sesgos

La seguridad no termina en la generación del número aleatorio; la conversión de ese número en un carácter legible (A-Z, 0-9) presenta su propio desafío matemático conocido como **"Sesgo de Módulo" (Modulo Bias)**.

Muchas implementaciones ingenuas toman un número aleatorio seguro y aplican una división simple para elegir una letra (ej. `random_int % longitud_alfabeto`). Si el rango de números generados (ej. 0-255 en un byte) no es un múltiplo exacto de la cantidad de caracteres disponibles, ciertos caracteres tendrán matemáticamente más probabilidades de salir que otros, creando un "favoritismo" estadístico que debilita la clave.

Nuestra arquitectura implementa algoritmos de rechazo (rejection sampling) que garantizan una **Distribución Uniforme**. Esto asegura que cada carácter posible tenga exactamente la misma probabilidad ($1/N$) de ser seleccionado, eliminando patrones ocultos que podrían ser explotados en un análisis de datos masivo.

## 3. Protocolos de Seguridad y Privacidad

La arquitectura de seguridad se ha diseñado bajo el principio de "mínimo privilegio" y aislamiento total. A continuación se detallan las capas de protección implementadas.

### 3.1. Aislamiento de Red y Entorno "Sandbox"

La aplicación opera bajo un modelo de **ejecución local estricta (Local Execution Context)**. A nivel de permisos, la extensión carece de capacidades para realizar peticiones externas (bloqueo explícito de `fetch`, `XHR` o `WebSocket` en el manifiesto).

Toda la lógica de generación ocurre dentro del *sandbox* de memoria del navegador. Esto garantiza matemáticamente que la contraseña nunca transita por la red, eliminando por completo la superficie de ataque para vectores como *Man-in-the-Middle* (MitM) o exfiltración de datos.

### 3.2. Endurecimiento contra Inyecciones (CSP y Manifest V3)

La extensión cumple rigurosamente con la especificación **Manifest V3** de Google, implementando una **Política de Seguridad de Contenido (CSP)** restrictiva.

* **Bloqueo de Scripts en Línea:** Se prohíbe la ejecución de código dentro del HTML (atributos `onclick` o `<script>` inline), lo que mitiga drásticamente el riesgo de ataques XSS (*Cross-Site Scripting*).
* **Separación de Contextos:** La lógica se inyecta exclusivamente mediante archivos externos compilados, y los eventos se gestionan de forma asíncrona mediante `addEventListener`.

### 3.3. Integridad de la Cadena de Suministro (Zero Dependencies)

Una vulnerabilidad crítica en el desarrollo web moderno es el **Ataque a la Cadena de Suministro** (*Supply Chain Attack*), donde librerías de terceros (`npm packages`) infectadas comprometen el software final.

Este proyecto se ha desarrollado siguiendo una filosofía de **"Cero Dependencias"** en su lógica crítica. El algoritmo de generación no importa librerías externas; todo el código ha sido escrito y auditado en TypeScript nativo. Esto asegura que no existen "cajas negras" ni puertas traseras introducidas por actores externos.

## 4. Resultados y Experiencia de Usuario (UX)

La implementación final resulta en una interfaz minimalista y libre de distracciones, diseñada para reducir la carga cognitiva del usuario al momento de generar credenciales, sin sacrificar potencia técnica.

Basándonos en la interfaz gráfica desarrollada, el sistema ofrece las siguientes capacidades:

* **Control Granular de Entropía:** A diferencia de generadores binarios, la extensión permite al usuario definir con precisión el espacio de búsqueda (Search Space). Mediante selectores independientes para mayúsculas, minúsculas, números y símbolos, el usuario adapta la complejidad a los requisitos de cada servicio.
* **Algoritmo de Filtrado de Ambigüedad:** Se ha implementado una lógica de saneamiento que excluye caracteres visualmente confusos (como `I` vs `l` o `0` vs `O`). Esto mejora la usabilidad y evita errores de transcripción manual (Human-Computer Interaction errors) sin comprometer significativamente la entropía.
* **Feedback Visual Inmediato:** La incorporación de controles deslizantes (*sliders*) ofrece una respuesta visual instantánea sobre la longitud y fortaleza teórica de la clave.
* **Integración Nativa con Clipboard API:** Se utiliza la API asíncrona del portapapeles (`navigator.clipboard`). Esto garantiza una transferencia de datos segura a la memoria del sistema, evitando los riesgos de seguridad de los antiguos comandos `execCommand`.

## 5. Conclusión

La creación de este generador de contraseñas valida la hipótesis de que es posible, y necesario, elevar el estándar de seguridad en las herramientas de uso cotidiano.

Hemos demostrado que al sustituir la conveniencia de los generadores pseudoaleatorios (`Math.random`) por la robustez de **CSPRNG** (`window.crypto`), y al blindar la ejecución mediante una arquitectura **Offline** y **Tipado Estático** (TypeScript), se elimina la necesidad de confiar ciegamente en servicios de terceros.

El resultado es un software de "Soberanía Digital": una herramienta transparente, auditable (Open Source bajo licencia MIT) y matemáticamente segura, que devuelve al usuario el control total sobre la génesis de su identidad digital.

---

### Referencias y Documentación Técnica

Para profundizar en los conceptos de seguridad mencionados en este artículo, se recomiendan las siguientes fuentes oficiales:

* **Aleatoriedad Criptográfica:**
  * [W3C Web Cryptography API - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
  * [NIST: Random Bit Generation Standards](https://csrc.nist.gov/projects/random-bit-generation)
* **Vulnerabilidades Web:**
  * [OWASP: Man-in-the-Middle (MitM) Attacks](https://owasp.org/www-community/attacks/Man-in-the-middle_attack)
  * [OWASP: Supply Chain Attacks](https://owasp.org/www-project-top-10/2021/A06_2021-Vulnerable_and_Outdated_Components/)
  * [Cross Site Scripting (XSS) Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
* **Matemáticas y Algoritmos:**
  * [Modulo Bias - Cryptography StackExchange](https://crypto.stackexchange.com/questions/394/how-much-bias-is-introduced-by-the-remainder-technique)
* **Estándares de Navegadores:**
  * [Chrome Developers: Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
