"use client";

import React, { memo, useState } from 'react';
import { NodeProps } from 'reactflow';

interface TextNodeData {
  text: string;
  onTextChange?: (id: string, newText: string) => void;
}

const TextNode = memo(({ data, id }: NodeProps<TextNodeData>) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(data.text);

  const handleTextChange = (newText: string) => {
    setText(newText);
    if (data.onTextChange) {
      data.onTextChange(id, newText);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
    }
  };

  return (
    <div className="relative nodrag">
      {isEditing ? (
        <input
          type="text"
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          onBlur={() => setIsEditing(false)}
          onKeyDown={handleKeyDown}
          className="bg-transparent border border-dashed border-gray-500 outline-none text-white px-2 py-1 rounded min-w-[100px] text-center"
          autoFocus
        />
      ) : (
        <div 
          className="text-white cursor-text px-2 py-1 rounded hover:bg-white/10 border border-dashed border-transparent hover:border-gray-500 transition-all min-w-[100px] text-center"
          onClick={() => setIsEditing(true)}
        >
          {text || 'Click to edit'}
        </div>
      )}
    </div>
  );
});

TextNode.displayName = 'TextNode';

export default TextNode;
