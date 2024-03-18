// eslint-disable-next-line @typescript-eslint/no-var-requires
const ts_preset = require('ts-jest/presets/default-esm/jest-preset')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const puppeteer_preset = require('jest-puppeteer/jest-preset')

module.exports = Object.assign(
    ts_preset,
    puppeteer_preset
)
