# Contributing

When contributing to this repository, please first discuss the change you wish to make via issue,
email, or any other method with the owners of this repository before making a change.

Please note we have a code of conduct, please follow it in all your interactions with the project.

## Pull Request Process

1. Ensure any install or build dependencies are removed before the end of the layer when doing a
   build.
2. Update the README.md with details of changes to the interface, this includes new environment
   variables, exposed ports, useful file locations and container parameters.
3. Increase the version numbers in any examples files and the README.md to the new version that this
   Pull Request would represent. The versioning scheme we use is [SemVer](https://semver.org).
4. You may merge the Pull Request once you have the sign-off of two other developers, or if you
   do not have permission to do that, you may request the second reviewer merge it for you.

## Set Up The Development Environment

1.  After cloning the repository, execute the following commands:

    ```bash
    yarn
    yarn build
    yarn link
    ```

2.  To use the Typescript watch scripts:
    ```bash
    yarn dev
    ```

## TCP Socket Debugger

For easier development, the project contains a debugger, which uses a virtual console to accept input via `STDIN` and then passes the input to a TCP socket, which outputs that to any listener on port **`9999`**(this can be changed in the code), and thus prints it to the listener's `STDOUT`

1. To start the listener:

   ```bash
   yarn debugger
   ```

2. To log debugging information in your code:

   ```typescript
   import { debugging } from "utils";

   debugging.log("Normal console log.");
   debugging.info("Informational console log.");
   debugging.error("Error console log.");
   debugging.dir({ key: "value" });
   ```
