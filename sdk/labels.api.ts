import { AxiosInstance } from "axios";
import { EntityType, Label, LabelSource } from "./label";
import { assertExists, getFortaApiHeaders, getFortaApiURL } from "./utils";

export type GetLabels = (query: LabelQueryOptions) => Promise<LabelsResponse>;
export function provideGetLabels(axios: AxiosInstance): GetLabels {
  assertExists(axios, "axios");

  return async function getLabels(
    query: LabelQueryOptions
  ): Promise<LabelsResponse> {
    const response: RawGraphqlLabelResponse = await axios.post(
      getFortaApiURL(),
      getQueryFromLabelOptions(query),
      getFortaApiHeaders()
    );

    if (response.data?.errors?.length)
      throw Error(response.data.errors[0].message);

    const pageInfo = response.data.data.labels.pageInfo;
    const labels: Label[] = [];
    for (const labelData of response.data.data.labels.labels) {
      const { label, id, createdAt, source } = labelData;
      labels.push(
        Label.fromObject({
          ...label,
          metadata: label.metadata ?? {},
          id,
          createdAt,
          source,
        })
      );
    }
    return { labels, pageInfo };
  };
}

export interface LabelQueryOptions {
  entities?: string[];
  labels?: string[];
  sourceIds?: string[];
  entityType?: string;
  state?: boolean;
  createdSince?: number;
  createdBefore?: number;
  first?: number;
  startingCursor?: LabelCursor;
}

export interface LabelCursor {
  pageToken: string;
}

export interface LabelsResponse {
  labels: Label[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor?: {
      pageToken: string;
    };
  };
}

interface RawGraphqlLabelData {
  id: string;
  label: RawGraphqlLabel;
  createdAt: string;
  source: LabelSource;
}

interface RawGraphqlLabel {
  confidence: number;
  entity: string;
  entityType: EntityType;
  label: string;
  metadata: any;
  remove: boolean;
}

interface RawGraphqlLabelResponse {
  data: {
    data: {
      labels: {
        labels: RawGraphqlLabelData[];
        pageInfo: {
          hasNextPage: boolean;
          endCursor?: {
            pageToken: string;
          };
        };
      };
    };
    errors: any;
  };
}

export const getQueryFromLabelOptions = (options: LabelQueryOptions) => {
  return {
    operationName: "fetchLabels",
    query: `
            query fetchLabels(
                $entities: [String],
                $entityType: String,
                $labels: [String],
                $sourceIds: [String],
                $state: Boolean,
                $after: LabelEndCursorInput,
                $first: NonNegativeInt,
                $createdBefore: NonNegativeInt,
                $createdSince: NonNegativeInt
                ) {
                    labels(input:{
                        entities: $entities,
                        entityType: $entityType,
                        labels: $labels,
                        sourceIds: $sourceIds,
                        state: $state,
                        after: $after,
                        first: $first,
                        createdBefore: $createdBefore,
                        createdSince: $createdSince
                    }) {
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
        `,
    variables: {
      entities: options.entities,
      entityType: options.entityType,
      labels: options.labels,
      sourceIds: options.sourceIds,
      state: options.state,
      after: options.startingCursor,
      first: options.first,
      createdBefore: options.createdBefore,
      createdSince: options.createdSince,
    },
  };
};
