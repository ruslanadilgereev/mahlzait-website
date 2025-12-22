import { useThemedScreenshot } from "../../hooks/useThemedScreenshot";

interface Props {
  src: string;
  alt?: string;
}

function IphoneFrame({ src, alt = "Mahlzait App Screenshot" }: Props) {
  const themedSrc = useThemedScreenshot(src);
  const mobileSrc = themedSrc.replace('/screenshots/optimized/', '/screenshots/mobile/');
  
  return (
    <div className="relative h-full flex items-center justify-center">
      {/* Screenshot mit integriertem iPhone Frame */}
      <img
        src={themedSrc}
        srcSet={`${mobileSrc} 300w, ${themedSrc} 540w`}
        sizes="(max-width: 768px) 300px, 540px"
        alt={alt}
        className="h-full w-auto object-contain"
        width={540}
        height={1143}
        loading="lazy"
      />
    </div>
  );
}

export default IphoneFrame;
