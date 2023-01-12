from .utils import fetch_jwt
import requests

def test_should_return_valid_jwt():
    response = fetch_jwt({})
    assert len(response.alerts) > 0


def test_should_return_mock_jwt():
    assert False


def test_should_fail_to_fetch_jwt():
    assert False