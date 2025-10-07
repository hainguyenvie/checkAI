import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  documentId?: string;
}

interface FileUploadZoneProps {
  documentSetId: string;
  onUploadComplete?: () => void;
}

export function FileUploadZone({ documentSetId, onUploadComplete }: FileUploadZoneProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const { toast } = useToast();

  const { data: templates = [] } = useQuery({
    queryKey: ["/api/templates"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentSetId", documentSetId);
      formData.append("templateId", templates[0]?.id || "");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      return response.json();
    },
    onSuccess: (data, file) => {
      toast({
        title: "File đã được tải lên",
        description: `${file.name} đã được trích xuất thành công`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi tải file",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      id: `${Date.now()}-${file.name}`,
      name: file.name,
      size: file.size,
      type: file.type,
    }));
    setFiles((prev) => [...prev, ...newFiles]);

    for (const file of acceptedFiles) {
      await uploadMutation.mutateAsync(file);
    }

    if (onUploadComplete) {
      onUploadComplete();
    }
  }, [uploadMutation, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
  });

  const removeFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
            data-testid="dropzone-upload"
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              {isDragActive ? 'Thả file vào đây...' : 'Kéo thả file hoặc nhấn để chọn'}
            </p>
            <p className="text-sm text-muted-foreground">
              Hỗ trợ: PDF, DOCX, PNG, JPG (tối đa 10MB)
            </p>
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">File đã tải lên ({files.length})</h3>
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 border rounded-md hover-elevate"
                  data-testid={`file-item-${file.id}`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <FileText className="w-5 h-5 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(file.id)}
                    data-testid={`button-remove-${file.id}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
