import Button from '@/components/input/Button';
import Select from '@/components/input/Select';
import TextField from '@/components/input/TextField';
import Dialog from '@/components/overlay/Dialog';
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
import {
  Icon,
  IconAbc,
  IconAlignCenter,
  IconAlignLeft,
  IconAlignRight,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconBlockquote,
  IconBold,
  IconCode,
  IconH1,
  IconH2,
  IconH3,
  IconH4,
  IconH5,
  IconH6,
  IconItalic,
  IconLink,
  IconLinkOff,
  IconList,
  IconListCheck,
  IconListNumbers,
  IconStrikethrough,
  IconUnderline,
  IconUpload,
} from '@tabler/icons-react';
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  GridSelection,
  NodeSelection,
  REDO_COMMAND,
  RangeSelection,
  UNDO_COMMAND,
} from 'lexical';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { INSERT_IMAGE_COMMAND, InsertImagePayload } from './ImagePastePlugin';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { getSelectedNode } from './utils';

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
  bullet: () => <IconList className='h-5 w-5' />,
  check: () => <IconListCheck className='h-5 w-5' />,
  code: () => <IconCode className='h-5 w-5' />,
  h1: () => <IconH1 className='h-5 w-5' />,
  h2: () => <IconH2 className='h-5 w-5' />,
  h3: () => <IconH3 className='h-5 w-5' />,
  h4: () => <IconH4 className='h-5 w-5' />,
  h5: () => <IconH5 className='h-5 w-5' />,
  h6: () => <IconH6 className='h-5 w-5' />,
  number: () => <IconListNumbers className='h-5 w-5' />,
  paragraph: () => <IconAbc className='h-5 w-5' />,
  quote: () => <IconBlockquote className='h-5 w-5' />,
};

const createHeadingNode = (
  selection: RangeSelection | NodeSelection | GridSelection | null,
  level: 1 | 2 | 3 | 4 | 5 | 6
) => {
  if ($isRangeSelection(selection)) {
    $setBlocksType(selection, () => $createHeadingNode(`h${level}`));
  }
};

type BlockType = keyof typeof BLOCK_TYPE_NAME_MAP;

export interface ToolbarPluginProps {
  onCanUndo?: (canUndo: boolean) => void;
}

const ToolbarPlugin: React.FC<ToolbarPluginProps> = ({ onCanUndo }) => {
  const [editor] = useLexicalComposerContext();

  const [blockType, setBlockType] = useState<BlockType>('paragraph');

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [textAlign, setTextAlign] = useState('left');

  const [showInsertImageDialog, setShowInsertImageDialog] = useState(false);

  /**
   * Updates the toolbar.
   * Currently detects which block type is active and updates the toolbar accordingly.
   */
  const updateToolbar = useCallback(() => {
    const selection = $getSelection();

    if (!$isRangeSelection(selection)) return;

    setIsBold(selection.hasFormat('bold'));
    setIsItalic(selection.hasFormat('italic'));
    setIsUnderline(selection.hasFormat('underline'));
    setIsStrikethrough(selection.hasFormat('strikethrough'));

    const node = getSelectedNode(selection);
    const parent = node.getParent();

    if ($isLinkNode(parent) || $isLinkNode(node)) {
      setIsLink(true);
    } else {
      setIsLink(false);
    }

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
    const elementDOM = editor.getElementByKey(elementKey);

    if (elementDOM === null) return;

    setTextAlign(elementDOM.style.textAlign);

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
  }, [editor]);

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, '');
      requestAnimationFrame(() => {
        document.getElementById('editor-link-input')?.focus();
      });
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  /**
   * Switch map for block types, used to switch between block types.
   */
  const BLOCK_TYPE_SWITCH_MAP = useMemo<
    Record<BlockType, (selection: ReturnType<typeof $getSelection>) => void>
  >(
    () => ({
      bullet: (_selection) => {
        if (blockType !== 'bullet') {
          return editor.dispatchCommand(
            INSERT_UNORDERED_LIST_COMMAND,
            undefined
          );
        }

        editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      },
      check: (_selection) => {
        if (blockType !== 'check') {
          return editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
        }

        editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      },
      code: (_selection) => {},
      h1: (selection) => createHeadingNode(selection, 1),
      h2: (selection) => createHeadingNode(selection, 2),
      h3: (selection) => createHeadingNode(selection, 3),
      h4: (selection) => createHeadingNode(selection, 4),
      h5: (selection) => createHeadingNode(selection, 5),
      h6: (selection) => createHeadingNode(selection, 6),
      number: (_selection) => {
        if (blockType !== 'number') {
          return editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
        }

        editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
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
    editor.update(() => {
      const selection = $getSelection();
      BLOCK_TYPE_SWITCH_MAP[blockType](selection);
    });
  }, [blockType]);

  useEffect(() => {
    mergeRegister(
      // whenever the state of the editor changes, we update the toolbar
      // this makes the toolbar UI reflect changes in the editor. (e.g. selection changed, formatting changed etc.)
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      // forward the editors state of CAN_UNDO to react state, allowing re-rendering of the toolbar
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          onCanUndo?.(payload);
          return payload;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      // forward the editors state of CAN_REDO to react state, allowing re-rendering of the toolbar
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return payload;
        },
        COMMAND_PRIORITY_CRITICAL
      )
    );
  }, [editor]);

  return (
    <div className='flex gap-1 rounded-t-md border-b border-zinc-200 bg-zinc-50 p-1 shadow'>
      <ToolbarActionButton
        disabled={!canUndo}
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        icon={IconArrowBackUp}
      />

      <ToolbarActionButton
        disabled={!canRedo}
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        icon={IconArrowForwardUp}
      />

      <VerticalRule />

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

      <VerticalRule />

      <ToolbarToggleButton
        active={isBold}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        icon={IconBold}
      />

      <ToolbarToggleButton
        active={isItalic}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        icon={IconItalic}
      />

      <ToolbarToggleButton
        active={isUnderline}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
        icon={IconUnderline}
      />

      <ToolbarToggleButton
        active={isStrikethrough}
        onClick={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
        }
        icon={IconStrikethrough}
      />

      <ToolbarToggleButton
        active={isLink}
        onClick={insertLink}
        icon={IconLink}
      />

      <ToolbarActionButton
        disabled={!isLink}
        onClick={() => editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)}
        icon={IconLinkOff}
      />

      <VerticalRule />

      <ToolbarToggleButton
        active={textAlign === 'left'}
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')}
        icon={IconAlignLeft}
      />

      <ToolbarToggleButton
        active={textAlign === 'center'}
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')}
        icon={IconAlignCenter}
      />

      <ToolbarToggleButton
        active={textAlign === 'right'}
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')}
        icon={IconAlignRight}
      />

      <VerticalRule />

      <ToolbarActionButton
        disabled={false}
        icon={IconUpload}
        onClick={() => setShowInsertImageDialog(true)}
        text='Sett inn bilde'
      />

      <Dialog
        open={showInsertImageDialog}
        onClose={() => setShowInsertImageDialog(false)}
      >
        <InsertImageDialog
          onClose={() => setShowInsertImageDialog(false)}
          onInsert={(payload) =>
            editor.dispatchCommand(INSERT_IMAGE_COMMAND, payload)
          }
        />
      </Dialog>
    </div>
  );
};

