export const formatMinutes = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}ч ${mins}м` : `${mins}м`
}

export const formatHoursMinutes = (minutes: number): string => {
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  const h = String(hrs).padStart(2, '0')
  const m = String(mins).padStart(2, '0')
  return `${h}:${m}`
}
