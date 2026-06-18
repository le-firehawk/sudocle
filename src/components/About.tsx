import { useSettings } from "./hooks/useSettings"

const About = () => {
  const theme = useSettings(state => state.theme)

  let currentYear = new Date().getFullYear()

  return (
    <div className="sidebar-page">
      <a
        href="https://github.com/michel-kraemer/sudocle"
        target="_blank"
        rel="noreferrer"
      >
        <div className="max-w-(--breakpoint-xs) mt-10 relative rounded bg-grey-700/70 p-3 pb-5">
          {theme !== "sudocle-dark" && theme !== "dark" && (
            <img src={require("../assets/logo.svg")} alt="Sudocle logo" />
          )}
          {(theme === "sudocle-dark" || theme === "dark") && (
            <img src={require("../assets/logo-white.svg")} alt="Sudocle logo" />
          )}
          <div className="font-bold text-base absolute -right-2 bottom-0 leading-none text-fg font-baloo">
            v{process.env.version}
          </div>
        </div>
      </a>
      <p className="mb-4 mt-2">
        Copyright &copy; 2020&ndash;{currentYear} le-firehawk
      </p>
      <p>
        This software is open source and has been released under the{" "}
        <a
          href="https://github.com/michel-kraemer/sudoku/blob/main/LICENSE"
          target="_blank"
          rel="noreferrer"
        >
          MIT license
        </a>
        . This is a fork of the original Sudocle project at{" "}
        <a
          href="https://github.com/michel-kraemer/sudocle"
          target="_blank"
          rel="noreferrer"
        >
          michel-kraemer/sudocle
        </a>
        . The fork source code is available on{" "}
        <a
          href="https://github.com/michel-kraemer/sudocle"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
        .
      </p>

      <h3>Acknowledgements</h3>
      <p>
        Sudocle has been inspired by the official web app of{" "}
        <a
          href="https://www.youtube.com/c/CrackingTheCryptic"
          target="_blank"
          rel="noreferrer"
        >
          Cracking the Cryptic
        </a>
        , the world’s most popular YouTube channel about Sudoku and other logic
        puzzles.
      </p>
      <p>
        The Wong colour palette is based on Wong, B. (2011). Points of view:
        Color blindness. <em>Nat Methods</em> 8, 441.{" "}
        <a
          href="https://doi.org/10.1038/nmeth.1618"
          target="_blank"
          rel="noreferrer"
        >
          https://doi.org/10.1038/nmeth.1618
        </a>
      </p>
    </div>
  )
}

export default About
