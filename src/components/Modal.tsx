import Popup from "../reuse/Popup"
import { ReactNode } from "react"

interface ModalProps {
  isOpen: boolean
  type: "success" | "alert" | "warning"
  icon: ReactNode
  title: string
  onOpenChange: (open: boolean) => void
  children?: ReactNode
}

const Modal = ({
  isOpen,
  type,
  icon,
  title,
  onOpenChange,
  children,
}: ModalProps) => (
  <Popup
    isOpen={isOpen}
    type={type}
    icon={icon}
    title={title}
    message={children}
    responseButtons={[{ label: "OK" }]}
    onOpenChange={onOpenChange}
  />
)

export default Modal
