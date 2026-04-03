import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useScroll, useTransform } from 'motion/react';
import classNames from 'classnames';
import Avatar from '@/shared/components/Avatar';
import Badge from '@/shared/components/Badge';
import Card from '@/shared/components/Card';
import Divider from '@/shared/components/Divider';
import Icon from '@/shared/components/Icon';
import styles from './About.module.scss';

const teamMembers = [
  {
    id: "0x5A12",
    tag: "ARCHITECT_01",
    name: "JULIAN TEE",
    memberKey: "julian" as const,
    avatar: "/images/teamAvatar.png",
    align: "left" as const,
  },
  {
    id: "0x6B33",
    tag: "INTERACTIVE_01",
    name: "KAI",
    memberKey: "kai" as const,
    avatar: "/images/teamAvatar.png",
    align: "right" as const,
  },
  {
    id: "0x8C45",
    tag: "VISUAL_01",
    name: "KENNY",
    memberKey: "kenny" as const,
    avatar: "/images/teamAvatar.png",
    align: "left" as const,
  },
];

const techStack = [
  { icon: 'code' as const, label: 'REACT_19.X' },
  { icon: 'chart-bar' as const, label: 'D3_JS_VIZ' },
  { icon: 'diagram-project' as const, label: 'TYPESCRIPT_LS' },
  { icon: 'wave-square' as const, label: 'RUST_WASM' },
  { icon: 'layer-group' as const, label: 'WEBGL_ENV' },
];

function About() {
  const { t } = useTranslation('about');
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <div ref={containerRef} className={styles.about}>
      {/* Background Grid */}
      <div className={styles.bgGrid} />

      {/* Central Pointer Line Track */}
      <div className={styles.centerTrack}>
        <motion.div
          className={styles.centerLine}
          style={{ height: lineHeight }}
        >
          <div className={styles.pointerHead}>
            <div className={styles.pointerDot} />
          </div>
        </motion.div>
      </div>

      <div className={styles.container}>
        {/* [HEAD] Node */}
        <div className={styles.hero}>
          <div className={styles.nodeMarker} />
          <div className={styles.heroAddress}>[HEAD] 0x4001</div>
          <div className={styles.heroSubLabel}>CORE_OBJECTIVE_STORY</div>
          <h1 className={styles.heroTitle}>
            {t("hero.title")} <br />
            <span className={styles.heroTitleAccent}>
              {t("hero.titleAccent")}
            </span>{" "}
            {t("hero.titleSuffix")}
          </h1>
          <div className={styles.heroDesc}>{t("hero.desc")}</div>
        </div>

        {/* EST Line */}
        <Divider label="EST_2025.06" color="light" className={styles.divider} />

        {/* Features */}
        <div className={styles.features}>
          <div className={styles.nodeMarker} />
          <Card
            icon={<Icon name="layer-group" decorative />}
            title={t("features.visualLogic.title")}
            description={t("features.visualLogic.desc")}
            hoverable={false}
            className={styles.featureCard}
          />
          <Card
            icon={<Icon name="code" decorative />}
            title={t("features.interactiveLearning.title")}
            description={t("features.interactiveLearning.desc")}
            hoverable={false}
            className={styles.featureCard}
          />
        </div>

        {/* Team Members */}
        <div className={styles.team}>
          {teamMembers.map((member) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0.3, filter: "grayscale(100%)" }}
              whileInView={{ opacity: 1, filter: "grayscale(0%)" }}
              viewport={{ once: false, margin: "-35% 0px -35% 0px" }}
              transition={{ duration: 0.4 }}
              className={styles.memberRow}
            >
              {/* Center node + connector */}
              <div className={styles.memberCenterNode} />
              <div
                className={classNames(
                  styles.memberConnector,
                  member.align === "left"
                    ? styles.memberConnectorLeft
                    : styles.memberConnectorRight,
                )}
              />

              {/* Left Column */}
              <div
                className={classNames(styles.memberCol, styles.memberColLeft)}
              >
                {member.align === "left" ? (
                  <div className={styles.avatarFrame}>
                    <Avatar
                      src={member.avatar}
                      username={member.name}
                      shape="square"
                      size="xl"
                      className={styles.avatarImage}
                    />
                    <div className={styles.avatarCornerTL} />
                    <div className={styles.avatarCornerTR} />
                    <div className={styles.avatarCornerBL} />
                    <div className={styles.avatarCornerBR} />
                  </div>
                ) : (
                  <div
                    className={classNames(
                      styles.memberInfo,
                      styles.memberInfoRight,
                    )}
                  >
                    <Badge
                      variant="secondary"
                      size="xs"
                      shape="square"
                      className={styles.memberTag}
                    >
                      {member.tag}
                    </Badge>
                    <h2 className={styles.memberName}>{member.name}</h2>
                    <div
                      className={classNames(
                        styles.memberMeta,
                        styles.memberMetaRight,
                      )}
                    >
                      <span>
                        [{t(`team.members.${member.memberKey}.role`)}]
                      </span>{" "}
                      {member.id}
                    </div>
                    <div
                      className={classNames(
                        styles.memberCommit,
                        styles.memberCommitRight,
                      )}
                    >
                      <span className={styles.commitPrefix}>commit -m</span>{" "}
                      &quot;{t(`team.members.${member.memberKey}.bio`)}&quot;
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div
                className={classNames(styles.memberCol, styles.memberColRight)}
              >
                {member.align === "left" ? (
                  <div className={styles.memberInfo}>
                    <Badge
                      variant="secondary"
                      size="xs"
                      shape="square"
                      className={styles.memberTag}
                    >
                      {member.tag}
                    </Badge>
                    <h2 className={styles.memberName}>{member.name}</h2>
                    <div className={styles.memberMeta}>
                      <span>
                        [{t(`team.members.${member.memberKey}.role`)}]
                      </span>{" "}
                      {member.id}
                    </div>
                    <div className={styles.memberCommit}>
                      <span className={styles.commitPrefix}>commit -m</span>{" "}
                      &quot;{t(`team.members.${member.memberKey}.bio`)}&quot;
                    </div>
                  </div>
                ) : (
                  <div className={styles.avatarFrame}>
                    <Avatar
                      src={member.avatar}
                      username={member.name}
                      shape="square"
                      size="xl"
                      className={styles.avatarImage}
                    />
                    <div className={styles.avatarCornerTL} />
                    <div className={styles.avatarCornerTR} />
                    <div className={styles.avatarCornerBL} />
                    <div className={styles.avatarCornerBR} />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tech Stack */}
        <div className={styles.techStack}>
          <div className={styles.nodeMarker} />
          <div className={styles.techLabel}>{t(`techStack.label`)}</div>
          <div className={styles.techList}>
            {techStack.map((tech, i) => (
              <div key={i} className={styles.techItem}>
                <div className={styles.techIcon}>
                  <Icon name={tech.icon} decorative />
                </div>
                <div className={styles.techName}>{tech.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* [NULL] Node */}
        <div className={styles.nullNode}>
          <div className={styles.nodeMarker} style={{ top: "-0.25rem" }} />
          <div className={styles.nullLabel}>[NULL] 0x0000</div>
        </div>
      </div>
    </div>
  );
}

export default About;
