# Forta Detection Bot SDK and CLI

[![npm version](https://badge.fury.io/js/forta-agent.svg)](https://badge.fury.io/js/forta-agent)

Visit [forta.org](https://forta.org/) to learn more about Forta. See the developer documentation at [docs.forta.network](https://docs.forta.network)

## Bug Bounty

We have a [bug bounty program on Immunefi](https://immunefi.com/bounty/forta). Please report any security issues you find through the Immunefi dashboard, or reach out to [tech@forta.org](mailto:tech@forta.org)

## Changelog

### 0.1.23

- Added metadata field to Labels

### [0.1.22](https://github.com/forta-network/forta-bot-sdk/commit/4b624a2b2917da47439dfb356ab2f50566be29e3)

- Updated `run` command to wait 60 seconds between alert queries for bots using `handleAlert` locally

### [0.1.21](https://github.com/forta-network/forta-bot-sdk/commit/4b6a795b98c211b3e48253aec383405a4b676f41)

- Added support for address bloom filters on AlertEvent
- Updated CLI errors to return a non-zero exit code
- Changed Alert interface into a class
- Increased maximum number of findings returned in a response to 50

### [0.1.20](https://github.com/forta-network/forta-bot-sdk/commit/32d296e4d3fc28a6a55ff820cfdaa4a04b01c668)

- Fixed labels parsing when querying for alerts

### [0.1.19](https://github.com/forta-network/forta-bot-sdk/commit/7c28f8f5d043f61fa17db60784f00d894f777eb7)

- Added support for running shards i.e. multiple bot instances
- Added labels to alerts
- Updated handleAlert subscriptions to allow specifying filter by chainId
- Updated grpc controller to ensure initialize handler only invoked once
- Updated grpc proto definition

### [0.1.18](https://github.com/forta-network/forta-bot-sdk/commit/87268d3034bd79498a0690708cbfe2aaa851f00d)

- Updated grpc proto definition to add `alert.chainId` field

### [0.1.17](https://github.com/forta-network/forta-bot-sdk/commit/37194c3913ba8473e6e5406270539f857ee4045a)

- Added support for `remove` field for Labels
- Fixed `filter_function` bug in Python SDK
- Fixed `fetchJwt` SDK method to return mock value during development
- Fixed `fetchJwt` JS SDK method to return string instead of object
- Added `repository` URL to starter project package.json

### [0.1.16](https://github.com/forta-network/forta-bot-sdk/commit/5963444413b09cf2505dbacd2212481f592caedd)

- Updated grpc proto definitions for Labels
- Updated `run --file` command to also accept hashes
- Add `alert` and `sequence` npm commands to starter projects
- Updated `BotSubscription` to make `alertId` optional and also allow passing `alertIds`

### [0.1.15](https://github.com/forta-network/forta-bot-sdk/commit/e2e37e9321a5c7a33f8f8d4e30aef5f034ace84c)

- Fixed grpc proto definitions

### [0.1.14](https://github.com/forta-network/forta-bot-sdk/commit/ce13e4273bc45b227cc4f7f3387f101277b1a303)

- Added support for `handleAlert` handler
- Added support for specifying labels on findings

### [0.1.13](https://github.com/forta-network/forta-bot-sdk/commit/d73d5070897c9cbad8c1d356589d53222a9e692d)

- Return findings from `runHandlersOnBlock` and `runHandlersOnTransaction` methods

### [0.1.12](https://github.com/forta-network/forta-bot-sdk/commit/9e8efd9d218ff848b2de47cd8a1c5030e255b077)

- Remove `sha3` dependency from Python SDK

### [0.1.11](https://github.com/forta-network/forta-bot-sdk/commit/57d625b1f6cafc6a5cdcd19b38d3395aac31ff60)

- Bug fix to the `fetch_jwt` method in the Python sdk

### [0.1.10](https://github.com/forta-network/forta-bot-sdk/commit/debe98ba192fe500dd2259d03a511e40054abb04)

- Added new methods `fetchJwt`, `decodeJwt` and `verifyJwt` to Typescript sdk for generating and verifying a jwt token from a scan node
- Added new method `fetch_jwt`, `decode_jwt`, and `verify_jwt` to Python sdk for generating and verifying a jwt token from a scan node
- Limit size of findings returned from handleBlock and handleTransaction callbacks

### [0.1.9](https://github.com/forta-network/forta-bot-sdk/commit/d650c748f78d328c548d382c05e44551aeb62fb3)

- Use forta ipfs node for `info` command
- Added new method `getAlerts` to Typescript sdk to that fetches alerts using forta's alert graphql api
- Added new method `get_alerts` to Python sdk to that fetches alerts using forta's alert graphql api
- Fixing docker build issue

### [0.1.8](https://github.com/forta-network/forta-bot-sdk/commit/9740a8ad0acdcd112d8bd6ba72f191e0b67602cd)

- Updated chainId validation of `run` command to print out warning instead of throwing error
- Added `info` and `logs` commands as npm scripts of starter projects
- Updated `uploadImage` function to accept image tag suffix

### [0.1.7](https://github.com/forta-network/forta-bot-sdk/commit/e06a0198d4515e0354503754cc0e7b157fe72d27)

- Added two new cli commands: `info` and `logs`
- Validate chainId of jsonRpcUrl when running bot
- Generate unique bot id when initializing bot
- Adjust block polling time based on chainId when running bot locally

### [0.1.6](https://github.com/forta-network/forta-bot-sdk/commit/5db757c602887fbd2855c7cdcf72f051308e878b)

- Fix sort order for `chainIds` array

### [0.1.5](https://github.com/forta-network/forta-bot-sdk/commit/eaa0e9048a25d93690a42c94b691ec94790c8a61)

- Fix issue for CLI `publish` command when querying account balance

### [0.1.4](https://github.com/forta-network/forta-bot-sdk/commit/1142feca952c8998c358338224574a592f9ef179)

- Update gRPC agent.proto to add `Finding.addresses`
- Add support for `addresses` field to `Finding`
- Add verification for account balance and ownership when running `publish` CLI command
- Provide default gas estimates when interacting with registry smart contract functions
- Include `logIndex` in result of `TransactionEvent.filterLog`
- Include `address` in result of `TransactionEvent.filterFunction`
- Add `Finding.from` alias method for `Finding.fromObject`

### [0.1.3](https://github.com/forta-network/forta-bot-sdk/commit/d46e9a7e1f547296cc85c23fae7c22e8c3ce3fbf)

- Set `contextPath` when building image

### [0.1.2](https://github.com/forta-network/forta-agent-sdk/commit/b4ec0b28522673074942df9d9f38f0ac03449c4c)

- Update starter project README

### [0.1.1](https://github.com/forta-network/forta-agent-sdk/commit/3fd681c2414c8995f5fd80b8d89b47fa540cb34b)

- Update AgentRegistry contract ABI
- Add default `chainIds` to starter project package.json
- Fix Python starter project dependencies

### [0.1](https://github.com/forta-network/forta-agent-sdk/commit/c90888a1165dbf5a511e9ca03419d18050a05a6d)

- Update gRPC agent.proto to deprecate `TransactionEvent.Receipt`
- Update SDK to remove `receipt`, `status` and `gasUsed` properties from `TransactionEvent`
- Add `getTransactionReceipt` convenience method to SDK
- Update CLI `run` command to not fetch transaction receipts
- Update starter projects to detect for large Tether transfers
- Update terms of use URL

### [0.0.41](https://github.com/forta-network/forta-agent-sdk/commit/1b401ebaa8a36b949e71d4a34fe167d0d55b78bc)

- Set default `jsonRpcUrl` to https://cloudflare-eth.com
- Expose CLI functionality using `configureContainer` method
- Update CLI `init` command to also run `npm install`

### [0.0.40](https://github.com/forta-network/forta-agent-sdk/commit/a1b5e9562706c9034f887b1d8594ec374abf74f9)

- Fix Python SDK support for new chains
- Add terms of use prompt to CLI `init` command
- Update starter project Dockerfile to include line to enable logging

### [0.0.39](https://github.com/forta-network/forta-agent-sdk/commit/3da4e24f7e22a2adb6a66643a2c226ac070849b3)

- Add `keyfilePassword` config field for CI/CD pipelines
- Set default `ipfsGatewayUrl` to https://ipfs.forta.network
- Update `getJsonRpcUrl` to not throw error when running unit tests
- Update agent image build process to always target amd64 architecture

### [0.0.38](https://github.com/forta-network/forta-agent-sdk/commit/dfac04e1efce7da90986e2f943c08da572d52c67)

- Add `description` field to agent manifest from package.json

### [0.0.37](https://github.com/forta-network/forta-agent-sdk/commit/72ff4ef56583b0980fa4fcd02bdfd2ff9247772c)

- Add support for specifying multiple addresses in `filterLog` and `filterFunction` commands
- Add `--nocache` option to `forta-agent run` command to disable writing to cache
- Fix `forta-agent run` command to process blocks sequentially when listening for realtime data

### [0.0.36](https://github.com/forta-network/forta-agent-sdk/commit/fd7e401de3a2de1cbd3e7784a849cdfb2ddbd9da)

- Add support for specifying `chainIds` in package.json

### [0.0.35](https://github.com/forta-network/forta-agent-sdk/commit/385545c5bb30b815dcd749233851d4e748f20119)

- Add support for private agents with the `setPrivateFindings` method
- Deprecate `everestId` attribute of Finding
- Deprecate `filterEvent` method of TransactionEvent

### [0.0.34](https://github.com/forta-network/forta-agent-sdk/commit/088ede26b544b770858c2e720084c95cc3a76e13)

- Add disk caching for the `forta-agent run` command

### [0.0.33](https://github.com/forta-network/forta-agent-sdk/commit/30eae8fbba53a85f377efce2cb934e712fd819bc)

- Add support for specifying multiple transactions/blocks for the `forta-agent run` command
- Include CLI version in published manifest
- Add `getEthersBatchProvider` utility function to Javascript SDK
- Export the `keccak256` utility function from Javascript and Python SDK

### [0.0.32](https://github.com/forta-network/forta-agent-sdk/commit/77622f12f7961c8af6534b509540efdae4f6f3fa)

- Actually fix published npm artifact

### [0.0.31](https://github.com/forta-network/forta-agent-sdk/commit/cb8450b1a65ac6d0fde7c8d9f1c1cd195a1847ca)

- Fix published npm artifact

### [0.0.30](https://github.com/forta-network/forta-agent-sdk/commit/bda28a3e2ea2416d6dc31aa258a11d2caed89ad5)

- Fix agent publishing on Apple M1 chips

### [0.0.29](https://github.com/forta-network/forta-agent-sdk/commit/a0df267908c2f68867448b7162149f6eeb2ba7c5)

- Add `address` field to result of `filterLog` method
- Fix `from` property in agent manifest
- Increase gas price for transactions from CLI commands
- Add check to ensure agent documentation is not empty

### [0.0.28](https://github.com/forta-network/forta-agent-sdk/commit/3a47720e985b7ce028bd2cb30bfac430396d6d2f)

- Fix handling of `network` value in Python SDK

### [0.0.27](https://github.com/forta-network/forta-agent-sdk/commit/2e936c78e39f8da9a86b114ab01e14fca230a5ef)

- Change base Docker image for starter projects to `node12-alpine`
- Export `ethers` object from Javascript SDK
- Add `getEthersProvider` convenience method to SDK
- Add `filterLog` and `filterFunction` convenience methods to `TransactionEvent` in SDK
- Export `web3` object from Python SDK
- Add `get_web3_provider` convenience method to Python SDK
- Add `filter_log` and `filter_function` convenience methods to `TransactionEvent` in Python SDK
- Add `agentId` config property to support Forta Connect publishing
- Include results of `push` command in publish.log
- Improve CLI keyfile lookup
- Fix CLI exit when running Python agents
- Don't export `getFortaConfig` and `get_forta_config` from SDK

### [0.0.26](https://github.com/forta-network/forta-agent-sdk/commit/efa1ce9d424da4edc2142d969a580b14be6611f8)

- Use more raw JSON-RPC calls in CLI

### [0.0.25](https://github.com/forta-network/forta-agent-sdk/commit/6a00262f9a5ede50ad7135e0092b73a9b6ae0d24)

- Add new CLI command: `push`
- Replace web3.js with ethers.js
- Use raw JSON-RPC calls to fetch blocks and receipts in CLI
- Add limit of 5 alerts to starter projects

### [0.0.24](https://github.com/forta-network/forta-agent-sdk/commit/eec16a9b1b1be697dbf124e11b3602fca839a6e0)

- Add new CLI command: `keyfile`
- Add `keyfile` npm script to starter projects
- Add `repository` field to agent manifest

### [0.0.23](https://github.com/forta-network/forta-agent-sdk/commit/2f1f161e7f7286564f3314740f15c8823b2116a4)

- Transition to Polygon agent registry
- Provide default value for `agentRegistryJsonRpcUrl`
- Fix agent existence check

### [0.0.22](https://github.com/forta-network/forta-agent-sdk/commit/ae99dd91e2a253658c1658f7af1a3f850129e45b)

- Add new CLI commands: `enable` and `disable`
- Increase gas for transactions from CLI commands
- Remove duplicated `BlockEvent` properties
- Add obfuscation step to Javascript and Typescript starter project Dockerfile

### [0.0.21](https://github.com/forta-network/forta-agent-sdk/commit/d0ebbd87161f335799b79438605197940b297246)

- Improve `init` command to ensure that keystore folder exists

### [0.0.20](https://github.com/forta-network/forta-agent-sdk/commit/990f788869a110c68020140b3819c1e0a9ddea06)

- Fix CLI keyfile resolution

### [0.0.19](https://github.com/forta-network/forta-agent-sdk/commit/0015a482157894de038e3a3cbd35ae304cb565e2)

- Make config file global by default (with option to override locally)
- Fix starter project npm scripts to support Windows
- Move `agentId` (derived from `name`) and `version` to package.json
- Remove `documentation` config property and hardcode to README.md
- Improve `run` command to not scan over same block
- Add project URLs to npm and PyPi pages

### [0.0.18](https://github.com/forta-network/forta-agent-sdk/commit/cdad106652a861f1b118e29bee0f294677f09142)

- Fix published npm artifact
- Add npm script to ensure we build before publishing

### [0.0.17](https://github.com/forta-network/forta-agent-sdk/commit/4e5adb212363c8852be7655bce0b1a5560e6cf46)

- Add `initialize()` handler to SDK
- Add `output` field to `TraceResult`
- Add `Info` option to `FindingType` enum
- Add more error logging to grpc controller
- Add more unit tests for CLI and SDK
- Add MIT license

### [0.0.16](https://github.com/forta-network/forta-agent-sdk/commit/ba1d0b71f0a9b154fee2a5bb64809fd134839b40)

- Fix handler initialization to maintain Python agent state
- Ensure that `jsonRpcUrl` is http(s) only
- Fix `hex_to_int` Python SDK method to accept integers
- Add error logging to grpc controller

### [0.0.15](https://github.com/forta-network/forta-agent-sdk/commit/66b25dfa5be14a957db6d645f8e5466c8f95365e)

- Update Typescript starter project npm scripts to build before running

### [0.0.14](https://github.com/forta-network/forta-agent-sdk/commit/dd5fa9b23973b804e61e7252a87a0a593d833663)

- Add unit tests to Python starter project
- Fix `hex_to_int` Python SDK convenience method
- Fix Typescript starter project Dockerfile

### [0.0.13](https://github.com/forta-network/forta-agent-sdk/commit/f5c5d5bc941814b22a4ccb9385119b344e36b02a)

- Update Python starter project requirements.txt
- Improve Python error handling

### [0.0.12](https://github.com/forta-network/forta-agent-sdk/commit/b8cf226560cd8bad3f576f1a09f6afe7a67fd1f7)

- Add Python SDK
- Add Python starter project
- Fix Python agent to run in single long-running process
- Fix race condition when listening for blocks
- Improve Python error handling
- Fix receipt `status` not being set correctly
- Remove `handlers` config property and hardcode agent filename

### [0.0.11](https://github.com/forta-network/forta-agent-sdk/commit/8ffb802b63f35e4622c7b5d212468150f4d9e9fc)

- Add `keyfile` config property to specify a keyfile when publishing
- Add publish.log file to log publishing result
- Add `createTransactionEvent` and `createBlockEvent` utility methods for tests
- Fix receipt addresses to be lowercase
- Add unit tests for CLI commands: `init`, `run` and `publish`
- Fix websocket connection preventing clean exit of CLI
- Exclude unit tests from build
- Fix file logging to append newline character

### [0.0.10](https://github.com/forta-network/forta-agent-sdk/commit/66886097350f821daf7284036a3afe7ea4a62e31)

- Update `jest` type definitions to v27.0.1

### [0.0.9](https://github.com/forta-network/forta-agent-sdk/commit/86d174470d8a976fb162d7e97e1adc1c930ee5b2)

- Add agent documentation to manifest when publishing
- Add agent documentation to starter projects
- Update agent registry address
- Export more classes from SDK
- Improve error message when unable to parse config file
- Remove usage of web sockets when listening for blockchain data
- Remove unnecessary call to eth_getTransaction

### [0.0.8](https://github.com/forta-network/forta-agent-sdk/commit/7574422563fa9b533cb8f28b75d56c36584b7379)

- Add support for Python agents
- Add more block data to `BlockEvent`
- Add unit tests for starter project
- Format addresses to be lowercase
- Improve error message when config file not found
- Hardcode Disco auth credentials
- Add retry logic if fetching transaction or receipt fails

### [0.0.7](https://github.com/forta-network/forta-agent-sdk/commit/54ea778cd1309a05a116beb17be8f4f60f64361a)

- Add SDK support for tracing via `traceRpcUrl` config property
- Add support for `--config` CLI arg to specify a config file
- Add check for empty directory before initializing starter project
- Add Disco authentication when publishing
- Update filepath resolution to be OS-agnostic
- Include forta.config.json in starter project .gitignore

### [0.0.6](https://github.com/forta-network/forta-agent-sdk/commit/8b3f8ed466345cd6a0cbfbec78d89397e8372191)

- Use new agent registry contract

### [0.0.5](https://github.com/forta-network/forta-agent-sdk/commit/29233a1df54e302d8ffb7e498fac802ef6085013)

- Hardcode scanner poolId
- Rename `ipfsGatewayAuthHeader` config property to `ipfsGatewayAuth`
- Add `publish` npm script to starter project

### [0.0.4](https://github.com/forta-network/forta-agent-sdk/commit/58cdd6a02d12f7fb005a7cd66e649ff4c65d8cc6)

- Remove .npmignore file after initializing starter project

### [0.0.3](https://github.com/forta-network/forta-agent-sdk/commit/72d3b4c6986ac2f33d671385b5d388a6ce0ddb45)

- Add `getJsonRpcUrl` and `getFortaConfig` SDK convenience methods
- Add more alias methods for `TransactionEvent` properties in SDK
- Add npm scripts to starter project package.json
- Export `FortaConfig` type from SDK
- Fix starter project .gitignore renaming issue when publishing npm package

### [0.0.2](https://github.com/forta-network/forta-agent-sdk/commit/e76d61149ac6c4782ea097dc5fd1d262b24274e6)

- Update `init` to use existing keyfile if one exists (instead of always creating new one)
- Update starter project package.json to use `forta-agent` npm package

### [0.0.1](https://github.com/forta-network/forta-agent-sdk/commit/ecc45ef2d5695aba3833a8451b2cd0ff2cabdfa7)

- Initialize repository
- Initialize CLI commands: `init`, `run` and `publish`
- Initialize Javascript and Typescript SDK
- Initialize Javascript and Typescript high gas starter project
