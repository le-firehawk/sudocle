import { useSettings } from "./hooks/useSettings"
import { Moon, Sun } from "lucide-react"
import { useShallow } from "zustand/react/shallow"

const ThemeSwitcher = () => {
  const { theme, setTheme } = useSettings(
    useShallow(state => ({ theme: state.theme, setTheme: state.setTheme })),
  )
  const dark = theme === "sudocle-dark" || theme === "dark"
  function toggle() {
    setTheme(dark ? "default" : "sudocle-dark")
    window.setTimeout(() => (window as any)._updateTheme(), 0)
  }
  return (
    <button
      type="button"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="ml-3 inline-flex items-center gap-1 rounded-full border border-fg-500/50 bg-bg px-2 py-0.5 text-[0.55rem] hover:bg-button-hover"
      onClick={toggle}
    >
      {dark ? <Sun height="1em" /> : <Moon height="1em" />}
      {dark ? "Light" : "Dark"}
    </button>
  )
}

export default ThemeSwitcher
