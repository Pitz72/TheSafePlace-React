import React from 'react';

interface SceneDescriptionProps {
  description: string;
}

const SceneDescription: React.FC<SceneDescriptionProps> = ({ description }) => {
  return (
    <div className="panel p-4">
      <p className="text-phosphor-400 italic leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default SceneDescription;
