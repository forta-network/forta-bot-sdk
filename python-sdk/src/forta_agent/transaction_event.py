from .event_type import EventType
from .network import Network
from .transaction import Transaction
from .receipt import Receipt
from .trace import Trace
from .utils import keccak256


class TxEventBlock:
    def __init__(self, dict):
        self.hash = dict.get('hash')
        self.number = dict.get('number')
        self.timestamp = dict.get('timestamp')


class TransactionEvent:
    def __init__(self, dict):
        typeVal = dict.get('type', "BLOCK")
        self.type = EventType[typeVal] if type(
            typeVal) == str else EventType(typeVal)
        networkVal = dict.get('network', "MAINNET")
        self.network = Network[networkVal] if type(
            networkVal) == str else Network(networkVal)
        self.transaction = Transaction(dict.get('transaction', {}))
        self.receipt = Receipt(dict.get('receipt', {}))
        self.traces = list(map(lambda t: Trace(t), dict.get('traces', [])))
        self.addresses = dict.get('addresses', {})
        self.block = TxEventBlock(dict.get('block', {}))

    @property
    def hash(self):
        return self.transaction.hash

    @property
    def to(self):
        return self.transaction.to

    @property
    def from_(self):
        return self.transaction.from_

    @property
    def status(self):
        return self.receipt.status

    @property
    def gas_used(self):
        return self.receipt.gas_used

    @property
    def gas_price(self):
        return self.transaction.gas_price

    @property
    def logs(self):
        return self.receipt.logs

    @property
    def timestamp(self):
        return self.block.timestamp

    @property
    def block_number(self):
        return self.block.number

    @property
    def block_hash(self):
        return self.block.hash

    def filter_event(self, event_signature, contract_address=''):
        event_topic = keccak256(event_signature).lower()
        contract_address = contract_address.lower()
        events = filter(lambda log: len(log.topics) > 0 and
                        log.topics[0].lower() == event_topic and
                        (True if not contract_address else log.address.lower() == contract_address), self.receipt.logs)
        return list(events)
