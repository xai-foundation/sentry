
## Global Web UI Components:
****
**Sentry repository uses shared components for 2 projects now:**
- **[Sentry Web](./apps/web-connect)**
- **[Operator Desktop](./apps/sentry-client-desktop)**

### UI Libraries/Frameworks
We minimized the usage of UI libraries/frameworks, so most of the shared/non-shared components are written without any UI libraries/frameworks.

### Duplicated Components
All components in [web-staking](./apps/web-staking) which are also in [shared ui folder](./packages/ui/src/rebrand) are duplicated because **web-staking** is not integrated into the monorepo.
Therefore, for further updates, you need to update both versions of the components to avoid merge conflicts or integrate **web-staking** into the monorepo.

### Deprecated Components
Most of the components in [web-staking](./apps/web-staking) which are not in the [ui folder](./apps/web-staking/src/app/components/ui) are deprecated and not used, either in whole or in part. They should be deleted.

**[Buttons](./apps/web-staking/src/app/components/buttons/ButtonsComponent.tsx)**:
 * **PrimaryButton:**
   * **Description:** Primary button.
   * **UI Library:** [NextUI](https://nextui.org/). Library that has good support from NextJS.
   * **Defined in:** [File](./apps/web-staking/src/app/components/buttons/ButtonsComponent.tsx)
* **SecondaryButton:**
    * **Description:** Secondary button.
    * **UI Library:** [NextUI](https://nextui.org/). Library that has good support from NextJS.
    * **Defined in:** [File](./apps/web-staking/src/app/components/buttons/ButtonsComponent.tsx)
* **ConnectButton:**
    * **Description:** Button that allows users connect their wallet.
    * **UI Library:** [NextUI](https://nextui.org/). Library that has good support from NextJS.
    * **Defined in:** [File](./apps/web-staking/src/app/components/buttons/ButtonsComponent.tsx)
* **ButtonBack:**
    * **Description:** Button that redirects the user to the previous page.
    * **UI Library:** [NextUI](https://nextui.org/). Library that has good support from NextJS.
    * **Defined in:** [File](./apps/web-staking/src/app/components/buttons/ButtonsComponent.tsx)

**[Wrappers](./apps/web-staking/src/app/components/borderWrapper/BorderWrapperComponent.tsx):**
* **BorderWrapperComponent.tsx:**
    * **Description:** Wrapper that added border and border radius.
    * **Defined in:** [File](./apps/web-staking/src/app/components/borderWrapper/BorderWrapperComponent.tsx)

**[Inputs](./apps/web-staking/src/app/components/input/InputComponent.tsx):**
* **CustomInput:**
    * **Description:** Primary input for user information.
    * **UI Library:** [NextUI](https://nextui.org/). Library that has good support from NextJS.
    * **Defined in:** [File](./apps/web-staking/src/app/components/input/InputComponent.tsx)
* **StakingInput:**
    * **Description:** Primary input for operations with user wallet's balance (stake/unstake/redeem).
    * **UI Library:** [NextUI](https://nextui.org/). Library that has good support from NextJS.
    * **Defined in:** [File](./apps/web-staking/src/app/components/input/InputComponent.tsx)
* **PoolInput:**
    * **Description:** Special input for pool pages.
    * **UI Library:** [NextUI](https://nextui.org/). Library that has good support from NextJS.
    * **Defined in:** [File](./apps/web-staking/src/app/components/input/InputComponent.tsx)

**[Links](./apps/web-staking/src/app/components/links/LinkComponent.tsx):**
* **LinkComponent:**
    * **Description:** Primary link.
    * **Defined in:** [File](./apps/web-staking/src/app/components/links/LinkComponent.tsx)
* **LinkLogoComponent:**
    * **Description:** Link with logo.
    * **Defined in:** [File](./apps/web-staking/src/app/components/links/LinkComponent.tsx)
* **ExternalLinkComponent:**
    * **Description:** Secondary link.
    * **Defined in:** [File](./apps/web-staking/src/app/components/links/LinkComponent.tsx)
* **LegalLink:**
    * **Description:** Tertiary link.
    * **Defined in:** [File](./apps/web-staking/src/app/components/links/LinkComponent.tsx)
      
**[Modals](./apps/web-staking/src/app/components/modal):**
* **ModalComponent:**
    * **Description:** Primary modal.
    * **UI Library:** [NextUI](https://nextui.org/). Library that has good support from NextJS.
    * **Defined in:** [File](./apps/web-staking/src/app/components/modal/ModalComponent.tsx)
* **ModalTermsAndConditions:**
    * **Description:** Special component with additional styles for terms/conditions.
    * **UI Library:** [NextUI](https://nextui.org/). Library that has good support from NextJS.
    * **Defined in:** [File](./apps/web-staking/src/app/components/modal/ModalComponent.tsx)

**[Notifications](./apps/web-staking/src/app/components/notifications/NotificationsComponent.tsx):**
* **toastMarkUp:**
    * **Description:** Mark up for notification.
    * **UI Library:** [ReactToastify](https://www.npmjs.com/package/react-toastify). The best/most popular solution for such kind of components.
    * **Defined in:** [File](./apps/web-staking/src/app/components/notifications/NotificationsComponent.tsx)
* **successNotification:**
    * **Description:** Success Notification.
    * **UI Library:** [ReactToastify](https://www.npmjs.com/package/react-toastify). The best/most popular solution for such kind of components.
    * **Defined in:** [File](./apps/web-staking/src/app/components/notifications/NotificationsComponent.tsx)
* **errorNotification:**
    * **Description:** Error Notification.
    * **UI Library:** [ReactToastify](https://www.npmjs.com/package/react-toastify). The best/most popular solution for such kind of components.
    * **Defined in:** [File](./apps/web-staking/src/app/components/notifications/NotificationsComponent.tsx)
* **loadingNotification:**
    * **Description:** Loading Notification.
    * **UI Library:** [ReactToastify](https://www.npmjs.com/package/react-toastify). The best/most popular solution for such kind of components.
    * **Defined in:** [File](./apps/web-staking/src/app/components/notifications/NotificationsComponent.tsx)
* **updateNotification:**
    * **Description:** Function for updating notifications.
    * **UI Library:** [ReactToastify](https://www.npmjs.com/package/react-toastify). The best/most popular solution for such kind of components.
    * **Defined in:** [File](./apps/web-staking/src/app/components/notifications/NotificationsComponent.tsx)

**[Pagination](./apps/web-staking/src/app/components/pagination/PaginationComponent.tsx):**
* **PaginationComponent:**
    * **Description:** Pagination.
    * **UI Library:** [NextUI](https://nextui.org/). Library that has good support from NextJS.
    * **Defined in:** [File](./apps/web-staking/src/app/components/pagination/PaginationComponent.tsx)

**[Popovers](./apps/web-staking/src/app/components/popovers/PopoversComponents.tsx):**
* **CustomPopover:**
    * **Description:** Popover.
    * **UI Library:** [NextUI](https://nextui.org/). Library that has good support from NextJS.
    * **Defined in:** [File](./apps/web-staking/src/app/components/popovers/PopoversComponents.tsx)

**[Radios](./apps/web-staking/src/app/components/radio/Radio.tsx):**
* **RadioCard:**
    * **Description:** Radio button.
    * **UI Library:** [NextUI](https://nextui.org/). Library that has good support from NextJS.
    * **Defined in:** [File](./apps/web-staking/src/app/components/radio/Radio.tsx)
* **RadioGroupWrapper:**
    * **Description:** Radio group for correct value handling.
    * **UI Library:** [NextUI](https://nextui.org/). Library that has good support from NextJS.
    * **Defined in:** [File](./apps/web-staking/src/app/components/radio/Radio.tsx)



### Shared components 
Next there will be a list of components, in which we will add a comment about whether it is using any ui library/framework or not.
Here is a list of the shared components:

**[Buttons](./packages/ui/src/rebrand/buttons)**
  * **ConnectButton.tsx:**
    * **Description:** Button that allows users connect their wallet.
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

### Non-shared Components:
Non-shared components are those utilized on the [Staking Website](https://app.xai.games/) but have not yet been migrated from the [web-staking](./apps/web-staking) repository to the monorepo UI folder:

**[Buttons](./apps/web-staking/src/app/components/ui/buttons)**
  * **CTAButton.tsx:**
    * **Description:** Similar to primary button. Has another clip-path.
    * **Defined in:** [File](./apps/web-staking/src/app/components/ui/buttons/CTAButton.tsx)
  * **IconButton.tsx:**
    * **Description:** Button that has only icon as child element.
    * **Defined in:** [File](./apps/web-staking/src/app/components/ui/buttons/IconButton.tsx)
  * **ButtonBack.tsx:**
    * **Description:** Button that redirects the user to the previous page.
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

**[Progress bars](./apps/web-staking/src/app/components/progress/Progress.tsx)**
* **Progress.tsx:**
    * **Description:** Styled switcher between two states.
    * **UI Library:** [NextUI](https://nextui.org/). Library that has good support from NextJS. Non-shared because it uses NextUI lib.
    * **Defined in:** [File](./apps/web-staking/src/app/components/progress/Progress.tsx)

**[Textareas](./apps/web-staking/src/app/components/textareas/TextareasComponent.tsx)**
* **Textareas.tsx:**
    * **Description:** Styled switcher between two states.
    * **UI Library:** [NextUI](https://nextui.org/). Library that has good support from NextJS. Non-shared because it uses NextUI lib.
    * **Defined in:** [File](./apps/web-staking/src/app/components/textareas/TextareasComponent.tsx)

**[Titles](./apps/web-staking/src/app/components/titles/MainTitle.tsx)**
* **MainTitle.tsx:**
    * **Description:** Styled title.
    * **Defined in:** [File](./apps/web-staking/src/app/components/titles/MainTitle.tsx)

**[Dropdowns](./apps/web-staking/src/app/components/dropdown)**
  * **SearchableDropdown.tsx:**
      * **Description:**  For correct application of custom dropdown styles with search the best solution is to apply styles via global css, as other ways do not give the desired result due to non simple custom styles
      * **Defined in:** [File](./apps/web-staking/src/app/components/dropdown/SearchableDropdown.tsx)


**[React Cookie Consent](./apps/web-staking/src/app/components/ReactCookieConsent.tsx)**
  * **ReactCookieConsent.tsx:**
    * **Description:** Cookies consent component.
    * **UI Library:** [ReactCookieConsent](https://www.npmjs.com/package/react-cookie-consent) The best/most popular solution for such kind of components.
    * **Defined in:** [File](./apps/web-staking/src/app/components/ReactCookieConsent.tsx)

### Removing duplicated components:
When removing duplicate components, you should be cautious about ensuring that the functionality remains intact. First, check the props and styles of the components to see if they are identical. Secondly, some components might have divergent functionality due to differences in specific tasks and goals, which means you need to carefully assess if they can truly be merged. The new consolidated component might become overly complex if it needs to handle many different use cases. Additionally, consider any side effects or dependencies each component might have, as these could impact the overall behavior of your application. Lastly, thoroughly test the unified component to ensure it meets all necessary requirements without introducing new bugs.