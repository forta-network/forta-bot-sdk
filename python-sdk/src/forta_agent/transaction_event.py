import json
from hexbytes import HexBytes
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
        networkVal = int(networkVal) if type(
            networkVal) == str and networkVal.isdigit() else networkVal
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

    def filter_log(self, abi, contract_address=''):
        abi = abi if isinstance(abi, list) else [abi]
        abi = [json.loads(abi_item) for abi_item in abi]
        logs = self.logs
        # filter logs by contract address, if provided
        if (contract_address):
            contract_address = contract_address.lower()
            logs = filter(lambda log: log.address.lower()
                          == contract_address, logs)
        # determine which event names to filter
        event_names = []
        for abi_item in abi:
            if abi_item['type'] == "event":
                event_names.append(abi_item['name'])
        # parse logs
        results = []
        from . import web3Provider
        contract = web3Provider.eth.contract(
            "0x0000000000000000000000000000000000000000", abi=abi)
        for log in logs:
            log.topics = [HexBytes(topic) for topic in log.topics]
            for event_name in event_names:
                try:
                    results.append(
                        contract.events[event_name]().processLog(log))
                except:
                    continue  # TODO see if theres a better way to handle 'no matching event' error
        return results

    def filter_function(self, abi, contract_address=''):
        abi = abi if isinstance(abi, list) else [abi]
        abi = [json.loads(abi_object) for abi_object in abi]
        # determine where to look for function calls (i.e. transaction object or traces)
        sources = [{'data': self.transaction.data, 'to': self.transaction.to}]
        if self.traces:
            sources = [{'data': trace.action.input,
                        'to': trace.action.to} for trace in self.traces]
        # filter by contract address, if provided
        if (contract_address):
            contract_address = contract_address.lower()
            sources = filter(
                lambda source: source['to'] and source['to'].lower() == contract_address, sources)
        # parse function inputs
        results = []
        from . import web3Provider
        contract = web3Provider.eth.contract(
            "0x0000000000000000000000000000000000000000", abi=abi)
        for source in sources:
            try:
                results.append(contract.decode_function_input(source['data']))
            except:
                continue  # TODO see if theres a better way to handle 'no matching function' error
        return results
