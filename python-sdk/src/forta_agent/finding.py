from enum import Enum


class FindingSeverity(Enum):
    Unknown = 0
    Info = 1
    Low = 2
    Medium = 3
    High = 4
    Critical = 5


class FindingType(Enum):
    Unknown = 0
    Exploit = 1
    Suspicious = 2
    Degraded = 3


class Finding:
    def __init__(self, dict):
        self.name = dict['name']
        self.description = dict['description']
        self.alert_id = dict['alert_id']
        self.protocol = dict['protocol']
        self.severity = dict['severity']
        self.type = dict['type']
        self.everest_id = dict['everest_id']
        self.metadata = dict['metadata']
        # TODO assert values
