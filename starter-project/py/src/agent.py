from forta_agent import Finding, FindingType, FindingSeverity

ERC20_TRANSFER_EVENT = '{"name":"Transfer","type":"event","anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}]}'
TETHER_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
TETHER_DECIMALS = 6
findings_count = 0


def handle_transaction(transaction_event):
    findings = []

    # limiting this agent to emit only 5 findings so that the alert feed is not spammed
    global findings_count
    if findings_count >= 5:
        return findings

    # filter the transaction logs for any Tether transfers
    tether_transfer_events = transaction_event.filter_log(
        ERC20_TRANSFER_EVENT, TETHER_ADDRESS)

    for transfer_event in tether_transfer_events:
        # shift decimals of transfer value
        value = transfer_event['args']['value'] / 10 ** TETHER_DECIMALS
        # if more than 10,000 Tether were transferred, report it
        if value > 10000:
            findings.append(Finding({
                'name': 'High Tether Transfer',
                'description': f'High amount of USDT transferred: {value}',
                'alert_id': 'FORTA-1',
                'severity': FindingSeverity.Low,
                'type': FindingType.Info,
            }))
            findings_count += 1

    return findings
