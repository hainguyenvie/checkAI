import { DocumentViewer } from '../document-viewer';

export default function DocumentViewerExample() {
  return (
    <div className="p-6 h-screen">
      <DocumentViewer fileName="hoa-don-gtgt.pdf" fileType="pdf" />
    </div>
  );
}
