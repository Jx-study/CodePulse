import { useEffect } from 'react'
import '../styles/main.scss'; 

// 導入各個元件
import Hero from '../components/Hero/Hero';
import Features from '../components/Home_content/Features/Features';
import DataStructureAlgorithm from '../components/Home_content/DataStructureAlgorithm/DataStructureAlgorithm';
import Audience from '../components/Home_content/TargetGroup/Audience';
import Demo from '../components/Demo/Demo';

function Home() {
  // 平滑滾動
  useEffect(() => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }, []);

  // 導航高亮
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[id]');
      const navLinks = document.querySelectorAll('.nav-menu a');
      
      let current = '';
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
      <Audience />
      <Demo />
    </div>
  );
}

export default Home;