// this is a draft for using discriminating type values
// for the content of "media" in the database.
// this is only applicable if we want to be able to store
// different types of content in the "content" column of the "media" table.

export interface MediaRichText {
  type: 'rich-text';
}

export interface MediaForm {
  type: 'form';
  formId: number;
}

export type MediaContent = MediaRichText | MediaForm;
