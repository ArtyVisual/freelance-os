"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AiOutlineThunderbolt } from "react-icons/ai";
import { FiMenu, FiX } from "react-icons/fi";
import { useSession } from "next-auth/react";
import { useState } from "react";

const links = [
  { name: "Dashboard", href: "/dashboard", roles: ["admin", "client"] },
  { name: "Clients", href: "/dashboard/clients", roles: ["admin"] },
  { name: "Projects", href: "/dashboard/projects", roles: ["admin", "client"] },
  { name: "Payments", href: "/dashboard/payments", roles: ["admin", "client"] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  if (status === "loading") return null;

  const role = (session?.user as any)?.role;

  const filteredLinks = links.filter(link =>
    link.roles.includes(role)
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-gray-900 p-2 rounded-md border border-gray-700"
      >
        <FiMenu size={20} />
      </button>

      {/* OVERLAY */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`
          sidebar fixed top-0 left-0 h-full w-64 bg-gray-900 border-r border-gray-800 p-3 z-50
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static
        `}
      >
        {/* 🔥 CLOSE BUTTON (MOBILE) */}
        <div className="flex justify-between items-center mb-6 lg:hidden">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <AiOutlineThunderbolt />
            FreelanceOS
          </h2>

          <button onClick={() => setOpen(false)}>
            <FiX size={20} />
          </button>
        </div>

        {/* 🔥 DESKTOP TITLE */}
        <h2 className="hidden lg:flex text-xl font-bold mb-8 justify-center items-center gap-2">
          <AiOutlineThunderbolt />
          FreelanceOS
        </h2>

        {/* NAV */}
        <nav className="space-y-3">
          {filteredLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setOpen(false)} // close on click (mobile)
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

        {/* FOOTER */}
        <div className="landing-footer mt-10">
          <a
            href="https://abbas-vajwana-portfolio.vercel.app/"
            target="_blank"
            className="footer-link"
          >
            Abbas Wajvana
          </a>

          <span className="footer-sep">•</span>

          <a
            href="https://github.com/Artyvisual"
            target="_blank"
            className="footer-link"
          >
            GitHub
          </a>

          <span className="footer-sep">•</span>

          <a
            href="https://www.linkedin.com/in/abbas-wajvana/"
            target="_blank"
            className="footer-link"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </>
  );
}