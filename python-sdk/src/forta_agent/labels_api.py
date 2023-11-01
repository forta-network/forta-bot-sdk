import requests
from .label import Label
from .utils import get_forta_api_headers, get_forta_api_url


def get_labels(dict):
    forta_api_url = get_forta_api_url()
    headers = get_forta_api_headers()
    query_options = LabelQueryOptions(dict)
    payload = query_options.get_query()

    response = requests.request(
        "POST", forta_api_url, json=payload, headers=headers)

    if response.status_code != 200:
        raise Exception(response.text)

    json_response = response.json()
    errors = json_response.get('errors')
    if errors is not None and len(errors) > 0:
        raise Exception(errors[0].get('message'))

    data = json_response.get('data')
    return LabelsResponse(data.get('labels'))


class LabelQueryOptions:
    def __init__(self, dict):
        self.entities = dict.get('entities')
        self.labels = dict.get('labels')
        self.sourceIds = dict.get('source_ids')
        self.entityType = dict.get('entity_type')
        self.state = dict.get('state')
        self.createdSince = dict.get('created_since')
        self.createdBefore = dict.get('created_before')
        self.first = dict.get('first')
        starting_cursor = dict.get('starting_cursor')
        if starting_cursor is not None:
            self.after = {
                'pageToken': starting_cursor.page_token if isinstance(starting_cursor, LabelCursor) else starting_cursor.get('page_token')
            }

    def get_query(self):
        query = """
          query($input: LabelsInput) {
            labels(input: $input) {
                labels {
                    createdAt
                    id
                    label {
                        confidence
                        entity
                        entityType
                        label
                        metadata
                        remove
                        uniqueKey
                    }
                    source {
                        alertHash
                        alertId
                        bot {
                            id
                            image
                            imageHash
                            manifest
                        }
                        chainId
                        id
                    }
                }
                pageInfo {
                    hasNextPage
                    endCursor {
                        pageToken
                    }
                }
            }
          }
          """
        query_variables = vars(self)
        filtered_query_variables = {
            k: v for k, v in query_variables.items() if v is not None}
        return dict(query=query, variables={"input": filtered_query_variables})


class LabelsResponse:
    def __init__(self, dict):
        self.page_info = LabelPageInfo(dict.get('pageInfo')) if dict.get(
            'pageInfo') is not None else None
        self.labels = []
        labels_data = dict.get('labels', [])
        for label_data in labels_data:
            label_dict = label_data.get('label')
            label_dict['id'] = label_data.get('id')
            label_dict['source'] = label_data.get('source')
            label_dict['createdAt'] = label_data.get('createdAt')
            self.labels.append(Label(label_dict))


class LabelPageInfo:
    def __init__(self, dict):
        self.has_next_page = dict.get('hasNextPage')
        self.end_cursor = LabelCursor(dict.get('endCursor')) if dict.get(
            'endCursor') is not None else None


class LabelCursor:
    def __init__(self, dict):
        self.page_token = dict.get('pageToken')
