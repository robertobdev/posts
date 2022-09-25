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
      if (comment?._id) {
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


    res.json(post);

  } catch (e) {
    console.error(e);
  }
};