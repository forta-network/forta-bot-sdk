class Alert:
    def __init__(self, dict):
        self.address = dict.get('addresses')
        self.alert_id = dict.get('alert_id')
        self.contracts = dict.get('contracts')
        self.created_at = dict.get('created_at')
        self.description = dict.get('description')
        self.finding_type = dict.get('finding_type')
        self.name = dict.get('name')
        self.protocol = dict.get('protocol')
        self.severity = dict.get('severity')
        self.source = map(lambda t: Source(t), dict.get('source'))
        self.metadata = dict.get('metadata')
        self.projects = list(map(lambda t: Projects(t), dict.get('projects', [])))


class Source:
    def __init__(self, dict):
        self.transaction_hash = dict.get('transaction_hash')
        self.block = dict.get('block')
        self.bot = dict.get('bot')


class Projects:
    def __init__(self, dict):
        self.id = dict.get('id')
        self.name = dict.get('name')
        self.contracts = dict.get('contracts')
        self.website = dict.get('website')
        self.token = dict.get('token')
        self.social = dict.get('social')
