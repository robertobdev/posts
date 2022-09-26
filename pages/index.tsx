import DeleteIcon from '@mui/icons-material/Delete';
import { Button, Dialog, DialogActions, DialogTitle, IconButton, TextField } from "@mui/material";
import Head from 'next/head';
import Link from "next/link";
import { useState } from "react";
import clientPromise from "../lib/mongodb";

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
  deletePost: any;
}

export default function Posts({ posts }: PostProps) {
  const [postsState, setPostsState] = useState<Post[]>(posts);
  const [imageUrl, setImageUrl] = useState('');
  const [postUrl, setPostUrl] = useState('');

  const saveComment = (e: any) => {
    if (postUrl === '' || imageUrl === '') {
      return;
    }
    const body = JSON.stringify({
      url: postUrl,
      photo: imageUrl,
      comments: []
    });
    try {
      fetch(`/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body
      }).then(res => res.json())
        .then(json => {
          setPostsState(json);
          setImageUrl('');
          setPostUrl('');
        });

    } catch (e) {
      console.error(e);
    }
  };
  const deletePost = (d: boolean, id: string) => {
    if (!d) {
      return;
    }
    try {
      fetch(`/api/posts/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(res => res.json())
        .then(json => {
          setPostsState(json);
        });

    } catch (e) {
      console.error(e);
    }
  };
  return (
    <div>
      <Head>
        <title>Post</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <form style={{ ...styles.form }}>
        <TextField size="small" required
          InputLabelProps={{
            shrink: true,
          }}
          value={imageUrl}
          onChange={(event: any) => setImageUrl(event.target.value)}
          id="standard-basic" label="Url da image" variant="standard" />
        <TextField size="small"
          InputLabelProps={{
            shrink: true,
          }}
          required
          value={postUrl}
          onChange={(event: any) => setPostUrl(event.target.value)}
          id="standard-basic" label="Url do pinterest" variant="standard" />
        <Button type="button" onClick={(e) => saveComment(e)} style={{ ...styles.button }} size="small" variant="contained">Adicionar novo post</Button>
      </form>

      <div style={styles.pin_container}>
        {postsState.map(({ _id, photo }) => {
          return (
            <Card deletePost={(d: boolean) => deletePost(d, _id)} size="small" key={_id} photo={photo} url={'/' + _id} />
          );
        })}
      </div>
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
      .sort({ "_id": -1 })
      .limit(120)
      .toArray();
    return {
      props: { posts: JSON.parse(JSON.stringify(posts)) },
    };
  } catch (e) {
    console.error(e);
  }
}

function Card({ size, url, photo, deletePost }: Card) {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (hasDelete = false) => {
    setOpen(false);
    deletePost(hasDelete);
  };

  return (
    <div style={{
      ...styles.card,
      ...styles[size]
    }}>
      <IconButton style={{ ...styles.buttonDelete }} onClick={handleClickOpen} aria-label="delete" size="small" color="error">
        <DeleteIcon fontSize="inherit" />
      </IconButton>
      <Link href={url}>
        <div>
          <img height="250px" width="250px" src={photo} />
        </div>
      </Link>
      <Dialog
        open={open}
        onClose={() => handleClose()}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Deseja realmente excluir? </DialogTitle>
        <DialogActions>
          <Button onClick={() => handleClose()} color="primary">
            Não
          </Button>
          <Button onClick={() => handleClose(true)} color="primary" autoFocus>
            Sim
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

const styles: any = {
  pin_container: {
    margin: '4em auto',
    padding: 0,
    width: '80vw',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, 250px)',
    gridAutoRows: '10px',
    justifyContent: 'center',
    columnGap: '10px'
  },
  card: {
    margin: '15px 10px',
    padding: 0,
    position: 'relative',
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
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: '10px',
    border: '1px solid gray',
    borderRadius: '10px',
    width: '50vw',
    marginTop: '2em',
    margin: '2em auto'
  },
  button: {
    marginTop: '1em',
  },
  buttonDelete: {
    position: 'absolute',
    top: '-26px',
    right: '-23px'
  }
};

