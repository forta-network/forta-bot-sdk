from .jwt import MOCK_JWT, fetch_jwt
import responses
import os
import pytest


@responses.activate
def test_return_mock_jwt():
    # Register error response because we should not make a real call
    rsp1 = responses.Response(
        url="/",
        method="POST",
        json={"error": "not found"},
        status=404,
    )
    responses.add(rsp1)

    os.environ['NODE_ENV'] = 'dev'

    token = fetch_jwt()

    assert token == MOCK_JWT


@responses.activate
def test_return_valid_JWT():
    testJWT = "testJWT"
    # Register response because we should not make a real call
    rsp1 = responses.Response(
        url="http://forta-jwt-provider:8515/create",
        method="POST",
        json={"token": testJWT},
        status=200,
    )
    responses.add(rsp1)

    os.environ['NODE_ENV'] = 'production'

    token = fetch_jwt()

    assert token == testJWT


@responses.activate
def test_JWT_should_throw_exception():
    with pytest.raises(Exception) as e_info:

        # Register error response because we should not make a real call
        rsp1 = responses.Response(
            url="http://forta-jwt-provider:8515/create",
            method="POST",
            json={"message": 'Bad request'},
            status=400,
        )
        responses.add(rsp1)

        os.environ['NODE_ENV'] = 'production'

        token = fetch_jwt()
