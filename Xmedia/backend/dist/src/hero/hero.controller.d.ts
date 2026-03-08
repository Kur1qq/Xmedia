import { HeroService } from './hero.service';
export declare class HeroController {
    private readonly heroService;
    constructor(heroService: HeroService);
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
    findOne(id: string): Promise<{
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
    create(createHeroDto: any): Promise<{
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
    update(id: string, updateHeroDto: any): Promise<{
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
    remove(id: string): Promise<{
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
