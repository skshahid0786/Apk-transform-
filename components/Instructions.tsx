import React from 'react';
import { InfoIcon } from './icons/InfoIcon';

export const Instructions: React.FC = () => {
  return (
    <div className="text-slate-400 text-xs">
      <h3 className="flex items-center gap-2 font-semibold text-slate-300 mb-2">
        <InfoIcon />
        <span>How to Use</span>
      </h3>
      <ol className="list-decimal list-inside space-y-1.5 pl-2">
        <li>Click <strong>Select Image</strong> to upload your photo.</li>
        <li>In the <strong>Your Vision</strong> box, describe the transformation.</li>
        <li>Click <strong>Surprise Me</strong> for a random, artistic prompt.</li>
        <li>Hit <strong>Transform Image</strong> and wait for the AI to work its magic.</li>
        <li className="text-slate-500">
          <strong>Standard Mode</strong> has a 60s cooldown & content filter. Click the <strong className="text-slate-400">lock icon</strong> for <strong>Unrestricted Mode</strong>.
        </li>
      </ol>
    </div>
  );
};