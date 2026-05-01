"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { FiEdit, FiPlus, FiTrash2 } from "react-icons/fi";
import Loader from "@/components/Loader";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation"
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

export default function ClientsPage() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const [showModal, setShowModal] = useState(false);
  const [editClient, setEditClient] = useState<any>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");

  if ((session?.user as any)?.role === "client") {
    redirect("/dashboard"); // 🔥 block access
  }

  // FETCH CLIENTS
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const res = await fetch("/api/clients");
      return res.json();
    },
  });

  // ADD / UPDATE MUTATION
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const method = data.id ? "PUT" : "POST";

      return fetch("/api/clients", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  // DELETE MUTATION
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return fetch(`/api/clients?id=${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  const openAddModal = () => {
    setEditClient(null);
    setName("");
    setEmail("");
    setCompany("");
    setShowModal(true);
  };

  const openEditModal = (client: any) => {
    setEditClient(client);
    setName(client.name);
    setEmail(client.email);
    setCompany(client.company || "");
    setShowModal(true);
  };

  const handleSubmit = async () => {
    const res = await saveMutation.mutateAsync({
      id: editClient?.id,
      name,
      email,
      company,
    });

    // convert response
    const data = await res.json();

    setShowModal(false);

    // 🔥 ONLY show for new client (not edit)
    if (!editClient && data?.tempPassword) {
      Swal.fire({
        title: "Client Created",
        customClass: {
          popup: "swal-popup",
          title: "swal-title",
        },
        showConfirmButton: false,
        html: `
      <div class="swal-content">

        <div>
          <p class="swal-label">Email</p>
          <div class="swal-box">${email}</div>
        </div>

        <div style="margin-top:12px;">
          <p class="swal-label">Password</p>
          <div class="swal-box">
            <span id="pass-text">${data.tempPassword}</span>
            <button id="copy-btn" class="swal-copy-btn">
              📋
            </button>
          </div>
        </div>

        <p class="swal-warning">
          ⚠ Save this password. It won’t be shown again.
        </p>

      </div>
    `,
        didOpen: () => {
          const btn = document.getElementById("copy-btn");

          btn?.addEventListener("click", () => {
            navigator.clipboard.writeText(data.tempPassword);

            btn.classList.add("success");
            btn.innerHTML = "✔";
          });
        },
      });
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This client will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      await deleteMutation.mutateAsync(id);

      await Swal.fire({
        title: "Deleted!",
        text: "Client has been removed.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  type ClientType = {
  userId: string;
};

  const handleResetPassword = async (client: ClientType) => {
    const res = await fetch("/api/clients", {
      method: "PATCH",
      body: JSON.stringify({ userId: client.userId }),
    });

    const data = await res.json();

    Swal.fire({
      title: "New Password",
      text: data.newPassword,
    });
  };

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold">Clients</h2>

        <button onClick={openAddModal} className="btn icon-add">
          <FiPlus />
        </button>
      </div>

      {/* LIST */}
      {isLoading ? (
        <Loader />
      ) : clients.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {clients.map((client: any) => (
            <div key={client.id} className="card table-card">
              <div className="grid grid-cols-4 items-center">
                <div>
                  <p className="text-xs text-gray-400">Name</p>
                  <h2 className="mb-0 text-md text-white">{client?.name}</h2>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-md text-white">{client.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Company</p>
                  <p className="text-md text-white">{client.company}</p>
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    className="icon-btn"
                    onClick={() => handleResetPassword(client)}
                  >
                    🔑
                  </button>
                  <button
                    className="icon-btn icon-edit"
                    onClick={() => openEditModal(client)}
                  >
                    <FiEdit />
                  </button>
                  <button
                    className="icon-btn icon-delete"
                    onClick={() => handleDelete(client.id)}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-records">No Clients Availbale!</div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded-lg w-[400px]">
            <h3 className="text-lg text-center font-semibold mb-4">
              {editClient ? "Edit Client" : "Add Client"}
            </h3>

            <input
              className="input"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              className="input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="input"
              placeholder="Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />

            <div className="flex justify-center gap-2 mt-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={saveMutation.isPending}
                className="px-4 py-2 bg-gray-700 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="btn btn-primary"
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}