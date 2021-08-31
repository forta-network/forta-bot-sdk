class Trace:
    def __init__(self, dict):
        self.action = TraceAction(dict['action'])
        self.block_hash = dict['blockHash']
        self.block_number = dict['blockNumber']
        self.result = TraceResult(dict['result'])
        self.subtraces = dict['subtraces']
        self.trace_address = dict['traceAddress']
        self.transaction_hash = dict['transactionHash']
        self.transaction_position = dict['transactionPosition']
        self.type = dict['type']
        self.error = dict['error']


class TraceAction:
    def __init__(self, dict):
        self.call_type = dict['callType']
        self.to = dict['to']
        self.input = dict['input']
        self.from_ = dict['from']
        self.value = dict['value']
        self.init = dict['init']
        self.address = dict['address']
        self.balance = dict['balance']
        self.refund_address = dict['refundAddress']


class TraceResult:
    def __init__(self, dict):
        self.gas_used = dict['gasUsed']
        self.address = dict['address']
        self.code = dict['code']
