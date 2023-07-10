export type ContentDiscriminator = 'MEDIA' | 'THEME';
export type FavoriteType = 'DIRECT' | 'INDIRECT' | 'NONE';

export interface Content {
  id: number;
  name: string;
  shortDescription: string;
  discriminator: ContentDiscriminator;
  favorited: FavoriteType;
}
