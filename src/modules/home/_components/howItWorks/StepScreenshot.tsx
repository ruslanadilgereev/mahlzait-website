import { useThemedScreenshot } from "../../../../hooks/useThemedScreenshot";

interface StepScreenshotProps {
  imagePath: string;
  alt: string;
}

function StepScreenshot({ imagePath, alt }: StepScreenshotProps) {
  const themedImage = useThemedScreenshot(imagePath);

  return (
    <div className="relative h-[500px] md:h-[600px] flex items-center justify-center">
      {/* Screenshot mit integriertem iPhone Frame */}
      <img
        src={themedImage}
        alt={alt}
        className="h-full w-auto object-contain"
        loading="lazy"
      />
    </div>
  );
}

export default StepScreenshot;

