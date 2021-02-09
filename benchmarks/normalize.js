const { valueToZDBigNumber, normalize, BigNumber } = require('../dist');
const Benchmark = require('benchmark');

Benchmark.options.minSamples = 200;
const PRECISION = 2;
const results = [];
const suite = new Benchmark.Suite();

const value = valueToZDBigNumber('323788616402133497883602337');

function legacyNormalize(n, decimals) {
  return new BigNumber(n)
    .dividedBy(new BigNumber('10').pow(decimals))
    .toString(10);
}

suite
  // add tests
  .add('legacyNormalize', () => {
    legacyNormalize(value, Math.floor(Math.random() * 24));
  })
  .add('normalizeWithMemoization', () => {
    normalize(value, Math.floor(Math.random() * 24));
  })

  // add listeners
  .on('cycle', event =>
    results.push({
      name: event.target.name,
      hz: event.target.hz,
      'margin of error': `±${Number(event.target.stats.rme).toFixed(2)}%`,
      'runs sampled': event.target.stats.sample.length,
    })
  )
  .on('complete', function() {
    const lowestHz = results.slice().sort((a, b) => a.hz - b.hz)[0].hz;

    console.table(
      results
        .sort((a, b) => b.hz - a.hz)
        .map(result => ({
          ...result,
          hz: Math.round(result.hz).toLocaleString(),
          numTimesFaster:
            Math.round((10 ** PRECISION * result.hz) / lowestHz) /
            10 ** PRECISION,
        }))
        .reduce((acc, { name, ...cur }) => ({ ...acc, [name]: cur }), {})
    );
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })

  .run({ async: false });
