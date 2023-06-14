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

interface VolatileFile {
  lastModiedDate: Date | null;
  filepath: string;
  newFilename: string;
  originalFilename: string;
  mimetype: string;
  size: number;
}

const uploadStream = (tenant: string, file: VolatileFile) => {
  const pass = new PassThrough();

  s3.putObject(
    env.S3_BUCKET_NAME,
    [tenant, file.newFilename].join('/'),
    pass,
    (err, _data) => {
      if (err) console.error(err);
    }
  );

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

  const form = new IncomingForm({
    uploadDir: './tmp-uploads',
    keepExtensions: true,
    filename: (_name, ext) => `${fileId}${ext}`,
    // @ts-ignore
    fileWriteStreamHandler: (file: VolatileFile) => uploadStream(tenant, file),
  });

  form.parse(req, (err, _fields, files) => {
    if (err) return res.status(400).send('Error occured processing request');

    res.status(200).send({
      tenantId: tenant,
      // well...
      fileId: (files[Object.keys(files)[0]!] as any).newFilename,
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
