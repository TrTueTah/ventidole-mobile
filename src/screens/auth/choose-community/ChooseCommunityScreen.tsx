import AuthTitle from '@/components/auth/AuthTitle';
import AppButton from '@/components/ui/AppButton';
import AppInput from '@/components/ui/AppInput';
import AppText from '@/components/ui/AppText';
import Icon from '@/components/ui/Icon';
import { useToast } from '@/components/ui/ToastProvider';
import { useColors } from '@/hooks/useColors';
import { useAuthStore } from '@/store/authStore';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  View,
} from 'react-native';
import CommunityCard, { CommunityItem } from './components/CommunityCard';
import CommunityCardSkeleton from './components/CommunityCardSkeleton';
import { useChooseCommunity } from './hooks/useChooseCommunity';

const ChooseCommunityScreen = () => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const colors = useColors();
  const { setIsChooseCommunity } = useAuthStore();

  // Use custom hook with callbacks
  const {
    communities,
    isLoading,
    isLoadingMore,
    selectedCommunities,
    toggleCommunity,
    handleBulkFollow,
    isFollowing,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    loadMore,
  } = useChooseCommunity({
    onSuccess: () => {
      showSuccess('Communities followed successfully!');
      setIsChooseCommunity(true);
    },
    onError: (error: any) => {
      showError(error?.message || 'Failed to follow communities');
    },
  });

  const handleContinue = () => {
    if (selectedCommunities.length < 3) {
      showError('Please select at least 3 communities');
      return;
    }
    handleBulkFollow();
  };

  // Show skeleton when loading and no communities are available
  const showSkeleton = isLoading && communities.length === 0;

  const renderCommunityItem = useCallback(
    ({ item }: { item: CommunityItem }) => {
      const isSelected = selectedCommunities.includes(item.id);
      return (
        <CommunityCard
          item={item}
          isSelected={isSelected}
          onPress={() => toggleCommunity(item.id)}
        />
      );
    },
    [selectedCommunities, toggleCommunity],
  );

  const renderSkeletonItem = useCallback(
    ({ index }: { index: number }) => (
      <CommunityCardSkeleton key={`skeleton-${index}`} />
    ),
    [],
  );

  const renderListHeader = useCallback(() => <View className="h-4" />, []);

  const renderListEmpty = useCallback(
    () => (
      <View className="py-8 items-center">
        <Icon name="Search" className="w-12 h-12 text-neutrals300 mb-2" />
        <AppText className="text-sm text-neutrals400">
          {t('AUTH.CHOOSE_COMMUNITY.NO_COMMUNITIES_FOUND')}
        </AppText>
      </View>
    ),
    [t],
  );

  const renderListFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color={colors.secondary} />
      </View>
    );
  }, [isLoadingMore, colors.secondary]);

  const columnWrapperStyle = useMemo(
    () => ({
      justifyContent: 'space-between' as const,
      paddingHorizontal: 16,
    }),
    [],
  );

  const contentContainerStyle = useMemo(() => ({ paddingBottom: 100 }), []);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1">
        {/* Header */}
        <View className="px-4 py-4">
          <AuthTitle title={t('AUTH.CHOOSE_COMMUNITY.TITLE')} />
        </View>

        {/* Search Section */}
        <View className="px-4 mb-4">
          <AppText className="text-sm text-neutrals400 mb-3">
            {t('AUTH.CHOOSE_COMMUNITY.SUBTITLE')}
          </AppText>

          {/* Search Input */}
          <AppInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('AUTH.CHOOSE_COMMUNITY.SEARCH_PLACEHOLDER')}
            leftIcon={
              <Icon name="Search" className="w-5 h-5 text-neutrals400" />
            }
            rightIcon={
              searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Icon name="X" className="w-5 h-5 text-neutrals400" />
                </TouchableOpacity>
              ) : undefined
            }
          />
        </View>

        {/* Filter Chips */}
        <View className="px-4 mb-4">
          <View className="flex-row gap-2">
            {(['ALL', 'GROUP', 'SOLO'] as const).map(filter => (
              <TouchableOpacity
                key={filter}
                onPress={() => setTypeFilter(filter)}
                className="px-4 py-2 rounded-full"
                style={{
                  backgroundColor:
                    typeFilter === filter ? colors.secondary : 'transparent',
                  borderWidth: 1,
                  borderColor:
                    typeFilter === filter ? colors.secondary : colors.border,
                }}
              >
                <AppText
                  className="text-sm"
                  style={{
                    color:
                      typeFilter === filter
                        ? colors.primaryForeground
                        : colors.neutrals400,
                  }}
                >
                  {t(`COMMON.${filter}`)}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Communities List */}
        <FlatList
          data={showSkeleton ? Array(10).fill(null) : communities}
          renderItem={showSkeleton ? renderSkeletonItem : renderCommunityItem}
          keyExtractor={(item, index) => item?.id || `skeleton-${index}`}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={!showSkeleton ? renderListEmpty : null}
          ListFooterComponent={renderListFooter}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          keyboardShouldPersistTaps="handled"
          columnWrapperStyle={columnWrapperStyle}
          contentContainerStyle={contentContainerStyle}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
        />

        {/* Bottom Button */}
        <View className="absolute bottom-0 left-0 right-0 bg-background border-neutrals200 px-4 py-4">
          <AppButton
            variant="primary"
            onPress={handleContinue}
            disabled={selectedCommunities.length < 3 || isFollowing}
            loading={isFollowing}
          >
            {`${t('BUTTON.CONTINUE')} (${selectedCommunities.length}/3)`}
          </AppButton>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ChooseCommunityScreen;
