# ConTexto

**Buscador normativo · Universidad de Santiago de Chile**

ConTexto es un prototipo experimental orientado a la **búsqueda,
recuperación y exploración de documentación institucional normativa y
resolutiva**, desarrollado en el marco de un Trabajo de Graduación del
**Magíster en Ingeniería Informática de la Universidad de Santiago de
Chile (USACH)**.

> **Estado:** prototipo experimental en desarrollo. No corresponde a un
> sistema institucional oficial ni productivo de la USACH.

------------------------------------------------------------------------

## Propósito

ConTexto estudia alternativas para facilitar la localización de
documentación cuando la necesidad de información de una persona no
coincide necesariamente con la denominación, estructura o vocabulario
formal utilizado en los documentos.

La interfaz busca apoyar un flujo de **Buscar → Refinar → Explorar →
Interpretar → Continuar**, incorporando progresivamente documentos,
metadatos, fragmentos y relaciones producidos por el pipeline
documental.

## Contexto académico

El proyecto forma parte de un Trabajo de Graduación que combina
**Búsqueda y Recuperación de Información (BRI)** e **Interacción
Humano-Computador (HCI)**.

El trabajo considera la construcción de una colección de prueba,
consultas y juicios de relevancia; la implementación y comparación de
estrategias de recuperación; una evaluación *offline* bajo condiciones
comunes; la integración de la configuración seleccionada en ConTexto; y
una posterior evaluación con usuarios mediante tareas de búsqueda de
documento conocido (*Known-Item Search*).

## Estrategias de recuperación

  Configuración   Descripción
  --------------- -------------------------------------------------
  **C1**          Recuperación léxica basada en BM25F
  **C2**          Recuperación densa genérica
  **C3**          Recuperación densa condicionada a la tarea
  **C4**          Fusión léxico-semántica mediante RRF de C1 + C3

La métrica principal considerada para la evaluación *offline* es
**nDCG@10**, complementada con **MRR** y **Recall@k**.

## Pipeline documental

El flujo conceptual del proyecto se organiza como:

**Collector → Artifact → Ingesta → Documento lógico → Pasajes /
Relaciones → Índice → C1--C4**

ConTexto se encuentra aguas abajo de este proceso. La interfaz debe
consumir progresivamente los artefactos reales producidos por la ingesta
y evitar presentar información documental inventada como si proviniera
del corpus.

Durante la etapa actual se privilegia una integración sencilla:

``` text
Artefactos de ingesta
        ↓
JSON consolidado
        ↓
Data Store / Loader JavaScript
        ↓
Interfaz ConTexto
```

Esta integración estática permite trabajar con datos reales sin
confundir el buscador temporal del frontend con la arquitectura
experimental definitiva.

## Relaciones documentales

El pipeline contempla extracción mediante **GLiNER + reglas**,
conservando trazabilidad y evidencia cuando estén disponibles.

ConTexto puede representar relaciones como `MODIFICA →`,
`MODIFICADO POR ←`, `DEROGA →`, `DEROGADO POR ←`, `COMPLEMENTA →` y
`REFERENCIA →`.

Las relaciones extraídas automáticamente no constituyen por sí solas una
determinación jurídica definitiva. Del mismo modo, un estado técnico
como `VALIDATED` o `REVIEW` pertenece al procesamiento del pipeline y no
equivale a la vigencia jurídica de un documento.

## Interfaz

Las principales vistas del prototipo incluyen **Inicio**, **Explorar**,
**Guía de búsqueda**, **Acerca de ConTexto**, **Resultados** y **Vista
rápida**.

La identidad principal se presenta como:

**USACH \| ConTexto**\
**Buscador normativo**

Las páginas secundarias comparten un lenguaje visual transversal,
manteniendo objetivos distintos: Explorar se orienta al descubrimiento
documental; Guía de búsqueda al apoyo de la interacción; y Acerca de
ConTexto al contexto académico, investigativo y metodológico del
proyecto.

## Tecnologías

Según la etapa de desarrollo, el proyecto considera HTML, CSS y
JavaScript para la interfaz; Python para procesamiento e ingesta; GLiNER
y reglas para extracción; Elasticsearch para la arquitectura
experimental; FastAPI para una futura capa de servicios; y herramientas
del ecosistema Hugging Face / Sentence-Transformers para recuperación
densa.

La presencia de estas tecnologías no implica que toda la integración se
encuentre actualmente habilitada en la versión publicada del prototipo.

## Alcances

-   ConTexto es un **prototipo experimental**, no un portal
    institucional oficial.
-   La colección de desarrollo puede no representar la totalidad de la
    documentación institucional.
-   No deben inferirse estados jurídicos sin información explícita y
    suficientemente validada.
-   Las relaciones automáticas requieren control de calidad y, cuando
    corresponda, validación humana.
-   La interfaz y la cobertura documental pueden evolucionar conforme
    avance el Trabajo de Graduación.
-   La búsqueda local utilizada durante el desarrollo del frontend no
    debe confundirse con C1--C4.

## Informe del Trabajo de Graduación

El informe académico asociado al proyecto se encuentra **en
elaboración**. Cuando exista una versión publicable, el repositorio y la
sección **Acerca de ConTexto** podrán incorporar su descarga.

Hasta entonces no se debe publicar un enlace ficticio o un documento de
reemplazo.

## Estado del proyecto

**En desarrollo activo.**

Proyecto desarrollado en el contexto del **Magíster en Ingeniería
Informática de la Universidad de Santiago de Chile**.

**BRI · Búsqueda y Recuperación de Información**\
**HCI · Interacción Humano-Computador**
