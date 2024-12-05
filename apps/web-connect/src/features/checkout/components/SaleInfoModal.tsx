const SaleInfoModal = () => {

    document.body.style.overflow = "hidden"

    return (
        <div className={"bg-black/70 absolute top-0 left-0 w-screen h-screen z-[99999] flex items-center justify-center"}>
            <div className="bg-black w-full md:max-w-[75%] h-full md:max-h-[700px] text-white flex flex-col items-center justify-center">
                <h1 className="font-bold md:text-4xl text-lg">Tiny Sentry Keys </h1>
                <div className="block md:text-2xl text-center ">
                    <h2 className='font-bold md:text-2xl my-2'>Sale Starts</h2>
                    <p>Dec. 13th 6:00pm Vancouver, Canada</p>
                    <p>Dec. 13th 11:00pm Buenos Aires, Argentina</p>
                    <p>Dec 14th 2:00am London, England (UTC)</p>
                    <p>Dec 14th 7:30am Mumbai, India</p>
                    <p>Dec 14th 9:00am Seoul, South Korea</p>
                    <p>Dec 14th 10:00am Hong Kong</p>
                    <p>&#42; please note sale starts at the same time, just different time zones</p>
                </div>
            </div>
        </div>
    )
}
export default SaleInfoModal
