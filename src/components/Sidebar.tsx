"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AiOutlineThunderbolt } from "react-icons/ai";
import { useSession } from "next-auth/react";

const links = [
  { name: "Dashboard", href: "/dashboard", roles: ["admin", "client"] },
  { name: "Clients", href: "/dashboard/clients", roles: ["admin"] },
  { name: "Projects", href: "/dashboard/projects", roles: ["admin", "client"] },
  { name: "Payments", href: "/dashboard/payments", roles: ["admin", "client"] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  const role = session?.user?.role;
  console.log(role, session)

  const filteredLinks = links.filter(link =>
    link.roles.includes(role)
  );

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 p-5">
      <h2 className="text-xl font-bold mb-8 text-center flex items-center justify-center gap-2">
        <AiOutlineThunderbolt />
        <span>FreelanceOS</span>
      </h2>

      <nav className="space-y-3">
        {filteredLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className={`block px-4 py-2 rounded-lg transition ${
              pathname === link.href
                ? "bg-blue-600"
                : "hover:bg-gray-800"
            }`}
          >
            {link.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}