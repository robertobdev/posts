import styled from '@emotion/styled';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button, IconButton, TextField, Tooltip, tooltipClasses, TooltipProps, Typography } from '@mui/material';
import { ObjectID } from 'bson';
import { ObjectId } from "mongodb";
import React, { useRef, useState } from 'react';
import { Comment, Coordinate, Post } from ".";
import clientPromise from "../lib/mongodb";
interface PostProps {
  post: Post;
}

export default function Movies({ post }: PostProps) {
  const [coordenate, setCoordenate] = useState<Coordinate>({ x: 0, y: 0 });
  const [showInput, setShowInput] = useState(false);
  const [inputComment, setInputComment] = useState('');
  const divEl = useRef(null);
  const [comments, setComments] = useState<Comment[]>(post.comments);

  function _onMouseMove(e: any) {
    setCoordenate({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
  }

  function click() {
    const el: any = divEl.current;
    if (el) {
      el.style.position = "absolute";
      el.style.left = coordenate.x + "px";
      el.style.top = coordenate.y + "px";
      setShowInput(true);
    }
  }

  const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(() => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: '#f5f5f9',
      color: 'rgba(0, 0, 0, 0.87)',
      maxWidth: 220,
      fontSize: 12,
      border: '1px solid #dadde9',
    },
  }));
  function removeComment(comment: Comment) {
    const currentComments = comments.filter((commentItem: any) =>
      commentItem._id !== comment._id
    );
    addCommentOnDb(comment, true);
    setComments(currentComments);
  };
  function createNewMark(commentItem: Comment) {
    const { _id, coordinate, comment } = commentItem;
    const style: any = {
      position: 'absolute',
      left: coordinate.x,
      top: coordinate.y,
    };
    return (
      <HtmlTooltip key={_id}
        title={
          <React.Fragment>
            <Typography color="inherit">{comment}</Typography>
            <IconButton onClick={() => removeComment(commentItem)} aria-label="delete" size="small" color="error">
              <DeleteIcon fontSize="inherit" />
            </IconButton>
          </React.Fragment>
        }
      >
        <div style={{ ...style }}>
          <img width={30} height={30} src="/marker.svg" />
        </div>
      </HtmlTooltip>
    );
  }
  const saveComment = () => {
    const newComments: Comment = {
      _id: new ObjectID().toString(),
      comment: inputComment,
      coordinate: {
        x: coordenate.x,
        y: coordenate.y
      }
    };
    addCommentOnDb(newComments);
    setComments([...comments, newComments]);
    setInputComment('');
    setShowInput(false);
    return;
  };
  async function addCommentOnDb(comment: Comment, remove = false) {
    const bodyComment = { ...comment, remove };
    try {
      fetch(`/api/posts/${post._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyComment)
      });
    } catch (e) {
      console.error(e);
    }
  }
  return (
    <div style={{ ...styles.container }}>
      <div style={{ ...styles.content }}>
        <img style={{ ...styles.photo }} onClick={() => click()} onMouseMove={(e) => _onMouseMove(e)} src={post.photo.replace('236x', '564x')} />

        {comments.map((comment) => {
          return createNewMark(comment);
        })}

        <div ref={divEl}>
          {showInput ?
            <form onSubmit={() => saveComment()} style={{ ...styles.form }}>
              <TextField size="small"
                InputLabelProps={{
                  shrink: true,
                }}
                value={inputComment}
                onChange={(event: any) => setInputComment(event.target.value)}
                id="standard-basic" label="Comentário" variant="standard" />
              <Button type="submit" style={{ ...styles.button }} size="small" variant="contained">Adicionar</Button>
            </form> : <></>
          }
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps({ params }: any) {
  try {
    const client = await clientPromise;
    const db = client.db("posts");
    const { slug } = params;

    if (!slug) {
      return {
        props: { post: {} },
      };
    }
    const post = await db
      .collection("posts")
      .findOne({ _id: new ObjectId(slug as string) });

    return {
      props: { post: JSON.parse(JSON.stringify(post)) },
    };
  } catch (e) {
    console.error(e);
  }
}

const styles: any = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '6em'
  },
  content: {
    position: 'relative',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: '10px',
    border: '1px solid gray',
    borderRadius: '10px',
  },
  button: {
    marginTop: '0.5em'
  },
  photo: {
    maxHeight: '700px'
  }
};