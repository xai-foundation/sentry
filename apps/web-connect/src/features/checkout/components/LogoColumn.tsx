
import logo from '../../../../public/images/sentry-main.png'


export function LogoColumn(){
    return (
        <div className="flex flex-col justify-start items-center h-auto sm:px-4 sm:py-4 lg:p-12 xg:pl-[80px] lg:pt-1 ">
			<div className="w-full flex justify-center">
				<img className="max-w-[280px]" src={logo} />
			</div>
			<div className="w-full flex justify-center lg:max-w-[280px]">
				<span className="sm:text-4xl lg:text-6xl text-center font-bold text-white">YOUR PURCHASE IS READY</span>
			</div>
		</div>
    )
}