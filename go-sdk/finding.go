package utils

type FindingSeverirty int

const (
	FINDING_SEVERITY_UNKNOWN FindingSeverirty = iota
	FINDING_SEVERITY_INFO
	FINDING_SEVERITY_LOW
	FINDING_SEVERITY_MEDIUM
	FINDING_SEVERITY_HIGH
	FINDING_SEVERITY_CRITICAL
)

type FindingType int

const (
	FINDING_TYPE_UNKNOWN FindingType = iota
	FINDING_TYPE_EXPLOIT
	FINDING_TYPE_SUPICIOUS
	FINDING_TYPE_DEGRADED
	FINDING_TYPE_INFO
)

type Finding struct {
	name        string
	description string
	alertId     string
	protocol    string
	severity    FindingSeverirty
	Type        FindingType
	metadata    map[string]string
	addresses   []string
}
