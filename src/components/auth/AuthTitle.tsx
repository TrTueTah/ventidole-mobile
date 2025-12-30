import { FC } from 'react';
import { Text, View } from 'react-native';
import Logo from '../icons/Logo';

interface AuthTitleProps {
  title: string;
}

const AuthTitle: FC<AuthTitleProps> = ({ title }) => {
  return (
    <View className="bg-background gap-2">
      {/* Logo will be added later - placeholder for now */}
      <Logo className="w-12 h-12" />
      <Text className="font-sans-bold text-foreground text-xl">{title}</Text>
    </View>
  );
};

export default AuthTitle;
