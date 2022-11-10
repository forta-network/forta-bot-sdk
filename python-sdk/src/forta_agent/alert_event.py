from .alert import Alert


class AlertEvent:
    def __init__(self, dict):
        self.alert = Alert(dict.get('alert', {}))

    @property
    def alert_hash(self):
        return self.alert.hash
