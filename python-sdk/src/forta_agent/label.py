from enum import IntEnum
from .utils import assert_enum_value_in_dict, assert_non_empty_string_in_dict


class EntityType(IntEnum):
    Unknown = 0
    Address = 1
    Transaction = 2
    Block = 3
    Url = 4


class Label:
    def __init__(self, dict):
        assert_enum_value_in_dict(dict, 'entity_type', EntityType)
        assert_non_empty_string_in_dict(dict, 'entity')
        assert_non_empty_string_in_dict(dict, 'label')
        self.entity = dict['entity']
        self.confidence = dict['confidence']
        self.entity_type = dict['entity_type']
        self.label = dict['label']

    def toDict(self):
        d = dict(self.__dict__, **{
            'entityType': self.entity_type,
        })
        return {k: v for k, v in d.items() if v is not None}
