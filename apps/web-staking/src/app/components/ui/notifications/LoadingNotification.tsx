import { toast } from "react-toastify";

type ToastPositionType =
  | "top-left"
  | "top-right"
  | "top-center"
  | "bottom-left"
  | "bottom-right"
  | "bottom-center";
  
const toastPosition: ToastPositionType = "bottom-right";

const LoadingNotification = (message: string) => {
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
};

export default LoadingNotification;
