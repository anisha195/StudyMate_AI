export default function ClayCard({ children, className = "", style, as: Tag = "div" }) {
  return (
    <Tag className={`clay-raised clay-card ${className}`} style={style}>
      {children}
    </Tag>
  );
}
