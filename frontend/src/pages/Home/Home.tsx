import { useEffect, Suspense, lazy } from "react";
import "../../shared/styles/main.scss";

// 立即載入首屏元件
import Hero from "./components/Hero/Hero";

// 懶載入非首屏元件
const Features = lazy(
  () => import("../../shared/components/Features/Features")
);
const DataStructureAlgorithm = lazy(
  () => import("./components/DataStructureAlgorithm/DataStructureAlgorithm")
);

function Home() {
  // 平滑滾動
  useEffect(() => {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const href = (e.currentTarget as HTMLAnchorElement).getAttribute(
          "href"
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

  // 導航高亮
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id]");
      const navLinks = document.querySelectorAll(".nav-menu a");

      let current: string | null = "";
      sections.forEach((section) => {
        const sectionTop = section.getBoundingClientRect().top;
        if (sectionTop <= 100) {
          current = section.getAttribute("id");
        }
      });

      navLinks.forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${current}`) {
          link.classList.add("active");
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="App">
      <Hero />
      <Suspense fallback={<div className="loading-section">載入中...</div>}>
        <DataStructureAlgorithm />
      </Suspense>
      <Suspense fallback={<div className="loading-section">載入中...</div>}>
        <Features />
      </Suspense>
    </div>
  );
}

export default Home;
