import { FaPlayCircle } from "react-icons/fa";

const getEmbedUrl = (url) => {
  if (!url) return "";
  if (url.includes("youtube.com/embed/")) return url;
  const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
};

export default function VideoCard({ video }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="aspect-video bg-slate-950">
        {video.type === "file" ? (
          <video className="h-full w-full" src={video.url} controls />
        ) : (
          <iframe
            className="h-full w-full"
            src={getEmbedUrl(video.url)}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
      <div className="flex items-center gap-3 p-4">
        <div className="rounded-2xl bg-brand-soft p-3 text-brand-teal">
          <FaPlayCircle />
        </div>
        <div>
          <h4 className="font-semibold text-slate-900">{video.title}</h4>
          <p className="text-sm text-slate-500">Scouting-ready media</p>
        </div>
      </div>
    </div>
  );
}
