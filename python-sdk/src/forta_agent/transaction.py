from dataclasses import dataclass
from .utils import hex_to_int

@dataclass
class Transaction:

    transaction_data: dict

    def __post_init__(self):
        self.data = self.transaction_data['data']

        self.gas = hex_to_int(self.transaction_data['gas'])
        self.gas_price = hex_to_int(self.transaction_data.get('gasPrice', self.transaction_data['gas_price']))

        self.hash = self.transaction_data['hash']

        self.nonce = self.transaction_data['nonce']

        self.r = self.transaction_data['r']

        self.s = self.transaction_data['s']
        self.send_from = self.transaction_data['from']
        self.send_to = self.transaction_data['to']
       
        self.v = self.transaction_data['v']
        self.value = hex_to_int(self.transaction_data['value'])
        
