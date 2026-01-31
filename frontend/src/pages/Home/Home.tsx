import { useEffect, Suspense, lazy } from "react";
import "@/shared/styles/main.scss";

// 立即載入首屏元件
import Hero from "./components/Hero/Hero";

// 懶載入非首屏元件
const Features = lazy(() => import("@/shared/components/Features/Features"));
const DataStructureAlgorithm = lazy(
  () => import("./components/DataStructureAlgorithm/DataStructureAlgorithm"),
);

// 導入骨架屏
import {
  FeaturesSkeleton,
  DataStructureAlgorithmSkeleton,
} from "@/shared/components/Skeleton";

function Home() {
  // 平滑滾動
  useEffect(() => {
    document
      .querySelectorAll<HTMLAnchorElement>('a[href^="#"]')
      .forEach((anchor) => {
        anchor.addEventListener("click", (e: Event) => {
          e.preventDefault();
          const href = (e.currentTarget as HTMLAnchorElement).getAttribute(
            "href",
          );
          if (!href) return;

          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        });
      });
  }, []);

  return (
    <div className="App">
      <Hero />

      {/* 使用 DataStructureAlgorithmSkeleton 作為 fallback */}
      <Suspense fallback={<DataStructureAlgorithmSkeleton />}>
        <DataStructureAlgorithm />
      </Suspense>

      {/* 使用 FeaturesSkeleton 作為 fallback */}
      <Suspense fallback={<FeaturesSkeleton />}>
        <Features />
      </Suspense>
    </div>
  );
}

export default Home;
