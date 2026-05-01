"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { FiEdit, FiTrash2, FiPlus, FiEye } from "react-icons/fi";
import Loader from "@/components/Loader";
import moment from "moment"
import { useSession } from "next-auth/react";

import {
    useQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

export default function ProjectsPage() {
    const queryClient = useQueryClient();
    const { data: session } = useSession();

    const [showModal, setShowModal] = useState(false);
    const [editProject, setEditProject] = useState<any>(null);

    const [title, setTitle] = useState("");
    const [budget, setBudget] = useState("");
    const [paid, setPaid] = useState("");
    const [deadline, setDeadline] = useState("");
    const [clientId, setClientId] = useState("");

    // 🔥 GET PROJECTS
    const { data: projects = [], isLoading } = useQuery({
        queryKey: ["projects"],
        queryFn: async () => {
            const res = await fetch("/api/projects");
            return res.json();
        },
    });

    // 🔥 GET CLIENTS (dropdown)
    const { data: clients = [] } = useQuery({
        queryKey: ["clients"],
        queryFn: async () => {
            const res = await fetch("/api/clients");
            return res.json();
        },
    });

    // 🔥 SAVE (add/update)
    const saveMutation = useMutation({
        mutationFn: async (data: any) => {
            const method = data.id ? "PUT" : "POST";

            return fetch("/api/projects", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
    });

    // 🔥 DELETE
    const deleteMutation = useMutation({
        mutationFn: async (id: string) =>
            fetch(`/api/projects?id=${id}`, { method: "DELETE" }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
    });

    const openAddModal = () => {
        setEditProject(null);
        setTitle("");
        setBudget("");
        setPaid("");
        setDeadline("");
        setClientId("");
        setShowModal(true);
    };

    const openEditModal = (p: any) => {
        setEditProject(p);
        setTitle(p.title);
        setBudget(p.budget || "");
        setPaid(p.paid || "");
        setDeadline(p.deadline ? p.deadline.split("T")[0] : "");
        setClientId(p.clientId);
        setShowModal(true);
    };

    const handleSubmit = async () => {
        await saveMutation.mutateAsync({
            id: editProject?.id,
            title,
            budget,
            paid,
            deadline,
            clientId,
        });

        setShowModal(false);
    };

    const handleDelete = async (id: string) => {
        const res = await Swal.fire({
            title: "Delete project?",
            text: "This cannot be undone",
            icon: "warning",
            showCancelButton: true,
        });

        if (res.isConfirmed) {
            await deleteMutation.mutateAsync(id);
        }
    };

    const openPaymentsModal = (payments: any[]) => {
        Swal.fire({
            title: "Payment History",
            width: 400,
            background: "#111827",
            color: "#fff",
            html: `
                <div style="max-height:250px; overflow-y:auto;">
                    ${payments
                    .map(
                        (pay) => `
                        <div style="
                        display:flex;
                        justify-content:space-between;
                        padding:8px;
                        border-bottom:1px solid #1f2937;
                        font-size:14px;
                        ">
                        <span>₹ ${pay.amount}</span>
                        <span style="color:#9ca3af">
                            ${new Date(pay.createdAt).toLocaleDateString()}
                        </span>
                        </div>
                    `
                    )
                    .join("")}
                </div>
                `,
            showConfirmButton: false,
        });
    };

    return (
        <div>
            {/* HEADER */}
            <div className="flex justify-between mb-6">
                <h2 className="text-2xl font-bold">Projects</h2>
                {session?.user?.role !== "client" && (
                    <button className="btn icon-add" onClick={openAddModal}>
                        <FiPlus />
                    </button>
                )}
            </div>

            {/* LIST */}
            {isLoading ? (
                <Loader />
            ) : projects.length > 0 ? (
                <div className="grid grid-cols-3 gap-6">
                    {projects.map((p: any) => {

                        const progress = p.budget ? (p.paid / p.budget) * 100 : 0;

                        const isCompleted = p.paid >= p.budget;

                        const isOverdue =
                            p.deadline &&
                            new Date(p.deadline) < new Date() &&
                            !isCompleted;

                        const latestPayment = p.payments?.[0];

                        return (
                            <div key={p.id} className="card project-card">

                                <div>

                                    {/* HEADER */}
                                    <div className="flex justify-between items-center mb-4">

                                        <div>
                                            <p className="text-xs text-gray-400">Project</p>
                                            <h2 className="text-lg font-semibold text-white">{p.title}</h2>
                                        </div>

                                        {session?.user?.role !== "client" && (
                                            <div className="flex gap-2">
                                                <button
                                                    className="icon-btn icon-edit"
                                                    onClick={() => openEditModal(p)}
                                                    title="Edit"
                                                >
                                                    <FiEdit />
                                                </button>

                                                <button
                                                    className="icon-btn icon-delete"
                                                    onClick={() => handleDelete(p.id)}
                                                    title="Delete"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        )}

                                    </div>

                                    {/* GRID DETAILS */}
                                    <div className="grid grid-cols-3 gap-3 text-sm">

                                        <div>
                                            <p className="text-gray-400 text-xs">Client</p>
                                            <p className="text-white">{p.client?.name}</p>
                                        </div>

                                        <div>
                                            <p className="text-gray-400 text-xs">Deadline</p>
                                            <p className={`text-sm ${isOverdue ? "text-red-400" : "text-white"}`}>
                                                {p.deadline
                                                    ? moment(p.deadline).format("DD MMM, YY")
                                                    : "No deadline"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-gray-400 text-xs mb-1">Status</p>
                                            <span
                                                className={`text-xs px-2 py-1 rounded ${isCompleted
                                                    ? "bg-green-500/20 text-green-400"
                                                    : isOverdue
                                                        ? "bg-red-500/20 text-red-400"
                                                        : "bg-yellow-500/20 text-yellow-400"
                                                    }`}
                                            >
                                                {isCompleted ? "Completed" : isOverdue ? "Overdue" : "Pending"}
                                            </span>
                                        </div>

                                        <div>
                                            <p className="text-gray-400 text-xs">Budget</p>
                                            <p className="text-white">₹ {p.budget}</p>
                                        </div>

                                        <div>
                                            <p className="text-gray-400 text-xs">Paid</p>
                                            <p className="text-white">₹ {p.paid}</p>
                                        </div>

                                        <div>
                                            <p className="text-gray-400 text-xs">Remaining</p>
                                            <p className="text-yellow-400">₹ {p.budget - p.paid}</p>
                                        </div>

                                        <div>
                                            <p className="text-gray-400 text-xs">Risk</p>
                                            <h3
                                                className={`text-sm font-semibold ${p.riskScore >= 70
                                                    ? "text-red-500"
                                                    : p.riskScore >= 40
                                                        ? "text-yellow-400"
                                                        : "text-green-400"
                                                    }`}
                                            >
                                                {p.riskScore}%
                                            </h3>
                                        </div>


                                        <div className="col-span-2">
                                         <p className="text-gray-400 text-xs">Payment History</p>

                                            {latestPayment ? (
                                                <div className="flex justify-between items-center text-sm">
                                                    <div>
                                                        <span className="text-white">₹ {latestPayment.amount}</span>
                                                        <span className="text-xs text-gray-500 pl-4">
                                                            {new Date(latestPayment.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>

                                                    {p.payments.length > 1 && (
                                                        <button
                                                            onClick={() => openPaymentsModal(p.payments)}
                                                            className="icon-btn"
                                                        >
                                                            <FiEye />
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-white">No payments</p>
                                            )}
                                        </div>

                                    </div>

                                    {/* PROGRESS BAR */}
                                    <div className="mt-4">
                                        <div className="w-full h-2 bg-gray-700 rounded">
                                            <div
                                                className={`h-2 rounded ${isCompleted ? "bg-green-500" : "bg-blue-500"
                                                    }`}
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                </div>


                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="no-records">No Projects</div>
            )}

            {/* MODAL */}
            {showModal && (
                <div className="modal-backdrop">
                    <div className="modal">
                        <h3 className="text-center mb-4">
                            {editProject ? "Edit Project" : "Add Project"}
                        </h3>

                        <input
                            className="input"
                            placeholder="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />

                        <input
                            className="input"
                            placeholder="Budget"
                            type="number"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                        />

                        <input
                            className="input"
                            placeholder="Paid"
                            type="number"
                            value={paid}
                            onChange={(e) => setPaid(e.target.value)}
                        />

                        <input
                            type="date"
                            className="input"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                        />

                        <select
                            className="select"
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                        >
                            <option value="">Select Client</option>
                            {clients.map((c: any) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>

                        <div className="flex justify-center gap-2 mt-4">
                            <button
                                onClick={() => setShowModal(false)}
                                className="btn"
                                disabled={saveMutation.isPending}
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