import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ReactionBarContextType {
  activeReactionPostId: string | null;
  showReactionBar: (postId: string) => void;
  hideReactionBar: (postId?: string) => void;
  hideAllReactionBars: () => void;
}

const ReactionBarContext = createContext<ReactionBarContextType | undefined>(undefined);

interface ReactionBarProviderProps {
  children: ReactNode;
}

export const ReactionBarProvider: React.FC<ReactionBarProviderProps> = ({ children }) => {
  const [activeReactionPostId, setActiveReactionPostId] = useState<string | null>(null);

  const showReactionBar = (postId: string) => {
    setActiveReactionPostId(postId);
  };

  const hideReactionBar = (postId?: string) => {
    if (!postId || postId === activeReactionPostId) {
      setActiveReactionPostId(null);
    }
  };

  const hideAllReactionBars = () => {
    setActiveReactionPostId(null);
  };

  return (
    <ReactionBarContext.Provider
      value={{
        activeReactionPostId,
        showReactionBar,
        hideReactionBar,
        hideAllReactionBars,
      }}
    >
      {children}
    </ReactionBarContext.Provider>
  );
};

export const useReactionBar = (): ReactionBarContextType => {
  const context = useContext(ReactionBarContext);
  if (!context) {
    throw new Error('useReactionBar must be used within a ReactionBarProvider');
  }
  return context;
};
