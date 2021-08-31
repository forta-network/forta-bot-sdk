from enum import IntEnum
from .finding import Finding, FindingSeverity, FindingType


class EventType(IntEnum):
    BLOCK = 0
    REORG = 1


class Network(IntEnum):
    MAINNET = 1
    ROPSTEN = 3
    RINKEBY = 4
    GOERLI = 5
