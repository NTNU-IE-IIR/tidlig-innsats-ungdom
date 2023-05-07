import { env } from '@/env.mjs';
import { s3 } from '@/server/static';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { tenant, object } = req.query;

  if (typeof tenant !== 'string' || typeof object !== 'string') {
    return res.status(400).send('Invalid tenant or object');
  }

  const key = [tenant, object].join('/');

  s3.getObject(env.S3_BUCKET_NAME, key, (err, data) => {
    if (err) return res.status(404).send('Could not find object');

    data.pipe(res);
    data.on('end', () => res.end());
  });
};

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
    externalResolver: true,
  },
};

export default handler;
