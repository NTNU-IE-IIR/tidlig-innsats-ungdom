import Select from '@/components/input/Select';
import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  Bars3BottomLeftIcon,
  CheckIcon,
  CodeBracketIcon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';
import {
  $isListNode,
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
  REMOVE_LIST_COMMAND,
} from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createHeadingNode, $isHeadingNode } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import {
  $findMatchingParent,
  $getNearestNodeOfType,
  mergeRegister,
} from '@lexical/utils';
import clsx from 'clsx';
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  REDO_COMMAND,
  UNDO_COMMAND,
} from 'lexical';
import { useCallback, useEffect, useMemo, useState } from 'react';

const BLOCK_TYPE_NAME_MAP = {
  paragraph: 'Normal',
  bullet: 'Punktliste',
  number: 'Nummerert liste',
  check: 'Sjekkliste',
  quote: 'Sitat',
  h1: 'Overskrift 1',
  h2: 'Overskrift 2',
  h3: 'Overskrift 3',
  h4: 'Overskrift 4',
  h5: 'Overskrift 5',
  h6: 'Overskrift 6',
  code: 'Kodeblokk',
};

const BLOCK_TYPE_ICON_MAP: Record<BlockType, () => React.ReactNode> = {
  bullet: () => <ListBulletIcon className='h-5 w-5' />,
  check: () => <CheckIcon className='h-5 w-5' />,
  code: () => <CodeBracketIcon className='h-5 w-5' />,
  h1: () => <span className='text-sm'>H1</span>,
  h2: () => <span className='text-sm'>H2</span>,
  h3: () => <span className='text-sm'>H3</span>,
  h4: () => <span className='text-sm'>H4</span>,
  h5: () => <span className='text-sm'>H5</span>,
  h6: () => <span className='text-sm'>H6</span>,
  number: () => <span className='text-xs'>123</span>,
  paragraph: () => <Bars3BottomLeftIcon className='h-5 w-5' />,
  quote: () => <span className='text-lg'>&quot;</span>,
};

type BlockType = keyof typeof BLOCK_TYPE_NAME_MAP;

const ToolbarPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);

  const [blockType, setBlockType] = useState<BlockType>('paragraph');

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  /**
   * Updates the toolbar.
   * Currently detects which block type is active and updates the toolbar accordingly.
   */
  const updateToolbar = useCallback(() => {
    const selection = $getSelection();

    if (!$isRangeSelection(selection)) return;

    const anchorNode = selection.anchor.getNode();
    let element =
      anchorNode.getKey() === 'root'
        ? anchorNode
        : $findMatchingParent(anchorNode, (e) => {
            const parent = e.getParent();
            return parent !== null && $isRootOrShadowRoot(parent);
          });

    if (element === null) {
      element = anchorNode.getTopLevelElementOrThrow();
    }

    const elementKey = element.getKey();
    const elementDOM = activeEditor.getElementByKey(elementKey);

    if (elementDOM === null) return;

    if ($isListNode(element)) {
      const parentList = $getNearestNodeOfType(anchorNode, ListNode);
      const type = parentList
        ? parentList.getListType()
        : element.getListType();
      setBlockType(type);
    } else {
      const type = $isHeadingNode(element)
        ? element.getTag()
        : element.getType();
      if (type in BLOCK_TYPE_NAME_MAP) {
        setBlockType(type as keyof typeof BLOCK_TYPE_NAME_MAP);
      }
    }
  }, [activeEditor]);

  /**
   * Switch map for block types, used to switch between block types.
   */
  const BLOCK_TYPE_SWITCH_MAP: Record<
    BlockType,
    (selection: ReturnType<typeof $getSelection>) => void
  > = useMemo(
    () => ({
      bullet: (_selection) => {
        if (blockType !== 'bullet') {
          return activeEditor.dispatchCommand(
            INSERT_UNORDERED_LIST_COMMAND,
            undefined
          );
        }

        activeEditor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      },
      check: (_selection) => {
        if (blockType !== 'check') {
          return activeEditor.dispatchCommand(
            INSERT_CHECK_LIST_COMMAND,
            undefined
          );
        }

        activeEditor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      },
      code: (_selection) => {},
      h1: (selection) => {
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode('h1'));
        }
      },
      h2: (selection) => {
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode('h2'));
        }
      },
      h3: (selection) => {
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode('h3'));
        }
      },
      h4: (selection) => {
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode('h4'));
        }
      },
      h5: (selection) => {
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode('h5'));
        }
      },
      h6: (selection) => {
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode('h6'));
        }
      },
      number: (_selection) => {
        if (blockType !== 'number') {
          return activeEditor.dispatchCommand(
            INSERT_ORDERED_LIST_COMMAND,
            undefined
          );
        }

        activeEditor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      },
      paragraph: (selection) => {
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createParagraphNode());
        }
      },
      quote: (selection) => {
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createParagraphNode());
        }
      },
    }),
    []
  );

  /**
   * Whenever the block type changes, we update the editor and execute the given command for the block type.
   */
  useEffect(() => {
    activeEditor.update(() => {
      const selection = $getSelection();
      BLOCK_TYPE_SWITCH_MAP[blockType](selection);
    });
  }, [blockType]);

  useEffect(() => {
    mergeRegister(
      // whenever the state of the editor changes, we update the toolbar
      // this makes the toolbar UI reflect changes in the editor. (e.g. selection changed, formatting changed etc.)
      activeEditor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      // forward the editors state of CAN_UNDO to react state, allowing re-rendering of the toolbar
      activeEditor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return payload;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      // forward the editors state of CAN_REDO to react state, allowing re-rendering of the toolbar
      activeEditor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return payload;
        },
        COMMAND_PRIORITY_CRITICAL
      )
    );
  }, [activeEditor, editor]);

  return (
    <div className='flex gap-1 rounded-t-md border-b border-zinc-200 bg-zinc-100 p-1 shadow'>
      <ToolbarActionButton
        disabled={!canUndo}
        onClick={() => activeEditor.dispatchCommand(UNDO_COMMAND, undefined)}
        icon={ArrowUturnLeftIcon}
      />

      <ToolbarActionButton
        disabled={!canRedo}
        onClick={() => activeEditor.dispatchCommand(REDO_COMMAND, undefined)}
        icon={ArrowUturnRightIcon}
      />

      <Select
        value={blockType}
        options={[...(Object.keys(BLOCK_TYPE_NAME_MAP) as BlockType[])]}
        renderer={(option) => (
          <div className='flex items-center gap-1 whitespace-nowrap p-1'>
            <figure className='flex h-6 w-6 items-center justify-center font-medium'>
              {BLOCK_TYPE_ICON_MAP[option]()}
            </figure>

            <span className='pr-2 text-sm font-semibold'>
              {BLOCK_TYPE_NAME_MAP[option]}
            </span>
          </div>
        )}
        onChange={setBlockType}
      />
    </div>
  );
};

interface ToolbarActionButtonProps {
  disabled: boolean;
  onClick: () => void;
  icon: typeof ArrowUturnLeftIcon;
}

const ToolbarActionButton: React.FC<ToolbarActionButtonProps> = ({
  disabled,
  onClick,
  icon: Icon,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'rounded-md border border-zinc-300 p-1 transition-colors',
        disabled && 'text-zinc-500',
        !disabled && 'hover:border-zinc-400 hover:bg-zinc-200'
      )}
    >
      <Icon className='h-5 w-5' />
    </button>
  );
};

export default ToolbarPlugin;
