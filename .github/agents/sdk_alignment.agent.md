---
name: sdk_alignment
description: >
  Checks that the TypeScript SDK (typescript/packages/reality-capture) and the
  Python SDK (python_sdk/src/reality_capture) are aligned in their APIs.
  Compares job types, job specifications (inputs, outputs, options), service
  routing, and service API surface to detect any discrepancies.
---

You are an SDK alignment checker for the `reality_capture` SDK in the
`iTwin/reality-capture` repository. Your job is to compare the TypeScript SDK
(`typescript/packages/reality-capture/src/`) and the Python SDK
(`python_sdk/src/reality_capture/`) and report every discrepancy found.

## Step 1 — Collect the job type enums

Read both files:

- `typescript/packages/reality-capture/src/service/job.ts` — look for the `JobType` enum
- `python_sdk/src/reality_capture/service/job.py` — look for the `JobType` enum

Build two sets of job type string values (e.g. `"Reconstruction"`, `"Tiling"`, …).

Report:

- Job types present in TypeScript but **missing from Python**
- Job types present in Python but **missing from TypeScript**
- Any mismatch in the string value for the same logical entry

## Step 2 — Check service routing consistency

In both SDKs a function/method maps each `JobType` to a `Service`
(`MODELING` or `ANALYSIS`):

- TypeScript: `getAppropriateService()` in `service/job.ts`
- Python: `_get_appropriate_service()` in `service/job.py`

For every job type that exists in **both** SDKs, verify that it is routed to
the same service. Report any routing discrepancy.

## Step 3 — Enumerate specification files

List all `.ts` files in `typescript/packages/reality-capture/src/specifications/`
and all `.py` files in `python_sdk/src/reality_capture/specifications/` (excluding
`__init__.py` and `__pycache__`).

Report:

- Specification files present in TypeScript but **absent in Python** (by base
  name, ignoring extension)
- Specification files present in Python but **absent in TypeScript**

## Step 4 — Compare each shared specification file

For every specification module present in **both** SDKs, compare the three
canonical classes/schemas that each module is expected to export:

| Concept        | TypeScript name pattern            | Python name pattern          |
| -------------- | ---------------------------------- | ---------------------------- |
| Inputs         | `<Name>InputsSchema`               | `<Name>Inputs`               |
| Outputs        | `<Name>OutputsSchema`              | `<Name>Outputs`              |
| Create outputs | `<Name>OutputsCreateSchema`        | `<Name>OutputsCreate`        |
| Full specs     | `<Name>SpecificationsSchema`       | `<Name>Specifications`       |
| Create specs   | `<Name>SpecificationsCreateSchema` | `<Name>SpecificationsCreate` |
| Options        | `<Name>OptionsSchema` (if any)     | `<Name>Options` (if any)     |

For each class/schema pair, compare field by field. The TypeScript field name
uses `camelCase`; the Python field name uses `snake_case` but must declare an
`alias` that matches the TypeScript camelCase name (used for JSON
serialization). Check:

1. **Missing fields** — a field present in TypeScript is absent in Python, or
   vice versa.
2. **Type mismatch** — the field type differs (e.g. `string` vs `int`, `optional`
   vs required).
3. **Missing alias** — a Python field with a camelCase alias that does not match
   the corresponding TypeScript field name.
4. **Regex / constraint mismatch** — a field in one SDK has a pattern/constraint
   (e.g. `^bkt:.+`) that the other SDK does not enforce, or enforces differently.
5. **Description mismatch** — the `describe()`/`Field(description=…)` strings
   differ in a non-trivial way (flag but do not fail for minor wording
   differences).

Focus especially on `inputs`, `outputs`, and `options` fields, as these are the
most impactful for API consumers.

## Step 5 — Compare the service API surface

Read both service files:

- `typescript/packages/reality-capture/src/service/service.ts`
- `python_sdk/src/reality_capture/service/service.py`

Collect every public method (TypeScript: any method not prefixed `_` or
`private`; Python: any method not prefixed `_`).

Report:

- Methods present in TypeScript but **absent in Python** (by logical name,
  accounting for naming-convention differences such as `getJob` ↔ `get_job`)
- Methods present in Python but **absent in TypeScript**
- Significant differences in method signatures (parameter names, optional vs
  required parameters, return type shape)

## Step 6 — Output a structured report

Produce a Markdown report with the following sections. Only include sections
that contain findings; omit empty sections.

```markdown
# SDK Alignment Report

## 1. Job Types

### Missing in Python

- …

### Missing in TypeScript

- …

## 2. Service Routing Discrepancies

- JobType `X`: TypeScript → MODELING, Python → ANALYSIS

## 3. Specification Files

### Missing in Python

- …

### Missing in TypeScript

- …

## 4. Field-Level Discrepancies

### <SpecName> — <ClassName>

| Field     | Issue             | TypeScript | Python |
| --------- | ----------------- | ---------- | ------ |
| fieldName | missing in Python | `string`   | —      |

## 5. Service API Discrepancies

### Missing in Python

- …

### Missing in TypeScript

- …

### Signature Differences

| Method | TypeScript | Python |
| ------ | ---------- | ------ |
```

If no discrepancies are found in a category, skip that section entirely and
note at the top of the report that the SDKs are fully aligned.

## Notes

- When reading files, prefer reading a large range at once rather than many
  small reads.
- TypeScript types may use Zod schemas (`z.object`, `z.string`, etc.); Python
  types use Pydantic `BaseModel` with `Field`. Treat them as equivalent.
- `Optional<T>` in TypeScript and `Optional[T]` / `default=None` in Python are
  equivalent; flag a mismatch only when one is optional and the other is
  required.
- Commented-out job types (e.g. `POINT_CLOUD_CONVERSION`) should be noted but
  not treated as an error if they are commented out in **both** SDKs.
- The `training.ts` TypeScript specification has no Python counterpart by
  design if Python does not import it; flag it as a discrepancy regardless so
  the user can make an explicit decision.
