import { AppCategoryDefinitions } from "../apps";
import { AppNameDefinitions } from "../apps";

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
 title: string;

  /**
    * The source app of the the document (e.g. "core-backend", "gmail" etc).
  */
 source: AppNameDefinitions;

 /**
  * Free-form text of the document (e.g. description, content, etc).
  */
 content?: Content[];
 
/**
  * The date the document was last updated.
 */
 updated_at: Date;
 /**
  * The relative or absolute URL of the document (target when a search result
  * is clicked).
  */
 location: string;
};

export const indexFields = ([
    {
      name: "id",
      type: "Edm.String",
      key: true,
      searchable: false,
    },
    { 
      name: "title",
      type: "Edm.String",
      searchable: true,
      sortable: true
     },
    { 
      name: "source", 
      type: "Edm.String", 
      searchable: true,
      sortable: true , 
      filterable: true
    },
    {
      name: "content", 
      type: "Edm.ComplexType", 
      fields: [
        { name: "text", type: "Edm.String", searchable: true },
        { name: "link", type: "Edm.String", searchable: false }
      ]
    },
    { 
      name: "updated_at", 
      type: "Edm.DateTimeOffset", 
      sortable: true, 
      facetable: true,
      searchable: false,
    },
    {
      name: "location",
      type: "Edm.String",
      searchable: false,
    },
  ]);