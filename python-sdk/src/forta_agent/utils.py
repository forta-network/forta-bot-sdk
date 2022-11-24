import base64
import sys
import os
from jsonc_parser.parser import JsoncParser
import requests
import datetime
import time
from web3.auto import w3
from web3 import Web3
import json
import logging

from .forta_graphql import AlertsResponse

DISPTACHER_ABI = [{"inputs":[{"internalType":"uint256","name":"agentId","type":"uint256"},{"internalType":"uint256","name":"scannerId","type":"uint256"}],"name":"areTheyLinked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"}]
DISPATCH_CONTRACT = "0xd46832F3f8EA8bDEFe5316696c0364F01b31a573"; # Source: https://docs.forta.network/en/latest/smart-contracts/

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


def get_transaction_receipt(tx_hash):
    from .receipt import Receipt  # avoid circular import
    web3_provider = get_web3_provider()
    receipt = web3_provider.eth.get_transaction_receipt(tx_hash)
    return Receipt({
        "status": receipt.get("status") == 1,
        "root": receipt.get("root"),
        "gas_used": receipt.get("gasUsed"),
        "cumulative_gas_used": receipt.get("cumulativeGasUsed"),
        "logs_bloom": receipt.get("logsBloom").hex(),
        "contract_address": None if receipt.get("contractAddress") == None else receipt.get("contractAddress").lower(),
        "block_number": receipt.get("blockNumber"),
        "block_hash": receipt.get("blockHash").hex(),
        "transaction_index": receipt.get("transactionIndex"),
        "transaction_hash": receipt.get("transactionHash").hex(),
        "logs": list(map(lambda log: {
            "address": log.get("address").lower(),
            "topics": list(map(lambda topic: topic.hex(), log.get("topics", []))),
            "data": log.get("data"),
            "log_index": log.get("logIndex"),
            "block_number": log.get("blockNumber"),
            "block_hash": log.get("blockHash").hex(),
            "transaction_index": log.get("transactionIndex"),
            "transaction_hash": log.get("transactionHash").hex(),
            "removed": log.get("removed")
        }, receipt.get("logs", []))),
    })


def create_block_event(dict):
    from .block_event import BlockEvent  # avoid circular import
    return BlockEvent(dict)


def create_transaction_event(dict):
    from .transaction_event import TransactionEvent  # avoid circular import
    return TransactionEvent(dict)


def create_alert_event(dict):
    from .alert_event import AlertEvent  # avoid circular import
    return AlertEvent(dict)


def get_alerts(dict):
    from .forta_graphql import AlertQueryOptions
    forta_api = "https://api.forta.network/graphql"
    headers = {"content-type": "application/json"}
    query_options = AlertQueryOptions(dict)
    payload = query_options.get_query()

    response = requests.request("POST", forta_api, json=payload, headers=headers)

    if response.status_code == 200:
        data = response.json().get('data')

        if data:
            return AlertsResponse(data.get('alerts'))
    else:
        message = response.text
        raise Exception(message)


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
    return Web3.keccak(text=val).hex()

def fetch_jwt(claims, expiresAt=None) -> str:
    host_name = 'forta-jwt-provider'
    port = 8515
    path = '/create'

    uri = 'http://{host_name}:{port}{path}'.format(host_name=host_name, port=port, path=path)

    if( (expiresAt != None) and (isinstance(expiresAt, datetime.datetime) == False)):
        raise Exception("expireAt must be of type datetime")

    if(expiresAt is not None):
        exp_in_sec = expiresAt.timestamp()
        claims["exp"] = exp_in_sec

    try:
        response = requests.request("POST", uri, json={'claims': claims})

        if response.status_code == 200:
            data = response.json()
            return data.get('token')

        else:
            raise Exception("Error occured with response fetching jwt token.")

    except requests.exceptions.RequestException as err:
        if("Name does not resolve" in str(err)):
            print("Could not resolve host 'forta-jwt-provider'. This url host can only be resolved inside of a running scan node")
            raise err
        else:
            raise err

def verify_jwt(token: str, polygonUrl: str ='https://polygon-rpc.com') -> bool:
    splitJwt = token.split('.')
    rawHeader = splitJwt[0]
    rawPayload = splitJwt[1]

    header = json.loads(base64.urlsafe_b64decode(rawHeader + '==').decode('utf-8'))
    payload = json.loads(base64.urlsafe_b64decode(rawPayload + '==').decode('utf-8'))

    alg = header['alg']
    botId = payload['bot-id']
    expiresAt = payload['exp']
    signerAddress = payload['sub']

    if (signerAddress is None) or (botId is None):
        logging.warning('Invalid claim')
        return False
    
    if alg != 'ETH':
        logging.warning('Unexpected signing method: {alg}'.format(alg=alg))
        return False

    currentUnixTime = time.mktime(datetime.datetime.utcnow().utctimetuple())

    if expiresAt < currentUnixTime:
        logging.warning('Jwt expired')
        return False

    msg = '{header}.{payload}'.format(header=rawHeader, payload=rawPayload)
    msgHash = w3.keccak(text=msg)
    b64signature = splitJwt[2]
    signature = base64.urlsafe_b64decode(f'{b64signature}=').hex()
    recoveredSignerAddress = w3.eth.account.recoverHash(msgHash, signature=signature)

    if recoveredSignerAddress != signerAddress:
        logging.warn('Signature invalid: expected={signerAddress}, got={recoveredSignerAddress}'.format(signerAddress=signerAddress, recoveredSignerAddress=recoveredSignerAddress))
        return False

    w3Client = Web3(Web3.HTTPProvider(polygonUrl))
    contract = w3Client.eth.contract(address=DISPATCH_CONTRACT,abi=DISPTACHER_ABI)

    areTheyLinked = contract.functions.areTheyLinked(int(botId,0), int(recoveredSignerAddress,0)).call()
    
    return areTheyLinked

class DecodedJwt:
    def __init__(self, dict):
        self.header = dict.get('header')
        self.payload = dict.get('payload')


def decode_jwt(token):
    # Adding need 4 byte for pythons b64decode
    header = base64.urlsafe_b64decode(token.split('.')[0] + '==').decode('utf-8')
    payload = base64.urlsafe_b64decode(token.split('.')[1] + '==').decode('utf-8')

    return DecodedJwt({
        "header": header,
        "payload": payload
    })