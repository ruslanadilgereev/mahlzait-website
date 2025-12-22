import { motion } from "framer-motion";
import clsx from "clsx";
import { useState } from "react";
import { useThemedScreenshot } from "../../hooks/useThemedScreenshot";

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
  const themedBackImage = useThemedScreenshot(backImage);

  return (
    <motion.div
      variants={{
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
      }}
      transition={{ delay: 0.05 + index * 0.1, duration: 0.4, ease: "easeOut" }}
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
                alt={`${frontContent.title} Icon - Mahlzait Feature`}
                className="w-40 transition-transform group-hover:scale-90"
                width={160}
                height={160}
                loading="lazy"
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
            {/* Screenshot mit integriertem iPhone Frame */}
            <img
              src={themedBackImage}
              srcSet={`${themedBackImage.replace('/screenshots/optimized/', '/screenshots/mobile/')} 300w, ${themedBackImage} 540w`}
              sizes="(max-width: 768px) 300px, 540px"
              alt={`${frontContent.title} - Mahlzait App Ansicht`}
              className="h-full w-auto object-contain"
              width={540}
              height={1143}
              loading="lazy"
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default FlipCard;

