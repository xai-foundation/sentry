import { Id, toast } from "react-toastify";
import { getNetwork, getWeb3Instance } from "@/services/web3.service";
import { CheckMark } from "../../icons/IconsComponent";

const toastMarkUp = (message: string, receipt: string, explorer: string) => (
  <>
    <span className="mr-2 font-normal text-base">{message}</span>
    <a
      href={`${explorer}tx/${receipt}`}
      target="_blank"
      className="text-white font-medium underline"
    >
      View
    </a>
  </>
);

const UpdateNotification = (
  message: string,
  loadingToast: Id,
  isError: boolean,
  receipt?: string,
  chainId?: number
) => {
  if (isError) {
    toast.update(loadingToast, {
      render: message,
      type: "warning",
      isLoading: false,
      autoClose: 3000,
      theme: "light",
    });
  } else {
    toast.update(loadingToast, {
      render: toastMarkUp(
        message,
        receipt || "",
        getWeb3Instance(getNetwork(chainId)).explorer
      ),
      type: "success",
      style: {
        boxShadow: "0px 3px 6px #00000026",
        background: "black",
        color: "#D0CFCF",
      },
      icon: <CheckMark />,
      isLoading: false,
      autoClose: 10000,
      closeButton: true,
      theme: "colored",
    });
  }
}

export default UpdateNotification;
