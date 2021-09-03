class Transaction:
    def __init__(self, dict):
        self.hash = dict.get('hash')
        self.from_ = dict.get('from')
        self.to = dict.get('to')
        self.nonce = dict.get('nonce')
        self.gas = dict.get('gas')
        self.gas_price = dict.get('gasPrice', dict.get('gas_price'))
        self.value = dict.get('value')
        self.data = dict.get('data')
        self.r = dict.get('r')
        self.s = dict.get('s')
        self.v = dict.get('v')