interface ToolbarActionButtonProps {
  disabled: boolean;
  onClick: () => void;
  icon: Icon;
  text?: string;
}

const ToolbarActionButton: React.FC<ToolbarActionButtonProps> = ({
  disabled,
  onClick,
  icon: Icon,
  text,
}) => {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      className={twMerge(
        'flex items-center gap-1 rounded-md border border-zinc-300 p-1 transition-colors',
        disabled && 'text-zinc-500',
        !disabled && 'hover:border-zinc-400 hover:bg-zinc-200'
      )}
    >
      <Icon className='h-5 w-5' />
      {text && <span className='pr-0.5 text-sm font-medium'>{text}</span>}
    </button>
  );
};

interface ToolbarToggleButtonProps {
  active: boolean;
  onClick: () => void;
  icon: Icon;
}

const ToolbarToggleButton: React.FC<ToolbarToggleButtonProps> = ({
  active,
  onClick,
  icon: Icon,
}) => {
  return (
    <button
      type='button'
      onClick={onClick}
      className={twMerge(
        'rounded-md border border-zinc-300 p-1 transition-colors',
        active && 'border-zinc-400 bg-zinc-200'
      )}
    >
      <Icon className='h-5 w-5' />
    </button>
  );
};

const VerticalRule: React.FC = () => (
  <div className='mx-1 border-r border-zinc-300' />
);

interface InsertImageDialogProps {
  onInsert: (payload: InsertImagePayload) => void;
  onClose: () => void;
}

const InsertImageDialog: React.FC<InsertImageDialogProps> = ({
  onInsert,
  onClose,
}) => {
  const [src, setSrc] = useState('');
  const [altText, setAltText] = useState('');

  const loadImage = (files: FileList | null) => {
    const reader = new FileReader();

    reader.onload = function () {
      if (typeof reader.result === 'string') {
        setSrc(reader.result);
      }
    };

    if (files !== null) {
      reader.readAsDataURL(files.item(0)!);
    }
  };

  const handleInsert = () => {
    if (src === '') return;

    onInsert({
      src,
      altText,
    });

    onClose();
  };

  return (
    <div className='flex flex-col gap-2 p-4'>
      <h2 className='text-lg font-bold'>Sett inn bilde</h2>

      <div className='flex flex-col gap-2'>
        {src !== '' && <img src={src} alt={altText} className='rounded-md' />}

        {src === '' && (
          <label
            htmlFor='fileupload'
            className='flex flex-col items-center justify-center rounded-md border-2 border-dashed border-zinc-300 py-4 text-zinc-600'
          >
            <IconUpload className='h-12 w-12' />
            <span className='text-sm font-medium'>Last opp bilde</span>
          </label>
        )}

        <input
          type='file'
          id='fileupload'
          accept='image/*'
          className='hidden'
          onChange={(e) => loadImage(e.target.files)}
        />

        <TextField
          label='Alternativ tekst'
          className='mt-1'
          value={altText}
          onChange={setAltText}
        />

        <div className='flex items-center justify-end gap-2'>
          <Button onClick={onClose} variant='neutral' className='text-sm'>
            Avbryt
          </Button>
          <Button onClick={handleInsert} className='text-sm'>
            Sett inn
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ToolbarPlugin;
