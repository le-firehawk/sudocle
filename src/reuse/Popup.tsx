import * as Dialog from "@radix-ui/react-dialog"
import Button from "../components/Button"
import clsx from "clsx"
import { ReactNode } from "react"

export interface PopupResponseButton {
  label: ReactNode
  onClick?: () => void
  active?: boolean
}

interface PopupProps {
  isOpen: boolean
  type: "success" | "alert" | "warning"
  icon?: ReactNode
  title: string
  message?: ReactNode
  responseButtons: PopupResponseButton[]
  onOpenChange: (open: boolean) => void
}

const Popup = ({
  isOpen,
  type,
  icon,
  title,
  message,
  responseButtons,
  onOpenChange,
}: PopupProps) => (
  <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-black/5 flex justify-center items-center z-100000 animate-fade-in">
        <Dialog.Content className="bg-bg shadow-[0_0_10px_rgba(0_0_0/75%)] focus:outline-hidden text-center rounded overflow-hidden">
          <div
            className={clsx(
              "py-4 px-12",
              type === "alert"
                ? "bg-modal-alert"
                : type === "warning"
                  ? "bg-modal-warning"
                  : "bg-modal-success",
            )}
          >
            <Dialog.Title className="font-medium flex flex-col items-center gap-0.5">
              {icon !== undefined && <div className="text-xs">{icon}</div>}
              <div className="text-lg leading-6">{title}</div>
            </Dialog.Title>
            {message !== undefined && <div className="text-xs">{message}</div>}
          </div>
          <div className="max-w-36 my-2 mx-auto flex flex-row justify-end gap-1 text-[0.6rem]">
            {responseButtons.map((button, i) => (
              <Button
                key={i}
                active={button.active}
                onClick={() => {
                  button.onClick?.()
                  onOpenChange(false)
                }}
              >
                {button.label}
              </Button>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Overlay>
    </Dialog.Portal>
  </Dialog.Root>
)

export default Popup
