import { HeroService } from './hero.service';
export declare class HeroController {
    private readonly heroService;
    constructor(heroService: HeroService);
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
    findOne(id: string): Promise<{
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
    create(createHeroDto: any): Promise<{
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
    update(id: string, updateHeroDto: any): Promise<{
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
    remove(id: string): Promise<{
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
