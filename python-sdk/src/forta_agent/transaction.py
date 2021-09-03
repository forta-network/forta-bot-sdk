from .utils import hex_to_int


class Transaction:
    def __init__(self, dict):
        self.hash = dict.get('hash')
        self.from_ = dict.get('from')
        self.to = dict.get('to')
        self.nonce = dict.get('nonce')
        self.gas = hex_to_int(dict.get('gas'))
        self.gas_price = hex_to_int(
            dict.get('gasPrice', dict.get('gas_price')))
        self.value = hex_to_int(dict.get('value'))
        self.data = dict.get('data')
        self.r = dict.get('r')
        self.s = dict.get('s')
        self.v = dict.get('v')
