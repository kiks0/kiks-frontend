const PageLoader = () => {
    return (
        <div className="min-h-[60vh] w-full flex items-center justify-center bg-black">
            <div className="flex flex-col items-center">
                <img 
                    src="/logo-kiks.webp" 
                    alt="Kiks Loading" 
                    className="w-[100px] md:w-[130px] h-auto animate-luxury-fade invert opacity-80"
                />
                <div className="w-12 h-[1px] bg-white/10 mt-6" />
            </div>
        </div>
    );
};

export default PageLoader;
