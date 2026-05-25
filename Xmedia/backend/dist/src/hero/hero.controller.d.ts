import { HeroService } from './hero.service';
export declare class HeroController {
    private readonly heroService;
    constructor(heroService: HeroService);
    findAll(): Promise<{
        id: number;
        image: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        highlight: string | null;
        subTitle: string | null;
        order: number;
    }[]>;
    findActive(): Promise<{
        id: number;
        image: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        highlight: string | null;
        subTitle: string | null;
        order: number;
    }[]>;
    findOne(id: string): Promise<{
        id: number;
        image: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        highlight: string | null;
        subTitle: string | null;
        order: number;
    }>;
    create(createHeroDto: any): Promise<{
        id: number;
        image: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        highlight: string | null;
        subTitle: string | null;
        order: number;
    }>;
    update(id: string, updateHeroDto: any): Promise<{
        id: number;
        image: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        highlight: string | null;
        subTitle: string | null;
        order: number;
    }>;
    remove(id: string): Promise<{
        id: number;
        image: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        highlight: string | null;
        subTitle: string | null;
        order: number;
    }>;
}
