function DesignCard({
  design,
  isAvailable,
  onSelect,
}) {
  const title =
    design.title || design.name || "Custom Design";

  const category =
    design.category || "Custom Stitching";

  const description =
    design.description ||
    "Customized stitching based on your requirements.";

  const price =
    typeof design.price === "number"
      ? `Starting ₹${design.price.toLocaleString("en-IN")}`
      : design.price || "Contact tailor";

  return (
    <div className="design-card">

      <div className="design-image-wrapper">
        <img
          src={design.image}
          alt={title}
          className="design-image"
        />
      </div>

      <div className="design-content">

        <div className="design-top">

          <span className="design-category">
            {category}
          </span>

        </div>

        <h3>{title}</h3>

        <p>{description}</p>

        <div className="design-footer">

          <strong>{price}</strong>

          <button
            type="button"
            onClick={() => onSelect(design)}
            disabled={!isAvailable}
          >
            {isAvailable
              ? "Use This Design"
              : "Unavailable"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default DesignCard;
