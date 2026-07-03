import { useSettings } from "./hooks/useSettings"
import { Moon, Sun } from "lucide-react"
import { useEffect } from "react"
import { useShallow } from "zustand/react/shallow"

const ThemeSwitcher = () => {
  const { theme, setTheme } = useSettings(
    useShallow(state => ({ theme: state.theme, setTheme: state.setTheme })),
  )
  const dark = theme === "sudocle-dark" || theme === "dark"

  useEffect(() => {
    ;(window as any)._updateTheme?.(theme)
  }, [theme])

  function toggle() {
    let nextTheme = dark ? "default" : "sudocle-dark"
    ;(window as any)._updateTheme(nextTheme)
    setTheme(nextTheme)
  }
  return (
    <button
      type="button"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="ml-3 inline-flex h-5 items-center gap-1 rounded-full border border-fg-500/50 bg-bg px-2 text-[0.55rem] leading-none hover:bg-button-hover"
      onClick={toggle}
    >
      <span className="inline-flex cursor-pointer items-center gap-1">
        {dark ? <Sun height="1em" /> : <Moon height="1em" />}
        <span>{dark ? "Light" : "Dark"}</span>
      </span>
    </button>
  )
}

export default ThemeSwitcher
