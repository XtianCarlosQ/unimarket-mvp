# UniMarket MVP PWA

MVP funcional en HTML, CSS y JavaScript puro. No usa React ni backend todavía.

## Qué incluye

- Inicio con buscador, categorías rápidas, productos destacados y ofertas.
- Categorías con navegación hacia productos.
- Explorador de productos con filtros y favoritos demo.
- Detalle de producto con vendedor, precio, descripción, entrega y compra simulada.
- Mensajería hardcodeada con conversación simulada.
- Perfil / tienda con correo institucional demo, estadísticas y modo oscuro.
- Manifest y service worker para comportamiento PWA.
- Assets reemplazables en `/assets`.

## Cómo probar localmente

Por seguridad, los service workers no funcionan bien abriendo `index.html` directamente como archivo.
Usa un servidor local:

```bash
python -m http.server 8080
```

Luego abre:

```text
http://localhost:8080
```

## Cómo subir a GitHub Pages

1. Crea un repositorio llamado `unimarket-mvp`.
2. Sube todos los archivos de esta carpeta.
3. En GitHub, entra a Settings → Pages.
4. Selecciona la rama `main` y la carpeta `/root`.
5. Abre el enlace generado desde Chrome en Android.
6. Usa “Agregar a pantalla principal” para instalarlo como PWA.

## Reemplazar imágenes

Sustituye los SVG dentro de:

```text
assets/products/
assets/avatars/
```

Mantén el mismo nombre de archivo o actualiza la ruta en `js/data.js`.
