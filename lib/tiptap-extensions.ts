import { Node } from '@tiptap/core';

// Custom HTML block that preserves raw HTML including video tags
export const RawHTML = Node.create({
  name: 'rawHTML',
  
  group: 'block',
  
  content: 'inline*',
  
  parseHTML() {
    return [
      {
        tag: 'div[data-raw-html]',
      },
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-raw-html': '', ...HTMLAttributes }, 0];
  },

  addCommands() {
    return {
      insertRawHTML: (html: string) => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            content: [{ type: 'text', text: html }],
          })
          .run();
      },
    };
  },
});
