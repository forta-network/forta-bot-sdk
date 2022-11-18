const { Finding, FindingSeverity, FindingType } = require("forta-agent");

const ERC20_TRANSFER_EVENT =
  "event Transfer(address indexed from, address indexed to, uint256 value)";
const TETHER_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const TETHER_DECIMALS = 6;
let findingsCount = 0;

const handleTransaction = async (txEvent) => {
  const findings = [];

  // limiting this agent to emit only 5 findings so that the alert feed is not spammed
  if (findingsCount >= 5) return findings;

  // filter the transaction logs for Tether transfer events
  const tetherTransferEvents = txEvent.filterLog(
    ERC20_TRANSFER_EVENT,
    TETHER_ADDRESS
  );

  tetherTransferEvents.forEach((transferEvent) => {
    // extract transfer event arguments
    const { to, from, value } = transferEvent.args;
    // shift decimals of transfer value
    const normalizedValue = value.div(10 ** TETHER_DECIMALS);

    // if more than 10,000 Tether were transferred, report it
    if (normalizedValue.gt(10000)) {
      findings.push(
        Finding.fromObject({
          name: "High Tether Transfer",
          description: `High amount of USDT transferred: ${normalizedValue}`,
          alertId: "FORTA-1",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            to,
            from,
          },
        })
      );
      findingsCount++;
    }
  });

  return findings;
};

// const initialize = async () => {
//   // do some initialization on startup e.g. fetch data
// }

// const handleBlock = async (blockEvent) => {
//   const findings = [];
//   // detect some block condition
//   return findings;
// };

// const handleAlert = async (alertEvent) => {
//   const findings = [];
//   // detect some alert condition
//   return findings;
// };

module.exports = {
  // initialize,
  handleTransaction,
  // handleBlock,
  // handleAlert,
  ERC20_TRANSFER_EVENT, // exported for unit tests
  TETHER_ADDRESS, // exported for unit tests
  TETHER_DECIMALS, // exported for unit tests
};
