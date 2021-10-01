from .utils import hex_to_int


class Trace:
    def __init__(self, dict):
        self.action = TraceAction(dict.get('action', {}))
        self.block_hash = dict.get('blockHash', dict.get('block_hash'))
        self.block_number = dict.get('blockNumber', dict.get('block_number'))
        self.result = TraceResult(dict.get('result', {}))
        self.subtraces = dict.get('subtraces')
        self.trace_address = dict.get(
            'traceAddress', dict.get('trace_address', []))
        self.transaction_hash = dict.get(
            'transactionHash', dict.get('transaction_hash'))
        self.transaction_position = dict.get(
            'transactionPosition', dict.get('transaction_position'))
        self.type = dict.get('type')
        self.error = dict.get('error')


class TraceAction:
    def __init__(self, dict):
        self.call_type = dict.get('callType', dict.get('call_type'))
        self.to = dict.get('to')
        self.input = dict.get('input')
        self.from_ = dict.get('from')
        self.value = hex_to_int(dict.get('value'))
        self.init = dict.get('init')
        self.address = dict.get('address')
        self.balance = dict.get('balance')
        self.refund_address = dict.get(
            'refundAddress', dict.get('refund_address'))


class TraceResult:
    def __init__(self, dict):
        self.gas_used = hex_to_int(dict.get('gasUsed', dict.get('gas_used')))
        self.address = dict.get('address')
        self.code = dict.get('code')
        self.output = dict.get('output')
