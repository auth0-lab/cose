import { createDecipheriv, KeyObject } from 'node:crypto'
import type { CipherGCMTypes } from 'node:crypto'

import type { DecryptFunction } from '../interfaces.d'
import checkIvLength from '../../lib/check_iv_length.js'
import checkCekLength from './check_cek_length.js'
import { concat } from '../../lib/buffer_utils.js'
import { COSENotSupported, COSEDecryptionFailed, COSEEncryptedInvalid } from '../../util/errors.js'
import timingSafeEqual from './timing_safe_equal.js'
import cbcTag from './cbc_tag.js'
import { isCryptoKey } from './webcrypto.js'
import { checkEncCryptoKey } from '../../lib/crypto_key.js'
import isKeyObject from './is_key_object.js'
import invalidKeyInput from '../../lib/invalid_key_input.js'
import supported from './ciphers.js'
import { types } from './is_key_like.js'
import type { KeyLike } from 'jose'

function cbcDecrypt(
  enc: string,
  cek: KeyObject | Uint8Array,
  ciphertext: Uint8Array,
  iv: Uint8Array,
  tag: Uint8Array,
  aad: Uint8Array,
) {
  const keySize = parseInt(enc.slice(1, 4), 10)

  if (isKeyObject(cek)) {
    cek = cek.export()
  }

  const encKey = cek.subarray(keySize >> 3)
  const macKey = cek.subarray(0, keySize >> 3)
  const macSize = parseInt(enc.slice(-3), 10)

  const algorithm = `aes-${keySize}-cbc`
  if (!supported(algorithm)) {
    throw new COSENotSupported(`alg ${enc} is not supported by your javascript runtime`)
  }

  const expectedTag = cbcTag(aad, iv, ciphertext, macSize, macKey, keySize)

  let macCheckPassed!: boolean
  try {
    macCheckPassed = timingSafeEqual(tag, expectedTag)
  } catch {
    //
  }
  if (!macCheckPassed) {
    throw new COSEDecryptionFailed()
  }

  let plaintext!: Uint8Array
  try {
    const decipher = createDecipheriv(algorithm, encKey, iv)
    plaintext = concat(decipher.update(ciphertext), decipher.final())
  } catch {
    //
  }
  if (!plaintext) {
    throw new COSEDecryptionFailed()
  }

  return plaintext
}

function gcmDecrypt(
  enc: string,
  cek: KeyObject | Uint8Array,
  ciphertext: Uint8Array,
  iv: Uint8Array,
  tag: Uint8Array,
  aad: Uint8Array,
) {
  const keySize = parseInt(enc.slice(1, 4), 10)

  const algorithm = <CipherGCMTypes>`aes-${keySize}-gcm`
  if (!supported(algorithm)) {
    throw new COSENotSupported(`alg ${enc} is not supported by your javascript runtime`)
  }
  try {
    const decipher = createDecipheriv(algorithm, cek, iv, { authTagLength: 16 })
    decipher.setAuthTag(tag)
    if (aad.byteLength) {
      decipher.setAAD(aad, { plaintextLength: ciphertext.length })
    }

    const plaintext = decipher.update(ciphertext)
    decipher.final()
    return plaintext
  } catch (err) {
    throw new COSEDecryptionFailed()
  }
}

const decrypt: DecryptFunction = (
  enc: string,
  cek: KeyLike | Uint8Array,
  ciphertext: Uint8Array,
  iv: Uint8Array | undefined,
  tag: Uint8Array | undefined,
  aad: Uint8Array,
) => {
  let key: KeyObject | Uint8Array
  if (isCryptoKey(cek)) {
    checkEncCryptoKey(cek, enc, 'decrypt')
    key = KeyObject.from(cek)
  } else if (cek instanceof Uint8Array || isKeyObject(cek)) {
    key = cek
  } else {
    throw new TypeError(invalidKeyInput(cek, ...types, 'Uint8Array'))
  }

  if (!iv) {
    throw new COSEEncryptedInvalid('COSE Initialization Vector missing')
  }
  if (!tag) {
    throw new COSEEncryptedInvalid('COSE Authentication Tag missing')
  }

  checkCekLength(enc, key)
  checkIvLength(enc, iv)

  switch (enc) {
    case 'A128CBC-HS256':
    case 'A192CBC-HS384':
    case 'A256CBC-HS512':
      return cbcDecrypt(enc, key, ciphertext, iv, tag, aad)
    case 'A128GCM':
    case 'A192GCM':
    case 'A256GCM':
      return gcmDecrypt(enc, key, ciphertext, iv, tag, aad)
    default:
      throw new COSENotSupported('Unsupported COSE Content Encryption Algorithm')
  }
}

export default decrypt
