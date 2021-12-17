import { EditorState, getDefaultKeyBinding, Modifier, RichUtils } from 'draft-js';
import { KeyboardEvent } from 'react';
//按鍵綁定

export const keyBindingFn = (e: KeyboardEvent<{}>) => {
    if (e.keyCode === 13 && e.shiftKey) {
        return 'Shift_Enter';
    }
    if (e.keyCode === 13) {
        return 'Enter';
    }
    return getDefaultKeyBinding(e);
};

const keyCommand = ({ command, editorState, setEditorState }) => {
    if (command === 'Shift_Enter') {
        setEditorState(RichUtils.insertSoftNewline(editorState));
    }
    if (command === 'Enter') {
        const currentContent = editorState.getCurrentContent();
        const selection = editorState.getSelection();
        const textWithEntity = Modifier.splitBlock(currentContent, selection);
        setEditorState(EditorState.push(editorState, textWithEntity, 'split-block'));
    }
};
