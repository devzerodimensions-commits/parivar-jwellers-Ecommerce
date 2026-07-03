import { ENQUIRY_TEL_HREF } from '../config/contact.js';

/**
 * Reusable "Call for Enquiry" button.
 *
 * Renders a semantic <a href="tel:…"> so a single tap opens the device dialer on
 * mobile (number pre-filled) and the default calling app on desktop. Anchors are
 * keyboard-accessible by default (focusable + Enter activates).
 *
 * Pass `className` / `children` so each placement keeps its own design — this
 * component only changes the behaviour, not the look.
 */
const EnquiryButton = ({ className = '', children, ...rest }) => (
  <a href={ENQUIRY_TEL_HREF} aria-label="Call for Enquiry" className={className} {...rest}>
    {children}
  </a>
);

export default EnquiryButton;
