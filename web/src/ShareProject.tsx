import { useState } from "react";

const url = "https://ztrimus.github.io/journey-of-notes/practice/";
const caption = `I'm trying Journey of Notes by Saurabh Zinjad: a browser-based practice gym for musical skills, with pitch feedback and practice history. Try it and share what you think: ${url}`;

export function ShareProject() {
  const [message, setMessage] = useState("");
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setMessage(
        text === url
          ? "Project link copied."
          : "Post copied. Edit it in your own voice before sharing.",
      );
    } catch {
      setMessage(
        "Copy is unavailable in this browser. You can select the project link or suggested post below.",
      );
    }
  }
  async function share() {
    if (!navigator.share) return copy(url);
    try {
      await navigator.share({
        title: "Journey of Notes — Saurabh Zinjad",
        text: "A practice gym for musical skills, by Saurabh Zinjad.",
        url,
      });
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError"))
        setMessage(
          "Sharing is unavailable here. Copy the link or suggested post instead.",
        );
    }
  }
  return (
    <section aria-labelledby="share-title" className="share-project">
      <h2 id="share-title">Help the next musician find it</h2>
      <p>
        If this helps your riyaz, share it on X, LinkedIn, or in a YouTube
        video. Mention Journey of Notes and Saurabh Zinjad, and include the
        project link. Your feedback can help shape what comes next.
      </p>
      <div className="share-actions">
        <button onClick={share}>Share project</button>
        <button onClick={() => copy(caption)}>Copy a post</button>
      </div>
      <p role="status" className="small">
        {message}
      </p>
      <details className="explanation">
        <summary>Suggested post &amp; project link</summary>
        <p>{caption}</p>
        <a href={url}>Open Journey of Notes</a>
      </details>
    </section>
  );
}
