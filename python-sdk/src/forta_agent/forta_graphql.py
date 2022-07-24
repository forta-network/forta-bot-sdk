from .alert import Alert

class AlertCursor:
    def __init__(self, dict):
        self.alert_id = dict.get('alertId')
        self.block_number = dict.get('blockNumber')


class AlertQueryOptions:
    def __init__(self, dict):
        self.bots = dict.get('bot_ids')
        self.addresses = dict.get('addresses')
        self.alertId = dict.get('alert_id')
        self.chainId = dict.get('chain_id')
        self.createdSince = dict.get('created_since')
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
                  hash
                  contracts {
                      address
                      name
                      projectId
                  }
                  createdAt
                  description
                  findingType
                  name
                  projects {
                      id
                  }
                  protocol
                  metadata
                  scanNodeCount
                  severity
                  source {
                      transactionHash
                      bot {
                          id
                      }
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
        filtered_query_variables = {k:v for k,v in query_variables.items() if v is not None}
        return dict(query=query, variables={"input": filtered_query_variables})


class AlertsResponse:
    def __init__(self, dict):
        self.alerts = list(map(lambda t: Alert(t), dict.get('alerts', []))) if dict.get('alerts') is not None else []
        self.page_info = PageInfo(dict.get('pageInfo')) if dict.get('pageInfo') is not None else None

class PageInfo:
    def __init__(self,dict):
        self.has_next_page = dict.get('hasNextPage')
        self.end_cursor = AlertCursor(dict.get('endCursor')) if dict.get('endCursor') is not None else None