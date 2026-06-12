export async function apiFetch(url, { method = 'GET', body, errorMsg, returnJson = true, parseBodyFirst = false } = {}) {
  const options = { method };
  if (body !== undefined) {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(body);
  }
  const res = await fetch(url, options);
  if (parseBodyFirst) {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || errorMsg || `요청 실패 (${res.status})`);
    return data;
  }
  if (!res.ok) throw new Error(errorMsg || `요청 실패 (${res.status})`);
  if (!returnJson) return true;
  return res.json();
}
