"use client";

import { useEffect, useState } from "react";
import { get } from "@/utils/api";
import { Eye, Pencil, Trash2, Plus, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

interface Project {
    id: number;
    title: string;
    description: string;
    location: string;
    status: 'pending' | 'in_progress' | 'completed';
    start_date: string;
    end_date: string | null;
    created_at: string;
    updated_at: string;
}

const ProjectTable = () => {
    const navigate = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true);
                const response: any = await get<{ status: boolean; projects: Project[] }>('/projects');
                if (response.status) {
                    setProjects(response.projects);
                }
            } catch (err) {
                setError('Failed to fetch projects');
                console.error('Error fetching projects:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    if (loading) {
        return (
            <div className="rounded-sm border border-stroke bg-white p-8 text-center shadow-default dark:border-strokedark dark:bg-boxdark">
                Loading projects...
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-sm border border-stroke bg-white p-8 text-center text-danger shadow-default dark:border-strokedark dark:bg-boxdark">
                {error}
            </div>
        );
    }

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                await get(`/projects/${id}`);
                setProjects(projects.filter(project => project.id !== id));
            } catch (err) {
                console.error('Error deleting project:', err);
                alert('Failed to delete project');
            }
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-success text-success';
            case 'in_progress':
                return 'bg-warning text-warning';
            default:
                return 'bg-danger text-danger';
        }
    };

    return (
        <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
            <div className="flex justify-between mb-4">
                <h4 className="text-xl font-semibold text-black dark:text-white">
                    Projects
                </h4>
                <button
                    onClick={() => navigate.push('/projects/add')}
                    className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-white hover:bg-opacity-90"
                >
                    <Plus size={16} />
                    Add Project
                </button>
            </div>

            <div className="max-w-full overflow-x-auto">
                <table className="w-full table-auto">
                    <thead>
                        <tr className="bg-gray-2 text-left dark:bg-meta-4">
                            <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                                Project Name
                            </th>
                            <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                                Location
                            </th>
                            <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                                Timeline
                            </th>
                            <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                                Status
                            </th>
                            <th className="px-4 py-4 font-medium text-black dark:text-white">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.map((project) => (
                            <tr key={project.id}>
                                <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                                    <h5 className="font-medium text-black dark:text-white">
                                        {project.title}
                                    </h5>
                                    <p className="text-sm">{project.description}</p>
                                </td>
                                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                    <p className="text-black dark:text-white">
                                        {project.location}
                                    </p>
                                </td>
                                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        <p className="text-sm">
                                            {new Date(project.start_date).toLocaleDateString()} -
                                            {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Ongoing'}
                                        </p>
                                    </div>
                                </td>
                                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                    <p
                                        className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${getStatusColor(project.status)}`}
                                    >
                                        {project.status.replace('_', ' ')}
                                    </p>
                                </td>
                                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                    <div className="flex items-center space-x-3.5">
                                        <button
                                            className="hover:text-primary"
                                            onClick={() => navigate.push(`/projects/${project.id}/show`)}
                                            title="View Project"
                                        >
                                            <Eye className="h-5 w-5" />
                                        </button>
                                        <button
                                            className="hover:text-primary"
                                            onClick={() => navigate.push(`/projects/${project.id}/edit`)}
                                            title="Edit Project"
                                        >
                                            <Pencil className="h-5 w-5" />
                                        </button>
                                        <button
                                            className="hover:text-danger"
                                            onClick={() => handleDelete(project.id)}
                                            title="Delete Project"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProjectTable;