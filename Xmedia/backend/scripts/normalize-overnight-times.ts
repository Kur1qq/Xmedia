/**
 * Нэг удаагийн цэвэрлэгээ: booking_items дахь 24 цагаас хэтэрсэн цагийг нормчилно.
 *
 * Өмнө нь клиент талын захиалга шөнө дамнахад end_time нь "26:00:00" гэж
 * хадгалагдаж байсан. Одоо бүх цагийг 00:00:00–23:59:59 хооронд хадгалдаг
 * болсон тул хуучин мөрүүдийг ижил формат руу шилжүүлнэ ("26:00:00" → "02:00:00").
 *
 * Ажиллуулах:  npx ts-node scripts/normalize-overnight-times.ts
 * Эхлээд DB-ийн нөөц (backup) авахыг зөвлөж байна.
 */
import { PrismaClient } from '@prisma/client';
import { normalizeTime, toMinutes } from '../src/bookings/time.util';

const prisma = new PrismaClient();

async function main() {
    const items = await prisma.bookingItem.findMany({
        where: { OR: [{ startTime: { not: null } }, { endTime: { not: null } }] },
        select: { id: true, bookingId: true, bookingDate: true, startTime: true, endTime: true },
    });

    const broken = items.filter(
        (i) =>
            (i.startTime && toMinutes(i.startTime) >= 1440) ||
            (i.endTime && toMinutes(i.endTime) >= 1440),
    );

    if (broken.length === 0) {
        console.log('Нормчлох мөр алга — бүх цаг зөв форматтай байна.');
        return;
    }

    console.log(`${broken.length} мөр нормчилно:`);
    for (const i of broken) {
        const startTime = i.startTime ? normalizeTime(i.startTime) : i.startTime;
        const endTime = i.endTime ? normalizeTime(i.endTime) : i.endTime;
        console.log(
            `  #${i.bookingId} (item ${i.id}) ${i.bookingDate}: ` +
            `${i.startTime}–${i.endTime} → ${startTime}–${endTime}`,
        );
        await prisma.bookingItem.update({ where: { id: i.id }, data: { startTime, endTime } });
    }
    console.log('Дууслаа.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
