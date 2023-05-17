import responses
import pytest
from .utils import get_forta_api_url, get_forta_api_headers
from .label import Label, EntityType
from .labels_api import get_labels

mock_label = {
    "createdAt": "2023-05-16T07:43:36.007844434Z",
    "id": "0x6f5f0cf5ac536bf50a2c06ba14a8b619cbf3e856da740f53800b03e4a8f97ed3",
    "label": {
        "confidence": 0.8,
        "entity": "0x432c4faab3e87f1dfcea9a34c3f6b92dbb3c6082",
        "entityType": "ADDRESS",
        "label": "scammer-eoa",
        "metadata": [
            "alert_ids=SCAM-DETECTOR-ADDRESS-POISONING",
            "chain_id=1",
            "threat_description_url=https://forta.org/attacks#address-poisoning"
        ],
        "remove": False
    },
    "source": {
        "alertHash": "0xee2cfd0eee7c5b7b67d550ad8043044221e9b6aa43d6e7604595c6dd18e254fa",
        "alertId": "SCAM-DETECTOR-ADDRESS-POISONING",
        "bot": {
            "id": "0x1d646c4045189991fdfd24a66b192a294158b839a6ec121d740474bdacb3ab23",
            "image": "disco.forta.network/bafybeic2fzqhgypi7i7wqhxjvedph74euymruszdu7ghch6ocxf6msa7z4@sha256:2feb8176efa065de85f0b199bba84c291bd606e6c22e6b6c41b60f928c3cb29e",
            "imageHash": "2feb8176efa065de85f0b199bba84c291bd606e6c22e6b6c41b60f928c3cb29e",
            "manifest": "QmSM4tqw3p1y1jQyC6CAWVDPvqviv8F1ZkvdQc9H3ENwcb"
        },
        "chainId": 1,
        "id": "0x1d646c4045189991fdfd24a66b192a294158b839a6ec121d740474bdacb3ab23"
    }
}


@responses.activate
def test_raises_exception_if_api_returns_error():
    with pytest.raises(Exception, match=r".*some error.*"):
        mock_response = responses.Response(
            url=get_forta_api_url(),
            headers=get_forta_api_headers(),
            method="POST",
            json={"errors": [{"message": "some error"}]},
            status=200,
        )
        responses.add(mock_response)

        get_labels({})


@responses.activate
def test_invokes_api_and_returns_parsed_labels():
    mock_response = responses.Response(
        url=get_forta_api_url(),
        headers=get_forta_api_headers(),
        method="POST",
        json={"data": {"labels": {"pageInfo": {
            "hasNextPage": False}, "labels": [mock_label]}}},
        status=200,
    )
    responses.add(mock_response)

    response = get_labels({
        "source_ids": ["0xbotId1", "0xbotId2"],
        "entity_type": "ADDRESS",
        "created_since": 1234,
        "state": True,
    })

    page_info = response.page_info
    labels = response.labels
    assert page_info.has_next_page == False
    assert len(labels) == 1
    label = labels[0]
    assert isinstance(label, Label)
    assert label.entity_type == EntityType.Address
    assert label.label == mock_label["label"]["label"]
    assert label.confidence == mock_label["label"]["confidence"]
    assert label.remove == mock_label["label"]["remove"]
    assert len(label.metadata) == 3
    assert label.metadata["threat_description_url"] == "https://forta.org/attacks#address-poisoning"
    assert label.id == mock_label["id"]
    assert label.created_at == mock_label["createdAt"]
    assert label.source.chain_id == mock_label["source"]["chainId"]
    assert label.source.alert_hash == mock_label["source"]["alertHash"]
