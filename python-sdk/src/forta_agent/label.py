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
        entityTypeVal = dict.get('entity_type', dict.get('entityType'))
        self.entity_type = EntityType[entityTypeVal.title()] if type(
            entityTypeVal) == str else EntityType(entityTypeVal)
        assert_enum_value_in_dict(self.__dict__, 'entity_type', EntityType)
        assert_non_empty_string_in_dict(dict, 'entity')
        self.entity = dict['entity']
        self.confidence = dict['confidence']
        self.label = dict['label']
        self.remove = dict.get('remove', False)
        self.unique_key = dict.get('unique_key', dict.get('uniqueKey'))
        self.metadata = dict.get('metadata') if dict.get(
            'metadata') is not None else {}
        # if metadata is array, convert to map
        if type(self.metadata) is list:
            self.metadata_array_to_map()
        self.id = dict.get('id')
        self.source = LabelSource(dict.get('source')) if dict.get(
            'source') is not None else None
        self.created_at = dict.get('createdAt', dict.get('created_at'))
        self.embedding = dict.get('embedding')

    def toDict(self):
        d = dict(self.__dict__, **{
            'entityType': self.entity_type,
            'uniqueKey': self.unique_key,
        })
        return {k: v for k, v in d.items() if v is not None}

    def metadata_array_to_map(self):
        # convert string array to string key/value map using first '=' character as separator
        # (label metadata is received as string array from API)
        metadata_map = {}
        for item in self.metadata:
            separator_index = item.find('=')
            key = item[0:separator_index]
            value = item[separator_index+1:len(item)]
            metadata_map[key] = value
        self.metadata = metadata_map


class LabelSource:
    def __init__(self, dict):
        self.alert_hash = dict.get('alertHash')
        self.alert_id = dict.get('alertId')
        self.bot = LabelSourceBot(dict.get('bot')) if dict.get(
            'bot') is not None else None
        self.chain_id = dict.get('chainId')
        self.id = dict.get('id')


class LabelSourceBot:
    def __init__(self, dict):
        self.id = dict.get('id')
        self.image = dict.get('image')
        self.image_hash = dict.get('imageHash')
        self.manifest = dict.get('manifest')
