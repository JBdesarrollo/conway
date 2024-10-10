import { defineConfig } from 'vite';

export default defineConfig({
    base: '/', // Cambia esto si tu aplicación se servirá en un subdirectorio
    build: {
        outDir: 'dist', // Directorio donde se generarán los archivos de producción
        assetsDir: 'assets', // Directorio para assets dentro de 'dist'
        sourcemap: false, // Desactiva el sourcemap en producción
    },
    root: 'src'
});
