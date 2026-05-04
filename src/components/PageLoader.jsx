const PageLoader = () => {
    return (
        <div className="min-h-[60vh] w-full flex items-center justify-center bg-black">
            <div className="flex flex-col items-center">
            <div className="relative flex flex-col items-center">
                {/* Subtle Glow */}
                <div className="absolute inset-0 bg-gold-500/10 blur-[40px] rounded-full animate-pulse" />
                
                <img 
                    src="/logo-kiks.webp" 
                    alt="Kiks Loading" 
                    className="w-[100px] md:w-[130px] h-auto relative z-10 animate-luxury-pulse"
                />
            </div>
            </div>
        </div>
    );
};

export default PageLoader;
