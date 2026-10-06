import { useCallback, useEffect, useRef, useState } from 'react';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'motion/react';
import classNames from 'classnames';
import Avatar from '@/shared/components/Avatar';
import Badge from '@/shared/components/Badge';
import Button from '@/shared/components/Button';
import MilestoneFigure from './components/MilestoneFigure';
import styles from './About.module.scss';

const MotionBadge = motion.create(Badge);
const SCROLL_ANCHOR = 0.62; // 主軸線的視窗錨點（62vh）

const teamMembers = [
  {
    name: 'JULIAN TEE',
    memberKey: 'julian' as const,
    avatar: '/images/teamAvatar.png',
    flip: false,
    github: 'https://github.com/Jx-study',
  },
  {
    name: 'KAI',
    memberKey: 'kai' as const,
    avatar: '/images/teamAvatar.png',
    flip: true,
    github: 'https://github.com/SengQ1011',
  },
  {
    name: 'KENNY',
    memberKey: 'kenny' as const,
    avatar: '/images/teamAvatar.png',
    flip: false,
    github: 'https://github.com/AnHsi0714',
  },
];

const techItems = [
  { name: 'React 19', role: 'UI_RUNTIME', tipKey: 'react' },
  { name: 'TypeScript 5', role: 'TYPE_SAFETY', tipKey: 'typescript' },
  { name: 'D3 + Cytoscape', role: 'VIZ_ENGINE', tipKey: 'viz' },
  { name: 'Flask', role: 'BACKEND_CORE', tipKey: 'flask' },
  { name: 'PostgreSQL', role: 'DATABASE', tipKey: 'postgres' },
] as const;

// 跑馬燈：平台涵蓋的資料結構與演算法（取自里程碑內文），術語兩個語系都用原文
const marqueeItems = [
  'Array',
  'Linked List',
  'Doubly Linked List',
  'Stack',
  'Queue',
  'Binary Tree',
  'BST',
  'Heap',
  'Graph',
  'BFS / DFS',
  'Dijkstra',
];

const HERO_PULSE_PATH =
  'M0,60 H160 L180,48 L200,60 H320 L340,14 L360,84 L380,60 H560 L580,50 L600,60 ' +
  'H760 L780,10 L800,86 L820,60 H1000 L1020,48 L1040,60 H1150';

const CTA_PULSE_PATH = 'M0,26 H420 L440,18 L460,26 H560 L580,4 L600,36 L620,26 H1200';

const pad2 = (n: number) => String(n).padStart(2, '0');

const sameFlags = (a: boolean[], b: boolean[]) =>
  a.length === b.length && a.every((v, i) => v === b[i]);

type MilestoneItem = {
  tag: string;
  date: string;
  title: string;
  titleAccent: string;
  body: string;
  pills: string[];
  note?: string;
};

/** commit -m 打字機（SR 靜默：視覺層 aria-hidden，完整文案走 sr-only） */
function useTypewriter(full: string, disabled: boolean) {
  const [text, setText] = useState(full);
  const timer = useRef<number | undefined>(undefined);

  // 語系切換時 full 會變，重置回完整文字，避免殘留上一語系的片段
  useEffect(() => {
    window.clearInterval(timer.current);
    timer.current = undefined;
    setText(full);
  }, [full]);

  useEffect(() => () => window.clearInterval(timer.current), []);

  const replay = useCallback(() => {
    if (disabled || timer.current) return;
    let i = 0;
    setText('');
    timer.current = window.setInterval(() => {
      i += 1;
      setText(full.slice(0, i));
      if (i >= full.length) {
        window.clearInterval(timer.current);
        timer.current = undefined;
      }
    }, 40);
  }, [full, disabled]);

  return { text, replay };
}

