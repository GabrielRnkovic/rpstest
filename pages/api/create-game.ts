import { createGame } from '../../app/actions';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    await createGame(req, res);
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
