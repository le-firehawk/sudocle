import clsx from "clsx"
import { MouseEvent, MouseEventHandler, ReactNode } from "react"

interface ButtonProps {
  active?: boolean
  disabled?: boolean
  onClick: MouseEventHandler
  noPadding?: boolean
  children: ReactNode
}

const Button = ({
  active = false,
  disabled = false,
  onClick,
  noPadding = false,
  children,
}: ButtonProps) => {
  function onClickInternal(e: MouseEvent) {
    if (!disabled && onClick !== undefined) {
      onClick(e)
    }
    e.stopPropagation()
  }

  return (
    <div
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      className={clsx(
        "flex flex-1 text-fg rounded justify-center items-center select-none leading-4 relative focus:outline-hidden",
        disabled
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer hover:bg-button-hover",
        noPadding ? "p-0" : "p-1",
        active ? "bg-button-active" : "bg-grey-700",
      )}
      onClick={onClickInternal}
    >
      {children}
    </div>
  )
}

export default Button
