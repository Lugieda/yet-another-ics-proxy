import { WINDOWS_TO_IANA_MAP } from "windows-iana";

export function icsTranslator(ics: string): string {
  // Map Windows Timezones to IANA Timezones
  WINDOWS_TO_IANA_MAP.forEach(({ windowsName, iana }) => {
    const escaped = RegExp.escape(windowsName);
    const regex = new RegExp(`TZID([:=])${escaped}([:\r\n])`, "g");
    const replace = `TZID$1${iana.at(0)}$2`;
    ics = ics.replace(regex, replace);
  });

  // Strip out proprietary Microsoft X-properties
  const regex = new RegExp("^X-MICROSOFT-.*[\r\n]+", "gm");
  ics = ics.replace(regex, "");

  return ics;
}
