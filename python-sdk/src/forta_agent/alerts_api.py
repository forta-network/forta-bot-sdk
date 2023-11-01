import requests
import json
from .alert import Alert
from .finding import FindingType, FindingSeverity
from .label import EntityType
from .utils import get_forta_api_headers, get_forta_api_url


def send_alerts(alerts):
    if not isinstance(alerts, list):
        alerts = [alerts]

    alerts_api_url = get_forta_api_url()
    headers = get_forta_api_headers()
    mutation = SendAlertsRequest(alerts).get_mutation()

    response = requests.request(
        "POST", alerts_api_url, json=mutation, headers=headers)

    if response.status_code == 200:
        data = response.json().get('data')
        if data:
            return data.get('sendAlerts').get('alerts')
    else:
        message = response.text
        raise Exception(message)


class SendAlertsRequest:
    def __init__(self, alerts):
        self.alerts = []
        # serialize the alerts list
        for alert in alerts:
            # convert finding timestamp to RFC3339 format
            alert["finding"].timestamp = alert["finding"].timestamp.astimezone(
            ).isoformat()
            # serialize finding
            finding = json.loads(alert["finding"].toJson())
            # convert enums to all caps to match graphql enums
            finding["type"] = FindingType(finding["type"]).name.upper()
            finding["severity"] = FindingSeverity(
                finding["severity"]).name.upper()
            for label in finding.get("labels", []):
                label["entityType"] = EntityType(
                    label["entityType"]).name.upper()
            # remove protocol field (not part of graphql schema)
            del finding["protocol"]
            # remove any empty-value or snake-case-keyed fields
            finding = {k: v for k, v in finding.items()
                       if v is not None and "_" not in k}
            for index, label in enumerate(finding.get("labels", [])):
                finding["labels"][index] = {k: v for k, v in label.items()
                                            if v is not None and "_" not in k}
            self.alerts.append({
                "botId": alert["bot_id"],
                "finding": finding
            })

    def get_mutation(self):
        mutation = """
        mutation SendAlerts($alerts: [AlertRequestInput!]!) {
            sendAlerts(alerts: $alerts) {
                alerts {
                    alertHash
                    error {
                        code
                        message
                    }
                }
            }
        }
        """
        return dict(query=mutation, variables={"alerts": self.alerts})


def get_alerts(dict):
    alerts_api_url = get_forta_api_url()
    headers = get_forta_api_headers()
    query_options = AlertQueryOptions(dict)
    payload = query_options.get_query()

    response = requests.request(
        "POST", alerts_api_url, json=payload, headers=headers)

    if response.status_code == 200:
        data = response.json().get('data')
        if data:
            return AlertsResponse(data.get('alerts'))
    else:
        message = response.text
        raise Exception(message)


class AlertCursor:
    def __init__(self, dict):
        self.alert_id = dict.get('alertId')
        self.block_number = dict.get('blockNumber')


class AlertQueryOptions:
    def __init__(self, dict):
        self.bots = dict.get('bot_ids')
        self.addresses = dict.get('addresses')
        self.alertHash = dict.get('alert_hash')
        self.alertId = dict.get('alert_id')
        self.alertIds = dict.get('alert_ids')
        self.chainId = dict.get('chain_id')
        self.createdSince = dict.get('created_since')
        self.createdBefore = dict.get('created_before')
        self.first = dict.get('first')
        self.after = dict.get('starting_cursor')
        self.projectId = dict.get('project_id')
        self.scanNodeConfirmations = dict.get('scan_node_confirmations')
        self.severities = dict.get('severities')
        self.transactionHash = dict.get('transaction_hash')
        self.blockSortDirection = dict.get('block_sort_direction')
        self.blockDateRange = dict.get('block_date_range')
        self.blockNumberRange = dict.get('block_number_range')

    def get_query(self):
        query = """
          query($input: AlertsInput) {
            alerts(input: $input) {
                alerts {
                    alertId
                    addresses
                    contracts {
                        address
                        name
                        projectId
                    }
                    createdAt
                    description
                    hash
                    metadata
                    name
                    projects {
                        id
                    }
                    protocol
                    scanNodeCount
                    severity
                    source {
                        transactionHash
                        bot {
                            chainIds
                            createdAt
                            description
                            developer
                            docReference
                            enabled
                            id
                            image
                            name
                            reference
                            repository
                            projects
                            scanNodes
                            version
                        }
                        block {
                            number
                            hash
                            timestamp
                            chainId
                        }
                        sourceAlert {
                            hash
                            botId
                            timestamp
                            chainId
                        }
                    }
                    alertDocumentType
                    findingType
                    relatedAlerts
                    chainId
                    labels {
                        label
                        confidence
                        entity
                        entityType
                        remove
                        metadata
                        uniqueKey
                    }
                    addressBloomFilter {
                        bitset
                        k
                        m
                    }
                }
                pageInfo {
                    hasNextPage
                    endCursor {
                        blockNumber
                        alertId
                    }
                }
            }
          }
          """
        query_variables = vars(self)
        filtered_query_variables = {
            k: v for k, v in query_variables.items() if v is not None}
        return dict(query=query, variables={"input": filtered_query_variables})


class AlertsResponse:
    def __init__(self, dict):
        self.alerts = list(map(lambda t: Alert(t), dict.get(
            'alerts', []))) if dict.get('alerts') is not None else []
        self.page_info = PageInfo(dict.get('pageInfo')) if dict.get(
            'pageInfo') is not None else None


class PageInfo:
    def __init__(self, dict):
        self.has_next_page = dict.get('hasNextPage')
        self.end_cursor = AlertCursor(dict.get('endCursor')) if dict.get(
            'endCursor') is not None else None
