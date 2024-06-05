import {Lock} from "../../../../../packages/ui/src/rebrand/icons/IconsComponents";

const UrlVerification = () => {
    return (
        <div className="xl:mt-0 md:mt-[110px] mt-[80px] md:h-[108px]  z-30 xl:w-max w-full text-white xl:absolute top-0 xl:right-1/2 xl:translate-x-1/2 flex items-center justify-center ">
            <div className="md:w-[370px] w-[90%] bg-nulnOil flex xl:items-center items-start justify-center xl:gap-1 gap-2 font-medium text-lg py-[8px] xl:py-[10px] wrapper-drop-shadow">
                <span><Lock className="mt-1 md:mt-0 lg:mb-1 mb-0"/></span>
                <div className="flex md:flex-row flex-col">
                    <span className="text-elementalGrey xl:mr-[5px] mr-0">URL verification:</span>
                    <div>
                        <span className="text-drunkenDragonfly">https://</span>
                        <span className="text-white">sentry.xai.games</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UrlVerification;