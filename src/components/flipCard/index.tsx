import { motion } from "framer-motion";
import clsx from "clsx";
import { useState } from "react";

interface FlipCardProps {
  frontContent: {
    icon: string;
    title: string;
    subtitle: string;
  };
  backImage: string;
  index: number;
}

function FlipCard({ frontContent, backImage, index }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div
      variants={{
        hidden: { x: "-100%", opacity: 0 },
        visible: { x: 0, opacity: 1 },
      }}
      transition={{ delay: 0.25 + index * 0.25 }}
      className="relative h-[600px] perspective-1000"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <motion.div
        className="relative w-full h-full preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {/* Front Side */}
        <div className="absolute inset-0 backface-hidden shadow-md border-primary/10 border-2 card overflow-hidden group px-12 rounded-[3rem]">
          <div className="relative mb-4 mt-4">
            <div
              className={clsx(
                "absolute left-0 right-0 top-0 bottom-0 bg-secondary/50 -z-10 rounded-lg"
              )}
            />
            <figure className="py-4">
              <img
                src={frontContent.icon}
                alt="feature icon"
                className="w-40 transition-transform group-hover:scale-90"
              />
            </figure>
          </div>
          <div className="w-full pt-0 px-0 card-body items-center text-center transition-transform max-w-none group-hover:scale-95">
            <h2 className="card-title text-2xl font-bold">
              {frontContent.title}
            </h2>
            <div className="h-0.5 w-full bg-primary/10" />
            <p className="opacity-[.7]">{frontContent.subtitle}</p>
          </div>
        </div>

        {/* Back Side */}
        <div
          className="absolute inset-0 backface-hidden shadow-md border-primary/10 border-2 rounded-[3rem] overflow-hidden bg-base-100 flex items-center justify-center p-6"
          style={{ transform: "rotateY(180deg)" }}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {/* iPhone Frame */}
            <div className="relative w-full max-w-[280px] h-full max-h-[560px] bg-black rounded-[3rem] p-2 shadow-2xl border-8 border-gray-800">
              {/* Notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-3xl z-10" />
              
              {/* Screen */}
              <div className="relative w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                <img
                  src={backImage}
                  alt="App Screenshot"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default FlipCard;

