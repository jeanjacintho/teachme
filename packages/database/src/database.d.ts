import { PrismaClient } from '@prisma/client';
export declare const prisma: PrismaClient<{
    datasources: {
        db: {
            url: string;
        };
    };
}, never, import("@prisma/client/runtime/library").DefaultArgs>;
export declare function connectDatabase(): Promise<void>;
export declare function disconnectDatabase(): Promise<void>;
export declare function initializeDatabase(): Promise<void>;
export declare function clearDatabase(): Promise<void>;
export declare function getAllCourses(): Promise<({
    videos: {
        id: string;
        name: string;
        path: string;
        createdAt: Date;
        updatedAt: Date;
        duration: number | null;
        size: number | null;
        courseId: string;
        order: number;
    }[];
    tags: {
        id: string;
        courseId: string;
        tag: string;
    }[];
} & {
    id: string;
    name: string;
    path: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
})[]>;
export declare function getVideosByCourse(courseId: string): Promise<({
    tags: {
        id: string;
        videoId: string;
        tag: string;
    }[];
    progress: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        duration: number;
        videoId: string;
        currentTime: number;
        watched: boolean;
        lastWatched: Date;
    } | null;
    favorites: {
        id: string;
        createdAt: Date;
        videoId: string;
    }[];
    ratings: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        videoId: string;
        rating: number;
        comment: string | null;
    }[];
} & {
    id: string;
    name: string;
    path: string;
    createdAt: Date;
    updatedAt: Date;
    duration: number | null;
    size: number | null;
    courseId: string;
    order: number;
})[]>;
export declare function saveVideoProgress(videoId: string, currentTime: number, duration: number, watched: boolean): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    duration: number;
    videoId: string;
    currentTime: number;
    watched: boolean;
    lastWatched: Date;
}>;
export declare function setFavorite(videoId: string, isFavorite: boolean): Promise<import("@prisma/client").Prisma.BatchPayload | {
    id: string;
    createdAt: Date;
    videoId: string;
}>;
export declare function saveVideoRating(videoId: string, rating: number, comment?: string): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    videoId: string;
    rating: number;
    comment: string | null;
}>;

export declare function getAutoPlaySetting(): Promise<boolean>;

export declare function isFavorite(filePath: string): Promise<boolean>;

export declare function getFavorites(): Promise<{ filePath: string; name: string }[]>;
