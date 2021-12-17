import {
    Editor,
    EditorState,
    RichUtils,
    AtomicBlockUtils,
    Modifier,
    CompositeDecorator,
    EditorBlock,
    genKey,
    ContentBlock,
    convertToRaw,
    SelectionState,
} from 'draft-js';
import { useEffect, useState, useRef } from 'react';
import Immutable from 'immutable';
import { keyBindingFn } from './keyBinding';
import { emptyContentState, inlineStyleMap, blockRenderMap, blockStyleFn } from './rendermaps';
import HyperLink from './HyperLink/service';
//draft.css needs
import 'draft-js/dist/Draft.css';

const DraftEditor = () => {
    const [editorState, setEditorState] = useState(EditorState.createWithContent(emptyContentState, HyperLink.decorator));
    const [editor, seteditor] = useState(false);
    const [showToolbar, setShowToolbar] = useState(false);
    const [showAddImg, setShowAddImg] = useState(false);
    const [windowWidth, setWindowWidth] = useState(0);
    const [selectionCoordinates, setSelectionCoordinates] = useState({ x: 0, y: 0 });
    const [selectionMeasures, setSelectionMeasures] = useState({ w: 0, h: 0 });
    const [toolbarMeasures, setToolbarMeasures] = useState({ w: 0, h: 0 });
    const [toolbarCoordinates, setToolbarCoordinates] = useState({ x: 0, y: 0 });
    const [scrollY, setScrollY] = useState(0);
    const edit = useRef(null);
    const toolbarRef = useRef(null);

    //toolbar
    function focusEditor() {
        checkSelectedText();
    }
    const checkSelectedText = () => {
        if (typeof window !== 'undefined') {
            const text = window.getSelection().toString();
            if (text !== '') {
                let r = window.getSelection().getRangeAt(0).getBoundingClientRect();
                let parent = document.body.parentNode as HTMLElement;
                let relative = parent.getBoundingClientRect();
                setWindowWidth(relative.width);
                setSelectionCoordinates(r);
                setSelectionMeasures({
                    w: r.width,
                    h: r.height,
                });
                setShowToolbar(true);
            } else {
                setShowToolbar(false);
            }
        }
    };
    //偵測滾動距離修正absolute位置
    useEffect(() => {
        const scrollHeight = () => {
            setScrollY(document.documentElement.scrollTop);
        };
        window.addEventListener('scroll', scrollHeight);
        return () => {
            window.removeEventListener('scroll', scrollHeight);
        };
    }, []);

    // if toolbar show , setToolbarMeasures
    useEffect(() => {
        setToolbarMeasures({ w: toolbarRef.current.clientWidth, h: toolbarRef.current.clientHeight });
    }, [showToolbar]);

    //if toolbarMeasure => set coodinates
    useEffect(() => {
        let coordinates: { x: number; y: number };

        const hiddenTop = selectionCoordinates.y < toolbarMeasures.h;
        const hiddenRight = windowWidth - selectionCoordinates.x < toolbarMeasures.w / 2;
        const hiddenLeft = selectionCoordinates.x < toolbarMeasures.w / 2;
        const normalX = selectionCoordinates.x - toolbarMeasures.w / 2 + selectionMeasures.w / 2;
        const normalY = selectionCoordinates.y - toolbarMeasures.h * 1.2 + scrollY;
        const invertedY = selectionCoordinates.y + selectionMeasures.h;
        const moveXToLeft = windowWidth - toolbarMeasures.w;
        const moveXToRight = 0;
        coordinates = {
            x: normalX,
            y: normalY,
        };

        if (hiddenTop) {
            coordinates.y = invertedY;
        }

        if (hiddenRight) {
            coordinates.x = moveXToLeft;
        }

        if (hiddenLeft) {
            coordinates.x = moveXToRight;
        }

        setToolbarCoordinates(coordinates);
    }, [toolbarMeasures]);
    //Toolbar 反白工具列
    const ToolbarButton = (props) => {
        const toggleToolbar = (e) => {
            e.preventDefault();
            props.item.style ? setEditorState(RichUtils.toggleInlineStyle(editorState, props.item.style)) : handleLink();
        };
        const buttonStyle = {
            padding: 5,
            color: props.active ? '#62F5C1' : 'white',
        };
        const handleDisable = () => {
            if (props.type === 'header-two') {
                return true;
            }
            if (props.type === 'header-three') {
                if (props.item.link) {
                    return false;
                }
                return true;
            }
            if (props.type === 'blockquote') {
                if (props.item.style === 'CODE' || props.item.style === 'ITALIC') {
                    return true;
                }
                return false;
            }
            return false;
        };
        return (
            <button className='material-icons cursor-pointer disabled:opacity-40 ' onMouseDown={toggleToolbar} style={buttonStyle} disabled={handleDisable()}>
                {props.item.label}
            </button>
        );
    };
    const ToolBar = () => {
        const toolbarItems = [
            { label: 'format_bold', style: 'BOLD' },
            { label: 'format_italic', style: 'ITALIC' },
            { label: 'format_underlined', style: 'UNDERLINE' },
            { label: 'code', style: 'CODE' },
            { label: 'format_strikethrough', style: 'STRIKETHROUGH' },
            { label: 'insert_link', link: 'link' },
        ];

        let currentStyle = editorState.getCurrentInlineStyle();
        let currentBlockType = RichUtils.getCurrentBlockType(editorState);
        let containsLink = RichUtils.currentBlockContainsLink(editorState); //檢測超連結

        return (
            <div>
                {toolbarItems.map((toolbarItem) => (
                    <ToolbarButton
                        key={toolbarItem.label}
                        active={currentStyle.has(toolbarItem.style) || (toolbarItem.link && containsLink)}
                        item={toolbarItem}
                        type={currentBlockType}
                    />
                ))}
            </div>
        );
    };
    const toolbarStyle = {
        display: showToolbar ? 'block' : 'none',
        color: 'white',
        position: 'absolute',
        left: toolbarCoordinates.x,
        top: toolbarCoordinates.y,
        zIndex: 20,
        padding: 2,
    } as React.CSSProperties;

    function reSetStyles() {
        const selectionState = editorState.getSelection();
        const anchorKey = selectionState.getAnchorKey();
        const currentContent = editorState.getCurrentContent();
        const currentBlock = currentContent.getBlockForKey(anchorKey);
        const start = selectionState.getStartOffset();
        const end = selectionState.getEndOffset();
        // Selected Text
        const selectedText = currentBlock.getText().slice(start, end);

        console.log(selectionState);
        const contentWithoutStyles = Modifier.replaceText(editorState.getCurrentContent(), selectionState, selectedText, null);

        const newstate = EditorState.push(editorState, contentWithoutStyles, 'change-inline-style');

        setEditorState(newstate);
    }
    //side toolbar 側邊工具列
    const SideToolbarBtn = ({ active, sideBarItem }) => {
        const btnToggle = (e) => {
            e.preventDefault();
            if (sideBarItem.media === 'imageURL') {
                setShowAddImg(true);
            } else if (sideBarItem.media === 'cards') {
                addCard();
            } else if (sideBarItem.type.match('header')) {
                reSetStyles();
                const newState = RichUtils.toggleBlockType(editorState, sideBarItem.type);

                // setEditorState(newEditorState);
            } else {
                setEditorState(RichUtils.toggleBlockType(editorState, sideBarItem.type));
            }
        };
        const buttonStyle = {
            color: active ? '#62F5C1' : 'white',
        };
        return (
            <span className='material-icons cursor-pointer p-2 ' onMouseDown={btnToggle} style={buttonStyle}>
                {sideBarItem.label}
            </span>
        );
    };
    const SideToolBar = () => {
        const sideBarItem = [
            { label: 'title', type: 'header-two' },
            { label: 'text_fields', type: 'header-three' },
            { label: 'format_quote', type: 'blockquote' },
            { label: 'format_list_bulleted', type: 'unordered-list-item' },
            { label: 'format_list_numbered', type: 'ordered-list-item' },
            { label: 'image', media: 'imageURL' },
            // { label: 'apps', media: 'cards' },
        ];

        let currentBlockType = RichUtils.getCurrentBlockType(editorState);
        return (
            <div className='bg-gray-800 fixed grid grid-flow-row left-24 rounded-md '>
                {sideBarItem.map((item) => {
                    return <SideToolbarBtn key={item.label} sideBarItem={item} active={currentBlockType === item.type} />;
                })}
            </div>
        );
    };

    // Cards 客製Block  (未啟用)
    const Card = (props) => {
        return (
            <div>
                <h1 className='text-red-900 border border-red-400 text-center' contentEditable={false}>
                    卡片模組範例 (不可修改區塊)
                </h1>
                <div className='editable-area border-red-500 border'>
                    <EditorBlock {...props} />
                </div>
            </div>
        );
    };

    function addCard() {
        const selection = editorState.getSelection();
        setEditorState(addNewBlockAt(editorState, selection.getAnchorKey(), 'cards'));
    }

    function addNewBlockAt(editorState, pivotBlockKey, newBlockType = 'unstyled', initialData = Immutable.Map({})) {
        const content = editorState.getCurrentContent();
        const blockMap = content.getBlockMap();
        const block = blockMap.get(pivotBlockKey);

        if (!block) {
            throw new Error(`The pivot key - ${pivotBlockKey} is not present in blockMap.`);
        }

        const blocksBefore = blockMap.toSeq().takeUntil((v) => v === block);
        const blocksAfter = blockMap
            .toSeq()
            .skipUntil((v) => v === block)
            .rest();
        const newBlockKey = genKey();

        const newBlock = new ContentBlock({
            key: newBlockKey,
            type: newBlockType,
            text: '',
            characterList: Immutable.List(),
            depth: 0,
            data: initialData,
        });

        const newBlockMap = blocksBefore
            .concat(
                [
                    [pivotBlockKey, block],
                    [newBlockKey, newBlock],
                ],
                blocksAfter,
            )
            .toOrderedMap();

        const selection = editorState.getSelection();

        const newContent = content.merge({
            blockMap: newBlockMap,
            selectionBefore: selection,
            selectionAfter: selection.merge({
                anchorKey: newBlockKey,
                anchorOffset: 0,
                focusKey: newBlockKey,
                focusOffset: 0,
                isBackward: false,
            }),
        });

        return EditorState.push(editorState, newContent, 'split-block');
    }

    // media 照片URL
    const [input, setInput] = useState('');
    const [showImgTool, setShowImgTool] = useState(false);
    const [urlValue, setUrlValue] = useState('');
    const ImageInput = () => {
        const style = {
            display: showAddImg ? 'block' : 'none',
        } as React.CSSProperties;
        const handleChange = (e) => {
            setInput(e.target.value);
        };
        const handleSubmit = (e) => {
            e.preventDefault();
            setUrlValue(input);
            setInput('');
            setShowAddImg(false);
        };
        const handleCancel = (e) => {
            e.preventDefault();
            setInput('');
            setShowAddImg(false);
        };
        const handleKeyDown = (e) => {
            if (e.which === 13) {
                handleSubmit(e);
            }
        };
        return (
            <div className='fixed z-50 left-0 top-0 bottom-0 right-0 bg-black bg-opacity-40 ' style={style}>
                <div className='absolute left-1/2 top-1/3 -translate-x-1/2 transform'>
                    <div className='grid grid-flow-col  '>
                        <input
                            key='Img_input'
                            autoFocus={true}
                            placeholder='照片連結'
                            className='text-xl text-black rounded-l-md py-1 pl-2  border-none  border-collapse border-r-none outline-none'
                            type='text'
                            onChange={handleChange}
                            value={input}
                            onKeyDown={handleKeyDown}
                        />
                        <div className='bg-green-500 text-white flex p-3 hover:bg-green-600 transform duration-300 cursor-pointer' onClick={handleSubmit}>
                            <span className='material-icons  justify-center self-center'>done</span>
                        </div>
                        <div className='bg-red-700 text-white flex p-3 hover:bg-red-800 transform duration-300 cursor-pointer' onClick={handleCancel}>
                            <span className='material-icons justify-center self-center'>close</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
    const Image = (props) => {
        const handleImgClick = (e) => {
            //調用最後一個state
            setShowImgTool((prevShowImgTool) => {
                return prevShowImgTool ? false : true;
            });
        };
        if (props.src) {
            return (
                <div className='w-full'>
                    <div id={props.blockKey} className='relative w-4/5 mx-auto '>
                        <img className='w-full ' id={props.src} src={props.src} />
                        <div
                            className='text-red-800 flex p-2  hover:opacity-90 transform duration-300 cursor-pointer absolute top-2 right-2 rounded-full opacity-50'
                            onClick={props.handleDelete}
                            title='移除相片'
                        >
                            <span className='material-icons justify-center self-center text-4xl'>backspace</span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };
    //移除照片
    function deleteImage(block) {
        const contentState = editorState.getCurrentContent();
        const key = block.getKey();

        const selection = editorState.getSelection();
        const selectionOfAtomicBlock = selection.merge({
            anchorKey: key,
            anchorOffset: 0,
            focusKey: key,
            focusOffset: block.getLength(),
        });
        // reset entity ，從block中移除，避免被其他block使用
        const contentStateWithoutEntity = Modifier.applyEntity(contentState, selectionOfAtomicBlock, null);
        const editorStateWithoutEntity = EditorState.push(editorState, contentStateWithoutEntity, 'apply-entity');

        // 移除 block  (removeRange 會報錯，暫時用setBlockType 調整回unstyled方式處理)
        const contentStateWithoutBlock = Modifier.setBlockType(contentStateWithoutEntity, selectionOfAtomicBlock, 'unstyled');
        const newEditorState = EditorState.push(editorStateWithoutEntity, contentStateWithoutBlock, 'change-block-type');
        setEditorState(newEditorState);

        //移除轉換後的block  移除尚不穩定暫用調整回unstyled
        // const after = contentState.getBlockAfter(key);
        // const selectionOfBlock = new SelectionState({
        //     anchorKey: key,
        //     anchorOffset: contentState.getBlockForKey(key).getText().length,
        //     focusKey: after.getKey(),
        //     focusOffset: 0,
        // });
        // console.log(selectionOfBlock);
        // const removeBlock = Modifier.removeRange(contentStateWithoutBlock, selectionOfBlock, 'forward');

        // setEditorState(EditorState.push(newEditorState, removeBlock, 'remove-range'));
    }

    //input url value 有url value 時執行
    useEffect(() => {
        if (urlValue !== '') {
            const contentState = editorState.getCurrentContent();
            const contentStateWithEntity = contentState.createEntity('image', 'IMMUTABLE', { src: urlValue });
            const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
            const newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity });
            setEditorState(AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' '));
            setUrlValue('');
        }
    }, [urlValue]);
    const Media = (props) => {
        if (!props.block.getEntityAt(0)) return null;
        const entity = props.contentState.getEntity(props.block.getEntityAt(0));
        const { src } = entity.getData();
        const type = entity.getType();

        let media;
        if (type === 'image') {
            const key = props.block.getKey();
            media = (
                <Image
                    src={src}
                    blockKey={key}
                    handleDelete={() => {
                        props.blockProps.deleteImage(props.block);
                    }}
                />
            );
        }

        return media;
    };

    function mediaBlockRenderer(block, { deleteImage }) {
        const type = block.getType();
        if (type === 'atomic') {
            return {
                component: Media,
                editable: true,
                props: {
                    deleteImage,
                },
            };
        }
        if (type === 'cards') {
            return {
                component: Card,
                props: {},
            };
        }

        return null;
    }

    //超連結
    const [linkInput, setLinkInput] = useState('');
    const [showLink, setShowLink] = useState(false);
    const [linkValue, setLinkValue] = useState('');
    function handleLink() {
        const selection = editorState.getSelection();
        if (!selection.isCollapsed()) {
            const contentState = editorState.getCurrentContent();
            const startKey = editorState.getSelection().getStartKey();
            const startOffset = editorState.getSelection().getStartOffset();
            const blockWithLinkAtBeginning = contentState.getBlockForKey(startKey);
            const linkKey = blockWithLinkAtBeginning.getEntityAt(startOffset);
            let url = '';
            if (linkKey) {
                const linkInstance = contentState.getEntity(linkKey);
                url = linkInstance.getData().url;
            }
            setLinkInput(url);
        }
        setShowLink(true);
    }
    //輸入框
    const LinkInput = () => {
        const style = {
            display: showLink ? 'block' : 'none',
        };
        const handleChange = (e) => {
            setLinkInput(e.target.value);
        };
        const handleSubmit = (e) => {
            e.preventDefault();
            if (linkInput !== '') {
                setLinkValue(linkInput);
            } else {
                const selection = editorState.getSelection();
                setEditorState(RichUtils.toggleLink(editorState, selection, null));
            }

            setLinkInput('');
            setShowLink(false);
        };
        const removeLink = (e) => {
            e.preventDefault();
            const selection = editorState.getSelection();
            if (!selection.isCollapsed()) {
                setEditorState(RichUtils.toggleLink(editorState, selection, null));
            }
            setLinkInput('');
            setShowLink(false);
        };
        const handleKeyDown = (e) => {
            if (e.which === 13) {
                handleSubmit(e);
            }
        };
        return (
            <div className='fixed z-50 left-0 top-0 bottom-0 right-0 bg-black bg-opacity-40 ' style={style}>
                <div className='absolute left-1/2 top-1/3 -translate-x-1/2 transform'>
                    <div className='grid grid-flow-col  '>
                        <input
                            key='Img_input'
                            autoFocus={true}
                            placeholder='超連結網址'
                            className='text-xl text-black rounded-l-md py-1 pl-2  border-none  border-collapse border-r-none outline-none'
                            type='text'
                            onChange={handleChange}
                            value={linkInput}
                            onKeyDown={handleKeyDown}
                        />
                        <div className='bg-green-500 text-white flex p-3 hover:bg-green-600 transform duration-300 cursor-pointer' onClick={handleSubmit}>
                            <span className='material-icons  justify-center self-center'>done</span>
                        </div>
                        <div className='bg-red-700 text-white flex p-3 hover:bg-red-800 transform duration-300 cursor-pointer' onClick={removeLink}>
                            <span className='material-icons justify-center self-center'>close</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
    useEffect(() => {
        if (linkValue !== '') {
            const contentState = editorState.getCurrentContent();
            const contentStateWithEntity = contentState.createEntity('LINK', 'MUTABLE', { url: linkValue });
            const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

            //Apply entity
            let nextEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity });
            //Apply selection
            setEditorState(RichUtils.toggleLink(nextEditorState, nextEditorState.getSelection(), entityKey));
            setLinkValue('');
            setShowLink(false);
        }
    }, [linkValue]);

    //KeyBinding  按鍵綁定

    const keyCommand = (command: string) => {
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

    //確保運行於Window端 避免報錯
    useEffect(() => {
        seteditor(true);
    }, [editorState]);

    // render
    return (
        <div className='mb-4 flex flex-grow'>
            <SideToolBar />
            <ImageInput />
            <LinkInput />
            <div className='Content text-xl flex-grow border border-gray-400 p-3 rounded-md' onClick={focusEditor}>
                {editor && (
                    <Editor
                        ref={edit}
                        placeholder='開始寫作吧'
                        customStyleMap={inlineStyleMap}
                        editorState={editorState}
                        onChange={setEditorState}
                        blockRendererFn={(block) =>
                            mediaBlockRenderer(block, {
                                deleteImage: deleteImage,
                            })
                        }
                        blockStyleFn={blockStyleFn}
                        blockRenderMap={blockRenderMap}
                        keyBindingFn={keyBindingFn}
                        // @ts-expect-error
                        handleKeyCommand={keyCommand}
                    />
                )}

                <div ref={toolbarRef} style={toolbarStyle} className='rounded-md bg-gray-800'>
                    <ToolBar />
                </div>
                {/* 開啟顯示原始資料 */}
                <div>
                    <h1 className='text-red-900'>RAW DATA 原始資料</h1>
                    {JSON.stringify(convertToRaw(editorState.getCurrentContent()))}
                </div>
            </div>
            {/* 輸出成HTML格式 */}
            {/* <HtmlRender state={editorState.getCurrentContent()} /> */}
        </div>
    );
};

export default DraftEditor;
