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
import { useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import Placeholder from './Placeholder';
import { ImageNode } from './nodes/ImageNode';
import AutoLinkPlugin from './plugins/AutoLinkPlugin';
import FloatingLinkEditorPlugin from './plugins/FloatingLinkEditorPlugin';
import ImagePastePlugin from './plugins/ImagePastePlugin';
import TablePlugin from './plugins/TablePlugin';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import { theme } from './theme';

interface TextEditorProps {
  name: string;
  className?: string;
  initialState?: SerializedEditorState<SerializedLexicalNode>;
  onEditorChange?: (editor: EditorState) => void;
  onCanUndo?: (canUndo: boolean) => void;
}

const TextEditor: React.FC<TextEditorProps> = ({
  name,
  className,
  initialState,
  onEditorChange,
  onCanUndo,
}) => {
  const [floatingAnchorElement, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);

  const initialConfig = useMemo<InitialConfigType>(
    () => ({
      namespace: name,
      editorState: (editor) => {
        if (initialState) {
          editor.setEditorState(editor.parseEditorState(initialState));
        }
      },
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
    [name, initialState]
  );

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div
        className={twMerge(
          'flex flex-col rounded-md border border-gray-200',
          className
        )}
      >
        <ToolbarPlugin onCanUndo={onCanUndo} />
        <div className='relative flex-1 px-1 py-2'>
          <RichTextPlugin
            ErrorBoundary={LexicalErrorBoundary}
            contentEditable={
              <div className='h-full w-full'>
                <div
                  className='h-full w-full'
                  ref={(r) => setFloatingAnchorElem(r)}
                >
                  <ContentEditable className='h-full w-full border-0 focus:outline-none' />
                </div>
              </div>
            }
            placeholder={<Placeholder />}
          />
          <ListPlugin />
          <LinkPlugin />
          <AutoLinkPlugin />
          <HistoryPlugin />
          <OnChangePlugin onChange={(editor) => onEditorChange?.(editor)} />
          <ImagePastePlugin />
          {floatingAnchorElement && (
            <FloatingLinkEditorPlugin anchorElem={floatingAnchorElement} />
          )}
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          <TablePlugin />
        </div>
      </div>
    </LexicalComposer>
  );
};

export default TextEditor;
