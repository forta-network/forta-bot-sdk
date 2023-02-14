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
        entityTypeVal = dict.get('entity_type', dict['entityType'])
        self.entity_type = EntityType[entityTypeVal.title()] if type(
            entityTypeVal) == str else EntityType(entityTypeVal)
        assert_enum_value_in_dict(self.__dict__, 'entity_type', EntityType)
        assert_non_empty_string_in_dict(dict, 'entity')
        self.entity = dict['entity']
        self.confidence = dict['confidence']
        self.label = dict['label']
        self.remove = dict.get('remove', False)

    def toDict(self):
        d = dict(self.__dict__, **{
            'entityType': self.entity_type,
        })
        return {k: v for k, v in d.items() if v is not None}
