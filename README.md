[RFC9052](https://datatracker.ietf.org/doc/rfc9052/)/[RFC9053](https://datatracker.ietf.org/doc/html/rfc9053) COSE library for node.js.

**Note:** this is an early project.

This library is designed to work in node.js as well in the browser but is not yet tested in the browser context.

## Installation

```
npm i --save cose-kit
```

## Examples

You can run the following examples with `node examples/Mac0.mjs`:

- [Sign1: COSE Single Signer Data Object](examples/Sign1.mjs)
- [Sign: COSE Signed Data Object](examples/Sign.mjs)
- [Mac0: COSE Mac w/o Recipients Object](examples/Mac0.mjs)
- [Encrypt0: COSE Single Recipient Encrypted Data Object](examples/Encrypt0.mjs)
- [Encrypt: COSE_Encrypt with direct encryption](examples/Encrypt.mjs)
- [COSEKey: COSEKey usage](examples/COSEKey.mjs)

## Credits
-  [panva/jose](https://github.com/panva/jose) A node.js library for JOSE.

## License

MIT License 2023 - José F. Romaniello