/** 「+N 種動畫」pill：passed 時數字從 0 spring 上來 */
function CountPill({
  label,
  active,
  reduced,
}: {
  label: string;
  active: boolean;
  reduced: boolean;
}) {
  const match = label.match(/^\+(\d+)([\s\S]*)$/);
  const target = match ? Number(match[1]) : 0;
  const mv = useSpring(0, { stiffness: 90, damping: 20 });
  const [display, setDisplay] = useState(0);

  useMotionValueEvent(mv, 'change', (v) => setDisplay(Math.round(v)));

  useEffect(() => {
    if (!active) return;
    if (reduced) setDisplay(target);
    else mv.set(target);
  }, [active, reduced, target, mv]);

  if (!match) return <span className={styles.msPill}>{label}</span>;
  // 數字要捲過節點才跑，螢幕閱讀器不一定觸發捲動，完整文案走 sr-only
  return (
    <span className={styles.msPill}>
      <span className={styles.srOnly}>{label}</span>
      <span aria-hidden="true">{`+${display}${match[2]}`}</span>
    </span>
  );
}

/** Hero 心電圖：載入描邊、游標跟隨、點擊漣漪 */
function HeroPulse({
  reduced,
  label,
  hint,
  hintTouch,
}: {
  reduced: boolean;
  label: string;
  hint: string;
  hintTouch: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const samplesRef = useRef<{ x: number; y: number }[]>([]);
  const [follower, setFollower] = useState<{ x: number; y: number } | null>(null);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const rippleId = useRef(0);
  const rippleTimers = useRef<number[]>([]);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const total = path.getTotalLength();
    const samples: { x: number; y: number }[] = [];
    for (let i = 0; i <= 240; i += 1) {
      const pt = path.getPointAtLength((total * i) / 240);
      samples.push({ x: pt.x, y: pt.y });
    }
    samplesRef.current = samples;
  }, []);

  // 卸載時清掉尚未觸發的 ripple timer
  useEffect(() => {
    const timers = rippleTimers.current;
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, []);

  const nearest = (clientX: number) => {
    const svg = svgRef.current;
    const samples = samplesRef.current;
    if (!svg || samples.length === 0) return null;
    const rect = svg.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 1200;
    let best = samples[0];
    for (const pt of samples) {
      if (Math.abs(pt.x - x) < Math.abs(best.x - x)) best = pt;
    }
    return best;
  };

  return (
    <div className={styles.heroPulse}>
      <svg
        ref={svgRef}
        viewBox="0 0 1200 90"
        preserveAspectRatio="none"
        role="img"
        aria-label={label}
        onPointerMove={(e) => setFollower(nearest(e.clientX))}
        onPointerLeave={() => setFollower(null)}
        onClick={(e) => {
          if (reduced) return;
          const pt = nearest(e.clientX);
          if (!pt) return;
          rippleId.current += 1;
          const id = rippleId.current;
          setRipples((rs) => [...rs, { id, x: pt.x, y: pt.y }]);
          const timer = window.setTimeout(() => {
            setRipples((rs) => rs.filter((r) => r.id !== id));
            rippleTimers.current = rippleTimers.current.filter((tid) => tid !== timer);
          }, 700);
          rippleTimers.current.push(timer);
        }}
      >
        <motion.path
          ref={pathRef}
          d={HERO_PULSE_PATH}
          initial={reduced ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
        />
        {follower && (
          <circle className={styles.pulseFollower} cx={follower.x} cy={follower.y} r="4" />
        )}
        <AnimatePresence>
          {ripples.map((r) => (
            <motion.circle
              key={r.id}
              className={styles.pulseRipple}
              cx={r.x}
              cy={r.y}
              initial={{ r: 4, opacity: 0.8 }}
              animate={{ r: 36, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            />
          ))}
        </AnimatePresence>
        <motion.circle
          className={styles.pulseDot}
          cx="1150"
          cy="60"
          r="5"
          animate={reduced ? undefined : { scale: [1, 1.8, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
        />
      </svg>
      {/* reduced motion 下沒有點擊漣漪，提示一併隱藏；滑鼠與觸控各顯示對應的操作 */}
      {!reduced && (
        <div className={styles.heroHint} aria-hidden="true">
          <span className={styles.hintFine}>{hint}</span>
          <span className={styles.hintTouch}>{hintTouch}</span>
        </div>
      )}
    </div>
  );
}

/** 團隊成員列：交錯排版、方形錨點、打字機、膠帶+四角括號 */
function MemberRow({
  member,
  index,
  passed,
  reduced,
  refCb,
}: {
  member: (typeof teamMembers)[number];
  index: number;
  passed: boolean;
  reduced: boolean;
  refCb: (el: HTMLDivElement | null) => void;
}) {
  const { t } = useTranslation('about');
  const bio = t(`team.members.${member.memberKey}.bio`);
  const { text, replay } = useTypewriter(bio, reduced);

  return (
    <motion.div
      ref={refCb}
      className={classNames(styles.memberRow, member.flip && styles.flip, passed && styles.passed)}
      initial={reduced ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      onMouseEnter={replay}
    >
      <div className={styles.memberIndex} aria-hidden="true">
        {pad2(index + 1)}
      </div>
      <div className={styles.memberNode} aria-hidden="true" />
      <div className={styles.avatarBlock}>
        <div className={styles.avatarFrame}>
          <em className={styles.avatarTape} aria-hidden="true" />
          <i className={styles.cTL} />
          <i className={styles.cTR} />
          <i className={styles.cBL} />
          <i className={styles.cBR} />
          <Avatar
            src={member.avatar}
            username={member.name}
            shape="square"
            size="xl"
            className={styles.avatarImage}
          />
        </div>
      </div>
      <div className={styles.memberInfo}>
        <div className={styles.memberMetaRow}>
          <Badge variant="secondary" shape="pill" size="sm" className={styles.memberRolePill}>
            {t(`team.members.${member.memberKey}.role`)}
          </Badge>
        </div>
        <h3 className={styles.memberName}>{member.name}</h3>
        <p className={styles.memberCommit}>
          <span className={styles.srOnly}>{bio}</span>
          <span aria-hidden="true">
            <span className={styles.prefix}>commit -m</span> 「{text}」
          </span>
        </p>
        <a
          className={styles.memberLink}
          href={member.github}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('team.githubLabel', { name: member.name })}
        >
          GitHub →
        </a>
      </div>
    </motion.div>
  );
}

/** 里程碑：菱形節點、branch 繪入、外側滑入、tag 蓋章、pill 計數、3D tilt、ghost 視差 */
function MilestoneEntry({
  item,
  index,
  alt,
  passed,
  reduced,
  refCb,
}: {
  item: MilestoneItem;
  index: number;
  alt: boolean;
  passed: boolean;
  reduced: boolean;
  refCb: (el: HTMLDivElement | null) => void;
}) {
  const localRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress: entryProgress } = useScroll({
    target: localRef,
    offset: ['start end', 'end start'],
  });
  const ghostY = useTransform(entryProgress, [0, 1], [24, -24]);

  // 3D tilt：僅精確指標裝置，避免觸控 tap 觸發 sticky hover
  const tiltX = useSpring(0, { stiffness: 250, damping: 25 });
  const tiltY = useSpring(0, { stiffness: 250, damping: 25 });
  const [finePointer] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches,
  );
  const canTilt = !reduced && finePointer;

  return (
    <div
      ref={(el) => {
        localRef.current = el;
        refCb(el);
      }}
      className={classNames(styles.msEntry, alt && styles.alt, passed && styles.passed)}
      onMouseMove={(e) => {
        if (!canTilt) return;
        const r = e.currentTarget.getBoundingClientRect();
        tiltY.set(((e.clientX - r.left) / r.width - 0.5) * 5);
        tiltX.set(-((e.clientY - r.top) / r.height - 0.5) * 4);
      }}
      onMouseLeave={() => {
        tiltX.set(0);
        tiltY.set(0);
      }}
    >
      <div className={styles.msNode} aria-hidden="true" />
      <motion.div
        className={styles.msBranch}
        aria-hidden="true"
        animate={{ scaleX: passed ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
      />
      <motion.div className={styles.msSide} aria-hidden="true" style={reduced ? undefined : { y: ghostY }}>
        <div className={styles.msIndex}>{pad2(index + 1)}</div>
        <MilestoneFigure index={index} className={styles.msFigure} />
        {item.note && <div className={styles.msNote}>{item.note}</div>}
      </motion.div>
      <motion.div
        className={styles.msContent}
        initial={reduced ? false : { opacity: 0, x: alt ? 48 : -48 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 700 }}
      >
        <div className={styles.msMetaRow}>
          <MotionBadge
            variant="secondary"
            shape="rounded"
            size="sm"
            className={styles.msTag}
            animate={passed && !reduced ? { scale: [1.4, 1], rotate: [-4, 0] } : undefined}
            transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
          >
            {item.tag}
          </MotionBadge>
          <span>{item.date}</span>
        </div>
        <h3 className={styles.msTitle}>
          {item.title}
          <span className={styles.msTitleAccent}>{item.titleAccent}</span>
        </h3>
        <p className={styles.msBody}>{item.body}</p>
        <div className={styles.msPills}>
          {item.pills.map((pill) => (
            <CountPill key={pill} label={pill} active={passed} reduced={reduced} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/** Tech cell：hover 展開、click 釘選 */
function TechCell({ item, tip }: { item: (typeof techItems)[number]; tip: string }) {
  const [pinned, setPinned] = useState(false);

  return (
    <button
      type="button"
      className={classNames(styles.techCell, pinned && styles.pinned)}
      aria-pressed={pinned}
      onClick={() => setPinned((p) => !p)}
    >
      <span className={styles.techRole}>{item.role}</span>
      <span className={styles.techName}>{item.name}</span>
      <span className={styles.techTip}>{tip}</span>
    </button>
  );
}

function About() {
  const { t } = useTranslation('about');
  const navigate = useNavigate();
  const reduced = useReducedMotion() ?? false;

  const raw = t('milestones.items', { returnObjects: true });
  // TODO: sentry — log when i18n fails to return array (locale load failure)
  const milestoneItems = Array.isArray(raw) ? (raw as MilestoneItem[]) : [];

  // ── Hero 標題位移 ──
  const { scrollY } = useScroll();
  const heroShift = useTransform(scrollY, [0, 600], [0, 70]);
  const heroShiftNeg = useTransform(heroShift, (v) => -v);
  const heroFade = useTransform(scrollY, [0, 600], [1, 0.15]);

  // ── 主軸線 ──
  const spineRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: spineRef,
    offset: [`start ${SCROLL_ANCHOR}`, `end ${SCROLL_ANCHOR}`],
  });
  const fillHeight = useTransform(scrollYProgress, (v) => `${v * 100}%`);

  // ── 心跳加速（捲動速度 → pointer 光暈）──
  const velocity = useVelocity(scrollY);
  const beat = useSpring(useTransform(velocity, [-1500, 0, 1500], [1, 0, 1]), {
    stiffness: 200,
    damping: 30,
  });
  const headScale = useTransform(beat, [0, 1], [1, 1.4]);
  const headShadow = useTransform(
    beat,
    [0, 1],
    ['0 0 14px rgba(99, 91, 255, 0.35)', '0 0 40px rgba(99, 91, 255, 0.55)'],
  );

  // ── 逐站點亮：量測各節點在主軸上的百分比位置 ──
  const entryRefs = useRef<(HTMLDivElement | null)[]>([]);
  const memberRefs = useRef<(HTMLDivElement | null)[]>([]);
  const entryThresholds = useRef<number[]>([]);
  const memberThresholds = useRef<number[]>([]);
  const [passedEntries, setPassedEntries] = useState<boolean[]>([]);
  const [passedMembers, setPassedMembers] = useState<boolean[]>([]);
  const [eofLit, setEofLit] = useState(false);

  const measure = useCallback(() => {
    const spine = spineRef.current;
    if (!spine) return;
    const rect = spine.getBoundingClientRect();
    entryThresholds.current = entryRefs.current.map((el) =>
      el ? (el.getBoundingClientRect().top - rect.top + 20) / rect.height : 1,
    );
    memberThresholds.current = memberRefs.current.map((el) => {
      if (!el) return 1;
      const r = el.getBoundingClientRect();
      return (r.top - rect.top + r.height * 0.5) / rect.height;
    });
  }, []);

  // 捲動每幀都會觸發，旗標沒變就沿用舊陣列，避免整頁跟著重渲染
  const syncPassed = useCallback((v: number) => {
    const entries = entryThresholds.current.map((th) => v >= th);
    const members = memberThresholds.current.map((th) => v >= th);
    setPassedEntries((prev) => (sameFlags(prev, entries) ? prev : entries));
    setPassedMembers((prev) => (sameFlags(prev, members) ? prev : members));
    setEofLit(v > 0.995);
  }, []);

  useMotionValueEvent(scrollYProgress, 'change', syncPassed);

  // 圖片、字型晚載入或視窗縮放都會改變主軸尺寸，重新量測並依目前進度更新點亮狀態
  useEffect(() => {
    const spine = spineRef.current;
    if (!spine) return;
    const update = () => {
      measure();
      syncPassed(scrollYProgress.get());
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(spine);
    return () => observer.disconnect();
  }, [measure, syncPassed, scrollYProgress, milestoneItems.length]);

  // ── Pointer head 拖曳 scrubbing ──
  const dragState = useRef<{ top: number; height: number } | null>(null);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const st = dragState.current;
      if (!st) return;
      const anchor = window.innerHeight * SCROLL_ANCHOR;
      const p = Math.min(1, Math.max(0, (e.clientY + window.scrollY - st.top) / st.height));
      window.scrollTo({ top: st.top - anchor + p * st.height, behavior: 'instant' });
    };
    // 觸控被系統手勢打斷時只會收到 pointercancel / lostpointercapture，也要結束拖曳
    const endEvents = ['pointerup', 'pointercancel', 'lostpointercapture', 'blur'] as const;
    const onEnd = () => {
      dragState.current = null;
    };
    window.addEventListener('pointermove', onMove);
    endEvents.forEach((type) => window.addEventListener(type, onEnd));
    return () => {
      window.removeEventListener('pointermove', onMove);
      endEvents.forEach((type) => window.removeEventListener(type, onEnd));
    };
  }, []);

  const onHeadPointerDown = (e: React.PointerEvent) => {
    const spine = spineRef.current;
    if (!spine) return;
    const rect = spine.getBoundingClientRect();
    dragState.current = { top: rect.top + window.scrollY, height: rect.height };
    (e.target as Element).setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const historyInView = useInView(historyRef, { amount: 0.05 });
  const activeEntry = passedEntries.lastIndexOf(true);

  const scrollToEntry = (i: number) => {
    entryRefs.current[i]?.scrollIntoView({
      behavior: reduced ? 'auto' : 'smooth',
      block: 'center',
    });
  };

  const marqueeGroup = (key: string) => (
    <span className={styles.marqueeGroup} key={key}>
      {marqueeItems.map((item, i) => (
        <span className={styles.marqueeItem} key={i}>
          {item}
        </span>
      ))}
    </span>
  );

  return (
    <div className={styles.about}>
      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <h1 className={styles.heroTitle}>
            <motion.span
              className={styles.line}
              style={reduced ? undefined : { x: heroShiftNeg, opacity: heroFade }}
            >
              {t('hero.title')}
            </motion.span>
            <motion.span
              className={styles.line}
              style={reduced ? undefined : { x: heroShift, opacity: heroFade }}
            >
              <span className={styles.accent}>{t('hero.titleAccent')}</span>
              {t('hero.titleSuffix')}
            </motion.span>
          </h1>
          <p className={styles.heroStory}>{t('hero.story')}</p>
          <HeroPulse
            reduced={reduced}
            label={t('hero.pulseLabel')}
            hint={t('hero.pulseHint')}
            hintTouch={t('hero.pulseHintTouch')}
          />
        </div>
      </section>

      {/* ── 跑馬燈 ── */}
      <div className={styles.marquee} aria-hidden="true">
        <div className={styles.marqueeTrack}>
          {marqueeGroup('a')}
          {marqueeGroup('b')}
        </div>
      </div>

      {/* ── 主軸線：TEAM + HISTORY ── */}
      <div className={styles.spine} ref={spineRef}>
        <div className={styles.spineTrack} aria-hidden="true">
          {/* 終點方塊放在 track 內、fill 之前，游標抵達時疊在它上面 */}
          <span className={classNames(styles.spineEnd, eofLit && styles.lit)} />
          <motion.div className={styles.spineFill} style={{ height: fillHeight }}>
            <motion.div
              className={styles.spineHead}
              style={
                reduced
                  ? undefined
                  : { scale: headScale, boxShadow: headShadow, rotate: 45 }
              }
              onPointerDown={onHeadPointerDown}
            >
              <span />
            </motion.div>
          </motion.div>
        </div>

        {/* CORE TEAM */}
        <section className={styles.team}>
          <div className={styles.container}>
            <h2 className={styles.srOnly}>{t('team.title')}</h2>
            <div className={styles.teamRows}>
              {teamMembers.map((member, i) => (
                <MemberRow
                  key={member.memberKey}
                  member={member}
                  index={i}
                  passed={passedMembers[i] ?? false}
                  reduced={reduced}
                  refCb={(el) => {
                    memberRefs.current[i] = el;
                  }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* BUILD HISTORY */}
        <section className={styles.history} ref={historyRef}>
          <div className={styles.container}>
            <div className={styles.historyHead}>
              <h2 className={styles.historyTitle}>
                {t('milestones.title')}
                <br />
                <span className={styles.accent}>{t('milestones.titleAccent')}</span>
              </h2>
            </div>
            <div className={styles.timeline}>
              {milestoneItems.map((item, i) => (
                <MilestoneEntry
                  key={item.tag}
                  item={item}
                  index={i}
                  alt={i % 2 === 1}
                  passed={passedEntries[i] ?? false}
                  reduced={reduced}
                  refCb={(el) => {
                    entryRefs.current[i] = el;
                  }}
                />
              ))}
            </div>
          </div>

          {/* 右側 dot 導航（desktop） */}
          <nav
            className={classNames(styles.dotNav, historyInView && styles.show)}
            aria-label={t('milestones.navLabel')}
          >
            {milestoneItems.map((item, i) => {
              const dotLabel = `${item.tag} ${item.title}${item.titleAccent}`;
              return (
                <button
                  key={item.tag}
                  type="button"
                  className={classNames(styles.dotNavItem, activeEntry === i && styles.active)}
                  aria-label={dotLabel}
                  onClick={() => scrollToEntry(i)}
                >
                  <span className={styles.dotNavLabel}>{dotLabel}</span>
                </button>
              );
            })}
          </nav>

          {/* 左下角 REC 監測器 */}
          <div
            className={classNames(styles.phaseMonitor, historyInView && !eofLit && styles.show)}
            aria-hidden="true"
          >
            <span className={styles.monitorDot} />
            <span>REC</span>
            {/* key 換字時觸發 150ms 微滑入，避免瞬間跳字 */}
            <motion.strong
              key={activeEntry}
              initial={reduced ? false : { opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            >
              {activeEntry >= 0 && milestoneItems[activeEntry]
                ? `${milestoneItems[activeEntry].tag} · ${milestoneItems[activeEntry].date}`
                : `${milestoneItems[0]?.tag ?? ''} · ${milestoneItems[0]?.date ?? ''}`}
            </motion.strong>
          </div>
        </section>

        <div className={styles.spineTail} aria-hidden="true">
          <span className={styles.spineEndNote}>{t('cta.eofNote')}</span>
        </div>
      </div>

      {/* ── TECH STACK ── */}
      <section className={styles.tech}>
        <div className={styles.container}>
          <div className={styles.techHead}>
            <h2 className={styles.techTitle}>
              {t('techStack.title')}
              <span className={styles.accent}>{t('techStack.titleAccent')}</span>
            </h2>
            <p className={styles.techDesc}>{t('techStack.desc')}</p>
          </div>
          <div className={styles.techRow}>
            {techItems.map((item) => (
              <TechCell key={item.name} item={item} tip={t(`techStack.items.${item.tipKey}`)} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.ctaWrap}>
        <div className={styles.container}>
          <div className={styles.cta}>
            <div className={styles.ctaPulse} aria-hidden="true">
              <svg viewBox="0 0 1200 40" preserveAspectRatio="none">
                <path d={CTA_PULSE_PATH} />
              </svg>
            </div>
            <h2 className={styles.ctaTitle}>{t('cta.title')}</h2>
            <p className={styles.ctaDesc}>{t('cta.desc')}</p>
            <div className={styles.ctaLink}>
              <Button variant="primary" size="lg" onClick={() => navigate('/tutorial')}>
                {t('cta.button')}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
