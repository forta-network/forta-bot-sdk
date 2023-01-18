import os
import requests
import datetime
import json
import base64
import logging
import time
from web3.auto import w3
from web3 import Web3

MOCK_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJib3QtaWQiOiIweDEzazM4N2IzNzc2OWNlMjQyMzZjNDAzZTc2ZmMzMGYwMWZhNzc0MTc2ZTE0MTZjODYxeWZlNmMwN2RmZWY3MWYiLCJleHAiOjE2NjAxMTk0NDMsImlhdCI6MTY2MDExOTQxMywianRpIjoicWtkNWNmYWQtMTg4NC0xMWVkLWE1YzktMDI0MjBhNjM5MzA4IiwibmJmIjoxNjYwMTE5MzgzLCJzdWIiOiIweDU1NmY4QkU0MmY3NmMwMUY5NjBmMzJDQjE5MzZEMmUwZTBFYjNGNEQifQ.9v5OiiYhDoEbhZ-abbiSXa5y-nQXa104YCN_2mK7SP0'


def fetch_jwt(claims={}, expiresAt=None) -> str:
    if(os.environ['NODE_ENV'] != 'production'):
        return MOCK_JWT

    host_name = 'forta-jwt-provider'
    port = 8515
    path = '/create'
    uri = 'http://{host_name}:{port}{path}'.format(
        host_name=host_name, port=port, path=path)

    if((expiresAt != None) and (isinstance(expiresAt, datetime.datetime) == False)):
        raise Exception("expireAt must be of type datetime")

    if expiresAt is not None:
        exp_in_sec = expiresAt.timestamp()
        claims["exp"] = exp_in_sec

    response = requests.request("POST", uri, json={'claims': claims})

    if response.status_code == 200:
        data = response.json()
        return data.get('token')
    else:
        raise Exception(
            "Error occured with response fetching jwt token.", response)


def verify_jwt(token: str, polygonUrl: str = 'https://polygon-rpc.com') -> bool:
    splitJwt = token.split('.')
    rawHeader = splitJwt[0]
    rawPayload = splitJwt[1]

    header = json.loads(base64.urlsafe_b64decode(
        rawHeader + '==').decode('utf-8'))
    payload = json.loads(base64.urlsafe_b64decode(
        rawPayload + '==').decode('utf-8'))

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
    recoveredSignerAddress = w3.eth.account.recoverHash(
        msgHash, signature=signature)

    if recoveredSignerAddress != signerAddress:
        logging.warn('Signature invalid: expected={signerAddress}, got={recoveredSignerAddress}'.format(
            signerAddress=signerAddress, recoveredSignerAddress=recoveredSignerAddress))
        return False

    w3Client = Web3(Web3.HTTPProvider(polygonUrl))
    DISPTACHER_ABI = [{"inputs": [{"internalType": "uint256", "name": "agentId", "type": "uint256"}, {"internalType": "uint256", "name": "scannerId", "type": "uint256"}],
                       "name": "areTheyLinked", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "stateMutability": "view", "type": "function"}]
    # Source: https://docs.forta.network/en/latest/smart-contracts/
    DISPATCH_CONTRACT = "0xd46832F3f8EA8bDEFe5316696c0364F01b31a573"
    contract = w3Client.eth.contract(
        address=DISPATCH_CONTRACT, abi=DISPTACHER_ABI)

    areTheyLinked = contract.functions.areTheyLinked(
        int(botId, 0), int(recoveredSignerAddress, 0)).call()

    return areTheyLinked


class DecodedJwt:
    def __init__(self, dict):
        self.header = dict.get('header')
        self.payload = dict.get('payload')


def decode_jwt(token):
    # Adding need 4 byte for pythons b64decode
    header = base64.urlsafe_b64decode(
        token.split('.')[0] + '==').decode('utf-8')
    payload = base64.urlsafe_b64decode(
        token.split('.')[1] + '==').decode('utf-8')

    return DecodedJwt({
        "header": header,
        "payload": payload
    })
