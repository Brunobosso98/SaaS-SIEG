
import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Download,
  Check,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Types for our data
type DownloadStatus = "completed" | "processing" | "failed";

interface DownloadRecord {
  id: string;
  cnpj: string;
  date: string;
  fileName: string;
  status: DownloadStatus;
  size?: string;
}

export function DownloadHistory() {
  // Sample data for the demo
  const [downloads] = useState<DownloadRecord[]>([
    {
      id: "1",
      cnpj: "12.345.678/0001-90",
      date: "2023-04-10 09:30",
      fileName: "nfe-2023-04-10.xml",
      status: "completed",
      size: "256 KB",
    },
    {
      id: "2",
      cnpj: "12.345.678/0001-90",
      date: "2023-04-09 14:45",
      fileName: "nfe-2023-04-09.xml",
      status: "completed",
      size: "128 KB",
    },
    {
      id: "3",
      cnpj: "98.765.432/0001-10",
      date: "2023-04-08 11:15",
      fileName: "nfe-2023-04-08.xml",
      status: "completed",
      size: "512 KB",
    },
    {
      id: "4",
      cnpj: "12.345.678/0001-90",
      date: "2023-04-08 09:00",
      fileName: "nfe-2023-04-08-2.xml",
      status: "processing",
    },
    {
      id: "5",
      cnpj: "98.765.432/0001-10",
      date: "2023-04-07 16:20",
      fileName: "nfe-2023-04-07.xml",
      status: "failed",
    },
  ]);

  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  // Sort downloads by date
  const sortedDownloads = [...downloads].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
  });

  const getStatusIcon = (status: DownloadStatus) => {
    switch (status) {
      case "completed":
        return <Check className="h-4 w-4 text-green-500" />;
      case "processing":
        return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />;
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: DownloadStatus) => {
    switch (status) {
      case "completed":
        return "Concluído";
      case "processing":
        return "Processando";
      case "failed":
        return "Falha";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSortDirection}
            className="flex items-center gap-1"
          >
            Data
            {sortDirection === "asc" ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      <div className="relative overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground bg-muted">
            <tr>
              <th className="px-4 py-3 text-left">CNPJ</th>
              <th className="px-4 py-3 text-left">Data</th>
              <th className="px-4 py-3 text-left">Arquivo</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sortedDownloads.map((download) => (
              <tr key={download.id} className="hover:bg-muted/50">
                <td className="px-4 py-3">{download.cnpj}</td>
                <td className="px-4 py-3">{download.date}</td>
                <td className="px-4 py-3">{download.fileName}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(download.status)}
                    <span>{getStatusText(download.status)}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  {download.status === "completed" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="inline-flex items-center gap-1"
                    >
                      <Download className="h-3 w-3" />
                      <span>Baixar</span>
                    </Button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
