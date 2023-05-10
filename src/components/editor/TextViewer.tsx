import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import {
  InitialConfigType,
  LexicalComposer,
} from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { SerializedEditorState, SerializedLexicalNode } from 'lexical';
import { useMemo } from 'react';
import Placeholder from './Placeholder';
import { ImageNode } from './nodes/ImageNode';
import { theme } from './theme';

interface TextViewerProps {
  name: string;
  content: string | SerializedEditorState<SerializedLexicalNode>;
}

/**
 * A viewer for the text editor, this variant is not editable and 
 * is used for displaying the contents of rich text media.
 */
const TextViewer: React.FC<TextViewerProps> = ({ name, content }) => {
  const initialConfig = useMemo<InitialConfigType>(
    () => ({
      namespace: name,
      editorState: (editor) => {
        editor.setEditorState(editor.parseEditorState(content));
      },
      editable: false,
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
        ImageNode,
      ],
      theme,
    }),
    [name]
  );

  return (
    <LexicalComposer initialConfig={initialConfig}>
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
    </LexicalComposer>
  );
};

export default TextViewer;
