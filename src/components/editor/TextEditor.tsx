import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { TRANSFORMERS } from '@lexical/markdown';
import {
  InitialConfigType,
  LexicalComposer,
} from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import {
  EditorState,
  SerializedEditorState,
  SerializedLexicalNode,
} from 'lexical';
import { useMemo } from 'react';
import Placeholder from './Placeholder';
import { ImageNode } from './nodes/ImageNode';
import ImagePastePlugin from './plugins/ImagePastePlugin';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import { theme } from './theme';

interface TextEditorProps {
  name: string;
  initialState?: SerializedEditorState<SerializedLexicalNode>;
  onEditorChange?: (editor: EditorState) => void;
}

const TextEditor: React.FC<TextEditorProps> = ({
  name,
  initialState,
  onEditorChange,
}) => {
  const initialConfig = useMemo<InitialConfigType>(
    () => ({
      namespace: name,
      editorState: (editor) =>
        initialState ? editor.parseEditorState(initialState) : undefined,
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
          <OnChangePlugin onChange={(editor) => onEditorChange?.(editor)} />
          <ImagePastePlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        </div>
      </div>
    </LexicalComposer>
  );
};

export default TextEditor;
