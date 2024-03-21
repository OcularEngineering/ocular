import { AppCategoryDefinitions } from "../apps";
import { AppNameDefinitions } from "../apps";
import { SearchFieldDataType, VectorSearchAlgorithmKind} from "@azure/search-documents"
export const INDEX_DOCUMENT_EVENT = "INDEX_DOCUMENT_EVENT"

// Note: Adding a field here requires updating the index definition below.
export type IndexableDocument = {
  id: string;
  organisationId: string;
  title?: string;
  source?: AppNameDefinitions;
  content?: string;
  metadata?: string;
  updatedAt?: Date;
  location?: string;
};

export type IndexableDocChunk = {
  id?: string;
  organisationId?: string;
  sourceDocId?: string;
  title?: string;
  titleVector?: number[] | null;
  source?: AppNameDefinitions;
  content?: string;
  contentVector?: number[] | null;
  metadata?: string;
  updatedAt?: Date;
  location?: string;
};

export const IndexFields = [
  {
    name: "id",
    type: "Edm.String" as SearchFieldDataType,
    key: true,
  },
  {
    name: "organisationId",
    type: "Edm.String" as SearchFieldDataType,
    filterable: true,
  },
  {
    name: "sourceDocId",
    type: "Edm.String" as SearchFieldDataType,
  },
  { 
    name: "title",
    type: "Edm.String" as SearchFieldDataType,
    searchable: true,
    sortable: true
    },
    {
    name: "titleVector",
    type: "Collection(Edm.Single)" as SearchFieldDataType,
    hidden: false,
    searchable: true,
    filterable: false,
    sortable: false,
    facetable: false,
    vectorSearchDimensions: 1536,
    vectorSearchProfileName: "myHnswProfile",
  },
  { 
    name: "source", 
    type: "Edm.String" as SearchFieldDataType, 
    sortable: true, 
    filterable: true
  },
  {
    name: "content", 
    type: "Edm.String" as SearchFieldDataType, 
    searchable: true
  },
  {
    name: "contentVector",
    type: "Collection(Edm.Single)" as SearchFieldDataType,
    hidden: false,
    searchable: true,
    filterable: false,
    sortable: false,
    facetable: false,
    vectorSearchDimensions: 1536,
    vectorSearchProfileName: "myHnswProfile",
  },
  {
    name: "metadata",
    type: "Edm.String" as SearchFieldDataType,
    searchable: true
  },
  { 
    name: "updatedAt", 
    type: "Edm.DateTimeOffset" as SearchFieldDataType, 
    sortable: true, 
    facetable: true,
    searchable: false,
  },
  {
    name: "location",
    type: "Edm.String" as SearchFieldDataType,
    searchable: false,
  },
];

export const vectorSearchProfile = {
  algorithms: [{ name: "myHnswAlgorithm", kind: "hnsw" as VectorSearchAlgorithmKind }],
  profiles: [
    {
      name: "myHnswProfile",
      algorithmConfigurationName: "myHnswAlgorithm",
    },
  ],
};

export const semanticSearchProfile = {
  configurations: [
    {
      name: "my-semantic-config",
      prioritizedFields: {
        contentFields: [{ name: "content" }],
        titleField: {
          name: "title",
        },
      },
    },
  ],
};