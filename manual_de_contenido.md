# Guía de Gestión de Contenido

Este proyecto está diseñado para que puedas agregar capítulos, imágenes y audios sin tocar el código fuente principal.

## 1. Estructura de Carpetas de Medios

Coloca tus archivos en las siguientes carpetas:

- **Imágenes de Fondo**: `assets/images/scenes/`
  - Ejemplo: `coast_1502.jpg`
- **Personajes**: `assets/images/characters/`
  - Ejemplo: `cacique_neutral.png`
  - Recomendación: Usa formato PNG con fondo transparente.
- **Portadas de Capítulos**: `assets/images/`
  - Ejemplo: `chapter1-thumb.jpg`
- **Música de Fondo**: `assets/audio/bgm/`
- **Efectos de Sonido**: `assets/audio/sfx/`

## 2. Cómo Crear o Editar Capítulos

Los capítulos se definen en archivos JSON dentro de la carpeta `data/`.
Para editar el **Capítulo 1**, abre `data/chapter-1.json`.

### Estructura del JSON (Ejemplo)

```json
{
  "id": "chapter-1",
  "title": "Título del Capítulo",
  "scenes": [
    {
      "id": "scene-01",
      "background": "assets/images/scenes/mi_fondo.jpg",
      "characters": [
        { 
            "name": "NombrePJ", 
            "image": "assets/images/characters/mi_pj.png", 
            "position": "left" 
        }
      ],
      "dialogue": [
        { "speaker": "Narrador", "text": "Hola mundo." },
        { "speaker": "NombrePJ", "text": "Este es un diálogo." }
      ],
      "choices": [
        {
          "text": "Ir a la siguiente escena",
          "nextSceneId": "scene-02",
          "effect": { "diplomacy": 1 }
        }
      ]
    }
  ]
}
```

### Explicación de Campos
- **id**: Identificador único de la escena.
- **background**: Ruta a la imagen de fondo.
- **characters**: Lista de personajes en pantalla.
  - `position`: puede ser "left" (izquierda), "center" (centro), o "right" (derecha).
- **choices**: Botones de decisión.
  - `nextSceneId`: El ID de la escena a la que lleva esta opción.
  - `effect`: Cambios en las estadísticas (ej. `diplomacy`, `courage`).

## 3. Sistema de Temas Personalizables

Los temas se definen en `data/shop-items.json`. Puedes agregar nuevos colores editando las variables CSS proporcionadas:

```json
{
    "id": "blue_white_theme",
    "name": "Azul y Blanco",
    "type": "theme",
    "price": 100,
    "colors": {
        "--color-primary": "#0047AB",
        "--color-secondary": "#FFFFFF",
        "--color-bg": "#F5F7FA"
    }
}
```

## 4. Recompensas por Logros

Para vincular un logro con una recompensa visual (traje o adorno), edita `data/achievement-rewards.json`:

```json
"id_del_logro": {
    "rewardId": "identificador_de_item",
    "name": "Nombre de la Recompensa",
    "type": "outfit",
    "icon": "🎭"
}
```

## 5. Tipos de Trivia Avanzada

Ahora puedes crear preguntas más allá de la opción múltiple en `data/questions.json`:

- **Boleano**: `"type": "true_false"` (usa `true` o `false` en `correct`).
- **Completar**: `"type": "fill_blank"` (comparación de texto).
- **Matching**: `"type": "matching"` (relacionar pares).
- **Timeline**: `"type": "timeline"` (orden cronológico).

## 6. Modo Cooperativo Local

El juego detecta automáticamente el modo cooperativo si se inicia desde el botón correspondiente en el menú. Los turnos se alternan entre el Jugador 1 y el Jugador 2 después de cada pregunta respondida, permitiendo un desafío compartido en el mismo dispositivo.

## 7. Agregar Nuevos Capítulos

1. Crea un archivo `chapter-X.json` en `data/`.
2. Registra el nuevo capítulo en `data/chapters.json` agregando un bloque con su información (título, descripción, año).
