"use client";

import { Id, toast } from "react-toastify";
import { CheckMark } from "../icons/IconsComponent";
import { getNetwork, getWeb3Instance } from "@/services/web3.service";

type ToastPositionType =
  | "top-left"
  | "top-right"
  | "top-center"
  | "bottom-left"
  | "bottom-right"
  | "bottom-center";

const toastPosition: ToastPositionType = "bottom-right";
const toastMarkUp = (message: string, receipt: string, explorer: string) => (
  <>
    <span className="mr-2 font-normal text-base">{message}</span>
    <a
      href={`${explorer}tx/${receipt}`}
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
  receipt?: string,
  chainId?: number,
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
      render: toastMarkUp(message, receipt || "", getWeb3Instance(getNetwork(chainId)).explorer),
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
