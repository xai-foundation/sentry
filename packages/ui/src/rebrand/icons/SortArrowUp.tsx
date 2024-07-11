
const SortArrowUp = ({ extraClasses }: { extraClasses?: string }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={extraClasses} width="16" height="16" viewBox="0 0 16 16"
             fill="none">
            <path d="M7 16V3.825L1.4 9.425L0 8L8 0L16 8L14.6 9.425L9 3.825V16H7Z" fill="#F7F6F6" />
        </svg>
    );
};

export default SortArrowUp;