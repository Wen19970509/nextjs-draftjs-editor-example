import DraftEditor from '@root/components/Editor';
const Home = () => {
    return (
        <div className='min-h-screen flex flex-col'>
            <h1 className='text-center mt-7 text-indigo-500'>Editor Example </h1>
            <p className='text-center text-blue-700 my-4 underline decoration-1'>
                <a href='https://github.com/Wen19970509/nextjs-draftjs-editor-example' target='_blank'>
                    GitHub
                </a>
            </p>
            <div className='px-56 flex-grow flex'>
                <DraftEditor />
            </div>
        </div>
    );
};

export default Home;
