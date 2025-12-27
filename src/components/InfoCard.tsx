import type { InfoCardProps } from "../types";

export default function InfoCard({
  label,
  value,
  highlight,
}: InfoCardProps) {
  let bgColor = "bg-gray-50";
  let borderColor = "border-gray-200";
  let textColor = "text-gray-900";

  if (highlight === "green") {
    bgColor = "bg-green-50";
    borderColor = "border-green-200";
    textColor = "text-green-900";
  } else if (highlight === "yellow") {
    bgColor = "bg-yellow-50";
    borderColor = "border-yellow-200";
    textColor = "text-yellow-900";
  } else if (highlight === "red") {
    bgColor = "bg-red-50";
    borderColor = "border-red-200";
    textColor = "text-red-900";
  }

  return (
    <div className={`border ${borderColor} rounded-lg p-4 ${bgColor}`}>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className={`text-lg font-semibold ${textColor} break-all`}>
        {value || "No disponible"}
      </p>
    </div>
  );
}
