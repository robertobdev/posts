import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from "../../../lib/mongodb";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const client = await clientPromise;
    const db = client.db("posts");
    const posts = await db
      .collection("posts")
      .find({})
      .sort({ metacritic: -1 })
      .limit(10)
      .toArray();

    res.json(posts);
  } catch (e) {
    console.error(e);
  }
};