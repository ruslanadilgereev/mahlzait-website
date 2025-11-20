interface Props {
  src: string;
  alt?: string;
}

function IphoneFrame({ src, alt = "Mahlzait App Screenshot" }: Props) {
  return (
    <div className="relative h-full overflow-hidden">
      <div className="absolute top-2 bottom-2 left-2.5">
        <img
          src={src}
          alt={alt}
          className="rounded-2xl h-full"
          loading="lazy"
        />
      </div>
      <img
        src="/misc/iphone-frame.webp"
        alt="iPhone Rahmen"
        className="relative z-10 h-full"
      />
    </div>
  );
}

export default IphoneFrame;
