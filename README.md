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
Most of the shared/not shared components are written without any UI libraries/frameworks. Next there will be a list of components, in which we will add a comment about whether it is used any ui library/framework or not.

### Duplicated Components
All components in [web-staking](./apps/web-staking) which are also in [shared ui folder](./packages/ui/src/rebrand) are duplicated because **web-staking** is not integrated to monorepo.
So for further updates you need updated both variants of components to avoid merge-conflics or integrate **web-staking** to monorepo.

### Deprecated Components
Most of the components in [web-staking](./apps/web-staking) which are not in [ui folder](./apps/web-staking/src/app/components/ui) are deprecated and not and are not used at all or partially. 

### Shared components. 
Most of the components you can find [here](./packages/ui/src/rebrand).
There is a list of shared components:
* **[Buttons](./packages/ui/src/rebrand/buttons)**
  * **ConnectButton.tsx** - used for connect user wallet
  * **PrimaryButton.tsx** - red button with clip-path
  * **TextButton.tsx** - button without specific background and clip-path
* **[Callout](./packages/ui/src/rebrand/callout)**
  * **BaseCallout.tsx** - wrapper with specific styles, has 2 style schemas (default, warning) 
* **[Checkboxes](./packages/ui/src/rebrand/checkboxes)**
  * **MainCheckbox.tsx** - just a styled checkbox, nothing special.
* **[Dropdowns](./packages/ui/src/rebrand/dropdown)**
  * **Dropdown.tsx** - has specific functionality/styles. Invalid state (orange borders), preferableItems (items that appears at the top of the dropdown list) 
* **[Inputs](./packages/ui/src/rebrand/dropdown)**
  * **BaseInput.tsx** - just a styled input without any specific functionality/styles
* **[Links](./packages/ui/src/rebrand/links)**
  * **ExternalLink.tsx** - just a styled link tag.
* **[Notifications](./packages/ui/src/rebrand/notifications)** 
  * **WarningNotification.tsx** - similar to warning callout component. 
* **[Steppers](./packages/ui/src/rebrand/steppers)**
  * **MainStepper.tsx** - stepper component (kinda counter). Has increment/decrement buttons and can show value. 
* **[Tooltips](./packages/ui/src/rebrand/tooltip)**
  * **Tooltips.tsx** - regular tooltip (native).
  * **SideBarTooltip.tsx** - styled tooltip from [RadixUI](https://www.radix-ui.com/themes/docs/components/tooltip).

### Not shared components. 
Not shared components are components that used on [Staking Website](https://app.xai.games/) but have not yet been transferred to monorepo ui folder from [web-staking](./apps/web-staking):
* **[Buttons](./apps/web-staking/src/app/components/ui/buttons)**
  * **CTAButton.tsx** - similar to primary, but has another clip-path.
  * **IconButton.tsx** - button only with icon.
  * **ButtonBack.tsx** - button with text and back arrow icon.
* **[Radio](./apps/web-staking/src/app/components/ui/checkboxes)**
  * **Radio.tsx** - has 2 components: RadioGroup, RadioItem. Uses context for correct value handling.
* **[Inputs](./apps/web-staking/src/app/components/ui/inputs)**
  * **StakingInput.tsx** - input with specific styles. Uses for stake/unstake/redeem operations.
* **[Modals](./apps/web-staking/src/app/components/ui/modals)**
  * **BaseModal.tsx** - custom modal components, written without ui libs.
* **[Notifications](./apps/web-staking/src/app/components/ui/notifications)**
  * **LoadingNotification.tsx** - a notification component that show loader. Written with [React Toastify](https://www.npmjs.com/package/react-toastify) because it's the best solution for such component.
  * **UpdateNotification.tsx** - a notification component that allow update toast notification. Written with [React Toastify](https://www.npmjs.com/package/react-toastify) because it's the best solution for such component.
* **[Pagination](./apps/web-staking/src/app/components/ui/pagination)**
  * **BasePagination.tsx** - default pagination written without any ui libs.
  * **BasePaginationItem.tsx** - item of the pagination (1,2,3,4,5, etc.)
* **[Spinners](./apps/web-staking/src/app/components/ui/spinners)**
  * **BaseSpinner.tsx** - default svg spinner that uses to show loading state on buttons.
* **[Toggles](./apps/web-staking/src/app/components/ui/toggles)**
  * **MainToggle.tsx** - a toggle component to switch between two states. Written without any ui libs.
* **[React Cookie Consent](./apps/web-staking/src/app/components/ReactCookieConsent.tsx)**
  * **MainToggle.tsx** - component from [react-cookie-consent](https://www.npmjs.com/package/react-cookie-consent) library because it's the best solution for such component.


