"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  ImageIcon,
  Link2Icon,
  PlayCircle,
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Editor({
  content,
  onChange,
}: {
  content: string;
  onChange: (html: string) => void;
}) {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showYouTubeDialog, setShowYouTubeDialog] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class: 'my-2',
          },
        },
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      Link.configure({
        openOnClick: false,
        linkOnPaste: true,
        autolink: true,
        defaultProtocol: "https",
        protocols: ["http", "https", "mailto", "tel"],
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer nofollow",
          class: "text-blue-500 underline",
        },
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none [&_video]:max-w-full [&_video]:h-auto [&_video]:rounded-lg',
      },
    },
  });

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const { url } = await res.json();
        editor?.chain().focus().setImage({ src: url }).run();
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleAddLink = () => {
    if (linkUrl.trim()) {
      const { from, to } = editor!.state.selection;
      const hasSelection = from !== to;
      
      if (hasSelection) {
        // If text is selected, make it a link
        editor
          ?.chain()
          .focus()
          .extendMarkRange("link")
          .setLink({ href: linkUrl, target: "_blank", rel: "noopener noreferrer" })
          .run();
      } else {
        // If no selection, insert link text
        editor
          ?.chain()
          .focus()
          .insertContent(`<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline">${linkUrl}</a> `)
          .run();
      }
      
      setLinkUrl("");
      setShowLinkDialog(false);
    }
  };

  const extractYoutubeId = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
    );
    return match?.[1] || null;
  };

  const handleAddYouTube = () => {
    const videoId = extractYoutubeId(youtubeUrl);
    if (videoId) {
      // Insert responsive YouTube iframe as HTML
      const iframeHtml = `<div class="youtube-embed" style="position: relative; width: 100%; padding-bottom: 56.25%; margin: 1rem 0;"><iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 0.5rem;" src="https://www.youtube.com/embed/${videoId}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
      
      editor?.commands.insertContent(iframeHtml);

      setYoutubeUrl("");
      setShowYouTubeDialog(false);
    } else {
      alert("Invalid YouTube URL");
    }
  };

  const handleAddVideo = () => {
    if (videoUrl.trim()) {
      // Check if it's a direct video file (mp4, webm, etc)
      const isDirectVideo = /\.(mp4|webm|ogg|mov)$/i.test(videoUrl);
      
      let videoHtml = '';
      if (isDirectVideo) {
        // Use HTML5 video tag for direct video files - inject raw HTML
        videoHtml = `<p></p><div class="video-embed"><video controls controlsList="nodownload" style="width: 100%; max-width: 100%; height: auto; border-radius: 0.5rem; margin: 1rem 0;" src="${videoUrl}"></video></div><p></p>`;
      } else {
        // Use iframe for embed URLs
        videoHtml = `<p></p><div class="video-embed" style="position: relative; width: 100%; padding-bottom: 56.25%; margin: 1rem 0;"><iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 0.5rem; border: none;" src="${videoUrl}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div><p></p>`;
      }
      
      // Insert as raw HTML
      editor?.commands.insertContent(videoHtml);

      setVideoUrl("");
      setShowVideoDialog(false);
    } else {
      alert("Please enter a valid video URL");
    }
  };

  return (
    <div className="border rounded-md p-4 flex flex-col gap-2">
      <div className="flex flex-wrap gap-2 pb-2 border-b">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={editor?.isActive("bold") ? "bg-accent" : ""}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={editor?.isActive("italic") ? "bg-accent" : ""}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={
            editor?.isActive("heading", { level: 1 }) ? "bg-accent" : ""
          }
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={
            editor?.isActive("heading", { level: 2 }) ? "bg-accent" : ""
          }
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={editor?.isActive("bulletList") ? "bg-accent" : ""}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className={editor?.isActive("orderedList") ? "bg-accent" : ""}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="w-px bg-border mx-1" />

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="h-4 w-4 mr-1" />
          Image
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleFileChange}
        />

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setShowLinkDialog(true)}
        >
          <Link2Icon className="h-4 w-4 mr-1" />
          Link
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setShowYouTubeDialog(true)}
        >
          <PlayCircle className="h-4 w-4 mr-1" />
          YouTube
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setShowVideoDialog(true)}
        >
          <PlayCircle className="h-4 w-4 mr-1" />
          Video
        </Button>
      </div>

      <EditorContent
        editor={editor}
        className="prose prose-sm dark:prose-invert max-w-none [&_.ProseMirror]:min-h-[400px] [&_.ProseMirror]:p-4 [&_.ProseMirror]:focus:outline-none"
      />

      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Link</DialogTitle>
            <DialogDescription>
              Enter the URL you want to link to (opens in new tab)
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddLink();
                  }
                }}
              />
            </div>
            <Button onClick={handleAddLink}>Add Link</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showYouTubeDialog} onOpenChange={setShowYouTubeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Embed YouTube Video</DialogTitle>
            <DialogDescription>
              Paste a YouTube video URL (youtube.com or youtu.be)
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="youtube-url">YouTube URL</Label>
              <Input
                id="youtube-url"
                placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddYouTube();
                  }
                }}
              />
            </div>
            <Button onClick={handleAddYouTube}>Embed Video</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Embed External Video</DialogTitle>
            <DialogDescription>
              Paste your video embed URL or iframe source (from CloudPanel, Vimeo, etc.)
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="video-url">Video URL</Label>
              <Input
                id="video-url"
                placeholder="https://your-server.com/video/embed/123"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddVideo();
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                Contoh: https://your-cloudpanel-server.com/videos/video.mp4 atau embed URL dari server Anda
              </p>
            </div>
            <Button onClick={handleAddVideo}>Embed Video</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
