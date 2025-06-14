import { forwardRef } from "react";

const SectionCard = forwardRef(({ title, children }, ref) => (
  <section ref={ref} className="card" id={title.toLowerCase().replace(/\s/g, "-")}>
    <h2>{title}</h2>
    {children}
  </section>
));

export default SectionCard;
