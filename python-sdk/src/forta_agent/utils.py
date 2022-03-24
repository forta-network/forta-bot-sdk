import sys
import os
from jsonc_parser.parser import JsoncParser
import sha3


def get_web3_provider():
    from . import web3Provider
    return web3Provider


def get_forta_config():
    config = {}
    # try to read global config
    global_config_path = os.path.join(
        os.path.expanduser('~'), '.forta', 'forta.config.json')
    if os.path.isfile(global_config_path):
        global_config = JsoncParser.parse_file(global_config_path)
        config = {**config, **global_config}
    # try to read local project config
    config_flag_index = sys.argv.index(
        '--config') if '--config' in sys.argv else -1
    local_config_file = None if config_flag_index == - \
        1 else sys.argv[config_flag_index + 1]
    local_config_path = os.path.join(
        os.getcwd(), local_config_file if local_config_file else 'forta.config.json')
    if os.path.isfile(local_config_path):
        local_config = JsoncParser.parse_file(local_config_path)
        config = {**config, **local_config}
    return config


def get_json_rpc_url():
    if 'JSON_RPC_HOST' in os.environ:
        return f'http://{os.environ["JSON_RPC_HOST"]}{":"+os.environ["JSON_RPC_PORT"] if "JSON_RPC_PORT" in os.environ else ""}'

    config = get_forta_config()
    if "jsonRpcUrl" not in config:
        return "https://cloudflare-eth.com/"
    if not str(config.get("jsonRpcUrl")).startswith("http"):
        raise Exception("jsonRpcUrl must begin with http(s)")
    return config.get("jsonRpcUrl")


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
    if not strVal or type(strVal) == int:
        return strVal
    return int(strVal, 16) if type(strVal) == str and strVal.startswith('0x') else int(strVal, 10)


def keccak256(val):
    hash = sha3.keccak_256()
    hash.update(bytes(val, encoding='utf-8'))
    return f'0x{hash.hexdigest()}'
