import { convertFromRaw } from 'draft-js';
import Immutable from 'immutable';
//init Data
const emptyContentState = convertFromRaw({
    entityMap: {},
    blocks: [
        {
            text: '',
            key: 'content',
            type: 'unstyled',
            entityRanges: [],
            depth: 0,
            inlineStyleRanges: [],
        },
    ],
});
const emptyTitleState = convertFromRaw({
    entityMap: {},
    blocks: [
        {
            text: '',
            key: 'title',
            type: 'header-one',
            entityRanges: [],
            depth: 0,
            inlineStyleRanges: [],
        },
    ],
});
//custom inline styleMap
const inlineStyleMap = {
    STRIKETHROUGH: {
        textDecoration: 'line-through',
    },
};
//block 組成類型
const blockRenderMap = Immutable.Map({
    section: {
        element: 'section',
    },
    cards: {
        element: 'div',
    },
    'header-two': {
        element: 'h2',
    },
    'header-one': {
        element: 'h1',
    },
    unstyled: {
        element: 'div',
        aliasedElements: ['p'],
    },
    'header-three': {
        element: 'h3',
    },
    blockquote: { element: 'blockquote' },
    'unordered-list-item': { element: 'li', wrapper: <ul /> },
    'ordered-list-item': { element: 'li', wrapper: <ol /> },
});

//block 客制style
const blockStyleFn = (contentBlock) => {
    const type = contentBlock.getType();
    if (type === 'header-one') {
        return 'text-4xl font-bold ';
    }
    if (type === 'unstyled') {
        return 'pb-5 text-xl ';
    }
    if (type === 'header-three') {
        return 'pb-5 text-2xl';
    }
    if (type === 'header-two') {
        return 'pb-5 text-3xl';
    }
    if (type === 'blockquote') {
        return 'p-5 italic border-l-4 bg-neutral-100 text-neutral-600 border-neutral-500 quote text-2xl ';
    }
};

export { emptyContentState, emptyTitleState, inlineStyleMap, blockRenderMap, blockStyleFn };
