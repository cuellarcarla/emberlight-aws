import { useState, useEffect } from "react";
import io from "socket.io-client";
import "./Community.css";

const socket = io("http://localhost:5000");

function Community() {    
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/posts")
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(err => console.error("Error fetching posts:", err));

    socket.on("new_post", (newPost) => {
      setPosts(prevPosts => [newPost, ...prevPosts]);
    });

    return () => {
      socket.off("new_post");
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch("http://localhost:5000/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content })
    });

    setTitle("");
    setContent("");
    //window.location.reload(); // Reload to fetch new posts
  };

  return (
    <div>
      <h1>Community Posts</h1>
      <form onSubmit={handleSubmit}>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required />
        <input value={content} onChange={e => setContent(e.target.value)} placeholder="Content" required />
        <button type="submit">Post</button>
      </form>
      <ul>
        {posts.map(post => (
          <li key={post.id}><strong>{post.title}</strong>: {post.content}</li>
        ))}
      </ul>
    </div>
  );
}

export default Community;
