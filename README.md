 # Sentry Code Repository

 This repository, named Sentry, is part of the Xai Foundation's infrastructure. It contains the codebase for various components, including:

 - **Sentry Nodes**: These nodes form the backbone of our network, ensuring secure and efficient communication. The repository includes smart contracts for running the rewards system for these Sentry Nodes.
 - **Challenger**: This component is responsible for challenging any suspicious activity on the network.
 - **Desktop and Web GUIs**: These graphical user interfaces allow users to interact with our network in a user-friendly manner.

 All of these components are designed to work together to provide a robust and secure infrastructure for the Xai Foundation. They are also designed to support our GitBook, which provides comprehensive documentation on how to use and interact with our network. You can access the GitBook at the following URL: https://xai-foundation.gitbook.io/

 **Sentry Node Agreement: https://xai.games/sentrynodeagreement**


## Global Web UI Components:
****
**Sentry repository uses shared components for 2 projects now:**
- **[Sentry Web](./apps/web-connect)**
- **[Operator Desktop](./apps/sentry-client-desktop)**

### UI Libraries/Frameworks
We minimized the usage of UI libraries/framewroks, so most of the shared/not shared components are written without any UI libraries/frameworks.

### Duplicated Components
All components in [web-staking](./apps/web-staking) which are also in [shared ui folder](./packages/ui/src/rebrand) are duplicated because **web-staking** is not integrated to monorepo.
So for further updates you need updated both variants of components to avoid merge-conflics or integrate **web-staking** to monorepo.

### Deprecated Components
Most of the components in [web-staking](./apps/web-staking) which are not in [ui folder](./apps/web-staking/src/app/components/ui) are deprecated and not used in whole or in part. 

### Shared components 
Next there will be a list of components, in which we will add a comment about whether it is used any ui library/framework or not.
There is a list of shared components:

**[Buttons](./packages/ui/src/rebrand/buttons)**
  * **ConnectButton.tsx:**
    * **Description:** Button that allows user connect his wallet.
    * **Defined in:** [File](./packages/ui/src/rebrand/buttons/ConnectButton.tsx)
  * **PrimaryButton.tsx:**
    * **Description:** Primary button.
    * **Defined in:** [File](./packages/ui/src/rebrand/buttons/PrimaryButton.tsx)
  * **TextButton.tsx:**
    * **Description:** Secondary button.
    * **Defined in:** [File](./packages/ui/src/rebrand/buttons/TextButton.tsx)

**[Callouts](./packages/ui/src/rebrand/callout)**
  * **BaseCallout.tsx:**
    * **Description:** Wrapper for other components/elements.
    * **Defined in:** [File](./packages/ui/src/rebrand/callout/BaseCallout.tsx)

**[Checkboxes](./packages/ui/src/rebrand/checkboxes)**
  * **MainCheckbox.tsx:**
    * **Description:** Checkbox.
    * **Defined in:** [File](./packages/ui/src/rebrand/checkboxes/MainCheckbox.tsx)

**[Dropdowns](./packages/ui/src/rebrand/dropdown)**
  * **Dropdown.tsx:**
    * **Description:** Dropdown.
    * **Defined in:** [File](./packages/ui/src/rebrand/dropdown/Dropdown.tsx)

**[Inputs](./packages/ui/src/rebrand/dropdown)**
  * **BaseInput.tsx:**
    * **Description:** Primary input for user information.
    * **Defined in:** [File](./packages/ui/src/rebrand/inputs/BaseInput.tsx)

**[Links](./packages/ui/src/rebrand/links)**
  * **ExternalLink.tsx:**
    * **Description:** Primary link.
    * **Defined in:** [File](./packages/ui/src/rebrand/links/ExternalLink.tsx)

**[Notifications](./packages/ui/src/rebrand/notifications)** 
  * **WarningNotification.tsx:**
    * **Description:** Primary warning notification.
    * **Defined in:** [File](./packages/ui/src/rebrand/notifications/WarningNotification.tsx)

**[Steppers](./packages/ui/src/rebrand/steppers)**
  * **MainStepper.tsx:**
    * **Description:** Counter with increase/decrease buttons.
    * **Defined in:** [File](./packages/ui/src/rebrand/steppers/MainStepper.tsx)

