export type ContentDiscriminator = 'MEDIA' | 'THEME';

export interface Content {
  id: number;
  name: string;
  shortDescription: string;
  iconUrl: string | null;
  discriminator: ContentDiscriminator;
  favorited: boolean;
}
