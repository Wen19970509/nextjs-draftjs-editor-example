import { ContentState } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';

//HTML 輸出
export interface T_Render {
    state: ContentState;
}

const HtmlRender: React.FC<T_Render> = ({ state }) => {
    return <div>{stateToHTML(state)}</div>;
};

export default HtmlRender;
