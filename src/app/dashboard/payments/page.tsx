"use client";

import { useState } from "react";
import { FiEdit, FiPlus, FiTrash2 } from "react-icons/fi";
import Loader from "@/components/Loader";
import {
    useQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import Swal from "sweetalert2";
import moment from "moment";
import { useSession } from "next-auth/react";

export default function PaymentsPage() {
    const queryClient = useQueryClient();
    const { data: session } = useSession();

    const [showModal, setShowModal] = useState(false);
    const [amount, setAmount] = useState("");
    const [projectId, setProjectId] = useState("");
    const [editPayment, setEditPayment] = useState<any>(null);

    // 🔹 GET PAYMENTS
    const { data: payments = [], isLoading } = useQuery({
        queryKey: ["payments"],
        queryFn: async () => {
            const res = await fetch("/api/payments");
            return res.json();
        },
    });

    // 🔹 GET PROJECTS (dropdown)
    const { data: projects = [] } = useQuery({
        queryKey: ["projects"],
        queryFn: async () => {
            const res = await fetch("/api/projects");
            return res.json();
        },
    });

    // 🔹 ADD PAYMENT
    const saveMutation = useMutation({
        mutationFn: async (data: any) => {
            const method = data.id ? "PUT" : "POST";

            return fetch("/api/payments", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payments"] });
            queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) =>
            fetch(`/api/payments?id=${id}`, { method: "DELETE" }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payments"] });
            queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
    });

    const openAddModal = () => {
        setEditPayment(null);
        setAmount("");
        setProjectId("");
        setShowModal(true);
    };

    const openEditModal = (p: any) => {
        setEditPayment(p);
        setAmount(p.amount);
        setProjectId(p.projectId);
        setShowModal(true);
    };

    const handleSubmit = async () => {
        if (!projectId || !amount || Number(amount) <= 0) return;

        await saveMutation.mutateAsync({
            id: editPayment?.id,
            projectId,
            amount,
        });

        setShowModal(false);
    };

    const handleDelete = async (id: string) => {
        const res = await Swal.fire({
            title: "Delete payment?",
            icon: "warning",
            showCancelButton: true,
        });

        if (res.isConfirmed) {
            await deleteMutation.mutateAsync(id);
        }
    };

    return (
        <div>
            {/* HEADER */}
            <div className="flex justify-between mb-6">
                <h2 className="text-2xl font-bold">Payments</h2>
                {(session?.user as any)?.role !== "client" && (
                    <button className="btn icon-add" onClick={openAddModal}>
                        <FiPlus />
                    </button>
                )}

            </div>

            {/* LIST */}
            {isLoading ? (
                <Loader />
            ) : payments.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {payments.map((p: any) => (
                        <div key={p.id} className="card table-card">
                            <div className="grid grid-cols-2 md:grid-cols-4 items-center">
                                <div>
                                    <p className="text-xs text-gray-400">Project</p>
                                    <h2 className="mb-0 text-md text-white">{p.project?.title}</h2>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 mt-1">Amount Paid</p>
                                    <p className="text-md text-green-400">₹ {p.amount}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 mt-1">Pay Date</p>
                                    <p className="text-md text-white">{moment(p.createdAt).format("DD MMM, YY")}</p>
                                </div>
                                {(session?.user as any)?.role !== "client" && (
                                    <div className="flex gap-2 md:justify-end">
                                        <button
                                            className="icon-btn icon-edit"
                                            onClick={() => openEditModal(p)}
                                        >
                                            <FiEdit />
                                        </button>
                                        <button
                                            className="icon-btn icon-delete"
                                            onClick={() => handleDelete(p.id)}
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="no-records">No Payments Available</div>
            )}

            {/* MODAL */}
            {showModal && (
                <div className="modal-backdrop">
                    <div className="modal">
                        <h3 className="text-center mb-4">
                            {editPayment ? "Edit Payment" : "Add Payment"}
                        </h3>

                        <select
                            className="select mb-2"
                            value={projectId}
                            onChange={(e) => setProjectId(e.target.value)}
                        >
                            <option value="">Select Project</option>
                            {projects.map((p: any) => (
                                <option key={p.id} value={p.id}>
                                    {p.title}
                                </option>
                            ))}
                        </select>

                        <input
                            className="input mb-2"
                            placeholder="Amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />

                        <div className="flex justify-center gap-2 mt-3">
                            <button
                                className="px-4 py-2 bg-gray-700 rounded"
                                onClick={() => setShowModal(false)}
                                disabled={saveMutation.isPending}
                            >
                                Cancel
                            </button>

                            <button className="btn btn-primary" onClick={handleSubmit}>
                                {saveMutation.isPending
                                    ? "Saving..."
                                    : editPayment
                                        ? "Update"
                                        : "Add"}
                            </button>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}