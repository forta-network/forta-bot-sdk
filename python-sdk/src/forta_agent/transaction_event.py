from . import EventType, Network
from .transaction import Transaction
from .receipt import Receipt
from .trace import Trace
from .utils import keccak256


class TxEventBlock:
    def __init__(self, dict):
        self.hash = dict['hash']
        self.number = dict['number']
        self.timestamp = dict['timestamp']


class TransactionEvent:
    def __init__(self, dict):
        self.type = EventType(dict['type'])
        self.network = Network(dict['network'])
        self.transaction = Transaction(dict['transaction'])
        self.receipt = Receipt(dict['receipt'])
        self.traces = map(lambda t: Trace(t), dict['traces'])
        self.addresses = dict['addresses']
        self.block = TxEventBlock(dict['block'])

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
