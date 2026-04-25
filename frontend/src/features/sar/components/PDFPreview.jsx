import React, { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

import { generateSARPdf } from '../services/sarPdf.service';

/**
 * PDFPreview — renders the SAR.pdf template in an iframe.
 * Scales dynamically to the available container width while
 * preserving A4 aspect ratio (1 : √2 ≈ 1 : 1.414).
 */
const A4_RATIO = 1.414; // height / width

const PDFPreview = ({ formData }) => {
  const containerRef = useRef(null);
  const [iframeHeight, setIframeHeight] = useState(600);
  const [visible, setVisible] = useState(true);
  const [pdfUrl, setPdfUrl] = useState('');

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        setIframeHeight(Math.round(w * A4_RATIO));
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Live PDF generation with debounce
  useEffect(() => {
    let active = true;
    let urlToRevoke = null;

    const updatePdf = async () => {
      if (!formData) return;
      try {
        const bytes = await generateSARPdf(formData);
        if (!active) return;

        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        urlToRevoke = url;
        setPdfUrl(`${url}#toolbar=0&navpanes=0&scrollbar=0`);
      } catch (err) {
        console.error("Preview generation failed", err);
      }
    };

    // Debounce to prevent lag on rapid typing
    const timeoutId = setTimeout(updatePdf, 400);

    return () => {
      active = false;
      clearTimeout(timeoutId);
      if (urlToRevoke) {
        URL.revokeObjectURL(urlToRevoke);
      }
    };
  }, [formData]);

  return (
    <div className="sar-pdf-preview">
      {/* Panel header */}
      <div className="sar-pdf-preview__header">
        <span className="sar-pdf-preview__title">PDF Preview</span>
        <button
          className="sar-pdf-preview__toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide PDF preview' : 'Show PDF preview'}
          id="pdf-preview-toggle"
        >
          {visible ? <EyeOff size={15} /> : <Eye size={15} />}
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>

      {visible && (
        <div className="sar-pdf-preview__frame-wrap" ref={containerRef}>
          <iframe
            src={pdfUrl || null}
            title="SAR PDF Template Preview"
            className="sar-pdf-preview__iframe"
            style={{ height: `${iframeHeight}px` }}
            aria-label="SAR PDF preview"
          />
          <p className="sar-pdf-preview__caption">
            Live template — your filled values will appear in the downloaded PDF.
          </p>
        </div>
      )}
    </div>
  );
};

export default PDFPreview;
