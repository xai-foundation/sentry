import logo from '../../../../public/images/sentry-main.png'

/**
 * LogoColumn Component
 * 
 * This component renders a column containing the Sentry logo and a message
 * indicating that the purchase is ready. It's designed to be responsive,
 * adjusting its layout and styling based on screen size.
 * 
 * @returns {JSX.Element} The rendered LogoColumn component
 */
export function LogoColumn(): JSX.Element {
    return (
        <div className="flex flex-col justify-start items-center h-auto sm:px-4 sm:py-4 lg:p-12 xg:pl-[80px] lg:pt-1 ">
            {/* Logo container */}
            <div className="w-full flex justify-center">
                <img 
                    className="max-w-[390px]" 
                    src={logo} 
                    alt="Sentry Logo"  // Added alt text for accessibility
                />
            </div>
            {/* Message container */}
            <div className="w-full flex justify-center lg:max-w-[280px]">
                <span className="sm:text-4xl lg:text-6xl text-center font-bold text-white">
                    YOUR PURCHASE IS READY
                </span>
            </div>
        </div>
    )
}