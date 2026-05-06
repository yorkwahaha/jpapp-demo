#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const EXPECTED_COUNT = 28;
const dataPath = path.resolve(__dirname, "../assets/data/spirits.v1.json");

function looksJapanese(line) {
  return /[\u3040-\u309F\u30A0-\u30FF]/.test(String(line || ""));
}

function looksChineseSecondLine(line) {
  const text = String(line || "");
  const kanaCount = (text.match(/[\u3040-\u309F\u30A0-\u30FF]/g) || []).length;
  const cjkCount = (text.match(/[\u4E00-\u9FFF]/g) || []).length;
  if (text.trim() === "") return false;
  if (cjkCount === 0 && kanaCount > 0) return false;
  if (kanaCount >= 6 && kanaCount > cjkCount) return false;
  return true;
}

function collectUndefinedLikePaths(value, basePath = "spirit") {
  const out = [];
  if (value === undefined || value === null) {
    out.push(basePath);
    return out;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "" || trimmed === "undefined" || trimmed === "null") out.push(basePath);
    return out;
  }
  if (Array.isArray(value)) {
    value.forEach((v, i) => {
      out.push(...collectUndefinedLikePaths(v, `${basePath}[${i}]`));
    });
    return out;
  }
  if (typeof value === "object") {
    Object.entries(value).forEach(([k, v]) => {
      out.push(...collectUndefinedLikePaths(v, `${basePath}.${k}`));
    });
  }
  return out;
}

function pushIssue(issues, skillId, problemType, suggestion) {
  issues.push({
    skillId: skillId || "(missing skillId)",
    problemType,
    suggestion
  });
}

function runAudit() {
  const raw = fs.readFileSync(dataPath, "utf8");
  const spirits = JSON.parse(raw);
  if (!Array.isArray(spirits)) {
    throw new Error("spirits.v1.json root must be an array");
  }

  const issues = [];
  const rows = [];
  const skillIdCountMap = Object.create(null);

  spirits.forEach((spirit, idx) => {
    const skillId = String(spirit?.skillId || "").trim();
    const lines = Array.isArray(spirit?.trueResonanceLines) ? spirit.trueResonanceLines : null;
    const line1 = lines?.[0] ?? "";
    const line2 = lines?.[1] ?? "";
    const hasTa = JSON.stringify(spirit).includes("牠");
    const undefinedLikePaths = collectUndefinedLikePaths(spirit, "spirit");

    if (!skillId) {
      pushIssue(issues, `#${idx}`, "missing_skillId", "補上 skillId");
    } else {
      skillIdCountMap[skillId] = (skillIdCountMap[skillId] || 0) + 1;
    }

    if (!lines) {
      pushIssue(issues, skillId, "missing_trueResonanceLines", "補上 trueResonanceLines（至少 2 行）");
    } else {
      if (lines.length < 2) {
        pushIssue(issues, skillId, "trueResonanceLines_too_short", "至少提供 2 行（第1日文、第2中文）");
      }
      if (!looksJapanese(line1)) {
        pushIssue(issues, skillId, "line1_not_japanese_like", "第 1 行加入自然日文（含平假名/片假名）");
      }
      if (!looksChineseSecondLine(line2)) {
        pushIssue(issues, skillId, "line2_not_chinese_like", "第 2 行改為中文輔助，避免大量假名");
      }
    }

    if (!String(spirit?.trueResonanceTitleZh || "").trim()) {
      pushIssue(issues, skillId, "missing_trueResonanceTitleZh", "補上 trueResonanceTitleZh");
    }
    if (!String(spirit?.trueResonanceTitleJa || "").trim()) {
      pushIssue(issues, skillId, "missing_trueResonanceTitleJa", "補上 trueResonanceTitleJa");
    }
    if (!String(spirit?.trueResonanceBadge || "").trim()) {
      pushIssue(issues, skillId, "missing_trueResonanceBadge", "補上 trueResonanceBadge");
    }
    if (hasTa) {
      pushIssue(issues, skillId, "contains_牠", "若指小助靈，改為「祂」");
    }
    if (undefinedLikePaths.length > 0) {
      pushIssue(
        issues,
        skillId,
        "contains_undefined_null_empty",
        `檢查空值欄位：${undefinedLikePaths.slice(0, 3).join(", ")}${undefinedLikePaths.length > 3 ? "..." : ""}`
      );
    }

    rows.push({
      skillId: skillId || `#${idx}`,
      hasLines: !!lines,
      lineCount: lines?.length || 0,
      line1LooksJa: looksJapanese(line1),
      line2LooksZh: looksChineseSecondLine(line2),
      hasTitleZh: !!String(spirit?.trueResonanceTitleZh || "").trim(),
      hasTitleJa: !!String(spirit?.trueResonanceTitleJa || "").trim(),
      hasBadge: !!String(spirit?.trueResonanceBadge || "").trim(),
      hasTa
    });
  });

  Object.entries(skillIdCountMap).forEach(([skillId, count]) => {
    if (count > 1) {
      pushIssue(issues, skillId, "duplicate_skillId", `skillId 重複 ${count} 次，請合併或更正`);
    }
  });

  const uniqueSkillIdCount = Object.keys(skillIdCountMap).length;
  if (uniqueSkillIdCount !== EXPECTED_COUNT) {
    pushIssue(issues, "-", "skillId_count_mismatch", `目前 ${uniqueSkillIdCount}，預期 ${EXPECTED_COUNT}`);
  }

  const summary = {
    expectedCount: EXPECTED_COUNT,
    spiritRows: spirits.length,
    uniqueSkillIdCount,
    issueCount: issues.length
  };

  console.log("[audit-true-resonance-data] summary");
  console.table([summary]);
  console.table(rows);

  if (issues.length === 0) {
    console.log(`True resonance data audit passed: ${EXPECTED_COUNT}/${EXPECTED_COUNT}`);
    return 0;
  }

  console.warn("[audit-true-resonance-data] issues found");
  console.table(issues);
  return 1;
}

try {
  const code = runAudit();
  process.exitCode = code;
} catch (err) {
  console.error("[audit-true-resonance-data] failed:", err.message);
  process.exitCode = 1;
}
