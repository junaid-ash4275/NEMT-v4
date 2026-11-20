import React, { useMemo, useId, useState } from 'react';

const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2';

const BOOLEAN_FLAGS = new Set([
  '-L', '--location', '-k', '--insecure', '--compressed', '-s', '--silent', '-i', '--include',
  '-v', '--verbose', '-#', '--progress-bar', '-g', '--globoff', '-f', '--fail', '-N', '--no-buffer',
  '--http1.1', '--http2', '-J', '--remote-header-name', '--get', '-I', '--head', '--trace-ascii',
]);

const VALUE_FLAGS = new Set([
  '-o', '--output', '--max-time', '-m', '--connect-timeout', '--retry', '--retry-delay',
  '--cacert', '--cert', '--key', '--ciphers', '-w', '--write-out', '--proxy', '-x', '--resolve',
]);

function tokenize(input) {
  const text = input.replace(/\\(\r?\n)[ \t]*/g, ' ').replace(/\r/g, '').trim();
  const tokens = [];
  let index = 0;

  while (index < text.length) {
    if (/\s/.test(text[index])) {
      index += 1;
      continue;
    }

    let value = '';

    while (index < text.length && !/\s/.test(text[index])) {
      const char = text[index];

      if (char === "'") {
        let cursor = index + 1;
        let closed = false;
        while (cursor < text.length) {
          if (text[cursor] === "'") {
            if (text.slice(cursor + 1, cursor + 3) === "\\'") {
              value += "'";
              cursor += 3;
              continue;
            }
            closed = true;
            break;
          }
          value += text[cursor];
          cursor += 1;
        }
        if (!closed) throw new Error('The command has an unclosed single quote.');
        index = cursor + 1;
        continue;
      }

      if (char === '"') {
        let cursor = index + 1;
        let closed = false;
        while (cursor < text.length) {
          const current = text[cursor];
          if (current === '\\' && cursor + 1 < text.length && '"\\$`'.includes(text[cursor + 1])) {
            value += text[cursor + 1];
            cursor += 2;
            continue;
          }
          if (current === '"') {
            closed = true;
            break;
          }
          value += current;
          cursor += 1;
        }
        if (!closed) throw new Error('The command has an unclosed double quote.');
        index = cursor + 1;
        continue;
      }

      if (char === '\\' && index + 1 < text.length) {
        value += text[index + 1];
        index += 2;
        continue;
      }

      value += char;
      index += 1;
    }

    tokens.push(value);
  }

  return tokens;
}

function splitHeader(raw) {
  const separator = raw.indexOf(':');
  if (separator <= 0) return null;
  return { name: raw.slice(0, separator).trim(), value: raw.slice(separator + 1).trim() };
}

