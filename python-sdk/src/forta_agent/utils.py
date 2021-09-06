import sys
import os
from jsonc_parser.parser import JsoncParser
import sha3


def get_forta_config():
    config_flag_index = sys.argv.index(
        '--config') if '--config' in sys.argv else -1
    config_file = None if config_flag_index == - \
        1 else sys.argv[config_flag_index + 1]
    config_path = os.path.join(
        os.getcwd(), config_file if config_file else 'forta.config.json')
    return JsoncParser.parse_file(config_path)


def get_json_rpc_url():
    if 'JSON_RPC_HOST' in os.environ:
        return f'http://{os.environ["JSON_RPC_HOST"]}{":"+os.environ["JSON_RPC_PORT"] if "JSON_RPC_PORT" in os.environ else ""}'

    config = get_forta_config()
    if "jsonRpcUrl" not in config:
        raise Exception("no jsonRpcUrl found")
    return config["jsonRpcUrl"]


def create_block_event(dict):
    from .block_event import BlockEvent  # avoid circular import
    return BlockEvent(dict)


def create_transaction_event(dict):
    from .transaction_event import TransactionEvent  # avoid circular import
    return TransactionEvent(dict)


def assert_non_empty_string_in_dict(dict, key):
    assert_key_in_dict(dict, key)
    assert isinstance(dict[key], str) and len(
        dict[key]) > 0, f'{key} must be non-empty string'


def assert_enum_value_in_dict(dict, key, enum):
    assert_key_in_dict(dict, key)
    assert isinstance(dict[key], enum), f'{key} must be valid enum value'


def assert_key_in_dict(dict, key):
    assert key in dict, f'{key} is required'


def hex_to_int(strVal):
    if not strVal:
        return strVal
    return int(strVal, 16) if type(strVal) == str and strVal.startswith('0x') else int(strVal, 10)


def keccak256(val):
    hash = sha3.keccak_256()
    hash.update(bytes(val, encoding='utf-8'))
    return f'0x{hash.hexdigest()}'
