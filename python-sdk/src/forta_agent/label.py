from enum import IntEnum
from .utils import assert_enum_value_in_dict, assert_non_empty_string_in_dict

class LabelType(IntEnum):
    Unknown = 0
    Custom = 1
    ProtocolAttack = 2
    Scam = 3
    RugPull = 4
    Bridge = 5
    Mixer = 6
    Dex = 7
    Cex = 8
    Attacker = 9
    Victim = 10
    Eoa = 11
    Contract = 12

class EntityType(IntEnum):
    Unknown = 0
    Address = 1
    Transaction = 2
    Block = 3
    Url = 4

class Label:
    def __init__(self, dict):
        assert_enum_value_in_dict(dict, 'entity_type', EntityType)
        assert_enum_value_in_dict(dict, 'label_type', LabelType)
        assert_non_empty_string_in_dict(dict, 'entity')
        self.entity = dict['entity']
        self.confidence = dict['confidence']
        self.customValue = dict['custom_value']
        self.entity_type = dict['entity_type']
        self.label_type = dict['label_type']

