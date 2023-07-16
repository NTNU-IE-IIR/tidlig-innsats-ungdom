import { env } from '@/env.mjs';
import { authOptions } from '@/server/auth';
import { userIsInTenant } from '@/server/db/services/tenant';
import { s3 } from '@/server/static';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';

const FILE_EXTENSION_MIME_TYPES: {
  [key: string]: string;
} = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { tenant, object } = req.query;
  const session = await getServerSession(req, res, authOptions);

  if (!session) return res.status(401).send('Unauthorized');

  if (typeof tenant !== 'string' || typeof object !== 'string') {
    return res.status(400).send('Invalid tenant or object');
  }

  const isPermitted = await userIsInTenant(tenant, session.user.id);

  if (!isPermitted) return res.status(403).send('Forbidden');

  const key = [tenant, object].join('/');

  s3.getObject(env.S3_BUCKET_NAME, key, (err, data) => {
    if (err) return res.status(404).send('Could not find object');

    const rawExtension = object.split('.').pop();
    const extension = `.${rawExtension}`;

    if (rawExtension && extension in FILE_EXTENSION_MIME_TYPES) {
      res.setHeader('Content-Type', FILE_EXTENSION_MIME_TYPES[extension] ?? '');
    }

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
