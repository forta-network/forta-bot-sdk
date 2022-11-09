from .event_type import EventType
from .network import Network
from .block import Block


class AlertEvent:
    def __init__(self, dict):
        self.alert = Block(dict.get('alert', {}))

    @property
    def alert_hash(self):
        return self.alert.hash
