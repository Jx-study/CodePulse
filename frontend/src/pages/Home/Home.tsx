import { useEffect } from 'react'
import '../../shared/styles/main.scss'; 

// 導入各個元件
import Hero from './components/Hero/Hero';
import Features from './components/Features/Features';
import DataStructureAlgorithm from './components/DataStructureAlgorithm/DataStructureAlgorithm';
import Demo from './components/Demo/Demo';

function Home() {
  // 平滑滾動
  useEffect(() => {
    document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e: Event) => {
        e.preventDefault();
        const href = (e.currentTarget as HTMLAnchorElement).getAttribute('href');
        if (href) {
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
      });
    });
  }, []);

  // 導航高亮
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[id]');
      const navLinks = document.querySelectorAll('.nav-menu a');
      
      let current: string | null = '';
      sections.forEach(section => {
    const sectionTop = section.getBoundingClientRect().top;
        if (sectionTop <= 100) {
          current = section.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
          link.classList.add('active');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="App">
      <Hero />
      <DataStructureAlgorithm />
      <Features />
      <Demo />
    </div>
  );
}

export default Home;