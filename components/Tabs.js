export default function Tabs({ tabs, tab, setTab }) {
  return (
    <div className="mb-5 flex flex-wrap gap-2">
      {Object.entries(tabs).map(([k, [l]]) => (
        <button key={k} onClick={() => setTab(k)}
          className={`rounded-full px-5 py-2 text-sm font-medium transition ${tab === k ? 'bg-hot text-white' : 'bg-matcha text-olive hover:bg-[#c3d9b5]'}`}>{l}</button>
      ))}
    </div>
  );
}
