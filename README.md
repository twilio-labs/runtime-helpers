<h1 align="center">@twilio-labs/runtime-helpers</h1>
<p align="center">This is a set of useful utility code for use in <a href="https://www.twilio.com/functions">Twilio Runtime and Twilio Functions</a> code.
<br>Full reference documentation at <a href="https://twilio-labs.github.io/runtime-helpers/">twilio-labs.github.io/runtime-helpers/</a></p>
<hr>

- [Installation](#installation)
- [Goals](#goals)
- [Contributing](#contributing)
  - [Code of Conduct](#code-of-conduct)
- [License](#license)

## Installation

To use this library in a Twilio Function, see our
[documentation on adding new dependencies to Functions](https://www.twilio.com/docs/runtime/functions/dependencies).

## Goals

`runtime-helpers` is a curated collection of code we've found useful in working
with the Twilio Runtime platform and Twilio Functions. Much of this repository
is adapted from commonly-used Function code written for popular Quick Deploy
apps. Compared with copy-pasted versions of the same code, the utilities in
`runtime-helpers` have the following advantages:

- All code is typechecked via Typescript and has a full set of unit tests
- Any improvements we make can easily be incorporated into your app via standard NPM mechanisms
- We provide a single, trusted implementation for security-conscious code
- The `runtime-helpers` API is consistent; multiple conflicting implementations of functions are not possible

## Contributing

This project welcomes contributions from the community. Feel free to <a href="https://github.com/twilio-labs/runtime-helpers/pulls">open a pull request</a> for any features, bug fixes, or any other contributions you want to make.

### Code of Conduct

Please be aware that this project has a [Code of Conduct](https://github.com/twilio-labs/runtime-helpers/blob/main/CODE_OF_CONDUCT.md). The tldr; is to just be excellent to each other ❤️

## License

MIT
