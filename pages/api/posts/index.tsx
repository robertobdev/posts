import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from "../../../lib/mongodb";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const client = await clientPromise;
    const db = client.db("posts");
    if (req.method === 'POST') {
      await db
        .collection("posts")
        .insertOne(req.body);
    }

    const posts = await db
      .collection("posts")
      .find({})
      .sort({ "_id": -1 })
      .limit(110)
      .toArray();

    res.json(posts);
  } catch (e) {
    console.error(e);
  }
};