function parseCurl(input) {
  const trimmed = input.trim();
  if (!trimmed) return { empty: true, warnings: [] };

  let tokens;
  try {
    tokens = tokenize(trimmed);
  } catch (error) {
    return { empty: false, error: error.message, warnings: [] };
  }

  while (tokens.length && (tokens[0] === 'curl' || tokens[0].endsWith('/curl'))) tokens.shift();
  if (!tokens.length) {
    return { empty: false, error: 'Nothing left to read after the curl command itself.', warnings: [] };
  }

  const warnings = [];
  const headers = [];
  const dataParts = [];
  let url = '';
  let method = '';
  let user = '';
  let timeoutSeconds = null;

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    const next = () => tokens[++index];

    if (token === '-X' || token === '--request') {
      method = String(next() ?? '').toUpperCase();
      continue;
    }
    if (token === '-H' || token === '--header') {
      const header = splitHeader(String(next() ?? ''));
      if (header) headers.push(header);
      else warnings.push('A header was not in "Name: value" form and was skipped.');
      continue;
    }
    if (token === '-A' || token === '--user-agent') {
      headers.push({ name: 'User-Agent', value: String(next() ?? '') });
      continue;
    }
    if (token === '-e' || token === '--referer') {
      headers.push({ name: 'Referer', value: String(next() ?? '') });
      continue;
    }
    if (token === '-b' || token === '--cookie') {
      headers.push({ name: 'Cookie', value: String(next() ?? '') });
      continue;
    }
    if (token === '-u' || token === '--user') {
      user = String(next() ?? '');
      continue;
    }
    if (token === '--url') {
      url = String(next() ?? '');
      continue;
    }
    if (['-d', '--data', '--data-raw', '--data-ascii', '--data-binary'].includes(token)) {
      dataParts.push(String(next() ?? ''));
      continue;
    }
    if (token === '--data-urlencode') {
      const value = String(next() ?? '');
      const equals = value.indexOf('=');
      const encoded = equals > 0
        ? `${value.slice(0, equals)}=${encodeURIComponent(value.slice(equals + 1))}`
        : encodeURIComponent(value);
      dataParts.push(encoded);
      continue;
    }
    if (token === '-F' || token === '--form' || token === '--form-string') {
      dataParts.push(String(next() ?? ''));
      warnings.push('Multipart form fields are not converted. Rebuild the body as FormData in your code.');
      continue;
    }
    if (token === '--max-time' || token === '-m' || token === '--connect-timeout') {
      const value = Number(next());
      if (Number.isFinite(value) && value > 0) timeoutSeconds = timeoutSeconds ?? Math.round(value);
      continue;
    }
    if (token.startsWith('--') && token.includes('=')) {
      const [name, ...rest] = token.split('=');
      if (name === '--request') method = rest.join('=').toUpperCase();
      else if (name === '--url') url = rest.join('=');
      else if (name === '--data' || name === '--data-raw' || name === '--data-binary') dataParts.push(rest.join('='));
      else if (name === '--header') {
        const header = splitHeader(rest.join('='));
        if (header) headers.push(header);
      } else if (!BOOLEAN_FLAGS.has(name) && !VALUE_FLAGS.has(name)) {
        warnings.push(`Skipped ${name}, which has no equivalent in the generated code.`);
      }
      continue;
    }
    if (BOOLEAN_FLAGS.has(token)) continue;
    if (VALUE_FLAGS.has(token)) {
      next();
      continue;
    }
    if (token.startsWith('-')) {
      warnings.push(`Skipped ${token}, which has no equivalent in the generated code.`);
      continue;
    }
    if (!url) url = token;
    else warnings.push('More than one positional argument was found; only the first was used as the URL.');
  }

  if (!url) return { empty: false, error: 'No URL found in the command.', warnings };

  if (user) {
    try {
      headers.push({ name: 'Authorization', value: `Basic ${btoa(user)}` });
    } catch {
      warnings.push('The --user credentials contain characters that cannot be base64 encoded here.');
    }
  }

  const body = dataParts.length ? dataParts.join('&') : '';
  let parsedBody = null;
  let bodyKind = 'none';
  if (body) {
    try {
      const candidate = JSON.parse(body);
      if (candidate && typeof candidate === 'object') {
        parsedBody = candidate;
        bodyKind = 'json';
      } else {
        bodyKind = 'text';
      }
    } catch {
      bodyKind = 'form';
    }
  }

  const resolvedMethod = method || (body ? 'POST' : 'GET');
  const hasContentType = headers.some((header) => header.name.toLowerCase() === 'content-type');
  if (!method && body && !hasContentType) {
    headers.push({ name: 'Content-Type', value: 'application/x-www-form-urlencoded' });
  }

  let parsedUrl = null;
  try {
    parsedUrl = new URL(url);
  } catch {
    warnings.push('The URL is not absolute, so host and query details are limited.');
  }

  const query = parsedUrl ? [...parsedUrl.searchParams.entries()].map(([key, value]) => ({ key, value })) : [];
  const acceptsJson = headers.some((header) => {
    const name = header.name.toLowerCase();
    return (name === 'accept' && header.value.includes('json'))
      || (name === 'content-type' && header.value.includes('json'));
  });

  return {
    empty: false,
    error: '',
    warnings,
    url,
    parsedUrl,
    query,
    method: resolvedMethod,
    headers,
    body,
    bodyKind,
    parsedBody,
    timeoutSeconds,
    acceptsJson: acceptsJson || bodyKind === 'json',
  };
}

const jsString = (value) => `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`;

function headerBlock(headers, indent, quote = jsString) {
  const pad = ' '.repeat(indent);
  const entries = headers.map((header) => `${pad}  ${quote(header.name)}: ${quote(header.value)},`);
  return ['{', ...entries, `${pad}}`].join('\n');
}

