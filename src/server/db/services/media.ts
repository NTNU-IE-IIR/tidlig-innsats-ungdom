import { db } from '..';
import { mediaView } from '../schema';

export const incrementMediaViewCount = async (
  mediaId: number,
  userAccountId: string
) => {
  await db.insert(mediaView).values({
    mediaId,
    userAccountId,
    viewedAt: new Date(),
  });
};
