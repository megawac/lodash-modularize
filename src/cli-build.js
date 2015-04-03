import cli from 'lodash-cli';
import Promise from 'bluebird';

// Valid exports are “amd”, “commonjs”, “es”, “global”, “iojs”, “node”, “npm”, & “none”.
const exportMap = {
  umd: 'amd,commonjs,global,iojs',
  amd: 'amd',
  cjs: 'commonjs'
};

export default function build(methods, options) {
  let opts = [
    /compat/i.test(options.lodash) ? 'compat' : 'modern',
    `include=${methods.join(',')}`,
    // '--stdout',
    '--silent',
    options.production ? '--production' : '--development',
    `exports=${exportMap[options.outFormat]}`
  ];

  return new Promise(resolve => {
    cli(opts, out => resolve(out.source));
  });
}
