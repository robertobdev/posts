import { ObjectId } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from "../../../lib/mongodb";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const client = await clientPromise;
    const db = client.db("posts");
    const { id } = req.query;
    const _id = new ObjectId(id as string);

    const post = await db
      .collection("posts")
      .findOne({ _id });

    if (req.method === 'PATCH') {
      const comment = req.body;
      let newComments = [...post?.comments];
      if (comment?.remove) {
        newComments = newComments.filter((commentItem) => commentItem._id !== comment._id);
      } else {
        newComments.push(comment);
      }
      await db
        .collection("posts")
        .updateOne({ _id }, {
          $set: {
            comments: newComments
          }
        });
      res.json({ message: 'Comments updated' });
      return;
    }

    if (req.method === 'DELETE') {
      await db
        .collection("posts")
        .deleteOne({ _id });

      const posts = await db
        .collection("posts")
        .find({})
        .sort({ "_id": -1 })
        .limit(110)
        .toArray();

      res.json(posts);
      return;
    }


    res.json(post);

  } catch (e) {
    console.error(e);
  }
};