import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { DRAG_DROP_PASTE } from '@lexical/rich-text';
import {
  $wrapNodeInElement,
  isMimeType,
  mediaFileReader,
  mergeRegister,
} from '@lexical/utils';
import {
  $createParagraphNode,
  $insertNodes,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_LOW,
  LexicalEditor,
  createCommand,
} from 'lexical';
import { useEffect } from 'react';
import { $createImageNode, ImagePayload } from '../nodes/ImageNode';

export type InsertImagePayload = Readonly<ImagePayload>;

export interface ImagePastePluginProps {
  onPaste: (e: ClipboardEvent, editor: LexicalEditor) => boolean;
}

export const INSERT_IMAGE_COMMAND = createCommand<InsertImagePayload>(
  'INSERT_IMAGE_COMMAND'
);
export const UPDATE_IMAGE_COMMAND = createCommand('UPDATE_IMAGE_COMMAND');
export const ATTACH_IMAGE_COMMAND = createCommand<DataTransfer>(
  'ATTACH_IMAGE_COMMAND'
);

const ACCEPTABLE_IMAGE_TYPES = [
  'image/',
  'image/heic',
  'image/heif',
  'image/gif',
  'image/webp',
];

const ImagePastePlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    mergeRegister(
      /**
       * This command is called whenever the user drags/drops or pastes something in the editor.
       * We check if the data is an image, and if so, we insert it into the editor.
       */
      editor.registerCommand(
        DRAG_DROP_PASTE,
        (files) => {
          (async () => {
            const filesResult = await mediaFileReader(
              files,
              [ACCEPTABLE_IMAGE_TYPES].flatMap((x) => x)
            );
            for (const { file, result } of filesResult) {
              if (isMimeType(file, ACCEPTABLE_IMAGE_TYPES)) {
                editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                  altText: file.name,
                  src: result,
                });
              }
            }
          })();
          return true;
        },
        COMMAND_PRIORITY_LOW
      ),

      editor.registerCommand(
        INSERT_IMAGE_COMMAND,
        (payload: InsertImagePayload) => {
          // TODO: Upload the image source from the payload to S3
          const imageNode = $createImageNode(payload);

          $insertNodes([imageNode]);
          $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd();

          return true;
        },
        COMMAND_PRIORITY_EDITOR
      )
    );
  }, [editor]);

  // we don't provide any UI for this plugin, so we just return null
  return null;
};

export default ImagePastePlugin;