function generateFetch(parsed) {
  const { url, method, headers, body, bodyKind, parsedBody, timeoutSeconds, acceptsJson } = parsed;
  const lines = [];

  if (timeoutSeconds) {
    lines.push(`const controller = new AbortController();`);
    lines.push(`const timeout = setTimeout(() => controller.abort(), ${timeoutSeconds * 1000});`);
    lines.push('');
  }
  if (bodyKind === 'json') {
    lines.push(`const payload = ${JSON.stringify(parsedBody, null, 2)};`);
    lines.push('');
  }

  const options = [`  method: ${jsString(method)},`];
  if (headers.length) options.push(`  headers: ${headerBlock(headers, 2)},`);
  if (bodyKind === 'json') options.push('  body: JSON.stringify(payload),');
  else if (body) options.push(`  body: ${jsString(body)},`);
  if (timeoutSeconds) options.push('  signal: controller.signal,');

  lines.push(`const response = await fetch(${jsString(url)}, {`);
  lines.push(...options);
  lines.push('});');
  lines.push('');
  if (timeoutSeconds) {
    lines.push('clearTimeout(timeout);');
    lines.push('');
  }
  lines.push('if (!response.ok) {');
  // eslint-disable-next-line no-template-curly-in-string
  lines.push('  throw new Error(`Request failed with ${response.status} ${response.statusText}`);');
  lines.push('}');
  lines.push('');
  lines.push(`const result = await response.${acceptsJson ? 'json()' : 'text()'};`);
  lines.push('console.log(result);');

  return lines.join('\n');
}

function generateAxios(parsed) {
  const { url, method, headers, body, bodyKind, parsedBody, timeoutSeconds } = parsed;
  const lines = [`import axios from ${jsString('axios')};`, ''];
  const lowerMethod = method.toLowerCase();

  if (bodyKind === 'json') {
    lines.push(`const payload = ${JSON.stringify(parsedBody, null, 2)};`);
    lines.push('');
  }

  const config = [];
  if (headers.length) config.push(`  headers: ${headerBlock(headers, 2)},`);
  if (timeoutSeconds) config.push(`  timeout: ${timeoutSeconds * 1000},`);

  const payloadArg = bodyKind === 'json' ? 'payload' : jsString(body);
  const takesPayloadSlot = !['get', 'head', 'options'].includes(lowerMethod);
  const args = [jsString(url)];
  if (body) args.push(payloadArg);
  else if (config.length && takesPayloadSlot) args.push('null');

  if (config.length) {
    lines.push(`const { data } = await axios.${lowerMethod}(${args.join(', ')}, {`);
    lines.push(...config);
    lines.push('});');
  } else {
    lines.push(`const { data } = await axios.${lowerMethod}(${args.join(', ')});`);
  }

  lines.push('');
  lines.push('console.log(data);');
  return lines.join('\n');
}

function pythonString(value) {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`;
}

function pythonLiteral(value, indent = 0) {
  if (value === null) return 'None';
  if (typeof value === 'boolean') return value ? 'True' : 'False';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return pythonString(value);
  const pad = ' '.repeat(indent);
  const innerPad = ' '.repeat(indent + 4);
  if (Array.isArray(value)) {
    if (!value.length) return '[]';
    return `[\n${value.map((item) => innerPad + pythonLiteral(item, indent + 4)).join(',\n')},\n${pad}]`;
  }
  const entries = Object.entries(value);
  if (!entries.length) return '{}';
  return `{\n${entries.map(([key, item]) => `${innerPad}${pythonString(key)}: ${pythonLiteral(item, indent + 4)}`).join(',\n')},\n${pad}}`;
}

function generatePython(parsed) {
  const { url, method, headers, body, bodyKind, parsedBody, timeoutSeconds, acceptsJson } = parsed;
  const lines = ['import requests', ''];

  if (bodyKind === 'json') {
    lines.push(`payload = ${pythonLiteral(parsedBody)}`);
    lines.push('');
  }

  lines.push('response = requests.request(');
  lines.push(`    ${pythonString(method)},`);
  lines.push(`    ${pythonString(url)},`);
  if (headers.length) {
    lines.push('    headers={');
    headers.forEach((header) => lines.push(`        ${pythonString(header.name)}: ${pythonString(header.value)},`));
    lines.push('    },');
  }
  if (bodyKind === 'json') lines.push('    json=payload,');
  else if (bodyKind === 'form') lines.push(`    data=${pythonString(body)},`);
  else if (body) lines.push(`    data=${pythonString(body)},`);
  if (timeoutSeconds) lines.push(`    timeout=${timeoutSeconds},`);
  lines.push(')');
  lines.push('');
  lines.push('response.raise_for_status()');
  lines.push(acceptsJson ? 'print(response.json())' : 'print(response.text)');

  return lines.join('\n');
}

function generatePrettyCurl(parsed) {
  const { url, method, headers, body } = parsed;
  const shellString = (value) => `'${value.replace(/'/g, "'\\''")}'`;
  const lines = [`curl -X ${method}`, `  ${shellString(url)}`];
  headers.forEach((header) => lines.push(`  -H ${shellString(`${header.name}: ${header.value}`)}`));
  if (body) lines.push(`  -d ${shellString(body)}`);

  return lines.map((line, index) => (index < lines.length - 1 ? `${line} \\` : line)).join('\n');
}

