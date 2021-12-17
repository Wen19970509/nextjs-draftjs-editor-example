import DraftEditor from '@root/components/Editor';
import { DEFAULT_MIN_VERSION } from 'tls';
const Home = () => {
    return (
        <div className='min-h-screen flex flex-col'>
            <h1 className='text-center my-7 text-blue-500'>DraftJS Editor Example</h1>
            <div className='px-56 flex-grow flex'>
                <DraftEditor />
            </div>
        </div>
    );
};

export default Home;
