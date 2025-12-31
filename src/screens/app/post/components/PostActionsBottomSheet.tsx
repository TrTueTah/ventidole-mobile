import { Icon } from '@/components/ui';
import { useColors } from '@/hooks/useColors';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';

interface PostActionsBottomSheetProps {
  onGotoCommunity?: () => void;
  onReport?: () => void;
  onEdit?: () => void;
}

const PostActionsBottomSheet = forwardRef<
  BottomSheet,
  PostActionsBottomSheetProps
>(({ onGotoCommunity, onReport, onEdit }, ref) => {
  const colors = useColors();
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

  const MenuItem = ({
    icon,
    label,
    onPress,
    isDanger = false,
  }: {
    icon: string;
    label: string;
    onPress?: () => void;
    isDanger?: boolean;
  }) => (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 px-6 py-4 active:bg-neutrals900"
    >
      <View className="w-10 h-10 rounded-full bg-neutrals900 items-center justify-center">
        <Icon
          name={icon as any}
          className={`w-5 h-5 ${isDanger ? 'text-error' : 'text-foreground'}`}
        />
      </View>
      <Text
        className={`flex-1 text-base ${
          isDanger ? 'text-error' : 'text-foreground'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={['40%']}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.background }}
    >
      <BottomSheetView>
        <View className="py-2">
          <MenuItem
            icon="Users"
            label="Go to Community"
            onPress={onGotoCommunity}
          />
          <MenuItem icon="Pencil" label="Edit" onPress={onEdit} />
          <MenuItem icon="Flag" label="Report" onPress={onReport} isDanger />
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
});

PostActionsBottomSheet.displayName = 'PostActionsBottomSheet';

export default PostActionsBottomSheet;
