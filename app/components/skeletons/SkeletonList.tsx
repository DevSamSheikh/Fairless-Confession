import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { PostCardSkeleton } from './PostCardSkeleton';
import { SocietyCardSkeleton } from './SocietyCardSkeleton';
import { ImageSkeleton } from './ImageSkeleton';

interface SkeletonListProps {
  type: 'post' | 'society' | 'image';
  count?: number;
  style?: any;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({ 
  type, 
  count = 3,
  style 
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'post':
        return <PostCardSkeleton />;
      case 'society':
        return <SocietyCardSkeleton />;
      case 'image':
        return <ImageSkeleton width={'100%'} height={120} />;
      default:
        return <PostCardSkeleton />;
    }
  };

  const data = Array(count).fill(null);

  return (
    <View style={[styles.container, style]}>
      <FlatList
        data={data}
        renderItem={() => renderSkeleton()}
        keyExtractor={(_, index) => `skeleton-${index}`}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export const SkeletonGrid: React.FC<{ count?: number; columns?: number }> = ({ 
  count = 6,
  columns = 2
}) => {
  const data = Array(count).fill(null);

  return (
    <View style={styles.gridContainer}>
      {data.map((_, index) => (
        <View key={index} style={[styles.gridItem, { flex: 1 / columns }]}>
          <ImageSkeleton width={'100%'} height={120} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  gridItem: {
    padding: 8,
  },
});
