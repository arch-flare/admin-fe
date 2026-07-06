"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { get, getFullImageUrl, post, remove } from "@/utils/api";
import {
    Loader2,
    Calendar,
    MapPin,
    Clock,
    Plus,
    Edit,
    Trash2,
    ImagePlus,
    X
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

interface ProjectPhoto {
    id: number;
    project_id: number;
    image_path: string;
    created_at: string;
    updated_at: string;
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
    photos: ProjectPhoto[];
    timelines: Timeline[];
}

const ShowProject = () => {
    const router = useRouter();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploadingPhotos, setUploadingPhotos] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
    const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);

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
                await remove(`/projects/${project.id}/timelines/${timelineId}`);
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

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newPhotos = Array.from(files).filter(file => file.type.startsWith('image/'));

        setSelectedPhotos(prev => [...prev, ...newPhotos]);
        newPhotos.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreviewUrls(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });

        e.target.value = "";
    };

    const removeSelectedPhoto = (index: number) => {
        setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
        setPhotoPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleUploadPhotos = async () => {
        if (!project || selectedPhotos.length === 0) return;

        setUploadingPhotos(true);
        setError(null);

        try {
            const data = new FormData();
            selectedPhotos.forEach((photo, index) => {
                data.append(`photos[${index}]`, photo);
            });

            const response: any = await post(`/projects/${project.id}/photos`, data, { timeout: 300000 });

            if (response.status) {
                setProject({
                    ...project,
                    photos: response.photos,
                });
                setSelectedPhotos([]);
                setPhotoPreviewUrls([]);
            } else {
                setError("Failed to upload project photos. Please try again.");
            }
        } catch (err) {
            setError("Failed to upload project photos. Please try again.");
            console.error("Error uploading project photos:", err);
        } finally {
            setUploadingPhotos(false);
        }
    };

    const handleDeletePhoto = async (photoId: number) => {
        if (!project) return;

        if (window.confirm('Are you sure you want to delete this project photo?')) {
            try {
                await remove(`/project-photos/${photoId}`);
                setProject({
                    ...project,
                    photos: project.photos.filter(photo => photo.id !== photoId)
                });
            } catch (err) {
                console.error('Error deleting project photo:', err);
                alert('Failed to delete project photo');
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

            {/* Project Photos Section */}
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                    <div className="flex items-center justify-between">
                        <h3 className="font-medium text-black dark:text-white">
                            Project Photos
                        </h3>
                        <label
                            htmlFor="project-photo-upload"
                            className="flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-white hover:bg-opacity-90"
                        >
                            <ImagePlus size={16} />
                            Add Photos
                        </label>
                        <input
                            id="project-photo-upload"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handlePhotoChange}
                            className="hidden"
                        />
                    </div>
                </div>

                <div className="p-6.5">
                    {selectedPhotos.length > 0 && (
                        <div className="mb-6 rounded-sm border border-stroke p-4 dark:border-strokedark">
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-sm font-medium text-black dark:text-white">
                                    Ready to upload {selectedPhotos.length} photo{selectedPhotos.length === 1 ? '' : 's'}
                                </p>
                                <button
                                    type="button"
                                    onClick={handleUploadPhotos}
                                    disabled={uploadingPhotos}
                                    className="flex items-center gap-2 rounded bg-primary px-4 py-2 text-white hover:bg-opacity-90 disabled:bg-opacity-50"
                                >
                                    {uploadingPhotos ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus size={16} />}
                                    Upload
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                {photoPreviewUrls.map((url, index) => (
                                    <div key={url} className="relative aspect-square">
                                        <img
                                            src={url}
                                            alt={`Selected project photo ${index + 1}`}
                                            className="h-full w-full rounded-lg object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeSelectedPhoto(index)}
                                            className="absolute -right-2 -top-2 rounded-full bg-danger p-1 text-white hover:bg-opacity-90"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {project.photos.length === 0 ? (
                        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                            No project photos yet
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            {project.photos.map((photo) => (
                                <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg">
                                    <img
                                        src={getFullImageUrl(photo.image_path)}
                                        alt={`Project photo ${photo.id}`}
                                        className="h-full w-full object-cover transition group-hover:scale-105"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleDeletePhoto(photo.id)}
                                        className="absolute right-2 top-2 rounded-full bg-danger p-2 text-white opacity-0 transition hover:bg-opacity-90 group-hover:opacity-100"
                                        title="Delete Project Photo"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
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
                                                        src={getFullImageUrl(image.image_path)}
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
