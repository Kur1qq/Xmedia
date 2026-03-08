import { PrismaService } from '../prisma.service';
export declare class HeroService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        image: string;
        isActive: boolean;
        description: string | null;
        title: string;
        highlight: string | null;
        subTitle: string | null;
        order: number;
    }[]>;
    findActive(): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        image: string;
        isActive: boolean;
        description: string | null;
        title: string;
        highlight: string | null;
        subTitle: string | null;
        order: number;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        image: string;
        isActive: boolean;
        description: string | null;
        title: string;
        highlight: string | null;
        subTitle: string | null;
        order: number;
    }>;
    create(data: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        image: string;
        isActive: boolean;
        description: string | null;
        title: string;
        highlight: string | null;
        subTitle: string | null;
        order: number;
    }>;
    update(id: number, data: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        image: string;
        isActive: boolean;
        description: string | null;
        title: string;
        highlight: string | null;
        subTitle: string | null;
        order: number;
    }>;
    remove(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        image: string;
        isActive: boolean;
        description: string | null;
        title: string;
        highlight: string | null;
        subTitle: string | null;
        order: number;
    }>;
}
