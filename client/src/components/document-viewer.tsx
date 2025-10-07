import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCw, ChevronLeft, ChevronRight } from "lucide-react";

interface DocumentViewerProps {
  fileName: string;
  fileType: string;
}

export function DocumentViewer({ fileName, fileType }: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [page, setPage] = useState(1);
  const totalPages = 3;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-base truncate">{fileName}</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomOut}
              disabled={zoom <= 50}
              data-testid="button-zoom-out"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm font-mono min-w-[4rem] text-center">{zoom}%</span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomIn}
              disabled={zoom >= 200}
              data-testid="button-zoom-in"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRotate}
              data-testid="button-rotate"
            >
              <RotateCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 bg-muted relative overflow-auto">
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="bg-background shadow-lg p-8 transition-transform"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
            }}
          >
            <div className="w-[600px] h-[800px] border-2 border-border flex items-center justify-center">
              <p className="text-muted-foreground">
                Xem trước: {fileName}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      {fileType === 'pdf' && (
        <div className="border-t p-3 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
            disabled={page === 1}
            data-testid="button-prev-page"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-mono">
            Trang {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
            data-testid="button-next-page"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </Card>
  );
}
