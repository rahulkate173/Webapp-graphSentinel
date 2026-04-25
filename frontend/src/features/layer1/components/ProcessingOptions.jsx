import React from 'react';
import { ChevronRight, FileText, Code } from 'lucide-react';

const ProcessingOptions = ({ loading, isFileUploaded, ISA, GS, ST }) => {
  // Define functions or variables for the dynamic text
  console.log(ISA,GS,ST)
  const getFirstText = () => {
    if (loading) return "Detecting of ISA/GS/ST...";
    if (isFileUploaded) return `File Uploaded ${ISA?' | ISA detected':'ISA not detected'}${GS?' | GS detected':'GS not detected'}${ST?' | ST detected':'ST not detected'}`;
    return "Detection of ISA/GS/ST (Not uploaded)";
  };

  const getSecondText = () => {
    if (loading) return "Identifying...";
    if (isFileUploaded) return `File Uploaded 837P`
    return "IDENTIFY 837I/P, .. (Not uploaded)";
  };

  return (
    <div className="processing-options">
      <h3 className="processing-options__heading">PROCESSING OPTIONS</h3>
      
      <div className="processing-options__list">
        <button className="processing-options__card">
          <div className="processing-options__icon processing-options__icon--blue">
            <FileText size={16} />
          </div>
          <span className="processing-options__text">{getFirstText()}</span>
          <ChevronRight size={20} className="processing-options__chevron" />
        </button>

        <button className="processing-options__card">
          <div className="processing-options__icon processing-options__icon--purple">
            <Code size={16} />
          </div>
          <span className="processing-options__text">{getSecondText()}</span>
          <ChevronRight size={20} className="processing-options__chevron" />
        </button>
      </div>
    </div>
  );
};

export default ProcessingOptions;
