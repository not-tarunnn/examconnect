"use client";

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface SubjectNodeData {
  subject: string;
  isSelected?: boolean;
}

const SubjectNode = memo(({ data, selected }: NodeProps<SubjectNodeData>) => {
  const { subject } = data;
  const borderStyle = selected ? '3px solid black' : 'none';

  return (
    <div className="relative">
      {/* Connection Handle */}
      <Handle
        type="target"
        position={Position.Right}
        id="subject-input"
        className="w-3 h-3 bg-gray-400 border border-gray-600"
        style={{ 
          right: -6,
          borderRadius: '50%'
        }}
      />
      
      <div 
        className="p-4 rounded-lg bg-white shadow-lg min-w-[150px]" 
        style={{ border: borderStyle }}
      >
        <div className="text-center">
          <div className="font-bold text-black text-lg">{subject}</div>
          <div className="text-xs text-gray-600 mt-1">Subject</div>
        </div>
      </div>
    </div>
  );
});

SubjectNode.displayName = 'SubjectNode';

export default SubjectNode;
