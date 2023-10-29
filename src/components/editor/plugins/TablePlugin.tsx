import Tooltip from '@/components/feedback/Tooltip';
import {
  FloatingArrow,
  FloatingDelayGroup,
  FloatingPortal,
  arrow,
  autoUpdate,
  flip,
  offset,
  shift,
  size,
  useFloating,
} from '@floating-ui/react';
import { Transition } from '@headlessui/react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { TablePlugin as LexicalTablePlugin } from '@lexical/react/LexicalTablePlugin';
import {
  $deleteTableColumn__EXPERIMENTAL,
  $deleteTableRow__EXPERIMENTAL,
  $getElementGridForTableNode,
  $insertTableColumn__EXPERIMENTAL,
  $insertTableRow__EXPERIMENTAL,
  TableCellHeaderStates,
  TableNode,
} from '@lexical/table';
import { Grid } from '@lexical/table/LexicalTableSelection';
import { $getNearestNodeOfType, mergeRegister } from '@lexical/utils';
import {
  Icon,
  IconColumnInsertLeft,
  IconColumnInsertRight,
  IconColumnRemove,
  IconRowInsertBottom,
  IconRowInsertTop,
  IconRowRemove,
  IconTrash,
} from '@tabler/icons-react';
import { $getSelection, $isRangeSelection } from 'lexical';
import { useCallback, useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { getSelectedNode } from './utils';

const enum InsertDirection {
  BEFORE,
  AFTER,
}

const TablePlugin = () => {
  const [editor] = useLexicalComposerContext();
  const tableElementRef = useRef<HTMLElement | null>(null);
  const tableNodeRef = useRef<TableNode | null>(null);
  const arrowRef = useRef<SVGSVGElement | null>(null);
  const [_headerRow, setHeaderRow] = useState(false);
  const [_headerColumn, setHeaderColumn] = useState(false);

  const updateTableActions = useCallback(() => {
    const selection = $getSelection();

    if (!$isRangeSelection(selection)) return;

    const tableNode = $getNearestNodeOfType(
      getSelectedNode(selection),
      TableNode
    );

    if (!tableNode) {
      tableElementRef.current = null;
      return;
    }

    const tableElement = editor.getElementByKey(tableNode.getKey());

    if (!tableElement) return;

    tableElementRef.current = tableElement;
    tableNodeRef.current = tableNode;

    readHeaderStates();
  }, [editor]);

  const readHeaderStates = useCallback(() => {
    editor.update(() => {
      const grid = $getElementGridForTableNode(editor, tableNodeRef.current!);
      const firstCell = tableNodeRef.current?.getCellNodeFromCordsOrThrow(
        0,
        0,
        grid
      );

      const row =
        firstCell?.hasHeaderState(TableCellHeaderStates.BOTH) ??
        firstCell?.hasHeaderState(TableCellHeaderStates.ROW);

      const column =
        firstCell?.hasHeaderState(TableCellHeaderStates.BOTH) ??
        firstCell?.hasHeaderState(TableCellHeaderStates.COLUMN);

      setHeaderRow(row ?? false);
      setHeaderColumn(column ?? false);
    });
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) =>
        editorState.read(updateTableActions)
      )
    );
  }, [editor]);

  const { refs, context, floatingStyles } = useFloating({
    open: tableElementRef.current !== null,
    whileElementsMounted: autoUpdate,
    elements: {
      reference: tableElementRef.current,
    },
    placement: 'bottom',
    middleware: [
      offset(5),
      flip(),
      shift(),
      size(),
      arrow({ element: arrowRef }),
    ],
  });

  const updateTable = useCallback(
    (fn: (grid: Grid, table: TableNode) => void) => {
      editor.update(() => {
        const grid = $getElementGridForTableNode(editor, tableNodeRef.current!);
        const selection = $getSelection();

        if (!$isRangeSelection(selection) || selection === null) return;

        fn(grid, tableNodeRef.current!);

        readHeaderStates();
      });
    },
    [editor]
  );

  const insertRow = (direction: InsertDirection) => {
    updateTable(() => {
      $insertTableRow__EXPERIMENTAL(direction === InsertDirection.AFTER);
    });
  };

  const insertColumn = (direction: InsertDirection) => {
    updateTable(() => {
      $insertTableColumn__EXPERIMENTAL(direction === InsertDirection.AFTER);
    });
  };

  const removeRow = () => {
    updateTable((grid) => {
      if (grid.rows === 1) {
        removeTable();
        return;
      }

      $deleteTableRow__EXPERIMENTAL();
    });
  };

  const removeColumn = () => {
    updateTable((grid) => {
      if (grid.columns === 1) {
        removeTable();
        return;
      }

      $deleteTableColumn__EXPERIMENTAL();
    });
  };

  const removeTable = () => {
    updateTable((_grid, table) => {
      table.selectNext();
      table.remove();
    });
  };

  return (
    <>
      <LexicalTablePlugin hasCellMerge hasTabHandler hasCellBackgroundColor />

      {tableElementRef.current && (
        <FloatingPortal>
          <Transition
            appear
            show={true}
            enter='duration-100'
            enterFrom='opacity-0 -translate-y-1'
            enterTo='opacity-100 translate-y-0'
            leave='duration-75'
            leaveFrom='opacity-100 translate-y-0'
            leaveTo='opacity-0 -translate-y-1'
          >
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              className='relative flex flex-row items-center gap-1 rounded-lg border border-zinc-300 bg-gray-50 p-0.5 text-sm text-gray-950'
            >
              <FloatingArrow
                ref={arrowRef}
                context={context}
                className='fill-gray-700'
              />

              <FloatingDelayGroup delay={100}>
                {/* <ActionButton
                  icon={IconFreezeColumn}
                  tooltip='Tittelkolonne'
                  active={headerColumn}
                  onClick={() => console.log('y')}
                />

                <ActionButton
                  icon={IconFreezeRow}
                  tooltip='Tittelrad'
                  active={headerRow}
                  onClick={() => console.log('y')}
                />

                <VerticalDivider /> */}

                <ActionButton
                  icon={IconRowInsertTop}
                  tooltip='Sett inn rad over'
                  onClick={() => insertRow(InsertDirection.BEFORE)}
                />

                <ActionButton
                  icon={IconRowInsertBottom}
                  tooltip='Sett inn rad under'
                  onClick={() => insertRow(InsertDirection.AFTER)}
                />

                <ActionButton
                  severe
                  icon={IconRowRemove}
                  tooltip='Fjern rad'
                  onClick={removeRow}
                />

                <VerticalDivider />

                <ActionButton
                  icon={IconColumnInsertLeft}
                  tooltip='Sett inn kolonne til venstre'
                  onClick={() => insertColumn(InsertDirection.BEFORE)}
                />

                <ActionButton
                  icon={IconColumnInsertRight}
                  tooltip='Sett inn kolonne til høyre'
                  onClick={() => insertColumn(InsertDirection.AFTER)}
                />

                <ActionButton
                  severe
                  icon={IconColumnRemove}
                  tooltip='Fjern kolonne'
                  onClick={removeColumn}
                />

                <VerticalDivider />

                <ActionButton
                  severe
                  icon={IconTrash}
                  tooltip='Fjern tabell'
                  onClick={removeTable}
                />
              </FloatingDelayGroup>
            </div>
          </Transition>
        </FloatingPortal>
      )}
    </>
  );
};

interface ActionButtonProps {
  icon: Icon;
  tooltip: string;
  severe?: boolean;
  active?: boolean;
  onClick?: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon: Icon,
  tooltip,
  severe,
  active,
  onClick,
}) => {
  return (
    <Tooltip content={tooltip}>
      <button
        type='button'
        onClick={onClick}
        className={twMerge(
          'rounded-md border border-transparent p-px text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-700',
          active && 'border-zinc-400 bg-zinc-200 text-zinc-700',
          severe && 'hover:bg-error-100 hover:text-error-600'
        )}
      >
        <Icon className='h-6 w-6' />
        <span className='sr-only'>{tooltip}</span>
      </button>
    </Tooltip>
  );
};

const VerticalDivider = () => (
  <div className='h-6 w-0 border-l border-zinc-400' />
);

export default TablePlugin;
