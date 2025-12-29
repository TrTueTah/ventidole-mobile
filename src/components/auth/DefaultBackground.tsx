import { ReactNode } from 'react';
import { View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface Props {
  children: ReactNode;
  withGradient?: boolean;
}

const DefaultBackground = ({ children, withGradient }: Props) => {
  if (withGradient) {
    return (
      <LinearGradient
        colors={['#000000', '#1a1a1a']}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        className="flex-1"
      >
        <View className="flex-1 bg-background">{children}</View>
      </LinearGradient>
    );
  } else {
    return <View className="flex-1 bg-background">{children}</View>;
  }
};

export default DefaultBackground;
