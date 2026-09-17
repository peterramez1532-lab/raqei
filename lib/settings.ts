import { prisma } from "./prisma";

export async function getSettings() {
  const settings = await prisma.siteSetting.findMany();

  const data: Record<string, string> = {};

  settings.forEach((item: { key: string; value: string }) => {
    data[item.key] = item.value;
  });

  return data;
}