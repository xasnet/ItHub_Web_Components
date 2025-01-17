import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
    return {
        base: mode === 'development' ? './' : '/ithub_web_components',
        css: {
            devSourcemap: mode === 'development',
        },
        server: {
            host: true,
            open: true,
        },
    };
});
