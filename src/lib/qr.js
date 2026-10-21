export function appBase() {
  return `${window.location.origin}${import.meta.env.BASE_URL.replace(/\/$/, '')}`
}
export function stallPath(companyId, fairId, code) {
  return `/c/${companyId}/${fairId}${code ? `?t=${encodeURIComponent(code)}` : ''}`
}
export function stallUrl(companyId, fairId, code) {
  return `${appBase()}${stallPath(companyId, fairId, code)}`
}
export function checkinUrl(fairId) {
  return `${appBase()}/fair/${fairId}/checkin`
}
