import { motion, useScroll } from "framer-motion";
import { useContext, useEffect, useRef, useState } from "react";
import { ConfigContext } from "../../../../utils/configContext";
import SingleScreenshot from "./singleScreenshot";
import SVGWave from "./svg/wave";
import SVGBlob from "./svg/blob";

function Header() {
  const {
    googlePlayLink,
    appStoreLink,
    home: { header, partners },
  } = useContext(ConfigContext)!;

  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
  });

  // Performance: render only the first screenshot on the server/initial paint.
  // Once hydrated, we render the full interactive stack (prevents downloading all hero screenshots immediately).
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const screenshotsToRender = isHydrated
    ? header.screenshots
    : header.screenshots.slice(0, 1);

  return (
    <section id={header.id} className="relative pb-8 md:pb-4">
      <div className="max-w-screen-lg mx-auto py-4 px-4 md:py-16">
        <div className="flex flex-col md:flex-row">
          <div className="flex flex-1 items-center md:items-start md:h-[300vh]">
            <div className="static top-40 flex flex-col prose justify-center py-8 md:sticky md:h-[70vh] md:min-h-[600px] md:max-h-[900px]">
              <div className="flex flex-col gap-2 my-4 3xs:flex-row">
                {header.rewards?.map((reward, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="flex items-center self-center h-8 md:h-12"
                  >
                    <img src="/misc/wreath-left.webp" className="h-full" width={29} height={56} alt="Auszeichnung Dekoration links" />
                    <p className="text-xs text-gray-500 whitespace-pre text-center">
                      {reward}
                    </p>
                    <img src="/misc/wreath-right.webp" className="h-full" width={29} height={56} alt="Auszeichnung Dekoration rechts" />
                  </motion.div>
                ))}
              </div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="mt-0 mb-4 text-4xl md:text-6xl"
              >
                {header.headlineMark ? (
                  <>
                    {header.headline
                      .split(" ")
                      .slice(0, header.headlineMark[0])
                      .join(" ")}{" "}
                    <span className="inline-block relative">
                      <span>
                        {header.headline
                          .split(" ")
                          .slice(...header.headlineMark)
                          .join(" ")}
                      </span>
                      <motion.span
                        animate={{
                          width: "100%",
                          height: "100%",
                        }}
                        transition={{ duration: 0.6, delay: 1 }}
                        className="w-0 h-full top-0 left-0 z-[-1] absolute inline-block bg-gradient-to-r from-primary/80 to-secondary/40 rounded-lg"
                      />
                    </span>{" "}
                    {header.headline
                      .split(" ")
                      .slice(header.headlineMark[1])
                      .join(" ")}
                  </>
                ) : (
                  header.headline
                )}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 0.7, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
                className="whitespace-pre-wrap text-left m-0 my-1 max-w-md md:text-lg md:max-w-lg"
              >
                {header.subtitle}
              </motion.p>
              <motion.ul
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
                className="list-none flex gap-4 m-0 p-0"
              >
                {googlePlayLink && (
                  <li className="m-0 p-0">
                    <a href={googlePlayLink}>
                      <img
                        className="h-14"
                        alt="Bei Google Play herunterladen"
                        src="/stores/google-play.svg"
                        width={180}
                        height={56}
                      />
                    </a>
                  </li>
                )}
                {appStoreLink && (
                  <li className="m-0 p-0">
                    <a href={appStoreLink}>
                      <img
                        className="h-14"
                        alt="Im App Store herunterladen"
                        src="/stores/app-store.svg"
                        width={180}
                        height={56}
                      />
                    </a>
                  </li>
                )}
              </motion.ul>
              
              {/* DSGVO Trust Badge */}
              <motion.a
                href="/datenschutz"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4, ease: "easeOut" }}
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-base-200/80 backdrop-blur-sm border border-base-300 hover:bg-base-300/80 transition-colors no-underline group w-fit"
              >
                <svg 
                  className="w-5 h-5 text-success" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
                  />
                </svg>
                <span className="text-sm font-medium text-base-content">
                  DSGVO-konform
                </span>
                <span className="text-xs text-base-content/60 group-hover:text-base-content/80 transition-colors">
                  Deine Daten sind sicher
                </span>
              </motion.a>
              {header.usersDescription && (
                <div className="not-prose flex items-center gap-2 my-1">
                  <ul className="avatar-group -space-x-4">
                    {Array.from(Array(5)).map((_, index) => (
                      <motion.li
                        key={index}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3 + index * 0.08, duration: 0.3, ease: "easeOut" }}
                        className="avatar"
                      >
                        <div className="w-8">
                          <img
                            src={`/avatars/${index + 1}.webp`}
                            alt={`app user ${index + 1}`}
                            width={32}
                            height={32}
                            loading="lazy"
                          />
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                  <motion.p
                    className="text-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.4, ease: "easeOut" }}
                  >
                    {header.usersDescription}
                  </motion.p>
                </div>
              )}
            </div>
          </div>
          <div className="min-h-[300vh] z-[-1]" ref={ref}>
            <div className="flex justify-center sticky top-28 md:top-40">
              <SVGBlob
                scrollYProgress={scrollYProgress}
                className="-z-10 absolute hidden w-[800px] -top-20 -right-60 md:hidden xl:block"
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  duration: 0.5,
                  ease: "easeOut",
                  delay: 0.2,
                }}
                className="relative h-[70vh] min-h-[600px] max-h-[900px] rounded-t-[3rem] rounded-b-[4.5rem]"
              >
                <div className="absolute top-2.5 left-[3px] w-[calc(100%-6px)] h-[calc(100%-16px)] rounded-t-[2rem] rounded-b-[3rem] 2xs:rounded-t-[3rem] 2xs:rounded-b-[4.5rem] overflow-hidden">
                  {screenshotsToRender.map((src, index) => (
                    <SingleScreenshot
                      key={src}
                      src={src}
                      scrollYProgress={scrollYProgress}
                      index={index}
                      totalCount={header.screenshots.length}
                    />
                  ))}
                </div>
                <img
                  src="/misc/iphone-frame.webp"
                  alt="Mahlzait App auf iPhone - Kalorienzähler Interface"
                  className="relative z-10 h-full pointer-events-none"
                  width={432}
                  height={885}
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      {partners && (
        <SVGWave className="absolute -bottom-1 left-0 right-0 -z-10" />
      )}
    </section>
  );
}

export default Header;
