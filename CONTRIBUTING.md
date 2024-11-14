# Contributing

Thank you for your interest in contributing! There are several ways you can help.

Please take a read through this document to help streamline the process of getting your contributions added.

## Table of Contents

- [Contributing](#contributing)
  - [Table of Contents](#table-of-contents)
  - [Creating Issues and Enhancements](#creating-issues-and-enhancements)
    - [Writing Good Bug Reports and Feature Requests](#writing-good-bug-reports-and-feature-requests)
  - [Pull Requests](#pull-requests)
  - [Source Code Edit Workflow](#source-code-edit-workflow)
    - [Build Instructions](#build-instructions)
    - [Making and testing changes](#making-and-testing-changes)

## Creating Issues and Enhancements

Have you identified a reproducible problem in this code? Have a feature requests? Please create an Issue, but first make sure that you search the work items to make sure that it has not been entered yet. If you find your issue already exists, please add relevant comments or just a thumbs up to let us know that more people face this issue.

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

Every change must be tested with proper unit tests.

## Source Code Edit Workflow

### Build Instructions

See Readme file for more  information about build instructions.

### Making and Testing Changes

1. Make source code changes on a new Git branch
2. Locally commit changes: `git commit` (or use the Visual Studio Code user interface)
3. Publish changes on the branch and open a pull request.

### Developer Notes

#### reality-data-client

To build, run and test locally, this checklist below can help solve most issues.

- Delete node_modules folder if it's been a while.
- Verify local .env file. Check if test user credentials and all variables are good.
- Verify iTwin platform client ID in case it needs to be updated. <https://developer.bentley.com/my-apps/>
- Verify Node version. This client should match the Node version requirement from `itwinjs-core` as described here in `nodeSupportedVersionRange` : <https://github.com/iTwin/itwinjs-core/blob/master/rush.json>

Example commands below to install, clean, build and test :
- `npm i`
- `npm run clean`
- `npm run build`
- `npm run lint`
- `npm run test:integration` to run integration tests locally.
- `beachball change` to generate a changelog entry.
  - We use [beachball](https://github.com/microsoft/beachball) to manage versioning and changelogs.