const TARGETS = [
  { id: 'fetch', label: 'Fetch', generate: generateFetch },
  { id: 'axios', label: 'Axios', generate: generateAxios },
  { id: 'python', label: 'Python', generate: generatePython },
  { id: 'curl', label: 'Pretty cURL', generate: generatePrettyCurl },
];

const SAMPLE = [
  "curl 'https://api.example.com/v1/orders?status=open&limit=25' \\",
  '  -X POST \\',
  "  -H 'Content-Type: application/json' \\",
  "  -H 'Authorization: Bearer sk_demo_9f2c1a' \\",
  "  -H 'Accept: application/json' \\",
  "  -A 'dummy-app/1.0' \\",
  '  --max-time 30 \\',
  "  -d '{\"customer\":\"ada\",\"items\":[{\"sku\":\"KB-01\",\"qty\":2}],\"rush\":true}'",
].join('\n');

export default function CurlCrafter() {
  const labelId = useId();
  const [raw, setRaw] = useState('');
  const [target, setTarget] = useState('fetch');
  const [status, setStatus] = useState('');

  const parsed = useMemo(() => parseCurl(raw), [raw]);
  const activeTarget = TARGETS.find((item) => item.id === target) ?? TARGETS[0];

  const code = useMemo(() => {
    if (parsed.empty || parsed.error) return '';
    try {
      return activeTarget.generate(parsed);
    } catch {
      return '// This command could not be converted. Check the warnings below.';
    }
  }, [parsed, activeTarget]);

  const statCards = [
    { label: 'Method', value: parsed.error || parsed.empty ? '—' : parsed.method },
    { label: 'Host', value: parsed.parsedUrl ? parsed.parsedUrl.host : parsed.empty || parsed.error ? '—' : 'unknown' },
    { label: 'Headers', value: parsed.error || parsed.empty ? '—' : String(parsed.headers.length) },
    { label: 'Body', value: parsed.error || parsed.empty ? '—' : parsed.bodyKind === 'none' ? 'none' : parsed.bodyKind },
  ];

  const copyCode = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setStatus(`${activeTarget.label} snippet copied to the clipboard.`);
    } catch {
      setStatus('Clipboard is blocked in this browser. Select the code and copy it manually.');
    }
  };

  const loadSample = () => {
    setRaw(SAMPLE);
    setStatus('Sample command loaded.');
  };

  const clearCommand = () => {
    setRaw('');
    setStatus('');
  };

  return (
    <section aria-labelledby={labelId} className="max-w-7xl mx-auto my-12 p-6 md:p-8 bg-white rounded-3xl shadow-[0_20px_50px_rgba(5,150,105,0.08)] border border-gray-100 overflow-hidden relative">
      <div aria-hidden="true" className="absolute top-0 right-0 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-70 -mr-32 -mt-32 pointer-events-none" />
      <div aria-hidden="true" className="absolute bottom-0 left-0 w-80 h-80 bg-teal-50 rounded-full blur-3xl opacity-60 -ml-24 -mb-24 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div className="flex items-center gap-3">
          <div aria-hidden="true" className="w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
          </div>
          <div>
            <h2 id={labelId} className="text-3xl font-extrabold text-gray-900 tracking-tight">Curl Crafter</h2>
            <p className="text-gray-500 text-sm font-medium mt-0.5">Turn a copied curl command into fetch, axios, or Python requests code</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start shrink-0">
          <button type="button" onClick={loadSample} className={`rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-bold text-emerald-700 active:scale-95 transition-all ${FOCUS}`}>
            Sample
          </button>
          <button type="button" onClick={clearCommand} className={`rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-500 active:scale-95 transition-all ${FOCUS}`}>
            Clear
          </button>
        </div>
      </div>

      <div className="relative z-10 mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 min-w-0">
            <div className="text-lg sm:text-2xl font-black tabular-nums truncate text-emerald-950">{card.value}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-800/80">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className="lg:col-span-5 min-w-0 space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 md:p-5">
            <label htmlFor={`${labelId}-command`} className="text-sm font-semibold text-gray-600">curl command</label>
            <textarea
              id={`${labelId}-command`}
              value={raw}
              onChange={(event) => { setRaw(event.target.value); setStatus(''); }}
              placeholder={"curl 'https://api.example.com/v1/orders' \\\n  -H 'Authorization: Bearer token' \\\n  -d '{\"status\":\"open\"}'"}
              spellCheck={false}
              rows={10}
              className={`mt-3 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs font-mono leading-6 text-gray-800 resize-y outline-none ${FOCUS}`}
            />
            <p className="mt-2 text-xs font-medium text-gray-400">
              Line continuations, single quotes, double quotes, and <span className="font-mono">--flag=value</span> syntax are all handled.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 md:p-5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Request breakdown</h3>
            {parsed.empty || parsed.error ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm font-medium text-gray-400">
                {parsed.error || 'Paste a curl command to see the request it describes.'}
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-emerald-600 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-white">{parsed.method}</span>
                  <span className="min-w-0 flex-1 truncate font-mono text-xs text-gray-700" title={parsed.url}>{parsed.url}</span>
                </div>
                <div className="mt-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Headers</div>
                  {parsed.headers.length ? (
                    <ul className="mt-1.5 space-y-1">
                      {parsed.headers.map((header) => (
                        <li key={`${header.name}-${header.value}`} className="flex gap-2 font-mono text-[11px] leading-5">
                          <span className="shrink-0 font-bold text-emerald-700">{header.name}:</span>
                          <span className="min-w-0 break-all text-gray-600">{header.value}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1 text-xs font-medium text-gray-400">No headers.</p>
                  )}
                </div>
                <div className="mt-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Query parameters</div>
                  {parsed.query.length ? (
                    <ul className="mt-1.5 space-y-1">
                      {parsed.query.map((entry, index) => (
                        <li key={`${entry.key}-${index}`} className="flex gap-2 font-mono text-[11px] leading-5">
                          <span className="shrink-0 font-bold text-teal-700">{entry.key}</span>
                          <span className="min-w-0 break-all text-gray-600">{entry.value}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1 text-xs font-medium text-gray-400">No query parameters.</p>
                  )}
                </div>
                <div className="mt-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Body</div>
                  {parsed.body ? (
                    <pre className="mt-1.5 max-h-40 overflow-auto rounded-xl bg-slate-900 p-3 font-mono text-[11px] leading-5 text-emerald-100">
                      {parsed.bodyKind === 'json' ? JSON.stringify(parsed.parsedBody, null, 2) : parsed.body}
                    </pre>
                  ) : (
                    <p className="mt-1 text-xs font-medium text-gray-400">No body.</p>
                  )}
                </div>
              </>
            )}
          </div>

          {parsed.warnings.length > 0 && (
            <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
              <p className="text-xs font-semibold text-amber-900">Conversion notes</p>
              <ul className="mt-1.5 space-y-1">
                {parsed.warnings.map((warning, index) => (
                  <li key={`${warning}-${index}`} className="text-xs leading-relaxed text-amber-800/80">• {warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="lg:col-span-7 min-w-0 space-y-4">
          <div className="rounded-2xl bg-slate-900 p-4 md:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div role="tablist" aria-label="Output language" className="flex flex-wrap items-center gap-1">
                {TARGETS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={item.id === activeTarget.id}
                    onClick={() => { setTarget(item.id); setStatus(''); }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${FOCUS} ${item.id === activeTarget.id ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <button type="button" onClick={copyCode} disabled={!code} className={`rounded-lg border border-emerald-500/40 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 disabled:opacity-40 active:scale-95 transition-all ${FOCUS}`}>
                Copy
              </button>
            </div>
            <pre className="mt-3 max-h-[32rem] overflow-auto text-xs leading-6 font-mono text-emerald-100">
              {code || '// Paste a curl command on the left to generate code here.'}
            </pre>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 md:p-5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-emerald-800/80">How the conversion works</h3>
            <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-emerald-900/80">
              <li>• The method defaults to <span className="font-mono">POST</span> when a body flag is present and <span className="font-mono">GET</span> otherwise, matching curl.</li>
              <li>• A JSON body is emitted as a typed payload object instead of an escaped string literal.</li>
              <li>• <span className="font-mono">--user</span> becomes a base64 <span className="font-mono">Authorization: Basic</span> header, and <span className="font-mono">--max-time</span> becomes a timeout.</li>
              <li>• Everything runs in your browser, so secrets in the command are never uploaded.</li>
            </ul>
          </div>

          <p role="status" className="min-h-5 text-xs font-medium text-emerald-700">{status}</p>
        </div>
      </div>
    </section>
  );
}
