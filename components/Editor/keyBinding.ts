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
