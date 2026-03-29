import Link from "next/link";

export function DashboardCard({
  title,
  eyebrow,
  description,
  href,
  cta
}: {
  title: string;
  eyebrow: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="glass card">
      <div className="badge">{eyebrow}</div>
      <h2 className="section-title" style={{ marginTop: 18 }}>
        {title}
      </h2>
      <p className="section-copy">{description}</p>
      <Link href={href} className="primary-btn" style={{ display: "inline-flex", marginTop: 20 }}>
        {cta}
      </Link>
    </div>
  );
}
