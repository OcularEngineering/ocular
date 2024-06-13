import { pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export async function getPdfPreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = function () {
      const typedarray = new Uint8Array(this.result as ArrayBuffer);
      pdfjs.getDocument(typedarray).promise.then((pdf) => {
        pdf.getPage(1).then((page) => {
          const scale = 1.5;
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          if (!context) {
            reject(new Error("Failed to get canvas context"));
            return;
          }

          canvas.height = viewport.height;
          canvas.width = viewport.width;
          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };
          page.render(renderContext).promise.then(() => {
            resolve(canvas.toDataURL());
          });
        });
      });
    };
    reader.onerror = reject;
  });
}
