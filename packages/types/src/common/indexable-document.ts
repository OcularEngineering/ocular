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
  /*
  * Unique identifier for the document.
  */
  id: string;

  /**
   * The organisation id that owns this doc. 
   * Note: All docs belonging to a particular organisation are indexed in a single index, so this id shouldnt matter.
   * However we need this as a last case defense against docs showing the wrong organisation the wrong docs. 
   * This is a last line of defence.
   */
  organisation_id: string;

 
  /**
    * The primary name of the document (e.g. name, title, identifier, etc).
    */
  title?: string;

  titleVector?: number[]|null;

  /**
    * The source app of the the document (e.g. "core-backend", "gmail" etc).
  */
  source?: AppNameDefinitions;

 /**
  * Free-form text of the document (e.g.content, etc).
  */
 content?: string;

 contentVector?: number[] | null;


 metadata?: string;

  /**
   * Document Embedding
   */

  // contentVector?: number[]|null;
 
  /**
    * The date the document was last updated.
  */
  updated_at?: Date;
  /**
    * The relative or absolute URL of the document (target when a search result
    * is clicked).
    */
  location?: string;
};


  export const IndexFields = [
    {
      name: "id",
      type: "Edm.String" as SearchFieldDataType,
      key: true,
      searchable: false,
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
      searchable: true,
      vectorSearchDimensions: 1536,
      vectorSearchProfileName: "myHnswProfile",
    },
    { 
      name: "source", 
      type: "Edm.String" as SearchFieldDataType, 
      searchable: true,
      sortable: true , 
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
      searchable: true,
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