import React from 'react';
import { TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useColors } from '@/hooks/useColors';

interface BackButtonProps {
  onPress: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  color?: string;
}

const BackButton = ({ onPress, containerStyle, color }: BackButtonProps) => {
  const colors = useColors();
  
  return (
    <TouchableOpacity onPress={onPress} style={containerStyle} className="p-2">
      <ChevronLeft
        width={20}
        height={20}
        color={color || colors.foreground}
      />
    </TouchableOpacity>
  );
};

export default BackButton;
