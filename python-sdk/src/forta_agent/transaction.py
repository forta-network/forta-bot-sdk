class Transaction:
    def __init__(self, dict):
        self.hash = dict['hash']
        self.from_ = dict['from']
        self.to = dict['to']
        self.nonce = dict['nonce']
        self.gas = dict['gas']
        self.gas_price = dict['gasPrice']
        self.value = dict['value']
        self.data = dict['data']
        self.r = dict['r']
        self.s = dict['s']
        self.v = dict['v']
