import { motion, transform, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { useThemedScreenshot } from "../../../../hooks/useThemedScreenshot";

interface Props {
  index: number;
  totalCount: number;
  scrollYProgress: MotionValue<number>;
  src: string;
}

function SingleScreenshot({ scrollYProgress, index, totalCount, src }: Props) {
  const themedSrc = useThemedScreenshot(src);
  
  // Generate srcset paths for responsive images
  // Mobile: 300w, Desktop: 540w
  const mobileSrc = themedSrc.replace('/screenshots/optimized/', '/screenshots/mobile/');
  const srcSet = `${mobileSrc} 300w, ${themedSrc} 540w`;
  
  const x = useTransform(scrollYProgress, (y) => {
    if (index > 0 && index % 2 === 0) {
      const i = totalCount - index;
      const transformer = transform(
        [(i - 1) / totalCount, i / totalCount],
        [0, 1]
      );
      return -transformer(y) * 100 + "%";
    }
    return 0;
  });
  const y = useTransform(scrollYProgress, (y) => {
    if (index % 2 === 1) {
      const i = totalCount - index;
      const transformer = transform(
        [(i - 1) / totalCount, i / totalCount],
        [0, 1]
      );
      return -transformer(y) * 100 + "%";
    }
    return 0;
  });
  return (
    <motion.img
      src={themedSrc}
      srcSet={srcSet}
      sizes="(max-width: 768px) 300px, 540px"
      alt={`Mahlzait App Screenshot ${index + 1} - Kalorienzähler Funktion`}
      width={540}
      height={1200}
      loading={index === 0 ? "eager" : "lazy"}
      decoding="async"
      fetchpriority={index === 0 ? "high" : "auto"}
      style={{ translateX: x, translateY: y, scale: 1.02 }}
      className="absolute overflow-hidden w-full h-full object-cover object-top"
    />
  );
}

export default SingleScreenshot;
