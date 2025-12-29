import { View, Text } from 'react-native';
import { FC } from 'react';

interface AuthTitleProps {
  title: string;
}

const AuthTitle: FC<AuthTitleProps> = ({ title }) => {
  return (
    <View className="bg-background gap-2">
      {/* Logo will be added later - placeholder for now */}
      <Text className="font-sans-bold text-foreground text-xl">{title}</Text>
    </View>
  );
};

export default AuthTitle;
