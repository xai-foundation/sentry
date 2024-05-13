import MainTitle from "../titles/MainTitle";
import { Dispatch, SetStateAction, useState } from "react";
import { PoolInput } from "../input/InputComponent";
import { PoolTextarea } from "../textareas/TextareasComponent";
import { Tooltip, divider } from "@nextui-org/react";
import { ERROR_MESSAGE, LABELS, PLACEHOLDERS } from "./enums/enums";
import PopoverWindow from "../staking/PopoverWindow";

const POOL_TOOLTIP_TEXT =
  "This pool name will be displayed in public. Please don't exceed the maximum characters of 24.";

export type PoolDetails = {
  name: string;
  description: string;
  logoUrl: string;
  trackerName: string;
  trackerTicker: string;
};

export type PoolDetailsError = {
  name: boolean;
  description: boolean;
  logoUrl: boolean;
  trackerName: boolean;
  trackerTicker: boolean;
};

interface PoolDetailsProps {
  poolDetailsValues: PoolDetails;
  setPoolDetailsValues: Dispatch<SetStateAction<PoolDetails>>;
  setError: Dispatch<SetStateAction<PoolDetailsError>>;
  hideTokenTrackers?: boolean;
  bannedWords: string[];
  showErrors?: boolean;
}

const PoolDetailsComponent = ({
  poolDetailsValues,
  setPoolDetailsValues,
  setError,
  hideTokenTrackers,
  bannedWords,
  showErrors,
}: PoolDetailsProps) => {
  const { name, description, logoUrl, trackerName, trackerTicker } = poolDetailsValues;
  const [errorMessage, setErrorMessage] = useState({
    name: "",
    description: "",
    logoUrl: "",
    trackerName: "",
    trackerTicker: "",
  });

  const hasBannedWords = (input: string, bannedWords: string[]): string[] => {
    if (!bannedWords) return [];
    
    const bannedList = [];
    for (let i = 0; i < bannedWords.length; i++) {
      if (input.toLowerCase().split(" ").includes(bannedWords[i])) {
        bannedList.push(bannedWords[i]);
      }
    }

    return bannedList;
  };

  const validateInputName = (value: string) => {
    if (value.length < 5) {
      return ERROR_MESSAGE.ENTER_TEXT;
    }

    if (value.length > 24) {
      return ERROR_MESSAGE.NAME_LENGTH;
    }

    const bannedWordsInInput = hasBannedWords(value, bannedWords);
    if (bannedWordsInInput.length > 0) {
      return `${ERROR_MESSAGE.BAD_WORD_MESSAGE}"${bannedWordsInInput.join(", ")}"`;
    }

    return "";
  };

  const validateInputDescription = (value: string) => {
    if (value.length < 10) {
      return ERROR_MESSAGE.DESCRIPTION;
    }

    if (value.length > 400) {
      return ERROR_MESSAGE.DESCRIPTION_LENGTH;
    }

    const bannedWordsInInput = hasBannedWords(value, bannedWords);
    if (bannedWordsInInput.length > 0) {
      return `${ERROR_MESSAGE.BAD_WORD_MESSAGE}"${bannedWordsInInput.join(", ")}"`;
    }

    return "";
  };

  const validationTrackerName = (value: string) => {
    if (value.length > 24) {
      return ERROR_MESSAGE.TRACKER_NAME;
    }
    return "";
  };

  const validationTicker = (value: string) => {
    if (value.length > 6) {
      return ERROR_MESSAGE.TICKER;
    }
    return "";
  };

  type PoolDetailKeys =
    | "name"
    | "description"
    | "logoUrl"
    | "trackerName"
    | "trackerTicker";

  const validationMap: { [key in PoolDetailKeys]: (value: string) => string } =
    {
      name: (value: string) => {
        return validateInputName(value);
      },
      description: (value: string) => {
        return validateInputDescription(value);
      },
      logoUrl: (value: string) => {
        return "";
      },
      trackerName: (value: string) => {
        return validationTrackerName(value);
      },
      trackerTicker: (value: string) => {
        return validationTicker(value);
      },
    };

  const handleChangeDetails = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: PoolDetailKeys
  ) => {
    const value = e.target.value;

    setPoolDetailsValues((state) => {
      const newState = { ...state };
      newState[e.target.name as keyof PoolDetails] = value;
      return newState;
    });

    const error = validationMap[key](value);

    if (error === "") {
      setError((state) => {
        const newState = { ...state };
        newState[key] = false;
        return newState;
      });

      setErrorMessage((state) => {
        const newState = { ...state };
        newState[key] = "";
        return newState;
      });
    } else {
      setError((state) => {
        const newState = { ...state };
        newState[key] = true;
        return newState;
      });

      setErrorMessage((state) => {
        const newState = { ...state };
        newState[key] = error;
        return newState;
      });
    }
  };

  return (
    <>
      <MainTitle title="Pool details" classNames="text-xl font-bold !mb-8" />
      <div className="mb-[40px] w-full">
        <Tooltip
          content={<span className="p-2 text-base">{POOL_TOOLTIP_TEXT}</span>}
        >
          <div className="mb-[20px] w-full">
            <PoolInput
              name="name"
              value={name}
              label={LABELS.NAME}
              placeholder={PLACEHOLDERS.NAME}
              isInvalid={showErrors && (errorMessage.name.length > 0 || name.length < 5)}
              type="text"
              onChange={(e) => handleChangeDetails(e, "name")}
              errorMessage={name.length < 5 ? ERROR_MESSAGE.ENTER_TEXT : errorMessage.name}
            />
          </div>
        </Tooltip>
        <div className="w-full mb-[80px]">
          <PoolTextarea
            name="description"
            value={description}
            label={LABELS.DESCRIPTION}
            placeholder={PLACEHOLDERS.DESCRIPTION}
            isInvalid={showErrors && (errorMessage.description.length > 0 || description.length < 10)}
            onChange={(e) => handleChangeDetails(e, "description")}
            errorMessage={description.length < 10 ? ERROR_MESSAGE.DESCRIPTION : errorMessage.description}
          />
        </div>
        <div className="w-full mb-[50px]">
          <PoolInput
            name="logoUrl"
            value={logoUrl}
            label="Pool logo"
            placeholder="Enter image URL here"
            onChange={(e) => handleChangeDetails(e, "logoUrl")}
          />
        </div>
        {!hideTokenTrackers && (
          <div className="w-full flex sm:flex-col lg:flex-row">
            <div className="lg:w-[70%] sm:w-full lg:mr-4 sm:mb-[40px] lg:mb-0">
              <PoolInput
                name="trackerName"
                value={trackerName}
                placeholder="Enter name here"
                onChange={(e) => handleChangeDetails(e, "trackerName")}
                label={
                  <div className="flex items-center">
                    Token tracker name
                    <PopoverWindow tokenText />
                  </div>
                }
                isInvalid={showErrors && errorMessage.trackerName.length > 0}
                errorMessage={errorMessage.trackerName}
              />
            </div>
            <div className="lg:w-[30%] sm:w-full">
              <PoolInput
                name="trackerTicker"
                value={trackerTicker}
                label="Token tracker ticker"
                placeholder="Enter ticker here"
                onChange={(e) => handleChangeDetails(e, "trackerTicker")}
                isInvalid={showErrors && errorMessage.trackerTicker.length > 0}
                errorMessage={errorMessage.trackerTicker}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PoolDetailsComponent;
