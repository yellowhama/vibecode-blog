import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { isAbsolute, resolve } from "node:path";

const DEFAULT_MANIFEST = "src/data/article-production-harness.json";
const DEFAULT_REPO_ROOT = process.cwd();
const DEFAULT_WIKI_ROOT =
  process.env.LLM_WIKI_ROOT ?? String.raw`F:\Aisaak\CompanyArtifacts\llm-wiki-completed`;
const DEFAULT_DECISIONS = "src/data/draft-editorial-decisions.json";
const DEFAULT_APPROVALS = "src/data/publication-approvals.json";

const REQUIRED_ROLES = [
  "source-scout",
  "packet-builder",
  "angle-strategist",
  "evidence-designer",
  "draft-writer",
  "reference-critic",
  "public-surface-editor",
  "rendered-qa",
  "publisher",
];

const REQUIRED_ROLE_FIELDS = [
  "id",
  "title",
  "purpose",
  "owns",
  "inputs",
  "outputs",
  "hardStops",
  "skills",
  "verification",
  "boundary",
];

const VALID_PATTERNS = new Set([
  "pipeline",
  "fan-out/fan-in",
  "expert-pool",
  "producer-reviewer",
  "supervisor",
  "hierarchical-delegation",
]);

const REQUIRED_SOURCE_REFS = [
  "companies/vibecode-town/sources/processed/revfactory-harness-function-extract.md",
  "companies/vibecode-town/sources/processed/revfactory-unreal-idol-function-extract.md",
];

const REQUIRED_WIKI_DOCS = [
  "companies/global/company-agent-registry.md",
  "companies/vibecode-town/content-cell-operating-model.md",
  "companies/vibecode-town/article-production-harness.md",
  "companies/vibecode-town/article-production-artifact-map.md",
  "companies/vibecode-town/harness-architecture-patterns.md",
];

const STALE_PUBLIC_SURFACE_PATTERNS = [
  /writing-pulse score/i,
  /hash approval text/i,
  /reference ceiling,\s*writing-pulse/i,
  /data-writing-pulse-score/i,
  /data-reference-score/i,
  /data-publication-approved/i,
  /first-screen evidence cards with matching image, source packet/i,
];

function getArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

