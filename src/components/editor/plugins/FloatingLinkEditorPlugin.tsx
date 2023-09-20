import Tooltip from '@/components/feedback/Tooltip';
import { FloatingArrow, arrow, offset, useFloating } from '@floating-ui/react';
import {
  $isAutoLinkNode,
  $isLinkNode,
  TOGGLE_LINK_COMMAND,
} from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $findMatchingParent, mergeRegister } from '@lexical/utils';
import { IconExternalLink } from '@tabler/icons-react';
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  KEY_ESCAPE_COMMAND,
  LexicalEditor,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import { Dispatch, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { twMerge } from 'tailwind-merge';
import { getSelectedNode } from './utils';

function FloatingLinkEditor({
  editor,
  isLink,
  setIsLink,
  anchorElem,
}: {
  editor: LexicalEditor;
  isLink: boolean;
  setIsLink: Dispatch<boolean>;
  anchorElem: HTMLElement;
}): JSX.Element {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const arrowRef = useRef<SVGSVGElement | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTarget, setLinkTarget] = useState<string | null>(null);

  const { refs, floatingStyles, update, context } = useFloating({
    open: isLink,
    middleware: [offset(10), arrow({ element: arrowRef })],
  });

  const updateLinkEditor = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent)) {
        setLinkUrl(parent.getURL());
        setLinkTarget(parent.getTarget());
        refs.setReference(editor.getElementByKey(parent.getKey()));
      } else if ($isLinkNode(node)) {
        setLinkUrl(node.getURL());
        setLinkTarget(node.getTarget());
        refs.setReference(editor.getElementByKey(node.getKey()));
      } else {
        setLinkUrl('');
      }
    }

    update();

    const editorElem = editorRef.current;
    const activeElement = document.activeElement;

    if (editorElem === null) {
      return;
    }

    if (!activeElement || activeElement.className !== 'link-input') {
      setLinkUrl('');
    }

    return true;
  }, [anchorElem, editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateLinkEditor();
        });
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateLinkEditor();
          return true;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        () => {
          if (isLink) {
            setIsLink(false);
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH
      )
    );
  }, [editor, updateLinkEditor, setIsLink, isLink]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      updateLinkEditor();
    });
  }, [editor, updateLinkEditor]);

  const commitLink = (target: string | null) => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, {
      url: linkUrl,
      target: target,
    });
  };

  return (
    <div
      ref={refs.setFloating}
      style={floatingStyles}
      className={twMerge(
        'absolute left-0 top-0 flex w-64 flex-col rounded-md border border-black/20 bg-white shadow transition-opacity',
        isLink ? 'visible' : 'invisible'
      )}
    >
      {isLink && (
        <>
          <FloatingArrow
            ref={arrowRef}
            context={context}
            className='fill-zinc-500'
          />
          <div className='relative m-1 mt-4 flex flex-1 rounded-md border border-zinc-300'>
            <label
              htmlFor='editor-link-input'
              className='absolute top-0 -translate-y-full text-xs'
            >
              Lenke til
            </label>

            <input
              ref={inputRef}
              id='editor-link-input'
              className='flex-1 bg-transparent px-1 text-sm focus:outline-none py-0 border-0 focus:ring-0'
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
              placeholder='https://'
              onBlur={() => commitLink(linkTarget)}
            />

            <Tooltip content='Åpne lenken i ny fane'>
              <a
                href={linkUrl}
                target='_blank'
                className='flex items-center rounded-r-md border-l border-zinc-300 bg-zinc-50 p-0.5 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-800'
              >
                <IconExternalLink className='h-5 w-5' />
              </a>
            </Tooltip>
          </div>

          <label className='flex items-center gap-1 px-1 pb-1'>
            <input
              type='checkbox'
              checked={linkTarget === '_blank'}
              onChange={(event) => {
                const newTarget = event.target.checked ? '_blank' : null;
                setLinkTarget(newTarget);
                commitLink(newTarget);
              }}
              className='-mt-0.5 rounded-md border border-zinc-300 bg-zinc-100 text-emerald-600 focus:ring-emerald-600'
            />

            <span className='text-sm'>Åpne i lenken ny fane</span>
          </label>
        </>
      )}
    </div>
  );
}

function useFloatingLinkEditorToolbar(
  editor: LexicalEditor,
  anchorElem: HTMLElement
): JSX.Element | null {
  const [activeEditor, setActiveEditor] = useState(editor);
  const [isLink, setIsLink] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const linkParent = $findMatchingParent(node, $isLinkNode);
      const autoLinkParent = $findMatchingParent(node, $isAutoLinkNode);

      // We don't want this menu to open for auto links.
      if (linkParent != null && autoLinkParent == null) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, newEditor) => {
          updateToolbar();
          setActiveEditor(newEditor);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      )
    );
  }, [editor, updateToolbar]);

  return createPortal(
    <FloatingLinkEditor
      editor={activeEditor}
      isLink={isLink}
      anchorElem={anchorElem}
      setIsLink={setIsLink}
    />,
    anchorElem
  );
}

export default function FloatingLinkEditorPlugin({
  anchorElem = document.body,
}: {
  anchorElem?: HTMLElement;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  return useFloatingLinkEditorToolbar(editor, anchorElem);
}
