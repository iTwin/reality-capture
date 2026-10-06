# Contributing

Thank you for your interest in contributing! There are several ways you can help.

Please take a read through this document to help streamline the process of getting your contributions added.

## Table of Contents

- [Contributing](#contributing)
  - [Table of Contents](#table-of-contents)
  - [Creating Issues and Enhancements](#creating-issues-and-enhancements)
    - [Writing Good Bug Reports and Feature Requests](#writing-good-bug-reports-and-feature-requests)
  - [Pull Requests](#pull-requests)
    - [Before Opening a Pull Request](#before-opening-a-pull-request)
  - [Package Specific Guidance](#package-specific-guidance)

## Creating Issues and Enhancements

Have you identified a reproducible problem or have a feature request? First, search the existing GitHub issues to confirm it has not already been reported. If an identical issue exists, add relevant details or a reaction to indicate that you are affected.

### Writing Good Bug Reports and Feature Requests

File a single issue per problem and feature request. Do not enumerate multiple bugs or feature requests in the same issue.

Do not add your issue as a comment to an existing issue unless it's for the identical input. Many issues look similar, but have different causes.

The more information you can provide, the more likely someone will be successful at reproducing the issue and finding a fix.

Please include the following with each issue:

-   Version of the package
-   Version of iTwin.js used
-   Your operating system or browser
-   Reproducible steps (1... 2... 3...) that cause the issue
-   What you expected to see, versus what you actually saw
-   Images, animations, or a link to a video showing the issue occurring
-   A code snippet that demonstrates the issue or a link to a code repository the developers can easily pull down to recreate the issue locally

## Pull Requests

We follow the normal [GitHub pull request workflow](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request) to ensure that all code changes in this repository are code reviewed and all tests pass. This means that there will be a number of reviewers that formally review and sign off for changes. Reviewers should check for redundancy, optimization, stylization, and standardization in each changeset. While we will try to keep this repository as collaborative and open-source as possible, it must also be reliable.

Add or update automated tests for behavior changes. For documentation-only changes, explain in the pull request why automated tests are not applicable.

### Before Opening a Pull Request

Follow the build, lint, test, and release-change instructions in the guide for each package affected by your change.

## Package Specific Guidance

This guide applies to the entire repository. Refer to the relevant package documentation
for setup, build, and test commands that are specific to a package.

- Reality Capture TypeScript package: [contribution guide](typescript/packages/reality-capture/CONTRIBUTING.md)
- Reality Data Client TypeScript package (deprecated; approved critical fixes only): [maintenance guide](typescript/packages/reality-data-client/CONTRIBUTING.md)
- Reality Capture Python package: [contribution guide](python_sdk/CONTRIBUTING.md)
