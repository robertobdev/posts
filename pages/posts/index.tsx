import Link from "next/link";
import clientPromise from "../../lib/mongodb";

interface PostProps {
  posts: Post[];
}

export interface Post {
  _id: string,
  photo: string,
  alt?: string,
  comments: Comment[];
}
export interface Comment {
  _id: string,
  comment: string,
  coordinate: Coordinate;
}

export interface Coordinate {
  x: number,
  y: number;
}

interface Card {
  photo: string;
  size: string;
  url: string;
}

export default function Posts({ posts }: PostProps) {
  return (
    <div style={styles.pin_container}>
      {posts.map(({ _id, photo }) => {
        return (
          <Card size="small" key={_id} photo={photo} url={'/posts/' + _id} />
        );
      })}
    </div>
  );
}

export async function getServerSideProps() {
  try {
    const client = await clientPromise;
    const db = client.db("posts");

    const posts = await db
      .collection("posts")
      .find({})
      .sort({ metacritic: -1 })
      .limit(20)
      .toArray();
    return {
      props: { posts: JSON.parse(JSON.stringify(posts)) },
    };
  } catch (e) {
    console.error(e);
  }
}

function Card({ size, url, photo }: Card) {
  return (
    <Link href={url}>
      <div style={{
        ...styles.card,
        ...styles[size]
      }}>
        <img height="250px" width="250px" src={photo} />
      </div>
    </Link>
  );
}

const styles: any = {
  pin_container: {
    margin: 0,
    padding: 0,
    width: '80vw',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, 250px)',
    gridAutoRows: '10px',
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    justifyContent: 'center',
  },
  card: {
    margin: '15px 10px',
    padding: 0,

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    gridRowEnd: 'span 26'
  },
  medium: {
    gridRowEnd: 'span 33'
  },
  large: {
    gridRowEnd: 'span 45'
  },
  img: {
    borderRadius: '16px',
  }
};

