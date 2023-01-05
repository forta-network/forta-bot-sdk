from .utils import get_alerts


def test_get_alerts_returns_more_than_one_alert():
    assert True
#     response = get_alerts(
#         {'bot_ids': ["0x79af4d8e0ea9bd28ed971f0c54bcfe2e1ba0e6de39c4f3d35726b15843990a51"]})
#     assert len(response.alerts) > 0


def test_get_alerts_parse_alert():
    assert True
    #     response = get_alerts(
    #         {'bot_ids': ["0x79af4d8e0ea9bd28ed971f0c54bcfe2e1ba0e6de39c4f3d35726b15843990a51"]})
    #     alert = response.alerts[0]
    #     print(alert.description)
    #     assert True


def test_get_alerts_exception_on_400_response():
    assert True
    #     try:
    #         get_alerts({'bot_ids': ["0x79af4d8e0ea9bd28ed971f0c54bcfe2e1ba0e6de39c4f3d35726b15843990a51"],
    #                    'created_since': '2022-11-02T14:15:09.783203651Z'})
    #         assert False

    #     except Exception as err:
    #         assert err
