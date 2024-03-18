import EncryptExample01 from '../../Examples/aes-gcm-examples/aes-gcm-01.json';
import EncryptExample02 from '../../Examples/aes-gcm-examples/aes-gcm-02.json';
import EncryptExample03 from '../../Examples/aes-gcm-examples/aes-gcm-03.json';
import EncryptExample04 from '../../Examples/aes-gcm-examples/aes-gcm-04.json';
import EncryptExample05 from '../../Examples/aes-gcm-examples/aes-gcm-05.json';

import { Encrypt, EncryptionAlgorithms, Headers, errors, COSEKey, COSEKeyParam } from '../../../src/index.js';
import { importJWK } from 'jose';

describe('encryption - COSE_Encrypt - decrypt', () => {
  it('should fail when no key is provided', async () => {
    const cbor = Buffer.from(EncryptExample01.output.cbor, 'hex');
    const encrypt0 = Encrypt.decode(cbor);
    //@ts-ignore
    await expect(encrypt0.decrypt(null)).rejects.toThrow();
  });

  it('should fail when the alg is not allowed', async () => {
    const key = await importJWK(EncryptExample01.input.enveloped.recipients[0].key);
    const cbor = Buffer.from(EncryptExample01.output.cbor, 'hex');
    const encrypt0 = Encrypt.decode(cbor);
    await expect(encrypt0.decrypt(key, { algorithms: [EncryptionAlgorithms.A256GCM] }))
      .rejects
      .toThrowErrorMatching(errors.COSEAlgNotAllowed, '[1] (algorithm) Header Parameter not allowed');
  });

  it('should properly decrypt EncryptExample01', async () => {
    const key = await importJWK(EncryptExample01.input.enveloped.recipients[0].key);
    const cbor = Buffer.from(EncryptExample01.output.cbor, 'hex');
    const encrypt = Encrypt.decode(cbor);
    const decrypted = await encrypt.decrypt(key);

    expect(encrypt.protectedHeaders.get(Headers.Algorithm))
      .toBe(EncryptionAlgorithms.A128GCM);

    expect(decrypted).toEqual(
      Buffer.from(EncryptExample01.input.plaintext, 'utf8')
    );
  });

  it('should properly decrypt EncryptExample02', async () => {
    const key = await importJWK(EncryptExample02.input.enveloped.recipients[0].key);
    const cbor = Buffer.from(EncryptExample02.output.cbor, 'hex');
    const encrypt = Encrypt.decode(cbor);
    const decrypted = await encrypt.decrypt(key);
    expect(decrypted).toEqual(Buffer.from(EncryptExample02.input.plaintext, 'utf8'));
  });

  it('should properly decrypt EncryptExample03', async () => {
    const key = await importJWK(EncryptExample03.input.enveloped.recipients[0].key);
    const cbor = Buffer.from(EncryptExample03.output.cbor, 'hex');
    const encrypt = Encrypt.decode(cbor);
    const decrypted = await encrypt.decrypt(key);
    expect(decrypted).toEqual(Buffer.from(EncryptExample03.input.plaintext, 'utf8'));
  });

  it('should fail to decrypt EncryptExample04', async () => {
    const key = await importJWK(EncryptExample04.input.enveloped.recipients[0].key);
    const cbor = Buffer.from(EncryptExample04.output.cbor, 'hex');
    const encrypt = Encrypt.decode(cbor);
    await expect(encrypt.decrypt(key))
      .rejects
      .toThrow(errors.COSEDecryptionFailed);
  });


  it('should fail to decrypt EncryptExample05', async () => {
    const key = COSEKey.fromJWK(EncryptExample05.input.enveloped.recipients[0].key);
    key.set(COSEKeyParam.BaseIV, Buffer.from(
      EncryptExample05.input.enveloped.unsent.IV_hex.slice(0, -4),
      'hex'
    ));
    const cbor = Buffer.from(EncryptExample05.output.cbor, 'hex');
    const encrypt = Encrypt.decode(cbor);
    const decrypted = await encrypt.decrypt(key);
    expect(decrypted).toEqual(Buffer.from(EncryptExample03.input.plaintext, 'utf8'));
  });


});
