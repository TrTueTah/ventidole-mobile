import { useColors } from '@/hooks/useColors';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
} from 'react';
import { TouchableOpacity } from 'react-native';
import AppText from './AppText';
import Icon from './Icon';

export interface DropdownMenuItem {
  label: string;
  icon?: string;
  onPress: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

interface DropdownMenuProps {
  items: DropdownMenuItem[];
}

export interface DropdownMenuRef {
  open: () => void;
  close: () => void;
}

const DropdownMenu = forwardRef<DropdownMenuRef, DropdownMenuProps>(
  ({ items }, ref) => {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const colors = useColors();

    useImperativeHandle(ref, () => ({
      open: () => bottomSheetRef.current?.expand(),
      close: () => bottomSheetRef.current?.close(),
    }));

    const handleItemPress = (item: DropdownMenuItem) => {
      if (item.disabled) return;
      bottomSheetRef.current?.close();
      setTimeout(() => {
        item.onPress();
      }, 200);
    };

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      [],
    );

    const snapPoints = React.useMemo(() => {
      const itemHeight = 56;
      const padding = 16;
      const height = items.length * itemHeight + padding * 2;
      return [Math.min(height, 400)];
    }, [items.length]);

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: colors.background }}
        handleIndicatorStyle={{ backgroundColor: colors.neutrals600 }}
      >
        <BottomSheetView>
          {items.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleItemPress(item)}
              disabled={item.disabled}
              className={`flex-row items-center px-6 py-4 ${
                index !== items.length - 1 ? 'border-b border-neutrals900' : ''
              } ${item.disabled ? 'opacity-50' : ''}`}
            >
              {item.icon && (
                <Icon
                  name={item.icon as any}
                  className={`w-5 h-5 mr-4 ${
                    item.variant === 'danger' ? 'text-error' : 'text-foreground'
                  }`}
                />
              )}
              <AppText
                variant="body"
                className={
                  item.variant === 'danger' ? 'text-error' : 'text-foreground'
                }
              >
                {item.label}
              </AppText>
            </TouchableOpacity>
          ))}
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

DropdownMenu.displayName = 'DropdownMenu';

export default DropdownMenu;
