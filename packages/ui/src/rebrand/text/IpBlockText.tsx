/**
 * Interface representing the props for the IpBlockText component.
 * @interface IpBlockTextProps
 * @property {string} [classNames] - Optional CSS class names to style the component.
 */
interface IpBlockTextProps {
    classNames?: string;
}

/**
 * React functional component that displays a text message indicating that the user is unable to access the website.
 * @param {IpBlockTextProps} props - The properties passed to the component.
 * @returns {JSX.Element} The rendered component.
 */
const IpBlockText = ({ classNames }: IpBlockTextProps): JSX.Element => {
    // Return a paragraph element with optional class names applied
    return (
        <p className={classNames}>You are unable to access this website.</p>
    );
};

export default IpBlockText;
