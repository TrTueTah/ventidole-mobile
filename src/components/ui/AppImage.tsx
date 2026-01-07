import { cn } from '@/utils';
import { cva } from 'class-variance-authority';
import { ClassValue } from 'clsx';
import React, { useEffect, useState } from 'react';
import { Image, ImageProps, ImageSourcePropType, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import AppText from './AppText';

interface AppImageProps extends Omit<ImageProps, 'source' | 'className'> {
  source: ImageSourcePropType;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto';
  className?: ClassValue;
  containerClassName?: ClassValue;
  placeholderClassName?: ClassValue;
  showPlaceholder?: boolean;
  placeholderText?: string;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: any) => void;
}

const imageContainerVariants = cva(
  'overflow-hidden items-center justify-center bg-neutrals800',
  {
    variants: {
      size: {
        xs: 'w-16 h-16',
        sm: 'w-24 h-24',
        md: 'w-32 h-32',
        lg: 'w-48 h-48',
        xl: 'w-64 h-64',
        full: 'w-full h-full',
      },
      aspectRatio: {
        square: 'aspect-square',
        video: 'aspect-video',
        portrait: 'aspect-[3/4]',
        auto: '',
      },
    },
    defaultVariants: {
      size: 'md',
      aspectRatio: 'auto',
    },
  },
);

const SkeletonLoader: React.FC<{ className?: ClassValue }> = ({
  className,
}) => {
  const shimmerAnimation = useSharedValue(0);

  useEffect(() => {
    shimmerAnimation.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(shimmerAnimation.value, [0, 1], [-300, 300]);

    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View
      className={cn(
        'absolute inset-0 bg-neutrals800 overflow-hidden',
        className,
      )}
    >
      <Animated.View
        style={[animatedStyle]}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-neutrals700 to-transparent opacity-50"
      />
    </View>
  );
};

const AppImage: React.FC<AppImageProps> = ({
  source,
  size = 'md',
  aspectRatio = 'auto',
  className,
  containerClassName,
  placeholderClassName,
  showPlaceholder = true,
  placeholderText,
  onLoadStart,
  onLoadEnd,
  onError,
  resizeMode = 'cover',
  ...props
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Reset state when source changes
  useEffect(() => {
    setLoading(true);
    setError(false);
  }, [source]);

  const handleLoadStart = () => {
    setLoading(true);
    setError(false);
    onLoadStart?.();
  };

  const handleLoadEnd = () => {
    setLoading(false);
    onLoadEnd?.();
  };

  const handleError = (e: any) => {
    setLoading(false);
    setError(true);
    console.warn('[AppImage] Image load error:', e.nativeEvent?.error || e);
    onError?.(e);
  };

  return (
    <View
      className={cn(
        imageContainerVariants({ size, aspectRatio }),
        containerClassName,
      )}
    >
      <Image
        source={source}
        className={cn('w-full h-full', className)}
        resizeMode={resizeMode}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        {...props}
      />

      {/* Loading Skeleton */}
      {loading && showPlaceholder && (
        <View className="absolute inset-0">
          <SkeletonLoader className={placeholderClassName} />
          {placeholderText && (
            <View className="absolute inset-0 items-center justify-center">
              <AppText className="text-neutrals400 text-xs">
                {placeholderText}
              </AppText>
            </View>
          )}
        </View>
      )}

      {/* Error Placeholder */}
      {error && showPlaceholder && (
        <View
          className={cn(
            'absolute inset-0 items-center justify-center bg-neutrals800',
            placeholderClassName,
          )}
        >
          <AppText className="text-neutrals400 text-xs">
            Failed to load image
          </AppText>
        </View>
      )}
    </View>
  );
};

export default AppImage;
