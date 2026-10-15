# Landing page · División Telcos · PROINNOVATEC

Landing de una sola página con React 19, TypeScript, Vite y Tailwind CSS 4.

## Comandos

```bash
npm install        # una sola vez
npm run dev        # desarrollo en http://127.0.0.1:5180
npm run build      # genera la carpeta dist/ (esa carpeta es la que se publica)
npm run preview    # prueba local de lo compilado
```

## Dónde se edita el contenido

Todos los textos están en **`src/content.ts`**: titular, servicios, valores, cifras, caso de experiencia,
certificaciones y datos de contacto. Cambia el texto y vuelve a ejecutar `npm run build`.

Las imágenes están en `public/` (`images/`, `certs/`, `brand/`). Para cambiar una foto, reemplaza el archivo
o apunta la ruta en `src/content.ts`.

## Formulario

- Sin configuración, el botón abre el correo del visitante con el mensaje ya redactado hacia `ventas@proinnovatec.com`.
- Para enviarlo a un servidor, crea un archivo `.env` con:

  ```
  VITE_CONTACT_ENDPOINT=https://tu-servidor/api/contacto
  ```

  La landing hace un `POST` JSON con `name`, `company`, `email`, `phone`, `message` y `source`.
  (El sitio principal ya recibe mensajes en `POST /contacto`, pero con protección CSRF; para usarlo hay que
  exponer un endpoint de API.)

## Movimiento

Idea: **señal viajando por una red**.

- Malla de nodos con paquetes que recorren los enlaces y una onda que ilumina los nodos (`NetworkMesh.tsx`).
- Titulares que se "transmiten" palabra por palabra (`SplitText`), imágenes que se descubren con una máscara.
- Cifras que cuentan hacia arriba, marcas de verificación que se dibujan, marquesina de certificaciones.
- Luz que sigue al puntero en las tarjetas, barrido de luz en botones, paralaje suave y barra de progreso.
- Con `prefers-reduced-motion` no hay desplazamientos ni máscaras: el contenido aparece completo y las cifras
  muestran su valor final.

## Publicar

Sube el contenido de `dist/` a cualquier hosting estático (o a una carpeta de Apache/Nginx). No necesita PHP.
