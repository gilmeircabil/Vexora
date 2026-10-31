import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { CopyButton } from '../../components/common/CopyButton.js';
import {
  signJwt,
  decodeJwt,
  verifyJwtSignature,
  type JwtAlgorithm,
  type JwtHeader,
  type JwtClaims,
  type DecodedJwt,
} from '../../lib/dev/jwt.js';
import {
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const JwtGeneratorTool: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generate' | 'decode'>('generate');

  // Generator State
  const [alg, setAlg] = useState<JwtAlgorithm>('HS256');
  const [secret, setSecret] = useState('your-256-bit-secret-key-vexoramods');
  const [payloadText, setPayloadText] = useState(
    JSON.stringify(
      {
        sub: '1234567890',
        name: 'Alex Mercer',
        admin: true,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      },
      null,
      2,
    ),
  );
  const [generatedToken, setGeneratedToken] = useState<string>('');
  const [genError, setGenError] = useState<string | null>(null);

  // Decoder State
  const [inputToken, setInputToken] = useState<string>('');
  const [verifySecret, setVerifySecret] = useState<string>('');
  const [decodedResult, setDecodedResult] = useState<DecodedJwt | null>(null);
  const [decodeError, setDecodeError] = useState<string | null>(null);
  const [signatureStatus, setSignatureStatus] = useState<'valid' | 'invalid' | 'unverified'>(
    'unverified',
  );

  // Generate token whenever inputs change
  useEffect(() => {
    const runSign = async () => {
      setGenError(null);
      let parsedPayload: JwtClaims;
      try {
        parsedPayload = JSON.parse(payloadText);
      } catch {
        setGenError('Payload must be valid JSON format.');
        return;
      }

      const header: JwtHeader = { alg, typ: 'JWT' };
      const res = await signJwt(header, parsedPayload, secret);
      if (res.ok) {
        setGeneratedToken(res.value);
      } else {
        setGenError(res.error);
      }
    };
    runSign();
  }, [alg, secret, payloadText]);

  // Decode token whenever input token changes
  useEffect(() => {
    if (!inputToken.trim()) {
      setDecodedResult(null);
      setDecodeError(null);
      setSignatureStatus('unverified');
      return;
    }

    const res = decodeJwt(inputToken);
    if (res.ok) {
      setDecodedResult(res.value);
      setDecodeError(null);
      if (verifySecret) {
        verifySig(inputToken, verifySecret);
      } else {
        setSignatureStatus('unverified');
      }
    } else {
      setDecodedResult(null);
      setDecodeError(res.error);
      setSignatureStatus('unverified');
    }
  }, [inputToken, verifySecret]);

  const verifySig = async (token: string, key: string) => {
    if (!key) {
      setSignatureStatus('unverified');
      return;
    }
    const res = await verifyJwtSignature(token, key);
    if (res.ok && res.value) {
      setSignatureStatus('valid');
    } else {
      setSignatureStatus('invalid');
    }
  };

  const generateRandomSecret = () => {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    setSecret(hex);
  };

  const setExpiryOffset = (seconds: number) => {
    try {
      const obj = JSON.parse(payloadText);
      obj.iat = Math.floor(Date.now() / 1000);
      obj.exp = obj.iat + seconds;
      setPayloadText(JSON.stringify(obj, null, 2));
    } catch {
      // Ignore if not valid JSON
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <Button
          variant={activeTab === 'generate' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('generate')}
        >
          Generate & Sign Token
        </Button>
        <Button
          variant={activeTab === 'decode' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => {
            setActiveTab('decode');
            if (!inputToken && generatedToken) {
              setInputToken(generatedToken);
              setVerifySecret(secret);
            }
          }}
        >
          Decode & Verify Token
        </Button>
      </div>

      {activeTab === 'generate' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Header and Algorithm */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Header & Algorithm
                </span>
                <span className="text-[11px] font-mono text-neutral-400">typ: JWT</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Signing Algorithm
                </label>
                <select
                  value={alg}
                  onChange={(e) => setAlg(e.target.value as JwtAlgorithm)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg"
                >
                  <option value="HS256">HS256 (HMAC SHA-256) — Standard</option>
                  <option value="HS384">HS384 (HMAC SHA-384)</option>
                  <option value="HS512">HS512 (HMAC SHA-512) — High security</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Secret Key / Passphrase
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomSecret}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Random 256-bit Key
                  </button>
                </div>
                <input
                  type="text"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg"
                  placeholder="Enter secret key..."
                />
              </div>
            </Card>

            {/* Payload Claims */}
            <Card className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Payload Claims (JSON)
                </span>
                <div className="flex items-center gap-1 text-[11px]">
                  <span className="text-neutral-400 mr-1">Expire:</span>
                  <button
                    onClick={() => setExpiryOffset(3600)}
                    className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-600 dark:text-neutral-300"
                  >
                    1h
                  </button>
                  <button
                    onClick={() => setExpiryOffset(86400)}
                    className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-600 dark:text-neutral-300"
                  >
                    1d
                  </button>
                  <button
                    onClick={() => setExpiryOffset(2592000)}
                    className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-600 dark:text-neutral-300"
                  >
                    30d
                  </button>
                </div>
              </div>

              <textarea
                rows={7}
                value={payloadText}
                onChange={(e) => setPayloadText(e.target.value)}
                className="w-full p-3 font-mono text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </Card>
          </div>

          {genError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{genError}</span>
            </div>
          )}

          {/* Generated JWT Display */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Signed JWT Token
                </span>
              </div>
              <CopyButton value={generatedToken} label="Copy Token" size="sm" />
            </div>

            <textarea
              rows={4}
              readOnly
              value={generatedToken}
              className="w-full p-3 font-mono text-xs bg-neutral-900 text-neutral-100 rounded-xl border border-neutral-800 break-all leading-relaxed"
            />
          </Card>
        </div>
      ) : (
        /* Decode & Verify Tab */
        <div className="space-y-6">
          <Card className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Paste JWT Token
              </span>
              <button
                type="button"
                onClick={() => setInputToken('')}
                className="text-xs text-neutral-400 hover:text-neutral-600"
              >
                Clear
              </button>
            </div>
            <textarea
              rows={3}
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              placeholder="Paste JWT token (e.g. eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)"
              className="w-full p-3 font-mono text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-indigo-500 break-all"
            />

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Verify Signature Secret Key (Optional)
              </label>
              <input
                type="text"
                value={verifySecret}
                onChange={(e) => setVerifySecret(e.target.value)}
                placeholder="Enter secret key to verify HMAC signature..."
                className="w-full px-3 py-1.5 text-xs font-mono bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg"
              />
            </div>
          </Card>

          {decodeError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{decodeError}</span>
            </div>
          )}

          {decodedResult && (
            <div className="space-y-4">
              {/* Verification & Expiration Status Badges */}
              <div className="flex items-center gap-3 flex-wrap">
                {verifySecret && (
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                      signatureStatus === 'valid'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400'
                        : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-400'
                    }`}
                  >
                    {signatureStatus === 'valid' ? (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Signature Verified</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4" />
                        <span>Signature Invalid</span>
                      </>
                    )}
                  </div>
                )}

                {decodedResult.payload.exp !== undefined && (
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                      decodedResult.isExpired
                        ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-400'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400'
                    }`}
                  >
                    <span>
                      {decodedResult.isExpired
                        ? 'Token Expired'
                        : `Active (Expires in ${Math.round((decodedResult.expiresInSeconds || 0) / 60)} min)`}
                    </span>
                  </div>
                )}
              </div>

              {/* Decoded Header and Payload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="space-y-2">
                  <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 block">
                    Decoded Header
                  </span>
                  <pre className="p-3 bg-neutral-900 text-neutral-100 rounded-xl text-xs font-mono overflow-auto">
                    {JSON.stringify(decodedResult.header, null, 2)}
                  </pre>
                </Card>

                <Card className="space-y-2">
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 block">
                    Decoded Payload (Claims)
                  </span>
                  <pre className="p-3 bg-neutral-900 text-neutral-100 rounded-xl text-xs font-mono overflow-auto">
                    {JSON.stringify(decodedResult.payload, null, 2)}
                  </pre>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
