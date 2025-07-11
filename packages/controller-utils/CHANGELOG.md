# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Add convenience variables for calculating the number of milliseconds in a higher unit of time
  - `SECOND` / `SECONDS`
  - `MINUTE` / `MINUTES`
  - `HOUR` / `HOURS`
  - `DAY` / `DAYS`

### Changed

- Update `createServicePolicy` to reduce circuit break duration from 30 minutes to 2 minutes ([#6015](https://github.com/MetaMask/core/pull/6015))
  - When hitting an API, this reduces the default duration for which requests to the API are paused when perceived to be unavailable

## [11.10.0]

### Added

- Add `TransactionBatch` in approval types enum ([#5793](https://github.com/MetaMask/core/pull/5793))
- Add Base network to default networks ([#5902](https://github.com/MetaMask/core/pull/5902))
  - Add `base-mainnet` to `BUILT_IN_NETWORKS`
  - Add `base-mainnet` to `InfuraNetworkType`
  - Add `BaseMainnet` to `BuiltInNetworkName` enum
  - Add `base-mainnet` to `ChainId` type
  - Add `BaseMainnet` to `NetworksTicker` enum
  - Add `BaseMainnet` to `BlockExplorerUrl` quasi-enum
  - Add `BaseMainnet` to `NetworkNickname` quasi-enum

## [11.9.0]

### Added

- Add `HttpError` class for errors representing non-200 HTTP responses ([#5809](https://github.com/MetaMask/core/pull/5809))

### Changed

- Improved circuit breaker behavior to no longer consider HTTP 4XX responses as service failures ([#5798](https://github.com/MetaMask/core/pull/5798), [#5809](https://github.com/MetaMask/core/pull/5809))
  - Changed from using `handleAll` to `handleWhen(isServiceFailure)` in circuit breaker policy
  - This ensures that expected error responses (like 405 Method Not Allowed and 429 Rate Limited) don't trigger the circuit breaker

## [11.8.0]

### Added

- Add Monad Testnet to various constants, enums, and types ([#5724](https://github.com/MetaMask/core/pull/5724))
  - Add `monad-testnet` to `BUILT_IN_NETWORKS`
  - Add `monad-testnet` and `megaeth-testnet` to `BUILT_IN_CUSTOM_NETWORKS_RPC`
  - Add `MonadTestnet` to `BuiltInNetworkName` enum
  - Add `monad-testnet` to `ChainId` type
  - Add `MonadTestnet` to `NetworksTicker` enum
  - Add `MonadTestnet` to `BlockExplorerUrl` quasi-enum
  - Add `MonadTestnet` to `NetworkNickname` quasi-enum

## [11.7.0]

### Added

- Re-export `ConstantBackoff` and `ExponentialBackoff` from `cockatiel` ([#5492](https://github.com/MetaMask/core/pull/5492))
  - These can be used to customize service policies
- Add optional `backoff` option to `createServicePolicy` ([#5492](https://github.com/MetaMask/core/pull/5492))
  - This is mainly useful in tests to force the backoff strategy to be constant rather than exponential
- Add `BUILT_IN_CUSTOM_NETWORKS_RPC`, which includes MegaETH ([#5495](https://github.com/MetaMask/core/pull/5495))
- Add `CustomNetworkType` quasi-enum and type, which includes MegaETH ([#5495](https://github.com/MetaMask/core/pull/5495))
- Add `BuiltInNetworkType` type union, which encompasses all Infura and custom network types ([#5495](https://github.com/MetaMask/core/pull/5495))

### Changed

- Add MegaETH Testnet to various constants, enums, and types ([#5495](https://github.com/MetaMask/core/pull/5495))
  - Add `MEGAETH_TESTNET` to `TESTNET_TICKER_SYMBOLS`
  - Add `megaeth-testnet` to `BUILT_IN_NETWORKS`
  - Add `MegaETHTestnet` to `BuiltInNetworkName` enum
  - Add `megaeth-testnet` to `ChainId` type
  - Add `MegaETHTestnet` to `NetworksTicker` enum
  - Add `MegaETHTestnet` to `BlockExplorerUrl` quasi-enum
  - Add `MegaETHTestnet` to `NetworkNickname` quasi-enum
- `CHAIN_ID_TO_ETHERS_NETWORK_NAME_MAP` is now typed as `Record<string, BuiltInNetworkName>` rather than `Record<ChainId, BuiltInNetworkName>` ([#5495](https://github.com/MetaMask/core/pull/5495))
- `NetworkType` quasi-enum now includes all keys/values from `CustomNetworkType` ([#5495](https://github.com/MetaMask/core/pull/5495))

## [11.6.0]

### Changed

- Bump `@ethereumjs/util` from `^8.1.0` to `^9.1.0` ([#5347](https://github.com/MetaMask/core/pull/5347))
- Bump `@metamask/utils` from `^11.1.0` to `^11.2.0` ([#5301](https://github.com/MetaMask/core/pull/5301))

## [11.5.0]

### Added

- Add utility function `createServicePolicy` for reducing boilerplate for service classes ([#5141](https://github.com/MetaMask/core/pull/5141), [#5154](https://github.com/MetaMask/core/pull/5154), [#5143](https://github.com/MetaMask/core/pull/5143), [#5149](https://github.com/MetaMask/core/pull/5149), [#5188](https://github.com/MetaMask/core/pull/5188), [#5192](https://github.com/MetaMask/core/pull/5192), [#5225](https://github.com/MetaMask/core/pull/5225))
  - Export constants `DEFAULT_CIRCUIT_BREAK_DURATION`, `DEFAULT_DEGRADED_THRESHOLD`, `DEFAULT_MAX_CONSECUTIVE_FAILURES`, and `DEFAULT_MAX_RETRIES`
  - Export types `ServicePolicy` and `CreateServicePolicyOptions`
  - Re-export `BrokenCircuitError`, `CircuitState`, `handleAll`, and `handleWhen` from `cockatiel`
  - Export `CockatielEvent` type, an alias of the `Event` type from `cockatiel`

### Changed

- Bump `@metamask/utils` from `^11.0.1` to `^11.1.0` ([#5223](https://github.com/MetaMask/core/pull/5223))

## [11.4.5]

### Changed

- Bump `@metamask/utils` from `^10.0.0` to `^11.0.1` ([#5080](https://github.com/MetaMask/core/pull/5080))

## [11.4.4]

### Fixed

- Make implicit peer dependencies explicit ([#4974](https://github.com/MetaMask/core/pull/4974))
  - Add the following packages as peer dependencies of this package to satisfy peer dependency requirements from other dependencies:
    - `@babel/runtime@^7.0.0` (required by `@metamask/ethjs-unit`)
  - These dependencies really should be present in projects that consume this package (e.g. MetaMask clients), and this change ensures that they now are.
  - Furthermore, we are assuming that clients already use these dependencies, since otherwise it would be impossible to consume this package in its entirety or even create a working build. Hence, the addition of these peer dependencies is really a formality and should not be breaking.
- Correct ESM-compatible build so that imports of the following packages that re-export other modules via `export *` are no longer corrupted: ([#5011](https://github.com/MetaMask/core/pull/5011))
  - `bn.js`
  - `eth-ens-namehash`
  - `fast-deep-equal`

## [11.4.3]

### Changed

- The `NetworkNickname` for mainnet is now `Ethereum Mainnet` instead of `Mainnet`. And the display name for Linea is now `Linea` instead of `Linea Mainnet`. ([#4865](https://github.com/MetaMask/core/pull/4865))

## [11.4.2]

### Changed

- Move BigNumber.js from devDependencies to dependencies ([#4873](https://github.com/MetaMask/core/pull/4873))

## [11.4.1]

### Changed

- Bump `@metamask/utils` from `^9.1.0` to `^10.0.0` ([#4831](https://github.com/MetaMask/core/pull/4831))

## [11.4.0]

### Added

- Add `isEqualCaseInsensitive` function for case-insensitive string comparison ([#4811](https://github.com/MetaMask/core/pull/4811))

## [11.3.0]

### Added

- Add types `TraceContext`, `TraceRequest`, `TraceCallback` ([#4655](https://github.com/MetaMask/core/pull/4655))
  - Migrated from `@metamask/transaction-controller@36.2.0`.

### Fixed

- Produce and export ESM-compatible TypeScript type declaration files in addition to CommonJS-compatible declaration files ([#4648](https://github.com/MetaMask/core/pull/4648))
  - Previously, this package shipped with only one variant of type declaration
    files, and these files were only CommonJS-compatible, and the `exports`
    field in `package.json` linked to these files. This is an anti-pattern and
    was rightfully flagged by the
    ["Are the Types Wrong?"](https://arethetypeswrong.github.io/) tool as
    ["masquerading as CJS"](https://github.com/arethetypeswrong/arethetypeswrong.github.io/blob/main/docs/problems/FalseCJS.md).
    All of the ATTW checks now pass.
- Remove chunk files ([#4648](https://github.com/MetaMask/core/pull/4648)).
  - Previously, the build tool we used to generate JavaScript files extracted
    common code to "chunk" files. While this was intended to make this package
    more tree-shakeable, it also made debugging more difficult for our
    development teams. These chunk files are no longer present.

## [11.2.0]

### Added

- Add `BlockExplorerUrl` object and type for looking up the block explorer URL of any Infura network ([#4268](https://github.com/MetaMask/core/pull/4286))
- Add `NetworkNickname` object and type for looking up the common nickname for any Infura network ([#4268](https://github.com/MetaMask/core/pull/4286))
- Add `Partialize` type for making select keys in an object type optional ([#4268](https://github.com/MetaMask/core/pull/4286))
- `toHex` now supports converting a `bigint` into a hex string ([#4268](https://github.com/MetaMask/core/pull/4286))

## [11.1.0]

### Added

- Add default snap dialog to ApprovalType ([#4630](https://github.com/MetaMask/core/pull/4630))

## [11.0.2]

### Changed

- Bump TypeScript version to `~5.0.4` and set `moduleResolution` option to `Node16` ([#3645](https://github.com/MetaMask/core/pull/3645))
- Bump `@metamask/utils` from `^9.0.0` to `^9.1.0` ([#4529](https://github.com/MetaMask/core/pull/4529))

## [11.0.1]

### Changed

- Bump `@metamask/rpc-errors` from `6.2.1` to `^6.3.1` ([#4516](https://github.com/MetaMask/core/pull/4516))
- Bump `@metamask/utils` from `^8.3.0` to `^9.0.0` ([#4516](https://github.com/MetaMask/core/pull/4516))

## [11.0.0]

### Added

- Add `NFT_API_VERSION` and `NFT_API_TIMEOUT` constants ([#4312](https://github.com/MetaMask/core/pull/4312))

### Changed

- **BREAKING:** Bump minimum Node version to 18.18 ([#3611](https://github.com/MetaMask/core/pull/3611))

### Removed

- **BREAKING:** Remove `EthSign` from `ApprovalType` ([#4319](https://github.com/MetaMask/core/pull/4319))
  - This represented an `eth_sign` approval, but support for that RPC method is being removed, so this is no longer needed.

## [10.0.0]

### Changed

- **BREAKING:** Changed price and token API endpoints from `*.metafi.codefi.network` to `*.api.cx.metamask.io` ([#4301](https://github.com/MetaMask/core/pull/4301))

## [9.1.0]

### Added

- Export new constant for the NFT API's url ([#4030](https://github.com/MetaMask/core/pull/4030))
- Add support for wider range of SIWE messages ([#4141](https://github.com/MetaMask/core/pull/4141))

### Changed

- Bump TypeScript version to ~4.9.5 ([#4084](https://github.com/MetaMask/core/pull/4084))

### Fixed

- Add guards against prototype-polluting assignments ([#4041](https://github.com/MetaMask/core/pull/4041))

## [9.0.2]

### Fixed

- Allow `toChecksumHexAddress` to take and handle non-string inputs again, which was removed in 8.0.4 ([#4046](https://github.com/MetaMask/core/pull/4046))

## [9.0.1]

### Fixed

- Fix `types` field in `package.json` ([#4047](https://github.com/MetaMask/core/pull/4047))

## [9.0.0]

### Added

- **BREAKING**: Add ESM build ([#3998](https://github.com/MetaMask/core/pull/3998))
  - It's no longer possible to import files from `./dist` directly.
- Add support for Linea Sepolia to various constants, types, and type guards ([#3995](https://github.com/MetaMask/core/pull/3995))
  - Add `LINEA_SEPOLIA` to `TESTNET_TICKER_SYMBOLS` constant
  - Add `0xe705` to `CHAIN_ID_TO_ETHERS_NETWORK_NAME_MAP` constant
  - Add `linea-sepolia` to `BUILT_IN_NETWORKS` constant and `InfuraNetworkType`, `NetworkType`, `ChainId`, and `NetworksTicker` types
  - Add `LineaSepolia` to `BuiltInNetworkName` enum
  - `isNetworkType` and `isInfuraNetworkType` now return `true` when given "linea-sepolia"

### Changed

- Update `normalizeEnsName` so that it does not attempt to normalize `"."` ([#4006](https://github.com/MetaMask/core/pull/4006))
- Move `bn.js` from `devDependencies` to `dependencies` ([#4023](https://github.com/MetaMask/core/pull/4023))

### Fixed

- **BREAKING**: Narrow argument type for `BNToHex` and `fractionBN` from `any` to `BN` to enhance type safety ([#3975](https://github.com/MetaMask/core/pull/3975))
- **BREAKING**: Narrow argument type for `logOrRethrowError` from `any` to `unknown` to enhance type safety ([#3975](https://github.com/MetaMask/core/pull/3975))
- **BREAKING**: Narrow argument type for `isNetworkType` from `any` to `string` to enhance type safety ([#3975](https://github.com/MetaMask/core/pull/3975))

## [8.0.4]

### Changed

- Replace `ethereumjs-util` with `@ethereumjs/util` ([#3943](https://github.com/MetaMask/core/pull/3943))

## [8.0.3]

### Changed

- Bump `@metamask/ethjs-unit` to `^0.3.0` ([#3897](https://github.com/MetaMask/core/pull/3897))

## [8.0.2]

### Changed

- Bump `@metamask/utils` to `^8.3.0` ([#3769](https://github.com/MetaMask/core/pull/3769))

## [8.0.1]

### Changed

- There are no consumer-facing changes to this package. This version is a part of a synchronized release across all packages in our monorepo.

## [8.0.0]

### Changed

- **BREAKING**: `OPENSEA_PROXY_URL` now points to OpenSea's v2 API. `OPENSEA_API_URL` + `OPENSEA_TEST_API_URL` have been removed ([#3654](https://github.com/MetaMask/core/pull/3654))

## [7.0.0]

### Changed

- **BREAKING:** Make `safelyExecute` generic so they preserve types ([#3629](https://github.com/MetaMask/core/pull/3629))
- Update `successfulFetch` so that a URL instance can now be passed to it ([#3600](https://github.com/MetaMask/core/pull/3600))
- Update `handleFetch` so that a URL instance can now be passed to it ([#3600](https://github.com/MetaMask/core/pull/3600))

## [6.1.0]

### Added

- Add `isInfuraNetworkType` type guard for `InfuraNetworkType` ([#2055](https://github.com/MetaMask/core/pull/2055))

### Fixed

- Restore missing dependency `eth-query`([#3578](https://github.com/MetaMask/core/pull/3578))
  - This was mistakenly recategorized as a devDependency in v6.0.0

## [6.0.0]

### Changed

- **BREAKING:** Bump `@metamask/eth-query` to ^4.0.0 ([#2028](https://github.com/MetaMask/core/pull/2028))
  - This affects `query`: the `sendAsync` method on the given EthQuery must now have a narrower type
- Bump `@metamask/utils` from ^8.1.0 to ^8.2.0 ([#1957](https://github.com/MetaMask/core/pull/1957))
- Change `BUILT_IN_NETWORKS` so that `rpc` entry now has a dummy `ticker` ([#1794](https://github.com/MetaMask/core/pull/1794))
- Replace `ethjs-unit` ^0.1.6 with `@metamask/ethjs-unit` ^0.2.1 ([#2064](https://github.com/MetaMask/core/pull/2064))

### Fixed

- Move `@metamask/eth-query` from a development dependency to a runtime dependency ([#1815](https://github.com/MetaMask/core/pull/1815))

## [5.0.2]

### Changed

- Bump dependency on `@metamask/utils` to ^8.1.0 ([#1639](https://github.com/MetaMask/core/pull/1639))
- Move `eth-rpc-errors@^4.0.2` dependency to `@metamask/rpc-errors@^6.0.2` ([#1743](https://github.com/MetaMask/core/pull/1743))

### Fixed

- Update linea goerli explorer url ([#1666](https://github.com/MetaMask/core/pull/1666))

## [5.0.1]

### Changed

- Update TypeScript to v4.8.x ([#1718](https://github.com/MetaMask/core/pull/1718))

## [5.0.0]

### Changed

- **BREAKING**: Rename `NETWORK_ID_TO_ETHERS_NETWORK_NAME_MAP` to `CHAIN_ID_TO_ETHERS_NETWORK_NAME_MAP` ([#1633](https://github.com/MetaMask/core/pull/1633))
  - Change it to a map of `Hex` chain ID to `BuiltInNetworkName`

### Removed

- **BREAKING**: Remove `NetworkId` constant and type ([#1633](https://github.com/MetaMask/core/pull/1633))

## [4.3.2]

### Changed

- There are no consumer-facing changes to this package. This version is a part of a synchronized release across all packages in our monorepo.

## [4.3.1]

### Changed

- Replace `eth-query` ^2.1.2 with `@metamask/eth-query` ^3.0.1 ([#1546](https://github.com/MetaMask/core/pull/1546))

## [4.3.0]

### Changed

- Update `@metamask/utils` to `^6.2.0` ([#1514](https://github.com/MetaMask/core/pull/1514))
- Remove unnecessary `babel-runtime` dependency ([#1504](https://github.com/MetaMask/core/pull/1504))

## [4.2.0]

### Added

- Add support for Linea networks ([#1423](https://github.com/MetaMask/core/pull/1423))
  - Add `LINEA_GOERLI` to `TESTNET_TICKER_SYMBOLS` map
  - Add `linea-goerli` and `linea-mainnet` to `BUILT_IN_NETWORKS` map, as well as `NetworkType`, `InfuraNetworkType`, `ChainId`, and `NetworkId `enums
  - Add `LineaGoerli` and `LineaMainnet` to `BuiltInNetworkName` enum

## [4.1.0]

### Added

- Add approval types for result pages ([#1442](https://github.com/MetaMask/core/pull/1442))

## [4.0.1]

### Changed

- Add dependencies `eth-query` and `babel-runtime` ([#1447](https://github.com/MetaMask/core/pull/1447))

### Fixed

- Fix bug where query function failed to call built-in EthQuery methods ([#1447](https://github.com/MetaMask/core/pull/1447))

## [4.0.0]

### Added

- Add constants `BuiltInNetwork` and `ChainId` ([#1354](https://github.com/MetaMask/core/pull/1354))
- Add Aurora network to the `ChainId` constant ([#1327](https://github.com/MetaMask/core/pull/1327))
- Add `InfuraNetworkType` enum ([#1264](https://github.com/MetaMask/core/pull/1264))

### Changed

- **BREAKING:** Bump to Node 16 ([#1262](https://github.com/MetaMask/core/pull/1262))
- **BREAKING:** The `isSafeChainId` chain ID parameter is now type `Hex` rather than `number` ([#1367](https://github.com/MetaMask/core/pull/1367))
- **BREAKING:** The `ChainId` enum and the `GANACHE_CHAIN_ID` constant are now formatted as 0x-prefixed hex strings rather than as decimal strings. ([#1367](https://github.com/MetaMask/core/pull/1367))
- The `query` function has improved type checks for the `ethQuery` argument ([#1266](https://github.com/MetaMask/core/pull/1266))
  - This type change could be breaking, but only if you were passing in an invalid `ethQuery` parameter. In that circumstance this would have thrown an error at runtime anyway. Effectively this should be non-breaking for any usage that isn't already broken.
- Bump @metamask/utils from 5.0.1 to 5.0.2 ([#1271](https://github.com/MetaMask/core/pull/1271))

### Removed

- **BREAKING:** Remove `Json` type ([#1370](https://github.com/MetaMask/core/pull/1370))
- **BREAKING:** Remove `NetworksChainId` constant ([#1354](https://github.com/MetaMask/core/pull/1354))
  - Use the new `ChainId` constant or the pre-existing `NetworkId` constant instead
- **BREAKING:** Remove localhost network ([#1313](https://github.com/MetaMask/core/pull/1313))
  - Remove the entry for localhost from `BUILT_IN_NETWORKS`, `NetworkType`, `ChainId`, and `NetworksTicker`
- **BREAKING:** Remove `hasProperty` function ([#1275](https://github.com/MetaMask/core/pull/1275))
  - Use the `hasProperty` function from `@metamask/utils` instead
- **BREAKING:** Remove constants `MAINNET` and `TESTNET_TICKER_SYMBOLS` ([#1132](https://github.com/MetaMask/core/pull/1132))
  - These were actually removed in v3.1.0, but are listed here again because that release (and the minor releases following it) have been deprecated due to the breaking change
  - We didn't discover this until many releases later, which is why this happened in a minor release

## [3.4.0] [DEPRECATED]

### Added

- add WalletConnect in approval type ([#1240](https://github.com/MetaMask/core/pull/1240))

## [3.3.0] [DEPRECATED]

### Added

- Add Sign-in-with-Ethereum origin validation ([#1163](https://github.com/MetaMask/core/pull/1163))
- Add `NetworkId` enum and `NETWORK_ID_TO_ETHERS_NETWORK_NAME_MAP` constant that includes entries for each built-in Infura network ([#1170](https://github.com/MetaMask/core/pull/1170))

## [3.2.0] [DEPRECATED]

### Added

- Add `ORIGIN_METAMASK` constant ([#1166](https://github.com/MetaMask/core/pull/1166))
- Add `ApprovalType` enum ([#1174](https://github.com/MetaMask/core/pull/1174))

### Changed

- Improve return type of `toHex` ([#1195](https://github.com/MetaMask/core/pull/1195))

## [3.1.0] [DEPRECATED]

### Added

- Add SIWE detection support for PersonalMessageManager ([#1139](https://github.com/MetaMask/core/pull/1139))
- Add `NetworkType` ([#1132](https://github.com/MetaMask/core/pull/1132))
- Add `isSafeChainId` ([#1064](https://github.com/MetaMask/core/pull/1064))

### Removed

- **BREAKING:** Remove constants `MAINNET` and `TESTNET_TICKER_SYMBOLS` ([#1132](https://github.com/MetaMask/core/pull/1132))
  - We didn't discover this until many releases later, which is why this happened in a minor release

## [3.0.0]

### Removed

- **BREAKING:** Remove `isomorphic-fetch` ([#1106](https://github.com/MetaMask/controllers/pull/1106))
  - Consumers must now import `isomorphic-fetch` or another polyfill themselves if they are running in an environment without `fetch`

## [2.0.0]

### Added

- Add Sepolia-related constants ([#1041](https://github.com/MetaMask/controllers/pull/1041))
- Update `getBuyURL` function to return Sepolia faucet for Sepolia network ([#1041](https://github.com/MetaMask/controllers/pull/1041))

### Changed

- **BREAKING:**: Migrate from `metaswap` to `metafi` subdomain for OpenSea proxy ([#1060](https://github.com/MetaMask/core/pull/1060))
- Rename this repository to `core` ([#1031](https://github.com/MetaMask/controllers/pull/1031))

### Removed

- **BREAKING:** Remove all constants associated with Ropsten, Rinkeby, and Kovan ([#1041](https://github.com/MetaMask/controllers/pull/1041))
- **BREAKING:** Remove support for Ropsten, Rinkeby, and Kovan from `getBuyUrl` function ([#1041](https://github.com/MetaMask/controllers/pull/1041))

## [1.0.0]

### Added

- Initial release

  - As a result of converting our shared controllers repo into a monorepo ([#831](https://github.com/MetaMask/core/pull/831)), we've created this package from select parts of [`@metamask/controllers` v33.0.0](https://github.com/MetaMask/core/tree/v33.0.0), namely:
    - `src/constants.ts` (but see below)
    - `src/util.ts` (but see below)
    - `src/util.test.ts` (but see below)
    - `NetworkType` and `NetworkChainsId` from `src/network/NetworkController.ts` (via `types.ts`)
  - `ESTIMATE_GAS_ERROR`, which used to be exported by `src/constants.ts`, is now available via the `@metamask/gas-fee-controller` package.
  - A number of functions and types that were previously exported by `src/util.ts` are now available via other packages. Here's a breakdown of these exports and their new locations:

    - `@metamask/assets-controllers`:
      - `SupportedTokenDetectionNetworks`
      - `addUrlProtocolPrefix`
      - `getFormattedIpfsUrl`
      - `getIpfsCIDv1AndPath`
      - `isTokenDetectionSupportedForNetwork`
      - `isTokenListSupportedForNetwork`
      - `removeIpfsProtocolPrefix`
      - `validateTokenToWatch`
    - `@metamask/message-manager`:
      - `normalizeMessageData`
      - `validateSignMessageData`
      - `validateTypedSignMessageDataV1`
      - `validateTypedSignMessageDataV3`
    - `@metamask/transaction-controller`:
      - `getEtherscanApiUrl`
      - `getIncreasedPriceFromExisting`
      - `getIncreasedPriceHex`
      - `handleTransactionFetch`
      - `isEIP1559Transaction`
      - `isFeeMarketEIP1559Values`
      - `isGasPriceValue`
      - `normalizeTransaction`
      - `validateGasValues`
      - `validateMinimumIncrease`
      - `validateTransaction`

    All changes listed after this point were applied to this package following the monorepo conversion.

[Unreleased]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@11.10.0...HEAD
[11.10.0]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@11.9.0...@metamask/controller-utils@11.10.0
[11.9.0]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@11.8.0...@metamask/controller-utils@11.9.0
[11.8.0]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@11.7.0...@metamask/controller-utils@11.8.0
[11.7.0]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@11.6.0...@metamask/controller-utils@11.7.0
[11.6.0]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@11.5.0...@metamask/controller-utils@11.6.0
[11.5.0]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@11.4.5...@metamask/controller-utils@11.5.0
[11.4.5]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@11.4.4...@metamask/controller-utils@11.4.5
[11.4.4]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@11.4.3...@metamask/controller-utils@11.4.4
[11.4.3]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@11.4.2...@metamask/controller-utils@11.4.3
[11.4.2]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@11.4.1...@metamask/controller-utils@11.4.2
[11.4.1]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@11.4.0...@metamask/controller-utils@11.4.1
[11.4.0]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@11.3.0...@metamask/controller-utils@11.4.0
[11.3.0]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@11.2.0...@metamask/controller-utils@11.3.0
[11.2.0]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@11.1.0...@metamask/controller-utils@11.2.0
[11.1.0]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@11.0.2...@metamask/controller-utils@11.1.0
[11.0.2]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@11.0.1...@metamask/controller-utils@11.0.2
[11.0.1]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@11.0.0...@metamask/controller-utils@11.0.1
[11.0.0]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@10.0.0...@metamask/controller-utils@11.0.0
[10.0.0]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@9.1.0...@metamask/controller-utils@10.0.0
[9.1.0]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@9.0.2...@metamask/controller-utils@9.1.0
[9.0.2]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@9.0.1...@metamask/controller-utils@9.0.2
[9.0.1]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@9.0.0...@metamask/controller-utils@9.0.1
[9.0.0]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@8.0.4...@metamask/controller-utils@9.0.0
[8.0.4]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@8.0.3...@metamask/controller-utils@8.0.4
[8.0.3]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@8.0.2...@metamask/controller-utils@8.0.3
[8.0.2]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@8.0.1...@metamask/controller-utils@8.0.2
[8.0.1]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@8.0.0...@metamask/controller-utils@8.0.1
[8.0.0]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@7.0.0...@metamask/controller-utils@8.0.0
[7.0.0]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@6.1.0...@metamask/controller-utils@7.0.0
[6.1.0]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@6.0.0...@metamask/controller-utils@6.1.0
[6.0.0]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@5.0.2...@metamask/controller-utils@6.0.0
[5.0.2]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@5.0.1...@metamask/controller-utils@5.0.2
[5.0.1]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@5.0.0...@metamask/controller-utils@5.0.1
[5.0.0]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@4.3.2...@metamask/controller-utils@5.0.0
[4.3.2]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@4.3.1...@metamask/controller-utils@4.3.2
[4.3.1]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@4.3.0...@metamask/controller-utils@4.3.1
[4.3.0]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@4.2.0...@metamask/controller-utils@4.3.0
[4.2.0]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@4.1.0...@metamask/controller-utils@4.2.0
[4.1.0]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@4.0.1...@metamask/controller-utils@4.1.0
[4.0.1]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@4.0.0...@metamask/controller-utils@4.0.1
[4.0.0]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@3.4.0...@metamask/controller-utils@4.0.0
[3.4.0]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@3.3.0...@metamask/controller-utils@3.4.0
[3.3.0]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@3.2.0...@metamask/controller-utils@3.3.0
[3.2.0]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@3.1.0...@metamask/controller-utils@3.2.0
[3.1.0]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@3.0.0...@metamask/controller-utils@3.1.0
[3.0.0]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@2.0.0...@metamask/controller-utils@3.0.0
[2.0.0]: https://github.com/MetaMask/core/compare/@metamask/controller-utils@1.0.0...@metamask/controller-utils@2.0.0
[1.0.0]: https://github.com/MetaMask/core/releases/tag/@metamask/controller-utils@1.0.0
