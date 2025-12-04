import { Node, mergeAttributes } from '@tiptap/core';

export const VideoNode = Node.create({
  name: 'video',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      controls: {
        default: true,
      },
      style: {
        default: 'width: 100%; max-width: 100%; height: auto; border-radius: 0.5rem; margin: 1rem 0;',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'video',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['video', mergeAttributes(HTMLAttributes, {
      controls: 'controls',
      controlsList: 'nodownload',
    })];
  },

  addCommands() {
    return {
      setVideo: (options: { src: string }) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        });
      },
    };
  },
});

export const IframeNode = Node.create({
  name: 'iframe',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      frameborder: {
        default: 0,
      },
      allow: {
        default: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
      },
      allowfullscreen: {
        default: true,
      },
      style: {
        default: 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 0.5rem; border: none;',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'iframe',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { class: 'video-embed', style: 'position: relative; width: 100%; padding-bottom: 56.25%; margin: 1rem 0;' }, 
      ['iframe', mergeAttributes(HTMLAttributes)]
    ];
  },

  addCommands() {
    return {
      setIframe: (options: { src: string }) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        });
      },
    };
  },
});
