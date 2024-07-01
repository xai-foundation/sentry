
interface BurgerProps {
    openNavbar: () => void;
}
const Burger = ({openNavbar}: BurgerProps) => {
    return (
        <div className="text-white block md:hidden" onClick={openNavbar}>

            <div className="w-full min-h-[64px] min-w-[64px] justify-center bg-hornetSting flex items-center">
                <div className="h-[20px] flex flex-col justify-between ">
                <span className="block bg-white w-[23px] h-[3px] clip-path-30px">

                </span>
                    <span className="block bg-white w-full max-w-[23px] h-[3px] clip-path-30px">

                </span>
                    <span className="block bg-white w-full max-w-[23px] h-[3px] clip-path-30px">

                </span>
                </div>

            </div>
        </div>
    );
};

export default Burger;