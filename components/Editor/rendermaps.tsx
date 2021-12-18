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

//sideBarItem 側欄工具列
const sideBarItem = [
    { label: 'title', type: 'header-two' },
    { label: 'text_fields', type: 'header-three' },
    { label: 'format_quote', type: 'blockquote' },
    { label: 'format_list_bulleted', type: 'unordered-list-item' },
    { label: 'format_list_numbered', type: 'ordered-list-item' },
    { label: 'image', media: 'imageURL' },
    //實驗性自訂元件區塊
    // { label: 'apps', media: 'cards' },
];

//反白工具列
const toolbarItems = [
    { label: 'format_bold', style: 'BOLD' },
    { label: 'format_italic', style: 'ITALIC' },
    { label: 'format_underlined', style: 'UNDERLINE' },
    { label: 'code', style: 'CODE' },
    { label: 'format_strikethrough', style: 'STRIKETHROUGH' },
    { label: 'insert_link', link: 'link' },
];

export { emptyContentState, inlineStyleMap, blockRenderMap, blockStyleFn, sideBarItem, toolbarItems };
