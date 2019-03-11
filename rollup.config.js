import { timestamp, babel, uglify } from 'rollup-plugin-bundleutils';

import resolve from 'rollup-plugin-node-resolve';
import glslify from 'rollup-plugin-glslify';
import { eslint } from 'rollup-plugin-eslint';

import { version } from './alien.js/package.json';

export default {
    input: 'src/Main.js',
    output: {
        file: 'public/assets/js/app.js',
        format: 'es'
    },
    plugins: [
        resolve(),
        glslify({ basedir: 'src/shaders' }),
        eslint({ include: ['src/**', 'alien.js/**'] }),
        babel({ compact: false }),
        uglify({
            output: {
                preamble: `//   _  /._  _  r${version.split('.')[1]} ${timestamp()}\n//  /_|///_'/ /`
            },
            safari10: true
        })
    ]
};
