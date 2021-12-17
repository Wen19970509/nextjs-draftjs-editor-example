import { CompositeDecorator } from 'draft-js';

class HyperLink {
    //init Link Decorator  超連結樣式
    Link(props) {
        const { url } = props.contentState.getEntity(props.entityKey).getData();

        return (
            <a className='cursor-pointer text-blue-500 underline' href={url} title={url} target='_blank'>
                {props.children}
            </a>
        );
    }
    findLinkEntities(contentBlock, callback, contentState) {
        contentBlock.findEntityRanges((character) => {
            const entityKey = character.getEntity();
            return entityKey !== null && contentState.getEntity(entityKey).getType() === 'LINK';
        }, callback);
    }

    decorator = new CompositeDecorator([
        {
            strategy: this.findLinkEntities,
            component: this.Link,
        },
    ]);
}

export default new HyperLink();
