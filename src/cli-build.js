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
    // Detect the build type
    /compat/i.test(options.lodashPath) ? 'compat' : 'modern',
    // Requested the required methods
    `include=${methods.join(',')}`,
    options.production ? '--production' : '--development',
    // Map lodash-cli's export formats to ours
    `exports=${exportMap[options.exports]}`,
    '--silent'
  ];

  return new Promise(resolve => {
    cli(opts, out => resolve(out.source));
  });
}
