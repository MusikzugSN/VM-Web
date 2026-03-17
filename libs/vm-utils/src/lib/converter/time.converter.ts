export function convertToDisplayMinutes(duration: number): string {
  // duration 10.5 -> "10:30"
  const minutes = Math.floor(duration);
  const seconds = Math.round((duration - minutes) * 60);
  return minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
}

export function convertToDurationValue(display: string): number {
  // display "10:30" -> 10.5
  const parts = display.split(':');
  if (parts.length !== 2) {
    return 0;
  }
  const minutes = parseInt(parts[0] ?? '', 10);
  const seconds = parseInt(parts[1] ?? '', 10);
  return minutes + seconds / 60;
}
