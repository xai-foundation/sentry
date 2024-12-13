import { toast } from "react-toastify";

type ToastPositionType =
  | "top-left"
  | "top-right"
  | "top-center"
  | "bottom-left"
  | "bottom-right"
  | "bottom-center";

const toastPosition: ToastPositionType = "bottom-right";

export function successNotification(message: string) {
  toast.success(message, {
    position: toastPosition,
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: false,
    progress: undefined,
    theme: "light",
  });
}

export function errorNotification(message: string) {
  toast.error(message, {
    position: toastPosition,
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: false,
    progress: undefined,
    theme: "light",
  });
}

export function loadingNotification(message: string) {
  return toast.loading(message, {
    position: toastPosition,
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: false,
    progress: undefined,
    theme: "colored",
    style: { background: "black", color: "#D0CFCF" },
  });
}
