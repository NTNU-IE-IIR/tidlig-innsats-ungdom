import { s3 } from '@/server/static';
import { NextApiRequest, NextApiResponse } from 'next';
import { PassThrough } from 'stream';
import { IncomingForm } from 'formidable';
import { env } from '@/env.mjs';

const uploadStream = (tenantId: string) => {
  const pass = new PassThrough();
  const key = [tenantId, 'test'].join('/');

  s3.putObject(env.S3_BUCKET_NAME, key, pass, (err, data) => {
    console.log(err, data);
  });

  return pass;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const { tenant } = req.query;

  if (!tenant || typeof tenant !== 'string')
    return res.status(400).send('Missing tenant');

  const form = new IncomingForm({
    uploadDir: './tmp-uploads',
    fileWriteStreamHandler: () => uploadStream(tenant),
  });

  form.parse(req, (err, fields, _files) => {
    if (err) return res.status(400).send('Error occured processing request');

    if (!('mediaId' in fields)) {
      return res.status(400).send('Missing mediaId field');
    }

    res.status(200).send('');
  });
};

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default handler;
