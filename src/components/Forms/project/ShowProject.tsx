"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { get } from "@/utils/api";
import {
    Loader2,
    Calendar,
    MapPin,
    Clock,
    Plus,
    Edit,
    Trash2
} from "lucide-react";

interface TimelineImage {
    id: number;
    project_timeline_id: number;
    image_path: string;
    created_at: string;
    updated_at: string;
}

interface Timeline {
    id: number;
    project_id: number;
    title: string;
    description: string;
    timeline_date: string;
    created_at: string;
    updated_at: string;
    images: TimelineImage[];
}

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
    timelines: Timeline[];
}

const ShowProject = () => {
    const router = useRouter();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get project ID from URL
    const { id } = useParams();

    useEffect(() => {
        const fetchProject = async () => {
            if (!id) return;

            try {
                setLoading(true);
                const response: any = await get<{ status: boolean; project: Project }>(`/projects/${id}`);

                if (response.status && response.project) {
                    setProject(response.project);
                } else {
                    setError("Project not found");
                    router.push('/projects');
                }
            } catch (err) {
                setError("Failed to fetch project details");
                console.error("Error fetching project:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [id, router]);

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

    const handleDeleteTimeline = async (timelineId: number) => {
        if (!project) return;

        if (window.confirm('Are you sure you want to delete this timeline?')) {
            try {
                await get(`/projects/${project.id}/timelines/${timelineId}`);
                setProject({
                    ...project,
                    timelines: project.timelines.filter(t => t.id !== timelineId)
                });
            } catch (err) {
                console.error('Error deleting timeline:', err);
                alert('Failed to delete timeline');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="rounded-sm border border-stroke bg-white p-8 text-center text-danger shadow-default dark:border-strokedark dark:bg-boxdark">
                {error || "Project not found"}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6">
            {/* Project Details Card */}
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                    <div className="flex items-center justify-between">
                        <h3 className="font-medium text-black dark:text-white">
                            Project Details
                        </h3>
                        <button
                            onClick={() => router.push(`/projects/edit/${project.id}`)}
                            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-white hover:bg-opacity-90"
                        >
                            <Edit size={16} />
                            Edit Project
                        </button>
                    </div>
                </div>

                <div className="p-6.5">
                    <div className="mb-4.5">
                        <h4 className="text-xl font-semibold text-black dark:text-white mb-2">
                            {project.title}
                        </h4>
                        <p className="text-gray-500 dark:text-gray-400">
                            {project.description}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4.5">
                        <div className="flex items-center gap-2">
                            <MapPin className="text-primary" />
                            <span>{project.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="text-primary" />
                            <span>
                                {new Date(project.start_date).toLocaleDateString()} -
                                {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Ongoing'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="text-primary" />
                            <span className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${getStatusColor(project.status)}`}>
                                {project.status.replace('_', ' ')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Project Timelines Section */}
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                    <div className="flex items-center justify-between">
                        <h3 className="font-medium text-black dark:text-white">
                            Project Timeline
                        </h3>
                        <button
                            onClick={() => router.push(`/projects/${project.id}/timelines/add`)}
                            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-white hover:bg-opacity-90"
                        >
                            <Plus size={16} />
                            Add Timeline
                        </button>
                    </div>
                </div>

                <div className="p-6.5">
                    {project.timelines.length === 0 ? (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                            No timeline entries yet
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {project.timelines.map((timeline) => (
                                <div
                                    key={timeline.id}
                                    className="border border-stroke rounded-sm p-4 dark:border-strokedark"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h5 className="text-lg font-semibold text-black dark:text-white">
                                                {timeline.title}
                                            </h5>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(timeline.timeline_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => router.push(`/projects/${project.id}/timelines/edit/${timeline.id}`)}
                                                className="text-primary hover:text-primary/80"
                                                title="Edit Timeline"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTimeline(timeline.id)}
                                                className="text-danger hover:text-danger/80"
                                                title="Delete Timeline"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <p className="mb-4 text-gray-600 dark:text-gray-300">
                                        {timeline.description}
                                    </p>

                                    {timeline.images.length > 0 && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {timeline.images.map((image) => (
                                                <div key={image.id} className="relative aspect-square">
                                                    <img
                                                        src={image.image_path}
                                                        alt={`Timeline image ${image.id}`}
                                                        className="w-full h-full object-cover rounded-lg"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShowProject;