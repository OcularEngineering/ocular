import { AppCategoryDefinitions } from "../apps";
import { AppNameDefinitions } from "../apps";
import { SearchFieldDataType, VectorSearchAlgorithmKind} from "@azure/search-documents"
export const INDEX_DOCUMENT_EVENT = "INDEX_DOCUMENT_EVENT"


// List Of Apps That Can Be Installed and Indexed In The Core Backend
export enum AppType {
  CORE_BACKEND = "core-backend",
}


type Content = {
  text: string;
  link?: string;
}

// Note: Adding a field here requires updating the index definition below.
export type IndexableDocument = {
  id: string;
  organisation_id: string;
  title?: string;
  titleVector?: number[]|null;
  source?: AppNameDefinitions;
  content?: string;
  contentVector?: number[] | null;
  metadata?: string;
  updated_at?: Date;
  location?: string;
};


  export const IndexFields = [
    {
      name: "id",
      type: "Edm.String" as SearchFieldDataType,
      key: true,
    },
    {
      name: "organisation_id",
      type: "Edm.String" as SearchFieldDataType,
      filterable: true,
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
      name: "updated_at", 
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
    {
      name: "metadata",
      type: "Edm.String" as SearchFieldDataType,
      searchable: true
    }
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