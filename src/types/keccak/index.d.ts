// Type definitions for keccak 1.4.0
// Project: https://github.com/cryptocoinjs/keccak
// Definitions by: Jaco Greeff <https://github.com/jacogr>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

/// <reference types="node"/>

declare module 'keccak' {
  interface KeccakHasher {
    digest(base: string): Buffer
    update(message: string | Buffer): KeccakHasher

    _resetState(): void
    _clone(): KeccakHasher
  }

  type KeccakTypes =
    | 'keccak224'
    | 'keccak256'
    | 'keccak384'
    | 'keccak512'
    | 'sha3-224'
    | 'sha3-256'
    | 'sha3-384'
    | 'sha3-512'
    | 'shake128'
    | 'shake256'

  const keccak: (type: KeccakTypes) => KeccakHasher

  export default keccak
}
