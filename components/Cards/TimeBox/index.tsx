import dayjs from 'dayjs';

interface TimeBoxType {
    publish_date: string;
}

const TimeBox: React.FC<TimeBoxType> = (props) => {
    const { publish_date } = props;

    return (
        <div className='py-1'>
            <span className='text-blue-600 text-sm'>{dayjs(publish_date).format('YYYY/MM/DD')}</span>
        </div>
    );
};

export default TimeBox;
