import MainTitle from "../titles/MainTitle";
import { Dispatch, SetStateAction, useState } from "react";
import { PoolTextarea } from "../textareas/TextareasComponent";
import { ERROR_MESSAGE, LABELS, PLACEHOLDERS } from "./enums/enums";
import BaseInput, { InputSizes } from "../ui/inputs/BaseInput";
import { BaseCallout } from "../ui";
import { WarningIcon } from "../icons/IconsComponent";

const POOL_LOGO_TEXT =
  "Your image URL can have a dramatic impact on your gas costs for pool creation and edits. We recommend using an image hosting service such as imgur that optimizes file size.";
const POOL_TRACKER_TEXT =
  "When people stake in your pool they will receive a tracker token to represent their stake. The tracker name and ticker are how this token will appear in their wallet and on block explorers like Arbiscan."

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
    const restrictedCharacters = /[-,.?!()[\]/]/g;

    const inputArr = input.toLowerCase().replace(/\n/g, " ").split(" ");
    const bannedList = [];

    for (let i = 0; i < inputArr.length; i++) {
      const wordWithoutCharacters = inputArr[i].replace(restrictedCharacters, "");
      if (bannedWords.includes(wordWithoutCharacters)) {
        bannedList.push(wordWithoutCharacters);
      }
    }

    return bannedList.length > 0 ? bannedList.filter((word, index, array) => array.indexOf(word) === index) : [];
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
      <div className="w-full border-b border-chromaphobicBlack bg-nulnOilBackground py-5 px-6 shadow-default">
        <MainTitle
          title="Pool details"
          classNames="text-[30px] font-bold !mb-0 normal-case"
        />
      </div>
      <div className="mb-[30px] w-full bg-nulnOilBackground px-6 pb-7 pt-5 shadow-default">

        <div className="mb-[20px] w-full">
          <BaseInput
            name="name"
            type="text"
            value={name}
            label="Pool name*"
            placeholder={PLACEHOLDERS.NAME}
            placeholderColor="placeholder-dugong text-lg"
            size={InputSizes.lg}
            isInvalid={showErrors && (errorMessage.name.length > 0 || name.length < 5)}
            onChange={(e) => handleChangeDetails(e, "name")}
          />
          {showErrors && (errorMessage.name.length > 0 || name.length < 5) && <BaseCallout isWarning extraClasses={{ calloutWrapper: "w-full mt-2 sm:text-base lg:text-lg", calloutFront: "!justify-start" }}>
            <WarningIcon className="mr-2"/>
            {name.length < 5 ? ERROR_MESSAGE.ENTER_TEXT : errorMessage.name}
          </BaseCallout>}
        </div>

        <div className="w-full mb-[30px]">
          <PoolTextarea
            name="description"
            value={description}
            label={LABELS.DESCRIPTION}
            placeholder={PLACEHOLDERS.DESCRIPTION}
            isInvalid={showErrors && (errorMessage.description.length > 0 || description.length < 10)}
            onChange={(e) => handleChangeDetails(e, "description")}
          />
          {showErrors && (errorMessage.description.length > 0 || description.length < 10) && <BaseCallout isWarning extraClasses={{ calloutWrapper: "w-full mt-2 sm:text-base lg:text-lg", calloutFront: "!justify-start" }}>
            <WarningIcon className="mr-2"/>
            {description.length < 10 ? ERROR_MESSAGE.DESCRIPTION : errorMessage.description}
          </BaseCallout>}
        </div>

        <div className="w-full sm:mb-[30px] lg:mb-[50px]">
          <BaseInput
            name="logoUrl"
            label="Pool logo"
            labelText={POOL_LOGO_TEXT}
            placeholder="Enter image URL here"
            placeholderColor="placeholder-dugong text-lg"
            value={logoUrl}
            size={InputSizes.lg}
            onChange={(e) => handleChangeDetails(e, "logoUrl")} />
        </div>

        {!hideTokenTrackers && (
          <>
          <div className="flex flex-col mb-2">
              <span className="text-lg text-americanSilver mb-2 font-bold">{"Token tracker name & ticker"}</span>
              <span className="text-lg text-americanSilver font-medium">{POOL_TRACKER_TEXT}</span>
          </div>
          <div className="w-full flex sm:flex-col lg:flex-row items-start">
            <div className="lg:w-[70%] sm:w-full lg:mr-4 sm:mb-[40px] lg:mb-0">

              <BaseInput
                name="trackerName"
                value={trackerName}
                label=""
                placeholder="Enter tracker name here"
                placeholderColor="placeholder-dugong text-lg"
                size={InputSizes.lg}
                isInvalid={showErrors && errorMessage.trackerName.length > 0}
                onChange={(e) => handleChangeDetails(e, "trackerName")}
              />
              {showErrors && errorMessage.trackerName.length > 0 && <BaseCallout isWarning extraClasses={{ calloutWrapper: "w-full mt-2 sm:text-base lg:text-lg", calloutFront: "!justify-start" }}>
                <WarningIcon className="mr-2"/>
                 {errorMessage.trackerName}
              </BaseCallout>}

            </div>

            <div className="lg:w-[30%] sm:w-full">
              <BaseInput
                name="trackerTicker"
                value={trackerTicker}
                label=""
                placeholder="Enter ticker here"
                placeholderColor="placeholder-dugong text-lg"
                size={InputSizes.lg}
                isInvalid={showErrors && errorMessage.trackerTicker.length > 0}
                onChange={(e) => handleChangeDetails(e, "trackerTicker")}
              />
              {showErrors && errorMessage.trackerTicker.length > 0 && <BaseCallout isWarning extraClasses={{ calloutWrapper: "w-full mt-2 sm:text-base lg:text-sm", calloutFront: "!justify-start !py-[17px]" }}>
                <WarningIcon className="mr-2"/>
                 {errorMessage.trackerTicker}
              </BaseCallout>}
            </div>

            </div>
          </>
        )}
      </div>
    </>
  );
};

export default PoolDetailsComponent;
