import json
from .label import Label
from enum import IntEnum
from .utils import assert_enum_value_in_dict, assert_non_empty_string_in_dict


class FindingSeverity(IntEnum):
    Unknown = 0
    Info = 1
    Low = 2
    Medium = 3
    High = 4
    Critical = 5


class FindingType(IntEnum):
    Unknown = 0
    Exploit = 1
    Suspicious = 2
    Degraded = 3
    Info = 4


class Finding:
    def __init__(self, dict):
        assert_non_empty_string_in_dict(dict, 'name')
        assert_non_empty_string_in_dict(dict, 'description')
        assert_non_empty_string_in_dict(dict, 'alert_id')
        assert_enum_value_in_dict(dict, 'severity', FindingSeverity)
        assert_enum_value_in_dict(dict, 'type', FindingType)
        self.name = dict['name']
        self.description = dict['description']
        self.alert_id = dict['alert_id']
        self.protocol = dict.get('protocol', 'ethereum')
        self.severity = dict['severity']
        self.type = dict['type']
        self.metadata = dict.get('metadata')
        self.addresses = dict.get('addresses')
        self.labels = list(map(lambda l: l if isinstance(l, Label) else Label(l), dict.get('labels', [])))

    def toJson(self):
        d = dict(self.__dict__, **{
            'alertId': self.alert_id,
            'labels': list(map(lambda l: l.toDict(), self.labels))
        })
        return json.dumps({k: v for k, v in d.items() if v or k == 'type' or k == 'severity'})
