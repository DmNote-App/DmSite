export type RecordItem = {
  title: number;
  name: string;
  dlc: string;
  dlcCode?: string;
  button: number;
  pattern: string;
  score: number;
  maxCombo: number;
  djpower: number;
  rating: number;
  updatedAt: Date;
};

export type DlcSummary = {
  name: string;
  count: number;
  tierPointSum: number;
};

export type TopDjpowerRecord = {
  button: number;
  title: number;
  name: string;
  pattern: string;
  dlc: string;
  djpower: number;
  score: number;
  updatedAt: Date;
};

export type RecapStats = {
  totalRecords: number;
  averageRate: number;
  maxRate: number;
  maxComboCount: number;
  perfectCount: number;
  topTierPointDlc: DlcSummary | null;
  buttonCounts: Record<number, number>;
  buttonRatios: Record<number, number>;
  topDjpowerByButton: Record<number, TopDjpowerRecord | null>;
};

// Display labels aligned with V_ARCHIVE_DOCS/DB/dlc_classification.md using in-game strings.
const DLC_CODE_TO_FULL_NAME: Record<string, string> = {
  R: "RESPECT",
  RV: "RESPECT/V",
  P1: "PORTABLE 1",
  P2: "PORTABLE 2",
  GG: "GUILTY GEAR",
  CP: "CLEAR PASS",
  ES: "EMOTIONAL S.",
  TR: "TRILOGY",
  CE: "CLAZZIQUAI",
  BS: "BLACK SQUARE",
  T1: "TECHNIKA 1",
  T2: "TECHNIKA 2",
  T3: "TECHNIKA 3",
  P3: "PORTABLE 3",
  TQ: "TECHNIKA T&Q",
  VE: "V EXTENSION",
  VE2: "V EXTENSION 2",
  VE3: "V EXTENSION 3",
  VE4: "V EXTENSION 4",
  VE5: "V EXTENSION 5",
  VL: "V LIBERTY",
  VL2: "V LIBERTY II",
  VL3: "V LIBERTY III",
  VL4: "V LIBERTY IV",
  GC: "GROOVE COASTER",
  DM: "DEEMO",
  CY: "CYTUS",
  CHU: "CHUNITHM",
  MD: "MUSE DASH",
  EZ2: "EZ2ON",
  ARC: "ARCAEA",
  GF: "GIRLS' FRONTLINE",
  ESTI: "ESTi",
  NXN: "NEXON",
  MAP: "MAPLESTORY",
  FAL: "FALCOM",
  TEK: "TEKKEN",
  BA: "BLUE ARCHIVE",
  PLI1: "PLI: TRIBUTE Vol.1",
  PLI2: "PLI: 64514 Part.1"
};

function resolveDlcFullName(record: Pick<RecordItem, "dlc" | "dlcCode">): string | null {
  const code = record.dlcCode?.trim();
  if (code && DLC_CODE_TO_FULL_NAME[code]) {
    return DLC_CODE_TO_FULL_NAME[code];
  }
  return record.dlc || code || null;
}

function resolveDlcShortName(record: Pick<RecordItem, "dlc" | "dlcCode">): string | null {
  const code = record.dlcCode?.trim();
  return code || record.dlc || null;
}

export function deriveRecapStats(
  records: RecordItem[],
  buttons: number[]
): RecapStats {
  const buttonCounts: Record<number, number> = Object.fromEntries(
    buttons.map((button) => [button, 0])
  );
  const buttonRatios: Record<number, number> = Object.fromEntries(
    buttons.map((button) => [button, 0])
  );
  const topDjpowerByButton: Record<number, TopDjpowerRecord | null> =
    Object.fromEntries(buttons.map((button) => [button, null]));

  let scoreSum = 0;
  let maxRate = 0;
  let maxComboCount = 0;
  let perfectCount = 0;

  const dlcCounts = new Map<
    string,
    { count: number; tierPointSum: number; latestAt: Date }
  >();

  for (const record of records) {
    const dlcName = resolveDlcFullName(record);
    scoreSum += record.score;
    if (record.score > maxRate) {
      maxRate = record.score;
    }
    if (record.maxCombo === 1) {
      maxComboCount += 1;
    }
    if (record.score === 100) {
      perfectCount += 1;
    }

    buttonCounts[record.button] = (buttonCounts[record.button] ?? 0) + 1;

    if (dlcName) {
      const existing = dlcCounts.get(dlcName);
      if (existing) {
        existing.count += 1;
        existing.tierPointSum += record.rating;
        if (record.updatedAt > existing.latestAt) {
          existing.latestAt = record.updatedAt;
        }
      } else {
        dlcCounts.set(dlcName, {
          count: 1,
          tierPointSum: record.rating,
          latestAt: record.updatedAt
        });
      }
    }

    const currentTop = topDjpowerByButton[record.button];
    if (
      !currentTop ||
      record.djpower > currentTop.djpower ||
      (record.djpower === currentTop.djpower &&
        record.updatedAt > currentTop.updatedAt)
    ) {
      topDjpowerByButton[record.button] = {
        button: record.button,
        title: record.title,
        name: record.name,
        pattern: record.pattern,
        dlc: resolveDlcShortName(record) ?? record.dlc,
        djpower: record.djpower,
        score: record.score,
        updatedAt: record.updatedAt
      };
    }
  }

  const totalRecords = records.length;
  if (totalRecords > 0) {
    for (const button of buttons) {
      const count = buttonCounts[button] ?? 0;
      buttonRatios[button] = (count / totalRecords) * 100;
    }
  }

  let topTierPointDlc: DlcSummary | null = null;
  for (const [name, info] of dlcCounts.entries()) {
    if (!topTierPointDlc) {
      topTierPointDlc = {
        name,
        count: info.count,
        tierPointSum: info.tierPointSum
      };
      continue;
    }
    if (info.tierPointSum > topTierPointDlc.tierPointSum) {
      topTierPointDlc = {
        name,
        count: info.count,
        tierPointSum: info.tierPointSum
      };
      continue;
    }
    if (info.tierPointSum === topTierPointDlc.tierPointSum) {
      if (info.count > topTierPointDlc.count) {
        topTierPointDlc = {
          name,
          count: info.count,
          tierPointSum: info.tierPointSum
        };
        continue;
      }
      if (info.count === topTierPointDlc.count) {
        const currentLatest = dlcCounts.get(topTierPointDlc.name)?.latestAt;
        if (currentLatest && info.latestAt > currentLatest) {
          topTierPointDlc = {
            name,
            count: info.count,
            tierPointSum: info.tierPointSum
          };
        } else if (!currentLatest) {
          topTierPointDlc = {
            name,
            count: info.count,
            tierPointSum: info.tierPointSum
          };
        } else if (info.latestAt.getTime() === currentLatest.getTime()) {
          if (name.localeCompare(topTierPointDlc.name) < 0) {
            topTierPointDlc = {
              name,
              count: info.count,
              tierPointSum: info.tierPointSum
            };
          }
        }
      }
    }
  }

  return {
    totalRecords,
    averageRate: totalRecords > 0 ? scoreSum / totalRecords : 0,
    maxRate,
    maxComboCount,
    perfectCount,
    topTierPointDlc,
    buttonCounts,
    buttonRatios,
    topDjpowerByButton
  };
}
