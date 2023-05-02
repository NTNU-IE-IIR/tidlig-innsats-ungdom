import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { TRANSFORMERS } from '@lexical/markdown';
import {
  InitialConfigType,
  LexicalComposer,
} from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { useMemo } from 'react';
import { theme } from './theme';
import ToolbarPlugin from './plugins/ToolbarPlugin';

interface TextEditorProps {
  name: string;
}

const Placeholder: React.FC = () => {
  return (
    <div className='pointer-events-none absolute left-1 top-2'>
      Skriv innhold her...
    </div>
  );
};

const TextEditor: React.FC<TextEditorProps> = ({ name }) => {
  
  const initialConfig = useMemo<InitialConfigType>(
    () => ({
      namespace: name,
      onError: (err) => console.error(err),
      nodes: [
        HeadingNode,
        ListNode,
        ListItemNode,
        QuoteNode,
        CodeNode,
        CodeHighlightNode,
        TableNode,
        TableCellNode,
        TableRowNode,
        AutoLinkNode,
        LinkNode,
      ],
      theme,
    }),
    [name]
  );

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className='rounded-md border border-zinc-200'>
        <ToolbarPlugin />
        <div className='relative px-1 py-2'>
          <RichTextPlugin
            ErrorBoundary={LexicalErrorBoundary}
            contentEditable={
              <ContentEditable className='border-0 focus:outline-none' />
            }
            placeholder={<Placeholder />}
          />
          <ListPlugin />
          <LinkPlugin />
          <HistoryPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        </div>
      </div>
    </LexicalComposer>
  );
};

export default TextEditor;
