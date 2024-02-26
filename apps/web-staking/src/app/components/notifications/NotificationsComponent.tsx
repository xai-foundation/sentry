import { Id, toast } from "react-toastify";
import { CheckMark } from "../icons/IconsComponent";

type ToastPositionType =
  | "top-left"
  | "top-right"
  | "top-center"
  | "bottom-left"
  | "bottom-right"
  | "bottom-center";

const toastPosition: ToastPositionType = "bottom-right";
const toastMarkUp = (message: string, receipt?: string) => (
  <>
    <span className="mr-2 font-normal text-base">{message}</span>
    <a
      href={`https://sepolia.arbiscan.io/tx/${receipt}`}
      target="_blank"
      className="text-red font-medium"
    >
      View
    </a>
  </>
);

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
    theme: "light",
  });
}

export function updateNotification(
  message: string,
  loadingToast: Id,
  isError: boolean,
  receipt?: string
) {
  if (isError) {
    toast.update(loadingToast, {
      render: message,
      type: "error",
      isLoading: false,
      autoClose: 3000,
    });
  } else {
    toast.update(loadingToast, {
      render: toastMarkUp(message, receipt),
      type: "success",
      style: {
        boxShadow: "0px 3px 6px #00000026",
      },
      icon: <CheckMark />,
      isLoading: false,
      autoClose: 10000,
      closeButton: true,
    });
  }
}
