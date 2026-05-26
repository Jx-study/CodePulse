import { useTranslation } from 'react-i18next';
import { motion, useScroll, useTransform } from 'motion/react';
import classNames from 'classnames';
import Avatar from '@/shared/components/Avatar';
import Badge from '@/shared/components/Badge';
import Divider from '@/shared/components/Divider';
import styles from './About.module.scss';

const teamMembers = [
  {
    id: "0x5A12",
    name: "JULIAN TEE",
    memberKey: "julian" as const,
    avatar: "/images/teamAvatar.png",
    align: "left" as const,
  },
  {
    id: "0x6B33",
    name: "KAI",
    memberKey: "kai" as const,
    avatar: "/images/teamAvatar.png",
    align: "right" as const,
  },
  {
    id: "0x8C45",
    name: "KENNY",
    memberKey: "kenny" as const,
    avatar: "/images/teamAvatar.png",
    align: "left" as const,
  },
];

const techItems = [
  { name: 'React 19', role: 'UI_RUNTIME' },
  { name: 'TypeScript 5', role: 'TYPE_SAFETY' },
  { name: 'D3 + Cytoscape', role: 'VIZ_ENGINE' },
  { name: 'Flask', role: 'BACKEND_CORE' },
  { name: 'PostgreSQL', role: 'DATABASE' },
];

type MilestoneItem = {
  tag: string;
  date: string;
  title: string;
  titleAccent: string;
  body: string;
  pills: string[];
};

function About() {
  const { t } = useTranslation('about');
  const { scrollYProgress } = useScroll();

  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const raw = t('milestones.items', { returnObjects: true });
  // TODO: sentry — log when i18n fails to return array (locale load failure)
  const milestoneItems = Array.isArray(raw) ? (raw as MilestoneItem[]) : [];

  return (
    <div className={styles.about}>
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
          <h1 className={styles.heroTitle}>
            {t("hero.title")} <br />
            <span className={styles.heroTitleAccent}>
              {t("hero.titleAccent")}
            </span>{" "}
            {t("hero.titleSuffix")}
          </h1>
        </div>

        {/* EST Line */}
        <Divider label="EST_2025.06" color="light" className={styles.divider} />

        {/* Team Members */}
        <div className={styles.team}>
          <div className={styles.sectionLabel}>{t('team.sectionLabel')}</div>
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
              <div className={classNames(styles.memberCol, styles.memberColLeft)}>
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
                  <div className={classNames(styles.memberInfo, styles.memberInfoRight)}>
                    <h2 className={styles.memberName}>{member.name}</h2>
                    <div className={classNames(styles.memberMeta, styles.memberMetaRight)}>
                      <span>[{t(`team.members.${member.memberKey}.role`)}]</span>{" "}
                      {member.id}
                    </div>
                    <div className={classNames(styles.memberCommit, styles.memberCommitRight)}>
                      <span className={styles.commitPrefix}>commit -m</span>{" "}
                      &quot;{t(`team.members.${member.memberKey}.bio`)}&quot;
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className={classNames(styles.memberCol, styles.memberColRight)}>
                {member.align === "left" ? (
                  <div className={styles.memberInfo}>
                    <h2 className={styles.memberName}>{member.name}</h2>
                    <div className={styles.memberMeta}>
                      <span>[{t(`team.members.${member.memberKey}.role`)}]</span>{" "}
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
        <div className={styles.techSection}>
          <div className={styles.nodeMarker} />
          <div className={styles.sectionLabel}>{t("techStack.sectionLabel")}</div>
          <div className={styles.techStack}>
          <div className={styles.techLeft}>
            <div className={styles.techTitle}>
              {t("techStack.title")}{" "}
              <span className={styles.techTitleAccent}>{t("techStack.titleAccent")}</span>
            </div>
            <p className={styles.techDesc}>{t("techStack.desc")}</p>
          </div>
          <div className={styles.techGrid}>
            {techItems.map((item) => (
              <div key={item.name} className={styles.techCell}>
                <div className={styles.techCellName}>{item.name}</div>
                <div className={styles.techCellRole}>{item.role}</div>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* Milestones */}
        <div className={styles.features}>
          <div className={styles.nodeMarker} />
          <div className={styles.sectionLabel}>{t('milestones.sectionLabel')}</div>
          <div className={styles.milestoneSectionTitle}>
            {t('milestones.title')}{' '}
            <span className={styles.commitAccent}>{t('milestones.titleAccent')}</span>
          </div>
          {milestoneItems.map((item, index) => {
            const align = index % 2 === 0 ? 'left' : 'right';
            const header = (
              <div className={styles.commitHeader}>
                <div className={styles.commitMeta}>
                  <Badge variant="secondary" size="xs" shape="square" className={styles.commitTag}>
                    {item.tag}
                  </Badge>
                  <span className={styles.commitDate}>{item.date}</span>
                </div>
                <div className={styles.commitSubject}>
                  {item.title}{' '}
                  <span className={styles.commitAccent}>{item.titleAccent}</span>
                </div>
              </div>
            );
            const body = (
              <div className={styles.commitBodyGroup}>
                <p className={styles.commitBody}>{item.body}</p>
                <div className={styles.commitFooter}>
                  {item.pills.map((pill) => (
                    <span key={pill} className={styles.commitStat}>{pill}</span>
                  ))}
                </div>
              </div>
            );
            return (
              <div
                key={item.tag}
                className={classNames(
                  styles.commitEntry,
                  align === 'left' ? styles.commitEntryLeft : styles.commitEntryRight,
                )}
              >
                {align === 'left' ? (
                  <>
                    <div className={classNames(
                      styles.commitSlot,
                      styles.commitSlotLeft,
                      styles.commitHeaderSlot,
                    )}
                    >
                      {header}
                    </div>
                    <div className={styles.commitRailSpacer} />
                    <div className={styles.commitRail}>
                      <div className={styles.commitCenterNode} />
                    </div>
                    <div className={classNames(
                      styles.commitSlot,
                      styles.commitSlotLeft,
                      styles.commitBodySlot,
                      styles.commitSlotActive,
                    )}
                    >
                      {body}
                    </div>
                  </>
                ) : (
                  <>
                    <div className={classNames(
                      styles.commitSlot,
                      styles.commitSlotRight,
                      styles.commitHeaderSlot,
                    )}
                    >
                      {header}
                    </div>
                    <div className={styles.commitRailSpacer} />
                    <div className={styles.commitRail}>
                      <div className={styles.commitCenterNode} />
                    </div>
                    <div className={classNames(
                      styles.commitSlot,
                      styles.commitSlotRight,
                      styles.commitBodySlot,
                      styles.commitSlotActive,
                    )}
                    >
                      {body}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* [NULL] Node */}
        <div className={styles.nullNode}>
          <div className={classNames(styles.nodeMarker, styles.nullMarker)} />
          <div className={styles.nullLabel}>[NULL] 0x0000</div>
        </div>
      </div>
    </div>
  );
}

export default About;
