import { useThemedScreenshot } from "../../hooks/useThemedScreenshot";

interface Props {
  src: string;
  alt?: string;
}

function IphoneFrame({ src, alt = "Mahlzait App Screenshot" }: Props) {
  const themedSrc = useThemedScreenshot(src);
  
  return (
    <div className="relative h-full flex items-center justify-center">
      {/* Screenshot mit integriertem iPhone Frame */}
      <img
        src={themedSrc}
        alt={alt}
        className="h-full w-auto object-contain"
        loading="lazy"
      />
    </div>
  );
}

export default IphoneFrame;
