import { env } from '@/env.mjs';
import { authOptions } from '@/server/auth';
import { TenantRole } from '@/server/db/schema';
import { userHasAnyOfTenantRoles } from '@/server/db/services/tenant';
import { s3 } from '@/server/static';
import { randomUUID } from 'crypto';
import { IncomingForm } from 'formidable';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { PassThrough } from 'stream';

const uploadStream = (key: string) => {
  const pass = new PassThrough();

  s3.putObject(env.S3_BUCKET_NAME, key, pass, (err, data) => {
    console.log(err, data);
  });

  return pass;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const { tenant } = req.query;
  const session = await getServerSession(req, res, authOptions);

  if (!session) return res.status(401).send('Unauthorized');

  if (!tenant || typeof tenant !== 'string')
    return res.status(400).send('Missing tenant');

  const isPermitted = await userHasAnyOfTenantRoles(tenant, session.user.id, [
    TenantRole.OWNER,
    TenantRole.SUPER_USER,
  ]);

  if (!isPermitted) return res.status(403).send('Forbidden');

  const fileId = randomUUID();
  const key = [tenant, fileId].join('/');

  const form = new IncomingForm({
    uploadDir: './tmp-uploads',
    fileWriteStreamHandler: () => uploadStream(key),
  });

  form.parse(req, (err, _fields, _files) => {
    if (err) return res.status(400).send('Error occured processing request');

    res.status(200).send({
      tenantId: tenant,
      fileId,
    });
  });
};

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default handler;
