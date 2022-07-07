from forta_agent.alerts import Alert


class AlertCursor:
    def __init__(self, dict):
        self.alert_id = dict.get('alert_id')
        self.block_number = dict.get('block_number')


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

    query = """
    query exampleQuery($input: AlertsInput) {
      alerts(input: $input) {
        alerts {
          name
          protocol
          findingType
          source {
            transactionHash
            block {
              number
              chainId
              timestamp
              hash
            }
            bot {
              id
            }
          }
          severity
          metadata
          alertId
          addresses
          description
          hash
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

    def get_query(self):
        query_variables = vars(self)
        return dict(query=query, variables=query_variables)


class AlertsResponse:
    def __init__(self, dict):
        self.alerts = list(map(lambda t: Alert(t), dict.get('alerts', [])))
        self.page_info = dict.get('page_info')


class RawGraphqlAlertResponse:
    def __init__(self, dict):
        self.data = dict.get('data')


