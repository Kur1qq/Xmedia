import { PrismaService } from '../prisma.service';
export declare class HeroService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: number;
        title: string;
        highlight: string | null;
        subTitle: string | null;
        description: string | null;
        image: string;
        order: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findActive(): Promise<{
        id: number;
        title: string;
        highlight: string | null;
        subTitle: string | null;
        description: string | null;
        image: string;
        order: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        title: string;
        highlight: string | null;
        subTitle: string | null;
        description: string | null;
        image: string;
        order: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(data: any): Promise<{
        id: number;
        title: string;
        highlight: string | null;
        subTitle: string | null;
        description: string | null;
        image: string;
        order: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: number, data: any): Promise<{
        id: number;
        title: string;
        highlight: string | null;
        subTitle: string | null;
        description: string | null;
        image: string;
        order: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: number): Promise<{
        id: number;
        title: string;
        highlight: string | null;
        subTitle: string | null;
        description: string | null;
        image: string;
        order: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
