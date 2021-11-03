# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [4.3.0](https://github.com/aave/aave-js/compare/v4.1.3...v4.3.0) (2021-11-03)


### Features

* add APR and APY fields to computed reserve ([#286](https://github.com/aave/aave-js/issues/286)) ([a5398ae](https://github.com/aave/aave-js/commit/a5398aea7778096e0bfc2ed9ed83d75cb0f18bc5))


### Bug Fixes

* fix stable rates ([#288](https://github.com/aave/aave-js/issues/288)) ([88a919b](https://github.com/aave/aave-js/commit/88a919b63158b239d10cee499342704ebb64e184))

## [4.2.0](https://github.com/aave/aave-js/compare/v4.1.3...v4.2.0) (2021-11-02)


### Features

* add APR and APY fields to computed reserve ([#286](https://github.com/aave/aave-js/issues/286)) ([a5398ae](https://github.com/aave/aave-js/commit/a5398aea7778096e0bfc2ed9ed83d75cb0f18bc5))

### [4.1.3](https://github.com/aave/aave-js/compare/v4.1.2...v4.1.3) (2021-10-25)


### Bug Fixes

* update to paraswap v5 ([#269](https://github.com/aave/aave-js/issues/269)) ([01e6c10](https://github.com/aave/aave-js/commit/01e6c1022d37176eec2bbb69dfde15e7fd34cb53))

### [4.1.2](https://github.com/aave/aave-js/compare/v4.1.1...v4.1.2) (2021-10-22)


### Bug Fixes

* userReserve deposit and borrow rate calculations ([#272](https://github.com/aave/aave-js/issues/272)) ([52c3356](https://github.com/aave/aave-js/commit/52c33566cc646a1f20e73eedfa17ee899b0efdc5))

### [4.1.1](https://github.com/aave/aave-js/compare/v4.1.0...v4.1.1) (2021-10-21)


### Bug Fixes

* account for approximation error in deposit and borrow rates ([#270](https://github.com/aave/aave-js/issues/270)) ([de6a678](https://github.com/aave/aave-js/commit/de6a678f4d013a1dd9614ad2642c111aea65860f))
* remove unnecessary [skip ci] ([50b3a88](https://github.com/aave/aave-js/commit/50b3a88ab1c5706f41e6c01a9bc9afc9bcf5e5b0))

## [4.1.0](https://github.com/aave/aave-js/compare/v4.0.2...v4.1.0) (2021-09-21)


### Features

* added avalanche fork network and chain id ([#253](https://github.com/aave/aave-js/issues/253)) ([58feb26](https://github.com/aave/aave-js/commit/58feb26dbbc81e410738a962342d8cab5376b660))


### Bug Fixes

* incentive calculations ([#251](https://github.com/aave/aave-js/issues/251)) ([6a5ddd6](https://github.com/aave/aave-js/commit/6a5ddd6f8526bac6667096b9581e5209031987dd))

### [4.0.2](https://github.com/aave/aave-js/compare/v4.0.1...v4.0.2) (2021-09-13)


### Bug Fixes

* set recommendation for swap/repaywithcollateral ([#247](https://github.com/aave/aave-js/issues/247)) ([a959500](https://github.com/aave/aave-js/commit/a9595007c30e57562234c647b0d9b4bab9bb0d14))

### [4.0.1](https://github.com/aave/aave-js/compare/v4.0.0...v4.0.1) (2021-08-25)


### Bug Fixes

* remove log ([#230](https://github.com/aave/aave-js/issues/230)) ([45a3f9b](https://github.com/aave/aave-js/commit/45a3f9bd27a8f52735eedd06f9afad25b55643a4))

## [4.0.0](https://github.com/aave/aave-js/compare/v3.3.0...v4.0.0) (2021-08-25)


### Features

* Added new configuration to not use hardcoded addresses. WIP: ch… ([#224](https://github.com/aave/aave-js/issues/224)) ([9f6430f](https://github.com/aave/aave-js/commit/9f6430fceba59694480d1d533d17fb2875b98c49))


### Bug Fixes

* fix interface ([#227](https://github.com/aave/aave-js/issues/227)) ([9971d35](https://github.com/aave/aave-js/commit/9971d35dac06c1f2a0d2369bef3ab0f06d17ff99))

## [3.3.0](https://github.com/aave/aave-js/compare/v3.2.0...v3.3.0) (2021-08-20)


### Features

* added mumbai faucet ([#223](https://github.com/aave/aave-js/issues/223)) ([9296571](https://github.com/aave/aave-js/commit/929657191d1cb6dcfa370c961327fd106756392b))


### Bug Fixes

* update provider typing ([#225](https://github.com/aave/aave-js/issues/225)) ([9cee2ad](https://github.com/aave/aave-js/commit/9cee2ada3e8e62ee2e1b98ed8423499597593e92))

## [3.2.0](https://github.com/aave/aave-js/compare/v3.1.0...v3.2.0) (2021-07-27)


### Features

* add swap adapter on polygon ([#208](https://github.com/aave/aave-js/issues/208)) ([66cff72](https://github.com/aave/aave-js/commit/66cff729299f11e721538488d987ff377eb0b616))


### Bug Fixes

* drop fee deduction as paraswap needs exact amount ([#196](https://github.com/aave/aave-js/issues/196)) ([aad2d41](https://github.com/aave/aave-js/commit/aad2d41e323e2ff429001fcc2baace738865f012))

## [3.1.0](https://github.com/aave/aave-js/compare/v3.0.0...v3.1.0) (2021-06-21)


### Features

* integrate paraswap adapter ([#127](https://github.com/aave/aave-js/issues/127)) ([d17734c](https://github.com/aave/aave-js/commit/d17734c19d6ce10a22358e156747e8fbbca6af5d))

## [3.0.0](https://github.com/aave/aave-js/compare/v2.7.2...v3.0.0) (2021-06-17)


### Features

* added emissionEndTimestamp to rewards info object. Updated calc… ([#156](https://github.com/aave/aave-js/issues/156)) ([2c3aa16](https://github.com/aave/aave-js/commit/2c3aa162c1db0b366323c4bef6859d8bce5e33fe))


### Bug Fixes

* added 1M gas as default by polygon network tx ([#151](https://github.com/aave/aave-js/issues/151)) ([8c4131a](https://github.com/aave/aave-js/commit/8c4131acef1a908d69a328a6925a1caf65df7375))

### [2.7.2](https://github.com/aave/aave-js/compare/v2.7.1...v2.7.2) (2021-03-31)

### [2.7.1](https://github.com/aave/aave-js/compare/v2.7.0...v2.7.1) (2021-03-31)


### Bug Fixes

* updated matic new deployment addresses ([#132](https://github.com/aave/aave-js/issues/132)) ([2396e27](https://github.com/aave/aave-js/commit/2396e271892ae9d1be866824bacf0e025bb430e9))

## [2.7.0](https://github.com/aave/aave-js/compare/v2.6.0...v2.7.0) (2021-03-30)


### Features

* polygon proto ([#123](https://github.com/aave/aave-js/issues/123)) ([50747c3](https://github.com/aave/aave-js/commit/50747c3baaaab65681464ab11895be67b5237663))


### Bug Fixes

* make gas estimation non optional ([#130](https://github.com/aave/aave-js/issues/130)) ([82a4178](https://github.com/aave/aave-js/commit/82a417819e7cb9eae6a779d29749b0a6ccbf494e))

## [2.6.0](https://github.com/aave/aave-js/compare/v2.5.0...v2.6.0) (2021-03-16)


### Features

* add calculateReserveDebt function ([#90](https://github.com/aave/aave-js/issues/90)) ([53ee066](https://github.com/aave/aave-js/commit/53ee06640879c3a30f15ff9d045166964201d89f))
* new weth gateway & AMM market ([#96](https://github.com/aave/aave-js/issues/96)) ([fe5881a](https://github.com/aave/aave-js/commit/fe5881ace599bfa21c64cc351c6317d0c15563cb))
* updated gas margin to 30% ([#122](https://github.com/aave/aave-js/issues/122)) ([776904c](https://github.com/aave/aave-js/commit/776904c1de0a56042f9559f49a6cc62a19b9c6b1))


### Bug Fixes

* add mainnet address and fix max amount ([#101](https://github.com/aave/aave-js/issues/101)) ([ca709b3](https://github.com/aave/aave-js/commit/ca709b3ff8d8383b2b23784770feba613b4d93b2))
* move linear calculation from v1 to common ([#115](https://github.com/aave/aave-js/issues/115)) ([ecce2b0](https://github.com/aave/aave-js/commit/ecce2b0299bd8cacdcaf0cb323c382994c1a5636))
* resolve eslint config issues with prettier deprecation ([#117](https://github.com/aave/aave-js/issues/117)) ([5638f5f](https://github.com/aave/aave-js/commit/5638f5f008e217626920702cd0146c2d2eca5913))
* skip release step on forks ([#118](https://github.com/aave/aave-js/issues/118)) ([21fdb9a](https://github.com/aave/aave-js/commit/21fdb9a4551be9fba746b1362c29cd488b02eb73))

## [2.5.0](https://github.com/aave/aave-js/compare/v2.4.1...v2.5.0) (2021-02-17)


### Features

* add flashliquidation adapter to tx-builder ([#58](https://github.com/aave/aave-js/issues/58)) ([073606e](https://github.com/aave/aave-js/commit/073606e5971754521470ebd8d0e4980caf436bcb))
* add gas calculations to the response of the tx  ([#76](https://github.com/aave/aave-js/issues/76)) ([3ee1934](https://github.com/aave/aave-js/commit/3ee193459b0fd0811527a870a4d17fb4bd7a5b56))
* reapply ray pow improvements ([#82](https://github.com/aave/aave-js/issues/82)) ([14986a1](https://github.com/aave/aave-js/commit/14986a152f1d0e5c2565e4d5eafb08be5f42fa53)), closes [#81](https://github.com/aave/aave-js/issues/81)

### [2.4.1](https://github.com/aave/aave-js/compare/v2.4.0...v2.4.1) (2021-02-10)


### Bug Fixes

* explicitly push tag ([#57](https://github.com/aave/aave-js/issues/57)) ([3b2a65d](https://github.com/aave/aave-js/commit/3b2a65df7e3f8d2b6f2de09d9f56311ef688c2c1))

## [2.4.0](https://github.com/aave/aave-js/compare/v2.3.1...v2.4.0) (2021-02-03)


### Features

* added capability to use recommended gas limits for protocol actions if needed ([#52](https://github.com/aave/aave-js/issues/52)) ([26bec1f](https://github.com/aave/aave-js/commit/26bec1f0f3696c270d6b3e0cfae452238afc86a1))


### Bug Fixes

* skip prereleaes for release ([#55](https://github.com/aave/aave-js/issues/55)) ([dec1284](https://github.com/aave/aave-js/commit/dec128417d26e0dcf59725c0cd5be52ab9c5730c))

### [2.3.1](https://github.com/aave/aave-js/compare/v2.3.0...v2.3.1) (2021-01-26)


### Bug Fixes

* actually run ci release on master ([#39](https://github.com/aave/aave-js/issues/39)) ([850f386](https://github.com/aave/aave-js/commit/850f3862a63094fe6556b37a077af881942a6e3a))
* allow wp shaking ([bc54e8a](https://github.com/aave/aave-js/commit/bc54e8a164d8118ca308a70a4dad8212263f1a0e))
* another try fixing ci :sob: ([#41](https://github.com/aave/aave-js/issues/41)) ([7d4121c](https://github.com/aave/aave-js/commit/7d4121c891f32bbbca288eda409d6e737c39b5e5))
* fix some other readme referenes ([83c2d73](https://github.com/aave/aave-js/commit/83c2d73818e349c7ee7438995c7bad0da430fda1))
* moved contract initialization inside conditional ([#40](https://github.com/aave/aave-js/issues/40)) ([a75ee67](https://github.com/aave/aave-js/commit/a75ee671aa20d659da8d3e52b9445f428ee6486e))
* update readme ([15f2faf](https://github.com/aave/aave-js/commit/15f2faf821b54343694e9466331222a0c62b7bef))
