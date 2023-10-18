import html from '@rollup/plugin-html';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import fs from 'fs';
import copy from 'rollup-plugin-copy';

const getHtmlTemplate = ({ bundle, title }) => {
  const index = fs.readFileSync('./src/index.html').toString();
  const content = fs.readFileSync('./src/content.html').toString();

  return index
    .replace('{{title}}', title)
    .replace('{{content}}', content)
    .replace('{{scripts}}', `<script>${bundle['index.js'].code}</script>`);
};

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'iife',
    compact: true,
  },
  plugins: [
    typescript(),
    postcss({ minimize: true }),
    terser(),
    html({ template: getHtmlTemplate }),
    copy({
      targets: [{ src: 'src/data.js', dest: 'dist/' }],
    }),
  ],
};
