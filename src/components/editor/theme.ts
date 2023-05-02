import { InitialConfigType } from '@lexical/react/LexicalComposer';

type Theme = InitialConfigType['theme'];

export const theme: Theme = {
  ltr: 'ltr',
  rtl: 'rtl',
  placeholder: 'pl',
  paragraph: 'pa',
  quote: 'ml-4 border-l-2 border-zinc-400',
  heading: {
    h1: 'text-2xl font-bold mt-4',
    h2: 'text-xl font-bold mt-2',
    h3: 'text-lg font-semibold mt-1',
    h4: 'font-semibold',
    h5: 'font-semibold',
  },
  list: {
    nested: {
      listitem: 'editor-nested-listitem',
    },
    ol: 'list-decimal ml-10',
    ul: 'list-disc ml-10',
    listitem: 'editor-listitem',
  },
  image: 'editor-image',
  link: 'editor-link',
  text: {
    bold: 'font-semibold',
    italic: 'italic',
    // overflowed: 'text-ellipsis truncate',
    // hashtag: 'editor-text-hashtag',
    underline: 'underline',
    strikethrough: 'line-through',
    underlineStrikethrough: 'unerline line-through',
  },
  code: 'bg-zinc-100 p-2',
};
