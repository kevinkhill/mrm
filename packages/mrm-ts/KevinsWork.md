# Kevin's Work

This has been a fun project to keep my hands busy while drinking coffee...

## Here's what I did

- Added a `.ts` script runner
  - `tsx` https://github.com/esbuild-kit/tsx
- Added a TypeScript build tool
  - `tsup` https://tsup.egoist.dev/
- Removed dependencies
  - `lodash` in favor of ES6/7 methods
  - `longest` in favor of ES6 `Array.reduce()`
  - `listify` in favor of [toNaturalList()](https://github.com/kevinkhill/mrm/tree/mrm-ts/packages/mrm-ts/src/lib/utils.ts#70)

## Building

```shell
npm i
npm run build
node .
```
