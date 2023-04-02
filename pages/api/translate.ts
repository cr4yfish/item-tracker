// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { translate, initDeepl } from '@/functions/Deepl';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const jsonBody = JSON.parse(req.body);
  const { sourceText, source, target } = jsonBody;
  console.log(sourceText, source, target);
  const result = await translate(sourceText, source, target);
  console.log(`Translated text: ${result.text} from ${source} to ${target}`);
  res.status(200).json(result);
  return;
}
