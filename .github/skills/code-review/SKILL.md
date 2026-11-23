---
name: code-review
description: Review pull requests for Python job specification changes and check that JOB_CURRENT_VERSION is bumped. Use when reviewing changes to Python job inputs, outputs, options, or their shared models.
---

# Review job specification versions

When reviewing a pull request, check for changes to Python job specifications,
including additions, removals, or changes to inputs, outputs, options, their
fields, types, defaults, constraints, or serialized names. Inspect
`python_sdk/src/reality_capture/specifications/` as well as shared Python models
used by those specifications. TypeScript-only changes do not trigger this
check. Do not treat documentation, tests, formatting, or refactoring that leaves
the specification unchanged as a specification change.

If a specification changed:

1. Compare the PR base and head values of `JOB_CURRENT_VERSION` in
   `python_sdk/src/reality_capture/on_premise/_generic_manager.py`, even if
   that file is not in the PR diff. Compare actual values, not just whether the
   line was edited. This value is used as the version of newly submitted
   on-premise jobs; it is distinct from `DB_CURRENT_VERSION`.
2. Verify that the head value is higher than the base value. Compare numeric
   version components numerically, not lexicographically (for example, `2.10`
   is higher than `2.9`). If either value cannot be determined or compared,
   state that the check could not be completed rather than assuming it passed.
3. If the version is unchanged or lower, leave an actionable review finding on
   a changed specification line. Identify the changed specification, report
   the base and head versions, and request a `JOB_CURRENT_VERSION` bump aligned
   with the engine's compute version. Do not suggest a specific version without
   evidence of the engine version.

For example, a new option with `2.2` in both base and head warrants a finding;
a new input with `2.2` in base and `2.3` in head passes this check. A comment-only
edit or a change only to `DB_CURRENT_VERSION` is not a job version bump.
