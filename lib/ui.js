// Kumpulan class Tailwind yang dipakai berulang
const base = 'rounded-full border-[1.5px] font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hot disabled:cursor-not-allowed disabled:opacity-40';
const kinds = {
  solid: 'border-hot bg-hot text-white hover:bg-[#c93670]',
  ghost: 'border-hot bg-transparent text-hot hover:bg-blush',
  danger: 'border-[#e3b0b0] bg-transparent text-[#a33] hover:bg-red-50',
};
const sizes = { md: 'px-5 py-2 text-sm', sm: 'px-3.5 py-1 text-[13px]' };
export const btn = (kind = 'solid', size = 'md') => `${base} ${kinds[kind]} ${sizes[size]}`;
export const input = 'mt-1 w-full rounded-2xl border-[1.5px] border-pink bg-white px-3.5 py-2.5 text-ink outline-none focus:border-hot focus:ring-2 focus:ring-hot/30';
export const label = 'my-2.5 block text-[13px] text-olive';
export const card = 'overflow-x-auto rounded-3xl border-[1.5px] border-pink bg-white px-4 py-2';
