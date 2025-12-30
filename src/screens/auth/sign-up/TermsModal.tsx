import AppText from '@/components/ui/AppText';
import { useColors } from '@/hooks/useColors';
import { useEulaData } from '@/hooks/useEulaData';
import { useInsets } from '@/hooks/useInsets';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { TouchableOpacity, View } from 'react-native';

export interface TermsModalRef {
  show: () => void;
  hide: () => void;
}

const TermsModal = forwardRef<TermsModalRef>((_, ref) => {
  const colors = useColors();
  const insets = useInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { dataEula } = useEulaData();

  useImperativeHandle(ref, () => ({
    show: () => {
      bottomSheetRef.current?.present();
    },
    hide: () => {
      bottomSheetRef.current?.dismiss();
    },
  }));

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={true}
      enableContentPanningGesture={true}
      snapPoints={[500]}
      backgroundStyle={{ backgroundColor: colors.background }}
      handleIndicatorStyle={{ backgroundColor: colors.neutrals400 }}
    >
      {/* Header with Close Button */}
      <View className="px-6 pt-4 pb-2 flex-row items-center justify-between border-b border-neutrals800">
        <AppText className="text-foreground font-sans-bold text-xl flex-1 text-center">
          End User License Agreement
        </AppText>
        <TouchableOpacity
          onPress={() => bottomSheetRef.current?.dismiss()}
          className="absolute right-6 top-4"
        >
          <AppText className="text-primary font-sans-semibold text-base">
            Cancel
          </AppText>
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <BottomSheetScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + 16,
        }}
      >
        <View className="px-6 py-4">
          {dataEula.map((item, index) => (
            <View key={item.id} className="mb-4">
              {item.title && (
                <AppText className="text-foreground font-sans-semibold text-base mb-2">
                  {item.title}
                </AppText>
              )}
              <AppText className="text-neutrals300 font-sans-regular text-sm leading-6">
                {item.description}
              </AppText>
            </View>
          ))}
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

TermsModal.displayName = 'TermsModal';

export default TermsModal;
