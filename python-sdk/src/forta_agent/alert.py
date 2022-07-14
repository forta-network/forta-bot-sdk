class Alert:
    def __init__(self, dict):
        self.address = dict.get('addresses')
        self.alert_id = dict.get('alertId')
        self.contracts = list(map(lambda t: Contract(t), dict.get('contracts', []))) if dict.get('contracts') is not None else []
        self.created_at = dict.get('createdAt')
        self.description = dict.get('description')
        self.finding_type = dict.get('findingType')
        self.name = dict.get('name')
        self.protocol = dict.get('protocol')
        self.severity = dict.get('severity')
        self.source = Source(dict.get('source')) if dict.get('source') is not None else None
        self.metadata = dict.get('metadata')
        self.projects = list(map(lambda t: Projects(t), dict.get('projects', []))) if dict.get('projects') is not None else []


class Source:
    def __init__(self, dict):
        self.transaction_hash = dict.get('transactionHash')
        self.block = dict.get('block')
        self.bot = dict.get('bot')


class Contract:
    def __init__(self, dict):
        self.address = dict.get('address')
        self.name = dict.get('name')
        self.projectId = dict.get('projectId')


class Projects:
    def __init__(self, dict):
        self.id = dict.get('id')
        self.name = dict.get('name')
        self.contracts = dict.get('contracts')
        self.website = dict.get('website')
        self.token = dict.get('token')
        self.social = dict.get('social')
