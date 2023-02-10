class Alert:
    def __init__(self, dict):
        from .label import Label
        self.addresses = dict.get('addresses')
        self.alert_id = dict.get('alertId')
        self.contracts = list(map(lambda t: Contract(t), dict.get(
            'contracts', []))) if dict.get('contracts') is not None else []
        self.created_at = dict.get('createdAt')
        self.description = dict.get('description')
        self.finding_type = dict.get('findingType')
        self.name = dict.get('name')
        self.hash = dict.get('hash')
        self.protocol = dict.get('protocol')
        self.severity = dict.get('severity')
        self.source = Source(dict.get('source')) if dict.get(
            'source') is not None else None
        self.metadata = dict.get('metadata')
        self.projects = list(map(lambda t: Project(t), dict.get(
            'projects', []))) if dict.get('projects') is not None else []
        self.scan_node_count = dict.get('scanNodeCount')
        self.alert_document_type = dict.get('alertDocumentType')
        self.related_alerts = dict.get('relatedAlerts')
        self.chain_id = dict.get('chainId')
        self.labels = list(map(lambda t: Label(t), dict.get(
            'labels', []))) if dict.get('labels') is not None else []


class Source:
    def __init__(self, dict):
        self.transaction_hash = dict.get('transactionHash')
        self.block = SourceBlock(dict.get('block')) if dict.get(
            'block') is not None else None
        self.bot = SourceBot(dict.get('bot')) if dict.get(
            'bot') is not None else None
        self.source_alert = SourceAlert(dict.get('sourceAlert')) if dict.get(
            'sourceAlert') is not None else None


class SourceBlock:
    def __init__(self, dict):
        self.timestamp = dict.get('timestamp')
        self.chain_id = dict.get('chainId')
        self.hash = dict.get('hash')
        self.number = dict.get('number')


class SourceBot:
    def __init__(self, dict):
        self.id = dict.get('id')
        self.reference = dict.get('reference')
        self.image = dict.get('image')


class SourceAlert:
    def __init__(self, dict):
        self.hash = dict.get('hash')
        self.bot_id = dict.get('botId')
        self.timestamp = dict.get('timestamp')
        self.chain_id = dict.get('chainId')


class Contract:
    def __init__(self, dict):
        self.address = dict.get('address')
        self.name = dict.get('name')
        self.project_id = dict.get('projectId')


class Project:
    def __init__(self, dict):
        self.id = dict.get('id')
        self.name = dict.get('name')
        self.contacts = ProjectContacts(dict.get('contacts')) if dict.get(
            'contacts') is not None else None
        self.website = dict.get('website')
        self.token = ProjectToken(dict.get('token')) if dict.get(
            'token') is not None else None
        self.social = ProjectSocial(dict.get('social')) if dict.get(
            'social') is not None else None


class ProjectContacts:
    def __init__(self, dict):
        self.security_email_address = dict.get('securityEmailAddress')
        self.general_email_address = dict.get('generalEmailAddress')


class ProjectToken:
    def __init__(self, dict):
        self.symbol = dict.get('symbol')
        self.name = dict.get('name')
        self.decimals = dict.get('decimals')
        self.chain_id = dict.get('chainId')
        self.address = dict.get('address')


class ProjectSocial:
    def __init__(self, dict):
        self.twitter = dict.get('twitter')
        self.github = dict.get('github')
        self.everest = dict.get('everest')
        self.coingecko = dict.get('coingecko')
