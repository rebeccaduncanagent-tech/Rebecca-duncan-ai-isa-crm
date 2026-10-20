import { brand } from "@/lib/brand";

export function AiDisclosure() {
  return (
    <p className="notice">
      You may interact with an AI assistant that helps {brand.name} understand
      your needs. A licensed agent will review your information and follow up.
      Please don’t share sensitive personal information (such as SSN or bank
      details).
    </p>
  );
}

export function ConsentCheckbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="check">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>
        I agree that {brand.name} (sponsored by {brand.brokerage}) may contact
        me by phone, email, and text message (including automated messages)
        about my inquiry. Consent is not a condition of any purchase. Message
        and data rates may apply. Reply STOP to opt out.
      </span>
    </label>
  );
}