**[Tooltips](./packages/ui/src/rebrand/tooltip)**
  * **Tooltips.tsx:**
    * **Description:** Tooltip.
    * **Defined in:** [File](./packages/ui/src/rebrand/tooltip/Tooltip.tsx)
  * **SideBarTooltip.tsx:**
    * **Description:** Tooltip for sidebars.
    * **UI Library:** [RadixUI](https://www.radix-ui.com/themes/docs/components/tooltip). We encountered a problem with display and positioning when opening/closing sidebars, so we decided to use the library in some places. 
    * **Defined in:** [File](./packages/ui/src/rebrand/tooltip/SideBarTooltip.tsx)

### Not shared components. 
Not shared components are components that used on [Staking Website](https://app.xai.games/) but have not yet been transferred to monorepo ui folder from [web-staking](./apps/web-staking):

**[Buttons](./apps/web-staking/src/app/components/ui/buttons)**
  * **CTAButton.tsx:**
    * **Description:** Similar to primary button. Has another clip-path.
    * **Defined in:** [File](./apps/web-staking/src/app/components/ui/buttons/CTAButton.tsx)
  * **IconButton.tsx:**
    * **Description:** Button that has only icon as child element.
    * **Defined in:** [File](./apps/web-staking/src/app/components/ui/buttons/IconButton.tsx)
  * **ButtonBack.tsx:**
    * **Description:** Button that uses redirect user to previous page.
    * **Defined in:** [File](./apps/web-staking/src/app/components/ui/buttons/ButtonBack.tsx)

**[Radio](./apps/web-staking/src/app/components/ui/checkboxes)**
  * **Radio.tsx:**
    * **Description:** Radio group/button. Uses ReactContext for correct value handling.
    * **Defined in:** [File](./apps/web-staking/src/app/components/ui/checkboxes/Radio.tsx)

**[Inputs](./apps/web-staking/src/app/components/ui/inputs)**
  * **StakingInput.tsx:**
    * **Description:** Primary input for operations with user wallet's balance (stake/unstake/redeem).
    * **Defined in:** [File](./apps/web-staking/src/app/components/ui/inputs/StakingInput.tsx)

**[Modals](./apps/web-staking/src/app/components/ui/modals)**
  * **BaseModal.tsx:**
    * **Description:** Modal.
    * **Defined in:** [File](./apps/web-staking/src/app/components/ui/modals/BaseModal.tsx)

**[Notifications](./apps/web-staking/src/app/components/ui/notifications)**
  * **LoadingNotification.tsx:**
    * **Description:** Loading notification.
    * **UI Library:** [ReactToastify](https://www.npmjs.com/package/react-toastify). The best/most popular solution for such kind of components.
    * **Defined in:** [File](./apps/web-staking/src/app/components/ui/notifications/LoadingNotification.tsx)
  * **UpdateNotification.tsx:**
    * **Description:** Allows update state of notification.
    * **UI Library:** [ReactToastify](https://www.npmjs.com/package/react-toastify). The best/most popular solution for such kind of components.
    * **Defined in:** [File](./apps/web-staking/src/app/components/ui/notifications/UpdateNotification.tsx)

**[Pagination](./apps/web-staking/src/app/components/ui/pagination)**
  * **BasePagination.tsx:**
    * **Description:** Pagination.
    * **Defined in:** [File](./apps/web-staking/src/app/components/ui/pagination/BasePagination.tsx)
  * **BasePaginationItem.tsx:**
    * **Description:** Pagination page.
    * **Defined in:** [File](./apps/web-staking/src/app/components/ui/pagination/BasePaginationItem.tsx)

**[Spinners](./apps/web-staking/src/app/components/ui/spinners)**
  * **BaseSpinner.tsx:**
    * **Description:** Svg spinner.
    * **Defined in:** [File](./apps/web-staking/src/app/components/ui/spinners/BaseSpinner.tsx)

**[Toggles](./apps/web-staking/src/app/components/ui/toggles)**
  * **MainToggle.tsx:**
    * **Description:** Styled switcher between two states.
    * **Defined in:** [File](./apps/web-staking/src/app/components/ui/toggles/MainToggle.tsx)

**[React Cookie Consent](./apps/web-staking/src/app/components/ReactCookieConsent.tsx)**
  * **ReactCookieConsent.tsx:**
    * **Description:** Cookies consent component.
    * **UI Library:** [ReactCookieConsent](https://www.npmjs.com/package/react-cookie-consent) The best/most popular solution for such kind of components.
    * **Defined in:** [File](./apps/web-staking/src/app/components/ReactCookieConsent.tsx)