async function exists(path) {
  try {
    await access(path, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function artifactPath(repoRoot, path) {
  if (/^[A-Za-z]:[\\/]/.test(path)) return path;
  if (isAbsolute(path)) return path;
  return resolve(repoRoot, path);
}

function parseMarkdown(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { frontmatter: "", body: text };
  return { frontmatter: match[1], body: match[2] };
}

function isDraft(frontmatter) {
  return /^draft:\s*true\s*$/m.test(frontmatter);
}

function validateRoles(manifest) {
  const failures = [];
  const roles = asArray(manifest.roles);
  const ids = roles.map((role) => role?.id).filter(Boolean);
  const uniqueIds = new Set(ids);

  for (const required of REQUIRED_ROLES) {
    if (!uniqueIds.has(required)) failures.push(`missing required role ${required}`);
  }
  for (const id of uniqueIds) {
    if (!REQUIRED_ROLES.includes(id)) failures.push(`unknown role ${id}`);
  }
  if (ids.length !== uniqueIds.size) failures.push("roles contain duplicate ids");

  const pipeline = asArray(manifest.pipelineOrder);
  if (JSON.stringify(pipeline) !== JSON.stringify(REQUIRED_ROLES)) {
    failures.push(`pipelineOrder must exactly match ${REQUIRED_ROLES.join(" -> ")}`);
  }

  for (const role of roles) {
    for (const field of REQUIRED_ROLE_FIELDS) {
      if (!(field in role)) failures.push(`${role?.id ?? "unknown role"} is missing ${field}`);
    }
    for (const field of ["purpose", "title"]) {
      if (!isNonEmptyString(role?.[field])) failures.push(`${role?.id ?? "unknown role"} has empty ${field}`);
    }
    for (const field of ["owns", "inputs", "outputs", "hardStops", "skills"]) {
      if (!Array.isArray(role?.[field]) || role[field].length === 0) {
        failures.push(`${role?.id ?? "unknown role"} must have non-empty ${field}`);
      }
    }
    if (!isNonEmptyString(role?.verification?.command)) {
      failures.push(`${role?.id ?? "unknown role"} must name a verification command`);
    }
    if (!isNonEmptyString(role?.boundary?.public) || !isNonEmptyString(role?.boundary?.private)) {
      failures.push(`${role?.id ?? "unknown role"} must define public/private boundary`);
    }
  }

  const writer = roles.find((role) => role.id === "draft-writer");
  const writerScope = [
    writer?.purpose,
    ...asArray(writer?.owns),
    ...asArray(writer?.outputs),
    ...asArray(writer?.skills),
  ].join(" ");
  if (/\b(critic|critique|publisher|publish|publication approval|approve publication)\b/i.test(writerScope)) {
    failures.push("draft-writer scope is collapsed with critic/publisher responsibilities");
  }
  if (writer?.hardStops?.join(" ").toLowerCase().includes("approve")) {
    if (!writer.hardStops.join(" ").toLowerCase().includes("cannot approve")) {
      failures.push("draft-writer hard stop must explicitly say it cannot approve its own work");
    }
  } else {
    failures.push("draft-writer hard stops must mention approval separation");
  }

  return failures;
}

function validateArchitecture(manifest) {
  const failures = [];
  const allowed = asArray(manifest.architecture?.allowedPatterns);
  for (const pattern of VALID_PATTERNS) {
    if (!allowed.includes(pattern)) failures.push(`architecture.allowedPatterns missing ${pattern}`);
  }
  for (const pattern of allowed) {
    if (!VALID_PATTERNS.has(pattern)) failures.push(`architecture.allowedPatterns includes unknown pattern ${pattern}`);
  }
  for (const stage of asArray(manifest.architecture?.defaultArticleLoop)) {
    if (!VALID_PATTERNS.has(stage.pattern)) failures.push(`${stage.stage ?? "unknown stage"} uses unknown pattern ${stage.pattern}`);
    for (const role of asArray(stage.roles)) {
      if (!REQUIRED_ROLES.includes(role)) failures.push(`${stage.stage ?? "unknown stage"} references unknown role ${role}`);
    }
  }
  return failures;
}

function validateSourceReferences(manifest) {
  const failures = [];
  const paths = asArray(manifest.sourceReferences).map((ref) => ref?.path);
  for (const required of REQUIRED_SOURCE_REFS) {
    if (!paths.includes(required)) failures.push(`sourceReferences missing ${required}`);
  }
  return failures;
}

async function validateTrackedArticles(manifest, repoRoot, decisionsPath, decisionsRefPrefix, approvalsPath) {
  const failures = [];
  const decisions = await readJson(decisionsPath);
  const approvals = (await exists(approvalsPath)) ? await readJson(approvalsPath) : { approvals: [] };
  const decisionItems = asArray(decisions.decisions);
  const approvalItems = asArray(approvals.approvals);

  for (const item of asArray(manifest.trackedArticles)) {
    const label = item?.slug ?? "unknown tracked article";
    if (!isNonEmptyString(item?.slug)) failures.push("trackedArticles entry missing slug");
    if (!isNonEmptyString(item?.sourceWorkflowSlug)) failures.push(`${label}: missing sourceWorkflowSlug`);
    if (!isNonEmptyString(item?.draftPath)) failures.push(`${label}: missing draftPath`);
    if (!isNonEmptyString(item?.decisionRef)) failures.push(`${label}: missing decisionRef`);
    if (typeof item?.publicPromotionAllowed !== "boolean") {
      failures.push(`${label}: publicPromotionAllowed must be boolean`);
    }
    if (JSON.stringify(asArray(item.lifecycleRoleOrder)) !== JSON.stringify(REQUIRED_ROLES)) {
      failures.push(`${label}: lifecycleRoleOrder must match article-production role order`);
    }

    const draftPath = artifactPath(repoRoot, item.draftPath ?? "");
    if (!(await exists(draftPath))) {
      failures.push(`${label}: draftPath is missing: ${item.draftPath}`);
    } else {
      const { frontmatter } = parseMarkdown(await readFile(draftPath, "utf8"));
      const publicationApproval = approvalItems.find((approval) => approval.slug === item.slug);
      if (!publicationApproval && !isDraft(frontmatter)) {
        failures.push(`${label}: tracked article without publication approval must remain draft: true`);
      }
    }

    const decision = decisionItems.find((entry) => entry.slug === item.slug);
    if (!decision) {
      failures.push(`${label}: missing draft editorial decision`);
    } else {
      const expectedRef = `${decisionsRefPrefix.replaceAll("\\", "/")}#${item.slug}`;
      if (item.decisionRef !== expectedRef) {
        failures.push(`${label}: decisionRef must be ${expectedRef}`);
      }
      if (decision.approvalCandidate === false && asArray(decision.candidateBlockers).length === 0) {
        failures.push(`${label}: non-candidate decision must list candidateBlockers`);
      }
      const approval = approvalItems.find((entry) => entry.slug === item.slug);
      if (item.publicPromotionAllowed && !approval) {
        failures.push(`${label}: publicPromotionAllowed=true requires publication approval`);
      }
      if (!item.publicPromotionAllowed && decision.decision === "promote_to_approval_candidate") {
        failures.push(`${label}: promoted decision cannot have publicPromotionAllowed=false`);
      }
    }

    for (const artifact of asArray(item.requiredArtifacts)) {
      if (!artifact.kind || !artifact.path) {
        failures.push(`${label}: requiredArtifacts entries need kind and path`);
        continue;
      }
      if (artifact.required && !(await exists(artifactPath(repoRoot, artifact.path)))) {
        failures.push(`${label}: required artifact missing: ${artifact.kind} ${artifact.path}`);
      }
    }
  }

  return failures;
}

async function validateWikiDocs(wikiRoot) {
  const failures = [];
  if (!(await exists(wikiRoot))) {
    return { failures, skipped: true };
  }

  for (const doc of REQUIRED_WIKI_DOCS) {
    const path = resolve(wikiRoot, doc);
    if (!(await exists(path))) {
      failures.push(`wiki doc missing ${doc}`);
      continue;
    }
    const text = await readFile(path, "utf8");
    if (doc.endsWith("content-cell-operating-model.md") || doc.endsWith("company-agent-registry.md")) {
      for (const role of [
        "Source Scout",
        "Packet Builder",
        "Angle Strategist",
        "Evidence Designer",
        "Draft Writer",
        "Reference Critic",
        "Public Surface Editor",
        "Rendered QA",
        "Publisher",
      ]) {
        if (!text.includes(role)) failures.push(`${doc}: missing role ${role}`);
      }
    }
    if (doc.endsWith("content-cell-operating-model.md")) {
      for (const pattern of STALE_PUBLIC_SURFACE_PATTERNS) {
        if (pattern.test(text)) failures.push(`${doc}: stale public-surface internal wording matched ${pattern}`);
      }
    }
  }

  return { failures, skipped: false };
}

async function main() {
  const repoRoot = resolve(getArg("--repo-root") ?? DEFAULT_REPO_ROOT);
  const manifestPath = resolve(repoRoot, getArg("--manifest") ?? DEFAULT_MANIFEST);
  const wikiRoot = resolve(getArg("--wiki-root") ?? DEFAULT_WIKI_ROOT);
  const decisionsPath = resolve(repoRoot, getArg("--decisions") ?? DEFAULT_DECISIONS);
  const decisionsRefPrefix = getArg("--decisions-ref") ?? getArg("--decisions") ?? DEFAULT_DECISIONS;
  const approvalsPath = resolve(repoRoot, getArg("--approvals") ?? DEFAULT_APPROVALS);
  const manifest = await readJson(manifestPath);

  const failures = [];
  if (manifest.schema !== "vibecode-article-production-harness/v1") {
    failures.push("manifest schema must be vibecode-article-production-harness/v1");
  }
  failures.push(...validateSourceReferences(manifest));
  failures.push(...validateArchitecture(manifest));
  failures.push(...validateRoles(manifest));
  failures.push(...await validateTrackedArticles(manifest, repoRoot, decisionsPath, decisionsRefPrefix, approvalsPath));
  const wiki = await validateWikiDocs(wikiRoot);
  failures.push(...wiki.failures);

  process.stdout.write(`article_production_harness_manifest=${manifestPath}\n`);
  process.stdout.write(`article_production_harness_roles_checked=${asArray(manifest.roles).length}\n`);
  process.stdout.write(`article_production_harness_tracked_articles=${asArray(manifest.trackedArticles).length}\n`);
  process.stdout.write(`article_production_harness_wiki_check=${wiki.skipped ? "skip" : "checked"}\n`);

  if (failures.length > 0) {
    process.stderr.write("Article production harness gate failed.\n");
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.stdout.write("article_production_harness_gate=fail\n");
    return 1;
  }

  process.stdout.write("article_production_harness_gate=pass\n");
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
