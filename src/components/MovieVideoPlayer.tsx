import React from 'react';

interface MovieVideoPlayerProps {
  children: React.ReactNode;
  selectedSource: string;
  playerData: {
    isLecteur6?: boolean;
    isVIP?: boolean;
    isAdFree?: boolean;
    isSuperVideoOrDropload?: boolean;
  };
  onSelectSource: (source: string) => void;
}

const MovieVideoPlayer: React.FC<MovieVideoPlayerProps> = ({
  children,
  onSelectSource,
}) => {
  // Ad-free popup removed — all players are accessible directly
  void onSelectSource; // kept in props for compatibility

  return <>{children}</>;
};

export default MovieVideoPlayer;
